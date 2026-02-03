import React from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, RefreshControl } from 'react-native';
import { useMyContracts } from '../../hooks/useContracts';
import { GlassCard, colors, spacing, typography, Avatar, GlassButton } from '../..';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useState } from 'react';

export default function ContractsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const { data: contracts, isLoading, refetch } = useMyContracts();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const filteredContracts = contracts?.filter((contract) => {
    if (filter === 'active') return contract.status === 'active';
    if (filter === 'completed') return contract.status === 'completed';
    return true;
  }) || [];

  const renderContract = ({ item }: { item: any }) => {
    const isWorker = item.worker_id !== undefined;

    return (
      <GlassCard style={styles.card}>
        <View style={styles.header}>
          <Avatar name={isWorker ? item.producer?.farm_name : item.worker?.display_name} size={48} />
          <View style={styles.headerInfo}>
            <Text style={styles.farmOrWorker}>
              {isWorker ? item.producer?.farm_name || 'Unknown Farm' : item.worker?.display_name || 'Unknown Worker'}
            </Text>
            <Text style={styles.jobTitle}>{item.job?.title || 'Unknown Job'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: item.status === 'active' ? colors.success : item.status === 'completed' ? colors.textTertiary : colors.error }]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.details}>
          <Text style={styles.date}>
            📅 {item.started_at ? new Date(item.started_at).toLocaleDateString() : 'Not started'}
          </Text>
          <Text style={styles.pay}>💰 €{item.job?.daily_pay_eur}/day</Text>
          <Text style={styles.duration}>
            📅 {item.job?.start_date} - {item.job?.end_date}
          </Text>
        </View>

        {item.status === 'active' && (
          <View style={styles.actions}>
            <GlassButton title="View Chat" variant="primary" style={styles.actionButton} onPress={() => {}} />
          </View>
        )}
      </GlassCard>
    );
  };

  if (isLoading) {
    return <View style={styles.loadingContainer}><Text style={styles.loadingText}>Loading...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(300)}>
        <View style={styles.filterRow}>
          {['all', 'active', 'completed'].map((f) => (
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
          data={filteredContracts}
          renderItem={renderContract}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No contracts yet</Text>
              <Text style={styles.emptySubtext}>
                {filter === 'active' ? 'No active contracts' : filter === 'completed' ? 'No completed contracts yet' : 'No contracts found'}
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
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.padding.md,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.margin.md,
    marginBottom: spacing.margin.md,
  },
  headerInfo: {
    flex: 1,
  },
  farmOrWorker: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  jobTitle: {
    ...typography.subheading,
    color: colors.textPrimary,
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
  details: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.padding.md,
  },
  date: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  pay: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  duration: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  actions: {
    marginTop: spacing.margin.md,
  },
  actionButton: {
    width: '100%',
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
