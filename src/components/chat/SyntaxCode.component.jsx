import React, { useState, useMemo, memo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import C from '../../config/colors.config';

// ─── Simple syntax tokenizer (VS Code style colors) ───
const tokenizeLine = (line) => {
  const tokens = [];
  let i = 0;

  const keywords = new Set([
    'const','let','var','function','return','if','else','for','while',
    'import','from','export','default','class','def','print','as','try',
    'except','with','in','and','or','not','True','False','None','self',
    'nil','null','struct','enum','public','private','static','void',
    'int','string','bool','async','await','yield','pass','break','continue',
    'new','this','typeof','instanceof','switch','case','throw','catch','finally',
  ]);

  while (i < line.length) {
    // Comment: // or #
    if ((line[i] === '/' && line[i+1] === '/') || line[i] === '#') {
      tokens.push({ type: 'cmt', text: line.slice(i) });
      break;
    }

    // String: ", ', `
    if (line[i] === '"' || line[i] === "'" || line[i] === '`') {
      const quote = line[i];
      let j = i + 1;
      while (j < line.length && line[j] !== quote) {
        if (line[j] === '\\') j++; // skip escaped
        j++;
      }
      j++; // closing quote
      tokens.push({ type: 'str', text: line.slice(i, j) });
      i = j;
      continue;
    }

    // Number
    if (/\d/.test(line[i]) && (i === 0 || /\W/.test(line[i-1]))) {
      let j = i;
      while (j < line.length && /[\d.]/.test(line[j])) j++;
      tokens.push({ type: 'num', text: line.slice(i, j) });
      i = j;
      continue;
    }

    // Word (keyword, function, or identifier)
    if (/[a-zA-Z_$]/.test(line[i])) {
      let j = i;
      while (j < line.length && /\w/.test(line[j])) j++;
      const word = line.slice(i, j);
      // Skip whitespace to check for '('
      let k = j;
      while (k < line.length && line[k] === ' ') k++;
      if (keywords.has(word)) {
        tokens.push({ type: 'kw', text: word });
      } else if (line[k] === '(') {
        tokens.push({ type: 'fn', text: word });
      } else {
        tokens.push({ type: 'normal', text: word });
      }
      i = j;
      continue;
    }

    // Operator / punctuation — group consecutive symbols
    if (/[^\w\s]/.test(line[i])) {
      tokens.push({ type: 'op', text: line[i] });
      i++;
      continue;
    }

    // Whitespace
    let j = i;
    while (j < line.length && line[j] === ' ') j++;
    tokens.push({ type: 'normal', text: line.slice(i, j) });
    i = j;
  }

  return tokens;
};

function SyntaxCode({ code, language }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(code);
    } catch (err) {
      console.warn("Clipboard setString failed:", err);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = useMemo(() => code.trim().split('\n'), [code]);
  const tokenizedLines = useMemo(
    () => lines.map((line) => tokenizeLine(line)),
    [lines]
  );

  return (
    <View style={s.codeBlock}>
      <View style={s.codeHeader}>
        <Text style={s.codeHeaderTitle}>{language || 'code'}</Text>
        <TouchableOpacity onPress={handleCopy} activeOpacity={0.7}>
          <Text style={s.codeCopyText}>{copied ? 'Copied!' : 'Copy'}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.codeScroll}>
        <View style={s.codeInner}>
          {lines.map((line, li) => {
            const tokens = tokenizedLines[li];
            return (
              <View key={li} style={s.codeLineRow}>
                {/* Optional line number column */}
                <Text style={s.lineNumber}>{li + 1}</Text>
                <Text style={s.codeText}>
                  {tokens.map((seg, si) => (
                    <Text
                      key={si}
                      style={[
                        s.codeText,
                        seg.type === 'kw' && { color: C.purpleSoft, fontWeight: '600' }, // Keywords
                        seg.type === 'fn' && { color: C.blueFn },                      // Functions
                        seg.type === 'str' && { color: C.green },                       // Strings
                        seg.type === 'num' && { color: C.cyan },                        // Numbers
                        seg.type === 'cmt' && { color: '#6A6A80', fontStyle: 'italic' }, // Comments
                        seg.type === 'op'  && { color: '#E879F9' }, // Operators
                      ]}
                    >
                      {seg.text}
                    </Text>
                  ))}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

export default memo(SyntaxCode, (prev, next) => (
  prev.code === next.code && prev.language === next.language
));

const s = StyleSheet.create({
  codeBlock: {
    backgroundColor: C.bgCode,
    borderWidth: 1,
    borderColor: C.borderCode,
    borderRadius: 12,
    marginTop: 12,
    overflow: 'hidden',
  },
  codeHeader: {
    height: 32,
    backgroundColor: '#12121D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.borderCode,
  },
  codeHeaderTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: C.textDim,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  codeCopyText: {
    fontSize: 10,
    fontWeight: '600',
    color: C.cyan,
  },
  codeScroll: {
    padding: 12,
  },
  codeInner: {
    flexDirection: 'column',
  },
  codeLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  lineNumber: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 11,
    color: '#444455',
    width: 24,
    textAlign: 'right',
    marginRight: 10,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 11.5,
    lineHeight: 18,
    color: C.textCode,
  },
});
