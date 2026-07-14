import C from '../config/colors.config';

const socketStyles = {
  agentSocketGroup: {
    marginBottom: 0,
  },
  agentSocketLabel: {
    color: C.purpleSoft,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 7,
    marginLeft: 2,
  },
  socketCardShell: {
    position: 'relative',
    marginBottom: 0,
  },
  accordionCard: {
    backgroundColor: '#11111A',
    borderWidth: 1.5,
    borderColor: '#20202F',
    borderRadius: 12,
    overflow: 'hidden',
  },
  socketLiveBorder: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderWidth: 1,
    borderRadius: 12,
  },
  accordionHeader: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#141422',
  },
  accordionIcon: {
    fontSize: 20,
    marginRight: 2,
  },
  accordionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  accordionSub: {
    fontSize: 9,
    color: '#8A8A9D',
    marginTop: 2,
  },
  accordionBody: {
    padding: 14,
    backgroundColor: '#0C0C12',
    borderTopWidth: 1,
    borderTopColor: '#1B1B2A',
  },
  socketBodyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1B1B2A',
  },
  socketBodyTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  socketBodySub: {
    color: '#7F7F92',
    fontSize: 9,
    marginTop: 2,
  },
  socketPanelCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#141420',
    borderWidth: 1,
    borderColor: '#262638',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 8,
    fontWeight: '800',
  },
  statusVerified: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  statusUnverified: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  statusExhausted: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  statusInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: '#333344',
  },
  providerTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  providerTabBtn: {
    flexGrow: 1,
    minWidth: 82,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#141420',
    borderWidth: 1,
    borderColor: '#222235',
  },
  providerTabBtnActive: {
    backgroundColor: C.purple,
    borderColor: C.purple,
  },
  providerTabBtnText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8A8A9D',
  },
  providerTabBtnTextActive: {
    color: '#FFFFFF',
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
    marginBottom: 12,
  },
  presetBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#141420',
    borderWidth: 1,
    borderColor: '#222235',
  },
  presetBadgeActive: {
    backgroundColor: 'rgba(123, 47, 255, 0.2)',
    borderColor: C.purple,
  },
  presetBadgeText: {
    fontSize: 9,
    color: '#8A8A9D',
  },
  presetBadgeTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  toggleSocketBtnInline: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    minWidth: 80,
    minHeight: 38,
  },
  toggleSocketActive: {
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  toggleSocketInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: '#222230',
  },
  toggleSocketBtnText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subInputLabel: {
    fontSize: 9,
    color: '#8A8A9D',
    marginBottom: 6,
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#E2E2E9',
    marginBottom: 6,
  },
  keyTextInput: {
    backgroundColor: '#050508',
    borderWidth: 1,
    borderColor: '#1E1E2C',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 12,
    marginBottom: 12,
  },
  verifyAddBtn: {
    backgroundColor: C.purple,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  verifyAddBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  testAlert: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  testSuccess: {
    backgroundColor: 'rgba(74, 222, 128, 0.06)',
    borderColor: 'rgba(74, 222, 128, 0.25)',
  },
  testFailure: {
    backgroundColor: 'rgba(239, 68, 68, 0.06)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  testAlertTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FCA5A5',
    marginBottom: 4,
  },
  testAlertText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#F3F4F6',
    lineHeight: 14,
  },
  missingKeyBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.95)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  missingKeyText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  activateEngineBtn: {
    minWidth: 164,
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  activateEngineBtnActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: '#10B981',
  },
  activateEngineBtnInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: '#333344',
  },
  activateEngineBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activateEngineBtnIcon: {
    color: '#CFCFE6',
    fontSize: 11,
    fontWeight: '900',
  },
  activateEngineBtnText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  linkedBadge: {
    backgroundColor: 'rgba(123, 47, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(123, 47, 255, 0.25)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 4,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  linkedBadgeText: {
    color: '#A78BFA',
    fontSize: 9,
    fontWeight: '700',
  },
  linkedBadgeHeader: {
    backgroundColor: 'rgba(167, 139, 250, 0.12)',
    borderWidth: 1,
    borderColor: '#A78BFA',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginRight: 6,
    alignSelf: 'center',
  },
  linkedBadgeHeaderText: {
    color: '#A78BFA',
    fontSize: 8,
    fontWeight: '800',
  },

  // ─── Agent Sockets Banner (wraps Agent 1-4 in one container) ───────────────────────────
  agentSocketsBanner: {
    backgroundColor: '#0C0C12',
    borderWidth: 1,
    borderColor: '#20202F',
    borderRadius: 14,
    padding: 10,
    marginTop: -4,
    marginBottom: 16,
  },
  agentSocketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#13131C',
    borderWidth: 1,
    borderColor: '#242436',
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  agentSocketRowLast: {
    marginBottom: 0,
  },
  agentSocketRowOpen: {
    borderColor: 'rgba(123, 47, 255, 0.45)',
    backgroundColor: '#161622',
  },
  agentSocketRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  agentSocketIconBox: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  agentSocketTextBlock: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  agentSocketTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  agentSocketTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  agentSocketSub: {
    color: '#8A8A9D',
    fontSize: 9.5,
    marginTop: 2,
  },
  agentSocketStatusPill: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginLeft: 8,
  },
  agentSocketStatusPillText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  agentSocketLinkBadge: {
    marginLeft: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
    flexShrink: 0,
  },
  agentSocketLinkBadgeText: {
    fontSize: 7,
    fontWeight: '900',
  },
};

// ─── Agent Accent Color Map ───────────────────────────
// Central color registry for each agent role — used for visual identity across the UI
export const AGENT_ACCENT_COLORS = {
  reasoner: '#A78BFA',  // Soft purple
  coder: '#60A5FA',  // Blue
  vision: '#6EE7B7',  // Green
  writer: '#FBBF24',  // Amber
};

/**
 * Resolves the visual accent color for a given agent socket.
 * If the agent is a "child" (receiving a shared key from a source), it inherits the source's accent color.
 * Otherwise, returns the agent's own default accent color.
 *
 * @param {string} role - The agent role ('reasoner', 'coder', 'vision', 'writer')
 * @param {object} agentConfigs - The full agent configs object (all roles)
 * @returns {string} The resolved hex accent color
 */
export const getSocketAccentColor = (role, agentConfigs) => {
  if (!agentConfigs || !role) return AGENT_ACCENT_COLORS[role] || '#A78BFA';

  const parentRole = agentConfigs[role]?.shareKeyWith;
  if (parentRole && AGENT_ACCENT_COLORS[parentRole]) {
    return AGENT_ACCENT_COLORS[parentRole];
  }

  return AGENT_ACCENT_COLORS[role] || '#A78BFA';
};

export default socketStyles;
