// DRISHTI - Main API Orchestrator
// BYOK first → Engine fallback

import { chatWithEngine } from './api/engineService';
import {
  detectProvider, fetchBestModel,
  callProvider, getActiveSlots, isBYOKEnabled,
} from './api/byokService';
import { trackCall } from './analytics/usageService';

const FREE_LIMIT = 20;

export const sendMessage = async (message, history = []) => {
  // BYOK ON → User की API
  if (isBYOKEnabled()) {
    const slots = getActiveSlots();
    if (slots.length > 0) {
      const result = await callWithBYOK(message, history, slots);
      if (result.success) return result;
    }
  }

  // Engine fallback
  const used = getTodayUsage();
  if (used >= FREE_LIMIT) {
    return {
      success: false,
      text: `🚫 आज के ${FREE_LIMIT} free messages पूरे!\n\n🔑 Settings → My APIs में key add करो।`,
      source: 'limit',
    };
  }

  const result = await chatWithEngine(message);
  if (result.success) {
    incrementUsage();
    trackCall('engine', 0, 0, true);
  }
  return result;
};

const callWithBYOK = async (message, history, slots) => {
  const messages = [...history, { role: 'user', content: message }];

  for (const slot of slots) {
    const start = Date.now();
    try {
      const provider = detectProvider(slot.apiKey, slot.providerName, slot.endpoint);
      if (!provider) continue;

      // Dynamic model - no hardcoding!
      let model = slot.detectedModel;
      if (!model) {
        model = await fetchBestModel(provider, slot.apiKey);
        if (model) {
          const slots = JSON.parse(localStorage.getItem('byok_keys') || '[]');
          const idx = slots.findIndex(s => s.id === slot.id);
          if (idx >= 0) {
            slots[idx].detectedModel = model;
            localStorage.setItem('byok_keys', JSON.stringify(slots));
          }
        }
      }

      const text = await callProvider(provider, slot.apiKey, model, messages);
      const latency = Date.now() - start;
      trackCall(provider.id, 0, latency, true);

      if (text) return { success: true, text, source: provider.name, model };
    } catch (e) {
      trackCall(slot.providerName || 'unknown', 0, 0, false);
      console.log('Slot failed:', e.message);
      continue;
    }
  }
  return { success: false, text: null };
};

const getTodayUsage = () => {
  const key = `usage_engine_${new Date().toDateString()}`;
  return JSON.parse(localStorage.getItem(key) || '{}').calls || 0;
};

const incrementUsage = () => {
  const key = `usage_engine_${new Date().toDateString()}`;
  const d = JSON.parse(localStorage.getItem(key) || '{}');
  d.calls = (d.calls || 0) + 1;
  localStorage.setItem(key, JSON.stringify(d));
};

export default { sendMessage };
