# Changelog

## [1.0.0] — 2026-07-21

> **First official stable release.** Zyron exits beta and ships as a fully-featured multi-agent AI Android assistant with a Railway-hosted Python backend, real-time voice, web search, document analysis, and a custom Agents Workshop.

### Added

- **Python/FastAPI backend on Railway** — `backend/` package with `main.py` FastAPI entry point, Dockerised deployment, and `render.yaml` config; orchestration routes through the Railway service with silent local JS fallback (`backendBridge`) (`53bca5f`, `7b99f29`, `7c0b57e`, `4f5112e`)
- **LangGraph orchestration pipeline** — `backend/orchestrator/` package (`_state`, `_nodes`, `_graph`, `_pipeline`, `_utils`) replacing the single-file shim; `backend/prompt_builder/` split into a proper package (`42221c5`, `5dbb2a3`, `1916910`)
- **Automatic web search — Tavily then Serper fallback chain** — `backend/web_search.py` + frontend `src/agents/search/` (`webSearch.js`, `searchProviders.js`, `searchResultFormatter.js`); session-level caching, 3-second hard timeout, `key_facts` injection, source attribution, and `needsWebSearch` query detection (`26e4388`, `0f90f37`)
- **Animated web search ticker bar** — premium UI bar synced to actual search execution in both backend and local paths (`20d0426`)
- **Document and image analysis** — `POST /extract-document` backend endpoint backed by `backend/document_extractor.py`; PDF first-page thumbnail in chat bubble, persistent file chip, loading spinner, and PDF/DOCX-to-backend with TXT frontend fallback (`ce3b1bc`, `ed70909`, `e3589c2`, `f7c8768`)
- **Live Talk Mode** — hands-free voice conversation via `useLiveTalk.hook.js`; STT to streaming LLM to sentence-by-sentence TTS pipeline with 1.5 s silence timer, continuous mic, interrupt detection, and 20 s auto-close (`969f439`, `95f1fd8`, `1142c3b`)
- **Text-to-speech playback in chat bubbles** — `expo-speech` TTS with paragraph-window scroll-follow, symbol filter, and restart scroll offset (`cd7b1be`, `329e031`, `7454ed4`)
- **Voice / mic input** — `expo-speech-recognition` with lazy-load guard, live partials, and stop behaviour (`fa93890`)
- **Custom Agents Workshop** — create and edit custom agents and teams with `customAgentsStorage.js`, `customTeamsStorage.js`, `customTeamRegistry.js`, `metadataGenerator.js`; auto-scroll to form on open, smooth scroll, tab sync, and SVG team icon picker with 12 icons (`9903f3a`, `159693a`, `82b0cbf`, `b2c025b`, `a3de1e2`, `fd62c22`)
- **AI-generated follow-up suggestion chips** — surfaces relevant next questions after every swarm response (`bbe2e47`)
- **Token-efficient conversation memory** — SQLite-backed summarisation to keep prompt context lean across long sessions (`a8847c6`)
- **Dynamic response length calibration** — prompt builder adjusts target length based on query complexity (`88d7c7a`)
- **Real-time SSE streaming** — writer-agent tokens streamed from backend to eliminate perceived latency (`d7a4e91`)
- **Unified coordination panel for backend and local paths** — progress animation, done state, icon-pop spring, token usage row, and provider label under each agent (`8dc4301`, `1116c55`, `9f64d8b`)
- **SVG/PNG agent and team icons throughout** — `AgentIcon` helper, `AgentsWorkshopIcon`, `AgentBuilderIcon`; all emoji icons replaced across Agent Library, Workshop, teams, and Settings (`739a9fa`, `6291b6f`, `3b8535f`, `ae32e16`)
- **Financers team** — replaces Dev Core as the default selected team (`0ff6fdd`)
- **Plus button with document/image upload** — floating popup replacing the bottom sheet in the input bar (`5e203d3`, `2f7214c`)
- **MIT licence** — replaces previous licence file (`38c13c1`)

### Changed

- **Firebase / auth removed entirely** — app boots directly to `MainApp`; no sign-in screen (`fd9ec1d`)
- **`backend/orchestrator.py` demoted to backwards-compat shim** — real logic lives in `backend/orchestrator/` package
- **`ChatBubble` refactored** — 1 910-line monolith split into 10 focused modules (`2603fe8`)
- **Input bar redesign** — plus button moved inside bar, mic colour matched, emoji icons replaced with SVG (`9b05e01`)
- **Header and settings icons** — colour aligned to mic purple `#7B2FFF` (`fe6f1e9`)
- **Agent 1 Live Talk hint text** — colour changed from blue to `purpleSoft` (`#A78BFA`) (`b48e9ef`)
- **Welcome logo panel** — vertical position adjusted on new chat screen (`4e0540a`)
- **Orchestration console logs** — replaced with professional `[Zyron Backend/Local]` format; all retry/warn noise removed (`01df344`)
- **Backend request timeout** — hard cap removed; waits indefinitely for long-running orchestration (`343f391`)

### Fixed

- **RN 0.81 + release-build crash vectors** — all known crash paths resolved for production Android build (`305bf01`)
- **Custom team library refresh** — stale list after save now updates correctly (`5868c35`)
- **Agent Library and Workshop scroll lag** — render overhead and animation jank eliminated (`71dffae`, `38f7636`)
- **`AgentIcon` `typeof number` guard** — fixes `require()` resolution for PNG sources (`9110237`)
- **`needsWebSearch` detection** — expanded to cover current-events and job/position queries (`8b698e6`)
- **Search result caching** — null/failed responses no longer cached; `keyFacts` field used instead of the missing `summary` field (`554ef19`, `5b12aec`)
- **Duplicate backend search** — frontend results forwarded to backend to eliminate redundant re-search (`087621b`)
- **`web_search.py` missing from Docker image** — added to Dockerfile COPY list (`6f592cb`)
- **`document_extractor` import path** — corrected to match Railway working directory (`cd98858`)
- **Document context in request body** — `documentContext` now included; input chip clears after send; context scoped to current turn only (`eb4d019`, `41e0e69`)
- **`.npmrc`** — added to resolve Railway peer-dependency conflict on build (`b02d6f9`)
- **`db/` and `memory/` directories** — copied into Docker image to prevent missing-path errors at runtime (`5d95e27`)
- **`_progressTimer` / `_timeoutId` scope** — hoisted outside try block to fix catch-scope `ReferenceError` in `backendBridge` (`385bb8d`)
- **Live Talk mic click sounds** — removed between turns (`631e248`)
- **Live Talk infinite loop** — stopped; 10 s auto-close added after speaking (`1142c3b`)
- **`BackgroundTasks` pattern** — suggestion generation moved off critical path (`76f29cc`)

### Removed

- **Firebase / Google auth** — `google-services.json` deleted; all Firebase dependencies removed (`7b41815`, `fd9ec1d`)
- **BE/LC dev toggle** — force-local debug switch removed from header before public release (`fcd0749`, `5868c35`)
- **Key Takeaways section** — removed from synthesizer output to reduce response verbosity (`2c6bf8c`)
- **Decoy placeholder folders** — `src/agents`, `src/hooks`, `src/components/modals` removed and replaced with real implementations (`0d6be3f`, `38c13c1`)

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
