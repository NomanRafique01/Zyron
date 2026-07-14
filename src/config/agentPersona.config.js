/**
 * agentPersona.config.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Agent synthesis persona configuration for Zyron.
 * Defines the available persona modes that control the Writer agent's
 * synthesis style and the AsyncStorage key used to persist the selection.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** AsyncStorage key for persisting the active agent persona selection */
export const AGENT_PERSONA_KEY = 'zyron_AGENT_PERSONA';

/**
 * Available agent persona options.
 * Each entry maps to a persona instruction injected into the Writer agent's
 * synthesis prompt — see runAgentsPipeline in src/utils/agentLogic.js.
 */
export const AGENT_PERSONA_OPTIONS = [
  {
    key: 'balanced',
    label: 'Balanced',
    description: 'Synthesizes agent replies into a balanced, professional response.',
  },
  {
    key: 'creative',
    label: 'Creative',
    description: 'Explores innovative perspectives and engaging technical tones.',
  },
  {
    key: 'precise',
    label: 'Precise',
    description: 'Enforces correctness, strict constraints, and minimal fluff.',
  },
  {
    key: 'educator',
    label: 'Educator',
    description: 'Explains concepts step by step with practical clarity.',
  },
  {
    key: 'executive',
    label: 'Executive',
    description: 'Leads with conclusions in short decision-ready replies.',
  },
];
