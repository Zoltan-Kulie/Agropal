import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { Database } from '../types/database';

// Query keys
export const applicationKeys = {
  myApplications: ['applications', 'my'] as const,
  jobApplications: (jobId: string) => ['applications', 'job', jobId] as const,
  detail: (id: string) => ['applications', 'detail', id] as const,
};

// Get my applications
export const useMyApplications = (userId: string | undefined) => {
  return useQuery({
    queryKey: applicationKeys.myApplications,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select('*, job:jobs!inner_title, job:jobs!inner_crop_type, job:jobs!inner_daily_pay_eur, job:jobs!inner_start_date, job:jobs!inner_end_date, job:jobs!inner_location_label')
        .eq('applicant_id', userId || '')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

// Get applications for a specific job
export const useJobApplications = (jobId: string, producerId: string | undefined) => {
  return useQuery({
    queryKey: applicationKeys.jobApplications(jobId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select('*, applicant:profiles!inner_display_name, applicant:profiles!inner_role')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!jobId,
  });
};

// Create application mutation
export const useCreateApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (application: Database['public']['Tables']['applications']['Insert']) => {
      const { data, error } = await supabase
        .from('applications')
        .insert(application)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.myApplications });
      queryClient.invalidateQueries({ queryKey: applicationKeys.jobApplications(data.job_id) });
      return data;
    },
  });
};

// Withdraw application mutation
export const useWithdrawApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (applicationId: string) => {
      const { error } = await supabase.rpc('withdraw_application', {
        p_application_id: applicationId,
      });

      if (error) throw error;
      return true;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.myApplications });
      queryClient.invalidateQueries({ queryKey: applicationKeys.detail(variables) });
      return data;
    },
  });
};

// Accept application mutation (producer only)
export const useAcceptApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (applicationId: string) => {
      const { data, error } = await supabase.rpc('accept_application', {
        p_application_id: applicationId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate applications, contracts, and jobs
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      return data;
    },
  });
};

// Reject application mutation (producer only)
export const useRejectApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (applicationId: string) => {
      const { error } = await supabase.rpc('reject_application', {
        p_application_id: applicationId,
      });

      if (error) throw error;
      return true;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.jobApplications('*') });
      queryClient.invalidateQueries({ queryKey: applicationKeys.detail(variables) });
      return data;
    },
  });
};
