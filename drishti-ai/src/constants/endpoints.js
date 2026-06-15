export const ENGINE_BASE = 'https://drishti-engine.onrender.com';

export const ENDPOINTS = {
  // Chat
  chat: `${ENGINE_BASE}/chat`,
  history: `${ENGINE_BASE}/history`,

  // Auth
  register: `${ENGINE_BASE}/user/register`,
  login: `${ENGINE_BASE}/user/login`,
  profile: `${ENGINE_BASE}/user/profile`,

  // Vision & Search
  vision: `${ENGINE_BASE}/vision`,
  search: `${ENGINE_BASE}/search`,

  // Config
  rateLimits: `${ENGINE_BASE}/config/rate-limits`,
  stats: `${ENGINE_BASE}/config/stats`,

  // Health
  health: `${ENGINE_BASE}/health`,
  ping: `${ENGINE_BASE}/ping`,

  // External APIs
  groq: 'https://api.groq.com/openai/v1/chat/completions',
  groqModels: 'https://api.groq.com/openai/v1/models',
  openai: 'https://api.openai.com/v1/chat/completions',
  openaiModels: 'https://api.openai.com/v1/models',
  claude: 'https://api.anthropic.com/v1/messages',
  claudeModels: 'https://api.anthropic.com/v1/models',
  gemini: 'https://generativelanguage.googleapis.com/v1beta/models',
  mistral: 'https://api.mistral.ai/v1/chat/completions',
  mistralModels: 'https://api.mistral.ai/v1/models',
  openrouter: 'https://openrouter.ai/api/v1/chat/completions',
  openrouterModels: 'https://openrouter.ai/api/v1/models',
  together: 'https://api.together.xyz/v1/chat/completions',
  togetherModels: 'https://api.together.xyz/v1/models',
  tavily: 'https://api.tavily.com/search',
};

export const TIMEOUTS = {
  fast: 10000,
  normal: 30000,
  slow: 60000,
  engine: 35000,
};

export default ENDPOINTS;
