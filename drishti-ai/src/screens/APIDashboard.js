import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ScrollView, RefreshControl,
} from 'react-native';

const FREE_LIMIT = 20;

const getStats = (role) => {
  try {
    const key = `usage_${role}_${new Date().toDateString()}`;
    return JSON.parse(localStorage.getItem(key) || '{}');
  } catch { return {}; }
};

const getAllStats = () => {
  const providers = ['groq','openai','claude','gemini','mistral','openrouter','together','engine'];
  return providers.reduce((acc, p) => {
    const s = getStats(p);
    if (s.calls > 0) acc[p] = s;
    return acc;
  }, {});
};

export default function APIDashboard({ navigate }) {
  const [stats, setStats] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  const load = () => setStats(getAllStats());

  useEffect(() => { load(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    load();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const engineUsed = stats.engine?.calls || 0;
  const totalCalls = Object.values(stats).reduce((s, v) => s + (v.calls || 0), 0);
  const enginePct = Math.min((engineUsed / FREE_LIMIT) * 100, 100);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('settings')}>
          <Text style={styles.back}>← वापस</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📊 API Dashboard</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00d4ff" />
        }
      >
        {/* Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📅 आज का Summary</Text>
          <View style={styles.row}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{totalCalls}</Text>
              <Text style={styles.statLabel}>Total Calls</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statNum, { color: '#10b981' }]}>
                {Object.keys(stats).length}
              </Text>
              <Text style={styles.statLabel}>APIs Used</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statNum,
                { color: enginePct > 80 ? '#ff4444' : '#00d4ff' }]}>
                {FREE_LIMIT - engineUsed}
              </Text>
              <Text style={styles.statLabel}>Free Left</Text>
            </View>
          </View>
        </View>

        {/* Engine Usage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 Free Engine Usage</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>{engineUsed}/{FREE_LIMIT} messages</Text>
              <Text style={[styles.pct,
                { color: enginePct > 80 ? '#ff4444' : '#00d4ff' }]}>
                {Math.round(enginePct)}%
              </Text>
            </View>
            <View style={styles.barBg}>
              <View style={[styles.barFill, {
                width: `${enginePct}%`,
                backgroundColor: enginePct > 80 ? '#ff4444' :
                  enginePct > 60 ? '#f59e0b' : '#00d4ff',
              }]} />
            </View>
            {enginePct > 80 && (
              <Text style={styles.warning}>
                ⚠️ Limit खत्म होने वाली है! API key add करो।
              </Text>
            )}
          </View>
        </View>

        {/* API Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ API Performance</Text>
          {Object.keys(stats).length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📊</Text>
              <Text style={styles.emptyText}>
                अभी कोई API use नहीं हुई{'\n'}Chat करो तो data दिखेगा
              </Text>
            </View>
          ) : (
            Object.entries(stats).map(([provider, s]) => (
              <View key={provider} style={styles.apiCard}>
                <View style={styles.row}>
                  <Text style={styles.apiName}>{provider.toUpperCase()}</Text>
                  <Text style={[styles.successRate,
                    { color: (s.successRate || 100) > 90 ? '#10b981' : '#f59e0b' }]}>
                    {s.successRate || 100}% success
                  </Text>
                </View>
                <View style={styles.apiStats}>
                  <View style={styles.apiStat}>
                    <Text style={styles.apiNum}>{s.calls || 0}</Text>
                    <Text style={styles.apiLabel}>Calls</Text>
                  </View>
                  <View style={styles.apiStat}>
                    <Text style={styles.apiNum}>
                      {s.calls ? Math.round((s.totalLatency || 0) / s.calls) : 0}ms
                    </Text>
                    <Text style={styles.apiLabel}>Avg Speed</Text>
                  </View>
                  <View style={styles.apiStat}>
                    <Text style={styles.apiNum}>{s.errors || 0}</Text>
                    <Text style={styles.apiLabel}>Errors</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigate('byok')}
        >
          <Text style={styles.addBtnText}>🔑 API Add करो →</Text>
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
  back: { color: '#00d4ff', fontSize: 15, width: 60 },
  title: { color: '#fff', fontSize: 18, fontWeight: '900' },
  card: {
    backgroundColor: '#0d1f3c', borderRadius: 16,
    padding: 18, borderWidth: 1, borderColor: '#1a3a6a',
  },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stat: { alignItems: 'center' },
  statNum: { color: '#00d4ff', fontSize: 28, fontWeight: '900' },
  statLabel: { color: '#4a7aaa', fontSize: 12, marginTop: 4 },
  section: { marginHorizontal: 16, marginBottom: 20 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  label: { color: '#fff', fontSize: 14 },
  pct: { fontSize: 14, fontWeight: '800' },
  barBg: { height: 8, backgroundColor: '#1a3a6a', borderRadius: 4, marginTop: 10 },
  barFill: { height: 8, borderRadius: 4 },
  warning: { color: '#f59e0b', fontSize: 12, marginTop: 10 },
  empty: {
    backgroundColor: '#0d1f3c', borderRadius: 14,
    padding: 30, alignItems: 'center',
    borderWidth: 1, borderColor: '#1a3a6a',
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: '#4a7aaa', fontSize: 14, textAlign: 'center', lineHeight: 22 },
  apiCard: {
    backgroundColor: '#0d1f3c', borderRadius: 14,
    padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#1a3a6a',
  },
  apiName: { color: '#00d4ff', fontSize: 14, fontWeight: '800' },
  successRate: { fontSize: 12, fontWeight: '600' },
  apiStats: {
    flexDirection: 'row', justifyContent: 'space-around',
    backgroundColor: '#050918', borderRadius: 10,
    padding: 12, marginTop: 10,
  },
  apiStat: { alignItems: 'center' },
  apiNum: { color: '#fff', fontSize: 16, fontWeight: '800' },
  apiLabel: { color: '#4a7aaa', fontSize: 10, marginTop: 2 },
  addBtn: {
    margin: 16, backgroundColor: '#0d1f3c',
    borderRadius: 14, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: '#00d4ff',
  },
  addBtnText: { color: '#00d4ff', fontSize: 15, fontWeight: '700' },
});
