import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useJob } from '../../hooks/useJobs';
import { GlassCard, colors, spacing, typography, GlassButton, Avatar, RatingStars } from '../..';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function JobDetailScreen({ route }: any) {
  const { jobId } = route.params || {};

  const { data: job, isLoading } = useJob(jobId);

  if (isLoading) {
    return <View style={styles.loadingContainer}><Text style={styles.loadingText}>Loading...</Text></View>;
  }

  if (!job) {
    return <View style={styles.errorContainer}><Text style={styles.errorText}>Job not found</Text></View>;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeIn.duration(300)}>
        <GlassCard style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Avatar name={job.producer?.farm_name} size={48} />
            <View style={styles.headerInfo}>
              <Text style={styles.farmName}>{job.producer?.farm_name || 'Unknown Farm'}</Text>
              <RatingStars rating={3.5} size={16} readonly />
            </View>
          </View>

          <Text style={styles.jobTitle}>{job.title}</Text>
          {job.description && <Text style={styles.description}>{job.description}</Text>}
          <Text style={styles.cropType}>{job.crop_type}</Text>

          <View style={styles.pricingRow}>
            <Text style={styles.dailyPay}>€{job.daily_pay_eur}/day</Text>
            <Text style={styles.estimatedPay}>
              Estimated: €{(job.daily_pay_eur * job.workers_needed * 7).toFixed(0)}
            </Text>
          </View>
        </GlassCard>

        <GlassCard title="Job Details" style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>📅</Text>
            <Text style={styles.detailText}>
              {job.start_date} - {job.end_date}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>📍</Text>
            <Text style={styles.detailText}>{job.location_label}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>👥</Text>
            <Text style={styles.detailText}>{job.workers_needed} workers needed</Text>
          </View>
        </View>

        <View style={styles.perksRow}>
          <View style={styles.perkItem}>
            <Text style={job.accommodation ? styles.perkActive : styles.perkInactive}>🏠</Text>
            <Text style={styles.perkLabel}>Accommodation</Text>
          </View>
          <View style={styles.perkItem}>
            <Text style={job.food ? styles.perkActive : styles.perkInactive}>🍽️</Text>
            <Text style={styles.perkLabel}>Food</Text>
          </View>
          <View style={styles.perkItem}>
            <Text style={job.transport ? styles.perkActive : styles.perkInactive}>🚗</Text>
            <Text style={styles.perkLabel}>Transport</Text>
          </View>
        </View>

        <View style={styles.skillsSection}>
          <Text style={styles.skillsTitle}>Required Skills</Text>
          <View style={styles.skillsContainer}>
            {job.required_skills?.map((skill: string) => (
              <Text key={skill} style={styles.skill}>{skill}</Text>
            ))}
          </View>
        </View>
      </GlassCard>

      <GlassButton
        title="Apply Now"
        onPress={() => {}}
        style={styles.applyButton}
      />
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerCard: {
    marginBottom: spacing.margin.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.margin.md,
    marginBottom: spacing.margin.md,
  },
  headerInfo: {
    flex: 1,
  },
  farmName: {
    ...typography.subheading,
    color: colors.textSecondary,
  },
  jobTitle: {
    ...typography.heading,
    color: colors.textPrimary,
    marginBottom: spacing.margin.xs,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.margin.md,
  },
  cropType: {
    ...typography.bodySmall,
    color: colors.accent,
    marginBottom: spacing.margin.lg,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.padding.md,
    borderTopWidth: spacing.border.thin,
    borderTopColor: colors.borderHighlight,
  },
  dailyPay: {
    ...typography.subheading,
    color: colors.primary,
    fontWeight: '600',
  },
  estimatedPay: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  detailsCard: {
    marginBottom: spacing.margin.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.margin.md,
    gap: spacing.margin.sm,
  },
  detailLabel: {
    fontSize: 18,
  },
  detailText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  perksRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.margin.lg,
  },
  perkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.margin.xs,
  },
  perkActive: {
    fontSize: 20,
  },
  perkInactive: {
    fontSize: 20,
    opacity: 0.5,
  },
  perkLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  skillsSection: {
    marginBottom: spacing.margin.lg,
  },
  skillsTitle: {
    ...typography.subheading,
    color: colors.textPrimary,
    marginBottom: spacing.margin.md,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.margin.xs,
  },
  skill: {
    ...typography.caption,
    color: colors.background,
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.padding.sm,
    paddingVertical: spacing.padding.xs,
    borderRadius: spacing.radius.sm,
  },
  applyButton: {
    marginBottom: spacing.margin.xl,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.section,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
  },
});
