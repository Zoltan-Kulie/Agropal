import React from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native';
import { useMyContracts, useUpdateProfile } from '../../hooks/useContracts';
import { GlassCard, GlassInput, GlassButton, colors, spacing, typography, Avatar, GlassButton } from '../..';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function ProducerProfileScreen() {
  const { data: contracts, isLoading } = useMyContracts();
  const { mutate: updateProfile } = useUpdateProfile();

  const [editing, setEditing] = useState(false);
  const [farmName, setFarmName] = useState('');

  if (isLoading) {
    return <View style={styles.loadingContainer}><Text style={styles.loadingText}>Loading...</Text></View>;
  }

  const handleSave = () => {
    updateProfile({ userId: '', updates: { farm_name }, role: 'producer' });
    setEditing(false);
  };

  const completedContracts = contracts?.filter((c: any) => c.status === 'completed') || [];
  const totalEarned = completedContracts.reduce((sum: number, c: any) => {
    const job = c.job as any;
    return sum + (job.daily_pay_eur * 7);
  }, 0);

  const renderContract = ({ item }: { item: any }) => (
    <GlassCard style={styles.card}>
      <View style={styles.contractHeader}>
        <Avatar name={item.worker?.display_name || 'Unknown'} size={48} />
        <View style={styles.contractInfo}>
          <Text style={styles.workerName}>{item.worker?.display_name || 'Unknown Worker'}</Text>
          <Text style={styles.jobTitle}>{item.job?.title || 'Unknown Job'}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <Text style={styles.date}>Completed: {item.completed_at ? new Date(item.completed_at).toLocaleDateString() : 'N/A'}</Text>
        <Text style={styles.pay}>€{item.job?.daily_pay_eur}/day × 7 days = €{(item.job?.daily_pay_eur * 7).toFixed(0)}</Text>
      </View>

      <GlassButton title="View Worker Profile" variant="outline" style={styles.actionButton} onPress={() => {}} />
    </GlassCard>
  );

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(300)}>
        <Text style={styles.header}>Producer Profile</Text>

        <GlassCard title="Farm Information" style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Farm Name</Text>
            {editing ? (
              <GlassInput
                value={farmName}
                onChangeText={setFarmName}
                style={styles.editInput}
              />
            ) : (
              <View style={styles.infoValueRow}>
                <Text style={styles.infoValue}>{'My Farm'}</Text>
                <GlassButton
                  title="Edit"
                  variant="outline"
                  onPress={() => { setEditing(true); setFarmName('My Farm') }}
                  style={styles.editButton}
                />
              </View>
            )}
          </View>

          {editing && (
            <GlassButton
              title="Save"
              onPress={handleSave}
              style={styles.saveButton}
            />
          )}
        </GlassCard>

        <GlassCard title="Quick Stats" style={styles.statsCard}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{contracts?.length || 0}</Text>
            <Text style={styles.statLabel}>Total Contracts</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{completedContracts.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>€{totalEarned.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Total Earned</Text>
          </View>
        </GlassCard>

        <GlassCard title="Recent Contracts" style={styles.card}>
          <FlatList
            data={completedContracts || []}
            renderItem={renderContract}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No completed contracts yet</Text>
              </View>
            )}
          />
        </GlassCard>
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
  editInput: {
    flex: 1,
  },
  editButton: {
    paddingHorizontal: spacing.padding.xs,
  },
  saveButton: {
    marginTop: spacing.margin.md,
  },
  statsCard: {
    marginBottom: spacing.margin.lg,
  },
  stat: {
    alignItems: 'center',
    marginBottom: spacing.margin.lg,
  },
  statNumber: {
    ...typography.heading,
    color: colors.primary,
  },
  statLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  listContent: {
    padding: 0,
  },
  contractHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.margin.md,
    marginBottom: spacing.margin.md,
  },
  contractInfo: {
    flex: 1,
  },
  workerName: {
    ...typography.subheading,
    color: colors.textPrimary,
  },
  jobTitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
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
  },
});
