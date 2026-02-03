import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GlassCard, GlassButton, GlassInput, colors, spacing, typography } from '../..';
import { useAuth } from '../../hooks/useAuth';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export default function PhoneEntryScreen({ navigation }: NativeStackScreenProps) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn } = useAuth();

  const handleNext = async () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await signIn(phone);

      // Navigate to OTP screen
      (navigation as any).replace('OTPVerify', { phone });
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)}>
        <View style={styles.content}>
          <Text style={styles.title}>Welcome to Agro-Force</Text>
          <Text style={styles.subtitle}>
            Enter your phone number to get started
          </Text>

          <GlassCard style={styles.card}>
            <GlassInput
              label="Phone Number"
              placeholder="+30 XXX XXX XXX"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoCapitalize="none"
              autoComplete="tel"
              error={error}
              disabled={loading}
              leftIcon={<Text style={styles.icon}>📱</Text>}
            />

            <GlassButton
              title={loading ? 'Sending Code...' : 'Continue'}
              onPress={handleNext}
              disabled={loading || phone.length < 10}
              loading={loading}
              style={styles.button}
            />
          </GlassCard>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.section,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.margin.xs,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.section,
  },
  card: {
    marginBottom: spacing.margin.lg,
  },
  button: {
    marginTop: spacing.margin.md,
  },
  icon: {
    fontSize: 20,
  },
});
