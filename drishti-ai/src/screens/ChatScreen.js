import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, Modal,
} from 'react-native';
import ChatEye from '../components/ChatEye';
import CopyBox from '../components/CopyBox';
import { sendMessage } from '../services/apiService';
import {
  saveMessage, getFullHistory, getContext,
  getCurrentSessionId, createNewSession,
} from '../services/memoryService';

const pickFile = (accept) => new Promise((resolve) => {
  const el = document.createElement('input');
  el.type = 'file';
  el.accept = accept;
  el.style.display = 'none';
  document.body.appendChild(el);
  el.onchange = async (e) => {
    const file = e.target.files?.[0];
    document.body.removeChild(el);
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = (ev) => resolve({
      name: file.name, type: file.type, size: file.size,
      content: ev.target.result, isImage: file.type.startsWith('image/'),
    });
    if (file.type.startsWith('image/')) reader.readAsDataURL(file);
    else reader.readAsText(file);
  };
  el.oncancel = () => { document.body.removeChild(el); resolve(null); };
  el.click();
});

export default function ChatScreen({ navigate }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [micState, setMicState] = useState('idle');
  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);
  const sessionIdRef = useRef(getCurrentSessionId());

  const loadMessages = () => {
    sessionIdRef.current = getCurrentSessionId();
    const saved = getFullHistory(sessionIdRef.current);
    if (saved.length > 0) {
      setMessages(saved.map((m, i) => ({
        id: m.timestamp || i,
        text: m.content,
        sender: m.role === 'assistant' ? 'ai' : 'user',
        copyContent: null,
      })));
    } else {
      setMessages([{
        id: 1,
        text: 'नमस्ते! 🙏 मैं DRISHTI हूँ।\n\n📎 + से Photo/PDF भेजो\n🎙 Mic से बोलो - auto send!\n\nSettings में API key add करें या free messages use karo।',
        sender: 'ai', copyContent: null,
      }]);
    }
  };

  useEffect(() => { loadMessages(); }, []);

  const handleNewChat = () => {
    createNewSession();
    loadMessages();
  };

  const sendChatMessage = async (text, fileData = null) => {
    if (!text.trim() && !fileData) return;

    let messageForAI = text.trim();
    if (fileData) {
      if (fileData.isImage) {
        messageForAI = `[Image: ${fileData.name}]\n${text || 'इस image के बारे में बताओ।'}`;
      } else {
        const preview = typeof fileData.content === 'string' ? fileData.content.substring(0, 3000) : '[Binary]';
        messageForAI = `[File: ${fileData.name}]\n${preview}\n\n${text || 'इस file के बारे में बताओ।'}`;
      }
      setAttachedFile(null);
    }

    if (text.trim()) {
      setMessages(prev => [...prev, { id: Date.now(), text: text.trim(), sender: 'user', copyContent: null }]);
    }
    setInput('');
    setThinking(true);

    try {
      const sid = sessionIdRef.current;
      const history = getContext(sid);
      saveMessage('user', messageForAI, sid);
      const result = await sendMessage(messageForAI, history);
      const responseText = result.text || 'कुछ गड़बड़ हुई। दोबारा try करें! 🔄';
      saveMessage('assistant', responseText, sid);

      setMessages(prev => [...prev, { id: Date.now() + 1, text: responseText, sender: 'ai', copyContent: null }]);
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now() + 1, text: 'कुछ गड़बड़ हुई। दोबारा try करें! 🔄', sender: 'ai', copyContent: null }]);
    } finally {
      setThinking(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const handleMic = () => {
    if (micState === 'listening') {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
      setMicState('idle');
      return;
    }
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Chrome browser use करें।');
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = 'hi-IN';
    recognition.interimResults = true;
    recognition.continuous = false;
    let finalTranscript = '';
    recognition.onstart = () => { setMicState('listening'); finalTranscript = ''; };
    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
        else interim += event.results[i][0].transcript;
      }
      setInput(finalTranscript + interim);
    };
    recognition.onspeechend = () => recognition.stop();
    recognition.onend = () => {
      setMicState('idle');
      recognitionRef.current = null;
      const textToSend = finalTranscript.trim();
      if (textToSend) { setInput(''); sendChatMessage(textToSend, attachedFile); }
      else setInput('');
    };
    recognition.onerror = () => { setMicState('idle'); recognitionRef.current = null; setInput(''); };
    recognition.start();
  };

  const handleAttach = async (accept) => {
    setShowAttachMenu(false);
    const file = await pickFile(accept);
    if (!file) return;
    setAttachedFile(file);
    setMessages(prev => [...prev, {
      id: Date.now(), text: `${file.isImage ? '🖼️' : '📄'} ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
      sender: 'user', isFile: true, copyContent: null,
    }]);
  };

  const handleSend = () => {
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    setMicState('idle');
    sendChatMessage(input, attachedFile);
  };

  const showSend = input.trim().length > 0 || attachedFile;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('dashboard')}>
          <Text style={styles.backBtn}>← वापस</Text>
        </TouchableOpacity>
        <Text style={styles.title}>DRISHTI</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleNewChat} style={styles.iconBtn}>
            <Text style={styles.iconBtnText}>＋</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigate('history')} style={styles.iconBtn}>
            <Text style={styles.iconBtnText}>🕐</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ChatEye thinking={thinking || micState === 'listening'} />

      <ScrollView ref={scrollRef} style={styles.messages} showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
        {messages.map((msg) => (
          <View key={msg.id} style={[styles.bubble, msg.sender === 'user' ? styles.userBubble : styles.aiBubble, msg.isFile && styles.fileBubble]}>
            {msg.sender === 'ai' && <Text style={styles.aiLabel}>🔮 DRISHTI</Text>}
            <Text style={msg.sender === 'user' ? styles.userText : styles.aiText}>{msg.text}</Text>
            {msg.sender === 'ai' && msg.copyContent && <CopyBox text={msg.copyContent} label={msg.copyLabel} />}
          </View>
        ))}
      </ScrollView>

      {attachedFile && (
        <View style={styles.filePreview}>
          <Text style={styles.filePreviewIcon}>{attachedFile.isImage ? '🖼️' : '📄'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.filePreviewName} numberOfLines={1}>{attachedFile.name}</Text>
            <Text style={styles.filePreviewSize}>{(attachedFile.size / 1024).toFixed(1)} KB</Text>
          </View>
          <TouchableOpacity onPress={() => setAttachedFile(null)}><Text style={styles.fileRemove}>✕</Text></TouchableOpacity>
        </View>
      )}

      <Modal visible={showAttachMenu} transparent animationType="slide" onRequestClose={() => setShowAttachMenu(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowAttachMenu(false)}>
          <View style={styles.attachMenu}>
            <Text style={styles.attachTitle}>📎 क्या भेजना है?</Text>
            {[
              { icon: '🖼️', label: 'Photo / Image', accept: 'image/*' },
              { icon: '📄', label: 'PDF Document', accept: 'application/pdf,.pdf' },
              { icon: '📝', label: 'Text / Word', accept: '.txt,.doc,.docx' },
              { icon: '📊', label: 'Excel / CSV', accept: '.xls,.xlsx,.csv' },
              { icon: '📁', label: 'Any File', accept: '*/*' },
            ].map((item, i) => (
              <TouchableOpacity key={i} style={styles.attachItem} onPress={() => handleAttach(item.accept)}>
                <Text style={styles.attachItemIcon}>{item.icon}</Text>
                <Text style={styles.attachItemLabel}>{item.label}</Text>
                <Text style={styles.attachItemArrow}>→</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAttachMenu(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={styles.inputRow}>
        <TouchableOpacity style={styles.plusBtn} onPress={() => setShowAttachMenu(true)}>
          <Text style={styles.plusIcon}>＋</Text>
        </TouchableOpacity>
        <TextInput
          style={[styles.input, micState === 'listening' && styles.inputActive]}
          placeholder={micState === 'listening' ? '🎙️ बोलिए...' : 'कुछ भी पूछो...'}
          placeholderTextColor={micState === 'listening' ? '#00d4ff' : '#3a5a8a'}
          value={input} onChangeText={setInput} onSubmitEditing={handleSend}
          editable={!thinking && micState === 'idle'}
        />
        {showSend ? (
          <TouchableOpacity style={[styles.sendBtn, thinking && { opacity: 0.4 }]} onPress={handleSend} disabled={thinking}>
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.micBtn, micState === 'listening' && styles.micBtnActive]} onPress={handleMic}>
            <Text style={styles.micIcon}>{micState === 'listening' ? '⏹' : '🎙️'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050918' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#0d1f3c' },
  backBtn: { color: '#00d4ff', fontSize: 15 },
  title: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 3 },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#0d1f3c', borderWidth: 1, borderColor: '#1a3a6a', justifyContent: 'center', alignItems: 'center' },
  iconBtnText: { fontSize: 16, color: '#00d4ff' },
  messages: { flex: 1, paddingHorizontal: 15 },
  bubble: { marginVertical: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, maxWidth: '85%' },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#0d1f3c', borderWidth: 1, borderColor: '#1a3a6a', borderBottomLeftRadius: 4 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#00d4ff', borderBottomRightRadius: 4 },
  fileBubble: { backgroundColor: '#0d2a1a', borderColor: '#10b981', borderWidth: 1, alignSelf: 'flex-end' },
  aiLabel: { color: '#00d4ff', fontSize: 11, marginBottom: 4, fontWeight: 'bold' },
  aiText: { color: '#fff', fontSize: 14, lineHeight: 20 },
  userText: { color: '#000', fontSize: 14, lineHeight: 20, fontWeight: '500' },
  filePreview: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0d2a1a', borderTopWidth: 1, borderTopColor: '#10b981', paddingHorizontal: 15, paddingVertical: 10, gap: 10 },
  filePreviewIcon: { fontSize: 22 },
  filePreviewName: { color: '#fff', fontSize: 13, fontWeight: '600' },
  filePreviewSize: { color: '#4a7aaa', fontSize: 11 },
  fileRemove: { color: '#ff4444', fontSize: 20, padding: 4 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  attachMenu: { backgroundColor: '#0d1f3c', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
  attachTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  attachItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#050918', borderRadius: 12, padding: 15, marginBottom: 10, borderWidth: 1, borderColor: '#1a3a6a' },
  attachItemIcon: { fontSize: 22, marginRight: 12 },
  attachItemLabel: { flex: 1, color: '#fff', fontSize: 15 },
  attachItemArrow: { color: '#00d4ff', fontSize: 18 },
  cancelBtn: { padding: 15, alignItems: 'center', marginTop: 5 },
  cancelText: { color: '#ff4444', fontSize: 15, fontWeight: '600' },
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#0d1f3c', gap: 8 },
  plusBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#0d1f3c', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#00d4ff' },
  plusIcon: { color: '#00d4ff', fontSize: 22, fontWeight: 'bold' },
  input: { flex: 1, backgroundColor: '#0d1f3c', color: '#fff', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 22, fontSize: 14, borderWidth: 1, borderColor: '#1a3a6a' },
  inputActive: { borderColor: '#00d4ff', backgroundColor: '#071428' },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#00d4ff', justifyContent: 'center', alignItems: 'center' },
  sendIcon: { color: '#000', fontSize: 18, fontWeight: 'bold' },
  micBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#0d1f3c', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#1a3a6a' },
  micBtnActive: { backgroundColor: '#001a2a', borderColor: '#00d4ff' },
  micIcon: { fontSize: 20 },
});
