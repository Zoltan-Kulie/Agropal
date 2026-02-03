import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, KeyboardAvoidingView, Switch } from 'react-native';
import { useMyProfile, useUpdateProfile, useToggleEmergencyAvailability, useUpdateAvailability, useUpdateSkills, useUpdateLanguages } from '../../hooks/useProfile';
import { GlassCard, GlassButton, GlassInput, colors, spacing, typography, Avatar, RatingStars } from '../..';
import Animated, { FadeIn } from 'react-native-reanimated';

const AVAILABLE_SKILLS = [
  'Harvesting', 'Pruning', 'Sorting', 'Planting', 'Irrigation',
  'Driving', 'Machinery', 'Packing', 'Quality Control'
];

const AVAILABLE_LANGUAGES = [
  'English', 'Greek', 'French', 'German', 'Spanish', 'Italian',
  'Portuguese', 'Dutch', 'Polish', 'Romanian', 'Bulgarian'
];

export default function ProfileScreen() {
  const { data: profile, isLoading } = useMyProfile();
  const { mutate: updateProfile } = useUpdateProfile();
  const { mutate: toggleEmergency } = useToggleEmergencyAvailability();
  const { mutate: updateAvailability } = useUpdateAvailability();
  const { mutate: updateSkills } = useUpdateSkills();
  const { mutate: updateLanguages } = useUpdateLanguages();

  const [editingName, setEditingName] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempBio, setTempBio] = useState('');

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  if (!profile) {
    return <View style={styles.loadingContainer}><Text style={styles.loadingText}>Loading...</Text></View>;
  }

  const worker = profile.worker;

  const handleSaveName = () => {
    updateProfile({ userId: profile.id, updates: { display_name: tempName }, role: 'worker' });
    setEditingName(false);
  };

  const handleSaveBio = () => {
    updateProfile({ userId: profile.id, updates: { bio: tempBio }, role: 'worker' });
    setEditingBio(false);
  };

  const toggleSkill = (skill: string) => {
    const newSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill];
    setSelectedSkills(newSkills);
  };

  const toggleLanguage = (lang: string) => {
    const newLangs = selectedLanguages.includes(lang)
      ? selectedLanguages.filter(l => l !== lang)
      : [...selectedLanguages, lang];
    setSelectedLanguages(newLangs);
  };

  const handleEmergencyToggle = () => {
    toggleEmergency({ userId: profile.id, currentValue: worker?.emergency_available || false });
  };

  const handleSaveSkills = () => {
    updateProfile({ userId: profile.id, updates: { skills: selectedSkills }, role: 'worker' });
  };

  const handleSaveLanguages = () => {
    updateProfile({ userId: profile.id, updates: { languages: selectedLanguages }, role: 'worker' });
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
              <View style={styles.reliabilityRow}>
                <Text style={styles.reliabilityLabel}>Reliability Score:</Text>
                <View style={styles.reliabilityBadge}>
                  <Text style={styles.reliabilityScore}>{worker?.reliability_score?.toFixed(0) || '0'}</Text>
                </View>
              </View>
            </View>
          </View>

          <GlassCard title="Personal Information" style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Name</Text>
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
                  <Text style={styles.infoValue}>{profile.display_name}</Text>
                  <GlassButton title="Edit" variant="outline" onPress={() => { setEditingName(true); setTempName(profile.display_name) }} style={styles.editButton} />
                </View>
              )}
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.label}>Emergency Available</Text>
              <Switch
                value={worker?.emergency_available || false}
                onValueChange={handleEmergencyToggle}
                trackColor={colors.primary}
                ios_backgroundColor={colors.glassTint}
              />
            </View>
          </GlassCard>

          <GlassCard title="Skills" style={styles.card}>
            <View style={styles.skillsContainer}>
              {AVAILABLE_SKILLS.map((skill) => (
                <GlassButton
                  key={skill}
                  title={skill}
                  variant={selectedSkills.includes(skill) ? 'primary' : 'outline'}
                  onPress={() => toggleSkill(skill)}
                  style={styles.skillButton}
                />
              ))}
            </View>
            <GlassButton
              title={selectedSkills.length > 0 ? 'Save Skills' : 'Select Skills'}
              onPress={handleSaveSkills}
              disabled={selectedSkills.length === 0}
              style={styles.saveButton}
            />
          </GlassCard>

          <GlassCard title="Languages" style={styles.card}>
            <View style={styles.skillsContainer}>
              {AVAILABLE_LANGUAGES.map((lang) => (
                <GlassButton
                  key={lang}
                  title={lang}
                  variant={selectedLanguages.includes(lang) ? 'primary' : 'outline'}
                  onPress={() => toggleLanguage(lang)}
                  style={styles.skillButton}
                />
              ))}
            </View>
            <GlassButton
              title={selectedLanguages.length > 0 ? 'Save Languages' : 'Select Languages'}
              onPress={handleSaveLanguages}
              disabled={selectedLanguages.length === 0}
              style={styles.saveButton}
            />
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
  },
  name: {
    ...typography.subheading,
    color: colors.textPrimary,
  },
  reliabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.margin.sm,
  },
  reliabilityLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  reliabilityBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.padding.sm,
    paddingVertical: spacing.padding.xs,
    borderRadius: spacing.radius.md,
  },
  reliabilityScore: {
    ...typography.title,
    color: colors.background,
    fontWeight: '600',
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.margin.xs,
  },
  skillButton: {
    paddingHorizontal: spacing.padding.sm,
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
