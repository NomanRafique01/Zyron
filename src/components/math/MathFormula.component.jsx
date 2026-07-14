import React, { memo, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { normalizeFormulaSource } from '../../utils/mathParser.utils';

// Lazy-load katex so its DOM references are never evaluated at module-load
// time (which crashes Hermes / React Native with "document is not defined").
let _katex = null;
function getKatex() {
  if (!_katex) {
    try {
      _katex = require('katex');
      require('katex/contrib/mhchem');
    } catch (e) {
      // katex unavailable — display formulas will fall back to plain text
      _katex = null;
    }
  }
  return _katex;
}

const SUPERSCRIPT = {
  0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹',
  '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾', n: 'ⁿ', i: 'ⁱ',
};

const SUBSCRIPT = {
  0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉',
  '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎',
  a: 'ₐ', e: 'ₑ', h: 'ₕ', i: 'ᵢ', j: 'ⱼ', k: 'ₖ', l: 'ₗ', m: 'ₘ', n: 'ₙ',
  o: 'ₒ', p: 'ₚ', r: 'ᵣ', s: 'ₛ', t: 'ₜ', u: 'ᵤ', v: 'ᵥ', x: 'ₓ',
};

const GREEK = {
  '\\alpha': 'α',
  '\\beta': 'β',
  '\\gamma': 'γ',
  '\\delta': 'δ',
  '\\Delta': 'Δ',
  '\\theta': 'θ',
  '\\lambda': 'λ',
  '\\mu': 'μ',
  '\\pi': 'π',
  '\\rho': 'ρ',
  '\\sigma': 'σ',
  '\\omega': 'ω',
};

const toScript = (value, map) => String(value)
  .split('')
  .map((char) => map[char] || map[char.toLowerCase()] || char)
  .join('');

function replaceCommandGroups(source, command, replacer) {
  let output = source;
  let cursor = output.indexOf(command);

  while (cursor !== -1) {
    const start = cursor + command.length;
    if (output[start] !== '{') {
      cursor = output.indexOf(command, start);
      continue;
    }

    let depth = 0;
    let end = -1;
    for (let i = start; i < output.length; i++) {
      if (output[i] === '{') depth += 1;
      if (output[i] === '}') depth -= 1;
      if (depth === 0) {
        end = i;
        break;
      }
    }

    if (end === -1) break;
    const inner = output.slice(start + 1, end);
    output = `${output.slice(0, cursor)}${replacer(inner)}${output.slice(end + 1)}`;
    cursor = output.indexOf(command, cursor + 1);
  }

  return output;
}

function formatChemistryInline(source) {
  const body = source.replace(/^\\ce\{([\s\S]*)\}$/, '$1');
  return body
    .replace(/<->/g, '⇌')
    .replace(/->/g, '→')
    .replace(/<-|\\leftarrow/g, '←')
    .replace(/([A-Z][a-z]?)(\d+)/g, (_, element, count) => `${element}${toScript(count, SUBSCRIPT)}`)
    .replace(/\^(\d*[+-])/g, (_, charge) => toScript(charge, SUPERSCRIPT));
}

function formatInlineFormula(source) {
  let value = normalizeFormulaSource(source);
  if (!value) return '';
  if (/^\\ce\{/.test(value)) return formatChemistryInline(value);

  value = value
    .replace(/\\left|\\right/g, '')
    .replace(/\\,/g, ' ')
    .replace(/\\!/g, '')
    .replace(/\\ /g, ' ');

  value = replaceCommandGroups(value, '\\text', (inner) => inner);
  value = replaceCommandGroups(value, '\\mathrm', (inner) => inner);
  value = replaceCommandGroups(value, '\\operatorname', (inner) => inner);
  value = replaceCommandGroups(value, '\\vec', (inner) => `${formatInlineFormula(inner)}⃗`);

  let previous;
  do {
    previous = value;
    value = value.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, (_, numerator, denominator) => {
      return `${formatInlineFormula(numerator)}/${formatInlineFormula(denominator)}`;
    });
  } while (value !== previous);

  value = replaceCommandGroups(value, '\\sqrt', (inner) => `√(${formatInlineFormula(inner)})`);

  Object.entries(GREEK).forEach(([command, symbol]) => {
    value = value.split(command).join(symbol);
  });

  value = value
    .replace(/\\int/g, '∫')
    .replace(/\\sum/g, 'Σ')
    .replace(/\\lim/g, 'lim')
    .replace(/\\sin/g, 'sin')
    .replace(/\\cos/g, 'cos')
    .replace(/\\tan/g, 'tan')
    .replace(/\\ln/g, 'ln')
    .replace(/\\log/g, 'log')
    .replace(/\\arctan/g, 'arctan')
    .replace(/\\arcsin/g, 'arcsin')
    .replace(/\\arccos/g, 'arccos')
    .replace(/\\cdot/g, '·')
    .replace(/\\times/g, '×')
    .replace(/\\div/g, '÷')
    .replace(/\\leq/g, '≤')
    .replace(/\\geq/g, '≥')
    .replace(/\\neq/g, '≠')
    .replace(/\\approx/g, '≈')
    .replace(/\\to|\\rightarrow/g, '→')
    .replace(/\\leftarrow/g, '←')
    .replace(/\\leftrightarrow/g, '↔');

  // Replace * between variables/numbers/units with a multiplication dot
  value = value.replace(/([A-Za-z0-9)\]}⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿⁱ₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎ₐₑₕᵢⱼₖₗₘₙₒₚᵣₛₜᵤᵥₓ])\s*\*+\s*([A-Za-z0-9(\[{])/g, '$1·$2');

  value = value
    .replace(/_\{([^{}]+)\}/g, (_, body) => toScript(body.replace(/\\text\{([^{}]+)\}/g, '$1'), SUBSCRIPT))
    .replace(/\^\{([^{}]+)\}/g, (_, body) => toScript(body, SUPERSCRIPT))
    .replace(/_([A-Za-z0-9+\-=()]+)/g, (_, body) => toScript(body, SUBSCRIPT))
    .replace(/\^([A-Za-z0-9+\-=()]+)/g, (_, body) => toScript(body, SUPERSCRIPT));

  value = value
    .replace(/[{}]/g, '')
    .replace(/\\/g, '')
    .replace(/\|\s*([^|]+?)\s*\|/g, '|$1|');

  // Space equals signs
  value = value.replace(/\s*(=)\s*/g, ' $1 ');

  // Space only binary + and - signs, keeping unary signs compact (e.g. -5, -x)
  const binaryOpRegex = /([A-Za-z0-9)\]}⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿⁱ₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎ₐₑₕᵢⱼₖₗₘₙₒₚᵣₛₜᵤᵥₓ])\s*([+\-])\s*([A-Za-z0-9(\[{])/g;
  value = value.replace(binaryOpRegex, '$1 $2 $3');

  return value
    .replace(/\s+/g, ' ')
    .trim();
}

const buildFormulaHtml = (mathml, display) => `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <style>
      html, body {
        margin: 0;
        padding: 0;
        background: transparent;
        color: #E8E8F0;
        overflow: hidden;
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
        font-size: ${display ? 18 : 15}px;
        line-height: 1.45;
      }
      #formula {
        width: 100%;
        text-align: ${display ? 'center' : 'left'};
        overflow-x: auto;
        overflow-y: hidden;
        box-sizing: border-box;
        padding: ${display ? '4px 0' : '0'};
      }
      math {
        color: #E8E8F0;
        font-size: ${display ? '1.05em' : '1em'};
      }
    </style>
  </head>
  <body>
    <div id="formula">${mathml}</div>
    <script>
      function postHeight() {
        var el = document.getElementById('formula');
        var height = Math.ceil(Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight,
          el ? el.scrollHeight : 0
        ));
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(String(height || 24));
      }
      requestAnimationFrame(postHeight);
      setTimeout(postHeight, 60);
    </script>
  </body>
</html>`;

function renderFormula(latex, display) {
  const source = normalizeFormulaSource(latex);
  const katex = getKatex();
  if (!katex) {
    const escaped = source
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `<span>${escaped}</span>`;
  }
  try {
    return katex.renderToString(source, {
      displayMode: display,
      output: 'mathml',
      throwOnError: false,
      strict: 'ignore',
      trust: false,
      fleqn: false,
    });
  } catch (error) {
    const escaped = source
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `<span>${escaped}</span>`;
  }
}

// ─── Module-level height cache ───────────────────────────────────────────────
// Keyed by `${latex}|${display}`. Survives component remounts (e.g. FlatList
// recycling / removeClippedSubviews) so the WebView always starts at the
// previously-measured height — zero layout shift on re-open.
const heightCache = new Map();

function getCacheKey(latex, display) {
  return `${latex}|${display ? '1' : '0'}`;
}

function MathFormula({ latex, display = false, style }) {
  const source = latex?.trim();
  const cacheKey = source ? getCacheKey(source, display) : null;

  // Initialise from cache if available — prevents any layout shift on remount
  const [height, setHeight] = useState(() =>
    cacheKey && heightCache.has(cacheKey) ? heightCache.get(cacheKey) : 0
  );
  const [measured, setMeasured] = useState(() =>
    cacheKey ? heightCache.has(cacheKey) : false
  );

  const inlineText = useMemo(() => {
    if (!source || display) return '';
    return formatInlineFormula(source);
  }, [source, display]);

  const html = useMemo(() => {
    if (!source || !display) return '';
    return buildFormulaHtml(renderFormula(source, display), display);
  }, [source, display]);

  if (!source) return null;

  if (!display) {
    return (
      <Text style={[styles.inlineText, style]}>
        {inlineText || source}
      </Text>
    );
  }

  return (
    <View
      style={[
        styles.displayWrap,
        style,
        // While unmeasured, hold minimum space so the bubble doesn't collapse
        !measured && styles.displayWrapPending,
        // Once measured, fix the exact height — no further layout shifts
        measured && { height },
      ]}
    >
      <WebView
        source={{ html }}
        style={[
          styles.display,
          // Invisible until we have the real height — renders off-screen silently
          !measured ? styles.displayHidden : { height },
        ]}
        scrollEnabled
        originWhitelist={['*']}
        showsHorizontalScrollIndicator={display}
        showsVerticalScrollIndicator={false}
        androidLayerType="hardware"
        javaScriptEnabled
        onMessage={(event) => {
          const nextHeight = Number(event.nativeEvent.data);
          if (Number.isFinite(nextHeight) && nextHeight > 0 && !measured) {
            const clamped = Math.max(36, Math.min(nextHeight + 2, 220));
            // Store in module cache so remounts skip measurement entirely
            if (cacheKey) heightCache.set(cacheKey, clamped);
            setHeight(clamped);
            setMeasured(true);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  displayWrap: {
    width: '100%',
    minHeight: 38,
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.025)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
  },
  display: {
    width: '100%',
    backgroundColor: 'transparent',
  },
  // Placeholder state — holds space but shows nothing
  displayWrapPending: {
    minHeight: 36,
  },
  // WebView hidden during measurement — opacity 0 + height 0 = invisible but loaded
  displayHidden: {
    opacity: 0,
    height: 0,
  },
  inlineText: {
    color: '#F1F1FA',
    fontSize: 14.5,
    lineHeight: 21,
    fontWeight: '600',
    fontFamily: 'serif',
    marginHorizontal: 1,
  },
});

export default memo(MathFormula);
