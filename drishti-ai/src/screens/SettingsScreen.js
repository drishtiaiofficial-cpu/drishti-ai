import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const LANGUAGES = [
  { id: 'hindi', label: 'हिंदी', desc: 'सिर्फ Hindi में जवाब' },
  { id: 'hinglish', label: 'Hinglish', desc: 'Hindi + English mix' },
  { id: 'english', label: 'English', desc: 'Only English replies' },
];

const VOICES = [
  { id: 'didi', label: 'Didi 👩', desc: 'Friendly & caring' },
  { id: 'bhai', label: 'Bhai 👦', desc: 'Cool & casual' },
  { id: 'teacher', label: 'Teacher 👩‍🏫', desc: 'Clear & formal' },
  { id: 'nana', label: 'Nana 👴', desc: 'Slow & warm' },
];

export default function SettingsScreen({ navigate }) {
  const [language, setLanguage] = useState('hinglish');
  const [voice, setVoice] = useState('didi');
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [engineEnabled, setEngineEnabled] = useState(true);
  const [userName, setUserNameState] = useState('User');

  useEffect(() => {
    setLanguage(localStorage.getItem('app_language') || 'hinglish');
    setVoice(localStorage.getItem('app_voice') || 'didi');
    setNotifications(localStorage.getItem('notifications') !== 'false');
    setDarkMode(localStorage.getItem('dark_mode') !== 'false');
    setEngineEnabled(localStorage.getItem('engine_enabled') !== 'false');
    setUserNameState(localStorage.getItem('userName') || 'User');
  }, []);

  const setLang = (id) => { setLanguage(id); localStorage.setItem('app_language', id); };
  const setVoiceOpt = (id) => { setVoice(id); localStorage.setItem('app_voice', id); };
  const toggleEngine = (v) => { setEngineEnabled(v); localStorage.setItem('engine_enabled', v.toString()); };
  const toggleNotif = (v) => { setNotifications(v); localStorage.setItem('notifications', v.toString()); };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigate('dashboard')}>
          <Text style={s.back}>← वापस</Text>
        </TouchableOpacity>
        <Text style={s.title}>Settings</Text>
        <View style={{width:60}} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Profile */}
        <View style={s.section}>
          <View style={s.profileCard}>
            <View style={s.avatar}>
              <Text style={s.avatarTxt}>{userName.charAt(0).toUpperCase()}</Text>
            </View>
            <View>
              <Text style={s.profileName}>{userName}</Text>
              <Text style={s.profileEmail}>{localStorage.getItem('userEmail') || 'drishtiaiofficial@gmail.com'}</Text>
              <View style={s.badge}><Text style={s.badgeTxt}>Free Plan</Text></View>
            </View>
          </View>
        </View>

        <TouchableOpacity style={s.upgradeBtn}>
          <Ionicons name="flash" size={18} color="#000" />
          <Text style={s.upgradeTxt}>Pro में Upgrade करो — ₹99/month</Text>
        </TouchableOpacity>

        {/* Language */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>🌐 Language</Text>
          <Text style={s.sectionSub}>DRISHTI किस भाषा में जवाब दे?</Text>
          {LANGUAGES.map(l => (
            <TouchableOpacity key={l.id} style={[s.optionCard, language===l.id && s.optionSelected]}
              onPress={() => setLang(l.id)}>
              <View style={{flex:1}}>
                <Text style={s.optionLabel}>{l.label}</Text>
                <Text style={s.optionDesc}>{l.desc}</Text>
              </View>
              {language===l.id && <Ionicons name="checkmark-circle" size={22} color="#00d4ff" />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Voice */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>🎙️ DRISHTI की आवाज़</Text>
          <Text style={s.sectionSub}>जब DRISHTI बोले तो किसकी आवाज़ हो?</Text>
          <View style={s.voiceGrid}>
            {VOICES.map(v => (
              <TouchableOpacity key={v.id} style={[s.voiceCard, voice===v.id && s.voiceSelected]}
                onPress={() => setVoiceOpt(v.id)}>
                <Text style={s.voiceLabel}>{v.label}</Text>
                <Text style={s.voiceDesc}>{v.desc}</Text>
                {voice===v.id && <Ionicons name="checkmark-circle" size={18} color="#00d4ff" style={{marginTop:6}} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* API */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>🔑 My APIs (BYOK)</Text>
          <Text style={s.sectionSub}>अपनी API key add करो — बिल्कुल FREE unlimited!</Text>
          <TouchableOpacity style={s.apiBtn} onPress={() => navigate('byok')}>
            <Ionicons name="key-outline" size={20} color="#00d4ff" />
            <Text style={s.apiBtnTxt}>APIs Manage करो</Text>
            <Ionicons name="chevron-forward" size={16} color="#4a7aaa" />
          </TouchableOpacity>
        </View>

        {/* Engine */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>⚙️ DRISHTI Engine</Text>
          <Text style={s.sectionSub}>जब BYOK API fail हो — Engine automatically जवाब देगा (20 free/day)</Text>
          <View style={s.toggleCard}>
            <View style={{flex:1}}>
              <Text style={s.toggleLabel}>{engineEnabled ? '🟢 Engine ON' : '🔴 Engine OFF'}</Text>
              <Text style={s.toggleDesc}>{engineEnabled ? 'Auto-fallback चालू' : 'सिर्फ BYOK से जवाब'}</Text>
            </View>
            <Switch value={engineEnabled} onValueChange={toggleEngine}
              trackColor={{false:'#1a3a6a', true:'#00d4ff'}}
              thumbColor={engineEnabled ? '#fff' : '#4a7aaa'} />
          </View>
        </View>

        {/* General */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>🔧 General</Text>
          <View style={s.toggleCard}>
            <View style={{flex:1}}>
              <Text style={s.toggleLabel}>🔔 Notifications</Text>
              <Text style={s.toggleDesc}>Daily reminder आएगा</Text>
            </View>
            <Switch value={notifications} onValueChange={toggleNotif}
              trackColor={{false:'#1a3a6a', true:'#00d4ff'}}
              thumbColor={notifications ? '#fff' : '#4a7aaa'} />
          </View>
        </View>

        {/* Legal */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>⚖️ Legal & Support</Text>
          {[
            {label:'📋 Terms of Service', screen:'legal'},
            {label:'🔒 Privacy Policy', screen:'legal'},
            {label:'❓ Help & FAQ', screen:'help'},
            {label:'🗑️ सारा Data Reset करो', screen:null},
          ].map((item,i) => (
            <TouchableOpacity key={i} style={s.legalItem}
              onPress={() => item.screen ? navigate(item.screen) : (localStorage.clear(), navigate('login'))}>
              <Text style={s.legalTxt}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color="#4a7aaa" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={s.logoutBtn} onPress={() => navigate('login')}>
          <Ionicons name="log-out-outline" size={20} color="#ff4444" />
          <Text style={s.logoutTxt}>Logout</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {flex:1, backgroundColor:'#050918', paddingTop:50},
  header: {flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:20, paddingBottom:15, borderBottomWidth:1, borderBottomColor:'#0d1f3c'},
  back: {color:'#00d4ff', fontSize:15, width:60},
  title: {color:'#fff', fontSize:18, fontWeight:'900'},
  section: {marginHorizontal:20, marginTop:24},
  sectionTitle: {color:'#fff', fontSize:16, fontWeight:'800', marginBottom:4},
  sectionSub: {color:'#4a7aaa', fontSize:12, marginBottom:12},
  profileCard: {flexDirection:'row', alignItems:'center', backgroundColor:'#0d1f3c', borderRadius:16, padding:16, gap:14, borderWidth:1, borderColor:'#1a3a6a'},
  avatar: {width:56, height:56, borderRadius:28, backgroundColor:'#00d4ff', justifyContent:'center', alignItems:'center'},
  avatarTxt: {color:'#000', fontSize:22, fontWeight:'900'},
  profileName: {color:'#fff', fontSize:18, fontWeight:'bold'},
  profileEmail: {color:'#4a7aaa', fontSize:12, marginTop:2},
  badge: {backgroundColor:'#1a3a6a', borderRadius:6, paddingHorizontal:8, paddingVertical:3, marginTop:5, alignSelf:'flex-start'},
  badgeTxt: {color:'#00d4ff', fontSize:11, fontWeight:'bold'},
  upgradeBtn: {flexDirection:'row', alignItems:'center', justifyContent:'center', marginHorizontal:20, marginTop:14, backgroundColor:'#00d4ff', borderRadius:14, padding:15, gap:8},
  upgradeTxt: {color:'#000', fontSize:15, fontWeight:'800'},
  optionCard: {flexDirection:'row', alignItems:'center', backgroundColor:'#0d1f3c', borderRadius:12, padding:14, marginBottom:8, borderWidth:1, borderColor:'#1a3a6a'},
  optionSelected: {borderColor:'#00d4ff', backgroundColor:'#071428'},
  optionLabel: {color:'#fff', fontSize:15, fontWeight:'700'},
  optionDesc: {color:'#4a7aaa', fontSize:12, marginTop:2},
  voiceGrid: {flexDirection:'row', flexWrap:'wrap', gap:10},
  voiceCard: {width:'47%', backgroundColor:'#0d1f3c', borderRadius:12, padding:14, borderWidth:1, borderColor:'#1a3a6a'},
  voiceSelected: {borderColor:'#00d4ff', backgroundColor:'#071428'},
  voiceLabel: {color:'#fff', fontSize:14, fontWeight:'700'},
  voiceDesc: {color:'#4a7aaa', fontSize:11, marginTop:3},
  apiBtn: {flexDirection:'row', alignItems:'center', backgroundColor:'#0d1f3c', borderRadius:12, padding:15, borderWidth:1, borderColor:'#00d4ff', gap:10},
  apiBtnTxt: {flex:1, color:'#00d4ff', fontSize:15, fontWeight:'600'},
  toggleCard: {flexDirection:'row', alignItems:'center', backgroundColor:'#0d1f3c', borderRadius:12, padding:14, borderWidth:1, borderColor:'#1a3a6a'},
  toggleLabel: {color:'#fff', fontSize:14, fontWeight:'600'},
  toggleDesc: {color:'#4a7aaa', fontSize:12, marginTop:2},
  legalItem: {flexDirection:'row', alignItems:'center', backgroundColor:'#0d1f3c', borderRadius:12, padding:14, marginBottom:8, borderWidth:1, borderColor:'#1a3a6a'},
  legalTxt: {flex:1, color:'#fff', fontSize:14},
  logoutBtn: {flexDirection:'row', alignItems:'center', justifyContent:'center', margin:20, backgroundColor:'#1a0a0a', borderRadius:14, padding:15, borderWidth:1, borderColor:'#ff4444', gap:8, marginBottom:40},
  logoutTxt: {color:'#ff4444', fontSize:16, fontWeight:'bold'},
});
