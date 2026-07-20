import { callAgent } from '../api/agentCaller.service';
import { buildWriterPrompt } from '../prompts/promptBuilder';
import { deduplicateOutputs, trimOutput, buildFallbackAnswer } from '../utils/outputFormatter.utils';
import { semanticDedup } from './semanticDedup';
import { judgeOutputQuality } from './qualityJudge';
import { getPersonaInstruction } from '../registry/teamMetadata';
import { isKeyExhaustedError } from '../utils/agentErrors.utils';

// ─── Local suggestion generator ───────────────────────────────────────────────
// Generates 2-3 follow-up chip strings from the writer output.
// Uses the writer agent's provider/model; returns [] on any error.
const _generateSuggestions = async (query, writerText, agentConfigs) => {
  if (!writerText || !writerText.trim()) return [];
  const cfg = agentConfigs?.writer;
  if (!cfg?.key) return [];
  const excerpt = writerText.trim().slice(0, 800);
  const prompt = (
    `The user asked: "${query.trim()}"\n\n` +
    `The AI responded (excerpt): "${excerpt}"\n\n` +
    `Generate exactly 3 short follow-up questions or prompts the user might want to ask next. ` +
    `Rules:\n` +
    `- Each suggestion must be under 8 words.\n` +
    `- Be specific to the topic — avoid generic phrases like "Tell me more".\n` +
    `- Output ONLY a valid JSON array of strings, nothing else.\n` +
    `  Example: ["What are the trade-offs?", "Show me an example", "How does X compare to Y?"]`
  );
  try {
    const res = await callAgent('writer', { ...cfg, timeoutMs: 8000 }, [{ role: 'user', content: prompt }]);
    const raw = (res?.text || '').trim();
    // Try JSON parse first
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter(s => typeof s === 'string' && s.trim()).slice(0, 3);
    } catch (_) {}
    // Regex fallback: extract JSON array from text
    const match = raw.match(/\[[\s\S]*?\]/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed)) return parsed.filter(s => typeof s === 'string' && s.trim()).slice(0, 3);
      } catch (_) {}
    }
    return [];
  } catch (_) {
    return [];
  }
};

export const runSynthesisPhase = async ({
  userText,
  analysis,
  persona,
  userProfile,
  agentConfigs,
  specialistOutputs,
  agentLabels,
  signal,
  onSocketStatusChange,
  progress,
  // optional: embed config for semantic dedup (Task 5)
  embedConfig = null,
  // true when specialists each handled a different slice of the prompt
  chunkingActive = false,
  // optional web search result to inject into writer prompt
  searchResults = null,
  // optional user document context { text, filename }
  documentContext = null,
  // optional local-mode conversation context (last 3 messages as plain text)
  // Specialist agents receive NO history — this is injected into the writer only.
  conversationContext = null,
}) => {
  const personaInstruction = getPersonaInstruction(persona);

  // ── Step 1: lexical dedup (fast, always runs) ─────────────────────────────
  const lexDeduped = deduplicateOutputs(specialistOutputs);

  // ── Step 2: semantic dedup (async, only if embedConfig provided) ──────────
  let deduped = lexDeduped;
  if (embedConfig?.key) {
    try {
      deduped = await semanticDedup(lexDeduped, embedConfig);
    } catch {
      deduped = lexDeduped; // fall through on any error
    }
  }

  const trimmed = Object.fromEntries(
    Object.entries(deduped).map(([role, text]) => [role, trimOutput(text)])  // caps each specialist at WRITER_SPECIALIST_CAP
  );

  // ── Step 3: quality scoring (tiered: heuristic or LLM judge) ─────────────
  let qualityReport;
  try {
    qualityReport = await judgeOutputQuality(trimmed, analysis, userText, agentConfigs);
  } catch {
    // Defensive: heuristicReport is the fallback inside judgeOutputQuality itself,
    // but if the import itself somehow threw we need a stub.
    qualityReport = {};
  }

  progress.markActive('writer');

  const { messages } = buildWriterPrompt({
    userText,
    analysis,
    personaInstruction,
    userProfile,
    specialistOutputs: trimmed,
    agentLabels,
    qualityReport,
    chunkingActive,
    searchResults,
    documentContext,
    conversationContext,   // local-mode memory — writer only
  });

  try {
    const res = await callAgent(
      'writer',
      agentConfigs.writer,
      messages,
      signal,
      onSocketStatusChange
    );
    progress.markDone('writer');
    // Generate follow-up suggestion chips after the main response
    const suggestions = await _generateSuggestions(userText, res.text, agentConfigs);
    return { text: res.text, usage: res.usage, suggestions };
  } catch (err) {
    // Only re-throw on explicit user cancel — timeouts are recoverable.
    if (signal?.aborted || err.message === 'Aborted') {
      throw err;
    }
    progress.markFailed('writer', err, isKeyExhaustedError(err));

    const fallback = buildFallbackAnswer(trimmed, analysis);
    return {
      text: fallback || '',
      usage: { prompt_tokens: 0, completion_tokens: 0 },
      suggestions: [],
      error: err,
    };
  }
};

// Named export so orchestrator.js can call the same suggestion function
export { _generateSuggestions as generateLocalSuggestions };
