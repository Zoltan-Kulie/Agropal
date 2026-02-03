import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, FlatList } from 'react-native';
import { useChat } from '../../hooks/useChat';
import { GlassCard, GlassInput, GlassButton, colors, spacing, typography, Avatar } from '../..';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useAuth } from '../../hooks/useAuth';

export default function ChatScreen({ route, navigation }: any) {
  const { conversationId, otherUserId, jobTitle } = route.params || {};
  const { user } = useAuth();
  const { messages, loading, sendMessage, getOrCreateConversation } = useChat(conversationId);
  const flatListRef = useRef<FlatList>(null);
  const [text, setText] = useState('');

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim()) return;

    await sendMessage(text);
    setText('');
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.sender_id === user?.id;
    const conversation = getOrCreateConversation(jobId, user?.id || '', otherUserId || '');

    return (
      <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.theirMessage]}>
        <View style={styles.messageHeader}>
          <Avatar
            name={isMe ? user?.display_name || conversation.producer?.farm_name : conversation.worker?.display_name}
            size={32}
          />
          <Text style={styles.messageTime}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <View style={styles.messageContent}>
          <Text style={styles.messageText}>{item.body}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <GlassButton
          title="←"
          variant="outline"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
        <Text style={styles.headerTitle}>{jobTitle || 'Chat'}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages || []}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>Start the conversation!</Text>
          </View>
        )}
      />

      <View style={styles.inputContainer}>
        <GlassInput
          placeholder="Type a message..."
          value={text}
          onChangeText={setText}
          multiline
          style={styles.input}
        />
        <GlassButton
          title="Send"
          onPress={handleSend}
          disabled={!text.trim()}
          style={styles.sendButton}
        />
      </View>
    </KeyboardAvoidingView>
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
    padding: spacing.padding.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: spacing.border.thin,
    borderBottomColor: colors.borderHighlight,
  },
  backButton: {
    paddingHorizontal: spacing.padding.xs,
  },
  headerTitle: {
    ...typography.subheading,
    color: colors.textPrimary,
  },
  listContent: {
    flex: 1,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: spacing.margin.xs,
  },
  myMessage: {
    backgroundColor: 'rgba(139, 207, 155, 0.1)',
    alignSelf: 'flex-start',
    borderRadius: spacing.radius.md,
    padding: spacing.padding.sm,
  },
  theirMessage: {
    backgroundColor: colors.glassTint,
    alignSelf: 'flex-start',
    borderRadius: spacing.radius.md,
    padding: spacing.padding.sm,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.margin.xs,
    gap: spacing.margin.xs,
  },
  messageTime: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  messageContent: {
    flex: 1,
  },
  messageText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.padding.md,
    backgroundColor: colors.surface,
    borderTopWidth: spacing.border.thin,
    borderTopColor: colors.borderHighlight,
  },
  input: {
    flex: 1,
    marginRight: spacing.margin.sm,
  },
  sendButton: {
    paddingHorizontal: spacing.padding.lg,
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
