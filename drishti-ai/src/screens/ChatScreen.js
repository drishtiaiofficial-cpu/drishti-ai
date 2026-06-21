import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ── Language System ──
const getSystemPrompt = () => {
  const lang = localStorage.getItem('app_language') || 'hinglish';
  if (lang === 'english') return `You are DRISHTI, a helpful AI assistant made in India. IMPORTANT RULES:
1. ALWAYS reply in English only - never use Hindi or Devanagari script
2. Be warm, friendly and helpful like a knowledgeable friend
3. Give clear, structured answers with examples when needed
4. Keep responses concise but complete`;
  if (lang === 'hindi') return `तुम DRISHTI हो - भारत का AI Assistant। महत्वपूर्ण नियम:
1. हमेशा शुद्ध हिंदी में जवाब दो - कभी English मत मिलाओ
2. जवाब clear और helpful हो
3. User को "आप" कहो
4. Short लेकिन complete जवाब दो`;
  return `तुम DRISHTI हो - भारत का AI Assistant। महत्वपूर्ण नियम:
1. Hindi और English mix (Hinglish) में जवाब दो
2. जवाब natural और friendly हो जैसे एक दोस्त बात करे
3. Technical चीज़ें simple शब्दों में समझाओ
4. User को "आप" कहो
5. Bullet points से step-by-step guide करो जब ज़रूरी हो`;
};

const getPlaceholder = () => {
  const lang = localStorage.getItem('app_language') || 'hinglish';
  if (lang === 'english') return 'Ask anything...';
  return 'कुछ भी पूछो...';
};

// ── Save to History ──
const saveToHistory = (userText, aiText) => {
  try {
    let sid = localStorage.getItem('current_session_id');
    if (!sid) {
      sid = 'session_' + Date.now();
      localStorage.setItem('current_session_id', sid);
    }
    const key = 'chat_' + sid;
    const hist = JSON.parse(localStorage.getItem(key) || '[]');
    hist.push({ role: 'user', content: userText, timestamp: Date.now() - 100 });
    hist.push({ role: 'assistant', content: aiText, timestamp: Date.now() });
    if (hist.length > 200) hist.splice(0, hist.length - 200);
    localStorage.setItem(key, JSON.stringify(hist));
  } catch(e) { console.log('Save error:', e); }
};

