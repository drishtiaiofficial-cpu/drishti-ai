import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch,
} from 'react-native';

export default function SettingsScreen({ navigate }) {
  const [hindiMode, setHindiMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [engineEnabled, setEngineState] = useState(true);
  useEffect(() => { setEngineState(localStorage.getItem('engine_enabled') !== 'false'); }, []);
  const toggleEngine = (val) => { setEngineState(val); localStorage.setItem('engine_enabled', val.toString()); };
  const [engineEnabled, setEngineEnabledState] = useState(true);

  const voices = [
    { id: 'didi', name: 'Didi 👩', desc: 'Friendly, caring' },
    { id: 'bhai', name: 'Bhai 👨', desc: 'Cool, casual' },
    { id: 'teacher', name: 'Teacher 👩‍🏫', desc: 'Clear, formal' },
    { id: 'nana', name: 'Nana 👴', desc: 'Slow, warm' },
  ];
  const [selectedVoice, setSelectedVoice] = useState('didi');

  useEffect(() => {
    const saved = localStorage.getItem('engine_enabled');
    setEngineEnabledState(saved !== 'false');
  }, []);

  const toggleEngine = (val) => {
    setEngineEnabledState(val);
    localStorage.setItem('engine_enabled', val.toString());
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

        <View style={styles.section}>
          <View style={styles.profileBox}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>V</Text>
            </View>
            <View>
              <Text style={styles.profileName}>Vipul</Text>
              <Text style={styles.profileEmail}>vipul@gmail.com</Text>
              <View style={styles.freeBadge}>
                <Text style={styles.freeBadgeText}>Free Plan</Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.upgradeBtn}>
          <Text style={styles.upgradeText}>⚡ Pro में Upgrade करो - ₹99/month</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎙️ DRISHTI की आवाज़</Text>
          {voices.map((voice) => (
            <TouchableOpacity
              key={voice.id}
              style={[styles.voiceItem, selectedVoice === voice.id && styles.voiceItemSelected]}
              onPress={() => setSelectedVoice(voice.id)}
            >
              <View>
                <Text style={styles.voiceName}>{voice.name}</Text>
                <Text style={styles.voiceDesc}>{voice.desc}</Text>
              </View>
              {selectedVoice === voice.id && <Text style={styles.checkmark}>✅</Text>}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 General</Text>
          {[
            { label: '🌐 Hindi Mode', desc: 'Hindi में जवाब मिलेग', value: hindiMode, setter: setHindiMode },
            { label: '🔔 Notifications', desc: 'Daily reminder आएगा', value: notifications, setter: setNotifications },
            { label: '🌙 Dark Mode', desc: 'Dark theme रहेगा', value: darkMode, setter: setDarkMode },
          ].map((item, i) => (
            <View key={i} style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleLabel}>{item.label}</Text>
                <Text style={styles.toggleDesc}>{item.desc}</Text>
              </View>
              <Switch
                value={item.value}
                onValueChange={item.setter}
                trackColor={{ false: '#1a3a6a', true: '#00d4ff' }}
                thumbColor={item.value ? '#ffffff' : '#4a7aaa'}
              />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🤖 My APIs (BYOK)</Text>
          <Text style={styles.byokDesc}>अपनी API add करो = बिल्कुल FREE!</Text>
          <TouchableOpacity style={styles.byokBtn} onPress={() => navigate('byok')}>
            <Text style={styles.byokBtnText}>🔑 APIs Manage करो →</Text>
          </TouchableOpacity>
        </View>

        {/* ⚙️ ENGINE FALLBACK TOGGLE - NEW */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ DRISHTI Engine (Fallback)</Text>
          <Text style={styles.byokDesc}>
            जब आपकी API key fail हो या BYOK बंद हो, DRISHTI का अपना Engine जवाब देगा (20 free messages/day)।
          </Text>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>
                {engineEnabled ? '🟢 Engine ON (auto-fallback)' : '🔴 Engine OFF'}
              </Text>
              <Text style={styles.toggleDesc}>
                {engineEnabled
                  ? 'API fail होने पर भी जवाब मिलता रहेगा'
                  : 'सिर्फ आपकी अपनी API से जवाब मिलेगा - कोई fallback नहीं'}
              </Text>
            </View>
            <Switch
              value={engineEnabled}
              onValueChange={toggleEngine}
              trackColor={{ false: '#1a3a6a', true: '#00d4ff' }}
              thumbColor={engineEnabled ? '#ffffff' : '#4a7aaa'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚖️ Legal & Support</Text>
          {['📋 Terms of Service', '🔒 Privacy Policy', '📧 Support Email', '🗑️ Data Reset करो'].map((item, i) => (
            <TouchableOpacity key={i} style={styles.legalItem} onPress={() => navigate('legal')}>
              <Text style={styles.legalText}>{item}</Text>
              <Text style={styles.legalArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={() => navigate('login')}>
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050918', paddingTop: 50 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#0d1f3c' },
  backBtn: { color: '#00d4ff', fontSize: 15, width: 60 },
  headerTitle: { color: '#ffffff', fontSize: 18, fontWeight: '900' },
  section: { marginHorizontal: 20, marginTop: 25 },
  sectionTitle: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  profileBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0d1f3c', borderRadius: 16, padding: 16, gap: 15, borderWidth: 1, borderColor: '#1a3a6a' },
  avatar: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: '#00d4ff', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#000', fontSize: 22, fontWeight: '900' },
  profileName: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  profileEmail: { color: '#4a7aaa', fontSize: 13, marginTop: 2 },
  freeBadge: { backgroundColor: '#1a3a6a', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginTop: 5, alignSelf: 'flex-start' },
  freeBadgeText: { color: '#00d4ff', fontSize: 11, fontWeight: 'bold' },
  upgradeBtn: { marginHorizontal: 20, marginTop: 15, backgroundColor: '#00d4ff', borderRadius: 14, padding: 15, alignItems: 'center' },
  upgradeText: { color: '#000', fontSize: 15, fontWeight: '800' },
  voiceItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0d1f3c', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#1a3a6a' },
  voiceItemSelected: { borderColor: '#00d4ff' },
  voiceName: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
  voiceDesc: { color: '#4a7aaa', fontSize: 12, marginTop: 2 },
  checkmark: { fontSize: 18 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0d1f3c', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#1a3a6a' },
  toggleLabel: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  toggleDesc: { color: '#4a7aaa', fontSize: 12, marginTop: 2 },
  byokDesc: { color: '#4a7aaa', fontSize: 13, marginBottom: 10 },
  byokBtn: { backgroundColor: '#0d1f3c', borderRadius: 12, padding: 15, borderWidth: 1, borderColor: '#00d4ff' },
  byokBtnText: { color: '#00d4ff', fontSize: 15, fontWeight: '600' },
  legalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0d1f3c', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#1a3a6a' },
  legalText: { color: '#ffffff', fontSize: 14 },
  legalArrow: { color: '#4a7aaa', fontSize: 16 },
  logoutBtn: { margin: 20, backgroundColor: '#1a0a0a', borderRadius: 14, padding: 15, alignItems: 'center', borderWidth: 1, borderColor: '#ff4444', marginBottom: 40 },
  logoutText: { color: '#ff4444', fontSize: 16, fontWeight: 'bold' },
});
