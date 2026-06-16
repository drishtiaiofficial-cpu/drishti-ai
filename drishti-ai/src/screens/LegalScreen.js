import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ScrollView,
} from 'react-native';

const CONTENT = {
  terms: {
    title: '📋 Terms of Service',
    sections: [
      {
        heading: '1. सेवा की शर्तें',
        body: 'DRISHTI AI Assistant ("सेवा") का उपयोग करके आप इन शर्तों से सहमत होते हैं। यह सेवा 13 वर्ष से अधिक आयु के उपयोगकर्ताओं के लिए है।',
      },
      {
        heading: '2. उपयोग की अनुमति',
        body: 'आप DRISHTI का उपयोग व्यक्तिगत, गैर-व्यावसायिक उद्देश्यों के लिए कर सकते हैं। किसी भी अवैध गतिविधि के लिए उपयोग प्रतिबंधित है।',
      },
      {
        heading: '3. BYOK (Bring Your Own Key)',
        body: 'आप अपनी API keys स्वयं जोड़ सकते हैं। आपकी API keys केवल आपके device पर store होती हैं। हम आपकी keys नहीं देखते या store नहीं करते।',
      },
      {
        heading: '4. सीमाएं',
        body: 'Free tier में प्रतिदिन 20 messages की सीमा है। यह सीमा हमारे engine के उपयोग पर लागू होती है। BYOK से unlimited उपयोग संभव है।',
      },
      {
        heading: '5. सेवा में बदलाव',
        body: 'हम किसी भी समय सेवा में बदलाव कर सकते हैं। महत्वपूर्ण बदलावों की सूचना app update के माध्यम से दी जाएगी।',
      },
      {
        heading: '6. संपर्क',
        body: 'किसी भी प्रश्न के लिए: support@drishti.ai\nवेबसाइट: www.drishti.ai',
      },
    ],
  },
  privacy: {
    title: '🔒 Privacy Policy',
    sections: [
      {
        heading: '1. जानकारी जो हम collect करते हैं',
        body: '• Email address (login के लिए)\n• Chat conversations (session के दौरान)\n• App usage statistics\n• Device information (basic)',
      },
      {
        heading: '2. जानकारी जो हम नहीं collect करते',
        body: '• आपकी API keys (केवल device पर)\n• Personal financial information\n• Location data\n• Contact list',
      },
      {
        heading: '3. Data का उपयोग',
        body: 'आपकी जानकारी का उपयोग:\n• सेवा प्रदान करने के लिए\n• App को बेहतर बनाने के लिए\n• Technical issues fix करने के लिए',
      },
      {
        heading: '4. Data Security',
        body: 'हम industry-standard encryption का उपयोग करते हैं। आपकी API keys केवल आपके device पर locally store होती हैं।',
      },
      {
        heading: '5. Data Deletion',
        body: 'आप Settings → Data Reset करो से अपना सारा data delete कर सकते हैं। Email: privacy@drishti.ai',
      },
      {
        heading: '6. Third Party Services',
        body: 'DRISHTI विभिन्न AI providers (Groq, OpenAI, Google, Anthropic आदि) का उपयोग करता है। उनकी अपनी privacy policies लागू होती हैं।',
      },
    ],
  },
  about: {
    title: '🔮 About DRISHTI',
    sections: [
      {
        heading: 'DRISHTI क्या है?',
        body: 'DRISHTI भारत का AI Assistant है जो Hindi, English और अन्य भाषाओं में help करता है। यह senior citizens, students और everyone के लिए बनाया गया है।',
      },
      {
        heading: 'हमारा Mission',
        body: 'Technology को सबके लिए accessible बनाना। हर भारतीय को AI की शक्ति देना, चाहे वो किसी भी भाषा में बात करें।',
      },
      {
        heading: 'BYOK System',
        body: 'हम मानते हैं कि AI free होनी चाहिए। इसीलिए हमने BYOK (Bring Your Own Key) system बनाया है - अपनी free API key add करो और unlimited use करो।',
      },
      {
        heading: 'Version',
        body: 'DRISHTI v1.0.0\nBuilt with React Native + Expo\nPowered by DRISHTI Engine v2.0',
      },
      {
        heading: 'Contact',
        body: '📧 support@drishti.ai\n🌐 www.drishti.ai\n📱 Play Store: DRISHTI AI',
      },
    ],
  },
};

export default function LegalScreen({ navigate }) {
  const [active, setActive] = useState('terms');
  const content = CONTENT[active];

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('settings')}>
          <Text style={styles.backBtn}>← वापस</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Legal & About</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {[
          { id: 'terms', label: '📋 Terms' },
          { id: 'privacy', label: '🔒 Privacy' },
          { id: 'about', label: '🔮 About' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, active === tab.id && styles.tabActive]}
            onPress={() => setActive(tab.id)}
          >
            <Text style={[
              styles.tabText,
              active === tab.id && styles.tabTextActive,
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.contentTitle}>{content.title}</Text>
          {content.sections.map((section, i) => (
            <View key={i} style={styles.section}>
              <Text style={styles.sectionHeading}>{section.heading}</Text>
              <Text style={styles.sectionBody}>{section.body}</Text>
            </View>
          ))}
        </View>
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
  tabText: { color: '#4a7aaa', fontSize: 12, fontWeight: '600' },
  tabTextActive: { color: '#000', fontWeight: '900' },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  contentTitle: {
    color: '#fff', fontSize: 20,
    fontWeight: '900', marginBottom: 20,
  },
  section: {
    backgroundColor: '#0d1f3c', borderRadius: 14,
    padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#1a3a6a',
  },
  sectionHeading: {
    color: '#00d4ff', fontSize: 14,
    fontWeight: '800', marginBottom: 8,
  },
  sectionBody: { color: '#4a7aaa', fontSize: 13, lineHeight: 22 },
});
