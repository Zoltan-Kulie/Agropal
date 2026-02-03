import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase, initializeSupabaseRealtime, cleanupSupabase } from '../services/supabase';
import { colors } from '../theme';

export const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    initializeSupabaseRealtime();

    return () => {
      cleanupSupabase();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" backgroundColor={colors.surface} />
      {children}
    </QueryClientProvider>
  );
}
