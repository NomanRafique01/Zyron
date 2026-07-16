import { splitByDisplayMath } from '../../utils/mathParser.utils';

// ─── Advanced Markdown Parser ────────────────────────
// Splits text into: text blocks, code blocks, table blocks, and display-math blocks
export const parseMarkdown = (text) => {
  if (!text) return [];
  const parts = [];
  const regex = /```(\w*)\n([\s\S]*?)\n?```/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const textBefore = text.slice(lastIndex, match.index);
    if (textBefore.trim()) {
      const subParts = parseDisplayMathAndTables(textBefore);
      parts.push(...subParts);
    }
    parts.push({
      type: 'code',
      language: match[1] || 'code',
      content: match[2],
    });
    lastIndex = regex.lastIndex;
  }

  const textAfter = text.slice(lastIndex);
  if (textAfter.trim() || parts.length === 0) {
    const subParts = parseDisplayMathAndTables(textAfter || text);
    parts.push(...subParts);
  }

  return parts;
};

// ─── Display-math + Table extractor ─────────────────
// Splits a text segment into: display-math blocks, table blocks, and text blocks.
export const parseDisplayMathAndTables = (text) => {
  if (!text) return [];
  const result = [];

  const mathSegments = splitByDisplayMath(text);
  for (const seg of mathSegments) {
    if (seg.type === 'math-display') {
      result.push({ type: 'math-display', content: seg.content });
    } else {
      const tableAndText = parseTablesFromText(seg.content);
      result.push(...tableAndText);
    }
  }

  return result;
};

// ─── Count actual pipe separators (ignoring escaped pipes) ──
export const splitUnescapedPipes = (line) => {
  const cells = [];
  let current = '';
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '|' && line[i - 1] !== '\\') {
      cells.push(current);
      current = '';
    } else {
      current += line[i];
    }
  }
  cells.push(current);
  return cells;
};

// ─── Table Detector — splits text into text + table blocks ──
export const parseTablesFromText = (text) => {
  const lines = text.split('\n');
  const blocks = [];
  let currentTextLines = [];
  let tableLines = [];
  let inTable = false;

  const flushText = () => {
    if (currentTextLines.length > 0) {
      const joined = currentTextLines.join('\n');
      if (joined.trim()) blocks.push({ type: 'text', content: joined });
      currentTextLines = [];
    }
  };

  const flushTable = () => {
    if (tableLines.length >= 2) {
      const parsed = parseTableBlock(tableLines);
      if (parsed) {
        blocks.push(parsed);
      } else {
        currentTextLines.push(...tableLines);
      }
    } else if (tableLines.length > 0) {
      currentTextLines.push(...tableLines);
    }
    tableLines = [];
  };

  const countPipes = (line) => Math.max(0, splitUnescapedPipes(line).length - 1);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    const pipeCount = countPipes(trimmed);
    const isSeparator =
      /^\|?\s*[:|-]+\s*(\|\s*[:|-]+\s*)+\|?\s*$/.test(trimmed) && trimmed.includes('-');

    const nextLineTrimmed = lines[i + 1] ? lines[i + 1].trim() : '';
    const nextPipeCount = countPipes(nextLineTrimmed);
    const nextIsSeparator =
      nextLineTrimmed &&
      /^\|?\s*[:|-]+\s*(\|\s*[:|-]+\s*)+\|?\s*$/.test(nextLineTrimmed) &&
      nextLineTrimmed.includes('-');

    const isPipeLine =
      isSeparator ||
      (pipeCount >= 1 &&
        (inTable ||
          pipeCount >= 2 ||
          trimmed.startsWith('|') ||
          nextPipeCount >= 1 ||
          nextIsSeparator));

    if (isPipeLine) {
      if (!inTable) {
        flushText();
        inTable = true;
      }
      tableLines.push(line);
    } else {
      if (inTable) {
        flushTable();
        inTable = false;
      }
      currentTextLines.push(line);
    }
  }

  if (inTable) flushTable();
  flushText();

  return blocks;
};

// ─── Parse a group of table lines into structured data ──
export const parseTableBlock = (lines) => {
  let sepIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (
      /^[\s|]*[-:]+[\s]*(\|[\s]*[-:]+[\s]*)+[\s|]*$/.test(trimmed) &&
      trimmed.includes('-')
    ) {
      sepIdx = i;
      break;
    }
  }

  const parseCells = (line) => {
    let trimmed = line.trim();
    if (trimmed.startsWith('|')) trimmed = trimmed.slice(1);
    if (trimmed.endsWith('|')) trimmed = trimmed.slice(0, -1);
    return splitUnescapedPipes(trimmed).map(c => c.replace(/\\\|/g, '|').trim());
  };

  let headers = [];
  let rows = [];

  if (sepIdx > 0) {
    headers = parseCells(lines[sepIdx - 1]);
    for (let i = sepIdx + 1; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (trimmed && trimmed.includes('|')) {
        const cells = parseCells(lines[i]);
        if (cells.length > 0) rows.push(cells);
      }
    }
  } else if (sepIdx === 0 && lines.length >= 2) {
    headers = parseCells(lines[1]);
    for (let i = 2; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (trimmed && trimmed.includes('|') && !/^[-|:\s]+$/.test(trimmed)) {
        rows.push(parseCells(lines[i]));
      }
    }
  } else if (lines.length >= 2) {
    headers = parseCells(lines[0]);
    for (let i = 1; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (trimmed && trimmed.includes('|') && !/^[-|:\s]+$/.test(trimmed)) {
        rows.push(parseCells(lines[i]));
      }
    }
  }

  if (headers.length === 0 || rows.length === 0) return null;

  const colCount = headers.length;
  rows = rows.map(row => {
    while (row.length < colCount) row.push('');
    return row.slice(0, colCount);
  });

  return { type: 'table', headers, rows };
};
