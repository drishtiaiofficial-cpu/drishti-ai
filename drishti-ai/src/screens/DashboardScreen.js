import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const getRecentChats = () => {
  try {
    const sessions = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith('chat_')) continue;
      const hist = JSON.parse(localStorage.getItem(key) || '[]');
      if (!hist.length) continue;
      const lastUser = [...hist].reverse().find(m => m.role === 'user');
      sessions.push({
        id: key.replace('chat_', ''), key,
        title: lastUser?.content?.slice(0, 45) || 'Chat',
        time: hist[hist.length-1]?.timestamp || 0,
        count: hist.length,
      });
    }
    // Remove duplicates by id
    const unique = Array.from(new Map(sessions.map(s => [s.id, s])).values());
    return unique.sort((a,b) => b.time - a.time).slice(0, 6);
  } catch { return []; }
};

const getProjects = () => {
  try { return JSON.parse(localStorage.getItem('drishti_projects') || '[]').slice(0, 3); }
  catch { return []; }
};

const formatTime = (ts) => {
  if (!ts) return '';
  const d = new Date(ts), now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'अभी';
  if (diff < 3600000) return Math.floor(diff/60000) + 'm पहले';
  if (d.toDateString() === now.toDateString()) return 'आज ' + d.toLocaleTimeString('hi-IN',{hour:'2-digit',minute:'2-digit'});
  const y = new Date(now); y.setDate(now.getDate()-1);
  if (d.toDateString() === y.toDateString()) return 'कल';
  return d.toLocaleDateString('hi-IN',{day:'numeric',month:'short'});
};

