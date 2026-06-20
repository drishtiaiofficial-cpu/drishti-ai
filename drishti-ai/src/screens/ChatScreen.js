import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';

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
            { role: 'system', content: 'तुम DRISHTI ह - Hindi AI Assistant। Hindi में जवब दो।' },
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
  const t = message.toLowerCase();
  if (t.includes('नमस्ते') || t.includes('hello')) return 'नमस्ते! 😊 Settings में API key add करें।';
  if (t.includes('upi')) return 'UPI: GPay खोलें → Pay → Number → Amount → PIN ✅';
  return 'Settings → My APIs में API key add करें! 🔑';
};

const speakText = (text) => {
  try {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new window.SpeechSynthesisUtterance(text);
    u.lang = 'hi-IN'; u.rate = 0.9;
    window.speechSynthesis.speak(u);
  } catch {}
};

export default function ChatScreen({ navigate }) {
  const [messages, setMessages] = useState([
    { id: 1, text: 'नमस्ते! 🙏 मैं DRISHTI हूँ। कुछ भी पूछो!\n\nSettings में API key add करें बेहतर जवाब के लिए।', sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [feedback, setFeedback] = useState({});
  const scrollRef = useRef(null);
  const historyRef = useRef([]);

  const send = async (text) => {
    if (!text.trim()) return;
    const userMsg = { id: Date.now(), text: text.trim(), sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setThinking(true);
    try {
      const reply = await callAPI(text.trim(), historyRef.current);
      historyRef.current = [...historyRef.current, { role: 'user', content: text }, { role: 'assistant', content: reply }].slice(-20);
      setMessages(prev => [...prev, { id: Date.now() + 1, text: reply, sender: 'ai' }]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now() + 1, text: 'Error! दोबरा try करें। 🔄', sender: 'ai' }]);
    } finally {
      setThinking(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const copyMsg = (text) => {
    try { navigator.clipboard?.writeText(text); } catch {}
  };

  const toggleFeedback = (id, type) => {
    setFeedback(prev => ({ ...prev, [id]: { ...prev[id], [type]: !prev[id]?.[type] } }));
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigate('dashboard')}><Text style={s.back}>← वापस</Text></TouchableOpacity>
        <Text style={s.title}>DRISHTI</Text>
        <View style={s.headerRight}>
          <TouchableOpacity onPress={() => { historyRef.current = []; setMessages([{ id: Date.now(), text: 'नई chat शुरू! 🙏', sender: 'ai' }]); }} style={s.hBtn}>
            <Text style={s.hBtnTxt}>＋</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigate('history')} style={s.hBtn}>
            <Text style={s.hBtnTxt}>🕐</Text>
          </TouchableOpacity>
        </View>
      </View>

      {thinking && (
        <View style={s.thinkingRow}>
          <Text style={s.thinkingTxt}>● ● ● सोच रही हूँ...</Text>
        </View>
      )}

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
                <TouchableOpacity style={[s.act, feedback[msg.id]?.like && s.actLiked]} onPress={() => toggleFeedback(msg.id, 'like')}>
                  <Text style={s.actTxt}>↑</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.act, feedback[msg.id]?.dislike && s.actDisliked]} onPress={() => toggleFeedback(msg.id, 'dislike')}>
                  <Text style={s.actTxt}>↓</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.act} onPress={() => copyMsg(msg.text)}>
                  <Text style={s.actTxt}>⎘</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.act} onPress={() => speakText(msg.text)}>
                  <Text style={s.actTxt}>♪</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          placeholder="कुछ भी पूछो..."
          placeholderTextColor="#3a5a8a"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => send(input)}
          editable={!thinking}
          multiline
        />
        <TouchableOpacity style={[s.sendBtn, (!input.trim() || thinking) && { opacity: 0.4 }]}
          onPress={() => send(input)} disabled={!input.trim() || thinking}>
          <Text style={s.sendTxt}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050918' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#0d1f3c' },
  back: { color: '#00d4ff', fontSize: 15 },
  title: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 3 },
  headerRight: { flexDirection: 'row', gap: 8 },
  hBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#0d1f3c', borderWidth: 1, borderColor: '#1a3a6a', justifyContent: 'center', alignItems: 'center' },
  hBtnTxt: { color: '#00d4ff', fontSize: 16 },
  thinkingRow: { backgroundColor: '#071428', padding: 10, alignItems: 'center' },
  thinkingTxt: { color: '#00d4ff', fontSize: 13 },
  msgs: { flex: 1, paddingHorizontal: 15 },
  bubble: { marginTop: 10, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, maxWidth: '85%' },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#0d1f3c', borderWidth: 1, borderColor: '#1a3a6a', borderBottomLeftRadius: 4 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#00d4ff', borderBottomRightRadius: 4 },
  aiLabel: { color: '#00d4ff', fontSize: 11, marginBottom: 4, fontWeight: 'bold' },
  aiTxt: { color: '#fff', fontSize: 14, lineHeight: 21 },
  userTxt: { color: '#000', fontSize: 14, lineHeight: 21, fontWeight: '500' },
  acts: { flexDirection: 'row', paddingLeft: 10, paddingBottom: 4, gap: 4 },
  act: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#0a1628', borderRadius: 8, borderWidth: 1, borderColor: '#1a3a6a' },
  actLiked: { borderColor: '#10b981', backgroundColor: '#0a2a1a' },
  actDisliked: { borderColor: '#ff4444', backgroundColor: '#2a0a0a' },
  actTxt: { color: '#4a7aaa', fontSize: 14, fontWeight: '600' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#0d1f3c', gap: 8 },
  input: { flex: 1, backgroundColor: '#0d1f3c', color: '#fff', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 22, fontSize: 14, borderWidth: 1, borderColor: '#1a3a6a', maxHeight: 100 },
  sendBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#00d4ff', justifyContent: 'center', alignItems: 'center' },
  sendTxt: { color: '#000', fontSize: 18, fontWeight: 'bold' },
});
