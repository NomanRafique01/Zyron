/**
 * src/agents/search/searchResultFormatter.js
 *
 * Transforms raw Tavily or Serper API responses into a clean, structured
 * object that agents can consume without being overwhelmed by noise.
 *
 * Output shape:
 * {
 *   keyFacts:   string[],            — up to 5 distilled facts (primary source of truth)
 *   sources:    [{title, url, snippet}],
 *   searchedAt: string,              — ISO timestamp
 * }
 *
 * NOTE: Tavily's auto-generated `answer`/summary field is intentionally ignored —
 * it can be inaccurate. keyFacts built from raw result content are the primary
 * context injected into agent prompts.
 */

// Max sources/results to surface to agents — keeps context tight.
const MAX_SOURCES = 5;

// ─── Tavily formatter ─────────────────────────────────────────────────────────
/**
 * @param {object} raw  — raw Tavily API response
 * @returns {object}    — clean structured result
 */
export const formatTavilyResult = (raw) => {
  if (!raw || typeof raw !== 'object') return null;

  const results = Array.isArray(raw.results) ? raw.results.slice(0, MAX_SOURCES) : [];

  // Tavily's top-level `answer` field is intentionally ignored — it can be inaccurate.

  const sources = results.map((r) => ({
    title:   r.title   || '',
    url:     r.url     || '',
    snippet: r.content || r.snippet || '',
  })).filter((s) => s.title || s.url);

  // keyFacts are the primary source of truth — built from raw result content.
  const keyFacts = results
    .map((r) => (r.content || '').trim())
    .filter(Boolean)
    .slice(0, 5);

  if (keyFacts.length === 0 && sources.length === 0) return null;

  return {
    keyFacts,
    sources,
    searchedAt: new Date().toISOString(),
  };
};

// ─── Serper formatter ─────────────────────────────────────────────────────────
/**
 * @param {object} raw  — raw Serper API response
 * @returns {object}    — clean structured result
 */
export const formatSerperResult = (raw) => {
  if (!raw || typeof raw !== 'object') return null;

  // Serper puts organic results under `organic`.
  const organic = Array.isArray(raw.organic) ? raw.organic.slice(0, MAX_SOURCES) : [];

  const sources = organic.map((r) => ({
    title:   r.title   || '',
    url:     r.link    || '',
    snippet: r.snippet || '',
  })).filter((s) => s.title || s.url);

  // keyFacts are the primary source of truth — built from organic result snippets.
  const keyFacts = organic
    .map((r) => (r.snippet || '').trim())
    .filter(Boolean)
    .slice(0, 5);

  if (keyFacts.length === 0 && sources.length === 0) return null;

  return {
    keyFacts,
    sources,
    searchedAt: new Date().toISOString(),
  };
};
