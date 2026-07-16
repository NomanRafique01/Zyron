import React from 'react';
import { View, Text } from 'react-native';
import { AGENT_KEYS, AGENT_ATTRIBUTION } from './chatBubble.constants.js';
import { renderInlineStyles } from './chatBubble.renderers.jsx';
import { s } from './chatBubble.styles.js';

// ─── Markdown Text Component ─────────────────────────
// Renders heading / list / paragraph lines.
// Display-math blocks are already extracted upstream — this component only
// receives plain text content (which may still contain inline math).
export default function MarkdownText({ content, visualMode, blockIndex, activeLine, themeColor }) {
  const lines = content.split('\n');

  const agentKey = AGENT_KEYS[blockIndex % AGENT_KEYS.length];
  const attr = AGENT_ATTRIBUTION[agentKey];

  return (
    <View style={[
      s.mdTextContainer,
      visualMode && {
        backgroundColor: attr.bg,
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 8,
        marginBottom: 8,
        borderLeftWidth: 2,
        borderLeftColor: attr.color,
      }
    ]}>
      {lines.map((line, idx) => {
        let isHeading = false;
        let headingLevel = 0;
        let isListItem = false;
        let isNumberedList = false;
        let numberedPrefix = '';
        let cleanLine = line;

        // Parse Headings (H1 through H5)
        if (line.startsWith('##### ')) {
          isHeading = true; headingLevel = 5; cleanLine = line.slice(6);
        } else if (line.startsWith('#### ')) {
          isHeading = true; headingLevel = 4; cleanLine = line.slice(5);
        } else if (line.startsWith('### ')) {
          isHeading = true; headingLevel = 3; cleanLine = line.slice(4);
        } else if (line.startsWith('## ')) {
          isHeading = true; headingLevel = 2; cleanLine = line.slice(3);
        } else if (line.startsWith('# ')) {
          isHeading = true; headingLevel = 1; cleanLine = line.slice(2);
        }

        // Parse Bullet Lists
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          isListItem = true;
          cleanLine = line.trim().slice(2);
        }

        // Parse Numbered Lists (1. 2. 3. etc)
        const numberedMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
        if (numberedMatch) {
          isNumberedList = true;
          numberedPrefix = numberedMatch[1] + '.';
          cleanLine = numberedMatch[2];
        }

        // ── Full-width reading highlight for the active (TTS) line ──
        const isActive = !visualMode && activeLine === idx && themeColor;
        const rowHighlight = isActive
          ? {
              backgroundColor: themeColor + '1A',
              borderLeftWidth: 2.5,
              borderLeftColor: themeColor,
              borderRadius: 4,
              paddingLeft: 6,
              marginHorizontal: -6,
              paddingHorizontal: 6,
            }
          : undefined;

        if (isHeading) {
          const headingStyle =
            headingLevel === 1 ? s.mdH1 :
            headingLevel === 2 ? s.mdH2 :
            headingLevel === 3 ? s.mdH3 :
            headingLevel === 4 ? s.mdH4 :
            s.mdH5;
          return (
            <Text key={idx} style={[headingStyle, s.mdLine, rowHighlight]}>
              {renderInlineStyles(cleanLine, `h${idx}`)}
            </Text>
          );
        }

        if (isListItem) {
          return (
            <View key={idx} style={[s.mdListItem, s.mdLine, rowHighlight]}>
              <Text style={s.mdBullet}>{'\u2022'}</Text>
              <Text style={s.mdListText}>
                {renderInlineStyles(cleanLine, `li${idx}`)}
              </Text>
            </View>
          );
        }

        if (isNumberedList) {
          return (
            <View key={idx} style={[s.mdListItem, s.mdLine, rowHighlight]}>
              <Text style={s.mdNumberedBullet}>{numberedPrefix}</Text>
              <Text style={s.mdListText}>
                {renderInlineStyles(cleanLine, `nl${idx}`)}
              </Text>
            </View>
          );
        }

        if (line.trim() === '') {
          return <View key={idx} style={s.mdLineSpacing} />;
        }

        if (/^(\*{3,}|-{3,}|_{3,})\s*$/.test(line.trim())) {
          return null;
        }

        return (
          <Text key={idx} style={[s.mdParagraph, s.mdLine, rowHighlight]}>
            {renderInlineStyles(line, `p${idx}`)}
          </Text>
        );
      })}
    </View>
  );
}
