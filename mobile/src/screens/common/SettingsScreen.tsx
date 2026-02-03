import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, KeyboardAvoidingView, Switch, Alert } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { GlassCard, colors, spacing, typography, GlassButton } from '../..';
import Animated, { FadeIn } from 'react-native-reanimated';

const LANGUAGES = [
  { code: 'el', name: 'Ελληνικά' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'es', name: 'Español' },
  { code: 'it', name: 'Italiano' },
];

export default function SettingsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'PhoneEntry' }] }) },
      ]
    );
  };

  const handleLanguageChange = (langCode: string) => {
    setSelectedLanguage(langCode);
    Alert.alert(
      'Language Changed',
      'App will restart to apply new language.',
      [{ text: 'OK', onPress: () => console.log('Language:', langCode) }]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.duration(300)}>
          <Text style={styles.header}>Settings</Text>

          <GlassCard title="Account" style={styles.card}>
            <View style={styles.settingRow}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>{user?.display_name || 'User'}</Text>
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.label}>Role</Text>
              <Text style={styles.value}>{user?.role?.toUpperCase() || 'GUEST'}</Text>
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>{user?.phone || 'Not set'}</Text>
            </View>
            <GlassButton
              title="Log Out"
              variant="outline"
              onPress={handleLogout}
              style={styles.logoutButton}
            />
          </GlassCard>

          <GlassCard title="Preferences" style={styles.card}>
            <View style={styles.settingRow}>
              <Text style={styles.label}>Dark Mode</Text>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={colors.primary}
                ios_backgroundColor={colors.glassTint}
              />
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.label}>Notifications</Text>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={colors.primary}
                ios_backgroundColor={colors.glassTint}
              />
            </View>
          </GlassCard>

          <GlassCard title="Language / Language" style={styles.card}>
            <View style={styles.languageList}>
              {LANGUAGES.map((lang) => (
                <GlassButton
                  key={lang.code}
                  title={lang.name}
                  variant={selectedLanguage === lang.code ? 'primary' : 'outline'}
                  onPress={() => handleLanguageChange(lang.code)}
                  style={styles.languageButton}
                />
              ))}
            </View>
          </GlassCard>

          <Text style={styles.version}>Agro-Force v1.0.0</Text>
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
  header: {
    ...typography.heading,
    color: colors.textPrimary,
    marginBottom: spacing.section,
  },
  card: {
    marginBottom: spacing.margin.lg,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.margin.lg,
  },
  label: {
    ...typography.body,
    color: colors.textSecondary,
  },
  value: {
    ...typography.body,
    color: colors.textPrimary,
  },
  logoutButton: {
    marginTop: spacing.margin.md,
  },
  languageList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.margin.sm,
  },
  languageButton: {
    flex: 1,
    paddingHorizontal: spacing.padding.md,
    marginBottom: spacing.margin.xs,
  },
  version: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    padding: spacing.section,
  },
});
