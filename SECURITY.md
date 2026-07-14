# Security Notes — Zyron API Keys

## Reality Check

This is a client-only app — API keys live on the device. No code obfuscation
eliminates that risk entirely. What we do instead: reduce exposure depth, and
**cap the blast radius when a key leaks**.

---

## What the Code Does

- Keys are stored in **Android Keystore-backed EncryptedSharedPreferences**
  via `expo-secure-store`. They are not plaintext in `AsyncStorage`, `.env`,
  or any JS bundle string.
- The `keyGuard.js` module is the **only** permitted read path. Keys are read
  at call-time only and never assigned to module-level variables.
- No key value is ever passed to `console.log` anywhere in the codebase.
  `sanitizeErrorMessage()` in `errors.js` redacts known key patterns from
  any error strings that surface in UI or logs.

---

## What You MUST Do on Every Provider Dashboard

This is the most important step. Obfuscation buys time. Spend caps stop damage.

Set a **hard monthly spend cap** on every key you issue:

| Provider    | Where to set it                                          |
|-------------|----------------------------------------------------------|
| OpenAI      | platform.openai.com → Settings → Limits → Set limit     |
| Anthropic   | console.anthropic.com → Settings → Usage limits          |
| Groq        | console.groq.com → Settings → Usage limits              |
| Mistral     | console.mistral.ai → Workspace → Limits                  |
| Gemini      | aistudio.google.com → API keys (quota per key via GCP)   |
| DeepSeek    | platform.deepseek.com → API keys → Billing limits        |
| OpenRouter  | openrouter.ai → Settings → Credit limits                 |
| GLM/Zhipu   | open.bigmodel.cn → Account → Spending limits             |

**Set the cap to the maximum you can afford to lose in one month if the key
is extracted and used by someone else.** For test keys, set it to $1–$5.

---

## Key Rotation

- Rotate keys every 30–90 days regardless of any suspected compromise.
- Immediately revoke and reissue a key if:
  - The device is rooted or jailbroken.
  - You share a build artifact (APK/IPA) outside a trusted distribution channel.
  - You see unexpected usage on a provider's dashboard.

---

## Stretch Goal (Not Built — Implement If Required)

A single **stateless Cloudflare Worker or Vercel Edge Function** that:
1. Receives the model request from the app (no key in transit).
2. Injects the key server-side from Workers Secrets / Vercel Env.
3. Forwards to the provider and returns the response.

This moves the key entirely off the device and is the only true fix.
It is a single ~50-line function, not "a backend" — the only infrastructure
requirement is a free Cloudflare or Vercel account.
Request this explicitly if client-side key exposure is unacceptable.
