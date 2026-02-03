import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PhoneEntryScreen from '../screens/auth/PhoneEntryScreen';
import OTPVerifyScreen from '../screens/auth/OTPVerifyScreen';
import RoleSelectScreen from '../screens/auth/RoleSelectScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="PhoneEntry"
      screenOptions={{
        headerShown: false,
        cardStyle: {
          backgroundColor: '#0E120F',
        },
      }}
    >
      <Stack.Screen
        name="PhoneEntry"
        component={PhoneEntryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OTPVerify"
        component={OTPVerifyScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RoleSelect"
        component={RoleSelectScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
