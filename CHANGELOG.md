# Changelog

## [Unreleased] — Documentation update

### Added

- **README.md — Feature Overview: Web Search *(New)***
  - Added a full Feature Overview entry (inline SVG search icon, heading, pipeline diagram, seven bullet points) documenting the Tavily → Serper fallback web search capability that was implemented in `backend/web_search.py` and `src/agents/search/` but absent from all documentation.
  - Entry covers: dual-provider fallback, silent degradation, grounded `key_facts` injection, source attribution, session-level caching, 3-second hard timeout, and both-engine support (Railway backend + local JS fallback).

- **README.md — Backend section: new endpoints and files**
  - `POST /extract-document` endpoint now listed under "What the backend does".
  - Web search backend bullet added with description of `web_search.py` and its pipeline position.
  - `/orchestrate` request/response shape corrected: `searchResults` and `documentContext` added to the request field list; response corrected from `{ finalAnswer, agents[], coordinationMode }` to `{ text, agents[], tokenUsage, meta }`.

- **README.md — Project Structure tree: backend corrections**
  - `backend/orchestrator.py` entry updated to reflect its role as a backwards-compat shim.
  - `backend/orchestrator/` package added with sub-file list (`_state`, `_nodes`, `_graph`, `_pipeline`, `_utils`).
  - `backend/web_search.py` and `backend/document_extractor.py` added.
  - `backend/prompt_builder.py` corrected to shim + `backend/prompt_builder/` package added.
  - `backend/main.py` description updated to include `/extract-document`.

- **README.md — Project Structure tree: frontend search module**
  - `src/agents/search/` directory added (`webSearch.js`, `searchProviders.js`, `searchResultFormatter.js`).

- **STRUCTURE.md — New `backend/` section**
  - Full table added for all backend files: `main.py`, `models.py`, `orchestrator.py` (shim), `orchestrator/` package, `web_search.py`, `document_extractor.py`, `query_analyzer.py`, `prompt_builder.py` (shim), `prompt_builder/` package, `providers.py`, `requirements.txt`, `Dockerfile`, `render.yaml`.

- **STRUCTURE.md — `src/agents/` table: missing entries**
  - `search/` row added: `webSearch.js` (public entry + session cache), `searchProviders.js` (Tavily + Serper HTTP clients), `searchResultFormatter.js` (normalises provider responses).
  - `workshop/` row added: `customAgentsStorage.js`, `customTeamsStorage.js`, `customTeamRegistry.js`, `metadataGenerator.js`.

- **STRUCTURE.md — `src/components/` table: missing components**
  - `agent/` row updated to include `AgentIcon`.
  - `chat/` row updated to include `ChatBubbleUI`, `MarkdownText`, `MarkdownTable`.
  - `input/` row updated to mention mic button and Live Talk button.
  - `modals/` row updated to include `NeuralNetLiveTalk`.
  - `workshop/` row added: `AgentBuilderPanel`, `TeamBuilderPanel`, `CustomAgentsLibrary`.

- **STRUCTURE.md — `src/config/` table: missing file**
  - `agentIconOptions.js` row added.

- **STRUCTURE.md — `src/hooks/` table: missing hook**
  - `useLiveTalk.hook.js` row added with description of the STT → LLM → TTS + interrupt pipeline.

### Verified (no changes required)

- **Live Talk Mode** (README Feature Overview §"Live Talk Mode") — confirmed accurate against `src/hooks/useLiveTalk.hook.js` and `src/components/modals/NeuralNetLiveTalk.component.jsx`. All described behaviors (1.5 s silence timer, continuous mic, sentence-by-sentence TTS, interrupt detection, 20 s auto-close, phase labels) are present in code.
- **Mic / Voice Input** (README Feature Overview §"Mic / Voice Input") — confirmed accurate against `src/components/input/InputBar.component.jsx`. Lazy-load guard, permission request, live partials, and stop behavior all match the description.
- **`useAgentSockets.hook.js` naming** — the "socket" → "channel" terminology sweep has *not* been applied to this file; the hook filename and its JSDoc still use "socket" terminology consistently with `socket.styles.js` and the AgentSocketRow screen. No rename is needed.

### Banner redesign copy (for image-generation handoff)

The accurate feature list for the banner redesign is:

> **Zyron** — Multi-Agent AI Android Assistant
>
> ✦ 6 Specialist Teams · 24 Agents  
> ✦ Live Web Search (Tavily + Serper)  
> ✦ Live Talk Mode — hands-free voice conversation  
> ✦ Document & Image Analysis  
> ✦ Real-Time SSE Streaming  
> ✦ On-Device SQLite Memory  
> ✦ Custom Agents Workshop
> ✦ Android Keystore Security  
> ✦ 8 AI Providers (OpenAI · Anthropic · Gemini · Groq · Mistral · DeepSeek · GLM · OpenRouter)
