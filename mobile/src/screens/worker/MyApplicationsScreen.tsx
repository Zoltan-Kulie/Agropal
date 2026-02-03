import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useMyApplications } from '../../hooks/useApplications';
import { GlassCard, colors, spacing, typography, GlassButton } from '../..';
import Animated, { FadeIn } from 'react-native-reanimated';

const statusColors = {
  applied: colors.primary,
  accepted: colors.success,
  rejected: colors.error,
  withdrawn: colors.textTertiary,
};

export default function MyApplicationsScreen() {
  const { data: applications, isLoading } = useMyApplications();

  if (isLoading) {
    return <View style={styles.loadingContainer}><Text style={styles.loadingText}>Loading...</Text></View>;
  }

  const renderApplication = ({ item }: { item: any }) => (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.jobTitle}>{item.job?.title || 'Unknown Job'}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.crop}>{item.job?.crop_type}</Text>
      <Text style={styles.date}>Applied: {new Date(item.created_at).toLocaleDateString()}</Text>
      <Text style={styles.pay}>€{item.job?.daily_pay_eur}/day</Text>

      {item.status === 'accepted' && (
        <GlassButton title="View Contract" variant="primary" style={styles.actionButton} onPress={() => {}} />
      )}
    </GlassCard>
  );

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(300)}>
        <Text style={styles.title}>My Applications</Text>

        <FlatList
          data={applications || []}
          renderItem={renderApplication}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No applications yet</Text>
              <Text style={styles.emptySubtext}>Browse jobs and start applying!</Text>
            </View>
          )}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.padding.md,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
    marginBottom: spacing.section,
  },
  listContent: {
    paddingBottom: spacing.padding.xl,
  },
  card: {
    marginBottom: spacing.margin.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.margin.md,
  },
  jobTitle: {
    ...typography.subheading,
    color: colors.textPrimary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.padding.md,
    paddingVertical: spacing.padding.xs,
    borderRadius: spacing.radius.sm,
  },
  statusText: {
    ...typography.caption,
    color: colors.background,
    fontWeight: '600',
  },
  crop: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.margin.xs,
  },
  date: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  pay: {
    ...typography.subheading,
    color: colors.primary,
  },
  actionButton: {
    marginTop: spacing.margin.md,
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
});
