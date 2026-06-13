import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

export default function ChatEye({ thinking }) {
  const eyeScale = useRef(new Animated.Value(1)).current;
  const eyeGlow = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Blink
    const blink = () => {
      Animated.sequence([
        Animated.timing(eyeScale, { toValue: 0.05, duration: 80, useNativeDriver: true }),
        Animated.timing(eyeScale, { toValue: 1, duration: 80, useNativeDriver: true }),
      ]).start();
    };
    const blinkInterval = setInterval(blink, 3500);

    // Glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(eyeGlow, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(eyeGlow, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    return () => clearInterval(blinkInterval);
  }, []);

  useEffect(() => {
    if (thinking) {
      const animateDots = () => {
        Animated.sequence([
          Animated.timing(dot1, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot1, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start(() => { if (thinking) animateDots(); });
      };
      animateDots();
    }
  }, [thinking]);

  const glowOpacity = eyeGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.glowRing, { opacity: glowOpacity }]} />
      <View style={styles.eyeOuter}>
        <Animated.View
          style={[styles.eyeInner, { transform: [{ scaleY: eyeScale }] }]}
        >
          <View style={styles.pupil}>
            <View style={styles.shine} />
          </View>
        </Animated.View>
      </View>

      {thinking && (
        <View style={styles.dots}>
          {[dot1, dot2, dot3].map((dot, i) => (
            <Animated.View key={i} style={[styles.dot, { opacity: dot }]} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 15 },
  glowRing: {
    position: 'absolute',
    width: 90, height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#00d4ff',
    top: 8,
  },
  eyeOuter: {
    width: 75, height: 75,
    borderRadius: 37.5,
    backgroundColor: '#0d1f3c',
    borderWidth: 2,
    borderColor: '#00d4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeInner: {
    width: 45, height: 45,
    borderRadius: 22.5,
    backgroundColor: '#1a3a6a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pupil: {
    width: 25, height: 25,
    borderRadius: 12.5,
    backgroundColor: '#00d4ff',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: 3,
  },
  shine: {
    width: 6, height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff',
  },
  dots: { flexDirection: 'row', gap: 6, marginTop: 10 },
  dot: {
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: '#00d4ff',
  },
});
