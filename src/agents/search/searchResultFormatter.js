/**
 * src/agents/search/searchResultFormatter.js
 *
 * Transforms raw Tavily or Serper API responses into a clean, structured
 * object that agents can consume without being overwhelmed by noise.
 *
 * Output shape:
 * {
 *   summary:    string,              — 2-3 sentence overview
 *   keyFacts:   string[],            — up to 5 distilled facts
 *   sources:    [{title, url, snippet}],
 *   searchedAt: string,              — ISO timestamp
 * }
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

  // Tavily may return a top-level `answer` field — use it as the summary base.
  const tavilyAnswer = raw.answer || '';

  const sources = results.map((r) => ({
    title:   r.title   || '',
    url:     r.url     || '',
    snippet: r.content || r.snippet || '',
  })).filter((s) => s.title || s.url);

  // Build key facts from individual result content snippets.
  const keyFacts = results
    .map((r) => (r.content || '').trim())
    .filter(Boolean)
    .slice(0, 5);

  // Summary: prefer Tavily's own synthesized answer; otherwise stitch top snippets.
  const summary = tavilyAnswer.trim() || keyFacts.slice(0, 2).join(' ').slice(0, 400) || '';

  if (!summary && sources.length === 0) return null;

  return {
    summary,
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

  // Serper puts organic results under `organic`; knowledge graph under `knowledgeGraph`.
  const organic    = Array.isArray(raw.organic)    ? raw.organic.slice(0, MAX_SOURCES)    : [];
  const answerBox  = raw.answerBox  || null;
  const kg         = raw.knowledgeGraph || null;

  const sources = organic.map((r) => ({
    title:   r.title   || '',
    url:     r.link    || '',
    snippet: r.snippet || '',
  })).filter((s) => s.title || s.url);

  const keyFacts = organic
    .map((r) => (r.snippet || '').trim())
    .filter(Boolean)
    .slice(0, 5);

  // Summary priority: answerBox snippet > knowledge graph description > top snippets.
  const summary = (
    answerBox?.answer  ||
    answerBox?.snippet ||
    kg?.description    ||
    keyFacts.slice(0, 2).join(' ').slice(0, 400) ||
    ''
  ).trim();

  if (!summary && sources.length === 0) return null;

  return {
    summary,
    keyFacts,
    sources,
    searchedAt: new Date().toISOString(),
  };
};
