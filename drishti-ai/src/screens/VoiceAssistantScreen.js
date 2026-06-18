import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, Animated, Dimensions, ScrollView,
} from 'react-native';
import { speak, stop as stopSpeaking, VOICE_PROFILES } from '../services/voice/synthesisService';
import { startRecognition } from '../services/voice/recognitionService';
import { sendMessage } from '../services/apiService';

const { width } = Dimensions.get('window');

function ThinkingDot({ delay, color }) {
  const dotAnim = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(dotAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(dotAnim, { toValue: 0.3, duration: 400, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={{
      width: 9, height: 9, borderRadius: 5,
      backgroundColor: color, marginHorizontal: 5,
      opacity: dotAnim, transform: [{ scale: dotAnim }],
    }} />
  );
}

export default function VoiceAssistantScreen({ navigate }) {
  const [mode, setMode] = useState('sleeping');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [showMessages, setShowMessages] = useState(false);

  const glowAnim = useRef(new Animated.Value(1)).current;
  const wave1 = useRef(new Animated.Value(0.3)).current;
  const wave2 = useRef(new Animated.Value(0.5)).current;
  const wave3 = useRef(new Animated.Value(0.7)).current;
  const wave4 = useRef(new Animated.Value(0.4)).current;
  const wave5 = useRef(new Animated.Value(0.6)).current;
  const wave6 = useRef(new Animated.Value(0.3)).current;
  const wave7 = useRef(new Animated.Value(0.8)).current;

  const breatheAnim = useRef(new Animated.Value(1)).current;
  const blinkAnim   = useRef(new Animated.Value(1)).current;
  const bowTieGlow  = useRef(new Animated.Value(0.6)).current;
  const burstAnim   = useRef(new Animated.Value(0)).current;

  const recognitionRef  = useRef(null);
  const chatHistoryRef  = useRef([]);
  const waveAnims = [wave1, wave2, wave3, wave4, wave5, wave6, wave7];

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, { toValue: 1.04, duration: 2800, useNativeDriver: true }),
        Animated.timing(breatheAnim, { toValue: 1,    duration: 2800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    let timeout;
    const doBlink = () => {
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 0.05, duration: 70, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1,    duration: 70, useNativeDriver: true }),
      ]).start(() => {
        const next = mode === 'listening'
          ? 1000 + Math.random() * 700
          : 2800 + Math.random() * 2000;
        timeout = setTimeout(doBlink, next);
      });
    };
    timeout = setTimeout(doBlink, 2000);
    return () => clearTimeout(timeout);
  }, [mode]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bowTieGlow, { toValue: 1,   duration: 1600, useNativeDriver: true }),
        Animated.timing(bowTieGlow, { toValue: 0.4, duration: 1600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (mode === 'listening' || mode === 'speaking') {
      animateWaves();
      animateGlow();
    }
    if (mode === 'listening') {
      burstAnim.setValue(0);
      Animated.timing(burstAnim, { toValue: 1, duration: 900, useNativeDriver: true }).start();
    }
  }, [mode]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      stopSpeaking();
    };
  }, []);

  const animateWaves = () => {
    waveAnims.forEach((wave, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 80),
          Animated.timing(wave, { toValue: 1,   duration: 300 + i * 50, useNativeDriver: true }),
          Animated.timing(wave, { toValue: 0.2, duration: 300 + i * 50, useNativeDriver: true }),
        ])
      ).start();
    });
  };

  const animateGlow = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1.3, duration: 800, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 1,   duration: 800, useNativeDriver: true }),
      ])
    ).start();
  };

  const getModeColor = () => {
    switch (mode) {
      case 'sleeping':  return '#1a3a6a';
      case 'listening': return '#00d4ff';
      case 'thinking':  return '#f59e0b';
      case 'speaking':  return '#10b981';
      default:          return '#00d4ff';
    }
  };

  const getModeText = () => {
    switch (mode) {
      case 'sleeping':  return 'Mic दबाओ और बोलो';
      case 'listening': return 'सुन रही हूँ...';
      case 'thinking':  return 'सोच रही हूँ...';
      case 'speaking':  return 'बोल रही हूँ...';
    }
  };

  const handleMicPress = () => {
    if (mode === 'listening') {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
      setMode('sleeping');
      return;
    }
    if (mode === 'speaking') {
      stopSpeaking();
      setMode('sleeping');
      return;
    }

    const recognition = startRecognition({
      lang: 'hi-IN',
      continuous: false,
      onStart: () => {
        setMode('listening');
        setTranscript('');
        setResponse('');
      },
      onResult: (final, interim) => {
        setTranscript(final + interim);
      },
      onEnd: (finalText) => {
        recognitionRef.current = null;
        if (finalText) processVoiceInput(finalText);
        else { setMode('sleeping'); setTranscript(''); }
      },
      onError: () => {
        recognitionRef.current = null;
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
          processVoiceInput('नमस्ते');
        } else {
          setMode('sleeping');
        }
      },
    });
    recognitionRef.current = recognition;
  };

  const processVoiceInput = async (text) => {
    setTranscript(text);
    setMode('thinking');
    setConversation(prev => [...prev, { role: 'user', text }]);

    try {
      const result = await sendMessage(text, chatHistoryRef.current);
      const aiResponse = result.text || 'कुछ गड़बड़ हुई। दोबारा try करें।';

      chatHistoryRef.current = [
        ...chatHistoryRef.current,
        { role: 'user', content: text },
        { role: 'assistant', content: aiResponse },
      ];

      setResponse(aiResponse);
      setConversation(prev => [...prev, { role: 'drishti', text: aiResponse }]);
      setMode('speaking');

      if (!isMuted) {
        const voiceType = localStorage.getItem('selectedVoice') || 'didi';
        speak(aiResponse, voiceType, () => setMode('sleeping'));
        setTimeout(() => {
          if (!('speechSynthesis' in window) || !window.speechSynthesis.speaking) {
            setMode('sleeping');
          }
        }, aiResponse.length * 80);
      } else {
        setTimeout(() => setMode('sleeping'), 3000);
      }
    } catch (e) {
      setMode('sleeping');
      setResponse('कुछ गड़बड़ हुई। दोबारा try करें।');
    }
  };

  const modeColor    = getModeColor();
  const burstScale   = burstAnim.interpolate({ inputRange: [0,1], outputRange: [1, 1.65] });
  const burstOpacity = burstAnim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0.8, 0.3, 0] });

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          recognitionRef.current?.abort();
          stopSpeaking();
          navigate('dashboard');
        }}>
          <Text style={styles.backBtn}>← वापस</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>दृष्टि</Text>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[
              styles.msgToggleBtn,
              showMessages && { borderColor: modeColor, backgroundColor: modeColor + '22' },
            ]}
            onPress={() => setShowMessages(!showMessages)}
          >
            <Text style={[styles.msgToggleIcon, showMessages && { color: modeColor }]}>💬</Text>
          </TouchableOpacity>

          <View style={[styles.modeBadge, { borderColor: modeColor }]}>
            <Text style={[styles.modeLabel, { color: modeColor }]}>{mode}</Text>
          </View>
        </View>
      </View>

      <View style={styles.characterArea}>

        <View style={styles.avatarContainer}>

          {mode === 'listening' && (
            <Animated.View style={[styles.burstRing, {
              borderColor: modeColor,
              opacity: burstOpacity,
              transform: [{ scale: burstScale }],
            }]} />
          )}

          <Animated.View style={[styles.outerRing, {
            borderColor: mode === 'sleeping' ? '#2a4a8a' : modeColor,
            shadowColor: modeColor,
            transform: [{ scale: glowAnim }],
          }]} />

          <Animated.View style={[styles.characterInner, {
            transform: [{ scale: breatheAnim }],
          }]}>

            <View style={[styles.sphere, { shadowColor: modeColor }]}>
              <View style={styles.sphereHighlight} />
              <View style={styles.eyesContainer}>
                <Animated.View style={[styles.eye, { transform: [{ scaleY: blinkAnim }] }]} />
                <Animated.View style={[styles.eye, { transform: [{ scaleY: blinkAnim }] }]} />
              </View>
            </View>

            <Animated.View style={[styles.bowTieRow, { opacity: bowTieGlow }]}>
              <View style={styles.bowLeft}  />
              <View style={styles.bowKnot}  />
              <View style={styles.bowRight} />
            </Animated.View>

          </Animated.View>
        </View>

        {(mode === 'listening' || mode === 'speaking') && (
          <View style={styles.wavesContainer}>
            {waveAnims.map((wave, i) => (
              <Animated.View key={i} style={[styles.wave, {
                backgroundColor: modeColor,
                transform: [{ scaleY: wave }],
              }]} />
            ))}
          </View>
        )}

        {mode === 'thinking' && (
          <View style={styles.thinkingDots}>
            {[0, 1, 2].map(i => (
              <ThinkingDot key={i} delay={i * 200} color={modeColor} />
            ))}
          </View>
        )}

        {mode === 'sleeping' && <View style={{ height: 50 }} />}

        <Text style={[styles.modeText, { color: modeColor }]}>
          {getModeText()}
        </Text>

        {showMessages && (
          <View style={{ width: '100%' }}>
            {transcript !== '' && (
              <View style={styles.transcriptBox}>
                <Text style={styles.transcriptLabel}>आपने कहा:</Text>
                <Text style={styles.transcriptText}>{transcript}</Text>
              </View>
            )}
            {response !== '' && mode === 'speaking' && (
              <View style={styles.responseBox}>
                <Text style={styles.responseLabel}>🔮 दृष्टि:</Text>
                <Text style={styles.responseText}>{response}</Text>
              </View>
            )}
          </View>
        )}

      </View>

      {showMessages && conversation.length > 0 && (
        <ScrollView style={styles.history} showsVerticalScrollIndicator={false}>
          {conversation.slice(-6).map((item, i) => (
            <View key={i} style={[
              styles.historyItem,
              item.role === 'user' ? styles.userItem : styles.drishtiItem,
            ]}>
              <Text style={styles.historyRole}>{item.role === 'user' ? '👤' : '🔮'}</Text>
              <Text style={styles.historyText}>{item.text}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.bottomControls}>

        <TouchableOpacity
          style={[styles.sideBtn, isMuted && styles.sideBtnMuted]}
          onPress={() => {
            setIsMuted(!isMuted);
            if (!isMuted) stopSpeaking();
          }}
        >
          <Text style={styles.sideBtnIcon}>{isMuted ? '🔇' : '🔊'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.micBtn, { borderColor: modeColor, backgroundColor: modeColor + '22' }]}
          onPress={handleMicPress}
        >
          <Text style={styles.micIcon}>
            {mode === 'sleeping' ? '🎙️' : mode === 'listening' ? '⏹' : mode === 'speaking' ? '🔇' : '⏳'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sideBtn}
          onPress={() => {
            recognitionRef.current?.abort();
            stopSpeaking();
            setMode('sleeping');
            setTranscript('');
            setResponse('');
          }}
        >
          <Text style={styles.sideBtnIcon}>✕</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050918', paddingTop: 50 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 15,
    borderBottomWidth: 1, borderBottomColor: '#0d1f3c',
  },
  backBtn: { color: '#00d4ff', fontSize: 15, width: 60 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  msgToggleBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#0d1f3c', borderWidth: 1, borderColor: '#1a3a6a',
    justifyContent: 'center', alignItems: 'center',
  },
  msgToggleIcon: { fontSize: 16 },
  modeBadge: {
    borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 3,
    width: 80, alignItems: 'center',
  },
  modeLabel: { fontSize: 11, fontWeight: 'bold' },
  characterArea: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20,
  },
  avatarContainer: {
    width: 220, height: 220,
    alignItems: 'center', justifyContent: 'center',
  },
  burstRing: {
    position: 'absolute',
    width: 220, height: 220, borderRadius: 110, borderWidth: 1.5,
  },
  outerRing: {
    position: 'absolute',
    width: 200, height: 200, borderRadius: 100,
    borderWidth: 6,
    shadowOpacity: 1, shadowRadius: 25,
    shadowOffset: { width: 0, height: 0 }, elevation: 20,
  },
  characterInner: { alignItems: 'center' },
  sphere: {
    width: 155, height: 155, borderRadius: 78,
    backgroundColor: '#ddeeff',
    justifyContent: 'center', alignItems: 'center',
    shadowOpacity: 0.9, shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 }, elevation: 20,
    overflow: 'hidden',
  },
  sphereHighlight: {
    position: 'absolute', top: 16, left: 28,
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: 'rgba(255,255,255,0.78)',
  },
  eyesContainer: { flexDirection: 'row', gap: 24, marginTop: 12 },
  eye: {
    width: 20, height: 30, borderRadius: 10,
    backgroundColor: '#0b1930',
    shadowColor: '#00d4ff', shadowOpacity: 0.5,
    shadowRadius: 6, shadowOffset: { width: 0, height: 0 }, elevation: 6,
  },
  bowTieRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  bowLeft: {
    width: 28, height: 17, borderTopLeftRadius: 14, borderBottomLeftRadius: 14,
    backgroundColor: '#00e5cc',
    shadowColor: '#00e5cc', shadowOpacity: 0.9, shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 }, elevation: 10,
  },
  bowKnot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: '#00e5cc',
    shadowColor: '#00e5cc', shadowOpacity: 1, shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 }, elevation: 10,
  },
  bowRight: {
    width: 28, height: 17, borderTopRightRadius: 14, borderBottomRightRadius: 14,
    backgroundColor: '#7b5fff',
    shadowColor: '#7b5fff', shadowOpacity: 0.9, shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 }, elevation: 10,
  },
  wavesContainer: {
    flexDirection: 'row', alignItems: 'center',
    gap: 5, height: 50, marginTop: 14, marginBottom: 6,
  },
  wave: { width: 5, height: 40, borderRadius: 3 },
  thinkingDots: {
    flexDirection: 'row', alignItems: 'center',
    height: 50, marginTop: 14, marginBottom: 6,
  },
  modeText: { fontSize: 16, fontWeight: '600', marginBottom: 20, textAlign: 'center' },
  transcriptBox: {
    backgroundColor: '#0d1f3c', borderRadius: 12, padding: 12,
    marginBottom: 10, borderWidth: 1, borderColor: '#1a3a6a', width: '100%',
  },
  transcriptLabel: { color: '#4a7aaa', fontSize: 11, marginBottom: 4 },
  transcriptText:  { color: '#fff', fontSize: 14 },
  responseBox: {
    backgroundColor: '#071428', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#10b981', width: '100%',
  },
  responseLabel: { color: '#10b981', fontSize: 11, marginBottom: 4 },
  responseText:  { color: '#fff', fontSize: 14, lineHeight: 20 },
  history: { maxHeight: 150, paddingHorizontal: 20, marginBottom: 10 },
  historyItem: { flexDirection: 'row', gap: 8, marginBottom: 8, padding: 10, borderRadius: 10 },
  userItem:    { backgroundColor: '#0d1f3c', alignSelf: 'flex-end' },
  drishtiItem: { backgroundColor: '#071428', alignSelf: 'flex-start' },
  historyRole: { fontSize: 14 },
  historyText: { color: '#fff', fontSize: 13, flex: 1, lineHeight: 18 },
  bottomControls: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 30, paddingHorizontal: 40, gap: 30,
    borderTopWidth: 1, borderTopColor: '#0d1f3c',
  },
  micBtn: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 2, justifyContent: 'center', alignItems: 'center',
  },
  micIcon: { fontSize: 32 },
  sideBtn: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: '#0d1f3c', justifyContent: 'center',
    alignItems: 'center', borderWidth: 1, borderColor: '#1a3a6a',
  },
  sideBtnMuted: { borderColor: '#ff4444', backgroundColor: '#1a0a0a' },
  sideBtnIcon: { fontSize: 20 },
});
