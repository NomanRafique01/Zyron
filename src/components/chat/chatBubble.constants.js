import C from '../../config/colors.config';

// ─── Helper: demo token data for initial messages ────
export const getDemoTokens = (msgMode) => {
  if (msgMode === 'agents') {
    return {
      Reasoner: { prompt_tokens: 352, completion_tokens: 512, total_tokens: 864 },
      Coder:    { prompt_tokens: 412, completion_tokens: 820, total_tokens: 1232 },
      Vision:   { prompt_tokens: 128, completion_tokens: 256, total_tokens: 384 },
      Writer:   { prompt_tokens: 2480, completion_tokens: 610, total_tokens: 3090 },
    };
  }
  return {
    Reasoner: { prompt_tokens: 84, completion_tokens: 180, total_tokens: 264 },
  };
};

// ─── Agent attribution config (fixed colors) ─────────
export const AGENT_ATTRIBUTION = {
  reasoner: { color: C.agentReasoner, bg: 'rgba(167, 139, 250, 0.10)', label: 'Reasoner' },
  coder:    { color: C.agentCoder,    bg: 'rgba(96, 165, 250, 0.10)',  label: 'Coder' },
  vision:   { color: C.agentVision,   bg: 'rgba(110, 231, 183, 0.10)', label: 'Vision' },
  writer:   { color: C.agentWriter,   bg: 'rgba(251, 191, 36, 0.08)', label: 'Writer' },
  // Fallbacks (capitalised keys from API)
  Reasoner: { color: C.agentReasoner, bg: 'rgba(167, 139, 250, 0.10)', label: 'Reasoner' },
  Coder:    { color: C.agentCoder,    bg: 'rgba(96, 165, 250, 0.10)',  label: 'Coder' },
  Vision:   { color: C.agentVision,   bg: 'rgba(110, 231, 183, 0.10)', label: 'Vision' },
  Writer:   { color: C.agentWriter,   bg: 'rgba(251, 191, 36, 0.08)', label: 'Writer' },
};

export const AGENT_KEYS = ['reasoner', 'coder', 'vision', 'writer'];

// ─── Markdown table layout constants ─────────────────
export const LARGE_TABLE_COL_THRESHOLD = 2;   // 2+ columns → always scrollable
export const COL_WIDTH_MIN   = 100;           // floor: no column is ever narrower than this
export const COL_WIDTH_MAX   = 320;           // ceiling: wide enough for long-text columns
export const COL_CHARS_SHORT = 10;            // content <= this → use min width
export const COL_CHARS_LONG  = 80;            // content >= this → use max width
export const MIN_THUMB_RATIO = 0.15;          // scrollbar thumb floor
