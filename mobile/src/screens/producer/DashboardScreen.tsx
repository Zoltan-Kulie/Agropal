import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useMyJobs } from '../../hooks/useJobs';
import { GlassCard, colors, spacing, typography, GlassButton } from '../..';
import { Database } from '../../types/database';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function DashboardScreen({ route }: any) {
  const { data: jobs, isLoading } = useMyJobs();
  const producerId = route.params?.producerId || '';

  if (isLoading) {
    return <View style={styles.loadingContainer}><Text style={styles.loadingText}>Loading...</Text></View>;
  }

  const draftJobs = jobs?.filter((j: any) => j.status === 'draft') || [];
  const activeJobs = jobs?.filter((j: any) => j.status === 'active' || []) || [];
  const filledJobs = jobs?.filter((j: any) => j.status === 'filled') || [];
  const completedJobs = jobs?.filter((j: any) => j.status === 'completed') || [];

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(300)}>
        <Text style={styles.header}>Dashboard</Text>

        <GlassCard title="Quick Stats" style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{activeJobs.length}</Text>
              <Text style={styles.statLabel}>Active Jobs</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{completedJobs.length}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{filledJobs.length}</Text>
              <Text style={styles.statLabel}>Filled</Text>
            </View>
          </View>
        </GlassCard>

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {draftJobs.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Draft Jobs ({draftJobs.length})</Text>
              <View style={styles.jobList}>
                {draftJobs.slice(0, 3).map((job: any) => (
                  <GlassCard key={job.id} style={styles.jobPreview}>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                    <Text style={styles.jobInfo}>{job.crop_type} • €{job.daily_pay_eur}/day</Text>
                  </GlassCard>
                ))}
              </View>
            </View>
          )}

          {activeJobs.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Active Jobs ({activeJobs.length})</Text>
              <View style={styles.jobList}>
                {activeJobs.map((job: any) => (
                  <GlassCard key={job.id} style={styles.jobPreview}>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                    <Text style={styles.jobInfo}>
                      {job.crop_type} • {job.workers_needed - (job.applications_count || 0)}/{job.workers_needed} workers
                    </Text>
                  </GlassCard>
                ))}
              </View>
            </View>
          )}

          {jobs.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No jobs yet</Text>
              <Text style={styles.emptySubtext}>Create your first job to get started!</Text>
            </View>
          )}
        </ScrollView>

        <GlassButton
          title="+ Create New Job"
          onPress={() => {}}
          style={styles.fabButton}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    ...typography.heading,
    color: colors.textPrimary,
    padding: spacing.padding.md,
    marginBottom: spacing.margin.md,
  },
  statsCard: {
    marginBottom: spacing.margin.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    ...typography.heading,
    color: colors.primary,
  },
  statLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  scrollContainer: {
    flex: 1,
    padding: spacing.padding.md,
  },
  section: {
    marginBottom: spacing.section,
  },
  sectionTitle: {
    ...typography.subheading,
    color: colors.textPrimary,
    marginBottom: spacing.margin.md,
  },
  jobList: {
    gap: spacing.margin.md,
  },
  jobPreview: {
    padding: spacing.padding.md,
  },
  jobTitle: {
    ...typography.subheading,
    color: colors.textPrimary,
    marginBottom: spacing.margin.xs,
  },
  jobInfo: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.section * 2,
  },
  emptyText: {
    ...typography.subheading,
    color: colors.textSecondary,
    marginBottom: spacing.margin.xs,
  },
  emptySubtext: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },
  fabButton: {
    position: 'absolute',
    bottom: spacing.margin.lg,
    right: spacing.margin.lg,
    borderRadius: 30,
    width: 56,
    height: 56,
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
