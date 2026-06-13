import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ScrollView, Switch,
} from 'react-native';
import {
  t, getLanguage, setLanguage, LANGUAGES,
} from '../utils/translations';

const VOICES = [
  { id: 'dadi', name: 'दादी 👵', desc: 'धीमी, मीठी आवाज़' },
  { id: 'maa', name: 'मां 👩', desc: 'प्यार भरी आवाज़' },
  { id: 'didi', name: 'दीदी 👧', desc: 'Friendly, caring' },
  { id: 'bhai', name: 'भाई 👦', desc: 'Cool, casual' },
  { id: 'teacher', name: 'Teacher 👩‍🏫', desc: 'Clear, formal' },
  { id: 'nana', name: 'नाना 👴', desc: 'Slow, warm' },
];

export default function SettingsScreen({ navigate }) {
  const [hindiMode, setHindiMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState('didi');
  const [selectedLang, setSelectedLang] = useState('hi');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    setUserName(localStorage.getItem('userName') || 'User');
    setUserEmail(localStorage.getItem('userEmail') || '');
    setSelectedVoice(localStorage.getItem('selectedVoice') || 'didi');
    setSelectedLang(getLanguage());
    setHindiMode(localStorage.getItem('hindiMode') !== 'false');
    setNotifications(localStorage.getItem('notifications') !== 'false');
  }, []);

  const handleVoiceSelect = (voiceId) => {
    setSelectedVoice(voiceId);
    localStorage.setItem('selectedVoice', voiceId);
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
      const cfg = configs[voiceId] || configs.didi;
      const u = new SpeechSynthesisUtterance(
        voiceId === 'bhai'
          ? 'Hello! Main Drishti hoon.'
          : 'नमस्ते! मैं दृष्टि हूँ।'
      );
      u.lang = 'hi-IN';
      u.rate = cfg.rate;
      u.pitch = cfg.pitch;
      window.speechSynthesis.speak(u);
    }
  };

  const handleLanguageSelect = (langCode) => {
    setSelectedLang(langCode);
    setLanguage(langCode);
    forceUpdate(n => n + 1);
  };

  const handleToggle = (key, value, setter) => {
    setter(value);
    localStorage.setItem(key, value.toString());
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('login');
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('dashboard')}>
          <Text style={styles.backBtn}>{t('back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings_title')}</Text>
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
            <View>
              <Text style={styles.profileName}>{userName}</Text>
              <Text style={styles.profileEmail}>{userEmail}</Text>
              <View style={styles.freeBadge}>
                <Text style={styles.freeBadgeText}>
                  {t('settings_free_plan')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Upgrade */}
        <TouchableOpacity style={styles.upgradeBtn}>
          <Text style={styles.upgradeText}>{t('settings_upgrade')}</Text>
        </TouchableOpacity>

        {/* 🌐 Language Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌐 Language / भाषा</Text>
          <View style={styles.langRow}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.langBtn,
                  selectedLang === lang.code && styles.langBtnSelected,
                ]}
                onPress={() => handleLanguageSelect(lang.code)}
              >
                <Text style={styles.langFlag}>{lang.flag}</Text>
                <Text style={[
                  styles.langName,
                  selectedLang === lang.code && styles.langNameSelected,
                ]}>
                  {lang.name}
                </Text>
                {selectedLang === lang.code && (
                  <Text style={styles.langCheck}>✅</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Voice Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings_voice_title')}</Text>
          <Text style={styles.sectionSub}>{t('settings_voice_sub')}</Text>
          {VOICES.map((voice) => (
            <TouchableOpacity
              key={voice.id}
              style={[
                styles.voiceItem,
                selectedVoice === voice.id && styles.voiceItemSelected,
              ]}
              onPress={() => handleVoiceSelect(voice.id)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.voiceName}>{voice.name}</Text>
                <Text style={styles.voiceDesc}>{voice.desc}</Text>
              </View>
              {selectedVoice === voice.id && (
                <Text style={styles.checkmark}>✅</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Toggles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings_general')}</Text>
          {[
            {
              key: 'hindiMode',
              label: t('settings_hindi_mode'),
              desc: t('settings_hindi_desc'),
              value: hindiMode,
              setter: setHindiMode,
            },
            {
              key: 'notifications',
              label: t('settings_notif'),
              desc: t('settings_notif_desc'),
              value: notifications,
              setter: setNotifications,
            },
            {
              key: 'darkMode',
              label: t('settings_dark'),
              desc: t('settings_dark_desc'),
              value: darkMode,
              setter: setDarkMode,
            },
          ].map((item, i) => (
            <View key={i} style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleLabel}>{item.label}</Text>
                <Text style={styles.toggleDesc}>{item.desc}</Text>
              </View>
              <Switch
                value={item.value}
                onValueChange={(v) =>
                  handleToggle(item.key, v, item.setter)
                }
                trackColor={{ false: '#1a3a6a', true: '#00d4ff' }}
                thumbColor={item.value ? '#ffffff' : '#4a7aaa'}
              />
            </View>
          ))}
        </View>

        {/* BYOK */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings_apis')}</Text>
          <Text style={styles.byokDesc}>{t('settings_apis_desc')}</Text>
          <TouchableOpacity
            style={styles.byokBtn}
            onPress={() => navigate('byok')}
          >
            <Text style={styles.byokBtnText}>
              {t('settings_manage_apis')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings_legal')}</Text>
          {[
            '📋 Terms of Service',
            '🔒 Privacy Policy',
            '📧 Support Email',
            '🗑️ Data Reset',
          ].map((item, i) => (
            <TouchableOpacity key={i} style={styles.legalItem}>
              <Text style={styles.legalText}>{item}</Text>
              <Text style={styles.legalArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>{t('settings_logout')}</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050918', paddingTop: 50 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 15,
    borderBottomWidth: 1, borderBottomColor: '#0d1f3c',
  },
  backBtn: { color: '#00d4ff', fontSize: 15, width: 60 },
  headerTitle: { color: '#ffffff', fontSize: 18, fontWeight: '900' },
  section: { marginHorizontal: 20, marginTop: 25 },
  sectionTitle: {
    color: '#ffffff', fontSize: 16,
    fontWeight: 'bold', marginBottom: 8,
  },
  sectionSub: { color: '#4a7aaa', fontSize: 12, marginBottom: 12 },

  // Language
  langRow: { flexDirection: 'row', gap: 12 },
  langBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0d1f3c', borderRadius: 14,
    padding: 14, gap: 8,
    borderWidth: 1, borderColor: '#1a3a6a',
  },
  langBtnSelected: {
    borderColor: '#00d4ff', borderWidth: 2,
    backgroundColor: '#071428',
  },
  langFlag: { fontSize: 22 },
  langName: { flex: 1, color: '#4a7aaa', fontSize: 14, fontWeight: '600' },
  langNameSelected: { color: '#ffffff' },
  langCheck: { fontSize: 16 },

  // Profile
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
  profileName: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  profileEmail: { color: '#4a7aaa', fontSize: 13, marginTop: 2 },
  freeBadge: {
    backgroundColor: '#1a3a6a', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
    marginTop: 5, alignSelf: 'flex-start',
  },
  freeBadgeText: { color: '#00d4ff', fontSize: 11, fontWeight: 'bold' },
  upgradeBtn: {
    marginHorizontal: 20, marginTop: 15,
    backgroundColor: '#00d4ff', borderRadius: 14,
    padding: 15, alignItems: 'center',
  },
  upgradeText: { color: '#000', fontSize: 15, fontWeight: '800' },
  voiceItem: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', backgroundColor: '#0d1f3c',
    borderRadius: 12, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: '#1a3a6a',
  },
  voiceItemSelected: { borderColor: '#00d4ff', borderWidth: 2 },
  voiceName: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
  voiceDesc: { color: '#4a7aaa', fontSize: 12, marginTop: 2 },
  checkmark: { fontSize: 18 },
  toggleRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', backgroundColor: '#0d1f3c',
    borderRadius: 12, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: '#1a3a6a',
  },
  toggleLabel: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  toggleDesc: { color: '#4a7aaa', fontSize: 12, marginTop: 2 },
  byokDesc: { color: '#4a7aaa', fontSize: 13, marginBottom: 10 },
  byokBtn: {
    backgroundColor: '#0d1f3c', borderRadius: 12,
    padding: 15, borderWidth: 1, borderColor: '#00d4ff',
  },
  byokBtnText: { color: '#00d4ff', fontSize: 15, fontWeight: '600' },
  legalItem: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', backgroundColor: '#0d1f3c',
    borderRadius: 12, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: '#1a3a6a',
  },
  legalText: { color: '#ffffff', fontSize: 14 },
  legalArrow: { color: '#4a7aaa', fontSize: 16 },
  logoutBtn: {
    margin: 20, backgroundColor: '#1a0a0a',
    borderRadius: 14, padding: 15, alignItems: 'center',
    borderWidth: 1, borderColor: '#ff4444', marginBottom: 40,
  },
  logoutText: { color: '#ff4444', fontSize: 16, fontWeight: 'bold' },
});
