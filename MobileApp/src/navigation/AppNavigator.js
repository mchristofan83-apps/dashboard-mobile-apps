import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

// Screens
import LoginScreen from '../screens/LoginScreen';
import MainMenuScreen from '../screens/MainMenuScreen';
import AbsenScreen from '../screens/AbsenScreen';
import MDVisitScreen from '../screens/MDVisitScreen';
import DashboardScreen from '../screens/DashboardScreen';
import VisitListScreen from '../screens/VisitListScreen';
import VisitActionScreen from '../screens/VisitActionScreen';
import ReportScreen from '../screens/ReportScreen';

import { COLORS } from '../utils/constants';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator for main app screens
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="MainMenu"
        component={MainMenuScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>📊</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>📈</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Main Stack Navigator
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MainMenu" component={MainMenuScreen} />
        <Stack.Screen 
          name="Absen" 
          component={AbsenScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="MDVisit" 
          component={MDVisitScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen 
          name="VisitAction" 
          component={VisitActionScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
