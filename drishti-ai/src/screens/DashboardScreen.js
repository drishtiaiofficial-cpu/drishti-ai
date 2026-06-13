import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, Animated, ScrollView,
} from 'react-native';
import { t } from '../utils/translations';

export default function DashboardScreen({ navigate }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const name = localStorage.getItem('userName') || 'User';
    setUserName(name);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 800, useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0, tension: 50, friction: 8, useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const menuItems = [
    {
      icon: '💬',
      title: t('menu_chat'),
      subtitle: t('menu_chat_sub'),
      color: '#00d4ff',
      screen: 'chat',
    },
    {
      icon: '👁️',
      title: t('menu_guardian'),
      subtitle: t('menu_guardian_sub'),
      color: '#7c3aed',
      screen: 'liveGuardian',
    },
    {
      icon: '🎙️',
      title: t('menu_voice'),
      subtitle: t('menu_voice_sub'),
      color: '#10b981',
      screen: 'voice',
    },
    {
      icon: '📊',
      title: t('menu_progress'),
      subtitle: t('menu_progress_sub'),
      color: '#f59e0b',
      screen: 'progress',
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('greeting_morning');
    if (hour < 17) return t('greeting_afternoon');
    if (hour < 21) return t('greeting_evening');
    return t('greeting_night');
  };

  const streak = parseInt(localStorage.getItem('streak') || '7');
  const progress = parseInt(localStorage.getItem('progress') || '65');

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Animated.View style={[styles.header, {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }]}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.subGreeting}>
              {t('dashboard_subtitle')}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigate('settings')}
            style={styles.profileBtn}
          >
            <View style={styles.profileCircle}>
              <Text style={styles.profileLetter}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.profileSub}>⚙️ Settings</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Status Card */}
        <Animated.View style={[styles.statusCard, {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }]}>
          <Text style={styles.statusTitle}>
            🔥 {streak} {t('dashboard_streak')}
          </Text>
          <Text style={styles.statusSub}>
            {t('dashboard_streak_sub')}
          </Text>
          <View style={styles.statusBar}>
            <View style={[styles.statusFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.statusPercent}>
            {progress}% {t('dashboard_complete')}
          </Text>
        </Animated.View>

        {/* Menu Grid */}
        <Animated.View style={[styles.menuGrid, {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }]}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, { borderColor: item.color + '44' }]}
              onPress={() => navigate(item.screen)}
              activeOpacity={0.8}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={[styles.menuTitle, { color: item.color }]}>
                {item.title}
              </Text>
              <Text style={styles.menuSub}>{item.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View style={[styles.quickSection, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>
            {t('dashboard_quick')}
          </Text>
          {[
            { icon: '📱', text: 'WhatsApp guide' },
            { icon: '💰', text: 'UPI payment guide' },
            { icon: '📄', text: 'Form fill करो' },
          ].map((item, i) => (
            <TouchableOpacity
              key={i}
              style={styles.quickItem}
              onPress={() => navigate('chat')}
            >
              <Text style={styles.quickIcon}>{item.icon}</Text>
              <Text style={styles.quickText}>{item.text}</Text>
              <Text style={styles.quickArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050918', paddingTop: 50 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 25, marginBottom: 25,
  },
  greeting: { color: '#4a7aaa', fontSize: 16 },
  userName: {
    color: '#ffffff', fontSize: 28,
    fontWeight: '900', letterSpacing: 1,
  },
  subGreeting: { color: '#4a7aaa', fontSize: 14, marginTop: 4 },
  profileBtn: { alignItems: 'center' },
  profileCircle: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: '#00d4ff',
    justifyContent: 'center', alignItems: 'center', marginBottom: 4,
  },
  profileLetter: { color: '#000', fontSize: 22, fontWeight: '900' },
  profileSub: { color: '#4a7aaa', fontSize: 11 },
  statusCard: {
    marginHorizontal: 25, backgroundColor: '#0d1f3c',
    borderRadius: 16, padding: 20, marginBottom: 25,
    borderWidth: 1, borderColor: '#1a3a6a',
  },
  statusTitle: {
    color: '#ffffff', fontSize: 18,
    fontWeight: 'bold', marginBottom: 6,
  },
  statusSub: { color: '#4a7aaa', fontSize: 13, marginBottom: 15 },
  statusBar: {
    height: 6, backgroundColor: '#1a3a6a',
    borderRadius: 3, marginBottom: 6,
  },
  statusFill: { height: 6, backgroundColor: '#00d4ff', borderRadius: 3 },
  statusPercent: {
    color: '#00d4ff', fontSize: 12, textAlign: 'right',
  },
  menuGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 20, marginBottom: 25, gap: 12,
  },
  menuItem: {
    width: '47%', backgroundColor: '#0d1f3c',
    borderRadius: 16, padding: 20, borderWidth: 1,
  },
  menuIcon: { fontSize: 30, marginBottom: 10 },
  menuTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  menuSub: { color: '#4a7aaa', fontSize: 12 },
  quickSection: { paddingHorizontal: 25, marginBottom: 40 },
  sectionTitle: {
    color: '#ffffff', fontSize: 18,
    fontWeight: 'bold', marginBottom: 15,
  },
  quickItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0d1f3c', borderRadius: 12,
    padding: 15, marginBottom: 10,
    borderWidth: 1, borderColor: '#1a3a6a',
  },
  quickIcon: { fontSize: 22, marginRight: 12 },
  quickText: { flex: 1, color: '#ffffff', fontSize: 15 },
  quickArrow: { color: '#00d4ff', fontSize: 18 },
});
