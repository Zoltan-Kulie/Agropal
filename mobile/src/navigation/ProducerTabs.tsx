import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '..';

// Placeholder screens - these will be created later
const PlaceholderScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>Coming Soon</Text>
  </View>
);

const Tab = createBottomTabNavigator();

export default function ProducerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Jobs"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: 'Jobs',
          tabBarIcon: ({ focused, color }) => (
            <Animated.View entering={FadeInDown.duration(200)} exiting={FadeOutDown.duration(200)}>
              <View style={[styles.iconContainer, focused && styles.iconFocused]}>
                <Text style={[styles.icon, { color }]}>📋</Text>
              </View>
            </Animated.View>
          ),
        }}
      />
      <Tab.Screen
        name="Applicants"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: 'Applicants',
          tabBarIcon: ({ focused, color }) => (
            <Animated.View entering={FadeInDown.duration(200)} exiting={FadeOutDown.duration(200)}>
              <View style={[styles.iconContainer, focused && styles.iconFocused]}>
                <Text style={[styles.icon, { color }]}>👥</Text>
              </View>
            </Animated.View>
          ),
        }}
      />
      <Tab.Screen
        name="Contracts"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: 'Contracts',
          tabBarIcon: ({ focused, color }) => (
            <Animated.View entering={FadeInDown.duration(200)} exiting={FadeOutDown.duration(200)}>
              <View style={[styles.iconContainer, focused && styles.iconFocused]}>
                <Text style={[styles.icon, { color }]}>📄</Text>
              </View>
            </Animated.View>
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: 'Chat',
          tabBarIcon: ({ focused, color }) => (
            <Animated.View entering={FadeInDown.duration(200)} exiting={FadeOutDown.duration(200)}>
              <View style={[styles.iconContainer, focused && styles.iconFocused]}>
                <Text style={[styles.icon, { color }]}>💬</Text>
              </View>
            </Animated.View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <Animated.View entering={FadeInDown.duration(200)} exiting={FadeOutDown.duration(200)}>
              <View style={[styles.iconContainer, focused && styles.iconFocused]}>
                <Text style={[styles.icon, { color }]}>👤</Text>
              </View>
            </Animated.View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    padding: 8,
    borderRadius: 20,
  },
  iconFocused: {
    backgroundColor: 'rgba(139, 207, 155, 0.2)',
  },
  icon: {
    fontSize: 24,
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  placeholderText: {
    ...typography.subheading,
    color: colors.textSecondary,
  },
});
