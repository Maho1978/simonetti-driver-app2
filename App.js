import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { FeaturesProvider } from './src/screens/ProfileScreen';
import RootNavigator from './src/navigation';
import { COLORS } from './src/utils/constants';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <SafeAreaProvider>
        <AuthProvider>
          <FeaturesProvider>
            <RootNavigator />
          </FeaturesProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}