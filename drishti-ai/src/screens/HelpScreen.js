import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ScrollView,
} from 'react-native';

const FAQS = [
  {
    q: 'DRISHTI क्या है?',
    a: 'DRISHTI एक AI Assistant है जो Hindi, English और अन्य भाषाओं में आपकी मदद करता है। UPI, WhatsApp, forms - सब कुछ में guide करता है।',
  },
  {
    q: 'Free में कितने messages मिलते हैं?',
    a: 'बिना API key के प्रतिदिन 20 free messages मिलते हैं। BYOK system से unlimited messages मिलते हैं।',
  },
  {
    q: 'BYOK क्या है?',
    a: 'BYOK = Bring Your Own Key। आप Groq, Gemini, OpenAI जैसी services की free API key add कर सकते हैं और unlimited use कर सकते हैं।',
  },
  {
    q: 'Free API key कैसे मिलेगी?',
    a: '1. console.groq.com पर जाएं\n2. Free account बनाएं\n3. API Keys → Create Key\n4. DRISHTI में Settings → My APIs में paste करें',
  },
  {
    q: 'Voice Assistant कैसे use करें?',
    a: '1. Voice Assistant screen खोलें\n2. Mic button दबाएं\n3. Hindi में बोलें\n4. DRISHTI जवाब देगा',
  },
  {
    q: 'Chat history कहाँ जाती है?',
    a: 'Chat history आपके device पर save होती है। यह केवल आपके phone पर रहती है।',
  },
  {
    q: 'App crash हो रही है?',
    a: 'Settings → Data Reset करो try करें। या App को force close करके reopen करें।',
  },
  {
    q: 'Hindi में जवाब नहीं आ रहा?',
    a: 'Settings में Language को Hindi select करें। BYOK में Gemini या Groq की key add करें।',
  },
];

const GUIDES = [
  { icon: '💰', title: 'UPI Payment', desc: 'GPay/PhonePe से payment करना सीखो' },
  { icon: '📱', title: 'WhatsApp', desc: 'Message, photo, document भेजना सीखो' },
  { icon: '📄', title: 'Form Fill', desc: 'Online forms भरना सीखो' },
  { icon: '🔑', title: 'API Key', desc: 'Free API key add करना सीखो' },
  { icon: '🎙️', title: 'Voice Use', desc: 'Voice assistant use करना सीखो' },
];

export default function HelpScreen({ navigate }) {
  const [openFAQ, setOpenFAQ] = useState(null);
  const [tab, setTab] = useState('faq');

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('settings')}>
          <Text style={styles.backBtn}>← वापस</Text>
        </TouchableOpacity>
        <Text style={styles.title}>❓ Help & FAQ</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.tabs}>
        {[
          { id: 'faq', label: '❓ FAQ' },
          { id: 'guides', label: '📚 Guides' },
          { id: 'contact', label: '📧 Contact' },
        ].map(t => (
          <TouchableOpacity
            key={t.id}
            style={[styles.tab, tab === t.id && styles.tabActive]}
            onPress={() => setTab(t.id)}
          >
            <Text style={[styles.tabText, tab === t.id && styles.tabTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {tab === 'faq' && (
          <View style={styles.content}>
            {FAQS.map((faq, i) => (
              <TouchableOpacity
                key={i}
                style={styles.faqCard}
                onPress={() => setOpenFAQ(openFAQ === i ? null : i)}
              >
                <View style={styles.faqQ}>
                  <Text style={styles.faqQText}>{faq.q}</Text>
                  <Text style={styles.faqIcon}>
                    {openFAQ === i ? '▲' : '▼'}
                  </Text>
                </View>
                {openFAQ === i && (
                  <Text style={styles.faqA}>{faq.a}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {tab === 'guides' && (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>📚 Quick Guides</Text>
            {GUIDES.map((g, i) => (
              <TouchableOpacity
                key={i}
                style={styles.guideCard}
                onPress={() => navigate('chat')}
              >
                <Text style={styles.guideIcon}>{g.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.guideTitle}>{g.title}</Text>
                  <Text style={styles.guideDesc}>{g.desc}</Text>
                </View>
                <Text style={styles.guideArrow}>→</Text>
              </TouchableOpacity>
            ))}
            <Text style={styles.guideTip}>
              💡 Chat में इनके बारे में पूछो - DRISHTI step-by-step बताएगा!
            </Text>
          </View>
        )}

        {tab === 'contact' && (
          <View style={styles.content}>
            <View style={styles.contactCard}>
              <Text style={styles.contactTitle}>📧 Support</Text>
              <Text style={styles.contactText}>support@drishti.ai</Text>
            </View>
            <View style={styles.contactCard}>
              <Text style={styles.contactTitle}>🌐 Website</Text>
              <Text style={styles.contactText}>www.drishti.ai</Text>
            </View>
            <View style={styles.contactCard}>
              <Text style={styles.contactTitle}>⏰ Response Time</Text>
              <Text style={styles.contactText}>24-48 hours</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                🐛 Bug मिला? Chat में DRISHTI को बताओ या email करो।{'\n\n'}
                💡 Feature request? हम सुनते हैं!
              </Text>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
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
  tabs: {
    flexDirection: 'row', backgroundColor: '#0d1f3c',
    margin: 16, borderRadius: 14, padding: 4,
    borderWidth: 1, borderColor: '#1a3a6a',
  },
  tab: {
    flex: 1, paddingVertical: 10,
    borderRadius: 11, alignItems: 'center',
  },
  tabActive: { backgroundColor: '#00d4ff' },
  tabText: { color: '#4a7aaa', fontSize: 11, fontWeight: '600' },
  tabTextActive: { color: '#000', fontWeight: '900' },
  content: { paddingHorizontal: 16 },
  faqCard: {
    backgroundColor: '#0d1f3c', borderRadius: 14,
    padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: '#1a3a6a',
  },
  faqQ: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQText: { color: '#fff', fontSize: 14, fontWeight: '600', flex: 1 },
  faqIcon: { color: '#4a7aaa', fontSize: 12 },
  faqA: { color: '#4a7aaa', fontSize: 13, lineHeight: 22, marginTop: 10 },
  sectionTitle: {
    color: '#fff', fontSize: 16,
    fontWeight: '700', marginBottom: 12,
  },
  guideCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0d1f3c', borderRadius: 14,
    padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: '#1a3a6a', gap: 12,
  },
  guideIcon: { fontSize: 28 },
  guideTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  guideDesc: { color: '#4a7aaa', fontSize: 12, marginTop: 2 },
  guideArrow: { color: '#00d4ff', fontSize: 18 },
  guideTip: {
    color: '#4a7aaa', fontSize: 13,
    textAlign: 'center', marginTop: 16, lineHeight: 20,
  },
  contactCard: {
    backgroundColor: '#0d1f3c', borderRadius: 14,
    padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: '#1a3a6a',
  },
  contactTitle: {
    color: '#00d4ff', fontSize: 13,
    fontWeight: '700', marginBottom: 6,
  },
  contactText: { color: '#fff', fontSize: 15 },
  infoCard: {
    backgroundColor: '#0d2a1a', borderRadius: 14,
    padding: 16, marginTop: 8,
    borderWidth: 1, borderColor: '#10b981',
  },
  infoText: { color: '#4a9a7a', fontSize: 13, lineHeight: 22 },
});
