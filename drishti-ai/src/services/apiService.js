// ============================================
// DRISHTI - API Service
// Main AI call handler
// ============================================

import { APP_CONFIG, getEngineUrl } from '../config/index';
import { detectProvider } from '../config/providers';
import { getBYOKSlots, isBYOKEnabled, getUsageToday, incrementUsage } from './storageService';
import { saveMessage, getContext } from './memoryService';

const SYSTEM_PROMPT = `You are DRISHTI - a helpful AI assistant. 
Always respond in the SAME language the user writes in.
If user writes in Hindi → respond in Hindi.
If user writes in English → respond in English.
If user writes in Hinglish → respond in Hinglish.
Keep responses helpful, short and friendly.`;

// ============================================
// MAIN FUNCTION
// ============================================
export const sendMessage = async (message, sessionId = 'default') => {
  const history = getContext(sessionId);
  saveMessage('user', message, sessionId);

  const byokEnabled = isBYOKEnabled();
  const slots = getBYOKSlots();
  const activeSlots = slots.filter(s => s.active && s.apiKey);

  let result;
  if (byokEnabled && activeSlots.length > 0) {
    result = await callWithBYOK(message, history, activeSlots);
  } else {
    result = await callEngine(message, history);
  }

  if (result.text) {
    saveMessage('assistant', result.text, sessionId);
  }
  return result;
};

// ============================================
// ENGINE CALL
// ============================================
const callEngine = async (message, history) => {
  const used = getUsageToday();
  const limit = APP_CONFIG.limits.free;

  if (used >= limit) {
    return {
      text: `🚫 आज के ${limit} free messages पूरे हो गए!\n\n🔑 Settings → My APIs में Groq की free key add करो।`,
      source: 'limit',
      limitReached: true,
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), APP_CONFIG.engine.timeout);

    const res = await fetch(getEngineUrl('chat'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        capability: 'chat',
        user_id: 0,
        session_id: 'default',
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    if (!res.ok) throw new Error(`Engine error: ${res.status}`);
    const data = await res.json();
    incrementUsage();

    return {
      text: data.response || data.reply || data.message || 'कुछ गड़बड़ हुई।',
      source: 'engine',
      model: data.model,
      remaining: limit - used - 1,
    };
  } catch (e) {
    if (e.name === 'AbortError') {
      return {
        text: '⏱️ Server जाग रहा है। 30 seconds बाद दोबारा try करो।',
        source: 'timeout',
      };
    }
    return getFallback(message);
  }
};

// ============================================
// BYOK CALL
// ============================================
const callWithBYOK = async (message, history, slots) => {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history,
    { role: 'user', content: message },
  ];

  for (const slot of slots) {
    try {
      const provider = detectProvider(slot.apiKey, slot.providerName, slot.endpoint);
      if (!provider) continue;

      const result = await callProvider(provider, slot, messages, message);
      if (result) return { text: result, source: provider.name.toLowerCase() };
    } catch (e) {
      console.log(`${slot.providerName} failed:`, e.message);
      continue;
    }
  }

  return { text: '⚠️ कोई API काम नहीं कर रही। Settings check करो।', source: 'error' };
};

const callProvider = async (provider, slot, messages, message) => {
  const key = slot.apiKey;

  if (provider.type === 'claude') {
    const res = await fetch(provider.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: slot.detectedModel || provider.defaultModel,
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: messages.filter(m => m.role !== 'system'),
      }),
    });
    const data = await res.json();
    return data.content?.[0]?.text;
  }

  if (provider.type === 'gemini') {
    const model = slot.detectedModel || provider.defaultModel;
    const res = await fetch(
      `${provider.baseUrl}/${model}:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\nUser: ${message}` }] }],
          generationConfig: { maxOutputTokens: 1000, temperature: 0.7 },
        }),
      }
    );
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text;
  }

  // OpenAI format (Groq, OpenAI, Mistral, OpenRouter, Together)
  const url = slot.endpoint || provider.baseUrl;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: slot.detectedModel || provider.defaultModel,
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content;
};

// ============================================
// FALLBACK
// ============================================
const getFallback = (message) => {
  const t = message.toLowerCase();
  if (t.includes('नमस्ते') || t.includes('hello') || t.includes('hi'))
    return { text: 'नमस्ते! 😊 Settings में API key add करो बेहतर जवाब के लिए!', source: 'fallback' };
  if (t.includes('upi') || t.includes('payment'))
    return { text: 'UPI:\n1. GPay खोलो\n2. Pay करो\n3. Number डालो\n4. Amount\n5. PIN ✅', source: 'fallback' };
  return { text: '🔑 Settings → My APIs में Groq की free key add करो!', source: 'fallback' };
};

export default { sendMessage };
