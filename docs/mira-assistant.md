# MIRA inside the store

MIRA uses the original male and female artwork as separate body parts. Source-coordinate metadata is in `lib/mira-rig.json`, with the PNGs under `public/mascot/rig`. CSS animates joints, breathing, blinking, and expression changes without restarting the avatar on each pose change. Reduced-motion preferences disable loops; hidden tabs pause the rig. Speech mouth motion is illustrative, timed to the browser speech lifecycle rather than phoneme-level lip sync.

The conversation calls `/api/mira` for every question, including Italian questions previously intercepted by keyword matching. Responses stream through SSE, and the last six exchanges are sent as context. Conversation data stays in component memory for the current page session; it is not saved in local storage. The provider request sets `store: false`.

## Enable the AI

In the existing Vercel project, configure `OPENAI_API_KEY` as a server-only environment variable for Production and, if wanted, Preview/Development. The API account must have usable billing/quota. Redeploy after changing environment variables. Never use a `NEXT_PUBLIC_` prefix for the key.

`OPENAI_MIRA_MODEL` optionally overrides the existing `gpt-5-mini` default. The endpoint uses the Responses API; GPT-5 models receive low reasoning effort. No realtime web search or personal order access is enabled. Shop facts are grounded in the server-provided catalog and store rules; general conversation is allowed.

Without a key, or if the provider is unavailable, the widget labels its response as basic assistance. Italian store questions can use the existing local knowledge fallback; unsupported general questions receive an explicit availability message. It never pretends to have generated an AI answer.

Voice input and speech synthesis depend on browser support and microphone permission. Starting another voice turn, closing, minimizing, switching avatars, or clearing the conversation stops the active request and speech. A late response cannot reopen or overwrite the closed conversation.

## Validation

Run the focused protocol and server-contract tests with:

```sh
node --test tests/mira-stream.test.mjs tests/mira-api.test.mjs
```

These tests mock the provider and database boundaries. They cover streamed text, conversation context, incomplete streams, missing configuration, invalid JSON, UTF-8 fragmentation, and cancellation. They do not establish live model quality or account access. Also run TypeScript, the production build, and desktop/mobile browser checks after changes.

Browser fixture checks in the implementation session verified incremental rendering, follow-up history and cancellation separately from a real request returning `503 configured:false` before API setup.

References: [OpenAI streaming responses](https://developers.openai.com/api/docs/guides/streaming-responses), [GPT-5 mini](https://developers.openai.com/api/docs/models/gpt-5-mini).
