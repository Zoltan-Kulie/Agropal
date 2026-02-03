import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, getUserProfile, getWorkerProfile, getProducerProfile } from '../services/supabase';
import { Database } from '../types/database';

export const profileKeys = {
  me: ['profile', 'me'] as const,
  worker: (userId: string) => ['profile', 'worker', userId] as const,
  producer: (userId: string) => ['profile', 'producer', userId] as const,
};

// Get my profile
export const useMyProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: profileKeys.me,
    queryFn: async () => {
      if (!userId) return null;

      const profile = await getUserProfile(userId);

      // Get role-specific profile
      if (profile.data?.role === 'worker' || profile.data?.role === 'leader') {
        const workerProfile = await getWorkerProfile(userId);
        return { ...profile.data, worker: workerProfile.data };
      } else if (profile.data?.role === 'producer') {
        const producerProfile = await getProducerProfile(userId);
        return { ...profile.data, producer: producerProfile.data };
      }

      return profile.data;
    },
    enabled: !!userId,
  });
};

// Get worker profile
export const useWorkerProfile = (userId: string) => {
  return useQuery({
    queryKey: profileKeys.worker(userId),
    queryFn: async () => {
      const { data } = await getWorkerProfile(userId);
      return data;
    },
    enabled: !!userId,
  });
};

// Get producer profile
export const useProducerProfile = (userId: string) => {
  return useQuery({
    queryKey: profileKeys.producer(userId),
    queryFn: async () => {
      const { data } = await getProducerProfile(userId);
      return data;
    },
    enabled: !!userId,
  });
};

// Update profile mutation
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, updates, role }: { userId: string; updates: Partial<any>; role: 'worker' | 'producer' }) => {
      const { data, error } = await supabase
        .from(role === 'worker' || role === 'leader' ? 'worker_profiles' : 'producer_profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      return;
    },
  });
};

// Toggle emergency availability
export const useToggleEmergencyAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string, currentValue: boolean) => {
      const { error } = await supabase
        .from('worker_profiles')
        .update({ emergency_available: !currentValue })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      return;
    },
  });
};

// Upload profile photo
export const useUploadProfilePhoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, photoUrl, role }: { userId: string; photoUrl: string; role: 'worker' | 'producer' }) => {
      const { error } = await supabase
        .from(role === 'worker' || role === 'leader' ? 'worker_profiles' : 'producer_profiles')
        .update({ profile_photo_url: photoUrl })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      return;
    },
  });
};

// Update availability
export const useUpdateAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, availability }: { userId: string; availability: any }) => {
      const { error } = await supabase
        .from('worker_profiles')
        .update({ availability })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      return;
    },
  });
};

// Update skills
export const useUpdateSkills = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, skills }: { userId: string; skills: string[] }) => {
      const { error } = await supabase
        .from('worker_profiles')
        .update({ skills })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      return;
    },
  });
};

// Update languages
export const useUpdateLanguages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, languages }: { userId: string; languages: string[] }) => {
      const { error } = await supabase
        .from('worker_profiles')
        .update({ languages })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      return;
    },
  });
};
