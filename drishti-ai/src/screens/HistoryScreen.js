import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ScrollView, Alert,
} from 'react-native';
import {
  getSessions, setCurrentSessionId,
  createNewSession, deleteSession,
} from '../services/memoryService';

const formatTime = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  const time = d.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });
  if (isToday) return `आज, ${time}`;
  if (isYesterday) return `कल, ${time}`;
  return d.toLocaleDateString('hi-IN', { day: 'numeric', month: 'short' });
};

export default function HistoryScreen({ navigate }) {
  const [sessions, setSessions] = useState([]);

  const load = () => setSessions(getSessions());

  useEffect(() => { load(); }, []);

  const openSession = (id) => {
    setCurrentSessionId(id);
    navigate('chat');
  };

  const startNewChat = () => {
    createNewSession();
    navigate('chat');
  };

  const removeSession = (id) => {
    if (typeof window !== 'undefined' && window.confirm) {
      if (!window.confirm('यह chat delete करनी है?')) return;
    }
    deleteSession(id);
    load();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('dashboard')}>
          <Text style={styles.backBtn}>← वापस</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🕐 Chat History</Text>
        <View style={{ width: 60 }} />
      </View>

      <TouchableOpacity style={styles.newChatBtn} onPress={startNewChat}>
        <Text style={styles.newChatIcon}>＋</Text>
        <Text style={styles.newChatText}>नई Chat शुरू करो</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {sessions.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyText}>अभी कोई पुरानी chat नहीं है</Text>
          </View>
        ) : (
          sessions.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={styles.sessionCard}
              onPress={() => openSession(s.id)}
              onLongPress={() => removeSession(s.id)}
            >
              <View style={styles.sessionIcon}>
                <Text style={styles.sessionIconText}>💬</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sessionTitle} numberOfLines={1}>{s.title}</Text>
                <Text style={styles.sessionPreview} numberOfLines={1}>{s.lastMessage}</Text>
              </View>
              <View style={styles.sessionMeta}>
                <Text style={styles.sessionTime}>{formatTime(s.timestamp)}</Text>
                <Text style={styles.sessionCount}>{s.count} messages</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
        <Text style={styles.hint}>💡 Chat पर long-press करो delete करने के लिए</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050918', paddingTop: 50 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 15,
    borderBottomWidth: 1, borderBottomColor: '#0d1f3c',
  },
  backBtn: { color: '#00d4ff', fontSize: 15, width: 60 },
  title: { color: '#fff', fontSize: 18, fontWeight: '900' },
  newChatBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#00d4ff', borderRadius: 14, padding: 15,
    margin: 16, gap: 8,
  },
  newChatIcon: { color: '#000', fontSize: 18, fontWeight: '900' },
  newChatText: { color: '#000', fontSize: 15, fontWeight: '800' },
  sessionCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0d1f3c', borderRadius: 14,
    padding: 14, marginHorizontal: 16, marginBottom: 10,
    borderWidth: 1, borderColor: '#1a3a6a', gap: 12,
  },
  sessionIcon: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#071428', justifyContent: 'center', alignItems: 'center',
  },
  sessionIconText: { fontSize: 18 },
  sessionTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
  sessionPreview: { color: '#4a7aaa', fontSize: 12, marginTop: 3 },
  sessionMeta: { alignItems: 'flex-end' },
  sessionTime: { color: '#00d4ff', fontSize: 11, fontWeight: '600' },
  sessionCount: { color: '#4a7aaa', fontSize: 10, marginTop: 3 },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 50, marginBottom: 12 },
  emptyText: { color: '#4a7aaa', fontSize: 14 },
  hint: { color: '#2a4a6a', fontSize: 11, textAlign: 'center', marginTop: 10, fontStyle: 'italic' },
});
