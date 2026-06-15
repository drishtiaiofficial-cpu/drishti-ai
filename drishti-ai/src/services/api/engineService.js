import { ENDPOINTS, TIMEOUTS } from '../../constants/endpoints';

const SYSTEM_PROMPT = `You are DRISHTI - a helpful AI Assistant.
IMPORTANT: Always respond in the SAME language the user writes in.
Hindi → Hindi reply. English → English reply. Hinglish → Hinglish reply.
Be helpful, friendly and concise.`;

export const chatWithEngine = async (message, sessionId = 'default') => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(), TIMEOUTS.engine
    );

    const res = await fetch(ENDPOINTS.chat, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        capability: 'chat',
        user_id: parseInt(localStorage.getItem('uid') || '0'),
        session_id: sessionId,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    if (!res.ok) throw new Error(`Engine error: ${res.status}`);
    const data = await res.json();

    return {
      success: true,
      text: data.response || data.reply || data.message,
      model: data.model,
      provider: data.provider,
      source: 'engine',
    };
  } catch (e) {
    if (e.name === 'AbortError') {
      return {
        success: false,
        text: '⏱️ Server जाग रहा है। 30 सेकंड बाद try करो।',
        source: 'timeout',
      };
    }
    return {
      success: false,
      text: null,
      source: 'engine_error',
      error: e.message,
    };
  }
};

export const pingEngine = async () => {
  try {
    const res = await fetch(ENDPOINTS.ping, { method: 'GET' });
    return res.ok;
  } catch { return false; }
};

export const getEngineStats = async () => {
  try {
    const res = await fetch(ENDPOINTS.stats);
    return res.ok ? await res.json() : null;
  } catch { return null; }
};

export default { chatWithEngine, pingEngine, getEngineStats };
