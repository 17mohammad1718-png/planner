import './global.css';

import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import { I18nManager, Text, View } from 'react-native';

import type { RootStackParamList } from './src/components/BottomTabs';
import { BottomTabs } from './src/components/BottomTabs';
import { initDB } from './src/db';
import { ProjectDetailScreen } from './src/screens/ProjectDetailScreen';
import { TasksScreen } from './src/screens/TasksScreen';

// Persian app — force right-to-left layout
try {
  I18nManager.forceRTL(true);
} catch {
  // ignore on platforms without I18nManager
}

const Stack = createStackNavigator<RootStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#f8fafc',
    primary: '#4f46e5',
  },
};

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      initDB();
    } catch (e) {
      console.warn('db init failed', e);
    }
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <Text className="text-sm font-bold text-slate-400">Planner</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="dark" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Tabs" component={BottomTabs} />
          <Stack.Screen name="Tasks" component={TasksScreen} options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} options={{ animation: 'slide_from_bottom' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
