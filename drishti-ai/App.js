import React from 'react';
import { View, StyleSheet } from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ChatScreen from './src/screens/ChatScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import BYOKScreen from './src/screens/BYOKScreen';
import LiveGuardianScreen from './src/screens/LiveGuardianScreen';
import VoiceAssistantScreen from './src/screens/VoiceAssistantScreen';
import AdminScreen from './src/screens/AdminScreen';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

export default function App() {
  const [screen, setScreen] = React.useState('splash');

  const navigate = (screenName) => {
    setScreen(screenName);
  };

  return (
    <View style={styles.container}>
      {screen === 'login' && <LoginScreen navigate={navigate} />}
      {screen === 'dashboard' && <DashboardScreen navigate={navigate} />}
      {screen === 'chat' && <ChatScreen navigate={navigate} />}
      {screen === 'progress' && <ProgressScreen navigate={navigate} />}
      {screen === 'settings' && <SettingsScreen navigate={navigate} />}
      {screen === 'byok' && <BYOKScreen navigate={navigate} />}
      {screen === 'liveGuardian' && <LiveGuardianScreen navigate={navigate} />}
      {screen === 'voice' && <VoiceAssistantScreen navigate={navigate} />}
      {screen === 'admin' && <AdminScreen navigate={navigate} />}
      {screen === 'splash' && <SplashScreen navigate={navigate} />}
      {screen === 'onboarding' && <OnboardingScreen navigate={navigate} />}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050918',
  },
});
