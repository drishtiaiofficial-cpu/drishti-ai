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
        id: key.replace('chat_', ''),
        title: lastUser?.content?.slice(0, 40) || 'Chat',
        time: hist[hist.length-1]?.timestamp || 0,
        count: hist.length,
      });
    }
    return sessions.sort((a,b) => b.time - a.time).slice(0, 5);
  } catch { return []; }
};

const getProjects = () => {
  try { return JSON.parse(localStorage.getItem('drishti_projects') || '[]'); }
  catch { return []; }
};

export default function DashboardScreen({ navigate }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const [userName, setUserName] = useState('');
  const [recentChats, setRecentChats] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    setUserName(localStorage.getItem('userName') || 'Vipul');
    setRecentChats(getRecentChats());
    setProjects(getProjects());
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const openChat = (id) => {
    localStorage.setItem('current_session_id', id);
    navigate('chat');
  };

  const newChat = () => {
    const id = 'session_' + Date.now();
    localStorage.setItem('current_session_id', id);
    navigate('chat');
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'सुप्रभात ☀️';
    if (h < 17) return 'नमस्ते 👋';
    if (h < 21) return 'शुभ संध्या 🌅';
    return 'शुभ रात्रि 🌙';
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts), now = new Date();
    if (d.toDateString() === now.toDateString()) return 'आज';
    return d.toLocaleDateString('hi-IN', {day:'numeric', month:'short'});
  };

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Animated.View style={[s.header, {opacity: fadeAnim, transform:[{translateY: slideAnim}]}]}>
          <View>
            <Text style={s.greeting}>{getGreeting()}</Text>
            <Text style={s.userName}>{userName}</Text>
          </View>
          <TouchableOpacity onPress={() => navigate('settings')} style={s.settingsBtn}>
            <Ionicons name="settings-outline" size={22} color="#00d4ff" />
          </TouchableOpacity>
        </Animated.View>

        {/* New Chat Button - Claude जैसा */}
        <Animated.View style={{opacity: fadeAnim, transform:[{translateY: slideAnim}]}}>
          <TouchableOpacity style={s.newChatBtn} onPress={newChat}>
            <Ionicons name="add-circle-outline" size={22} color="#000" />
            <Text style={s.newChatTxt}>नई Chat शुरू करो</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View style={[s.quickRow, {opacity: fadeAnim}]}>
          {[
            { icon: 'mic-outline', label: 'Voice', screen: 'voice', color: '#10b981' },
            { icon: 'eye-outline', label: 'Guardian', screen: 'liveGuardian', color: '#7c3aed' },
            { icon: 'folder-outline', label: 'Projects', screen: 'projects', color: '#f59e0b' },
            { icon: 'stats-chart-outline', label: 'Progress', screen: 'progress', color: '#00d4ff' },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={s.quickItem} onPress={() => navigate(item.screen)}>
              <View style={[s.quickIcon, {backgroundColor: item.color + '22', borderColor: item.color + '44'}]}>
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>
              <Text style={s.quickLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Recent Chats - Claude जैसा */}
        <Animated.View style={{opacity: fadeAnim, paddingHorizontal: 20}}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>🕐 Recent Chats</Text>
            <TouchableOpacity onPress={() => navigate('history')}>
              <Text style={s.seeAll}>सब देखो →</Text>
            </TouchableOpacity>
          </View>

          {recentChats.length === 0 ? (
            <TouchableOpacity style={s.emptyChat} onPress={newChat}>
              <Ionicons name="chatbubble-outline" size={24} color="#1a3a6a" />
              <Text style={s.emptyChatTxt}>कोई पुरानी chat नहीं — नई शुरू करो!</Text>
            </TouchableOpacity>
          ) : (
            recentChats.map(chat => (
              <TouchableOpacity key={chat.id} style={s.chatCard} onPress={() => openChat(chat.id)}>
                <View style={s.chatIcon}>
                  <Ionicons name="chatbubble-outline" size={18} color="#00d4ff" />
                </View>
                <View style={{flex:1}}>
                  <Text style={s.chatTitle} numberOfLines={1}>{chat.title}</Text>
                  <Text style={s.chatMeta}>{chat.count} messages • {formatTime(chat.time)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#1a3a6a" />
              </TouchableOpacity>
            ))
          )}
        </Animated.View>

        {/* Projects Section */}
        <Animated.View style={{opacity: fadeAnim, paddingHorizontal: 20, marginTop: 20}}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>📁 Projects</Text>
            <TouchableOpacity onPress={() => navigate('projects')}>
              <Text style={s.seeAll}>सब देखो →</Text>
            </TouchableOpacity>
          </View>

          {projects.length === 0 ? (
            <TouchableOpacity style={s.emptyChat} onPress={() => navigate('projects')}>
              <Ionicons name="folder-open-outline" size={24} color="#1a3a6a" />
              <Text style={s.emptyChatTxt}>Project बनाओ — organized context रखो</Text>
            </TouchableOpacity>
          ) : (
            projects.slice(0,3).map(p => (
              <TouchableOpacity key={p.id} style={s.chatCard} onPress={() => navigate('projects')}>
                <View style={[s.chatIcon, {backgroundColor: '#7c3aed22'}]}>
                  <Ionicons name="folder" size={18} color="#7c3aed" />
                </View>
                <View style={{flex:1}}>
                  <Text style={s.chatTitle} numberOfLines={1}>{p.name}</Text>
                  <Text style={s.chatMeta}>{p.description || 'No description'}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#1a3a6a" />
              </TouchableOpacity>
            ))
          )}

          <TouchableOpacity style={s.newProjectBtn} onPress={() => navigate('projects')}>
            <Ionicons name="add" size={18} color="#7c3aed" />
            <Text style={s.newProjectTxt}>नया Project बनाओ</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={{height: 40}} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {flex:1, backgroundColor:'#050918', paddingTop:50},
  header: {flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:20, marginBottom:20},
  greeting: {color:'#4a7aaa', fontSize:14},
  userName: {color:'#fff', fontSize:26, fontWeight:'900'},
  settingsBtn: {width:42, height:42, borderRadius:21, backgroundColor:'#0d1f3c', justifyContent:'center', alignItems:'center', borderWidth:1, borderColor:'#1a3a6a'},
  newChatBtn: {flexDirection:'row', alignItems:'center', justifyContent:'center', backgroundColor:'#00d4ff', borderRadius:16, padding:16, marginHorizontal:20, marginBottom:16, gap:10},
  newChatTxt: {color:'#000', fontSize:16, fontWeight:'800'},
  quickRow: {flexDirection:'row', paddingHorizontal:20, marginBottom:24, gap:10},
  quickItem: {flex:1, alignItems:'center', gap:8},
  quickIcon: {width:52, height:52, borderRadius:16, justifyContent:'center', alignItems:'center', borderWidth:1},
  quickLabel: {color:'#4a7aaa', fontSize:11, fontWeight:'600'},
  sectionHeader: {flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12},
  sectionTitle: {color:'#fff', fontSize:16, fontWeight:'800'},
  seeAll: {color:'#00d4ff', fontSize:13},
  chatCard: {flexDirection:'row', alignItems:'center', backgroundColor:'#0d1f3c', borderRadius:14, padding:14, marginBottom:8, borderWidth:1, borderColor:'#1a3a6a', gap:12},
  chatIcon: {width:38, height:38, borderRadius:10, backgroundColor:'#071428', justifyContent:'center', alignItems:'center'},
  chatTitle: {color:'#fff', fontSize:14, fontWeight:'600'},
  chatMeta: {color:'#4a7aaa', fontSize:11, marginTop:2},
  emptyChat: {flexDirection:'row', alignItems:'center', backgroundColor:'#0d1f3c', borderRadius:14, padding:16, marginBottom:8, borderWidth:1, borderColor:'#1a3a6a', gap:12, borderStyle:'dashed'},
  emptyChatTxt: {color:'#4a7aaa', fontSize:13, flex:1},
  newProjectBtn: {flexDirection:'row', alignItems:'center', backgroundColor:'#0d1f3c', borderRadius:12, padding:14, borderWidth:1, borderColor:'#7c3aed44', gap:8, marginTop:4},
  newProjectTxt: {color:'#7c3aed', fontSize:14, fontWeight:'600'},
});
