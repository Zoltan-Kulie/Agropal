import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useJobApplications } from '../../hooks/useApplications';
import { GlassCard, colors, spacing, typography, Avatar, GlassButton, RatingStars } from '../..';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function ApplicantsScreen({ route }: any) {
  const { jobId } = route.params || {};
  const { data: applications, isLoading } = useJobApplications(jobId);

  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  const filteredApplications = applications?.filter((app: any) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return app.status === 'applied';
    if (filter === 'accepted') return app.status === 'accepted';
    if (filter === 'rejected') return app.status === 'rejected';
    return false;
  }) || [];

  const handleAccept = (applicationId: string) => {
    // Would call useAcceptApplication hook here
    alert('Application accepted! Contract created.');
  };

  const handleReject = (applicationId: string) => {
    // Would call useRejectApplication hook here
    alert('Application rejected.');
  };

  const renderApplicant = ({ item }: { item: any }) => (
    <GlassCard style={styles.card}>
      <View style={styles.applicantHeader}>
        <Avatar name={item.applicant?.display_name} size={48} />
        <View style={styles.applicantInfo}>
          <Text style={styles.applicantName}>{item.applicant?.display_name || 'Unknown'}</Text>
          <Text style={styles.role}>{item.applicant?.role || 'Worker'}</Text>
          <RatingStars rating={3.5} size={14} readonly />
        </View>
      </View>

      {item.cover_message && (
        <Text style={styles.coverMessage}>"{item.cover_message}"</Text>
      )}

      <View style={styles.actions}>
        <GlassButton
          title="Accept"
          variant="primary"
          onPress={() => handleAccept(item.id)}
          style={styles.actionButton}
        />
        <GlassButton
          title="Reject"
          variant="outline"
          onPress={() => handleReject(item.id)}
          style={styles.actionButton}
        />
      </View>
    </GlassCard>
  );

  if (isLoading) {
    return <View style={styles.loadingContainer}><Text style={styles.loadingText}>Loading...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(300)}>
        <Text style={styles.header}>Applicants</Text>

        <View style={styles.filterRow}>
          {['all', 'pending', 'accepted', 'rejected'].map((f) => (
            <GlassButton
              key={f}
              title={f.charAt(0).toUpperCase() + f.slice(1)}
              variant={filter === f ? 'primary' : 'outline'}
              onPress={() => setFilter(f as any)}
              style={styles.filterButton}
            />
          ))}
        </View>

        <FlatList
          data={filteredApplications}
          renderItem={renderApplicant}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No applications yet</Text>
              <Text style={styles.emptySubtext}>
                {filter === 'pending' ? 'No pending applications' : 'No applications found'}
              </Text>
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
  },
  header: {
    ...typography.heading,
    color: colors.textPrimary,
    padding: spacing.padding.md,
    marginBottom: spacing.margin.md,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.padding.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: spacing.border.thin,
    borderBottomColor: colors.borderHighlight,
  },
  filterButton: {
    flex: 1,
    paddingHorizontal: spacing.padding.xs,
  },
  listContent: {
    padding: spacing.padding.md,
  },
  card: {
    marginBottom: spacing.margin.lg,
  },
  applicantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.margin.md,
    marginBottom: spacing.margin.md,
  },
  applicantInfo: {
    flex: 1,
  },
  applicantName: {
    ...typography.subheading,
    color: colors.textPrimary,
  },
  role: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  coverMessage: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    fontStyle: 'italic',
    marginBottom: spacing.margin.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.margin.sm,
  },
  actionButton: {
    flex: 1,
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
