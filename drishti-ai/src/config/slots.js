export const SLOTS = [
  {
    id: 1, role: 'brain', emoji: '🧠',
    label: 'Brain / Router',
    description: 'User का input समझो, सही slot को भेजो',
    recommendation: 'Fast + Long context API best',
    freeOption: 'Gemini AI Studio (free)',
    freeUrl: 'https://aistudio.google.com',
    color: '#00d4ff',
  },
  {
    id: 2, role: 'coding', emoji: '💻',
    label: 'Coding Assistant',
    description: 'Code लिखो, debug करो, explain करो',
    recommendation: 'Coding-specific model best',
    freeOption: 'Groq - DeepSeek Coder (free)',
    freeUrl: 'https://console.groq.com',
    color: '#10b981',
  },
  {
    id: 3, role: 'creator', emoji: '🎨',
    label: 'Image / PDF Creator',
    description: 'Images बनाओ, PDFs create करो',
    recommendation: 'Image generation API चाहिए',
    freeOption: 'Pollinations.ai (no key needed!)',
    freeUrl: 'https://pollinations.ai',
    color: '#7c3aed',
  },
  {
    id: 4, role: 'vision', emoji: '👁️',
    label: 'Vision / Screen',
    description: 'Photos, screenshots समझो',
    recommendation: 'Vision model ज़रूरी',
    freeOption: 'Gemini Vision (free tier)',
    freeUrl: 'https://aistudio.google.com',
    color: '#f59e0b',
  },
  {
    id: 5, role: 'search', emoji: '🔍',
    label: 'Live Search',
    description: 'Real-time internet से data लाओ',
    recommendation: 'Search API चाहिए',
    freeOption: 'Tavily (1000 free/month)',
    freeUrl: 'https://tavily.com',
    color: '#3b82f6',
  },
  {
    id: 6, role: 'verifier', emoji: '✅',
    label: 'Verifier (max 2 retry)',
    description: 'Answer check करो - infinite loop नहीं',
    recommendation: 'Strong reasoning model',
    freeOption: 'Groq - Llama 70B (free)',
    freeUrl: 'https://console.groq.com',
    color: '#ec4899',
  },
  {
    id: 7, role: 'emergency', emoji: '🚨',
    label: 'Emergency Fallback',
    description: 'सब fail हो तो यह काम करेगा',
    recommendation: 'Reliable paid API recommend',
    freeOption: 'OpenRouter (free tier)',
    freeUrl: 'https://openrouter.ai',
    color: '#ff4444',
  },
];

export const getSlotById = (id) => SLOTS.find(s => s.id === id);
export const getSlotByRole = (role) => SLOTS.find(s => s.role === role);
export default SLOTS;
