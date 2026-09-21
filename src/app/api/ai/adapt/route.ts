import { NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { toApiError } from '@/lib/errors'

const PLATFORM_RULES: Record<string, { name: string; maxChars: number; tone: string; rules: string }> = {
  facebook: {
    name: 'Facebook',
    maxChars: 63000,
    tone: 'conversational and engaging',
    rules: 'Use storytelling, ask questions to drive comments. Links work. Hashtags are optional (2-3 max). Emojis welcome but not overdone. Can be longer form.',
  },
  instagram: {
    name: 'Instagram',
    maxChars: 2200,
    tone: 'visual, aspirational, and lifestyle-focused',
    rules: 'Lead with a strong hook. Heavy emoji use is fine. Add 10-20 relevant hashtags at the end separated by spaces. No clickable links in caption. CTA like "Link in bio". Keep it punchy.',
  },
  linkedin: {
    name: 'LinkedIn',
    maxChars: 3000,
    tone: 'professional, insightful, and thought-leadership',
    rules: 'No slang or emojis (minimal if any). Start with a strong insight or hook. Use line breaks for readability. 3-5 professional hashtags at end. Focus on value, lessons, or industry insight.',
  },
  x: {
    name: 'X (Twitter)',
    maxChars: 280,
    tone: 'punchy, witty, and direct',
    rules: 'Must be under 280 characters. One clear idea. Strong hook. 1-2 hashtags max. No filler words. Conversational.',
  },
  threads: {
    name: 'Threads',
    maxChars: 500,
    tone: 'casual, authentic, and conversational',
    rules: 'Under 500 characters. Very casual tone. Like a thought or observation. Minimal hashtags. Feels like a personal update or opinion.',
  },
}

// Preferred model substrings in priority order — matched against live Groq model list
const MODEL_PRIORITY = [
  'llama-4',
  'llama-3.3',
  'llama-3.2',
  'llama-3.1',
  'llama3',
  'gemma',
  'mixtral',
]

let cachedModels: string[] | null = null
let cacheExpiry = 0

async function getGroqModels(): Promise<string[]> {
  if (cachedModels && Date.now() < cacheExpiry) return cachedModels

  try {
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    })
    if (!res.ok) return cachedModels ?? []
    const data = await res.json()
    const ids: string[] = (data.data ?? []).map((m: { id: string }) => m.id)

    // Sort by MODEL_PRIORITY
    ids.sort((a, b) => {
      const ai = MODEL_PRIORITY.findIndex(p => a.includes(p))
      const bi = MODEL_PRIORITY.findIndex(p => b.includes(p))
      const ai2 = ai === -1 ? 999 : ai
      const bi2 = bi === -1 ? 999 : bi
      return ai2 !== bi2 ? ai2 - bi2 : b.localeCompare(a) // newer names sort later alphabetically
    })

    cachedModels = ids.slice(0, 5) // keep top 5 candidates
    cacheExpiry = Date.now() + 10 * 60 * 1000 // cache 10 min
    return cachedModels
  } catch {
    return cachedModels ?? []
  }
}

function extractJson(text: string): string | null {
  // Try to find a JSON object in the response (handles markdown code fences too)
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fence) return fence[1].trim()
  const obj = text.match(/\{[\s\S]*\}/)
  return obj ? obj[0] : null
}

async function callGroq(model: string, prompt: string): Promise<{ ok: boolean; content?: string; error?: string }> {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2048,
        // No response_format — plain text is supported by all models
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      const msg = data?.error?.message ?? `Groq ${res.status}`
      console.error(`[adapt] model=${model} error:`, msg)
      return { ok: false, error: msg }
    }

    const raw = data.choices?.[0]?.message?.content
    if (!raw) return { ok: false, error: 'Empty response from AI' }

    // Extract JSON from the text response
    const json = extractJson(raw)
    if (!json) return { ok: false, error: 'No JSON found in AI response' }

    return { ok: true, content: json }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

export async function POST(req: Request) {
  try {
    let user: Awaited<ReturnType<typeof getUser>>
    try { user = await getUser() } catch { return NextResponse.json({ data: null, error: { message: 'Unauthorized' } }, { status: 401 }) }

    const { masterContent, masterPlatform, targetPlatforms } = await req.json()

    if (!masterContent?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 422 })
    }
    if (!masterPlatform || !PLATFORM_RULES[masterPlatform]) {
      return NextResponse.json({ error: 'Invalid master platform' }, { status: 422 })
    }
    if (!targetPlatforms?.length) {
      return NextResponse.json({ error: 'No target platforms specified' }, { status: 422 })
    }

    const targets = (targetPlatforms as string[]).filter(p => p !== masterPlatform && PLATFORM_RULES[p])
    if (targets.length === 0) {
      // Only one platform — return master content as-is
      return NextResponse.json({ data: { [masterPlatform]: masterContent }, error: null })
    }

    const masterRule = PLATFORM_RULES[masterPlatform]

    const platformInstructions = targets.map(p => {
      const rule = PLATFORM_RULES[p]
      return `### ${rule.name}
- Tone: ${rule.tone}
- Max characters: ${rule.maxChars}
- Rules: ${rule.rules}
- JSON key: "${p}"`
    }).join('\n\n')

    const prompt = `You are a professional social media copywriter.

Original content (written for ${masterRule.name}):
---
${masterContent}
---

Rewrite this content natively for each platform below. Keep the core message but match each platform's unique style, format, and audience.

${platformInstructions}

Return your answer as a JSON code block with platform keys and adapted content as string values. Example:
\`\`\`json
{"platform_key": "adapted content here"}
\`\`\``

    // Discover available models dynamically so hardcoded names don't break on Groq deprecations
    const MODELS = await getGroqModels()
    if (MODELS.length === 0) {
      return NextResponse.json(
        { data: null, error: { message: 'AI service unavailable — no models found', status: 502 } },
        { status: 502 },
      )
    }

    // Try models in order until one succeeds
    let rawContent: string | null = null
    let lastError = 'AI service unavailable'

    for (const model of MODELS) {
      const result = await callGroq(model, prompt)
      if (result.ok && result.content) {
        rawContent = result.content
        break
      }
      lastError = result.error ?? lastError
      // If rate limited (429), stop trying — other models will hit same limit
      if (lastError.includes('rate_limit') || lastError.includes('429')) break
    }

    if (!rawContent) {
      console.error('[adapt] All models failed. Last error:', lastError)
      return NextResponse.json(
        { data: null, error: { message: `AI error: ${lastError}`, status: 502 } },
        { status: 502 }
      )
    }

    const adapted = JSON.parse(rawContent)
    adapted[masterPlatform] = masterContent

    return NextResponse.json({ data: adapted, error: null })
  } catch (err) {
    const e = toApiError(err)
    return NextResponse.json({ data: null, error: e }, { status: e.status })
  }
}
