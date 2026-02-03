import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { Database } from '../types/database';

// Query keys for cache management
export const jobKeys = {
  all: ['jobs'] as const,
  myJobs: ['jobs', 'my'] as const,
  active: ['jobs', 'active'] as const,
  detail: (id: string) => ['jobs', 'detail', id] as const,
};

// Get all active jobs (public)
export const useActiveJobs = () => {
  return useQuery({
    queryKey: jobKeys.active,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active')
        .order('published_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });
};

// Get jobs for current producer
export const useMyJobs = (producerId: string | undefined) => {
  return useQuery({
    queryKey: jobKeys.myJobs,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('producer_id', producerId || '')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!producerId,
  });
};

// Get job detail
export const useJob = (jobId: string) => {
  return useQuery({
    queryKey: jobKeys.detail(jobId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, producer:profiles!inner_farm_name, producer:profiles!inner_business_doc_url')
        .eq('id', jobId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!jobId,
  });
};

// Search jobs by location
export const useJobsByLocation = (lat: number, lng: number, radiusKm: number = 50) => {
  return useQuery({
    queryKey: ['jobs', 'location', lat, lng, radiusKm] as const,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('search_jobs_by_location', {
        p_lat: lat,
        p_lng: lng,
        p_radius_km: radiusKm,
        p_limit: 20,
      });

      if (error) throw error;
      return data;
    },
    enabled: !!(lat && lng),
  });
};

// Create job mutation
export const useCreateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (job: Database['public']['Tables']['jobs']['Insert']) => {
      const { data, error } = await supabase
        .from('jobs')
        .insert(job)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.myJobs });
      return data;
    },
  });
};

// Update job mutation
export const useUpdateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jobId, updates }: { jobId: string; updates: Partial<Database['public']['Tables']['jobs']['Update']> }) => {
      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', jobId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(variables.jobId) });
      queryClient.invalidateQueries({ queryKey: jobKeys.myJobs });
      return data;
    },
  });
};

// Delete job mutation
export const useDeleteJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.myJobs });
    },
  });
};
