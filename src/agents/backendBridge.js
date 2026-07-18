/**
 * backendBridge.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Single entry point for all orchestration calls.
 *
 * Strategy:
 *   1. POST to the Railway backend /orchestrate endpoint (8-second timeout).
 *   2. On any failure — timeout, non-200, network error — fall back silently
 *      to the local runAgentsOrchestrator() without surfacing anything to the UI.
 *
 * Usage:
 *   Replace runAgentsOrchestrator() / runAgentsPipeline() call-sites with:
 *     import { runOrchestration } from './backendBridge';
 *
 * Swap BACKEND_URL below when the Railway service URL is available.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { runAgentsOrchestrator } from './orchestrator';
import { getActiveTeam } from './teams/teamRuntime';
import { getTeamRoleInfo } from './teams';

// ── Backend endpoint ──────────────────────────────────────────────────────────
// Set to the Railway deployment URL once available. Leave as an empty string
// or null to skip the backend attempt entirely and always use local fallback.
const BACKEND_URL = 'https://zyron-production-7af1.up.railway.app';

// Milliseconds to wait for the backend before giving up and falling back.
const BACKEND_TIMEOUT_MS = 30000;

// ─────────────────────────────────────────────────────────────────────────────

/**
 * runOrchestration
 *
 * Drop-in replacement for runAgentsOrchestrator(). Accepts identical arguments,
 * tries the backend first, and falls back to the local orchestrator silently.
 *
 * @param {string}      userText
 * @param {object}      agentConfigs
 * @param {function}    onStateChange        — (agents[], meta) => void
 * @param {AbortSignal} signal
 * @param {string}      persona
 * @param {object}      userProfile
 * @param {function}    onSocketStatusChange — (role, status, msg) => void
 * @param {function}    [onStreamDelta]      — (role, chunk) => void
 * @returns {Promise<object>}  Same shape as runAgentsOrchestrator result
 */

/**
 * Remaps the `agents` array returned by the backend so every entry carries
 * the display metadata (name, icon, accent colours) of the *active* team
 * rather than whatever team the backend resolved internally.
 *
 * The backend drives the prompt/logic side; the frontend owns the visual identity.
 *
 * @param {object[]} backendAgents  — agents[] from the backend response
 * @param {object}   team           — result of getActiveTeam()
 * @returns {object[]}
 */
function remapAgentsToActiveTeam(backendAgents, team) {
  if (!backendAgents?.length || !team?.agents) return backendAgents ?? [];
  const roleInfo = getTeamRoleInfo(team);
  return backendAgents.map((agent) => {
    const meta = roleInfo[agent.role];
    if (!meta) return agent;
    const teamAgent = team.agents[agent.role];
    return {
      ...agent,
      name: meta.name,
      icon: meta.icon,
      accent: teamAgent?.accent ?? agent.accent,
      accentDim: teamAgent?.accentDim ?? agent.accentDim,
      accentGlow: teamAgent?.accentGlow ?? agent.accentGlow,
    };
  });
}

export const runOrchestration = async (
  userText,
  agentConfigs,
  onStateChange,
  signal,
  persona,
  userProfile,
  onSocketStatusChange,
  onStreamDelta = null
) => {
  // ── Attempt backend ───────────────────────────────────────────────────────
  if (BACKEND_URL) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('[Zyron Backend] ⏱️ Request timed out — switching to local engine');
        controller.abort();
      }, BACKEND_TIMEOUT_MS);

      // Combine the caller's abort signal with our timeout signal so either
      // one cancels the fetch cleanly.
      const combinedSignal = signal
        ? anyAbort([signal, controller.signal])
        : controller.signal;

      console.log('[Zyron Backend] ⚡ Routing to Railway orchestration engine...');
      const activeTeam = getActiveTeam();
      const _t0 = Date.now();
      const response = await fetch(`${BACKEND_URL}/orchestrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userText,
          agentConfigs,
          team: activeTeam,
          persona,
          userProfile,
        }),
        signal: combinedSignal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const _elapsed = Date.now() - _t0;
        console.log(`[Zyron Backend] ✅ Backend response received in ${_elapsed}ms`);
        // Log per-agent char counts
        if (Array.isArray(data.agents)) {
          data.agents.forEach((a) => {
            console.log(`[Zyron Backend] 👤 ${a.name} → ${(a.output ?? '').length} chars`);
          });
        }
        // Remap agents to the active team's UI metadata (name, icon, colours)
        // so the coordination panel reflects the correct team — not the backend default.
        return {
          ...data,
          agents: remapAgentsToActiveTeam(data.agents, activeTeam),
        };
      }
      // Non-200 → fall through to local fallback silently
    } catch (e) {
      // Network error, timeout (AbortError), or any other fetch failure →
      // fall through to local fallback silently.
      // Re-throw only if the caller explicitly cancelled (user pressed Stop).
      if (signal?.aborted) throw new Error('Aborted');
      console.log('[Zyron Backend] ❌ Backend unavailable — switching to local engine');
    }
  }

  // ── Local fallback ────────────────────────────────────────────────────────
  return runAgentsOrchestrator(
    userText,
    agentConfigs,
    onStateChange,
    signal,
    persona,
    userProfile,
    onSocketStatusChange,
    onStreamDelta
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns an AbortSignal that aborts as soon as ANY of the supplied signals
 * fires. Polyfills AbortSignal.any() for environments that don't have it.
 *
 * @param {AbortSignal[]} signals
 * @returns {AbortSignal}
 */
function anyAbort(signals) {
  if (typeof AbortSignal?.any === 'function') {
    return AbortSignal.any(signals);
  }
  const controller = new AbortController();
  for (const s of signals) {
    if (s.aborted) { controller.abort(); break; }
    s.addEventListener('abort', () => controller.abort(), { once: true });
  }
  return controller.signal;
}
