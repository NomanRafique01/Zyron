import { StyleSheet } from 'react-native';
import C from '../../config/colors.config';

// ─── Table, legend and token-panel styles ─────────────
export const tableStyles = StyleSheet.create({
  // ─── Markdown Table ───────────────────────────────
  tableOuter: {
    marginVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#222232',
    backgroundColor: '#0D0D16',
    overflow: 'hidden',
    width: '100%',
  },
  tableScrollView: {
    flexGrow: 0,
  },
  tableScrollTrack: {
    height: 3,
    marginHorizontal: 10,
    marginTop: 5,
    marginBottom: 8,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.07)',
    overflow: 'hidden',
  },
  tableScrollThumb: {
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(123, 47, 255, 0.6)',
  },
  mdTableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#161625',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A3E',
    width: '100%',
  },
  mdTableHeaderRowWide: {
    width: undefined,
  },
  mdTableHeaderCell: {
    paddingVertical: 9,
    paddingHorizontal: 10,
    flex: 1,
  },
  mdTableHeaderCellCenter: {
    alignItems: 'center',
  },
  mdTableHeaderTextCenter: {
    textAlign: 'center',
  },
  mdTableHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.purpleSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    flexShrink: 1,
  },
  mdTableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A28',
    width: '100%',
  },
  mdTableRowWide: {
    width: undefined,
  },
  mdTableRowAlt: {
    backgroundColor: 'rgba(255, 255, 255, 0.018)',
  },
  mdTableCell: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    flex: 1,
    justifyContent: 'flex-start',
  },
  mdTableCellText: {
    fontSize: 12.5,
    color: '#D0D0E0',
    lineHeight: 18,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  mdTableFirstCol: {
    flex: 1.6,
  },

  // ─── Agent Attribution Legend ─────────────────────
  legendCard: {
    marginTop: 12,
    backgroundColor: '#0F0F16',
    borderWidth: 1,
    borderColor: '#222232',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  legendContent: {
    flexDirection: 'column',
    gap: 6,
  },
  legendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#222232',
    paddingBottom: 4,
  },
  legendTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: C.textDim,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  legendCloseBtn: {
    padding: 2,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingTop: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 10,
    color: '#A7A7C0',
    fontWeight: '500',
  },

  // ─── Token Usage Panel ────────────────────────────
  tokenTable: {
    marginTop: 10,
    borderWidth: 1.5,
    borderRadius: 10,
    backgroundColor: '#0B0B10',
    padding: 10,
    gap: 5,
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  tokenTableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A2A',
  },
  tokenTableTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  tokenBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  tokenBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#222232',
    paddingBottom: 5,
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    alignItems: 'center',
  },
  tableRowAlt: {
    backgroundColor: 'rgba(255, 255, 255, 0.015)',
    borderRadius: 4,
  },
  tableCell: {
    fontSize: 11,
    color: '#A7A7C0',
  },
  colAgent: {
    flex: 1.6,
  },
  colVal: {
    flex: 1,
    textAlign: 'right',
  },
  cellAgentName: {
    fontWeight: '600',
    color: '#D2D2E0',
  },
  cellTotalVal: {
    color: '#D2D2E0',
  },
  tableTotalRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#222232',
    paddingTop: 5,
    marginTop: 3,
  },
  cellTotalLabel: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cellTotalFinal: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
