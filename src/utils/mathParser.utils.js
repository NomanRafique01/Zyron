const RTL_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
const LATEX_COMMAND_RE = /\\(?:frac|sqrt|sum|int|lim|begin|end|alpha|beta|gamma|delta|theta|lambda|mu|pi|sigma|omega|vec|cdot|times|div|leq|geq|neq|approx|ce)\b/;
const EQUATION_RE = /(?:[A-Za-z][A-Za-z0-9_{}\\^]*\s*[=<>]|[=<>]\s*[A-Za-z0-9_{}\\]|\\(?:frac|sqrt|sum|int|lim|ce)\b|\^|_\{?|\b(?:sin|cos|tan|log|ln)\s*\()/;
const CHEM_FORMULA_RE = /\b(?:[A-Z][a-z]?\d*){2,}(?:\s*(?:\+|->|<->|=)\s*(?:[A-Z][a-z]?\d*){1,})*\b/;
const CHEM_INLINE_RE = /\b(?:[A-Z][a-z]?\d*){2,}\b/g;
const DISPLAY_ENV_RE = /\\begin\{(?:equation|align|aligned|gather|matrix|pmatrix|bmatrix|cases)\}/;
const WHOLE_INLINE_MATH_RE = /^\\\(([\s\S]+)\\\)$/;
const WHOLE_DISPLAY_MATH_RE = /^\\\[([\s\S]+)\\\]$/;
const PROSE_WORD_RE = /[A-Za-z]{3,}/g;

export function hasRtlText(text) {
  return RTL_RE.test(text || '');
}

export function isLikelyMathLine(line) {
  const trimmed = (line || '').trim();
  if (!trimmed || trimmed.length > 180) return false;
  if (/^[-*]\s+/.test(trimmed) || /^#{1,6}\s+/.test(trimmed)) return false;

  if (WHOLE_INLINE_MATH_RE.test(trimmed) || WHOLE_DISPLAY_MATH_RE.test(trimmed)) return true;

  const withoutInlineMath = trimmed
    .replace(/\\\([\s\S]*?\\\)/g, ' ')
    .replace(/\$[^$]+\$/g, ' ');
  const hasInlineDelimiters = /\\\(|\\\)|(^|[^$])\$([^$]|$)/.test(trimmed);
  if (hasInlineDelimiters) return false;

  const proseWords = withoutInlineMath.match(PROSE_WORD_RE) || [];
  if (proseWords.length > 2) return false;

  if (LATEX_COMMAND_RE.test(trimmed) || DISPLAY_ENV_RE.test(trimmed)) return true;
  if (EQUATION_RE.test(trimmed)) return /[A-Za-z0-9\\)]/.test(trimmed);
  return false;
}

export function isLikelyChemistryToken(text) {
  const trimmed = (text || '').trim();
  if (!trimmed || trimmed.length > 80) return false;
  return CHEM_FORMULA_RE.test(trimmed) && /[A-Z][a-z]?\d/.test(trimmed);
}

export function normalizeFormulaSource(text, { chemistry = false } = {}) {
  let trimmed = (text || '').trim();
  if (!trimmed) return '';
  const inlineMatch = trimmed.match(WHOLE_INLINE_MATH_RE);
  const displayMatch = trimmed.match(WHOLE_DISPLAY_MATH_RE);
  if (inlineMatch) trimmed = inlineMatch[1].trim();
  if (displayMatch) trimmed = displayMatch[1].trim();
  if (chemistry || /^\\ce\{/.test(trimmed)) return trimmed;
  if (isLikelyChemistryToken(trimmed) && !/[\\^_{}]/.test(trimmed)) {
    return `\\ce{${trimmed}}`;
  }
  return trimmed;
}

// Splits content into plain text and display-math segments (\[...\] or $$...$$)
export function splitByDisplayMath(text) {
  if (!text) return [{ type: 'text', content: '' }];

  const segments = [];
  let buffer = '';
  let i = 0;

  const flushText = () => {
    if (buffer) {
      segments.push({ type: 'text', content: buffer });
      buffer = '';
    }
  };

  while (i < text.length) {
    if (text.startsWith('\\[', i)) {
      const end = text.indexOf('\\]', i + 2);
      if (end !== -1) {
        flushText();
        segments.push({ type: 'math-display', content: text.slice(i + 2, end).trim() });
        i = end + 2;
        continue;
      }
    }

    if (text.startsWith('$$', i)) {
      const end = text.indexOf('$$', i + 2);
      if (end !== -1) {
        flushText();
        segments.push({ type: 'math-display', content: text.slice(i + 2, end).trim() });
        i = end + 2;
        continue;
      }
    }

    buffer += text[i];
    i += 1;
  }

  flushText();
  return segments.length ? segments : [{ type: 'text', content: text }];
}

// Splits a single line into text and inline-math segments (\(...\) or $...$)
export function splitInlineMath(text) {
  if (!text) return [{ type: 'text', content: '' }];

  const segments = [];
  let buffer = '';
  let i = 0;

  const flushText = () => {
    if (buffer) {
      segments.push({ type: 'text', content: buffer });
      buffer = '';
    }
  };

  while (i < text.length) {
    if (text.startsWith('\\(', i)) {
      const end = text.indexOf('\\)', i + 2);
      if (end !== -1) {
        flushText();
        segments.push({ type: 'math-inline', content: text.slice(i + 2, end).trim() });
        i = end + 2;
        continue;
      }
    }

    if (text[i] === '$' && text[i + 1] !== '$') {
      const end = text.indexOf('$', i + 1);
      if (end !== -1) {
        flushText();
        segments.push({ type: 'math-inline', content: text.slice(i + 1, end).trim() });
        i = end + 1;
        continue;
      }
    }

    buffer += text[i];
    i += 1;
  }

  flushText();
  return segments.length ? segments : [{ type: 'text', content: text }];
}

export function hasInlineMath(text) {
  return splitInlineMath(text).some((segment) => segment.type === 'math-inline');
}

export function splitInlineChemistry(text) {
  if (!text) return [{ type: 'text', content: '' }];
  const segments = [];
  let lastIndex = 0;
  let match;

  while ((match = CHEM_INLINE_RE.exec(text)) !== null) {
    const token = match[0];
    if (!/[A-Z][a-z]?\d/.test(token)) continue;
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    segments.push({ type: 'chem-inline', content: token });
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return segments.length ? segments : [{ type: 'text', content: text }];
}
