// API Usage Tracking

const getKey = (type) => `usage_${type}_${new Date().toDateString()}`;

export const trackCall = (provider, tokens = 0, latency = 0, success = true) => {
  const key = getKey(provider);
  const existing = JSON.parse(localStorage.getItem(key) || '{}');
  const updated = {
    calls: (existing.calls || 0) + 1,
    tokens: (existing.tokens || 0) + tokens,
    totalLatency: (existing.totalLatency || 0) + latency,
    errors: (existing.errors || 0) + (success ? 0 : 1),
    lastUsed: Date.now(),
  };
  localStorage.setItem(key, JSON.stringify(updated));
};

export const getStats = (provider) => {
  const key = getKey(provider);
  const data = JSON.parse(localStorage.getItem(key) || '{}');
  return {
    calls: data.calls || 0,
    tokens: data.tokens || 0,
    avgLatency: data.calls ? Math.round(data.totalLatency / data.calls) : 0,
    errors: data.errors || 0,
    successRate: data.calls
      ? Math.round(((data.calls - data.errors) / data.calls) * 100)
      : 100,
  };
};

export const getAllStats = () => {
  const providers = ['groq', 'openai', 'claude', 'gemini',
                     'mistral', 'openrouter', 'together', 'engine'];
  return providers.reduce((acc, p) => {
    const stats = getStats(p);
    if (stats.calls > 0) acc[p] = stats;
    return acc;
  }, {});
};

export const getTodayTotal = () => {
  const all = getAllStats();
  return Object.values(all).reduce((sum, s) => sum + s.calls, 0);
};

export default { trackCall, getStats, getAllStats, getTodayTotal };
