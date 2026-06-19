import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Animated, Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigate }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const eyeScale = useRef(new Animated.Value(0)).current;
  const eyeOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.5)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(ringScale, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
        Animated.timing(eyeOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.spring(eyeScale, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }),
      Animated.timing(textOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(formOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem('userName', 'Vipul');
      localStorage.setItem('userEmail', 'drishtiaiofficial@gmail.com');
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('loginMethod', 'google');
      navigate('dashboard');
    }, 1200);
  };

  const handleSendOTP = () => {
    if (!email.trim() || !email.includes('@')) { setError('सही email डालें'); return; }
    setError(''); setLoading(true);
    setTimeout(() => { setLoading(false); setOtpSent(true); }, 1000);
  };

  const handleVerifyOTP = () => {
    if (!otp.trim() || otp.length < 4) { setError('OTP डालें'); return; }
    setError(''); setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const rawName = email.split('@')[0];
      const userName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
      localStorage.setItem('userName', userName);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('isLoggedIn', 'true');
      navigate('onboarding');
    }, 1000);
  };

  return (
    <View style={styles.container}>
      {[...Array(15)].map((_, i) => (
        <View key={i} style={[styles.star, {
          top: Math.random() * height, left: Math.random() * width,
          width: Math.random() * 3 + 1, height: Math.random() * 3 + 1,
          opacity: Math.random() * 0.7 + 0.1,
        }]} />
      ))}

      <View style={styles.centerContent}>
        <View style={styles.eyeWrapper}>
          <Animated.View style={[styles.outerRing, { transform: [{ scale: ringScale }], opacity: eyeOpacity }]} />
          <Animated.View style={[styles.middleRing, { transform: [{ scale: ringScale }], opacity: eyeOpacity }]} />
          <Animated.View style={[styles.eyeOuter, { opacity: eyeOpacity, transform: [{ scale: ringScale }] }]}>
            <Animated.View style={[styles.eyeWhite, { transform: [{ scaleY: eyeScale }] }]}>
              <View style={styles.iris}>
                <View style={styles.irisRing} />
                <View style={styles.pupil}>
                  <View style={styles.shine1} />
                  <View style={styles.shine2} />
                </View>
              </View>
              <View style={styles.eyelidTop} />
              <View style={styles.eyelidBottom} />
            </Animated.View>
          </Animated.View>
        </View>
        <Animated.Text style={[styles.logo, { opacity: textOpacity }]}>DRISHTI</Animated.Text>
        <Animated.Text style={[styles.tagline, { opacity: textOpacity }]}>
          आपका AI सहायक • Your AI Guide
        </Animated.Text>
      </View>

      <Animated.View style={[styles.form, { opacity: formOpacity }]}>
        {error !== '' && <Text style={styles.errorText}>⚠️ {error}</Text>}

        <TouchableOpacity
          style={[styles.googleBtn, loading && { opacity: 0.7 }]}
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          <Text style={styles.googleIcon}>G</Text>
          <Text style={styles.googleText}>
            {loading ? 'Signing in...' : 'Google से Login करो'}
          </Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>या</Text>
          <View style={styles.dividerLine} />
        </View>

        {!otpSent ? (
          <>
            <Text style={styles.formTitle}>Email से Login करो</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>✉️</Text>
              <TextInput
                style={styles.input}
                placeholder="Email address डालें..."
                placeholderTextColor="#3a5a8a"
                value={email}
                onChangeText={(t) => { setEmail(t); setError(''); }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <TouchableOpacity style={[styles.button, loading && { opacity: 0.6 }]} onPress={handleSendOTP} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? 'भेज रहे हैं...' : 'OTP भेजो →'}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.formTitle}>OTP आया! ✅</Text>
            <Text style={styles.otpNote}>{email} पर भेजा</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>🔐</Text>
              <TextInput
                style={styles.input}
                placeholder="OTP डालें..."
                placeholderTextColor="#3a5a8a"
                value={otp}
                onChangeText={(t) => { setOtp(t); setError(''); }}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>
            <TouchableOpacity style={[styles.button, loading && { opacity: 0.6 }]} onPress={handleVerifyOTP} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? 'Verify हो रहा है...' : 'DRISHTI खोलो 🔮'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setOtpSent(false); setOtp(''); setError(''); }}>
              <Text style={styles.backText}>← वापस</Text>
            </TouchableOpacity>
          </>
        )}
      </Animated.View>
      <Text style={styles.madeIn}>Made in India 🇮🇳</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050918' },
  star: { position: 'absolute', backgroundColor: '#fff', borderRadius: 10 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  eyeWrapper: { width: 160, height: 160, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  outerRing: { position: 'absolute', width: 155, height: 155, borderRadius: 77.5, borderWidth: 1, borderColor: 'rgba(0,212,255,0.3)' },
  middleRing: { position: 'absolute', width: 125, height: 125, borderRadius: 62.5, borderWidth: 1, borderColor: 'rgba(0,212,255,0.5)' },
  eyeOuter: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#00d4ff', backgroundColor: '#0d1f3c', justifyContent: 'center', alignItems: 'center' },
  eyeWhite: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#e8f4ff', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  iris: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#1a6aaa', justifyContent: 'center', alignItems: 'center' },
  irisRing: { position: 'absolute', width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  pupil: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#050918', justifyContent: 'flex-start', alignItems: 'flex-end', padding: 2 },
  shine1: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.9)' },
  shine2: { position: 'absolute', width: 2, height: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.6)', bottom: 2, left: 2 },
  eyelidTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 9, backgroundColor: 'rgba(5,9,24,0.3)', borderTopLeftRadius: 35, borderTopRightRadius: 35 },
  eyelidBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 6, backgroundColor: 'rgba(5,9,24,0.2)', borderBottomLeftRadius: 35, borderBottomRightRadius: 35 },
  logo: { fontSize: 34, fontWeight: '900', color: '#fff', letterSpacing: 8, textShadowColor: '#00d4ff', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20, marginBottom: 6 },
  tagline: { color: '#4a7aaa', fontSize: 12, letterSpacing: 1 },
  form: { paddingHorizontal: 25, paddingBottom: 40 },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: 14, paddingVertical: 14, marginBottom: 16, gap: 10 },
  googleIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#4285F4', color: '#fff', textAlign: 'center', lineHeight: 24, fontWeight: '900', fontSize: 14 },
  googleText: { color: '#000', fontSize: 15, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#1a3a6a' },
  dividerText: { color: '#4a7aaa', fontSize: 13 },
  formTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  otpNote: { color: '#4a7aaa', fontSize: 13, marginBottom: 12 },
  errorText: { color: '#ff4444', fontSize: 13, marginBottom: 10 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0d1f3c', borderRadius: 14, borderWidth: 1, borderColor: '#1a3a6a', marginBottom: 14, paddingHorizontal: 15 },
  inputIcon: { fontSize: 18, marginRight: 10 },
  input: { flex: 1, color: '#fff', paddingVertical: 14, fontSize: 15 },
  button: { backgroundColor: '#00d4ff', paddingVertical: 15, borderRadius: 14, alignItems: 'center', marginBottom: 12 },
  buttonText: { color: '#000', fontSize: 15, fontWeight: '800' },
  backText: { color: '#4a7aaa', fontSize: 13, textAlign: 'center' },
  madeIn: { position: 'absolute', bottom: 20, alignSelf: 'center', color: '#1a3a5a', fontSize: 11 },
});
