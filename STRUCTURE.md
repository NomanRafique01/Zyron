# Zyron — Project Structure

> Production Android AI chat app with a multi-agent architecture.
> All paths are relative to the project root.

---

## Root

| Path | Purpose |
|---|---|
| `App.js` | React root — mounts `SplashScreen` + `MainApp`, hides native splash |
| `index.js` | Expo entry point — registers root component, installs global error handler |
| `app.json` | Static Expo/EAS config (used as reference; `app.config.js` takes priority at build time) |
| `app.config.js` | Active Expo config — merges `dotenv` secrets at build/start time |
| `eas.json` | EAS Build profiles (development / preview / production) |
| `metro.config.js` | Metro bundler config |
| `babel.config.js` | Babel preset config for Expo |
| `SECURITY.md` | Security policy and responsible disclosure |
| `live-data-plan.md` | Notes on live/real-time data integration plans |
| `STRUCTURE.md` | This file — folder-by-folder purpose reference |

---

## assets/

Static media assets bundled with the app.

| Path | Purpose |
|---|---|
| `assets/icons/` | App icons for web/favicon use |
| `assets/images/` | In-app image assets (logo used in Header, SplashScreen, etc.) |
| `assets/splash/` | Expo splash/launch screen assets (icon, adaptive-icon, splash-icon) |

---

## plugins/

| Path | Purpose |
|---|---|
| `plugins/withAndroidWindowBackground.js` | Expo config plugin — sets the Android window background color to prevent white flash on cold launch |

---

## src/

All application source code lives here.

### src/components/

Reusable UI components, grouped by domain. `index.js` is the barrel export.

| Folder | Purpose |
|---|---|
| `agent/` | Agent status panels: `AgentPanel`, `AgentBadge`, `AgentCoordinationTab`, `AgentIcon` |
| `chat/` | Chat UI: `ChatBubble`, `ChatBubbleUI`, `ChatMessageList`, `SyntaxCode`, `MarkdownText`, `MarkdownTable` |
| `input/` | Text input: `InputBar` with mic button, Live Talk button, and agent-strip dots |
| `layout/` | Screen structure: `Header` (glow/offline), `SidebarDrawer` (conversation history) |
| `math/` | Math rendering: `MathFormula` (KaTeX via WebView) |
| `modals/` | Overlay modals: `NeuralNetLiveTalk`, `ConfirmDialog`, `SetupGuideModal` |
| `shared/` | Cross-cutting primitives: `Icons`, `PasswordField`, `WelcomeLogo` |
| `workshop/` | Custom agent/team UI: `AgentBuilderPanel`, `TeamBuilderPanel`, `CustomAgentsLibrary` |

### src/config/

App-wide configuration constants and feature flags.

| File | Purpose |
|---|---|
| `appConfig.js` | Default agent configs, user profile, model presets, welcome greeting |
| `colors.config.js` | Design token colour palette (backgrounds, accents, agent colours) |
| `apiLock.config.js` | SecureStore key constants for the optional API Configuration Lock |
| `agentPersona.config.js` | Agent synthesis persona options and AsyncStorage key |
| `agentIconOptions.js` | Centralised 24-icon asset catalogue used by the custom agent builder |

### src/database/

SQLite persistence layer.

| File | Purpose |
|---|---|
| `db.init.js` | SQLite schema, init, and all message CRUD operations |

### src/hooks/

Custom React hooks — each owns a single domain of stateful logic.

| File | Purpose |
|---|---|
| `useAgentSockets.hook.js` | Agent API config: load/save/verify keys, team selection, engine toggle |
| `useConversations.hook.js` | Chat history: session index, message pagination, new/delete chat |
| `useSettings.hook.js` | Settings modal: panel state, password manager, API lock, user profile |
| `useAgentExecution.hook.js` | Agent pipeline: send/stop/regenerate, agent state updates |
| `useLiveTalk.hook.js` | Live Talk pipeline: STT → LLM call → sentence-by-sentence TTS + interrupt detection |
| `useToast.hook.js` | In-app toast: show/dismiss, pan-to-swipe, auto-dismiss timer |

### src/modules/

Isolated platform modules with no business-logic dependencies.

| Path | Purpose |
|---|---|
| `keyboard/useKeyboardLayout.hook.js` | Cross-platform keyboard tracking (show/hide, height, nav-bar inset) |

### src/screens/

Top-level screen components.

| Path | Purpose |
|---|---|
| `chat/MainApp.screen.jsx` | Composition root — wires all hooks and components into the chat UI |
| `splash/SplashScreen.screen.jsx` | Animated custom splash screen shown over the native launch screen |
| `settings/SettingsModal.screen.jsx` | Settings drawer modal — thin orchestrator for all sub-panels |
| `settings/panels/` | Read/edit panels: Profile, AgentLibrary, ApiConfig, Privacy, About, Reset |
| `settings/auth/` | Security overlays: ApiLockGate, PasswordManager, RemoveLockBanner, ResetAuthOverlay |
| `settings/rows/` | AgentSocketRow — individual API socket row inside the API Config panel |

### src/styles/

Flat StyleSheet definitions, merged into `app.styles.js`.

