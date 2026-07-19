/**
 * src/agents/search/searchProviders.js
 *
 * Individual search provider implementations.
 * Both return a clean structured result or null — never throw.
 *
 * Keys are read at call-time from keyGuard (encrypted storage).
 * Provider-specific timeouts default to 3 000 ms per spec.
 */

import { getKey } from '../security/keyGuard';
import { formatTavilyResult, formatSerperResult } from './searchResultFormatter';

const SEARCH_TIMEOUT_MS = 3000;

// ─── Abort helper ─────────────────────────────────────────────────────────────
const fetchWithTimeout = async (url, options, timeoutMs = SEARCH_TIMEOUT_MS) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
};

// ─── Tavily ───────────────────────────────────────────────────────────────────
/**
 * Search via Tavily API.
 * @param {string} query — optimized search query
 * @returns {object|null} — formatted result or null on failure / no results
 */
export const searchTavily = async (query) => {
  try {
    const apiKey = await getKey('tavily');
    if (!apiKey) return null;

    const res = await fetchWithTimeout(
      'https://api.tavily.com/search',
      {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          query,
          search_depth: 'basic',
          max_results:  5,
          include_answer: true,
        }),
      },
      SEARCH_TIMEOUT_MS
    );

    if (!res.ok) return null;

    const data = await res.json();
    const formatted = formatTavilyResult(data);
    return formatted;
  } catch {
    return null;
  }
};

// ─── Serper ───────────────────────────────────────────────────────────────────
/**
 * Search via Serper (Google Search API).
 * @param {string} query — optimized search query
 * @returns {object|null} — formatted result or null on failure / no results
 */
export const searchSerper = async (query) => {
  try {
    const apiKey = await getKey('serper');
    if (!apiKey) return null;

    const res = await fetchWithTimeout(
      'https://google.serper.dev/search',
      {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY':    apiKey,
        },
        body: JSON.stringify({ q: query, num: 5 }),
      },
      SEARCH_TIMEOUT_MS
    );

    if (!res.ok) return null;

    const data = await res.json();
    const formatted = formatSerperResult(data);
    return formatted;
  } catch {
    return null;
  }
};
