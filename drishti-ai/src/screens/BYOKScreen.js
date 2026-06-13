import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Switch,
} from 'react-native';
import { t } from '../utils/translations';

const detectConfig = (providerName = '', apiKey = '', endpoint = '') => {
  const p = providerName.toLowerCase().trim();
  const k = apiKey.trim();
  const e = endpoint.toLowerCase().trim();

  if (p.includes('groq') || e.includes('groq.com') || k.startsWith('gsk_'))
    return {
      url: endpoint || 'https://api.groq.com/openai/v1/chat/completions',
      modelsUrl: 'https://api.groq.com/openai/v1/models',
      defaultModel: 'llama-3.3-70b-versatile',
      type: 'openai', name: 'Groq',
    };
  if (p.includes('openai') || p.includes('chatgpt') || p.includes('gpt')
    || e.includes('openai.com')
    || (k.startsWith('sk-') && !k.startsWith('sk-ant-')))
    return {
      url: endpoint || 'https://api.openai.com/v1/chat/completions',
      modelsUrl: 'https://api.openai.com/v1/models',
      defaultModel: 'gpt-4o', type: 'openai', name: 'OpenAI',
    };
  if (p.includes('anthropic') || p.includes('claude')
    || e.includes('anthropic.com') || k.startsWith('sk-ant-'))
    return {
      url: endpoint || 'https://api.anthropic.com/v1/messages',
      modelsUrl: 'https://api.anthropic.com/v1/models',
      defaultModel: 'claude-haiku-4-5-20251001',
      type: 'claude', name: 'Claude',
    };
  if (p.includes('google') || p.includes('gemini')
    || e.includes('googleapis.com') || k.startsWith('AIza'))
    return {
      url: endpoint || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
      modelsUrl: null, defaultModel: 'gemini-1.5-flash',
      type: 'gemini', name: 'Gemini',
    };
  if (p.includes('mistral') || e.includes('mistral.ai'))
    return {
      url: endpoint || 'https://api.mistral.ai/v1/chat/completions',
      modelsUrl: 'https://api.mistral.ai/v1/models',
      defaultModel: 'mistral-small-latest',
      type: 'openai', name: 'Mistral',
    };
  if (p.includes('openrouter') || e.includes('openrouter.ai'))
    return {
      url: endpoint || 'https://openrouter.ai/api/v1/chat/completions',
      modelsUrl: 'https://openrouter.ai/api/v1/models',
      defaultModel: 'openai/gpt-4o',
      type: 'openai', name: 'OpenRouter',
    };
  if (e) return {
    url: endpoint, modelsUrl: null,
    defaultModel: 'auto', type: 'openai',
    name: providerName || 'Custom API',
  };
  return null;
};