export default function DashboardScreen({ navigate }) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;
  const [userName, setUserName] = useState('');
  const [recentChats, setRecentChats] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    setUserName(localStorage.getItem('userName') || 'Vipul');
    setRecentChats(getRecentChats());
    setProjects(getProjects());
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const openChat = (id) => { localStorage.setItem('current_session_id', id); navigate('chat'); };
  const newChat = () => { localStorage.setItem('current_session_id', 'session_' + Date.now()); navigate('chat'); };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Header */}
        <Animated.View style={[s.header, { opacity: fade, transform: [{ translateY: slide }] }]}>
          <View>
            <Text style={s.greeting}>{greeting}</Text>
            <Text style={s.userName}>{userName}</Text>
          </View>
          <TouchableOpacity onPress={() => navigate('settings')} style={s.avatarBtn}>
            <Text style={s.avatarLetter}>{(userName[0] || 'V').toUpperCase()}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* New Chat */}
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
          <TouchableOpacity style={s.newChatBtn} onPress={newChat} activeOpacity={0.85}>
            <View style={s.newChatLeft}>
              <View style={s.newChatIcon}>
                <Ionicons name="add" size={20} color="#050918" />
              </View>
              <Text style={s.newChatTxt}>New Chat</Text>
            </View>
            <Ionicons name="arrow-forward" size={18} color="#050918" />
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Nav */}
        <Animated.View style={[s.quickRow, { opacity: fade }]}>
          {[
            { icon: 'mic', label: 'Voice', screen: 'voice', color: '#10b981', bg: '#10b98115' },
            { icon: 'eye', label: 'Guardian', screen: 'liveGuardian', color: '#8b5cf6', bg: '#8b5cf615' },
            { icon: 'folder', label: 'Projects', screen: 'projects', color: '#f59e0b', bg: '#f59e0b15' },
            { icon: 'bar-chart', label: 'Progress', screen: 'progress', color: '#3b82f6', bg: '#3b82f615' },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={s.quickItem} onPress={() => navigate(item.screen)} activeOpacity={0.7}>
              <View style={[s.quickIcon, { backgroundColor: item.bg, borderColor: item.color + '30' }]}>
                <Ionicons name={item.icon + '-outline'} size={20} color={item.color} />
              </View>
              <Text style={[s.quickLabel, { color: item.color }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Divider */}
        <View style={s.divider} />

        {/* Recent Chats */}
        <Animated.View style={{ opacity: fade }}>
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>Recent</Text>
            <TouchableOpacity onPress={() => navigate('history')}>
              <Text style={s.sectionLink}>See all</Text>
            </TouchableOpacity>
          </View>

          {recentChats.length === 0 ? (
            <TouchableOpacity style={s.emptyState} onPress={newChat}>
              <Ionicons name="chatbubble-ellipses-outline" size={28} color="#334155" />
              <Text style={s.emptyTxt}>Start your first conversation</Text>
            </TouchableOpacity>
          ) : recentChats.map(chat => (
            <TouchableOpacity key={chat.id} style={s.chatRow} onPress={() => openChat(chat.id)} activeOpacity={0.7}>
              <View style={s.chatDot} />
              <View style={{ flex: 1 }}>
                <Text style={s.chatTitle} numberOfLines={1}>{chat.title}</Text>
                <Text style={s.chatMeta}>{chat.count} messages · {formatTime(chat.time)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={14} color="#334155" />
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Divider */}
        <View style={s.divider} />

        {/* Projects */}
        <Animated.View style={{ opacity: fade }}>
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>Projects</Text>
            <TouchableOpacity onPress={() => navigate('projects')}>
              <Text style={s.sectionLink}>See all</Text>
            </TouchableOpacity>
          </View>

          {projects.length === 0 ? (
            <TouchableOpacity style={s.emptyState} onPress={() => navigate('projects')} activeOpacity={0.7}>
              <Ionicons name="folder-open-outline" size={28} color="#334155" />
              <Text style={s.emptyTxt}>Create a project to organize your work</Text>
            </TouchableOpacity>
          ) : projects.map(p => (
            <TouchableOpacity key={p.id} style={s.projectRow} onPress={() => navigate('projects')} activeOpacity={0.7}>
              <View style={s.projectIcon}>
                <Ionicons name="folder" size={16} color="#f59e0b" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.projectName} numberOfLines={1}>{p.name}</Text>
                {p.description ? <Text style={s.projectDesc} numberOfLines={1}>{p.description}</Text> : null}
              </View>
              <Ionicons name="chevron-forward" size={14} color="#334155" />
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={s.newProjectRow} onPress={() => navigate('projects')} activeOpacity={0.7}>
            <Ionicons name="add-circle-outline" size={18} color="#8b5cf6" />
            <Text style={s.newProjectTxt}>New project</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e' },
  scroll: { paddingHorizontal: 22, paddingTop: 58 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 },
  greeting: { color: '#475569', fontSize: 13, fontWeight: '500', letterSpacing: 0.3, marginBottom: 3 },
  userName: { color: '#f1f5f9', fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  avatarBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#00d4ff', justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { color: '#050918', fontSize: 17, fontWeight: '800' },
  newChatBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#00d4ff', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 16, marginBottom: 24 },
  newChatLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  newChatIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(5,9,24,0.2)', justifyContent: 'center', alignItems: 'center' },
  newChatTxt: { color: '#050918', fontSize: 16, fontWeight: '700' },
  quickRow: { flexDirection: 'row', marginBottom: 28, gap: 12 },
  quickItem: { flex: 1, alignItems: 'center', gap: 8 },
  quickIcon: { width: 50, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  quickLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.2 },
  divider: { height: 1, backgroundColor: '#1e293b', marginBottom: 22 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { color: '#f1f5f9', fontSize: 15, fontWeight: '700' },
  sectionLink: { color: '#00d4ff', fontSize: 13, fontWeight: '500' },
  chatRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  chatDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#334155' },
  chatTitle: { color: '#cbd5e1', fontSize: 14, fontWeight: '500', marginBottom: 3 },
  chatMeta: { color: '#475569', fontSize: 12 },
  projectRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  projectIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#f59e0b15', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#f59e0b30' },
  projectName: { color: '#cbd5e1', fontSize: 14, fontWeight: '600', marginBottom: 2 },
  projectDesc: { color: '#475569', fontSize: 12 },
  newProjectRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 10 },
  newProjectTxt: { color: '#8b5cf6', fontSize: 14, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 28, gap: 10, borderWidth: 1, borderColor: '#1e293b', borderRadius: 14, borderStyle: 'dashed', marginBottom: 8 },
  emptyTxt: { color: '#475569', fontSize: 13 },
});
