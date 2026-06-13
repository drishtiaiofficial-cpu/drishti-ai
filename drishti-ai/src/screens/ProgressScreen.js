import React, { useRef, useEffect } from 'react';
import {
  View, Text, ScrollView,
  TouchableOpacity, StyleSheet, Animated,
} from 'react-native';
import { t } from '../utils/translations';

export default function ProgressScreen({ navigate }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 700, useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0, tension: 50, friction: 8, useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const streak = parseInt(localStorage.getItem('streak') || '7');
  const totalLearned = parseInt(localStorage.getItem('totalLearned') || '23');

  const skills = [
    { name: 'WhatsApp', icon: '📱', percent: 100, done: true },
    { name: 'UPI Payment', icon: '💰', percent: 65, done: false },
    { name: 'Form भरना', icon: '📄', percent: 40, done: false },
    { name: 'Photos', icon: '🖼️', percent: 80, done: false },
    { name: 'Email', icon: '✉️', percent: 20, done: false },
    { name: 'Video Call', icon: '📹', percent: 0, done: false },
  ];

  const badges = [
    { icon: '🏆', name: 'WhatsApp Expert', earned: true },
    { icon: '⭐', name: '7 दिन Streak', earned: true },
    { icon: '🎯', name: 'First Chat', earned: true },
    { icon: '💰', name: 'UPI Master', earned: false },
    { icon: '📄', name: 'Form Filler', earned: false },
    { icon: '🌟', name: 'All Complete', earned: false },
  ];

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('dashboard')}>
          <Text style={styles.backBtn}>{t('back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('progress_title')}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Stats Row */}
        <Animated.View style={[styles.statsRow, {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }]}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>🔥 {streak}</Text>
            <Text style={styles.statLabel}>{t('progress_streak')}</Text>
          </View>
          <View style={[styles.statBox, styles.statBoxMiddle]}>
            <Text style={styles.statNumber}>{totalLearned}</Text>
            <Text style={styles.statLabel}>{t('progress_learned')}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>4.5h</Text>
            <Text style={styles.statLabel}>{t('progress_time')}</Text>
          </View>
        </Animated.View>

        {/* Skills */}
        <Animated.View style={[styles.section, {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }]}>
          <Text style={styles.sectionTitle}>{t('progress_skills')}</Text>
          {skills.map((skill, index) => (
            <View key={index} style={styles.skillRow}>
              <Text style={styles.skillIcon}>{skill.icon}</Text>
              <View style={styles.skillInfo}>
                <View style={styles.skillTopRow}>
                  <Text style={styles.skillName}>{skill.name}</Text>
                  <Text style={[
                    styles.skillPercent,
                    { color: skill.done ? '#10b981' : '#00d4ff' },
                  ]}>
                    {skill.done
                      ? t('progress_done')
                      : `${skill.percent}%`}
                  </Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, {
                    width: `${skill.percent}%`,
                    backgroundColor: skill.done ? '#10b981' : '#00d4ff',
                  }]} />
                </View>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* Badges */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>{t('progress_badges')}</Text>
          <View style={styles.badgesGrid}>
            {badges.map((badge, index) => (
              <View key={index} style={[
                styles.badgeBox,
                !badge.earned && styles.badgeBoxLocked,
              ]}>
                <Text style={[
                  styles.badgeIcon,
                  !badge.earned && styles.badgeIconLocked,
                ]}>
                  {badge.earned ? badge.icon : '🔒'}
                </Text>
                <Text style={[
                  styles.badgeName,
                  !badge.earned && styles.badgeNameLocked,
                ]}>
                  {badge.name}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

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
  statsRow: {
    flexDirection: 'row', margin: 20, gap: 10,
  },
  statBox: {
    flex: 1, backgroundColor: '#0d1f3c', borderRadius: 14,
    padding: 15, alignItems: 'center',
    borderWidth: 1, borderColor: '#1a3a6a',
  },
  statBoxMiddle: { borderColor: '#00d4ff' },
  statNumber: {
    color: '#ffffff', fontSize: 20,
    fontWeight: '900', marginBottom: 4,
  },
  statLabel: { color: '#4a7aaa', fontSize: 11, textAlign: 'center' },
  section: { marginHorizontal: 20, marginBottom: 25 },
  sectionTitle: {
    color: '#ffffff', fontSize: 18,
    fontWeight: 'bold', marginBottom: 15,
  },
  skillRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0d1f3c', borderRadius: 12,
    padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#1a3a6a', gap: 12,
  },
  skillIcon: { fontSize: 24 },
  skillInfo: { flex: 1 },
  skillTopRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8,
  },
  skillName: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  skillPercent: { fontSize: 13, fontWeight: 'bold' },
  progressBarBg: {
    height: 6, backgroundColor: '#1a3a6a', borderRadius: 3,
  },
  progressBarFill: { height: 6, borderRadius: 3 },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badgeBox: {
    width: '30%', backgroundColor: '#0d1f3c',
    borderRadius: 12, padding: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#00d4ff44',
  },
  badgeBoxLocked: { borderColor: '#1a3a6a', opacity: 0.5 },
  badgeIcon: { fontSize: 28, marginBottom: 6 },
  badgeIconLocked: { opacity: 0.5 },
  badgeName: {
    color: '#ffffff', fontSize: 11,
    textAlign: 'center', fontWeight: '600',
  },
  badgeNameLocked: { color: '#4a7aaa' },
});
