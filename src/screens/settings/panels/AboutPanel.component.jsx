/**
 * AboutPanel.component.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * About Zyron information panel inside Settings.
 * Pure display — describes multi-agent architecture, team roster, key sharing,
 * model routing, coordination activation, and local-first design philosophy.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import { View, Text } from 'react-native';
import s from '../../../styles/app.styles';

export default function AboutPanel() {
  return (
    <View style={s.infoPanel}>
      <Text style={s.infoPanelTitle}>Overview</Text>
      <Text style={s.infoPanelText}>
        Zyron is the first Android-based multi-agent coordination app — purpose-built to orchestrate specialized agents that deliver thorough, multi-perspective answers from a single conversation. Rather than relying on a single model pass, Zyron coordinates 24 specialized agents across 6 expert teams in sequence — producing responses suited for planning, code generation, historical research, scientific analysis, creative work, and complex problem solving.
      </Text>

      <Text style={s.infoPanelTitle}>Multi-Agent Coordination</Text>
      <Text style={s.infoPanelText}>
        Zyron's agent coordination system distributes cognitive work across 24 specialized agents organized into 6 teams. Each team brings a distinct area of expertise to every response:{'\n\n'}
        Financers — Analyst, Adviser, Auditor, Reporter: the default finance team covering financial analysis, strategic advice, audit & compliance, and structured financial reporting.{'\n\n'}
        Code Forge — Architect, Engineer, Debugger, Technical Writer: a deep-focus engineering team built for software design, code quality, and technical documentation.{'\n\n'}
        Mega Minds — Scholar, Analyst, Synthesizer, Editor: a knowledge team that researches, analyses, and distils complex information into precise, well-structured answers.{'\n\n'}
        Creative Thinkers — Strategist, Creator, Curator, Narrator: an ideation team that drives strategy, originality, content curation, and compelling storytelling.{'\n\n'}
        Scientists — Theorist, Experimenter, Modeler, Reporter: a scientific team that tackles hypothesis, experimental reasoning, modelling, and clear scientific reporting.{'\n\n'}
        Historians — Archivist, Contextualist, Cartographer, Biographer: a research team specializing in historical context, archival depth, geographic insight, and biographical narrative.{'\n\n'}
        Every active team routes all four of its agents through the coordination pipeline in sequence, with each agent contributing its specialized perspective before a unified response is produced.
      </Text>

      <Text style={s.infoPanelTitle}>Shared provider credentials</Text>
      <Text style={s.infoPanelText}>
        Agent linking allows one configured agent to share its provider, model, and API key with another agent in the active team. This is ideal when a single provider account should power multiple agents without re-entering credentials. Linked agents clearly display their shared state, inherit settings from the source configuration, and can be unlinked at any time to restore independent provider and model selections.
      </Text>

      <Text style={s.infoPanelTitle}>Flexible model routing</Text>
      <Text style={s.infoPanelText}>
        Each of the four active agent sockets can be connected to your preferred provider, model, and API key independently. OpenRouter enables broad model access through a unified endpoint. Direct integrations are supported for OpenAI, Anthropic, Mistral, Gemini, DeepSeek, Groq, and GLM (Zhipu AI) — each with dedicated model families. Every agent maintains its own activation state, allowing you to test, pause, or reconfigure individual roles without disrupting the rest of your workspace.
      </Text>

      <Text style={s.infoPanelTitle}>Agent Coordination activation</Text>
      <Text style={s.infoPanelText}>
        The Agent Coordination system engages only when all four active agent sockets are properly configured and verified. Key verification confirms provider access before a credential is saved for use, while activation determines whether an agent participates in live responses. When coordination is running, sensitive configuration controls are locked to prevent accidental changes during active sessions.
      </Text>

      <Text style={s.infoPanelTitle}>Local-first design</Text>
      <Text style={s.infoPanelText}>
        Zyron is built on a local-first architecture. Chat history, profile preferences, security locks, and agent configuration remain on your device at all times. API keys are stored in encrypted platform credential storage via SecureStore. Provider requests are initiated exclusively through the agents you configure and activate — giving you direct, transparent control over how and when your data leaves the device.
      </Text>
    </View>
  );
}
