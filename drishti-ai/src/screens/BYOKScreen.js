import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Switch,
} from 'react-native';
import { SLOTS } from '../config/slots';
import { detectProvider, fetchBestModel, getSlots, saveSlots } from '../services/api/byokService';

export default function BYOKScreen({ navigate }) {
  const [byokEnabled, setByokEnabled] = useState(false);
  const [slots, setSlots] = useState([]);
  const [expandedSlot, setExpandedSlot] = useState(null);
  const [loading, setLoading] = useState({});

  useEffect(() => {
    setByokEnabled(localStorage.getItem('byok_enabled') === 'true');
    const saved = getSlots();
    const merged = SLOTS.map(slot => {
      const savedSlot = saved.find(s => s.id === slot.id) || {};
      return {
        ...slot,
        apiKey: savedSlot.apiKey || '',
        endpoint: savedSlot.endpoint || '',
        providerName: savedSlot.providerName || '',
        detectedModel: savedSlot.detectedModel || '',
        detectedName: savedSlot.detectedName || '',
        active: savedSlot.active || false,
      };
    });
    setSlots(merged);
  }, []);

  const save = (newSlots) => {
    setSlots(newSlots);
    saveSlots(newSlots.map(s => ({
      id: s.id, role: s.role,
      apiKey: s.apiKey, endpoint: s.endpoint,
      providerName: s.providerName,
      detectedModel: s.detectedModel,
      detectedName: s.detectedName,
      active: s.active,
    })));
  };

  const updateSlot = async (id, field, value) => {
    const updated = slots.map(s => s.id === id ? { ...s, [field]: value } : s);
    const slot = updated.find(s => s.id === id);

    if (['apiKey', 'providerName', 'endpoint'].includes(field) && slot.apiKey) {
      setLoading(prev => ({ ...prev, [id]: true }));
      const provider = detectProvider(slot.apiKey, slot.providerName, slot.endpoint);
      if (provider) {
        const model = await fetchBestModel(provider, slot.apiKey);
        const idx = updated.findIndex(s => s.id === id);
        updated[idx].detectedName = provider.name;
        updated[idx].detectedModel = model || '';
      }
      setLoading(prev => ({ ...prev, [id]: false }));
    }
    save(updated);
  };

  const toggleSlot = (id) => {
    save(slots.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const toggleBYOK = (val) => {
    setByokEnabled(val);
    localStorage.setItem('byok_enabled', val.toString());
  };

  const activeCount = slots.filter(s => s.active && s.apiKey).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('settings')}>
          <Text style={styles.backBtn}>← वापस</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🔑 My APIs</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.masterCard}>
          <View>
            <Text style={styles.masterTitle}>BYOK Mode</Text>
            <Text style={styles.masterSub}>
              {byokEnabled ? `✅ ${activeCount}/7 slots active` : '❌ Engine mode (rate limited)'}
            </Text>
          </View>
          <Switch
            value={byokEnabled}
            onValueChange={toggleBYOK}
            trackColor={{ false: '#1a3a6a', true: '#00d4ff' }}
            thumbColor={byokEnabled ? '#fff' : '#4a7aaa'}
          />
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 7 Roles - कोई भ API daalo</Text>
          <Text style={styles.infoText}>
            हर slot का अलग kaam hai। Koi bhi API daalo - kaam karegi।{'\n'}
            Model auto-select hoga. Kabhi hardcoded nahi.
          </Text>
        </View>

        {slots.map((slot) => {
          const isExpanded = expandedSlot === slot.id;
          const provider = detectProvider(slot.apiKey, slot.providerName, slot.endpoint);
          const isReady = slot.apiKey && slot.active;

          return (
            <View key={slot.id} style={[
              styles.slotCard,
              { borderColor: isReady ? slot.color : '#1a3a6a' },
              isReady && { borderWidth: 2 },
            ]}>

              <TouchableOpacity
                style={styles.slotHeader}
                onPress={() => setExpandedSlot(isExpanded ? null : slot.id)}
              >
                <View style={[styles.slotEmoji, { backgroundColor: slot.color + '22' }]}>
                  <Text style={styles.slotEmojiText}>{slot.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.slotLabel}>{slot.label}</Text>
                  <Text style={styles.slotDesc} numberOfLines={1}>
                    {slot.detectedName
                      ? `✅ ${slot.detectedName}${slot.detectedModel ? ' - ' + slot.detectedModel.slice(0, 20) : ''}`
                      : slot.description}
                  </Text>
                </View>
                <View style={styles.slotRight}>
                  <Switch
                    value={slot.active}
                    onValueChange={() => toggleSlot(slot.id)}
                    trackColor={{ false: '#1a3a6a', true: slot.color }}
                    thumbColor={slot.active ? '#fff' : '#4a7aaa'}
                  />
                  <Text style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
                </View>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.slotBody}>
                  <View style={[styles.roleInfo, { borderColor: slot.color + '44' }]}>
                    <Text style={[styles.roleLabel, { color: slot.color }]}>
                      Role: {slot.description}
                    </Text>
                    <Text style={styles.roleRec}>💡 {slot.recommendation}</Text>
                    <View style={styles.freeTag}>
                      <Text style={styles.freeText}>🆓 {slot.freeOption}</Text>
                    </View>
                  </View>

                  <Text style={styles.label}>Provider (Optional)</Text>
                  <TextInput
                    style={[styles.input, slot.providerName && { borderColor: slot.color }]}
                    placeholder="Groq, Gemini, Claude... (optional)"
                    placeholderTextColor="#3a5a8a"
                    value={slot.providerName}
                    onChangeText={v => updateSlot(slot.id, 'providerName', v)}
                  />

                  <Text style={styles.label}>Custom Endpoint (Optional)</Text>
                  <TextInput
                    style={[styles.input, slot.endpoint && { borderColor: slot.color }]}
                    placeholder="https://api.example.com/v1/..."
                    placeholderTextColor="#3a5a8a"
                    value={slot.endpoint}
                    onChangeText={v => updateSlot(slot.id, 'endpoint', v)}
                    autoCapitalize="none"
                  />

                  {(provider || slot.detectedModel) && (
                    <View style={[styles.detected, { borderColor: slot.color }]}>
                      <Text style={[styles.detectedTitle, { color: slot.color }]}>⚡ Auto-detected:</Text>
                      <Text style={styles.detectedText}>
                        Provider: {slot.detectedName || provider?.name || '?'}{'\n'}
                        Model: {loading[slot.id] ? 'Fetching...' : (slot.detectedModel || 'Detecting...')}
                      </Text>
                    </View>
                  )}

                  <Text style={styles.label}>API Key 🔒</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="API key paste करो..."
                    placeholderTextColor="#3a5a8a"
                    value={slot.apiKey}
                    onChangeText={v => updateSlot(slot.id, 'apiKey', v)}
                    secureTextEntry={true}
                    autoCapitalize="none"
                  />
                </View>
              )}
            </View>
          );
        })}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✅ Supported Providers</Text>
          <View style={styles.providerGrid}>
            {['Groq', 'OpenAI', 'Claude', 'Gemini', 'Mistral', 'OpenRouter', 'Together', 'Custom API'].map((p, i) => (
              <View key={i} style={styles.chip}>
                <Text style={styles.chipText}>{p}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050918', paddingTop: 50 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#0d1f3c' },
  backBtn: { color: '#00d4ff', fontSize: 15, width: 60 },
  title: { color: '#fff', fontSize: 18, fontWeight: '900' },
  masterCard: { margin: 16, backgroundColor: '#0d1f3c', borderRadius: 16, padding: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1.5, borderColor: '#00d4ff' },
  masterTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  masterSub: { color: '#4a7aaa', fontSize: 12, marginTop: 4 },
  infoCard: { marginHorizontal: 16, marginBottom: 16, backgroundColor: '#0d2a1a', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#10b981' },
  infoTitle: { color: '#10b981', fontSize: 14, fontWeight: '700', marginBottom: 6 },
  infoText: { color: '#4a9a7a', fontSize: 13, lineHeight: 20 },
  slotCard: { marginHorizontal: 16, marginBottom: 12, backgroundColor: '#0d1f3c', borderRadius: 16, borderWidth: 1, borderColor: '#1a3a6a', overflow: 'hidden' },
  slotHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  slotEmoji: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  slotEmojiText: { fontSize: 22 },
  slotLabel: { color: '#fff', fontSize: 15, fontWeight: '700' },
  slotDesc: { color: '#4a7aaa', fontSize: 12, marginTop: 2 },
  slotRight: { alignItems: 'center', gap: 4 },
  expandIcon: { color: '#4a7aaa', fontSize: 10 },
  slotBody: { paddingHorizontal: 14, paddingBottom: 16, borderTopWidth: 1, borderTopColor: '#1a3a6a', paddingTop: 14 },
  roleInfo: { backgroundColor: '#050918', borderRadius: 12, padding: 12, marginBottom: 14, borderWidth: 1 },
  roleLabel: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  roleRec: { color: '#4a7aaa', fontSize: 12, marginBottom: 8 },
  freeTag: { backgroundColor: '#0d2a1a', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#10b981' },
  freeText: { color: '#10b981', fontSize: 11, fontWeight: '600' },
  label: { color: '#4a7aaa', fontSize: 11, fontWeight: '700', marginBottom: 6, marginTop: 10, letterSpacing: 0.5 },
  input: { backgroundColor: '#050918', borderRadius: 12, padding: 13, color: '#fff', fontSize: 13, borderWidth: 1.5, borderColor: '#1a3a6a' },
  detected: { marginTop: 10, padding: 10, borderRadius: 10, borderWidth: 1, backgroundColor: '#050918' },
  detectedTitle: { fontSize: 11, fontWeight: '700', marginBottom: 4 },
  detectedText: { color: '#888', fontSize: 12, lineHeight: 18 },
  section: { marginHorizontal: 16, marginBottom: 20 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  providerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#1a3a6a', backgroundColor: '#0d1f3c' },
  chipText: { color: '#00d4ff', fontSize: 12, fontWeight: '600' },
});
