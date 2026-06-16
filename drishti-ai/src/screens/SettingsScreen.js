import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ScrollView, Switch,
} from 'react-native';

const VOICES = [
  { id: 'dadi', name: 'दादी 👵', desc: 'धीमी, मीठी आवाज़' },
  { id: 'maa', name: 'मां 👩', desc: 'प्यार भरी आवाज़' },
  { id: 'didi', name: 'दीदी 👧', desc: 'Friendly, caring' },
  { id: 'bhai', name: 'भाई 👦', desc: 'Cool, casual' },
  { id: 'teacher', name: 'Teacher 👩‍🏫', desc: 'Clear, formal' },
  { id: 'nana', name: 'नाना 👴', desc: 'Slow, warm' },
];

const LANGUAGES = [
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
];

export default function SettingsScreen({ navigate }) {
  const [hindiMode, setHindiMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState('didi');
  const [selectedLang, setSelectedLang] = useState('hi');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPlan, setUserPlan] = useState('free');

  useEffect(() => {
    setUserName(localStorage.getItem('userName') || 'User');
    setUserEmail(localStorage.getItem('userEmail') || '');
    setUserPlan(localStorage.getItem('userPlan') || 'free');
    setSelectedVoice(localStorage.getItem('selectedVoice') || 'didi');
    setSelectedLang(localStorage.getItem('appLanguage') || 'hi');
  }, []);

  const handleVoiceSelect = (id) => {
    setSelectedVoice(id);
    localStorage.setItem('selectedVoice', id);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const configs = {
        dadi: { rate: 0.65, pitch: 1.4 },
        maa: { rate: 0.78, pitch: 1.25 },
        didi: { rate: 0.95, pitch: 1.15 },
        bhai: { rate: 1.0, pitch: 0.82 },
        teacher: { rate: 0.88, pitch: 1.0 },
        nana: { rate: 0.6, pitch: 1.3 },
      };
      const cfg = configs[id] || configs.didi;
      const u = new SpeechSynthesisUtterance('नमस्ते! मैं दृष्टि हूँ।');
      u.lang = 'hi-IN';
      u.rate = cfg.rate;
      u.pitch = cfg.pitch;
      window.speechSynthesis.speak(u);
    }
  };

  const handleLogout = () => {
    const lang = localStorage.getItem('appLanguage');
    const voice = localStorage.getItem('selectedVoice');
    localStorage.clear();
    if (lang) localStorage.setItem('appLanguage', lang);
    if (voice) localStorage.setItem('selectedVoice', voice);
    navigate('login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('dashboard')}>
          <Text style={styles.backBtn}>← वापस</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>⚙️ Settings</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Profile */}
        <View style={styles.section}>
          <View style={styles.profileBox}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{userName}</Text>
              <Text style={styles.profileEmail}>{userEmail}</Text>
              <View style={styles.planBadge}>
                <Text style={styles.planText}>
                  {userPlan === 'pro' ? '⭐ Pro Plan' : '🆓 Free Plan'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Upgrade */}
        <TouchableOpacity style={styles.upgradeBtn}>
          <Text style={styles.upgradeText}>
            ⚡ Pro में Upgrade करो - ₹99/month
          </Text>
        </TouchableOpacity>

        {/* Language */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌐 Language / भाषा</Text>
          <View style={styles.langRow}>
            {LANGUAGES.map(lang => (
              <TouchableOpacity
                key={lang.code}
                style={[styles.langBtn,
                  selectedLang === lang.code && styles.langBtnActive]}
                onPress={() => {
                  setSelectedLang(lang.code);
                  localStorage.setItem('appLanguage', lang.code);
                }}
              >
                <Text style={styles.langFlag}>{lang.flag}</Text>
                <Text style={[styles.langName,
                  selectedLang === lang.code && styles.langNameActive]}>
                  {lang.name}
                </Text>
                {selectedLang === lang.code && (
                  <Text style={styles.check}>✅</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Voice */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎙️ DRISHTI की आवाज़</Text>
          <Text style={styles.sectionSub}>Select करो → preview सुनाई देगा</Text>
          {VOICES.map(v => (
            <TouchableOpacity
              key={v.id}
              style={[styles.voiceItem,
                selectedVoice === v.id && styles.voiceItemSelected]}
              onPress={() => handleVoiceSelect(v.id)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.voiceName}>{v.name}</Text>
                <Text style={styles.voiceDesc}>{v.desc}</Text>
              </View>
              {selectedVoice === v.id && <Text>✅</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {/* Toggles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 General</Text>
          {[
            { key: 'hindiMode', label: '🌐 Hindi Mode',
              desc: 'Hindi में जवाब मिलेगा',
              val: hindiMode, set: setHindiMode },
            { key: 'notifications', label: '🔔 Notifications',
              desc: 'Daily reminder आएगा',
              val: notifications, set: setNotifications },
            { key: 'darkMode', label: '🌙 Dark Mode',
              desc: 'Dark theme रहेगा',
              val: darkMode, set: setDarkMode },
          ].map((item, i) => (
            <View key={i} style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleLabel}>{item.label}</Text>
                <Text style={styles.toggleDesc}>{item.desc}</Text>
              </View>
              <Switch
                value={item.val}
                onValueChange={(v) => {
                  item.set(v);
                  localStorage.setItem(item.key, v.toString());
                }}
                trackColor={{ false: '#1a3a6a', true: '#00d4ff' }}
                thumbColor={item.val ? '#fff' : '#4a7aaa'}
              />
            </View>
          ))}
        </View>

        {/* BYOK */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🤖 My APIs (BYOK)</Text>
          <Text style={styles.sectionSub}>
            7 slots • कोई भी API • Unlimited use
          </Text>
          <TouchableOpacity
            style={styles.linkBtn}
            onPress={() => navigate('byok')}
          >
            <Text style={styles.linkBtnText}>🔑 APIs Manage करो</Text>
            <Text style={styles.linkArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.linkBtn, { marginTop: 8 }]}
            onPress={() => navigate('apiDashboard')}
          >
            <Text style={styles.linkBtnText}>📊 API Usage Dashboard</Text>
            <Text style={styles.linkArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Legal & Help */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 Help & Legal</Text>
          {[
            { icon: '❓', label: 'Help & FAQ', screen: 'help' },
            { icon: '📋', label: 'Terms of Service', screen: 'legal' },
            { icon: '🔒', label: 'Privacy Policy', screen: 'legal' },
            { icon: '🔮', label: 'About DRISHTI', screen: 'legal' },
          ].map((item, i) => (
            <TouchableOpacity
              key={i}
              style={styles.legalItem}
              onPress={() => navigate(item.screen)}
            >
              <Text style={styles.legalIcon}>{item.icon}</Text>
              <Text style={styles.legalText}>{item.label}</Text>
              <Text style={styles.legalArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050918', paddingTop: 50 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 20,
    paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#0d1f3c',
  },
  backBtn: { color: '#00d4ff', fontSize: 15, width: 60 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
  section: { marginHorizontal: 20, marginTop: 25 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 8 },
  sectionSub: { color: '#4a7aaa', fontSize: 12, marginBottom: 12 },
  profileBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0d1f3c', borderRadius: 16,
    padding: 16, gap: 15,
    borderWidth: 1, borderColor: '#1a3a6a',
  },
  avatar: {
    width: 55, height: 55, borderRadius: 27.5,
    backgroundColor: '#00d4ff',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#000', fontSize: 22, fontWeight: '900' },
  profileName: { color: '#fff', fontSize: 18, fontWeight: '700' },
  profileEmail: { color: '#4a7aaa', fontSize: 13, marginTop: 2 },
  planBadge: {
    backgroundColor: '#1a3a6a', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
    marginTop: 5, alignSelf: 'flex-start',
  },
  planText: { color: '#00d4ff', fontSize: 11, fontWeight: '700' },
  upgradeBtn: {
    marginHorizontal: 20, marginTop: 15,
    backgroundColor: '#00d4ff', borderRadius: 14,
    padding: 15, alignItems: 'center',
  },
  upgradeText: { color: '#000', fontSize: 15, fontWeight: '800' },
  langRow: { flexDirection: 'row', gap: 12 },
  langBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0d1f3c', borderRadius: 14,
    padding: 14, gap: 8,
    borderWidth: 1, borderColor: '#1a3a6a',
  },
  langBtnActive: { borderColor: '#00d4ff', borderWidth: 2 },
  langFlag: { fontSize: 22 },
  langName: { flex: 1, color: '#4a7aaa', fontSize: 14, fontWeight: '600' },
  langNameActive: { color: '#fff' },
  check: { fontSize: 16 },
  voiceItem: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', backgroundColor: '#0d1f3c',
    borderRadius: 12, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: '#1a3a6a',
  },
  voiceItemSelected: { borderColor: '#00d4ff', borderWidth: 2 },
  voiceName: { color: '#fff', fontSize: 15, fontWeight: '600' },
  voiceDesc: { color: '#4a7aaa', fontSize: 12, marginTop: 2 },
  toggleRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', backgroundColor: '#0d1f3c',
    borderRadius: 12, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: '#1a3a6a',
  },
  toggleLabel: { color: '#fff', fontSize: 14, fontWeight: '600' },
  toggleDesc: { color: '#4a7aaa', fontSize: 12, marginTop: 2 },
  linkBtn: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0d1f3c', borderRadius: 12,
    padding: 15, borderWidth: 1, borderColor: '#00d4ff',
  },
  linkBtnText: { color: '#00d4ff', fontSize: 14, fontWeight: '600' },
  linkArrow: { color: '#00d4ff', fontSize: 18 },
  legalItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0d1f3c', borderRadius: 12,
    padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: '#1a3a6a', gap: 12,
  },
  legalIcon: { fontSize: 20 },
  legalText: { flex: 1, color: '#fff', fontSize: 14 },
  legalArrow: { color: '#4a7aaa', fontSize: 16 },
  logoutBtn: {
    margin: 20, backgroundColor: '#1a0a0a',
    borderRadius: 14, padding: 15, alignItems: 'center',
    borderWidth: 1, borderColor: '#ff4444', marginBottom: 20,
  },
  logoutText: { color: '#ff4444', fontSize: 16, fontWeight: '700' },
});