| File | Purpose |
|---|---|
| `app.styles.js` | Master stylesheet — merges all sub-stylesheets via `StyleSheet.create` |
| `layout.styles.js` | Root containers, header shell, chat shell, composer dock |
| `feedback.styles.js` | Toast card, loading indicators, error states |
| `welcome.styles.js` | Welcome/empty-chat hero layout and typography |
| `sidebar.styles.js` | Sidebar drawer, conversation list rows, search input |
| `settings.styles.js` | Settings modal, panel toggles, compliance banner |
| `profile.styles.js` | Profile panel inputs, chip selectors, avatar block |
| `socket.styles.js` | Agent socket rows, provider tabs, model preset chips |

### src/agents/

Multi-agent orchestration engine — the core intelligence layer.

| Path | Purpose |
|---|---|
| `orchestrator.js` | Pipeline runner — coordinates analysis → specialists → synthesis |
| `index.js` | Public barrel export for the entire agents module |
| `analysis/` | `queryAnalyzer.js` — classifies query type, complexity, and coordination mode |
| `api/` | `agentCaller.service.js` (call with fallback/circuit-breaker), `providers.service.js` (all provider HTTP clients), `fallbackChain.js`, `circuitBreaker.js` |
| `evals/` | Regression harness (`runEvals.js`) and golden query fixtures (`goldenQueries.json`) |
| `memory/` | On-device persistent memory: `memoryStore.js` (SQLite), `userMemory.js` (context builder) |
| `offline/` | `onDeviceFallback.js` — on-device inference fallback for offline queries |
| `progress/` | `progressTracker.js` — per-agent progress state fed to UI |
| `prompts/` | `promptBuilder.js` (specialist + writer prompts), `promptTemplates.js` (domain templates) |
| `registry/` | `agentRegistry.js` (role metadata, pipeline phases), `teamMetadata.js` (personas, COORDINATION_MODES) |
| `router/` | `teamRouter.js` (team-switch suggestions), `modelTier.js` (cheap/expensive model routing) |
| `search/` | Web search engine: `webSearch.js` (public entry + session cache), `searchProviders.js` (Tavily + Serper HTTP clients), `searchResultFormatter.js` (normalises provider responses) |
| `security/` | `keyGuard.js` — single gateway for reading API keys from encrypted storage |
| `streaming/` | `streamManager.js` — real SSE streaming for all supporting providers |
| `synthesis/` | `synthesizer.js` (writer phase), `qualityJudge.js` (LLM + heuristic scoring), `semanticDedup.js` |
| `teams/` | Team definitions (`teamDevCore`, `teamCoders`, etc.), `index.js` registry, `teamRuntime.js`, `teamBlend.js` |
| `telemetry/` | `metrics.js` — session-local latency/token/error telemetry |
| `tools/` | `toolRegistry.js` (per-role tool permissions), `codeExecutor.js` (sandboxed JS eval) |
| `utils/` | `agentErrors.utils.js` (typed API errors), `outputFormatter.utils.js` (quality scoring, dedup helpers) |
| `workshop/` | Custom agent/team storage + registry + metadata generator: `customAgentsStorage.js`, `customTeamsStorage.js`, `customTeamRegistry.js`, `metadataGenerator.js` |

### src/utils/

General-purpose utilities used across multiple layers.

| File | Purpose |
|---|---|
| `mathParser.utils.js` | LaTeX / chemical formula detection and inline-math splitting helpers |
| `responseGenerator.utils.js` | Legacy direct API caller (used outside agents pipeline) |
| `responsive.utils.js` | Dimension-based scaling helpers (`scale`, `spacing`, `fontScale`, etc.) |
| `agentLogic.utils.js` | Backward-compatible facade — re-exports the full agents public API |

---

## backend/

Python FastAPI backend deployed on Railway. Provides the primary multi-agent orchestration path; the frontend falls back to its local JS engine when this is unavailable.

| Path | Purpose |
|---|---|
| `main.py` | FastAPI app entry point — `/health`, `/orchestrate`, `/extract-document` endpoints |
| `models.py` | Pydantic v2 request/response models (`OrchestrateRequest`, `OrchestrateResponse`, `DocumentExtractRequest/Response`, etc.) |
| `orchestrator.py` | Backwards-compat shim — re-exports `run_pipeline` and `ZyronState` from the `orchestrator/` package |
| `orchestrator/` | LangGraph pipeline package: `_state.py` (ZyronState TypedDict), `_nodes.py` (reasoner/coder/vision/writer nodes), `_graph.py` (StateGraph), `_pipeline.py` (public `run_pipeline()`), `_utils.py` (helpers) |
| `web_search.py` | Web search with Tavily → Serper fallback (3 s hard timeout per provider); injects up to 5 `key_facts` into agent prompts; returns `None` silently when both providers fail |
| `document_extractor.py` | Base64 file → plain text: PDF via `pdfminer.six`, DOCX via `python-docx`, TXT read-through |
| `query_analyzer.py` | Query classification — intent, verbosity, complexity |
| `prompt_builder.py` | Backwards-compat shim — re-exports from the `prompt_builder/` package |
| `prompt_builder/` | Prompt construction package: `_specialist.py`, `_writer.py`, `_templates.py`, `_style.py`, `_user_profile.py` |
| `providers.py` | Provider HTTP clients for all supported AI providers |
| `requirements.txt` | Python dependency manifest |
| `Dockerfile` | Container definition for Railway / other container platforms |
| `render.yaml` | Render deployment config |

---

## android/

Native Android project (Gradle). Not edited directly — managed by Expo prebuild.
