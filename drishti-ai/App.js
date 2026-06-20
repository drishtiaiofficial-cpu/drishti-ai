import React from 'react';
import { View, StyleSheet } from 'react-native';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ChatScreen from './src/screens/ChatScreen';
import VoiceAssistantScreen from './src/screens/VoiceAssistantScreen';
import LiveGuardianScreen from './src/screens/LiveGuardianScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import BYOKScreen from './src/screens/BYOKScreen';
import AdminScreen from './src/screens/AdminScreen';
import LegalScreen from './src/screens/LegalScreen';
import HelpScreen from './src/screens/HelpScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ProjectsScreen from './src/screens/ProjectsScreen';

export default function App() {
  const [screen, setScreen] = React.useState('splash');
  const navigate = (s) => setScreen(s);

  return (
    <View style={styles.container}>
      {screen === 'splash' && <SplashScreen navigate={navigate} />}
      {screen === 'login' && <LoginScreen navigate={navigate} />}
      {screen === 'onboarding' && <OnboardingScreen navigate={navigate} />}
      {screen === 'dashboard' && <DashboardScreen navigate={navigate} />}
      {screen === 'chat' && <ChatScreen navigate={navigate} />}
      {screen === 'voice' && <VoiceAssistantScreen navigate={navigate} />}
      {screen === 'liveGuardian' && <LiveGuardianScreen navigate={navigate} />}
      {screen === 'progress' && <ProgressScreen navigate={navigate} />}
      {screen === 'settings' && <SettingsScreen navigate={navigate} />}
      {screen === 'byok' && <BYOKScreen navigate={navigate} />}
      {screen === 'admin' && <AdminScreen navigate={navigate} />}
      {screen === 'legal' && <LegalScreen navigate={navigate} />}
      {screen === 'help' && <HelpScreen navigate={navigate} />}
      {screen === 'history' && <HistoryScreen navigate={navigate} />}
      {screen === 'projects' && <ProjectsScreen navigate={navigate} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050918' },
});
