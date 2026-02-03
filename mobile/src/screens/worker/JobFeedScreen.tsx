import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useActiveJobs } from '../../hooks/useJobs';
import { GlassCard, colors, spacing, typography, Avatar, RatingStars, GlassButton } from '../..';
import { Animated, FadeIn } from 'react-native-reanimated';

export default function JobFeedScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [emergencyOnly, setEmergencyOnly] = useState(false);

  const { data: jobs, isLoading, error, refetch } = useActiveJobs();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load jobs. Please pull to refresh.</Text>
      </View>
    );
  }

  const renderJob = ({ item }: { item: any }) => (
    <GlassCard style={styles.jobCard}>
      <View style={styles.jobHeader}>
        <View style={styles.farmInfo}>
          <Text style={styles.farmName}>{item.producer?.farm_name || 'Unknown Farm'}</Text>
          <RatingStars rating={3.5} size={16} readonly />
        </View>
        <Text style={styles.dailyPay}>
          €{item.daily_pay_eur}/day
        </Text>
      </View>

      <Text style={styles.jobTitle}>{item.title}</Text>
      <Text style={styles.cropType}>{item.crop_type}</Text>

      <View style={styles.jobDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>📅</Text>
          <Text style={styles.detailText}>
            {item.start_date} - {item.end_date}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>📍</Text>
          <Text style={styles.detailText}>{item.location_label}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>👥</Text>
          <Text style={styles.detailText}>{item.workers_needed} needed</Text>
        </View>
      </View>

      <View style={styles.perks}>
        {item.accommodation && <Text style={styles.perk}>🏠 Accommodation</Text>}
        {item.food && <Text style={styles.perk}>🍽️ Food</Text>}
        {item.transport && <Text style={styles.perk}>🚗 Transport</Text>}
      </View>

      <GlassButton
        title="View Details"
        variant="outline"
        style={styles.viewButton}
      />
    </GlassCard>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Jobs</Text>
        <GlassButton
          title={emergencyOnly ? 'All Jobs' : 'Emergency Only'}
          variant={emergencyOnly ? 'primary' : 'outline'}
          onPress={() => setEmergencyOnly(!emergencyOnly)}
          style={styles.filterButton}
        />
      </View>

      <FlatList
        data={jobs || []}
        renderItem={renderJob}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No jobs found</Text>
            <Text style={styles.emptySubtext}>
              {emergencyOnly ? 'No emergency jobs available' : 'Check back later for new opportunities'}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.padding.md,
    backgroundColor: colors.surface,
    borderBottomWidth: spacing.border.thin,
    borderBottomColor: colors.borderHighlight,
  },
  headerTitle: {
    ...typography.title,
    color: colors.textPrimary,
  },
  filterButton: {
    paddingHorizontal: spacing.padding.sm,
  },
  listContent: {
    padding: spacing.padding.md,
  },
  jobCard: {
    marginBottom: spacing.margin.lg,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.margin.md,
  },
  farmInfo: {
    alignItems: 'center',
  },
  farmName: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.margin.xs,
  },
  dailyPay: {
    ...typography.subheading,
    color: colors.primary,
    fontWeight: '600',
  },
  jobTitle: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.margin.xs,
  },
  cropType: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.margin.md,
  },
  jobDetails: {
    marginBottom: spacing.margin.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.margin.xs,
    gap: spacing.margin.sm,
  },
  detailLabel: {
    fontSize: 16,
  },
  detailText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  perks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.margin.md,
  },
  perk: {
    ...typography.caption,
    color: colors.textSecondary,
    backgroundColor: colors.glassTint,
    paddingHorizontal: spacing.padding.xs,
    paddingVertical: spacing.padding.xs,
    borderRadius: spacing.radius.sm,
  },
  viewButton: {
    marginTop: spacing.margin.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
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
    textAlign: 'center',
  },
  emptyContainer: {
    padding: spacing.section,
    alignItems: 'center',
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
