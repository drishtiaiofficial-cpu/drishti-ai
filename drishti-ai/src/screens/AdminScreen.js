import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ScrollView, Switch,
} from 'react-native';

export default function AdminScreen({ navigate }) {
  const [features, setFeatures] = useState({
    voiceGuide: true,
    liveGuardian: true,
    byok: true,
    freeChat: true,
  });

  const stats = [
    { label: 'Total Users', value: '1,247', icon: '👥' },
    { label: 'Active Today', value: '89', icon: '🔥' },
    { label: 'Revenue', value: '₹4,850', icon: '💰' },
    { label: 'Pro Users', value: '49', icon: '⭐' },
  ];

  const toggleFeature = (key) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('dashboard')}>
          <Text style={styles.backBtn}>← वापस</Text>
        </TouchableOpacity>
        <Text style={styles.title}>👑 Admin Panel</Text>
        <View style={styles.ownerBadge}>
          <Text style={styles.ownerText}>Owner</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {stats.map((stat, i) => (
            <View key={i} style={styles.statBox}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Feature Flags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Feature Controls</Text>
          {[
            { key: 'voiceGuide', label: 'Voice Guide', icon: '🎙️' },
            { key: 'liveGuardian', label: 'Live Guardian', icon: '👁️' },
            { key: 'byok', label: 'BYOK System', icon: '🔑' },
            { key: 'freeChat', label: 'Free Chat', icon: '💬' },
          ].map((item) => (
            <View key={item.key} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{item.icon}</Text>
              <Text style={styles.featureLabel}>{item.label}</Text>
              <Switch
                value={features[item.key]}
                onValueChange={() => toggleFeature(item.key)}
                trackColor={{ false: '#1a3a6a', true: '#00d4ff' }}
                thumbColor={features[item.key] ? '#fff' : '#4a7aaa'}
              />
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚀 Quick Actions</Text>
          {[
            { icon: '📢', label: 'Announcement भेजो', color: '#00d4ff' },
            { icon: '💳', label: 'Price Change करो', color: '#f59e0b' },
            { icon: '👥', label: 'Users देखो', color: '#10b981' },
            { icon: '🐛', label: 'Bug Reports', color: '#ff4444' },
            { icon: '🧪', label: 'Test Mode', color: '#7c3aed' },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={styles.actionBtn}>
              <Text style={styles.actionIcon}>{item.icon}</Text>
              <Text style={[styles.actionLabel, { color: item.color }]}>
                {item.label}
              </Text>
              <Text style={styles.actionArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Revenue Chart (Simple) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Revenue (इस हफ्ते)</Text>
          <View style={styles.chartBox}>
            {[40, 65, 45, 80, 60, 90, 75].map((val, i) => (
              <View key={i} style={styles.barContainer}>
                <View style={[styles.bar, { height: val }]} />
                <Text style={styles.barLabel}>
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                </Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050918', paddingTop: 50 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#0d1f3c',
  },
  backBtn: { color: '#00d4ff', fontSize: 15, width: 60 },
  title: { color: '#fff', fontSize: 18, fontWeight: '900' },
  ownerBadge: {
    backgroundColor: '#f59e0b22',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  ownerText: { color: '#f59e0b', fontSize: 11, fontWeight: 'bold' },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    gap: 10,
  },
  statBox: {
    width: '47%',
    backgroundColor: '#0d1f3c',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1a3a6a',
  },
  statIcon: { fontSize: 24, marginBottom: 8 },
  statValue: { color: '#fff', fontSize: 22, fontWeight: '900' },
  statLabel: { color: '#4a7aaa', fontSize: 12, marginTop: 4 },

  // Section
  section: { marginHorizontal: 20, marginBottom: 25 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 12 },

  // Features
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d1f3c',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1a3a6a',
  },
  featureIcon: { fontSize: 20, marginRight: 12 },
  featureLabel: { flex: 1, color: '#fff', fontSize: 14 },

  // Actions
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d1f3c',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1a3a6a',
  },
  actionIcon: { fontSize: 20, marginRight: 12 },
  actionLabel: { flex: 1, fontSize: 14, fontWeight: '600' },
  actionArrow: { color: '#4a7aaa', fontSize: 16 },

  // Chart
  chartBox: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#0d1f3c',
    borderRadius: 14,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#1a3a6a',
    height: 130,
  },
  barContainer: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: {
    width: '100%',
    backgroundColor: '#00d4ff',
    borderRadius: 4,
    opacity: 0.8,
  },
  barLabel: { color: '#4a7aaa', fontSize: 10, marginTop: 4 },
});
