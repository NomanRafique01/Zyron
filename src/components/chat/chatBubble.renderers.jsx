import React from 'react';
import { Text } from 'react-native';
import MathFormula from '../math/MathFormula.component.jsx';
import { splitInlineMath } from '../../utils/mathParser.utils';
import { s } from './chatBubble.styles.js';

// ─── Inline styles renderer (bold, italic, code, inline math) ──
// Returns an array of React elements — must be used inside <Text>.
export const renderInlineStyles = (txt, keyPrefix = '') => {
  if (!txt) return '';

  const mathSegments = splitInlineMath(String(txt));
  const hasMath = mathSegments.some(seg => seg.type === 'math-inline');

  if (hasMath) {
    return mathSegments.map((seg, mi) => {
      if (seg.type === 'math-inline') {
        return (
          <MathFormula
            key={`${keyPrefix}m${mi}`}
            latex={seg.content}
            display={false}
          />
        );
      }
      return renderTextStyles(seg.content, `${keyPrefix}t${mi}`);
    });
  }

  return renderTextStyles(txt, keyPrefix);
};

// ─── Renders bold / italic / inline-code within a plain-text segment ──
export const renderTextStyles = (txt, keyPrefix = '') => {
  if (!txt) return '';
  const codeParts = txt.split(/`([^`]+)`/g);
  return codeParts.map((part, i) => {
    if (i % 2 === 1) {
      return <Text key={`${keyPrefix}c${i}`} style={s.mdInlineCode}>{part}</Text>;
    }
    const boldParts = part.split(/\*\*([\s\S]*?)\*\*/g);
    return boldParts.map((bp, j) => {
      if (j % 2 === 1) {
        return <Text key={`${keyPrefix}b${i}-${j}`} style={s.mdBold}>{bp}</Text>;
      }
      const italicParts = bp.split(/\*([\s\S]*?)\*/g);
      return italicParts.map((ip, k) => {
        if (k % 2 === 1) {
          return <Text key={`${keyPrefix}i${i}-${j}-${k}`} style={s.mdItalic}>{ip}</Text>;
        }
        return ip;
      });
    });
  });
};
