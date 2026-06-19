import { getActiveSlots, isBYOKEnabled, callProvider, detectProvider, fetchBestModel } from './api/byokService';
import { chatWithEngine } from './api/engineService';

const isEngineEnabled = () => localStorage.getItem('engine_enabled') !== 'false';
const FREE_LIMIT = 20;

const getEngineUsage = () => {
  const today = new Date().toDateString();
  if (localStorage.getItem('engine_usage_date') !== today) {
    localStorage.setItem('engine_usage_date', today);
    localStorage.setItem('engine_usage_today', '0');
    return 0;
  }
  return parseInt(localStorage.getItem('engine_usage_today') || '0');
};

export const getRemainingFreeMessages = () => Math.max(0, FREE_LIMIT - getEngineUsage());

export const sendMessage = async (message, history = []) => {
  const systemPrompt = 'तुम DRISHTI हो - भारत का Hindi AI Assistant। Hindi/Hinglish में जवाब दो। Short और helpful रहो।';
  const messages = [{ role: 'system', content: systemPrompt }, ...history, { role: 'user', content: message }];

  if (isBYOKEnabled()) {
    const slots = getActiveSlots();
    for (const slot of slots) {
      try {
        const provider = detectProvider(slot.apiKey, slot.providerName || '', slot.endpoint || '');
        if (!provider) continue;
        // cache miss → live fetch; cache hit → instant
        const model = slot.detectedModel || await fetchBestModel(provider, slot.apiKey);
        if (!model) continue;
        const text = await callProvider(provider, slot.apiKey, model, messages, slot.endpoint || '');
        if (text) return { text, source: provider.name, success: true };
      } catch { continue; }
    }
  }

  if (!isEngineEnabled()) {
    return { text: 'DRISHTI Engine बंद है। Settings में Engine ON करो या BYOK API key add करो। 🔑', source: 'offline', success: false };
  }

  const used = getEngineUsage();
  if (used >= FREE_LIMIT) {
    return { text: `आज के ${FREE_LIMIT} free messages पूरे हो गए। अपनी API key add करो! 🔑`, source: 'limit', success: false };
  }

  try {
    const text = await chatWithEngine(message, history, systemPrompt);
    localStorage.setItem('engine_usage_today', String(used + 1));
    return { text, source: 'DRISHTI Engine', success: true };
  } catch {
    return { text: 'Server से connect नहीं हो पाया। थोड़ी देर बाद try करें। 🔄', source: 'error', success: false };
  }
};

export default { sendMessage, getRemainingFreeMessages };
