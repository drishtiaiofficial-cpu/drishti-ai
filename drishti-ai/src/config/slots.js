export const SLOTS = [
  { id: 1, role: 'slot1', emoji: '🔑', label: 'Slot 1',
    description: 'Koi bhi API daalo - chat ke liye use hogi',
    recommendation: 'Groq, Gemini, Claude, OpenAI - kuch bhi chalega',
    freeOption: 'Groq (free)', freeUrl: 'https://console.groq.com', color: '#00d4ff' },
  { id: 2, role: 'slot2', emoji: '🔑', label: 'Slot 2',
    description: 'Backup API - pehli fail ho to yeh try hogi',
    recommendation: 'Alag provider rakhna behtar hai',
    freeOption: 'Gemini AI Studio (free)', freeUrl: 'https://aistudio.google.com', color: '#10b981' },
  { id: 3, role: 'slot3', emoji: '🔑', label: 'Slot 3',
    description: 'Teesra backup - emergency ke liye',
    recommendation: 'Reliable API rakho',
    freeOption: 'OpenRouter (free tier)', freeUrl: 'https://openrouter.ai', color: '#f59e0b' },
];

export const getSlotByRole = (role) => SLOTS.find(s => s.role === role);
export const getSlotById = (id) => SLOTS.find(s => s.id === id);
export default SLOTS;
