import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import AuthNavigator from './AuthNavigator';
import WorkerTabs from './WorkerTabs';
import ProducerTabs from './ProducerTabs';

import { useAuth } from '../hooks/useAuth';

const AuthStack = createNativeStackNavigator();
const WorkerTab = createBottomTabNavigator();
const ProducerTab = createBottomTabNavigator();

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    // Show loading screen while checking auth
    return null; // Could be a loading screen
  }

  // Not authenticated - show auth flow
  if (!user) {
    return (
      <AuthStack.Navigator screenOptions={{ headerShown: false }}>
        <AuthStack.Screen name="Auth" component={AuthNavigator} />
      </AuthStack.Navigator>
    );
  }

  // Authenticated - show role-specific tabs
  const Tabs = user?.role === 'producer' || user?.role === 'admin' ? ProducerTab : WorkerTab;

  return (
    <Tabs.Navigator screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#8BCF9B',
      tabBarInactiveTintColor: '#A3B1A6',
      tabBarStyle: {
        backgroundColor: '#151B16',
        borderTopColor: 'rgba(255, 255, 255, 0.16)',
        borderTopWidth: 0.5,
        paddingBottom: 8,
        height: 64,
      },
    tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '500',
      },
    }}>
      <Tabs.Group>
        {user?.role === 'worker' || user?.role === 'leader' ? (
          <WorkerTabs />
        ) : (
          <ProducerTabs />
        )}
      </Tabs.Group>
    </Tabs.Navigator>
  );
}
