import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigate }) {
  const eyeScale = useRef(new Animated.Value(0)).current;
  const eyeOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.5)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(ringScale, {
          toValue: 1, tension: 50, friction: 8, useNativeDriver: true,
        }),
        Animated.timing(eyeOpacity, {
          toValue: 1, duration: 600, useNativeDriver: true,
        }),
      ]),
      Animated.spring(eyeScale, {
        toValue: 1, tension: 80, friction: 6, useNativeDriver: true,
      }),
      Animated.timing(textOpacity, {
        toValue: 1, duration: 500, useNativeDriver: true,
      }),
      Animated.timing(taglineOpacity, {
        toValue: 1, duration: 400, useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => navigate('login'), 1000);
    });
  }, []);

  return (
    <View style={styles.container}>

      {/* Stars */}
      {[...Array(15)].map((_, i) => (
        <View
          key={i}
          style={[
            styles.star,
            {
              top: Math.random() * height,
              left: Math.random() * width,
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              opacity: Math.random() * 0.7 + 0.1,
            },
          ]}
        />
      ))}

      {/* Center Content */}
      <View style={styles.centerContent}>

        {/* Rings + Eye */}
        <View style={styles.eyeWrapper}>
          <Animated.View
            style={[styles.outerRing, {
              transform: [{ scale: ringScale }],
              opacity: eyeOpacity,
            }]}
          />
          <Animated.View
            style={[styles.middleRing, {
              transform: [{ scale: ringScale }],
              opacity: eyeOpacity,
            }]}
          />
          <Animated.View
            style={[styles.eyeOuter, {
              opacity: eyeOpacity,
              transform: [{ scale: ringScale }],
            }]}
          >
            <Animated.View
              style={[styles.eyeWhite, {
                transform: [{ scaleY: eyeScale }],
              }]}
            >
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

        {/* Text */}
        <Animated.Text style={[styles.logo, { opacity: textOpacity }]}>
          DRISHTI
        </Animated.Text>
        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
          आपका AI सहायक • Your AI Guide
        </Animated.Text>
      </View>

      {/* Made in India */}
      <Animated.Text style={[styles.madeIn, { opacity: taglineOpacity }]}>
        Made in India 🇮🇳
      </Animated.Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050918',
  },
  star: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    borderRadius: 10,
  },

  // Center सब कुछ
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Eye wrapper - rings और eye एक साथ center में
  eyeWrapper: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  outerRing: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  middleRing: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.5)',
  },
  eyeOuter: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
    borderColor: '#00d4ff',
    backgroundColor: '#0d1f3c',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  eyeWhite: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#e8f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  iris: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1a6aaa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  irisRing: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  pupil: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#050918',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: 2,
  },
  shine1: {
    width: 5, height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  shine2: {
    position: 'absolute',
    width: 3, height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.6)',
    bottom: 2, left: 2,
  },
  eyelidTop: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 12,
    backgroundColor: 'rgba(5,9,24,0.3)',
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
  },
  eyelidBottom: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 8,
    backgroundColor: 'rgba(5,9,24,0.2)',
    borderBottomLeftRadius: 45,
    borderBottomRightRadius: 45,
  },
  logo: {
    fontSize: 42,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 10,
    textShadowColor: '#00d4ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    marginBottom: 10,
  },
  tagline: {
    color: '#4a7aaa',
    fontSize: 13,
    letterSpacing: 1,
  },
  madeIn: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    color: '#1a3a5a',
    fontSize: 12,
    letterSpacing: 1,
  },
});
