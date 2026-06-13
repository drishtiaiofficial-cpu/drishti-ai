const BACKEND_URL = 'https://drishti-engine.onrender.com';
const FREE_MESSAGES_PER_DAY = 20;

export const sendMessage = async (message, history = []) => {
  const byokOn = localStorage.getItem('byok_enabled') === 'true';
  const keysRaw = localStorage.getItem('byok_keys');
  const slots = keysRaw ? JSON.parse(keysRaw) : [];
  const activeSlots = slots.filter(s => s.active && s.apiKey);
  if (byokOn && activeSlots.length > 0) {
    return await callWithBYOK(message, history, activeSlots);
  }
  return await callBackend(message, history);
};

const callWithBYOK = async (message, history, activeSlots) => {
  for (const slot of activeSlots) {
    try {
      const provider = (slot.providerName || '').toLowerCase();
      const key = slot.apiKey || '';

      if (provider.includes('claude') || key.startsWith('sk-ant-')) {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: slot.detectedModel || 'claude-haiku-4-5-20251001',
            max_tokens: 1000,
            system: 'तुम DRISHTI हो - Hindi AI Assistant। Hindi में जवाब दो।',
            messages: [{ role: 'user', content: message }],
          }),
        });
        const data = await res.json();
        if (data.content?.[0]?.text) return { text: data.content[0].text, source: 'claude' };
        throw new Error('Claude error');
      }

      if (provider.includes('gemini') || key.startsWith('AIza')) {
        const model = slot.detectedModel || 'gemini-1.5-flash';
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `तुम DRISHTI हो - Hindi AI Assistant। Hindi में जवाब दो।\nUser: ${message}` }] }],
              generationConfig: { maxOutputTokens: 1000, temperature: 0.7 },
            }),
          }
        );
        const data = await res.json();
        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
          return { text: data.candidates[0].content.parts[0].text, source: 'gemini' };
        }
        throw new Error('Gemini error: ' + JSON.stringify(data.error || data));
      }

      if (provider.includes('openai') || provider.includes('gpt') ||
          (key.startsWith('sk-') && !key.startsWith('sk-ant-'))) {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
          body: JSON.stringify({
            model: slot.detectedModel || 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'तुम DRISHTI हो - Hindi AI Assistant। Hindi में जवाब दो।' },
              ...history, { role: 'user', content: message },
            ],
            max_tokens: 1000,
          }),
        });
        const data = await res.json();
        if (data.choices?.[0]?.message?.content) return { text: data.choices[0].message.content, source: 'openai' };
        throw new Error('OpenAI error');
      }

      const url = slot.endpoint || 'https://api.groq.com/openai/v1/chat/completions';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: slot.detectedModel || 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: 'तुम DRISHTI हो - Hindi AI Assistant। Hindi में जवाब दो। Short और helpful रहो।' },
            ...history, { role: 'user', content: message },
          ],
          max_tokens: 1000,
        }),
      });
      const data = await res.json();
      if (data.choices?.[0]?.message?.content) return { text: data.choices[0].message.content, source: 'groq' };
      throw new Error('Groq error');

    } catch (e) {
      console.log('Slot failed:', e.message);
      continue;
    }
  }
  return { text: '⚠️ कोई भी API काम नहीं कर रही। Settings में API key check करो।', source: 'error' };
};

const callBackend = async (message, history) => {
  const today = new Date().toDateString();
  const usageKey = `usage_${today}`;
  const used = parseInt(localStorage.getItem(usageKey) || '0');

  if (used >= FREE_MESSAGES_PER_DAY) {
    return {
      text: `🚫 आज के ${FREE_MESSAGES_PER_DAY} free messages पूरे हो गए!\n\n🔑 Settings → My APIs में Groq की free key add करो unlimited के लिए।`,
      source: 'limit',
      limitReached: true,
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 35000);
    const res = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        history: history.slice(-10),
        language: localStorage.getItem('appLanguage') || 'hi',
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`Backend error: ${res.status}`);
    const data = await res.json();
    localStorage.setItem(usageKey, (used + 1).toString());
    return {
      text: data.reply || data.response || data.message || 'कुछ गड़बड़ हुई।',
      source: 'backend',
      remaining: FREE_MESSAGES_PER_DAY - used - 1,
    };
  } catch (e) {
    if (e.name === 'AbortError') {
      return { text: '⏱️ Server जाग रहा है (Render free tier - 50 sec लगते हैं)। दोबारा try करो।', source: 'timeout' };
    }
    return getFallback(message);
  }
};

const getFallback = (message) => {
  const t = message.toLowerCase();
  if (t.includes('नमस्ते') || t.includes('hello') || t.includes('hi'))
    return { text: 'नमस्ते! 😊 Settings में API key add करो बेहतर जवाब के लिए!', source: 'fallback' };
  if (t.includes('upi') || t.includes('payment'))
    return { text: 'UPI Payment:\n1. GPay खोलो\n2. Pay दबाओ\n3. Number डालो\n4. Amount डालो\n5. PIN डालो ✅', source: 'fallback' };
  return { text: '🔑 Settings → My APIs में Groq की free key add करो!\nconsole.groq.com पर free account बनाओ।', source: 'fallback' };
};

const VOICE_CONFIGS = {
  dadi: { rate: 0.65, pitch: 1.4, lang: 'hi-IN' },
  maa: { rate: 0.78, pitch: 1.25, lang: 'hi-IN' },
  didi: { rate: 0.95, pitch: 1.15, lang: 'hi-IN' },
  bhai: { rate: 1.0, pitch: 0.82, lang: 'hi-IN' },
  teacher: { rate: 0.88, pitch: 1.0, lang: 'hi-IN' },
  nana: { rate: 0.6, pitch: 1.3, lang: 'hi-IN' },
};

export const speakText = (text, voiceType = 'didi') => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const config = VOICE_CONFIGS[voiceType] || VOICE_CONFIGS.didi;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = config.lang;
  utterance.rate = config.rate;
  utterance.pitch = config.pitch;
  const loadVoice = () => {
    const allVoices = window.speechSynthesis.getVoices();
    const hindiVoice = allVoices.find(v => v.lang.includes('hi') || v.lang.includes('IN'));
    if (hindiVoice) utterance.voice = hindiVoice;
    window.speechSynthesis.speak(utterance);
  };
  if (window.speechSynthesis.getVoices().length > 0) loadVoice();
  else window.speechSynthesis.onvoiceschanged = loadVoice;
};

export const stopVoice = () => {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
};

export const getSelectedVoice = () => localStorage.getItem('selectedVoice') || 'didi';
export const getAllVoices = () => VOICE_CONFIGS;
