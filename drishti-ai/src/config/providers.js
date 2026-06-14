// ============================================
// AI Providers Configuration
// नया provider add करना हो तो बस यहाँ add करो
// ============================================

export const PROVIDERS = {
  groq: {
    name: 'Groq',
    color: '#f97316',
    baseUrl: 'https://api.groq.com/openai/v1/chat/completions',
    modelsUrl: 'https://api.groq.com/openai/v1/models',
    defaultModel: 'llama-3.3-70b-versatile',
    type: 'openai',
    keyPrefix: 'gsk_',
    free: true,
    signupUrl: 'https://console.groq.com',
  },
  openai: {
    name: 'OpenAI',
    color: '#10b981',
    baseUrl: 'https://api.openai.com/v1/chat/completions',
    modelsUrl: 'https://api.openai.com/v1/models',
    defaultModel: 'gpt-4o-mini',
    type: 'openai',
    keyPrefix: 'sk-',
    free: false,
    signupUrl: 'https://platform.openai.com',
  },
  claude: {
    name: 'Claude',
    color: '#f59e0b',
    baseUrl: 'https://api.anthropic.com/v1/messages',
    modelsUrl: 'https://api.anthropic.com/v1/models',
    defaultModel: 'claude-haiku-4-5-20251001',
    type: 'claude',
    keyPrefix: 'sk-ant-',
    free: false,
    signupUrl: 'https://console.anthropic.com',
  },
  gemini: {
    name: 'Gemini',
    color: '#3b82f6',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
    modelsUrl: null,
    defaultModel: 'gemini-1.5-flash',
    type: 'gemini',
    keyPrefix: 'AIza',
    free: true,
    signupUrl: 'https://aistudio.google.com',
  },
  mistral: {
    name: 'Mistral',
    color: '#8b5cf6',
    baseUrl: 'https://api.mistral.ai/v1/chat/completions',
    modelsUrl: 'https://api.mistral.ai/v1/models',
    defaultModel: 'mistral-small-latest',
    type: 'openai',
    keyPrefix: null,
    free: false,
    signupUrl: 'https://console.mistral.ai',
  },
  openrouter: {
    name: 'OpenRouter',
    color: '#e879f9',
    baseUrl: 'https://openrouter.ai/api/v1/chat/completions',
    modelsUrl: 'https://openrouter.ai/api/v1/models',
    defaultModel: 'openai/gpt-4o-mini',
    type: 'openai',
    keyPrefix: 'sk-or-',
    free: false,
    signupUrl: 'https://openrouter.ai',
  },
  together: {
    name: 'Together AI',
    color: '#ec4899',
    baseUrl: 'https://api.together.xyz/v1/chat/completions',
    modelsUrl: 'https://api.together.xyz/v1/models',
    defaultModel: 'meta-llama/Llama-3-70b-chat-hf',
    type: 'openai',
    keyPrefix: null,
    free: false,
    signupUrl: 'https://api.together.ai',
  },
};

// Auto-detect provider from API key
export const detectProvider = (apiKey = '', providerName = '', endpoint = '') => {
  const key = apiKey.trim();
  const name = providerName.toLowerCase().trim();
  const url = endpoint.toLowerCase().trim();

  if (key.startsWith('gsk_') || name.includes('groq') || url.includes('groq.com'))
    return PROVIDERS.groq;
  if (key.startsWith('sk-ant-') || name.includes('claude') || name.includes('anthropic'))
    return PROVIDERS.claude;
  if (key.startsWith('AIza') || name.includes('gemini') || name.includes('google'))
    return PROVIDERS.gemini;
  if (key.startsWith('sk-or-') || name.includes('openrouter') || url.includes('openrouter'))
    return PROVIDERS.openrouter;
  if (key.startsWith('sk-') || name.includes('openai') || name.includes('gpt'))
    return PROVIDERS.openai;
  if (name.includes('mistral') || url.includes('mistral'))
    return PROVIDERS.mistral;
  if (name.includes('together') || url.includes('together'))
    return PROVIDERS.together;

  return null;
};

export const getProviderColor = (apiKey = '', providerName = '', endpoint = '') => {
  const provider = detectProvider(apiKey, providerName, endpoint);
  return provider?.color || '#00d4ff';
};

export default PROVIDERS;