const fetchBestModel = async (config, apiKey) => {
  if (!config?.modelsUrl || !apiKey) return config?.defaultModel;
  try {
    const headers = {};
    if (config.type === 'claude') {
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
    } else {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
    const response = await fetch(config.modelsUrl, { headers });
    if (!response.ok) return config.defaultModel;
    const data = await response.json();
    let models = [];
    if (data.data) models = data.data.map(m => m.id || m.name);
    else if (data.models) models = data.models.map(m => m.name || m.id);
    else if (Array.isArray(data)) models = data.map(m => m.id || m.name);
    if (!models.length) return config.defaultModel;
    const preferred = [
      'gpt-4o', 'claude-opus', 'gemini-1.5-pro',
      'llama-3.3-70b', 'mistral-large',
    ];
    const best = models.find(m =>
      preferred.some(pref => m.toLowerCase().includes(pref.toLowerCase()))
    );
    return best || models[0] || config.defaultModel;
  } catch (e) {
    return config.defaultModel;
  }
};

const getProviderColor = (name = '', apiKey = '', endpoint = '') => {
  const config = detectConfig(name, apiKey, endpoint);
  if (!config) return '#00d4ff';
  const n = config.name.toLowerCase();
  if (n.includes('groq')) return '#f97316';
  if (n.includes('openai')) return '#10b981';
  if (n.includes('claude') || n.includes('anthropic')) return '#f59e0b';
  if (n.includes('gemini') || n.includes('google')) return '#3b82f6';
  if (n.includes('mistral')) return '#8b5cf6';
  if (n.includes('openrouter')) return '#e879f9';
  return '#00d4ff';
};

export default function BYOKScreen({ navigate }) {
  const [byokEnabled, setByokEnabled] = useState(false);
  const [slots, setSlots] = useState([
    { id: 1, providerName: '', apiKey: '', endpoint: '', active: false, detectedModel: '', detectedName: '' },
    { id: 2, providerName: '', apiKey: '', endpoint: '', active: false, detectedModel: '', detectedName: '' },
    { id: 3, providerName: '', apiKey: '', endpoint: '', active: false, detectedModel: '', detectedName: '' },
  ]);

  useEffect(() => {
    try {
      const savedEnabled = localStorage.getItem('byok_enabled');
      const savedSlots = localStorage.getItem('byok_keys');
      if (savedEnabled) setByokEnabled(savedEnabled === 'true');
      if (savedSlots) {
        const parsed = JSON.parse(savedSlots);
        setSlots(parsed.map(s => ({
          id: s.id,
          providerName: s.providerName || '',
          apiKey: s.apiKey || '',
          endpoint: s.endpoint || '',
          active: s.active || false,
          detectedModel: s.detectedModel || '',
          detectedName: s.detectedName || '',
        })));
      }
    } catch (e) {}
  }, []);

  const saveSlots = (newSlots) => {
    setSlots(newSlots);
    localStorage.setItem('byok_keys', JSON.stringify(newSlots));
  };

  const updateSlot = async (id, field, value) => {
    const newSlots = slots.map(s =>
      s.id === id ? { ...s, [field]: value } : s
    );
    const slot = newSlots.find(s => s.id === id);
    if (['apiKey', 'providerName', 'endpoint'].includes(field) && slot.apiKey) {
      const config = detectConfig(slot.providerName, slot.apiKey, slot.endpoint);
      if (config) {
        const bestModel = await fetchBestModel(config, slot.apiKey);
        const idx = newSlots.findIndex(s => s.id === id);
        newSlots[idx].detectedModel = bestModel;
        newSlots[idx].detectedName = config.name;
      }
    }
    saveSlots([...newSlots]);
  };

  const toggleByok = (val) => {
    setByokEnabled(val);
    localStorage.setItem('byok_enabled', val.toString());
  };

  const toggleSlotActive = (id) => {
    saveSlots(slots.map(s =>
      s.id === id ? { ...s, active: !s.active } : s
    ));
  };

  const isSlotReady = (slot) =>
    slot.apiKey && (slot.providerName || slot.detectedName || slot.endpoint);

  const activeCount = slots.filter(s => s.active && s.apiKey).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('settings')}>
          <Text style={styles.backBtn}>{t('back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🔑 My APIs</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🤖 Smart Auto-Detection!</Text>
          <Text style={styles.infoText}>
            Provider Name (optional) + API Key{'\n'}
            Model automatic choose होगी!{'\n'}
            जो slot ON है उससे answer मिलेगा!{'\n'}
            एक fail हो तो दूसरा automatic try करेगा! 🔄
          </Text>
        </View>

        {/* Master Toggle */}
        <View style={styles.masterRow}>
          <View>
            <Text style={styles.masterTitle}>BYOK Mode</Text>
            <Text style={styles.masterDesc}>
              {byokEnabled
                ? `✅ ${activeCount} slot${activeCount !== 1 ? 's' : ''} active`
                : '❌ Basic mode'}
            </Text>
          </View>
          <Switch
            value={byokEnabled}
            onValueChange={toggleByok}
            trackColor={{ false: '#1a3a6a', true: '#00d4ff' }}
            thumbColor={byokEnabled ? '#fff' : '#4a7aaa'}
          />
        </View>

        {/* Tip */}
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Free API - Groq</Text>
          <Text style={styles.tipText}>
            1. console.groq.com पर जाएं{'\n'}
            2. Free account बनाएं{'\n'}
            3. API Keys → Create Key{'\n'}
            4. Provider: Groq (optional){'\n'}
            5. Key paste करें → Done!
          </Text>
        </View>

        {/* Slots */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ API Slots</Text>
          {slots.map((slot) => {
            const config = detectConfig(
              slot.providerName, slot.apiKey, slot.endpoint
            );
            const color = getProviderColor(
              slot.providerName, slot.apiKey, slot.endpoint
            );
            return (
              <View key={slot.id} style={[
                styles.slotCard,
                isSlotReady(slot) && { borderColor: color },
                slot.active && slot.apiKey && { borderWidth: 2 },
              ]}>
                <View style={styles.slotHeader}>
                  <Text style={styles.slotNum}>Slot {slot.id}</Text>
                  <Text style={[
                    styles.slotStatus,
                    { color: isSlotReady(slot) ? color : '#4a7aaa' },
                  ]}>
                    {slot.active && slot.apiKey
                      ? `🟢 ${slot.detectedName || config?.name || 'Active'}`
                      : isSlotReady(slot)
                      ? `⚪ ${slot.detectedName || config?.name || 'Ready'}`
                      : '⏳ Add details'}
                  </Text>
                </View>

                <Text style={styles.fieldLabel}>
                  Provider Name (Optional)
                </Text>
                <TextInput
                  style={[
                    styles.fieldInput,
                    slot.providerName && { borderColor: color },
                  ]}
                  placeholder="Groq, OpenAI, Claude... (optional)"
                  placeholderTextColor="#3a5a8a"
                  value={slot.providerName}
                  onChangeText={(v) => updateSlot(slot.id, 'providerName', v)}
                />

                <Text style={styles.fieldLabel}>
                  API Endpoint (Optional)
                </Text>
                <TextInput
                  style={[
                    styles.fieldInput,
                    slot.endpoint && { borderColor: color },
                  ]}
                  placeholder="https://api.example.com/v1/... (optional)"
                  placeholderTextColor="#3a5a8a"
                  value={slot.endpoint}
                  autoCapitalize="none"
                  onChangeText={(v) => updateSlot(slot.id, 'endpoint', v)}
                />

                {(config || slot.detectedModel) && (
                  <View style={[styles.autoDetected, { borderColor: color }]}>
                    <Text style={[styles.autoTitle, { color }]}>
                      ⚡ Auto-detected:
                    </Text>
                    <Text style={styles.autoText}>
                      Provider: {slot.detectedName || config?.name}{'\n'}
                      Model: {slot.detectedModel || config?.defaultModel}
                    </Text>
                  </View>
                )}

                <Text style={styles.fieldLabel}>API Key 🔒</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="API key paste करो..."
                  placeholderTextColor="#3a5a8a"
                  value={slot.apiKey}
                  onChangeText={(v) => updateSlot(slot.id, 'apiKey', v)}
                  secureTextEntry={true}
                  autoCapitalize="none"
                />

                <View style={styles.activeRow}>
                  <Text style={styles.activeLabel}>
                    {slot.active && slot.apiKey
                      ? '🟢 Use this slot'
                      : '⚪ Use this slot'}
                  </Text>
                  <Switch
                    value={slot.active}
                    onValueChange={() => toggleSlotActive(slot.id)}
                    trackColor={{ false: '#1a3a6a', true: color }}
                    thumbColor={slot.active ? '#fff' : '#4a7aaa'}
                  />
                </View>
              </View>
            );
          })}
        </View>

        {/* Supported Providers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✅ Supported Providers</Text>
          <View style={styles.providersGrid}>
            {[
              'Groq', 'OpenAI', 'Claude', 'Gemini',
              'Mistral', 'OpenRouter', 'Custom',
            ].map((p, i) => (
              <View key={i} style={[
                styles.providerChip,
                { borderColor: getProviderColor(p) },
              ]}>
                <Text style={[
                  styles.providerText,
                  { color: getProviderColor(p) },
                ]}>
                  {p}
                </Text>
              </View>
            ))}
          </View>
          <Text style={styles.futureNote}>
            + Future में कोई भी API automatic काम करेगी!
          </Text>
        </View>

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
  title: { color: '#fff', fontSize: 18, fontWeight: '900' },
  infoCard: {
    margin: 20, backgroundColor: '#0d2a1a', borderRadius: 16,
    padding: 18, borderWidth: 1, borderColor: '#10b981',
  },
  infoTitle: {
    color: '#10b981', fontSize: 16, fontWeight: 'bold', marginBottom: 8,
  },
  infoText: { color: '#4a9a7a', fontSize: 13, lineHeight: 22 },
  masterRow: {
    marginHorizontal: 20, backgroundColor: '#0d1f3c', borderRadius: 14,
    padding: 16, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', borderWidth: 1, borderColor: '#00d4ff',
    marginBottom: 15,
  },
  masterTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  masterDesc: { color: '#4a7aaa', fontSize: 12, marginTop: 3 },
  tipCard: {
    marginHorizontal: 20, marginBottom: 15, backgroundColor: '#1a1a0a',
    borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#f59e0b',
  },
  tipTitle: {
    color: '#f59e0b', fontSize: 14, fontWeight: 'bold', marginBottom: 8,
  },
  tipText: { color: '#a08030', fontSize: 13, lineHeight: 22 },
  section: { marginHorizontal: 20, marginBottom: 25 },
  sectionTitle: {
    color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 12,
  },
  slotCard: {
    backgroundColor: '#0d1f3c', borderRadius: 14, padding: 16,
    marginBottom: 15, borderWidth: 1, borderColor: '#1a3a6a',
  },
  slotHeader: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12,
  },
  slotNum: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  slotStatus: { fontSize: 12, fontWeight: '600' },
  fieldLabel: { color: '#4a7aaa', fontSize: 12, marginBottom: 5, marginTop: 8 },
  fieldInput: {
    backgroundColor: '#050918', borderRadius: 10, padding: 12,
    color: '#fff', fontSize: 13, borderWidth: 1, borderColor: '#1a3a6a',
  },
  autoDetected: {
    marginTop: 8, padding: 10, borderRadius: 8,
    borderWidth: 1, backgroundColor: '#050918',
  },
  autoTitle: { fontSize: 11, fontWeight: 'bold', marginBottom: 3 },
  autoText: { color: '#888', fontSize: 12, lineHeight: 18 },
  activeRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 14, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: '#1a3a6a',
  },
  activeLabel: { color: '#fff', fontSize: 14 },
  providersGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  providerChip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, backgroundColor: '#0d1f3c',
  },
  providerText: { fontSize: 12, fontWeight: '600' },
  futureNote: { color: '#4a7aaa', fontSize: 12, fontStyle: 'italic' },
});
