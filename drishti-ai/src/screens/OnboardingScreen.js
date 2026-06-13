import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, Animated,
} from 'react-native';
import { t, getSlides } from '../utils/translations';

export default function OnboardingScreen({ navigate }) {
  const [current, setCurrent] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slides = getSlides();

  const goToDashboard = () => {
    localStorage.setItem('hasOnboarded', 'true');
    navigate('dashboard');
  };

  const goNext = () => {
    if (current < slides.length - 1) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0, duration: 200, useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1, duration: 200, useNativeDriver: true,
        }),
      ]).start();
      setTimeout(() => setCurrent(current + 1), 200);
    } else {
      goToDashboard();
    }
  };

  const slide = slides[current];
  const colors = ['#00d4ff', '#10b981', '#7c3aed', '#f59e0b'];
  const color = colors[current];

  return (
    <View style={styles.container}>

      <TouchableOpacity
        style={styles.skipBtn}
        onPress={goToDashboard}
      >
        <Text style={styles.skipText}>{t('onboarding_skip')}</Text>
      </TouchableOpacity>

      <Text style={styles.slideNumber}>
        {current + 1} / {slides.length}
      </Text>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.icon}>{slide.icon}</Text>
        <Text style={[styles.title, { color }]}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
      </Animated.View>

      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, {
            backgroundColor: i === current ? color : '#1a3a6a',
            width: i === current ? 28 : 8,
          }]} />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.nextBtn, { backgroundColor: color }]}
        onPress={goNext}
        activeOpacity={0.85}
      >
        <Text style={styles.nextText}>
          {current === slides.length - 1
            ? t('onboarding_start')
            : t('onboarding_next')}
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#050918',
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 30,
  },
  skipBtn: { position: 'absolute', top: 55, right: 25, padding: 8 },
  skipText: { color: '#4a7aaa', fontSize: 14 },
  slideNumber: {
    position: 'absolute', top: 60, left: 25,
    color: '#1a3a6a', fontSize: 13,
  },
  content: {
    alignItems: 'center', marginBottom: 50, paddingHorizontal: 10,
  },
  icon: { fontSize: 85, marginBottom: 35 },
  title: {
    fontSize: 24, fontWeight: '900',
    textAlign: 'center', marginBottom: 15, lineHeight: 33,
  },
  subtitle: {
    color: '#4a7aaa', fontSize: 15,
    textAlign: 'center', lineHeight: 25,
  },
  dots: { flexDirection: 'row', gap: 8, marginBottom: 40 },
  dot: { height: 8, borderRadius: 4 },
  nextBtn: {
    width: '100%', padding: 18,
    borderRadius: 16, alignItems: 'center',
  },
  nextText: { color: '#000', fontSize: 16, fontWeight: '900' },
});
