import { getActiveSlots, isBYOKEnabled, callProvider, detectProvider, fetchBestModel } from './api/byokService';
import { chatWithEngine, checkEngineHealth } from './api/engineService';

const isEngineEnabled = () => localStorage.getItem('engine_enabled') !== 'false';

const FREE_LIMIT = 20;
const USAGE_KEY = 'engine_usage_today';
const USAGE_DATE_KEY = 'engine_usage_date';

const getEngineUsage = () => {
  const today = new Date().toDateString();
  const savedDate = localStorage.getItem(USAGE_DATE_KEY);
  if (savedDate !== today) {
    localStorage.setItem(USAGE_DATE_KEY, today);
    localStorage.setItem(USAGE_KEY, '0');
    return 0;
  }
  return parseInt(localStorage.getItem(USAGE_KEY) || '0');
};

const incrementEngineUsage = () => {
  const current = getEngineUsage();
  localStorage.setItem(USAGE_KEY, String(current + 1));
};

export const getRemainingFreeMessages = () => Math.max(0, FREE_LIMIT - getEngineUsage());

export const sendMessage = async (message, history = []) => {
  const systemPrompt = 'तुम DRISHTI ह - भारत का Hindi AI Assistant। Hindi/Hinglish में जवाब दो। Short और helpful रहो।';

  // 1. BYOK try करो
  if (await isBYOKEnabled()) {
    const slots = getActiveSlots();
    for (const slot of slots) {
      try {
        let provider = slot.detectedProvider;
        let model = slot.detectedModel;
        if (!provider) {
          const config = detectProvider(slot.apiKey, slot.providerName, slot.endpoint);
          provider = config?.type;
          model = model || config?.defaultModel;
        }
        if (!model) {
          const config = detectProvider(slot.apiKey, slot.providerName, slot.endpoint);
          model = await fetchBestModel(config, slot.apiKey) || config?.defaultModel;
          slot.detectedModel = model;
        }
        const messages = [
          { role: 'system', content: systemPrompt },
          ...history,
          { role: 'user', content: message },
        ];
        const text = await callProvider(provider, slot.apiKey, model, messages, slot.endpoint);
        if (text) return { text, source: slot.providerName || provider, success: true };
      } catch (e) { continue; }
    }
  }

  // 2. Engine fallback — सिर्फ तब जब enabled हो
  if (!isEngineEnabled()) {
    return {
      text: 'DRISHTI Engine बंद है। Settings में Engine ON करो या BYOK API key add करो। 🔑',
      source: 'offline',
      success: false,
    };
  }

  const used = getEngineUsage();
  if (used >= FREE_LIMIT) {
    return {
      text: `आज के ${FREE_LIMIT} free messages पूरे हो गए। अपनी API key add करो Settings → My APIs में! 🔑`,
      source: 'limit',
      success: false,
    };
  }

  try {
    const text = await chatWithEngine(message, history, systemPrompt);
    incrementEngineUsage();
    return { text, source: 'DRISHTI Engine', success: true };
  } catch (e) {
    return {
      text: 'Server से connect नहीं हो पाया। थड़ी देर बाद try करें। 🔄',
      source: 'error',
      success: false,
    };
  }
};

export default { sendMessage, getRemainingFreeMessages };
