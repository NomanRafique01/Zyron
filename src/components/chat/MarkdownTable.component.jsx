import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Animated } from 'react-native';
import { AGENT_KEYS, AGENT_ATTRIBUTION, LARGE_TABLE_COL_THRESHOLD, COL_WIDTH_MIN, COL_WIDTH_MAX, COL_CHARS_SHORT, COL_CHARS_LONG, MIN_THUMB_RATIO } from './chatBubble.constants.js';
import { renderInlineStyles } from './chatBubble.renderers.jsx';
import { s } from './chatBubble.styles.js';

/**
 * Compute per-column widths for wide/scrollable mode.
 * Linearly interpolates between COL_WIDTH_MIN and COL_WIDTH_MAX based on
 * the longest string in each column.
 */
export function computeColWidths(headers, rows) {
  return headers.map((h, ci) => {
    let maxLen = String(h ?? '').length;
    for (const row of rows) {
      const cellLen = String(row[ci] ?? '').length;
      if (cellLen > maxLen) maxLen = cellLen;
    }
    const clamped = Math.min(Math.max(maxLen, COL_CHARS_SHORT), COL_CHARS_LONG);
    const t = (clamped - COL_CHARS_SHORT) / (COL_CHARS_LONG - COL_CHARS_SHORT);
    return Math.round(COL_WIDTH_MIN + t * (COL_WIDTH_MAX - COL_WIDTH_MIN));
  });
}

// ─── Markdown Table Renderer ─────────────────────────
//
// COLUMN-COUNT path  (colCount >= LARGE_TABLE_COL_THRESHOLD):
//   Always scrollable. Each column gets a computed fixed width.
//   Live animated scrollbar sits outside the ScrollView.
//
// OVERFLOW-DETECTION path  (colCount < LARGE_TABLE_COL_THRESHOLD):
//   Render normally first. If the unconstrained header row overflows the
//   visible container we promote to wide/scrollable mode.
//
export default function MarkdownTable({ headers, rows, visualMode, blockIndex }) {
  const agentKey = AGENT_KEYS[blockIndex % AGENT_KEYS.length];
  const attr     = AGENT_ATTRIBUTION[agentKey];

  const colCount = headers.length;

  const [wideMode, setWideMode] = useState(colCount >= LARGE_TABLE_COL_THRESHOLD);

  const [containerW, setContainerW] = useState(0);
  const [naturalW,   setNaturalW]   = useState(0);
  const detectionDone = useRef(false);

  useEffect(() => {
    if (detectionDone.current) return;
    if (wideMode) { detectionDone.current = true; return; }
    if (containerW > 0 && naturalW > 0) {
      detectionDone.current = true;
      if (naturalW > containerW + 2) {
        setWideMode(true);
      }
    }
  }, [containerW, naturalW, wideMode]);

  const colWidths = React.useMemo(
    () => computeColWidths(headers, rows),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const scrollX      = useRef(new Animated.Value(0)).current;
  const [trackWidth,   setTrackWidth]   = useState(0);
  const [contentWidth, setContentWidth] = useState(0);

  const outerStyle = [
    s.tableOuter,
    visualMode && { borderColor: attr.color, borderWidth: 1.5, backgroundColor: attr.bg },
  ];

  const headerCellStyle = (ci) => wideMode
    ? [s.mdTableHeaderCell, s.mdTableHeaderCellCenter, { width: colWidths[ci], flex: undefined }]
    : [s.mdTableHeaderCell, s.mdTableHeaderCellCenter, colCount === 1 ? s.mdTableFirstCol : null];

  const dataCellStyle = (ci) => wideMode
    ? [s.mdTableCell, { width: colWidths[ci], flex: undefined }]
    : [s.mdTableCell, ci === 0 && s.mdTableFirstCol];

  const headerRow = (
    <View style={[s.mdTableHeaderRow, wideMode && s.mdTableHeaderRowWide]}>
      {headers.map((h, i) => (
        <View key={i} style={headerCellStyle(i)}>
          <Text style={[s.mdTableHeaderText, s.mdTableHeaderTextCenter]} numberOfLines={0}>
            {renderInlineStyles(h, `th${blockIndex}-${i}`)}
          </Text>
        </View>
      ))}
    </View>
  );

  const dataRows = rows.map((row, ri) => (
    <View key={ri} style={[s.mdTableRow, wideMode && s.mdTableRowWide, ri % 2 === 0 && s.mdTableRowAlt]}>
      {row.map((cell, ci) => (
        <View key={ci} style={dataCellStyle(ci)}>
          <Text style={s.mdTableCellText} numberOfLines={0}>
            {renderInlineStyles(cell, `td${blockIndex}-${ri}-${ci}`)}
          </Text>
        </View>
      ))}
    </View>
  ));

  // ── Wide / scrollable path ──────────────────────────────────────────────
  if (wideMode) {
    const scrollable = contentWidth > trackWidth && trackWidth > 0;
    const thumbRatio = scrollable
      ? Math.min(Math.max(trackWidth / contentWidth, MIN_THUMB_RATIO), 1)
      : 1;
    const thumbW      = thumbRatio * trackWidth;
    const maxScrollX  = Math.max(contentWidth - trackWidth, 1);
    const thumbTravel = Math.max(trackWidth - thumbW, 0);

    const thumbTranslateX = scrollX.interpolate({
      inputRange:  [0, maxScrollX],
      outputRange: [0, thumbTravel],
      extrapolate: 'clamp',
    });

    return (
      <View style={outerStyle}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled={true}
          bounces={false}
          style={s.tableScrollView}
          contentContainerStyle={{ flexDirection: 'column' }}
          scrollEventThrottle={16}
          onScroll={(e) => scrollX.setValue(e.nativeEvent.contentOffset.x)}
          onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
          onContentSizeChange={(w) => setContentWidth(w)}
        >
          {headerRow}
          {dataRows}
        </ScrollView>

        {scrollable && (
          <View style={[s.tableScrollTrack, { pointerEvents: 'none' }]}>
            <Animated.View
              style={[
                s.tableScrollThumb,
                { width: thumbW, transform: [{ translateX: thumbTranslateX }] },
              ]}
            />
          </View>
        )}
      </View>
    );
  }

  // ── Static path — with overflow detection ──────────────────────────────
  return (
    <View
      style={outerStyle}
      onLayout={(e) => setContainerW(e.nativeEvent.layout.width)}
    >
      {headerRow}
      {dataRows}

      {/* Invisible measuring row — renders at natural (unconstrained) width */}
      {!detectionDone.current && (
        <View
          style={{ position: 'absolute', opacity: 0, flexDirection: 'row', pointerEvents: 'none' }}
          onLayout={(e) => setNaturalW(e.nativeEvent.layout.width)}
        >
          {headers.map((h, i) => (
            <View key={i} style={[s.mdTableHeaderCell, { flexShrink: 0 }]}>
              <Text style={s.mdTableHeaderText} numberOfLines={1}>
                {typeof h === 'string' ? h : ''}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
