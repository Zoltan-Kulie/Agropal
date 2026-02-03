import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GlassCard, GlassButton, colors, spacing, typography } from '../..';
import { supabase } from '../../services/supabase';
import { Database } from '../../types/database';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function RoleSelectScreen({ navigation }: NativeStackScreenProps) {
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'producer' | 'worker' | 'leader' | null>(null);

  const roles = [
    {
      id: 'worker',
      title: 'Worker',
      description: 'Find jobs and apply for work on farms',
      icon: '👨‍🌾',
    },
    {
      id: 'leader',
      title: 'Team Leader',
      description: 'Apply for jobs with your team',
      icon: '👥',
    },
    {
      id: 'producer',
      title: 'Producer',
      description: 'Post jobs and hire workers',
      icon: '👨‍🌾',
    },
  ];

  const handleRoleSelect = async (role: 'worker' | 'leader' | 'producer') => {
    setSelectedRole(role);
    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        throw new Error('No user found');
      }

      // Update user profile with role
      const { data, error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userData.user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Create role-specific profile if needed
      if (role === 'worker' || role === 'leader') {
        await supabase.from('worker_profiles').insert({
          user_id: userData.user.id,
          skills: [],
          languages: [],
        });
      } else if (role === 'producer') {
        await supabase.from('producer_profiles').insert({
          user_id: userData.user.id,
          farm_name: 'My Farm',
        });
      }

      // Navigate to main app
      // The AuthProvider will handle showing the correct tabs
      Alert.alert(
        'Role Set',
        `You are now set up as a ${role === 'leader' ? 'Team Leader' : role}`,
        [{ text: 'Continue', onPress: () => (navigation as any).replace('Root') }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to set role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(300)}>
        <View style={styles.content}>
          <Text style={styles.title}>Select Your Role</Text>
          <Text style={styles.subtitle}>
            Choose how you want to use Agro-Force
          </Text>

          <ScrollView
            style={styles.rolesContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.rolesScrollContent}
          >
            {roles.map((role) => (
              <GlassCard
                key={role.id}
                style={[
                  styles.roleCard,
                  selectedRole === role.id && styles.roleCardSelected,
                ]}
                onPress={() => setSelectedRole(role.id as any)}
              >
                <Text style={styles.roleIcon}>{role.icon}</Text>
                <View style={styles.roleInfo}>
                  <Text style={styles.roleTitle}>{role.title}</Text>
                  <Text style={styles.roleDescription}>{role.description}</Text>
                </View>
              </GlassCard>
            ))}
          </ScrollView>

          <View style={styles.buttonContainer}>
            <GlassButton
              title={loading ? 'Setting Role...' : 'Continue as ' + (selectedRole || '...')}
              onPress={() => selectedRole && handleRoleSelect(selectedRole)}
              disabled={!selectedRole || loading}
              loading={loading}
              style={styles.button}
            />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.section,
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
  rolesContainer: {
    flex: 1,
  },
  rolesScrollContent: {
    paddingBottom: spacing.padding.xl,
  },
  roleCard: {
    marginBottom: spacing.margin.lg,
    padding: spacing.padding.lg,
  },
  roleCardSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  roleIcon: {
    fontSize: 40,
    marginBottom: spacing.margin.md,
    textAlign: 'center',
  },
  roleInfo: {
    alignItems: 'center',
  },
  roleTitle: {
    ...typography.subheading,
    color: colors.textPrimary,
    marginBottom: spacing.margin.xs,
  },
  roleDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingTop: spacing.padding.md,
  },
  button: {
    paddingHorizontal: spacing.section,
  },
});
