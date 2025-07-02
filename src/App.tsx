// Import crypto polyfills FIRST (CRITICAL for React Native crypto operations)
import 'react-native-get-random-values';

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './hooks/useAuth';
import { AppNavigator } from './navigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
        <StatusBar style="light" backgroundColor="#0a0a0a" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
