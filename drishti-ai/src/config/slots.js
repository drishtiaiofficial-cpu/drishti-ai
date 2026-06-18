export const SLOTS = [
  { id: 1, role: 'brain', emoji: '🧠', label: 'Brain / Router',
    description: 'User ka input samjho, sahi slot ko bhejo',
    recommendation: 'Fast + Long context API best rahegi',
    freeOption: 'Gemini AI Studio (free)', freeUrl: 'https://aistudio.google.com', color: '#00d4ff' },
  { id: 2, role: 'coding', emoji: '💻', label: 'Coding Assistant',
    description: 'Code likhna, debug karna, explain karna',
    recommendation: 'Coding-specific model best rahega',
    freeOption: 'Groq - DeepSeek Coder (free)', freeUrl: 'https://console.groq.com', color: '#10b981' },
  { id: 3, role: 'creator', emoji: '🎨', label: 'Image / PDF Creator',
    description: 'Images banao, PDFs create karo',
    recommendation: 'Image generation API chahiye',
    freeOption: 'Pollinations.ai (no key needed!)', freeUrl: 'https://pollinations.ai', color: '#7c3aed' },
  { id: 4, role: 'vision', emoji: '👁️', label: 'Vision / Screen',
    description: 'Photos, screenshots, screen samjho',
    recommendation: 'Vision model zaroori hai',
    freeOption: 'Gemini Vision (free tier)', freeUrl: 'https://aistudio.google.com', color: '#f59e0b' },
  { id: 5, role: 'search', emoji: '🔍', label: 'Live Search',
    description: 'Real-time internet se data lao',
    recommendation: 'Search API chahiye',
    freeOption: 'Tavily (1000 free/month)', freeUrl: 'https://tavily.com', color: '#3b82f6' },
  { id: 6, role: 'verifier', emoji: '✅', label: 'Verifier',
    description: 'Answer check karo (max 2 baar retry)',
    recommendation: 'Strong reasoning model',
    freeOption: 'Groq - Llama 70B (free)', freeUrl: 'https://console.groq.com', color: '#ec4899' },
  { id: 7, role: 'emergency', emoji: '🚨', label: 'Emergency Fallback',
    description: 'Sab fail ho jaaye toh yeh kaam karega',
    recommendation: 'Reliable paid API recommend',
    freeOption: 'OpenRouter (free tier available)', freeUrl: 'https://openrouter.ai', color: '#ff4444' },
];

export const getSlotByRole = (role) => SLOTS.find(s => s.role === role);
export const getSlotById = (id) => SLOTS.find(s => s.id === id);
export default SLOTS;
