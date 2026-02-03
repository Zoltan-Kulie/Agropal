import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, KeyboardAvoidingView, Switch } from 'react-native';
import { useMyProfile, useUpdateProfile } from '../../hooks/useProfile';
import { GlassCard, GlassInput, GlassButton, colors, spacing, typography, Avatar } from '../..';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function ProducerProfileScreen() {
  const { data: profile, isLoading } = useMyProfile();
  const { mutate: updateProfile } = useUpdateProfile();

  const [editingName, setEditingName] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempBio, setTempBio] = useState('');
  const [phone, setPhone] = useState('');

  if (!profile) {
    return <View style={styles.loadingContainer}><Text style={styles.loadingText}>Loading...</Text></View>;
  }

  const producer = profile.producer;

  const handleSaveName = () => {
    updateProfile({ userId: profile.id, updates: { display_name: tempName, phone }, role: 'producer' });
    setEditingName(false);
  };

  const handleSaveBio = () => {
    updateProfile({ userId: profile.id, updates: { bio: tempBio }, role: 'producer' });
    setEditingBio(false);
  };

  const handleSavePhone = () => {
    updateProfile({ userId: profile.id, updates: { phone }, role: 'producer' });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.duration(300)}>
          <View style={styles.headerSection}>
            <Avatar name={profile.display_name} size={64} style={styles.avatar} />
            <View style={styles.headerInfo}>
              <Text style={styles.name}>{profile.display_name}</Text>
              <Text style={styles.farmName}>{producer?.farm_name || 'My Farm'}</Text>
            </View>
          </View>

          <GlassCard title="Farm Information" style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Farm Name</Text>
              {editingName ? (
                <View style={styles.editContainer}>
                  <GlassInput
                    value={tempName}
                    onChangeText={setTempName}
                    style={styles.editInput}
                  />
                  <GlassButton
                    title="Save"
                    onPress={handleSaveName}
                    style={styles.saveButton}
                  />
                </View>
              ) : (
                <View style={styles.infoValueRow}>
                  <Text style={styles.infoValue}>{producer?.farm_name || 'My Farm'}</Text>
                  <GlassButton
                    title="Edit"
                    variant="outline"
                    onPress={() => { setEditingName(true); setTempName(producer?.farm_name || 'My Farm') }}
                    style={styles.editButton}
                  />
                </View>
              )}
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Phone</Text>
              {editingPhone ? (
                <View style={styles.editContainer}>
                  <GlassInput
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    style={styles.editInput}
                  />
                  <GlassButton
                    title="Save"
                    onPress={handleSavePhone}
                    style={styles.saveButton}
                  />
                </View>
              ) : (
                <View style={styles.infoValueRow}>
                  <Text style={styles.infoValue}>{profile.phone || 'Not set'}</Text>
                  <GlassButton
                    title="Edit"
                    variant="outline"
                    onPress={() => setEditingPhone(true); setPhone(profile.phone || '')}
                    style={styles.editButton}
                  />
                </View>
              )}
            </View>
          </GlassCard>

          <GlassCard title="About Farm" style={styles.card}>
            <View style={styles.bioRow}>
              <Text style={styles.label}>Farm Bio</Text>
              {editingBio ? (
                <View style={styles.editContainer}>
                  <GlassInput
                    value={tempBio}
                    onChangeText={setTempBio}
                    multiline
                    numberOfLines={3}
                    style={styles.editInput}
                  />
                  <GlassButton
                    title="Save"
                    onPress={handleSaveBio}
                    style={styles.saveButton}
                  />
                </View>
              ) : (
                <View style={styles.infoValueRow}>
                  <Text style={styles.infoValue}>{producer?.bio || 'No bio yet'}</Text>
                  <GlassButton
                    title="Edit"
                    variant="outline"
                    onPress={() => { setEditingBio(true); setTempBio(producer?.bio || '') }}
                    style={styles.editButton}
                  />
                </View>
              )}
            </View>
          </GlassCard>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    padding: spacing.padding.md,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.section,
    backgroundColor: colors.surface,
    marginBottom: spacing.margin.lg,
    borderBottomWidth: spacing.border.thin,
    borderBottomColor: colors.borderHighlight,
  },
  avatar: {
    marginRight: spacing.margin.lg,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  name: {
    ...typography.subheading,
    color: colors.textPrimary,
  },
  farmName: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  card: {
    marginBottom: spacing.margin.lg,
  },
  infoRow: {
    marginBottom: spacing.margin.lg,
  },
  label: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.margin.xs,
  },
  infoValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoValue: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.margin.sm,
  },
  editInput: {
    flex: 1,
  },
  editButton: {
    paddingHorizontal: spacing.padding.xs,
  },
  saveButton: {
    marginTop: spacing.margin.md,
  },
  bioRow: {
    marginBottom: spacing.margin.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
