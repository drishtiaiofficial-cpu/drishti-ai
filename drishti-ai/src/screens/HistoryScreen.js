import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const getSessions = () => {
  try {
    const sessions = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('chat_')) {
        const history = JSON.parse(localStorage.getItem(key) || '[]');
        if (history.length > 0) {
          const lastUser = [...history].reverse().find(m => m.role === 'user');
          const last = history[history.length - 1];
          sessions.push({
            id: key.replace('chat_', ''),
            key,
            title: lastUser?.content?.slice(0, 45) || 'Chat',
            preview: last?.content?.slice(0, 60) || '',
            timestamp: last?.timestamp || 0,
            count: history.length,
          });
        }
      }
    }
    return sessions.sort((a, b) => b.timestamp - a.timestamp);
  } catch { return []; }
};

const formatTime = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yest = new Date(now); yest.setDate(now.getDate() - 1);
  const isYest = d.toDateString() === yest.toDateString();
  const time = d.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });
  if (isToday) return `आज ${time}`;
  if (isYest) return `कल ${time}`;
  return d.toLocaleDateString('hi-IN', { day: 'numeric', month: 'short' });
};

export default function HistoryScreen({ navigate }) {
  const [sessions, setSessions] = useState([]);

  useEffect(() => { setSessions(getAllSessions()); }, []);

  const openSession = (id) => {
    localStorage.setItem('current_session_id', id);
    navigate('chat');
  };

  const newChat = () => {
    const id = 'session_' + Date.now();
    localStorage.setItem('current_session_id', id);
    navigate('chat');
  };

  const deleteSession = (key) => {
    if (window.confirm('यह chat delete करें?')) {
      localStorage.removeItem(key);
      setSessions(getAllSessions());
    }
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigate('dashboard')}>
          <Text style={s.back}>← वापस</Text>
        </TouchableOpacity>
        <Text style={s.title}>🕐 Chat History</Text>
        <View style={{ width: 60 }} />
      </View>

      <TouchableOpacity style={s.newBtn} onPress={newChat}>
        <Ionicons name="add-circle-outline" size={20} color="#000" />
        <Text style={s.newBtnTxt}>नई Chat शुरू करो</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {sessions.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="chatbubbles-outline" size={50} color="#1a3a6a" />
            <Text style={s.emptyTxt}>अभी कोई पुरानी chat नहीं है</Text>
            <Text style={s.emptySub}>Chat करो, यहाँ save होती रहेगी</Text>
          </View>
        ) : (
          sessions.map((session) => (
            <TouchableOpacity
              key={session.id}
              style={s.card}
              onPress={() => openSession(session.id)}
              onLongPress={() => deleteSession(session.key)}
            >
              <View style={s.cardIcon}>
                <Ionicons name="chatbubble-outline" size={20} color="#00d4ff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.cardTitle} numberOfLines={1}>{session.title}</Text>
                <Text style={s.cardPreview} numberOfLines={1}>{session.preview}</Text>
              </View>
              <View style={s.cardMeta}>
                <Text style={s.cardTime}>{formatTime(session.timestamp)}</Text>
                <Text style={s.cardCount}>{session.count} msgs</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
        <Text style={s.hint}>Long press करो chat delete करने के लिए</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050918', paddingTop: 50 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#0d1f3c' },
  back: { color: '#00d4ff', fontSize: 15, width: 60 },
  title: { color: '#fff', fontSize: 18, fontWeight: '900' },
  newBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#00d4ff', borderRadius: 14, padding: 15, margin: 16, gap: 8 },
  newBtnTxt: { color: '#000', fontSize: 15, fontWeight: '800' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0d1f3c', borderRadius: 14, padding: 14, marginHorizontal: 16, marginBottom: 10, borderWidth: 1, borderColor: '#1a3a6a', gap: 12 },
  cardIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#071428', justifyContent: 'center', alignItems: 'center' },
  cardTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
  cardPreview: { color: '#4a7aaa', fontSize: 12, marginTop: 3 },
  cardMeta: { alignItems: 'flex-end' },
  cardTime: { color: '#00d4ff', fontSize: 11, fontWeight: '600' },
  cardCount: { color: '#4a7aaa', fontSize: 10, marginTop: 3 },
  empty: { alignItems: 'center', marginTop: 80, gap: 12 },
  emptyTxt: { color: '#4a7aaa', fontSize: 16, fontWeight: '600' },
  emptySub: { color: '#2a4a6a', fontSize: 13 },
  hint: { color: '#2a4a6a', fontSize: 11, textAlign: 'center', marginTop: 16, fontStyle: 'italic' },
});
