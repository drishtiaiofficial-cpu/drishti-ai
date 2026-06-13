import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Animated, Dimensions, ScrollView,
} from 'react-native';
import { t } from '../utils/translations';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isNewUser, setIsNewUser] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;
  const logoScale = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const eyeScaleY = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
      navigate('dashboard');
      return;
    }

    // Entry animation
    Animated.sequence([
      Animated.spring(logoScale, {
        toValue: 1, tension: 60, friction: 7, useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1, duration: 500, useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0, tension: 50, friction: 8, useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Glow loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1, duration: 2000, useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0, duration: 2000, useNativeDriver: true,
        }),
      ])
    ).start();

    // Blink loop
    const blink = () => {
      Animated.sequence([
        Animated.timing(eyeScaleY, {
          toValue: 0.05, duration: 80, useNativeDriver: true,
        }),
        Animated.timing(eyeScaleY, {
          toValue: 1, duration: 80, useNativeDriver: true,
        }),
      ]).start();
    };
    const blinkInterval = setInterval(blink, 3500);
    return () => clearInterval(blinkInterval);
  }, []);

  const shakeError = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const pressButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95, duration: 80, useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1, duration: 80, useNativeDriver: true,
      }),
    ]).start();
  };

  const isValidEmail = (e) =>
    e.trim() && e.includes('@') && e.includes('.');

  const handleSubmit = () => {
    pressButton();
    if (!isValidEmail(email)) {
      setError('सही Email address डालो।');
      shakeError();
      return;
    }
    if (!password || password.length < 6) {
      setError('Password कम से कम 6 characters का होना चाहिए।');
      shakeError();
      return;
    }
    setError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (isNewUser) {
        const rawName = email.split('@')[0];
        const userName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
        localStorage.setItem('userName', userName);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userPassword', password);
        localStorage.setItem('isLoggedIn', 'true');
        navigate('onboarding');
      } else {
        const savedEmail = localStorage.getItem('userEmail');
        const savedPassword = localStorage.getItem('userPassword');
        if (!savedEmail) {
          setError('Account नहीं मिला। पहले Register करो।');
          shakeError();
          return;
        }
        if (savedEmail !== email) {
          setError('यह Email registered नहीं है।');
          shakeError();
          return;
        }
        if (savedPassword !== password) {
          setError('Password गलत है। दोबारा try करो।');
          shakeError();
          return;
        }
        localStorage.setItem('isLoggedIn', 'true');
        const hasOnboarded = localStorage.getItem('hasOnboarded');
        navigate(hasOnboarded === 'true' ? 'dashboard' : 'onboarding');
      }
    }, 1200);
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1], outputRange: [0.4, 1],
  });

  return (
    <View style={styles.container}>

      {/* Background Stars */}
      {[...Array(20)].map((_, i) => (
        <Animated.View
          key={i}
          style={[styles.star, {
            top: Math.random() * height,
            left: Math.random() * width,
            width: Math.random() * 2.5 + 0.5,
            height: Math.random() * 2.5 + 0.5,
            opacity: Math.random() * 0.6 + 0.1,
          }]}
        />
      ))}

      {/* Background Circles */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* Logo Section */}
        <Animated.View
          style={[styles.logoSection, { transform: [{ scale: logoScale }] }]}
        >
          {/* Glow Ring */}
          <Animated.View style={[styles.glowRing, { opacity: glowOpacity }]} />
          <Animated.View style={[styles.glowRing2, { opacity: glowOpacity }]} />

          {/* Eye */}
          <View style={styles.eyeOuter}>
            <Animated.View style={[styles.eyeWhite, {
              transform: [{ scaleY: eyeScaleY }],
            }]}>
              <View style={styles.iris}>
                <View style={styles.irisInner} />
                <View style={styles.pupil}>
                  <View style={styles.shine1} />
                  <View style={styles.shine2} />
                </View>
              </View>
              <View style={styles.eyelidTop} />
              <View style={styles.eyelidBottom} />
            </Animated.View>
          </View>

          {/* App Name */}
          <Text style={styles.appName}>DRISHTI</Text>
          <Text style={styles.appTagline}>आपका AI सहायक • Your AI Guide</Text>
        </Animated.View>

        {/* Form Card */}
        <Animated.View style={[
          styles.card,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { translateX: shakeAnim },
            ],
          },
        ]}>

          {/* Tab Toggle */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tab, isNewUser && styles.tabActive]}
              onPress={() => { setIsNewUser(true); setError(''); }}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, isNewUser && styles.tabTextActive]}>
                नया Account
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, !isNewUser && styles.tabActive]}
              onPress={() => { setIsNewUser(false); setError(''); }}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, !isNewUser && styles.tabTextActive]}>
                Login करो
              </Text>
            </TouchableOpacity>
          </View>

          {/* Heading */}
          <Text style={styles.heading}>
            {isNewUser ? 'Account बनाओ ✨' : 'वापस आए! 👋'}
          </Text>
          <Text style={styles.subHeading}>
            {isNewUser
              ? 'Free में शुरू करो - कोई credit card नहीं'
              : 'अपनी Email और Password डालो'}
          </Text>

          {/* Error */}
          {error !== '' && (
            <View style={styles.errorBox}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Email Field */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Email Address</Text>
            <View style={[
              styles.inputBox,
              emailFocused && styles.inputBoxFocused,
            ]}>
              <Text style={styles.fieldIcon}>✉️</Text>
              <TextInput
                style={styles.input}
                placeholder="आपकी Email डालो..."
                placeholderTextColor="#3a5a8a"
                value={email}
                onChangeText={(v) => { setEmail(v); setError(''); }}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {email.length > 0 && isValidEmail(email) && (
                <Text style={styles.validIcon}>✅</Text>
              )}
            </View>
          </View>

          {/* Password Field */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Password</Text>
            <View style={[
              styles.inputBox,
              passFocused && styles.inputBoxFocused,
            ]}>
              <Text style={styles.fieldIcon}>🔐</Text>
              <TextInput
                style={styles.input}
                placeholder="Password डालो..."
                placeholderTextColor="#3a5a8a"
                value={password}
                onChangeText={(v) => { setPassword(v); setError(''); }}
                onFocus={() => setPassFocused(true)}
                onBlur={() => setPassFocused(false)}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                <Text style={styles.eyeBtnText}>
                  {showPassword ? '🙈' : '👁️'}
                </Text>
              </TouchableOpacity>
            </View>
            {password.length > 0 && password.length < 6 && (
              <Text style={styles.hintText}>
                ⚠️ कम से कम 6 characters चाहिए
              </Text>
            )}
          </View>

          {/* Submit Button */}
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnLoading]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.9}
            >
              {loading ? (
                <View style={styles.loadingRow}>
                  <Text style={styles.submitBtnText}>Processing</Text>
                  <Text style={styles.dots}>...</Text>
                </View>
              ) : (
                <Text style={styles.submitBtnText}>
                  {isNewUser ? '🚀  Free Account बनाओ' : '🔮  DRISHTI खोलो'}
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>या</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Switch Mode */}
          <TouchableOpacity
            style={styles.switchBtn}
            onPress={() => { setIsNewUser(!isNewUser); setError(''); }}
          >
            <Text style={styles.switchText}>
              {isNewUser
                ? 'पहले से account है?  '
                : 'नया account बनाना है?  '}
              <Text style={styles.switchLink}>
                {isNewUser ? 'Login करो →' : 'Register करो →'}
              </Text>
            </Text>
          </TouchableOpacity>

          {/* Terms */}
          {isNewUser && (
            <Text style={styles.termsText}>
              Account बनाकर आप हमारी{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}और{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
              {' '}से agree करते हैं।
            </Text>
          )}

        </Animated.View>

        {/* Footer */}
        <Text style={styles.footer}>Made with ❤️ in India 🇮🇳</Text>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020815',
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 30,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    borderRadius: 10,
  },

  // Background decorative circles
  bgCircle1: {
    position: 'absolute',
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(0, 212, 255, 0.04)',
    top: -80, left: -80,
  },
  bgCircle2: {
    position: 'absolute',
    width: 250, height: 250, borderRadius: 125,
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
    bottom: 50, right: -60,
  },

  // Logo Section
  logoSection: {
    alignItems: 'center',
    marginTop: 70,
    marginBottom: 35,
  },
  glowRing: {
    position: 'absolute',
    width: 160, height: 160, borderRadius: 80,
    borderWidth: 1,
    borderColor: '#00d4ff',
    top: -10,
  },
  glowRing2: {
    position: 'absolute',
    width: 200, height: 200, borderRadius: 100,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 212, 255, 0.3)',
    top: -30,
  },
  eyeOuter: {
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: '#0a1628',
    borderWidth: 2.5,
    borderColor: '#00d4ff',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#00d4ff',
    shadowOpacity: 0.6,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 0 },
    marginBottom: 20,
  },
  eyeWhite: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#e8f4ff',
    justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden',
  },
  iris: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#1a6aaa',
    justifyContent: 'center', alignItems: 'center',
  },
  irisInner: {
    position: 'absolute',
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(0, 150, 255, 0.4)',
  },
  pupil: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#050918',
    justifyContent: 'flex-start', alignItems: 'flex-end', padding: 3,
  },
  shine1: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  shine2: {
    position: 'absolute', width: 3, height: 3, borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.6)', bottom: 3, left: 3,
  },
  eyelidTop: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 12,
    backgroundColor: 'rgba(5,9,24,0.25)',
    borderTopLeftRadius: 45, borderTopRightRadius: 45,
  },
  eyelidBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 8,
    backgroundColor: 'rgba(5,9,24,0.2)',
    borderBottomLeftRadius: 45, borderBottomRightRadius: 45,
  },
  appName: {
    fontSize: 38, fontWeight: '900', color: '#ffffff',
    letterSpacing: 10,
    textShadowColor: '#00d4ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 25,
    marginBottom: 8,
  },
  appTagline: {
    color: '#4a7aaa', fontSize: 13, letterSpacing: 0.5,
  },

  // Form Card
  card: {
    width: width - 32,
    backgroundColor: '#0d1f3c',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1a3a6a',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#050918',
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#1a3a6a',
  },
  tab: {
    flex: 1, paddingVertical: 12,
    borderRadius: 11, alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#00d4ff',
    shadowColor: '#00d4ff',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  tabText: { color: '#4a7aaa', fontSize: 14, fontWeight: '700' },
  tabTextActive: { color: '#000000', fontWeight: '900' },

  // Heading
  heading: {
    color: '#ffffff', fontSize: 22,
    fontWeight: '900', marginBottom: 6,
  },
  subHeading: {
    color: '#4a7aaa', fontSize: 13,
    lineHeight: 18, marginBottom: 20,
  },

  // Error
  errorBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderRadius: 12, padding: 12,
    marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(255, 68, 68, 0.3)',
    gap: 8,
  },
  errorIcon: { fontSize: 16 },
  errorText: { color: '#ff6b6b', fontSize: 13, flex: 1 },

  // Fields
  fieldWrapper: { marginBottom: 16 },
  fieldLabel: {
    color: '#7a9abf', fontSize: 12,
    fontWeight: '700', marginBottom: 8,
    letterSpacing: 0.5, textTransform: 'uppercase',
  },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#050918',
    borderRadius: 14, paddingHorizontal: 16,
    borderWidth: 1.5, borderColor: '#1a3a6a',
    gap: 10,
  },
  inputBoxFocused: {
    borderColor: '#00d4ff',
    backgroundColor: '#071428',
    shadowColor: '#00d4ff',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  fieldIcon: { fontSize: 18 },
  input: {
    flex: 1, color: '#ffffff',
    paddingVertical: 15, fontSize: 15,
  },
  validIcon: { fontSize: 16 },
  eyeBtn: { padding: 4 },
  eyeBtnText: { fontSize: 18 },
  hintText: {
    color: '#f59e0b', fontSize: 11, marginTop: 5, marginLeft: 4,
  },

  // Submit Button
  submitBtn: {
    backgroundColor: '#00d4ff',
    borderRadius: 16, paddingVertical: 17,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#00d4ff',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  submitBtnLoading: {
    backgroundColor: '#0099bb',
    shadowOpacity: 0.2,
  },
  submitBtnText: {
    color: '#000000', fontSize: 16,
    fontWeight: '900', letterSpacing: 0.5,
  },
  loadingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  dots: {
    color: '#000000', fontSize: 20, fontWeight: '900',
  },

  // Divider
  divider: {
    flexDirection: 'row', alignItems: 'center',
    marginVertical: 20, gap: 12,
  },
  dividerLine: {
    flex: 1, height: 1, backgroundColor: '#1a3a6a',
  },
  dividerText: { color: '#4a7aaa', fontSize: 13 },

  // Switch
  switchBtn: {
    alignItems: 'center', paddingVertical: 4,
  },
  switchText: {
    color: '#4a7aaa', fontSize: 14, textAlign: 'center',
  },
  switchLink: {
    color: '#00d4ff', fontWeight: '800',
  },

  // Terms
  termsText: {
    color: '#2a4a6a', fontSize: 11,
    textAlign: 'center', marginTop: 16,
    lineHeight: 17,
  },
  termsLink: { color: '#3a6a9a' },

  // Footer
  footer: {
    color: '#1a3a5a', fontSize: 12,
    marginTop: 25, letterSpacing: 0.5,
  },
});
