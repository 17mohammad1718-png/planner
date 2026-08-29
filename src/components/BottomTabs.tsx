import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { NavigatorScreenParams } from '@react-navigation/native';
import React from 'react';
import { CalendarScreen } from '../screens/CalendarScreen';
import { HabitsScreen } from '../screens/HabitsScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { IdeasScreen } from '../screens/IdeasScreen';
import { ProjectsScreen } from '../screens/ProjectsScreen';

export type TabParamList = {
  Home: undefined;
  Ideas: undefined;
  Projects: undefined;
  Habits: undefined;
  Calendar: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  Tasks: undefined;
  ProjectDetail: { id: number };
};

const Tab = createBottomTabNavigator();

type IconName =
  | 'bulb-outline'
  | 'folder-outline'
  | 'home'
  | 'repeat-outline'
  | 'calendar-outline';

const icon = (name: IconName) => ({ color, size }: { color: string; size: number }) => (
  <Ionicons name={name} size={size} color={color} />
);

export function BottomTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: { height: 64, paddingTop: 4, borderTopColor: '#e2e8f0' },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        sceneStyle: { backgroundColor: '#f8fafc' },
      }}
    >
      <Tab.Screen name="Ideas" component={IdeasScreen} options={{ title: 'ایده‌ها', tabBarIcon: icon('bulb-outline') }} />
      <Tab.Screen
        name="Projects"
        component={ProjectsScreen}
        options={{ title: 'پروژه‌ها', tabBarIcon: icon('folder-outline') }}
      />
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'خانه', tabBarIcon: icon('home') }} />
      <Tab.Screen name="Habits" component={HabitsScreen} options={{ title: 'عادت‌ها', tabBarIcon: icon('repeat-outline') }} />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ title: 'تقویم', tabBarIcon: icon('calendar-outline') }}
      />
    </Tab.Navigator>
  );
}
