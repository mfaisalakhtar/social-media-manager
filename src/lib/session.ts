import { SignJWT, jwtVerify } from 'jose'

export type SessionPayload = {
  sub: string   // smm_users.id
  email: string
}

const COOKIE_NAME = 'smm_session'
const EXPIRES_IN  = 60 * 60 * 24 * 30 // 30 days in seconds

function getSecret() {
  const secret = process.env.SMM_JWT_SECRET
  if (!secret) throw new Error('SMM_JWT_SECRET env var is not set')
  return new TextEncoder().encode(secret)
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${EXPIRES_IN}s`)
    .sign(getSecret())
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return { sub: payload.sub as string, email: payload.email as string }
  } catch {
    return null
  }
}

export function sessionCookieOptions(maxAge = EXPIRES_IN) {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  }
}

export { COOKIE_NAME }
