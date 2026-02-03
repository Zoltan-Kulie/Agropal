import { createClient } from '@supabase/supabase-js';
import { AppState, AppStateStatus } from 'react-native';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: {
      // Configure persistent storage for auth tokens
      // Using Expo SecureStore for production AsyncStorage
      getItem: (key) => {
        return new Promise((resolve) => {
          const item = require('react-native').AsyncStorage.getItem(key);
          resolve(item);
        });
      },
      setItem: (key, value) => {
        return new Promise((resolve) => {
          require('react-native').AsyncStorage.setItem(key, value);
          resolve();
        });
      },
      removeItem: (key) => {
        return new Promise((resolve) => {
          require('react-native').AsyncStorage.removeItem(key);
          resolve();
        });
      },
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  db: {
    schema: 'public',
  },
});

// AppState listener for refreshing session when app comes to foreground
let appStateSubscription: any = null;

export const initializeSupabaseRealtime = () => {
  // Tell Supabase when the app is in the background or foreground
  AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      // App is coming to foreground, refresh the session
      supabase.auth.startAutoRefresh();
    } else {
      // App is going to background, stop auto refresh
      supabase.auth.stopAutoRefresh();
    }
  });
};

// Clean up function
export const cleanupSupabase = () => {
  if (appStateSubscription) {
    appStateSubscription.remove();
    appStateSubscription = null;
  }
};

// Helper functions for common operations
export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return { user, error };
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const getWorkerProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('worker_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  return { data, error };
};

export const getProducerProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('producer_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  return { data, error };
};
