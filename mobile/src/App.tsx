import React from 'react';
import { StatusBar, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import RootNavigator from './navigation/RootNavigator';
import { useAuthStore } from './store/authStore';
import { colors } from './theme';

// Ignore specific warnings in development
LogBox.ignoreLogs(['ViewPropTypes']);

export default function App() {
  const { isLoading, checkAuth } = useAuthStore();
  
  React.useEffect(() => {
    checkAuth();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar 
          barStyle="dark-content" 
          backgroundColor={colors.background} 
        />
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
