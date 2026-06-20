import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppProvider } from './src/context/AppContext';
import { AuthProvider } from './src/context/AuthContext';
import { ChatProvider } from './src/context/ChatContext';
import { SettingsProvider } from './src/context/SettingsContext';
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
import ProjectsScreen from './src/screens/ProjectsScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import LegalScreen from './src/screens/LegalScreen';
import HelpScreen from './src/screens/HelpScreen';
import APIDashboard from './src/screens/APIDashboard';

export default function App() {
  const [screen, setScreen] = React.useState('splash');
  const navigate = (s) => setScreen(s);
  const screens = {
    splash: SplashScreen,
    login: LoginScreen,
    onboarding: OnboardingScreen,
    dashboard: DashboardScreen,
    chat: ChatScreen,
    voice: VoiceAssistantScreen,
    liveGuardian: LiveGuardianScreen,
    progress: ProgressScreen,
    settings: SettingsScreen,
    byok: BYOKScreen,
    admin: AdminScreen,
    history: HistoryScreen,
    legal: LegalScreen,
    help: HelpScreen,
    apiDashboard: APIDashboard,
  };
  const Screen = screens[screen] || SplashScreen;
  return (
    <AppProvider>
      <AuthProvider>
        <ChatProvider>
          <SettingsProvider>
            <View style={styles.container}>
              <Screen navigate={navigate} />
            </View>
          </SettingsProvider>
        </ChatProvider>
      </AuthProvider>
    </AppProvider>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050918' },
});
