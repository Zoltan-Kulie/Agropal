import { useState, useEffect, useCallback } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { Database } from '../types/database';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  job_id: string;
  producer_id: string;
  worker_id: string;
  last_message_at: string | null;
  created_at: string;
}

export const useChat = (conversationId: string | undefined) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Load conversation details
  useEffect(() => {
    if (!conversationId) return;

    loadConversation();
    loadMessages();

    // Setup realtime subscription
    const newChannel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
          filter: `id=eq.${conversationId}`,
        },
        (payload) => {
          if (payload.new) {
            setConversation(payload.new as Conversation);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Connected to messages channel');
        }
      });

    setChannel(newChannel);

    return () => {
      newChannel.unsubscribe();
    };
  }, [conversationId]);

  const loadConversation = async () => {
    if (!conversationId) return;

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (error) {
      console.error('Error loading conversation:', error);
    } else {
      setConversation(data);
    }
  };

  const loadMessages = async () => {
    if (!conversationId) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  const sendMessage = useCallback(async (body: string) => {
    if (!conversationId) {
      console.error('No active conversation');
      return;
    }

    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        body,
      })
      .select();

    if (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [conversationId]);

  const markAsRead = useCallback(async (messageId: string) => {
    const { error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('id', messageId);

    if (error) {
      console.error('Error marking message as read:', error);
    }
  }, []);

  const getOrCreateConversation = useCallback(async (jobId: string, producerId: string, workerId: string) => {
    // Try to get existing conversation
    const { data: existingConv, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('job_id', jobId)
      .eq('producer_id', producerId)
      .eq('worker_id', workerId)
      .single();

    if (data) {
      return data;
    }

    // Create new conversation
    const { data: newConv, error: createError } = await supabase
      .from('conversations')
      .insert({
        job_id: jobId,
        producer_id: producerId,
        worker_id: workerId,
      })
      .select()
      .single();

    if (createError || !newConv) {
      throw new Error('Failed to create conversation');
    }

    return newConv;
  }, []);

  return {
    messages,
    conversation,
    loading,
    sendMessage,
    markAsRead,
    getOrCreateConversation,
  };
};
