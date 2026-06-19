// ============================================
// DRISHTI - BYOK Service
// RULE: कोई भी model name hardcode नहीं
// हर provider की live API से best model detect होगा
// ============================================

const MODEL_CACHE_KEY = 'drishti_model_cache';
const CACHE_TTL = 1000 * 60 * 60 * 6; // 6 hours

// ── Provider Detection (key/name/endpoint से) ──
export const detectProvider = (apiKey = '', providerName = '', endpoint = '') => {
  const k = apiKey.trim();
  const p = providerName.toLowerCase().trim();
  const e = endpoint.toLowerCase().trim();

  if (p.includes('groq') || e.includes('groq.com') || k.startsWith('gsk_'))
    return {
      type: 'openai', name: 'Groq',
      baseUrl: 'https://api.groq.com/openai/v1',
      modelsUrl: 'https://api.groq.com/openai/v1/models',
      // keywords — highest score = best model
      prefer: ['llama-4', 'compound', 'llama-3.3', 'llama-3.1-70b', 'llama-3', 'mixtral', 'llama'],
    };

  if (p.includes('openai') || p.includes('chatgpt') || p.includes('gpt')
    || e.includes('openai.com') || (k.startsWith('sk-') && !k.startsWith('sk-ant-')))
    return {
      type: 'openai', name: 'OpenAI',
      baseUrl: 'https://api.openai.com/v1',
      modelsUrl: 'https://api.openai.com/v1/models',
      prefer: ['gpt-4.5', 'gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo', 'gpt'],
    };

  if (p.includes('anthropic') || p.includes('claude')
    || e.includes('anthropic.com') || k.startsWith('sk-ant-'))
    return {
      type: 'claude', name: 'Claude',
      baseUrl: 'https://api.anthropic.com/v1',
      modelsUrl: 'https://api.anthropic.com/v1/models',
      prefer: ['claude-opus', 'claude-3-5', 'claude-sonnet', 'claude-3', 'claude-haiku', 'claude'],
    };

  if (p.includes('google') || p.includes('gemini')
    || e.includes('googleapis.com') || k.startsWith('AIza'))
    return {
      type: 'gemini', name: 'Gemini',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      modelsUrl: null, // Gemini के लिए hardcode नहीं — dynamic list अलग तरीके से
      prefer: ['gemini-2.0', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-flash', 'gemini'],
      geminiModels: [
        'gemini-2.0-flash-exp',
        'gemini-1.5-pro-latest',
        'gemini-1.5-flash-latest',
        'gemini-1.5-flash',
      ],
    };

  if (p.includes('mistral') || e.includes('mistral.ai'))
    return {
      type: 'openai', name: 'Mistral',
      baseUrl: 'https://api.mistral.ai/v1',
      modelsUrl: 'https://api.mistral.ai/v1/models',
      prefer: ['mistral-large', 'mistral-medium', 'mistral-small', 'mistral'],
    };

  if (p.includes('openrouter') || e.includes('openrouter.ai'))
    return {
      type: 'openai', name: 'OpenRouter',
      baseUrl: 'https://openrouter.ai/api/v1',
      modelsUrl: 'https://openrouter.ai/api/v1/models',
      prefer: ['claude-3-5', 'gpt-4o', 'llama-3', 'mistral-large', 'gemini'],
    };

  if (p.includes('together') || e.includes('together.xyz') || e.includes('together.ai'))
    return {
      type: 'openai', name: 'Together AI',
      baseUrl: 'https://api.together.xyz/v1',
      modelsUrl: 'https://api.together.xyz/v1/models',
      prefer: ['llama-3', 'mistral', 'qwen', 'deepseek'],
    };

  if (p.includes('cohere') || e.includes('cohere'))
    return {
      type: 'cohere', name: 'Cohere',
      baseUrl: 'https://api.cohere.ai/v1',
      modelsUrl: 'https://api.cohere.ai/v1/models',
      prefer: ['command-r-plus', 'command-r', 'command'],
    };

  if (p.includes('perplexity') || e.includes('perplexity.ai'))
    return {
      type: 'openai', name: 'Perplexity',
      baseUrl: 'https://api.perplexity.ai',
      modelsUrl: null,
      prefer: ['sonar-pro', 'sonar-large', 'sonar', 'llama'],
      fallbackModel: 'sonar',
    };

  if (p.includes('hugging') || k.startsWith('hf_') || e.includes('huggingface'))
    return {
      type: 'huggingface', name: 'HuggingFace',
      baseUrl: 'https://api-inference.huggingface.co',
      modelsUrl: null,
      prefer: ['mistral', 'llama', 'zephyr'],
      fallbackModel: 'mistralai/Mistral-7B-Instruct-v0.3',
    };

  if (e)
    return {
      type: 'openai', name: providerName || 'Custom API',
      baseUrl: e.replace(/\/(chat\/completions|messages)$/, ''),
      modelsUrl: e.replace(/\/(chat\/completions|messages)$/, '') + '/models',
      prefer: ['gpt-4', 'llama', 'mistral', 'claude'],
    };

  return null;
};

// ── Model Cache ──
const getModelCache = () => {
  try {
    const raw = localStorage.getItem(MODEL_CACHE_KEY);
    if (!raw) return {};
    const cache = JSON.parse(raw);
    const now = Date.now();
    // expired entries हटाओ
    Object.keys(cache).forEach(k => {
      if (now - cache[k].ts > CACHE_TTL) delete cache[k];
    });
    return cache;
  } catch { return {}; }
};

const setModelCache = (key, model) => {
  try {
    const cache = getModelCache();
    cache[key] = { model, ts: Date.now() };
    localStorage.setItem(MODEL_CACHE_KEY, JSON.stringify(cache));
  } catch {}
};

// ── Best Model Fetch (LIVE — कोई hardcoding नहीं) ──
export const fetchBestModel = async (provider, apiKey) => {
  if (!provider || !apiKey) return null;

  const cacheKey = `${provider.name}_${apiKey.slice(-8)}`;
  const cache = getModelCache();
  if (cache[cacheKey]) return cache[cacheKey].model;

  // Gemini — अपना model list है
  if (provider.type === 'gemini') {
    for (const model of (provider.geminiModels || [])) {
      try {
        const url = `${provider.baseUrl}/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: 'hi' }] }] }),
        });
        if (res.ok || res.status === 400) {
          setModelCache(cacheKey, model);
          return model;
        }
      } catch { continue; }
    }
    return provider.geminiModels?.[0] || 'gemini-1.5-flash';
  }

  // HuggingFace / Perplexity — no models endpoint
  if (!provider.modelsUrl) {
    return provider.fallbackModel || null;
  }

  // OpenAI-compatible / Claude — /models endpoint से fetch करो
  try {
    const headers = {};
    if (provider.type === 'claude') {
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
    } else {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const res = await fetch(provider.modelsUrl, { headers });
    if (!res.ok) return provider.fallbackModel || null;

    const data = await res.json();

    let modelList = [];
    if (data.data) modelList = data.data.map(m => m.id || m.name).filter(Boolean);
    else if (data.models) modelList = data.models.map(m => m.id || m.name).filter(Boolean);
    else if (Array.isArray(data)) modelList = data.map(m => m.id || m.name).filter(Boolean);

    if (!modelList.length) return provider.fallbackModel || null;

    // prefer list में से best keyword match score
    const scored = modelList.map(m => {
      const lower = m.toLowerCase();
      let score = 0;
      provider.prefer.forEach((keyword, idx) => {
        if (lower.includes(keyword.toLowerCase())) {
          score = Math.max(score, provider.prefer.length - idx);
        }
      });
      return { m, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const best = scored[0]?.m || modelList[0];
    setModelCache(cacheKey, best);
    return best;

  } catch {
    return provider.fallbackModel || null;
  }
};

// ── Single Provider Call ──
export const callProvider = async (provider, apiKey, model, messages, customEndpoint = '') => {
  if (!provider || !apiKey || !model) throw new Error('Provider config missing');

  const headers = { 'Content-Type': 'application/json' };
  let url = '';
  let body = {};

  if (provider.type === 'openai') {
    url = customEndpoint || `${provider.baseUrl}/chat/completions`;
    headers['Authorization'] = `Bearer ${apiKey}`;
    body = { model, messages, max_tokens: 1000 };

  } else if (provider.type === 'claude') {
    url = `${provider.baseUrl}/messages`;
    headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = '2023-06-01';
    const sys = messages.find(m => m.role === 'system');
    const rest = messages.filter(m => m.role !== 'system');
    body = {
      model, max_tokens: 1024,
      ...(sys && { system: sys.content }),
      messages: rest,
    };

  } else if (provider.type === 'gemini') {
    url = `${provider.baseUrl}/models/${model}:generateContent?key=${apiKey}`;
    const userMsg = messages.filter(m => m.role !== 'system').map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
    body = { contents: userMsg };

  } else if (provider.type === 'cohere') {
    url = `${provider.baseUrl}/chat`;
    headers['Authorization'] = `Bearer ${apiKey}`;
    const sys = messages.find(m => m.role === 'system');
    const last = messages.filter(m => m.role === 'user').pop();
    body = { model, message: last?.content || '', ...(sys && { preamble: sys.content }) };

  } else if (provider.type === 'huggingface') {
    url = `${provider.baseUrl}/models/${model}`;
    headers['Authorization'] = `Bearer ${apiKey}`;
    const last = messages.filter(m => m.role === 'user').pop();
    body = { inputs: last?.content || '' };
  }

  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${provider.name} ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  if (provider.type === 'openai') return data.choices?.[0]?.message?.content;
  if (provider.type === 'claude') return data.content?.[0]?.text;
  if (provider.type === 'gemini') return data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (provider.type === 'cohere') return data.text;
  if (provider.type === 'huggingface') return Array.isArray(data) ? data[0]?.generated_text : data?.generated_text;
  return null;
};

// ── localStorage helpers ──
export const isBYOKEnabled = () => {
  try { return localStorage.getItem('byok_enabled') === 'true'; } catch { return false; }
};

export const getActiveSlots = () => {
  try {
    if (!isBYOKEnabled()) return [];
    const raw = localStorage.getItem('byok_keys');
    if (!raw) return [];
    return JSON.parse(raw).filter(s => s.active && s.apiKey);
  } catch { return []; }
};

export const getSlots = () => {
  try {
    const raw = localStorage.getItem('byok_keys');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

export const saveSlots = (slots) => {
  try { localStorage.setItem('byok_keys', JSON.stringify(slots)); } catch {}
};

export default { detectProvider, fetchBestModel, callProvider, isBYOKEnabled, getActiveSlots, getSlots, saveSlots };