// ── API Call ──
const callAPI = async (message, history) => {
  try {
    const byokOn = localStorage.getItem('byok_enabled');
    const keysRaw = localStorage.getItem('byok_keys');
    const slots = keysRaw ? JSON.parse(keysRaw) : [];
    const active = slots.filter(s => s.active && s.apiKey);
    if (byokOn === 'true' && active.length > 0) {
      for (const slot of active) {
        try {
          const key = slot.apiKey || '';
          const msgs = [
            { role: 'system', content: getSystemPrompt() },
            ...history,
            { role: 'user', content: message }
          ];
          let url = 'https://api.groq.com/openai/v1/chat/completions';
          let headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` };
          let body = { model: slot.detectedModel || 'llama-3.3-70b-versatile', messages: msgs, max_tokens: 800 };
          if (key.startsWith('AIza')) {
            url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
            headers = { 'Content-Type': 'application/json' };
            body = { contents: [{ parts: [{ text: message }] }] };
          } else if (key.startsWith('sk-ant-')) {
            url = 'https://api.anthropic.com/v1/messages';
            headers = { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' };
            body = { model: slot.detectedModel || 'claude-haiku-4-5-20251001', max_tokens: 800, messages: [{ role: 'user', content: message }] };
          }
          const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
          const data = await res.json();
          if (key.startsWith('AIza')) return data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (key.startsWith('sk-ant-')) return data.content?.[0]?.text;
          return data.choices?.[0]?.message?.content;
        } catch { continue; }
      }
    }
  } catch {}
  if (localStorage.getItem('engine_enabled') !== 'false') {
    try {
      const res = await fetch('https://drishti-engine.onrender.com/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history, system: getSystemPrompt() }),
      });
      if (res.ok) { const d = await res.json(); return d.response || d.text || d.message; }
    } catch {}
  }
  const lang = localStorage.getItem('app_language') || 'hinglish';
  if (lang === 'english') return 'Please add an API key in Settings → My APIs for better responses!';
  return 'Settings → My APIs में API key add करें! 🔑';
};

export default function ChatScreen({ navigate }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [micState, setMicState] = useState('idle');
  const [feedback, setFeedback] = useState({});
  const [copied, setCopied] = useState({});
  const [speaking, setSpeaking] = useState(null); // which message is speaking
  const scrollRef = useRef(null);
  const historyRef = useRef([]);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Load existing session messages
    try {
      const sid = localStorage.getItem('current_session_id');
      if (sid) {
        const hist = JSON.parse(localStorage.getItem('chat_' + sid) || '[]');
        if (hist.length > 0) {
          setMessages(hist.map((m, i) => ({
            id: m.timestamp || i,
            text: m.content,
            sender: m.role === 'assistant' ? 'ai' : 'user',
          })));
          historyRef.current = hist.slice(-20).map(m => ({ role: m.role, content: m.content }));
          return;
        }
      }
    } catch {}
    const lang = localStorage.getItem('app_language') || 'hinglish';
    const welcome = lang === 'english'
      ? "Hello! 🙏 I'm DRISHTI.\n\nAsk me anything in English, Hindi, or Hinglish!\n\nAdd API key in Settings for better answers."
      : 'नमस्ते! 🙏 मैं DRISHTI हूँ।\n\nकुछ भी पूछो!\n\nSettings → My APIs में API key add करें।';
    setMessages([{ id: 1, sender: 'ai', text: welcome }]);
  }, []);

  const send = async (text) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), text: text.trim(), sender: 'user' }]);
    setInput(''); setThinking(true);
    try {
      const reply = await callAPI(text.trim(), historyRef.current);
      const r = reply || (localStorage.getItem('app_language') === 'english' ? 'Something went wrong. Try again!' : 'कुछ गड़बड़ हुई। दोबारा try करें।');
      historyRef.current = [...historyRef.current, { role: 'user', content: text }, { role: 'assistant', content: r }].slice(-20);
      setMessages(prev => [...prev, { id: Date.now() + 1, text: r, sender: 'ai' }]);
      saveToHistory(text.trim(), r); // ✅ SAVE TO HISTORY
    } catch {
      setMessages(prev => [...prev, { id: Date.now() + 1, text: 'Error! Try again. 🔄', sender: 'ai' }]);
    } finally {
      setThinking(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  // ── TTS Toggle ──
  const toggleSpeak = (id, text) => {
    if (speaking === id) {
      window.speechSynthesis?.cancel();
      setSpeaking(null);
    } else {
      window.speechSynthesis?.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const lang = localStorage.getItem('app_language') || 'hinglish';
      u.lang = lang === 'english' ? 'en-US' : 'hi-IN';
      u.rate = 0.9;
      u.onend = () => setSpeaking(null);
      u.onerror = () => setSpeaking(null);
      window.speechSynthesis.speak(u);
      setSpeaking(id);
    }
  };

  // ── Mic ──
  const handleMic = () => {
    if (micState === 'listening') { recognitionRef.current?.abort(); setMicState('idle'); return; }
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) { alert('Chrome use करें।'); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SR(); recognitionRef.current = r;
    const lang = localStorage.getItem('app_language') || 'hinglish';
    r.lang = lang === 'english' ? 'en-US' : 'hi-IN';
    r.interimResults = true; r.continuous = false;
    let final = ''; let autoStop;
    r.onstart = () => { setMicState('listening'); final = ''; autoStop = setTimeout(() => r.stop(), 10000); };
    r.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      setInput(final + interim);
      if (final.trim()) { clearTimeout(autoStop); autoStop = setTimeout(() => r.stop(), 800); }
    };
    r.onspeechend = () => { clearTimeout(autoStop); r.stop(); };
    r.onend = () => { clearTimeout(autoStop); setMicState('idle'); recognitionRef.current = null; if (final.trim()) { setInput(''); send(final.trim()); } else setInput(''); };
    r.onerror = () => { clearTimeout(autoStop); setMicState('idle'); recognitionRef.current = null; setInput(''); };
    r.start();
  };

  const copyMsg = (id, text) => {
    try { navigator.clipboard?.writeText(text); } catch {}
    setCopied(prev => ({ ...prev, [id]: true }));
    setTimeout(() => setCopied(prev => ({ ...prev, [id]: false })), 2000);
  };

  const newChat = () => {
    window.speechSynthesis?.cancel(); setSpeaking(null);
    const sid = 'session_' + Date.now();
    localStorage.setItem('current_session_id', sid);
    historyRef.current = [];
    const lang = localStorage.getItem('app_language') || 'hinglish';
    setMessages([{ id: Date.now(), sender: 'ai', text: lang === 'english' ? 'New chat started! Ask me anything.' : 'नई chat शुरू! क्या पूछना है?' }]);
    setFeedback({}); setInput('');
  };

  const showSend = input.trim().length > 0;
  const lang = localStorage.getItem('app_language') || 'hinglish';

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigate('dashboard')}><Text style={s.back}>← {lang === 'english' ? 'Back' : 'वापस'}</Text></TouchableOpacity>
        <View style={s.titleRow}>
          <Text style={s.title}>DRISHTI</Text>
          {thinking && <View style={s.thinkDot} />}
        </View>
        <View style={s.headerRight}>
          <TouchableOpacity onPress={newChat} style={s.hBtn}><Ionicons name="add" size={20} color="#00d4ff" /></TouchableOpacity>
          <TouchableOpacity onPress={() => navigate('history')} style={s.hBtn}><Ionicons name="time-outline" size={18} color="#00d4ff" /></TouchableOpacity>
        </View>
      </View>

      <ScrollView ref={scrollRef} style={s.msgs} showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
        {messages.map(msg => (
          <View key={msg.id}>
            <View style={[s.bubble, msg.sender === 'user' ? s.userBubble : s.aiBubble]}>
              {msg.sender === 'ai' && <Text style={s.aiLabel}>🔮 DRISHTI</Text>}
              <Text style={msg.sender === 'user' ? s.userTxt : s.aiTxt}>{msg.text}</Text>
            </View>
            {msg.sender === 'ai' && (
              <View style={s.acts}>
                <TouchableOpacity style={s.act} onPress={() => copyMsg(msg.id, msg.text)}>
                  <Ionicons name={copied[msg.id] ? 'checkmark' : 'copy-outline'} size={15} color={copied[msg.id] ? '#10b981' : '#4a7aaa'} />
                </TouchableOpacity>
                <TouchableOpacity style={[s.act, speaking === msg.id && s.actSpeaking]} onPress={() => toggleSpeak(msg.id, msg.text)}>
                  <Ionicons name={speaking === msg.id ? 'stop-circle-outline' : 'play-outline'} size={15} color={speaking === msg.id ? '#00d4ff' : '#4a7aaa'} />
                </TouchableOpacity>
                <TouchableOpacity style={[s.act, feedback[msg.id]?.like && s.actLiked]}
                  onPress={() => setFeedback(p => ({ ...p, [msg.id]: { like: !p[msg.id]?.like, dislike: false } }))}>
                  <Ionicons name={feedback[msg.id]?.like ? 'thumbs-up' : 'thumbs-up-outline'} size={15} color={feedback[msg.id]?.like ? '#10b981' : '#4a7aaa'} />
                </TouchableOpacity>
                <TouchableOpacity style={[s.act, feedback[msg.id]?.dislike && s.actDisliked]}
                  onPress={() => setFeedback(p => ({ ...p, [msg.id]: { like: false, dislike: !p[msg.id]?.dislike } }))}>
                  <Ionicons name={feedback[msg.id]?.dislike ? 'thumbs-down' : 'thumbs-down-outline'} size={15} color={feedback[msg.id]?.dislike ? '#ff4444' : '#4a7aaa'} />
                </TouchableOpacity>
                <TouchableOpacity style={s.act} onPress={() => { const last = [...messages].reverse().find(m=>m.sender==='user'); if(last) send(last.text); }}>
                  <Ionicons name="refresh-outline" size={15} color="#4a7aaa" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
        {thinking && (
          <View style={s.aiBubble}>
            <Text style={s.aiLabel}>🔮 DRISHTI</Text>
            <Text style={s.thinkingTxt}>● ● ●</Text>
          </View>
        )}
      </ScrollView>

      <View style={s.inputRow}>
        <TextInput
          style={[s.input, micState === 'listening' && s.inputActive]}
          placeholder={micState === 'listening' ? '🎙️ बोलिए...' : getPlaceholder()}
          placeholderTextColor={micState === 'listening' ? '#00d4ff' : '#3a5a8a'}
          value={input} onChangeText={setInput}
          onSubmitEditing={() => send(input)}
          editable={!thinking && micState === 'idle'} multiline
        />
        {showSend ? (
          <TouchableOpacity style={[s.sendBtn, thinking && {opacity:0.4}]} onPress={() => send(input)} disabled={thinking}>
            <Ionicons name="send" size={20} color="#000" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[s.micBtn, micState==='listening' && s.micActive]} onPress={handleMic}>
            <Ionicons name={micState==='listening' ? 'stop' : 'mic-outline'} size={22} color={micState==='listening' ? '#00d4ff' : '#4a7aaa'} />
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: {flex:1, backgroundColor:'#050918'},
  header: {flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:20, paddingTop:50, paddingBottom:15, borderBottomWidth:1, borderBottomColor:'#0d1f3c'},
  back: {color:'#00d4ff', fontSize:15},
  titleRow: {flexDirection:'row', alignItems:'center', gap:8},
  title: {color:'#fff', fontSize:18, fontWeight:'900', letterSpacing:3},
  thinkDot: {width:8, height:8, borderRadius:4, backgroundColor:'#f59e0b'},
  headerRight: {flexDirection:'row', gap:8},
  hBtn: {width:36, height:36, borderRadius:18, backgroundColor:'#0d1f3c', borderWidth:1, borderColor:'#1a3a6a', justifyContent:'center', alignItems:'center'},
  msgs: {flex:1, paddingHorizontal:15, paddingTop:8},
  bubble: {marginTop:10, paddingHorizontal:14, paddingVertical:10, borderRadius:16, maxWidth:'85%'},
  aiBubble: {alignSelf:'flex-start', backgroundColor:'#0d1f3c', borderWidth:1, borderColor:'#1a3a6a', borderBottomLeftRadius:4, marginTop:10, paddingHorizontal:14, paddingVertical:10, maxWidth:'85%', borderRadius:16},
  userBubble: {alignSelf:'flex-end', backgroundColor:'#00d4ff', borderBottomRightRadius:4},
  aiLabel: {color:'#00d4ff', fontSize:11, marginBottom:4, fontWeight:'bold'},
  aiTxt: {color:'#fff', fontSize:14, lineHeight:21},
  userTxt: {color:'#000', fontSize:14, lineHeight:21, fontWeight:'500'},
  thinkingTxt: {color:'#00d4ff', fontSize:20, letterSpacing:4},
  acts: {flexDirection:'row', paddingLeft:8, paddingBottom:6, paddingTop:4, gap:4},
  act: {padding:7, backgroundColor:'#0a1628', borderRadius:8, borderWidth:1, borderColor:'#1a3a6a'},
  actSpeaking: {borderColor:'#00d4ff', backgroundColor:'#071428'},
  actLiked: {borderColor:'#10b981', backgroundColor:'#0a2a1a'},
  actDisliked: {borderColor:'#ff4444', backgroundColor:'#2a0a0a'},
  inputRow: {flexDirection:'row', alignItems:'flex-end', paddingHorizontal:12, paddingVertical:12, borderTopWidth:1, borderTopColor:'#0d1f3c', gap:8},
  input: {flex:1, backgroundColor:'#0d1f3c', color:'#fff', paddingHorizontal:15, paddingVertical:12, borderRadius:22, fontSize:14, borderWidth:1, borderColor:'#1a3a6a', maxHeight:120},
  inputActive: {borderColor:'#00d4ff', backgroundColor:'#071428'},
  sendBtn: {width:46, height:46, borderRadius:23, backgroundColor:'#00d4ff', justifyContent:'center', alignItems:'center'},
  micBtn: {width:46, height:46, borderRadius:23, backgroundColor:'#0d1f3c', justifyContent:'center', alignItems:'center', borderWidth:1, borderColor:'#1a3a6a'},
  micActive: {borderColor:'#00d4ff', backgroundColor:'#071428'},
});
