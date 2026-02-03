import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useChat } from '../../hooks/useChat';
import { GlassCard, colors, spacing, typography, Avatar } from '../..';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function ChatListScreen({ route }: any) {
  const { conversations } = useChat();

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const renderConversation = ({ item }: { item: any }) => (
    <GlassCard
      key={item.id}
      style={styles.card}
      onPress={() => {}}
    >
      <View style={styles.header}>
        <Avatar name={item.producer?.farm_name || item.worker?.display_name} size={48} />
        <View style={styles.messageInfo}>
          <Text style={styles.name}>{item.producer?.farm_name || item.worker?.display_name}</Text>
          <Text style={styles.preview}>"{item.last_message || 'No messages yet'}"</Text>
          <Text style={styles.time}>{formatTime(item.last_message_at || item.created_at)}</Text>
        </View>
      </View>
    </GlassCard>
  );

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(300)}>
        <Text style={styles.header}>Messages</Text>

        <FlatList
          data={conversations || []}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No conversations yet</Text>
              <Text style={styles.emptySubtext}>Start applying to jobs to connect with producers!</Text>
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
  listContent: {
    padding: 0,
  },
  card: {
    marginBottom: spacing.margin.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.margin.md,
  },
  messageInfo: {
    flex: 1,
  },
  name: {
    ...typography.subheading,
    color: colors.textPrimary,
  },
  preview: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.margin.xs,
    },
  time: {
    ...typography.caption,
    color: colors.textTertiary,
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
