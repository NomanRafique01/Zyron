/**
 * agentIconOptions.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralised catalogue of all agent icon assets.
 *
 * Each entry maps a stable string key to its require() asset source.
 * Used by:
 *   • AgentBuilderPanel  — icon picker UI
 *   • AgentIcon.component — runtime icon resolution for custom agents
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const ICON_OPTIONS = [
  // coders
  { key: 'debugger',      src: require('../../assets/agent-icons/coders/debugger.png') },
  { key: 'designer',      src: require('../../assets/agent-icons/coders/designer.png') },
  { key: 'executor',      src: require('../../assets/agent-icons/coders/executor.png') },
  { key: 'programmer',    src: require('../../assets/agent-icons/coders/programmer.png') },
  // creative
  { key: 'creator',       src: require('../../assets/agent-icons/creative/creator.png') },
  { key: 'curator',       src: require('../../assets/agent-icons/creative/curator.png') },
  { key: 'narrator',      src: require('../../assets/agent-icons/creative/narrator.png') },
  { key: 'strategist',    src: require('../../assets/agent-icons/creative/strategist.png') },
  // financers
  { key: 'accountant',    src: require('../../assets/agent-icons/financers/accountant.png') },
  { key: 'adviser',       src: require('../../assets/agent-icons/financers/adviser.png') },
  { key: 'auditor',       src: require('../../assets/agent-icons/financers/auditor.png') },
  { key: 'investor',      src: require('../../assets/agent-icons/financers/investor.png') },
  // historians
  { key: 'archivist',     src: require('../../assets/agent-icons/historians/archivist.png') },
  { key: 'biographer',    src: require('../../assets/agent-icons/historians/biographer.png') },
  { key: 'cartographer',  src: require('../../assets/agent-icons/historians/cartographer.png') },
  { key: 'contextualist', src: require('../../assets/agent-icons/historians/contextualist.png') },
  // mega-minds
  { key: 'analyst',       src: require('../../assets/agent-icons/mega-minds/analyst.png') },
  { key: 'editor',        src: require('../../assets/agent-icons/mega-minds/editor.png') },
  { key: 'scholar',       src: require('../../assets/agent-icons/mega-minds/scholar.png') },
  { key: 'synthesizer',   src: require('../../assets/agent-icons/mega-minds/synthesizer.png') },
  // scientists
  { key: 'experimenter',  src: require('../../assets/agent-icons/scientists/experimenter.png') },
  { key: 'modeler',       src: require('../../assets/agent-icons/scientists/modeler.png') },
  { key: 'reporter',      src: require('../../assets/agent-icons/scientists/reporter.png') },
  { key: 'theorist',      src: require('../../assets/agent-icons/scientists/theorist.png') },
];
