import { ENDPOINTS } from '../../constants/endpoints';
import { PROVIDER_COLORS } from '../../constants/colors';

// ============================================
// Auto-detect provider from key/name/endpoint
// ============================================
export const detectProvider = (apiKey = '', name = '', endpoint = '') => {
  const k = apiKey.trim();
  const n = name.toLowerCase();
  const e = endpoint.toLowerCase();

  if (k.startsWith('gsk_') || n.includes('groq') || e.includes('groq'))
    return { id: 'groq', name: 'Groq', type: 'openai',
      url: ENDPOINTS.groq, modelsUrl: ENDPOINTS.groqModels,
      color: PROVIDER_COLORS.groq, free: true };

  if (k.startsWith('sk-ant-') || n.includes('claude') || n.includes('anthropic'))
    return { id: 'claude', name: 'Claude', type: 'claude',
      url: ENDPOINTS.claude, modelsUrl: ENDPOINTS.claudeModels,
      color: PROVIDER_COLORS.claude, free: false };

  if (k.startsWith('AIza') || n.includes('gemini') || n.includes('google'))
    return { id: 'gemini', name: 'Gemini', type: 'gemini',
      url: ENDPOINTS.gemini, modelsUrl: null,
      color: PROVIDER_COLORS.gemini, free: true };

  if (k.startsWith('sk-or-') || n.includes('openrouter') || e.includes('openrouter'))
    return { id: 'openrouter', name: 'OpenRouter', type: 'openai',
      url: ENDPOINTS.openrouter, modelsUrl: ENDPOINTS.openrouterModels,
      color: PROVIDER_COLORS.openrouter, free: false };

  if ((k.startsWith('sk-') && !k.startsWith('sk-ant-') && !k.startsWith('sk-or-'))
    || n.includes('openai') || n.includes('gpt'))
    return { id: 'openai', name: 'OpenAI', type: 'openai',
      url: ENDPOINTS.openai, modelsUrl: ENDPOINTS.openaiModels,
      color: PROVIDER_COLORS.openai, free: false };

  if (n.includes('mistral') || e.includes('mistral'))
    return { id: 'mistral', name: 'Mistral', type: 'openai',
      url: ENDPOINTS.mistral, modelsUrl: ENDPOINTS.mistralModels,
      color: PROVIDER_COLORS.mistral, free: false };

  if (n.includes('together') || e.includes('together'))
    return { id: 'together', name: 'Together AI', type: 'openai',
      url: ENDPOINTS.together, modelsUrl: ENDPOINTS.togetherModels,
      color: PROVIDER_COLORS.together, free: false };

  if (e) return { id: 'custom', name: name || 'Custom API',
    type: 'openai', url: endpoint, modelsUrl: null,
    color: PROVIDER_COLORS.default, free: false };

  return null;
};

// ============================================
// Fetch best model dynamically - NO hardcoding!
// ============================================
export const fetchBestModel = async (provider, apiKey) => {
  if (!provider?.modelsUrl || !apiKey) return null;
  try {
    const headers = provider.type === 'claude'
      ? { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' }
      : { Authorization: `Bearer ${apiKey}` };

    const res = await fetch(provider.modelsUrl, { headers });
    if (!res.ok) return null;
    const data = await res.json();

    let models = [];
    if (data.data) models = data.data.map(m => m.id || m.name);
    else if (data.models) models = data.models.map(m => m.name || m.id);
    else if (Array.isArray(data)) models = data.map(m => m.id || m.name);

    if (!models.length) return null;

    // Quality-based selection - no hardcoded model names!
    const preferred = [
      'opus', 'gpt-4', 'gemini-1.5-pro', 'gemini-2',
      'llama-3.3', 'llama-3.1-70b', 'mixtral-8x22b',
      'mistral-large', 'command-r-plus',
    ];
    const best = models.find(m =>
      preferred.some(p => m.toLowerCase().includes(p))
    );
    return best || models[0];
  } catch { return null; }
};

// ============================================
// Call any provider - universal format
// ============================================
const SYSTEM_PROMPT = `You are DRISHTI - helpful AI Assistant.
Always respond in the SAME language the user writes in.
Hindi → Hindi. English → English. Keep it concise.`;

export const callProvider = async (provider, apiKey, model, messages) => {
  if (!provider || !apiKey) throw new Error('No provider/key');

  if (provider.type === 'claude') {
    const res = await fetch(provider.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model || 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: messages.filter(m => m.role !== 'system'),
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Claude error');
    return data.content?.[0]?.text;
  }

  if (provider.type === 'gemini') {
    const m = model || 'gemini-1.5-flash';
    const res = await fetch(
      `${provider.url}/${m}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${SYSTEM_PROMPT}\n\n${
                messages.map(m => `${m.role}: ${m.content}`).join('\n')
              }`,
            }],
          }],
          generationConfig: { maxOutputTokens: 1000, temperature: 0.7 },
        }),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Gemini error');
    return data.candidates?.[0]?.content?.parts?.[0]?.text;
  }

  // OpenAI format - Groq, OpenAI, Mistral, OpenRouter, Together, Custom
  const url = provider.url;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'API error');
  return data.choices?.[0]?.message?.content;
};

// ============================================
// Slots management
// ============================================
export const getSlots = () => {
  try {
    return JSON.parse(localStorage.getItem('byok_keys') || '[]');
  } catch { return []; }
};

export const saveSlots = (slots) => {
  localStorage.setItem('byok_keys', JSON.stringify(slots));
};

export const getActiveSlots = () =>
  getSlots().filter(s => s.active && s.apiKey);

export const isBYOKEnabled = () =>
  localStorage.getItem('byok_enabled') === 'true';

export default {
  detectProvider, fetchBestModel, callProvider,
  getSlots, saveSlots, getActiveSlots, isBYOKEnabled,
};
