// Helper to group conversations by timeline timeframe
export const groupConversationsByDate = (list) => {
  const today = [];
  const yesterday = [];
  const older = [];
  
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);

  list.forEach(c => {
    const cDate = new Date(c.timestamp || Number(c.id));
    if (isNaN(cDate.getTime())) {
      older.push(c);
    } else if (cDate >= startOfToday) {
      today.push(c);
    } else if (cDate >= startOfYesterday) {
      yesterday.push(c);
    } else {
      older.push(c);
    }
  });

  return { today, yesterday, older };
};

export const DEFAULT_AGENT_CONFIGS = {
  reasoner: {
    name: 'Reasoner',
    provider: 'openrouter',
    model: 'nvidia/nemotron-3-super-120b-a12b:free',
    key: '',
    active: false,
    verified: false,
    keyStatus: 'inactive',
    shareKeyWith: null
  },
  coder: {
    name: 'Coder',
    provider: 'openrouter',
    model: 'cohere/north-mini-code:free',
    key: '',
    active: false,
    verified: false,
    keyStatus: 'inactive',
    shareKeyWith: null
  },
  vision: {
    name: 'Vision',
    provider: 'openrouter',
    model: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
    key: '',
    active: false,
    verified: false,
    keyStatus: 'inactive',
    shareKeyWith: null
  },
  writer: {
    name: 'Writer',
    provider: 'mistral',
    model: 'mistral-small-latest',
    key: '',
    active: false,
    verified: false,
    keyStatus: 'inactive',
    shareKeyWith: null
  }
};

// ─── Vision-capable model list ───────────────────────────────────────────────
// Used by InputBar to determine whether the Image attach option is enabled.
// Checks agentConfigs.vision.model (runtime state — not SecureStore).
export const VISION_CAPABLE_MODELS = [
  // OpenAI
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4-turbo',
  'gpt-4-vision-preview',
  // Anthropic
  'claude-3-opus',
  'claude-3-opus-20240229',
  'claude-3-sonnet',
  'claude-3-sonnet-20240229',
  'claude-3-haiku',
  'claude-3-haiku-20240307',
  'claude-3-5-sonnet',
  'claude-3-5-sonnet-20240620',
  'claude-3-5-haiku',
  'claude-3-5-haiku-latest',
  // Google
  'gemini-pro-vision',
  'gemini-1.5-pro',
  'gemini-1.5-flash',
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  // OpenRouter multimodal (provider/model-id form)
  'google/gemini-pro-vision',
  'google/gemini-1.5-pro',
  'google/gemini-1.5-flash',
  'google/gemini-2.0-flash',
  'google/gemini-2.5-flash',
  'anthropic/claude-3-opus',
  'anthropic/claude-3-opus-20240229',
  'anthropic/claude-3-sonnet',
  'anthropic/claude-3-haiku',
  'anthropic/claude-3-5-sonnet',
  'anthropic/claude-3-5-haiku',
  'openai/gpt-4o',
  'openai/gpt-4o-mini',
  'openai/gpt-4-turbo',
  'openai/gpt-4-vision-preview',
  'mistralai/pixtral-12b',
  'mistralai/pixtral-large-2411',
  'qwen/qwen-vl-plus',
  'qwen/qwen-vl-max',
  'meta-llama/llama-3.2-11b-vision-instruct',
  'meta-llama/llama-3.2-90b-vision-instruct',
  'x-ai/grok-vision-beta',
  'x-ai/grok-2-vision-1212',
];

export const OPENROUTER_MODEL_PRESETS = [
  'nvidia/nemotron-3-super-120b-a12b:free',
  'cohere/north-mini-code:free',
  'nvidia/nemotron-3-ultra-550b-a55b:free',
  'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
];

// ═══════════════════════════════════════════════════════
// ROOT ENTRY PROVIDER
// ═══════════════════════════════════════════════════════
export const DEFAULT_USER_PROFILE = {
  displayName: '',
  role: 'Developer',
  tone: 'Concise',
  language: 'English',
  workspaceGoal: '',
  codingStyle: 'Practical',
  detailLevel: 'Balanced',
  privacyMode: true,
  useProfileContext: true,
  hasCompletedWelcome: false
};

export const PROVIDER_DEFAULT_MODELS = {
  openrouter: 'nvidia/nemotron-3-super-120b-a12b:free',
  openai: 'gpt-4o-mini',
  anthropic: 'claude-3-5-haiku-latest',
  mistral: 'mistral-small-latest',
  gemini: 'gemini-2.5-flash',
  deepseek: 'deepseek-chat',
  groq: 'llama-3.3-70b-versatile',
  glm: 'glm-4-flash',
};

// Model preset lists for the 3 new providers — used by the Settings UI
export const DEEPSEEK_MODEL_PRESETS = [
  'deepseek-chat',
  'deepseek-reasoner',
];

export const GROQ_MODEL_PRESETS = [
  'llama-3.3-70b-versatile',
  'llama3-70b-8192',
  'mixtral-8x7b-32768',
];

export const GLM_MODEL_PRESETS = [
  'glm-4-flash',
  'glm-4-air',
  'glm-4-plus',
];

export const normalizeAgentConfigs = (configs = {}) => {
  return Object.keys(DEFAULT_AGENT_CONFIGS).reduce((acc, role) => {
    const saved = configs[role] || {};
    acc[role] = {
      ...DEFAULT_AGENT_CONFIGS[role],
      ...saved,
      keyStatus: saved.keyStatus || (saved.active ? (saved.verified ? 'active' : 'unverified') : 'inactive'),
      shareKeyWith: saved.shareKeyWith || null
    };
    return acc;
  }, {});
};

export const normalizeUserProfile = (profile = {}, hasStoredProfile = true) => ({
  ...DEFAULT_USER_PROFILE,
  ...profile,
  privacyMode: profile.privacyMode !== false,
  useProfileContext: profile.useProfileContext !== false,
  hasCompletedWelcome: profile.hasCompletedWelcome ?? hasStoredProfile
});

export const getLocalWelcomeGreeting = (name = '', date = new Date()) => {
  const nickname = name.trim();
  const firstName = nickname ? nickname.split(/\s+/)[0] : '';
  const hour = date.getHours();
  const day = date.toLocaleDateString(undefined, { weekday: 'long' });

  let period;

  if (hour >= 0 && hour < 4) {
    period = 'Night Owl';
  } else if (hour >= 4 && hour < 6) {
    period = "It's Dawn";
  } else if (hour >= 6 && hour < 7) {
    period = 'Rise and Shine';
  } else if (hour >= 7 && hour < 9) {
    period = 'Early Bird';
  } else if (hour >= 9 && hour < 12) {
    period = `Happy ${day}`;
  } else if (hour >= 12 && hour < 13) {
    period = 'High Noon';
  } else if (hour >= 13 && hour < 17) {
    period = 'Good Afternoon';
  } else if (hour >= 17 && hour < 18) {
    period = 'Golden Hour';
  } else if (hour >= 18 && hour < 20) {
    period = 'Good Evening';
  } else if (hour >= 20 && hour < 22) {
    period = 'Winding Down';
  } else {
    period = 'Burning Midnight Oil';
  }

  return {
    title: firstName ? `${period}, ${firstName}` : period,
    subtitle: 'How can I help you?'
  };
};
