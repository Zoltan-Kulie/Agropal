import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { Database } from '../types/database';

// Query keys
export const contractKeys = {
  myContracts: ['contracts', 'my'] as const,
  jobContracts: (jobId: string) => ['contracts', 'job', jobId] as const,
  detail: (id: string) => ['contracts', 'detail', id] as const,
};

// Get my contracts
export const useMyContracts = (userId: string | undefined) => {
  return useQuery({
    queryKey: contractKeys.myContracts,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contracts')
        .select('*, job:jobs!inner_title, job:jobs!inner_daily_pay_eur, job:jobs!inner_start_date, job:jobs!inner_end_date, job:jobs!inner_crop_type, job:jobs!inner_location_label, producer:profiles!inner_farm_name')
        .or(`worker_id.eq.${userId || ''}`, `producer_id.eq.${userId || ''}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

// Get contracts for a specific job
export const useJobContracts = (jobId: string) => {
  return useQuery({
    queryKey: contractKeys.jobContracts(jobId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contracts')
        .select('*, worker:profiles!inner_display_name, worker:profiles!inner_reliability_score, producer:profiles!inner_farm_name')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!jobId,
  });
};

// Get contract detail
export const useContract = (contractId: string) => {
  return useQuery({
    queryKey: contractKeys.detail(contractId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contracts')
        .select('*, job:jobs!inner_title, job:jobs!inner_daily_pay_eur, job:jobs!inner_start_date, job:jobs!inner_end_date, job:jobs!inner_crop_type, job:jobs!inner_location_label, job:jobs!inner_producer_id, worker:profiles!inner_display_name, worker:profiles!inner_reliability_score, producer:profiles!inner_farm_name, application:applications!inner_cover_message')
        .eq('id', contractId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!contractId,
  });
};

// Complete contract mutation
export const useCompleteContract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contractId, noShow }: { contractId: string; noShow?: boolean }) => {
      const { data, error } = await supabase.rpc('complete_contract', {
        p_contract_id: contractId,
        p_worker_no_show: noShow || false,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      return data;
    },
  });
};

// Cancel contract mutation
export const useCancelContract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contractId, role }: { contractId: string; role: 'worker' | 'producer' }) => {
      const { data, error } = await supabase.rpc('cancel_contract', {
        p_contract_id: contractId,
        p_cancelled_by_role: role,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      return data;
    },
  });
};
