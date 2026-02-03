import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, KeyboardAvoidingView, Alert } from 'react-native';
import { useJob, useCreateApplication } from '../../hooks/useJobs';
import { GlassCard, GlassInput, GlassButton, colors, spacing, typography } from '../..';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function ApplyScreen({ route, navigation }: any) {
  const { jobId } = route.params || {};
  const { data: job } = useJob(jobId);
  const [asGroup, setAsGroup] = useState(false);
  const [groupSize, setGroupSize] = useState(1);
  const [coverMessage, setCoverMessage] = useState('');
  const { mutate: createApplication, isPending } = useCreateApplication();

  const handleSubmit = async () => {
    if (!job) return;

    const application = {
      job_id: jobId,
      as_group: asGroup,
      group_size: groupSize,
      cover_message: coverMessage || null,
    };

    try {
      await createApplication(application);
      Alert.alert(
        'Application Submitted!',
        'Your application has been sent. We\'ll notify you when the producer responds.',
        [{ text: 'OK', onPress: () => (navigation as any).goBack() }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit application. Please try again.');
    }
  };

  if (!job) {
    return <View style={styles.loadingContainer}><Text style={styles.loadingText}>Loading...</Text></View>;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeIn.duration(300)}>
          <View style={styles.header}>
            <Text style={styles.jobTitle}>{job.title}</Text>
            <Text style={styles.jobSubtitle}>{job.crop_type} • €{job.daily_pay_eur}/day</Text>
          </View>

          <GlassCard title="Application Details" style={styles.formCard}>
            <GlassInput
              label="Cover Message (Optional)"
              placeholder="Tell the producer why you're a good fit..."
              value={coverMessage}
              onChangeText={setCoverMessage}
              multiline
              numberOfLines={4}
              style={styles.messageInput}
            />

            <View style={styles.groupToggle}>
              <Text style={styles.toggleLabel}>Apply as Team</Text>
              <GlassButton
                title={asGroup ? 'Team' : 'Solo'}
                variant={asGroup ? 'primary' : 'outline'}
                onPress={() => setAsGroup(!asGroup)}
                style={styles.toggleButton}
              />
            </View>

            {asGroup && (
              <View style={styles.groupSizeContainer}>
                <Text style={styles.groupSizeLabel}>Team Size:</Text>
                <View style={styles.groupSizeButtons}>
                  {[1, 2, 3, 4, 5].map((size) => (
                    <GlassButton
                      key={size}
                      title={size.toString()}
                      variant={groupSize === size ? 'primary' : 'outline'}
                      onPress={() => setGroupSize(size)}
                      style={styles.sizeButton}
                    />
                  ))}
                </View>
              </View>
            )}

            <GlassButton
              title={isPending ? 'Submitting...' : 'Submit Application'}
              onPress={handleSubmit}
              loading={isPending}
              style={styles.submitButton}
            />
          </GlassCard>

          <GlassButton
            title="Cancel"
            variant="outline"
            onPress={() => (navigation as any).goBack()}
            style={styles.cancelButton}
          />
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
    marginBottom: spacing.margin.lg,
    alignItems: 'center',
  },
  jobTitle: {
    ...typography.heading,
    color: colors.textPrimary,
    marginBottom: spacing.margin.xs,
  },
  jobSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  formCard: {
    marginBottom: spacing.margin.lg,
  },
  messageInput: {
    minHeight: 120,
  },
  groupToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.margin.lg,
  },
  toggleLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  toggleButton: {
    paddingHorizontal: spacing.padding.md,
  },
  groupSizeContainer: {
    marginBottom: spacing.margin.lg,
  },
  groupSizeLabel: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.margin.md,
  },
  groupSizeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sizeButton: {
    flex: 1,
    paddingHorizontal: spacing.padding.xs,
  },
  submitButton: {
    marginBottom: spacing.margin.lg,
  },
  cancelButton: {
    paddingHorizontal: spacing.section,
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
