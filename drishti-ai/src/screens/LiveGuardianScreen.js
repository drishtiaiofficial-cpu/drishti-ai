import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  PanResponder,
  TouchableWithoutFeedback,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function LiveGuardianScreen({ navigate }) {
  const [isActive, setIsActive] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVisionOn, setIsVisionOn] = useState(true);
  const [isTextMode, setIsTextMode] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [hudExpanded, setHudExpanded] = useState(false);
  const [currentGuide, setCurrentGuide] = useState('');
  const [arrowPos, setArrowPos] = useState({ x: width/2, y: height/2 });
  const [showArrow, setShowArrow] = useState(false);
  const [hudPosition, setHudPosition] = useState({ x: width - 70, y: 120 });

  // Animations
  const eyeScaleY = useRef(new Animated.Value(1)).current;
  const eyeGlow = useRef(new Animated.Value(0)).current;
  const irisMove = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const expandAnim = useRef(new Animated.Value(0)).current;
  const arrowPulse = useRef(new Animated.Value(1)).current;
  const hudPosAnim = useRef(new Animated.ValueXY({
    x: width - 70, y: 120
  })).current;

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (e, gesture) => {
      const newX = Math.max(0, Math.min(width - 60, gesture.moveX - 30));
      const newY = Math.max(50, Math.min(height - 100, gesture.moveY - 30));
      hudPosAnim.setValue({ x: newX, y: newY });
      setHudPosition({ x: newX, y: newY });
    },
  })).current;

  useEffect(() => {
    // Realistic eye blink
    const blink = () => {
      if (!isVisionOn) return;
      Animated.sequence([
        Animated.timing(eyeScaleY, {
          toValue: 0.05,
          duration: 60,
          useNativeDriver: true,
        }),
        Animated.timing(eyeScaleY, {
          toValue: 1,
          duration: 80,
          useNativeDriver: true,
        }),
      ]).start();
    };
    const blinkInterval = setInterval(blink, 3500);

    // Iris random movement (realistic eye movement)
    const moveIris = () => {
      const randomX = (Math.random() - 0.5) * 8;
      const randomY = (Math.random() - 0.5) * 6;
      Animated.spring(irisMove, {
        toValue: { x: randomX, y: randomY },
        tension: 100,
        friction: 10,
        useNativeDriver: true,
      }).start();
    };
    const irisInterval = setInterval(moveIris, 2000);

    // Glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(eyeGlow, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(eyeGlow, {
          toValue: 0.3,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Arrow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(arrowPulse, {
          toValue: 1.3,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(arrowPulse, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => {
      clearInterval(blinkInterval);
      clearInterval(irisInterval);
    };
  }, [isVisionOn]);

  const toggleHud = () => {
    const toValue = hudExpanded ? 0 : 1;
    Animated.spring(expandAnim, {
      toValue,
      tension: 120,
      friction: 8,
      useNativeDriver: true,
    }).start();
    setHudExpanded(!hudExpanded);
  };

  // Outside tap = menu बंद
  const closeMenu = () => {
    if (hudExpanded) {
      Animated.spring(expandAnim, {
        toValue: 0,
        tension: 120,
        friction: 8,
        useNativeDriver: true,
      }).start();
      setHudExpanded(false);
    }
  };

  const getMenuStyle = () => {
    const isOnRight = hudPosition.x > width / 2;
    const isOnBottom = hudPosition.y > height / 2;
    const base = {
      position: 'absolute',
      backgroundColor: 'rgba(5, 9, 24, 0.97)',
      borderRadius: 16,
      padding: 8,
      borderWidth: 1,
      borderColor: '#00d4ff',
      gap: 6,
      zIndex: 100,
    };
    if (isOnBottom && isOnRight) return { ...base, bottom: 70, right: 0 };
    if (isOnBottom && !isOnRight) return { ...base, bottom: 70, left: 0 };
    if (!isOnBottom && isOnRight) return { ...base, top: 70, right: 0 };
    return { ...base, top: 70, left: 0 };
  };

  const startDemo = () => {
    setIsActive(true);
    setCurrentGuide('स्क्रीन देख रही हूँ... 👁️');
    const steps = [
      { text: 'WhatsApp ढूंढ रही हूँ...', arrow: false, delay: 1500 },
      { text: 'यहाँ tap करो! ➤', arrow: true, x: width*0.3, y: height*0.4, delay: 3000 },
      { text: 'Chat खलो', arrow: true, x: width*0.5, y: height*0.3, delay: 5000 },
      { text: 'शाबाश! ✅ हो गया!', arrow: false, delay: 7000 },
    ];
    steps.forEach(step => {
      setTimeout(() => {
        setCurrentGuide(step.text);
        if (step.arrow) {
          setArrowPos({ x: step.x, y: step.y });
          setShowArrow(true);
        } else {
          setShowArrow(false);
        }
      }, step.delay);
    });
  };

  const glowOpacity = eyeGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 1],
  });

  const menuScale = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const hudControls = [
    {
      icon: isMicOn ? '🎙️' : '🔇',
      label: isMicOn ? 'Mic ON' : 'Mic OFF',
      onPress: () => setIsMicOn(!isMicOn),
      color: isMicOn ? '#00d4ff' : '#ff4444',
    },
    {
      icon: isVisionOn ? '👁️' : '🙈',
      label: isVisionOn ? 'Vision ON' : 'Vision OFF',
      onPress: () => setIsVisionOn(!isVisionOn),
      color: isVisionOn ? '#00d4ff' : '#ff4444',
    },
    {
      icon: '🔒',
      label: isPrivate ? 'Private ON' : 'Private OFF',
      onPress: () => setIsPrivate(!isPrivate),
      color: isPrivate ? '#f59e0b' : '#4a7aaa',
    },
    {
      icon: '📝',
      label: 'Text Panel',
      onPress: () => setIsTextMode(!isTextMode),
      color: isTextMode ? '#10b981' : '#4a7aaa',
    },
  ];

  return (
    // TouchableWithoutFeedback = बहर tap करो = menu बंद
    <TouchableWithoutFeedback onPress={closeMenu}>
      <View style={styles.container}>

        {/* Screen Area */}
        <View style={styles.screenArea}>
          <Text style={styles.screenText}>
            {isActive
              ? '📱 Screen Active\n(User की screen यहाँ दिखेगी)'
              : '📱 Screen Share\n(Start करो)'}
          </Text>

          {/* Privacy Overlay */}
          {isPrivate && (
            <View style={styles.privacyOverlay}>
              <Text style={styles.privacyIcon}>🔒</Text>
              <Text style={styles.privacyTitle}>Private Area</Text>
              <Text style={styles.privacySub}>Vision OFF है</Text>
            </View>
          )}

          {/* Arrow */}
          {showArrow && isActive && isVisionOn && !isPrivate && (
            <Animated.View
              style={[
                styles.arrow,
                {
                  left: arrowPos.x - 25,
                  top: arrowPos.y - 25,
                  transform: [{ scale: arrowPulse }],
                },
              ]}
            >
              <Text style={styles.arrowText}>➤</Text>
              <View style={styles.arrowGlow} />
            </Animated.View>
          )}
        </View>

        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigate('dashboard')}
          >
            <Text style={styles.backText}>← वपस</Text>
          </TouchableOpacity>
          <View style={styles.statusBadge}>
            <View style={[
              styles.statusDot,
              { backgroundColor: isActive ? '#10b981' : '#ff4444' }
            ]} />
            <Text style={styles.statusText}>
              {isActive ? 'Live' : 'Off'}
            </Text>
          </View>
        </View>

        {/* FLOATING HUD */}
        <Animated.View
          style={[
            styles.hud,
            { transform: hudPosAnim.getTranslateTransform() },
          ]}
        >
          {/* Smart Direction Menu */}
          {hudExpanded && (
            <Animated.View
              style={[
                getMenuStyle(),
                {
                  transform: [{ scale: menuScale }],
                  opacity: expandAnim,
                },
              ]}
            >
              {hudControls.map((ctrl, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.ctrlBtn, { borderColor: ctrl.color }]}
                  onPress={() => {
                    ctrl.onPress();
                  }}
                >
                  <Text style={styles.ctrlIcon}>{ctrl.icon}</Text>
                  <Text style={[styles.ctrlLabel, { color: ctrl.color }]}>
                    {ctrl.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </Animated.View>
          )}

          {/* Drag Handle + Eye + Dots */}
          <View {...panResponder.panHandlers}>

            {/* Realistic Eye */}
            <Animated.View style={[styles.eyeContainer, { opacity: glowOpacity }]}>
              {/* Eye white */}
              <View style={styles.eyeWhite}>
                {/* Iris */}
                <Animated.View
                  style={[
                    styles.iris,
                    {
                      transform: [
                        { translateX: irisMove.x },
                        { translateY: irisMove.y },
                        { scaleY: isVisionOn ? eyeScaleY : 0.05 },
                      ],
                    },
                  ]}
                >
                  {/* Iris detail rings */}
                  <View style={styles.irisRing1} />
                  <View style={styles.irisRing2} />

                  {/* Pupil */}
                  <View style={styles.pupil}>
                    {/* Pupil shine 1 */}
                    <View style={styles.shine1} />
                    {/* Pupil shine 2 */}
                    <View style={styles.shine2} />
                  </View>
                </Animated.View>

                {/* Eye top shadow (eyelid effect) */}
                <View style={styles.eyelidTop} />
                <View style={styles.eyelidBottom} />
              </View>
            </Animated.View>

            {/* 3 Dots */}
            <TouchableOpacity
              style={styles.dotsBtn}
              onPress={toggleHud}
            >
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Guide Box */}
        {isActive && currentGuide !== '' && (
          <View style={styles.guideBox}>
            <Text style={styles.guideText}>{currentGuide}</Text>
          </View>
        )}

        {/* Text Panel */}
        {isTextMode && (
          <View style={styles.textPanel}>
            <Text style={styles.textPanelTitle}>📝 Text</Text>
            <Text style={styles.textPanelBody}>
              {currentGuide || 'Guide यहाँ दिखेगी...'}
            </Text>
          </View>
        )}

        {/* Bottom */}
        <View style={styles.bottomBar}>
          {!isActive ? (
            <TouchableOpacity style={styles.startBtn} onPress={startDemo}>
              <Text style={styles.startText}>👁️ Live Guardian शरू करो</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.stopBtn}
              onPress={() => {
                setIsActive(false);
                setShowArrow(false);
                setCurrentGuide('');
              }}
            >
              <Text style={styles.stopText}>⏹ बंद करो</Text>
            </TouchableOpacity>
          )}
        </View>

      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050918',
  },
  screenArea: {
    flex: 1,
    backgroundColor: '#080d1f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenText: {
    color: '#1a3a6a',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 28,
  },
  privacyOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  privacyIcon: { fontSize: 50, marginBottom: 10 },
  privacyTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  privacySub: { color: '#4a7aaa', fontSize: 14, marginTop: 5 },
  arrow: {
    position: 'absolute',
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: { fontSize: 36, color: '#00d4ff' },
  arrowGlow: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0,212,255,0.15)',
  },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backBtn: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1a3a6a',
  },
  backText: { color: '#00d4ff', fontSize: 14 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#1a3a6a',
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },

  // HUD
  hud: {
    position: 'absolute',
    alignItems: 'center',
    width: 58,
  },

  // Realistic Eye
  eyeContainer: {
    marginBottom: 6,
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  eyeWhite: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e8f4ff',
    borderWidth: 2,
    borderColor: '#00d4ff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  iris: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1a6aaa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  irisRing1: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(0,150,255,0.4)',
  },
  irisRing2: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,200,255,0.3)',
  },
  pupil: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#050918',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  shine1: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.9)',
    margin: 1,
  },
  shine2: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.6)',
    bottom: 2,
    left: 2,
  },
  eyelidTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: 'rgba(5,9,24,0.3)',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  eyelidBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: 'rgba(5,9,24,0.2)',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  // 3 dots
  dotsBtn: {
    alignItems: 'center',
    gap: 3,
    paddingVertical: 5,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00d4ff',
  },

  // Control buttons
  ctrlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: '#0d1f3c',
    minWidth: 150,
  },
  ctrlIcon: { fontSize: 16 },
  ctrlLabel: { fontSize: 12, fontWeight: '600' },

  // Guide
  guideBox: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(5,9,24,0.95)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#00d4ff',
  },
  guideText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },

  // Text panel
  textPanel: {
    position: 'absolute',
    right: 70,
    top: 100,
    width: 180,
    backgroundColor: 'rgba(5,9,24,0.95)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  textPanelTitle: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  textPanelBody: {
    color: '#fff',
    fontSize: 12,
    lineHeight: 18,
  },

  // Bottom
  bottomBar: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  startBtn: {
    backgroundColor: '#00d4ff',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  startText: { color: '#000', fontSize: 16, fontWeight: '900' },
  stopBtn: {
    backgroundColor: '#1a0a0a',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  stopText: { color: '#ff4444', fontSize: 16, fontWeight: '900' },
});
