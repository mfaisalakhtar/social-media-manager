import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";
import { encryptToken } from "@/lib/crypto";
import { getUser } from "@/lib/auth";

const BASE_URL = process.env.APP_BASE_URL!;

function errorRedirect(_workspaceId: string | null, code = "connection_failed") {
  return NextResponse.redirect(`${BASE_URL}/oauth/done?error=${code}`);
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");

  const cookieStore = await cookies();
  const storedState = cookieStore.get("smm_oauth_state")?.value ?? null;

  // Extract workspaceId early so we can redirect properly on error
  const workspaceId = storedState ? storedState.split(":")[0] : null;

  if (oauthError) {
    return errorRedirect(workspaceId, "oauth_denied");
  }

  if (!code || !state) {
    return errorRedirect(workspaceId, "oauth_invalid");
  }

  if (!storedState || state !== storedState) {
    return errorRedirect(workspaceId, "state_mismatch");
  }

  // workspaceId is guaranteed valid here
  const wid = workspaceId!;

  // Clear CSRF cookie
  cookieStore.set("smm_oauth_state", "", { maxAge: 0, path: "/" });

  try {
    // Get authenticated user from JWT cookie
    let user: Awaited<ReturnType<typeof getUser>>
    try { user = await getUser() } catch { return errorRedirect(wid, "unauthenticated") }

    // Exchange code for short-lived token
    const tokenRes = await fetch("https://graph.facebook.com/v19.0/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        redirect_uri: process.env.META_REDIRECT_URI,
        code,
      }),
    });

    if (!tokenRes.ok) {
      console.error("Facebook token exchange failed:", await tokenRes.text());
      return errorRedirect(wid, "connection_failed");
    }

    const tokenData = await tokenRes.json();
    const shortLivedToken: string = tokenData.access_token;

    // Exchange for long-lived token
    const longTokenParams = new URLSearchParams({
      grant_type: "fb_exchange_token",
      client_id: process.env.META_APP_ID!,
      client_secret: process.env.META_APP_SECRET!,
      fb_exchange_token: shortLivedToken,
    });

    const longTokenRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?${longTokenParams.toString()}`,
    );

    if (!longTokenRes.ok) {
      console.error("Facebook long-lived token exchange failed:", await longTokenRes.text());
      return errorRedirect(wid, "connection_failed");
    }

    const longTokenData = await longTokenRes.json();
    const userAccessToken: string = longTokenData.access_token;
    const expiresIn: number = longTokenData.expires_in ?? 5183944; // ~60 days default
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    // Get Facebook user info
    const meRes = await fetch(
      `https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${userAccessToken}`,
    );

    if (!meRes.ok) {
      console.error("Facebook /me failed:", await meRes.text());
      return errorRedirect(wid, "connection_failed");
    }

    const meData = await meRes.json();
    const externalUserId: string = meData.id;

    // Get ALL managed pages — follow pagination cursors until no more results
    type FacebookPage = {
      id: string;
      name: string;
      username?: string;
      access_token: string;
      picture?: { data?: { url?: string } };
    };

    const pages: FacebookPage[] = [];
    let nextUrl: string | null =
      `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,username,access_token,picture&limit=100&access_token=${userAccessToken}`;

    while (nextUrl) {
      const url: string = nextUrl;
      const pagesRes = await fetch(url);

      if (!pagesRes.ok) {
        console.error("Facebook /me/accounts failed:", await pagesRes.text());
        return errorRedirect(wid, "connection_failed");
      }

      const pagesData = await pagesRes.json();
      const batch: FacebookPage[] = pagesData.data ?? [];
      pages.push(...batch);

      // Follow the next cursor if present
      nextUrl = pagesData.paging?.next ?? null;
    }

    // Also fetch pages owned by Business Portfolios (Business Manager)
    // These don't appear in /me/accounts but are accessible via /me/businesses
    try {
      const bizRes = await fetch(
        `https://graph.facebook.com/v19.0/me/businesses?fields=id,name&limit=100&access_token=${userAccessToken}`,
      )
      if (bizRes.ok) {
        const bizData = await bizRes.json()
        const businesses: { id: string; name: string }[] = bizData.data ?? []

        for (const biz of businesses) {
          // Fetch pages owned by this business
          const ownedRes = await fetch(
            `https://graph.facebook.com/v19.0/${biz.id}/owned_pages?fields=id,name,username,access_token,picture&limit=100&access_token=${userAccessToken}`,
          )
          if (ownedRes.ok) {
            const ownedData = await ownedRes.json()
            const ownedPages: FacebookPage[] = ownedData.data ?? []
            for (const p of ownedPages) {
              if (!pages.find((existing) => existing.id === p.id)) {
                pages.push(p)
              }
            }
          }

          // Also fetch client pages (pages the business manages on behalf of clients)
          const clientRes = await fetch(
            `https://graph.facebook.com/v19.0/${biz.id}/client_pages?fields=id,name,username,access_token,picture&limit=100&access_token=${userAccessToken}`,
          )
          if (clientRes.ok) {
            const clientData = await clientRes.json()
            const clientPages: FacebookPage[] = clientData.data ?? []
            for (const p of clientPages) {
              if (!pages.find((existing) => existing.id === p.id)) {
                pages.push(p)
              }
            }
          }
        }
      }
    } catch (bizErr) {
      // Business Manager API is optional — log and continue
      console.warn('Business Manager page fetch skipped:', bizErr)
    }

    // If no pages were returned, the user likely didn't grant page access in the dialog
    if (pages.length === 0) {
      console.warn("Facebook OAuth: no pages returned for user", externalUserId)
      return errorRedirect(wid, "no_pages_granted")
    }

    const admin = createAdminClient();

    for (const page of pages) {
      const encryptedPageToken = encryptToken(page.access_token);

      // Upsert OAuth connection for this page.
      // Use page.id (not the personal FB user ID) as external_user_id so each
      // page gets its own row — the unique constraint is on (workspace_id, platform, external_user_id).
      const { data: connection, error: connErr } = await admin
        .from("smm_oauth_connections")
        .upsert(
          {
            workspace_id: wid,
            platform: "facebook",
            authorized_by_user_id: user.id,
            external_user_id: page.id,
            encrypted_access_token: encryptedPageToken,
            encrypted_refresh_token: null,
            token_expires_at: tokenExpiresAt,
            granted_scopes: [
              "public_profile",
              "pages_show_list",
              "pages_read_engagement",
              "pages_manage_posts",
            ],
            status: "active",
            last_verified_at: new Date().toISOString(),
          },
          {
            onConflict: "workspace_id,platform,external_user_id",
            ignoreDuplicates: false,
          },
        )
        .select("id")
        .single();

      if (connErr || !connection) {
        console.error("Failed to upsert Facebook oauth connection for page", page.id, connErr);
        continue;
      }

      const connectionId = connection.id;

      // Upsert Facebook page destination — always active so it shows immediately.
      const { error: destErr } = await admin.from("smm_social_destinations").upsert(
        {
          workspace_id: wid,
          oauth_connection_id: connectionId,
          platform: "facebook",
          external_destination_id: page.id,
          destination_type: "page",
          display_name: page.name,
          username: page.username ?? null,
          profile_image_url: page.picture?.data?.url ?? null,
          status: "active",
        },
        { onConflict: "workspace_id,platform,external_destination_id", ignoreDuplicates: false },
      );

      if (destErr) {
        console.error("Failed to upsert Facebook destination:", destErr);
      }

      // Check for linked Instagram business account
      const igRes = await fetch(
        `https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account{id,name,username,profile_picture_url}&access_token=${page.access_token}`,
      );

      if (igRes.ok) {
        const igData = await igRes.json();
        const igAccount = igData.instagram_business_account;

        if (igAccount?.id) {
          // Create a separate OAuth connection for the Instagram account using the page token
          const { data: igConnection, error: igConnErr } = await admin
            .from("smm_oauth_connections")
            .upsert(
              {
                workspace_id: wid,
                platform: "instagram",
                authorized_by_user_id: user.id,
                external_user_id: igAccount.id,
                encrypted_access_token: encryptedPageToken,
                encrypted_refresh_token: null,
                token_expires_at: tokenExpiresAt,
                granted_scopes: ["instagram_basic", "instagram_content_publish"],
                status: "active",
                last_verified_at: new Date().toISOString(),
              },
              {
                onConflict: "workspace_id,platform,external_user_id",
                ignoreDuplicates: false,
              },
            )
            .select("id")
            .single();

          if (igConnErr || !igConnection) {
            console.error("Failed to upsert Instagram oauth connection:", igConnErr);
          } else {
            const { error: igDestErr } = await admin.from("smm_social_destinations").upsert(
              {
                workspace_id: wid,
                oauth_connection_id: igConnection.id,
                platform: "instagram",
                external_destination_id: igAccount.id,
                destination_type: "profile",
                display_name: igAccount.name ?? page.name,
                username: igAccount.username ?? null,
                profile_image_url: igAccount.profile_picture_url ?? null,
                status: "active",
              },
              {
                onConflict: "workspace_id,platform,external_destination_id",
                ignoreDuplicates: false,
              },
            );

            if (igDestErr) {
              console.error("Failed to upsert Instagram destination:", igDestErr);
            }
          }
        }
      }
    }

    // Also check for an Instagram account directly linked to the Facebook user
    // (catches accounts created with Facebook Login that aren't tied to a specific Page)
    const igUserRes = await fetch(
      `https://graph.facebook.com/v19.0/me?fields=instagram_business_account{id,name,username,profile_picture_url}&access_token=${userAccessToken}`,
    );

    if (igUserRes.ok) {
      const igUserData = await igUserRes.json();
      const igAccount = igUserData.instagram_business_account;

      if (igAccount?.id) {
        const encryptedUserToken = encryptToken(userAccessToken);

        const { data: igConnection, error: igConnErr } = await admin
          .from("smm_oauth_connections")
          .upsert(
            {
              workspace_id: wid,
              platform: "instagram",
              authorized_by_user_id: user.id,
              external_user_id: igAccount.id,
              encrypted_access_token: encryptedUserToken,
              encrypted_refresh_token: null,
              token_expires_at: tokenExpiresAt,
              granted_scopes: ["instagram_basic", "instagram_content_publish"],
              status: "active",
              last_verified_at: new Date().toISOString(),
            },
            { onConflict: "workspace_id,platform,external_user_id", ignoreDuplicates: false },
          )
          .select("id")
          .single();

        if (!igConnErr && igConnection) {
          await admin.from("smm_social_destinations").upsert(
            {
              workspace_id: wid,
              oauth_connection_id: igConnection.id,
              platform: "instagram",
              external_destination_id: igAccount.id,
              destination_type: "profile",
              display_name: igAccount.name ?? "Instagram Profile",
              username: igAccount.username ?? null,
              profile_image_url: igAccount.profile_picture_url ?? null,
              status: "active",
            },
            { onConflict: "workspace_id,platform,external_destination_id", ignoreDuplicates: false },
          );
        }
      }
    }

    // Audit log
    await admin.from("smm_audit_logs").insert({
      workspace_id: wid,
      actor_user_id: user.id,
      action: "connection:connected",
      entity_type: "oauth_connection",
      entity_id: null,
      safe_metadata_json: {
        platform: "facebook",
        pages_connected: pages.length,
        external_user_id: externalUserId,
      },
    });

    return NextResponse.redirect(`${BASE_URL}/oauth/done?platform=facebook`);
  } catch (err) {
    console.error("Facebook OAuth callback error:", err);
    return errorRedirect(workspaceId, "connection_failed");
  }
}
