import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { GlassCard, GlassButton, GlassInput, colors, spacing, typography } from '../..';
import { supabase } from '../../services/supabase';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface Params {
  phone: string;
}

export default function OTPVerifyScreen({ navigation, route }: NativeStackScreenProps) {
  const params = (route.params as Params) || { phone: '' };

  const [otp, setOtp] = useState(['', '', '', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [error, setError] = useState('');

  const focusRef = (index: number) => (ref: any) => {
    if (index < otp.length && ref) {
      ref.current?.focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { error, data } = await supabase.auth.verifyOtp({
        phone: params.phone.startsWith('+') ? params.phone : `+${params.phone}`,
        token: otpValue,
        type: 'sms',
      });

      if (error) {
        throw error;
      }

      // OTP verified, user can now proceed to role selection
      Alert.alert(
        'Verification Successful',
        'Your phone has been verified',
        [{ text: 'OK', onPress: () => (navigation as any).replace('RoleSelect') }]
      );
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setCountdown(60);

    const { error } = await supabase.auth.signInWithOtp({
      phone: params.phone.startsWith('+') ? params.phone : `+${params.phone}`,
    });

    if (error) {
      Alert.alert('Error', 'Failed to resend code. Please try again.');
    } else {
      Alert.alert('Success', 'New code sent to your phone.');
    }
  };

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    };
  }, [countdown]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)}>
        <View style={styles.content}>
          <Text style={styles.title}>Verify Your Phone</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to {params.phone}
          </Text>

          <GlassCard style={styles.card}>
            <View style={styles.otpContainer}>
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <GlassInput
                  key={index}
                  value={otp[index]}
                  onChangeText={(text) => {
                    const newOtp = [...otp];
                    newOtp[index] = text;
                    setOtp(newOtp);
                  }}
                  onKeyPress={() => focusRef(index + 1)}
                  maxLength={1}
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  textAlign="center"
                  style={styles.otpInput}
                  disabled={loading}
                />
              ))}
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.countdownRow}>
              {countdown > 0 ? (
                <Text style={styles.countdown}>
                  Resend code in {countdown}s
                </Text>
              ) : (
                <GlassButton
                  title="Resend Code"
                  variant="secondary"
                  onPress={handleResend}
                  style={styles.resendButton}
                />
              )}
            </View>

            <GlassButton
              title={loading ? 'Verifying...' : 'Verify'}
              onPress={handleVerify}
              disabled={otp.join('').length !== 6 || loading}
              loading={loading}
              style={styles.button}
            />
          </GlassCard>

          <GlassButton
            title="Change Phone"
            variant="outline"
            onPress={() => (navigation as any).goBack()}
            style={styles.backButton}
          />
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
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.margin.md,
  },
  otpInput: {
    flex: 1,
    fontSize: 24,
    textAlign: 'center',
    paddingVertical: spacing.padding.md,
  },
  error: {
    ...typography.caption,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.margin.md,
  },
  countdownRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.margin.lg,
    gap: spacing.margin.md,
  },
  countdown: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  resendButton: {
    paddingHorizontal: spacing.padding.md,
  },
  button: {
    marginTop: spacing.margin.md,
  },
  backButton: {
    marginTop: spacing.margin.sm,
  },
});
