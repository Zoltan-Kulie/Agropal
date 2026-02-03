// Database types for Agro-Force

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: 'producer' | 'worker' | 'leader' | 'admin';
          display_name: string;
          phone: string | null;
          preferred_locale: string;
          push_token: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role: 'producer' | 'worker' | 'leader' | 'admin';
          display_name: string;
          phone?: string;
          preferred_locale?: string;
          push_token?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: 'producer' | 'worker' | 'leader' | 'admin';
          display_name?: string;
          phone?: string | null;
          preferred_locale?: string;
          push_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      worker_profiles: {
        Row: {
          user_id: string;
          home_base: string | null;
          skills: Json;
          languages: string[];
          emergency_available: boolean;
          availability: Json | null;
          reliability_score: number;
          verified_level: 'none' | 'phone' | 'id_pending' | 'id_verified';
          bio: string | null;
          profile_photo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          home_base?: string;
          skills?: Json;
          languages?: string[];
          emergency_available?: boolean;
          availability?: Json;
          reliability_score?: number;
          verified_level?: 'none' | 'phone' | 'id_pending' | 'id_verified';
          bio?: string;
          profile_photo_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          home_base?: string | null;
          skills?: Json;
          languages?: string[];
          emergency_available?: boolean;
          availability?: Json | null;
          reliability_score?: number;
          verified_level?: 'none' | 'phone' | 'id_pending' | 'id_verified';
          bio?: string | null;
          profile_photo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      producer_profiles: {
        Row: {
          user_id: string;
          farm_name: string;
          base_location: string | null;
          verified_level: 'none' | 'phone' | 'business_pending' | 'business_verified';
          business_doc_url: string | null;
          bio: string | null;
          profile_photo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          farm_name: string;
          base_location?: string;
          verified_level?: 'none' | 'phone' | 'business_pending' | 'business_verified';
          business_doc_url?: string;
          bio?: string;
          profile_photo_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          farm_name?: string;
          base_location?: string | null;
          verified_level?: 'none' | 'phone' | 'business_pending' | 'business_verified';
          business_doc_url?: string | null;
          bio?: string | null;
          profile_photo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      jobs: {
        Row: {
          id: string;
          producer_id: string;
          title: string;
          description: string | null;
          crop_type: string;
          location: string;
          location_label: string;
          start_date: string;
          end_date: string;
          workers_needed: number;
          daily_pay_eur: number;
          accommodation: boolean;
          food: boolean;
          transport: boolean;
          required_skills: string[];
          status: 'draft' | 'pending_payment' | 'active' | 'filled' | 'completed' | 'cancelled';
          created_at: string;
          updated_at: string;
          published_at: string | null;
        };
        Insert: {
          id?: string;
          producer_id: string;
          title: string;
          description?: string;
          crop_type: string;
          location: string;
          location_label: string;
          start_date: string;
          end_date: string;
          workers_needed: number;
          daily_pay_eur: number;
          accommodation?: boolean;
          food?: boolean;
          transport?: boolean;
          required_skills?: string[];
          status?: 'draft' | 'pending_payment' | 'active' | 'filled' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
          published_at?: string;
        };
        Update: {
          id?: string;
          producer_id?: string;
          title?: string;
          description?: string | null;
          crop_type?: string;
          location?: string;
          location_label?: string;
          start_date?: string;
          end_date?: string;
          workers_needed?: number;
          daily_pay_eur?: number;
          accommodation?: boolean;
          food?: boolean;
          transport?: boolean;
          required_skills?: string[];
          status?: 'draft' | 'pending_payment' | 'active' | 'filled' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
      };
      applications: {
        Row: {
          id: string;
          job_id: string;
          applicant_id: string;
          as_group: boolean;
          group_size: number;
          cover_message: string | null;
          status: 'applied' | 'accepted' | 'rejected' | 'withdrawn';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          applicant_id: string;
          as_group?: boolean;
          group_size?: number;
          cover_message?: string;
          status?: 'applied' | 'accepted' | 'rejected' | 'withdrawn';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          applicant_id?: string;
          as_group?: boolean;
          group_size?: number;
          cover_message?: string | null;
          status?: 'applied' | 'accepted' | 'rejected' | 'withdrawn';
          created_at?: string;
          updated_at?: string;
        };
      };
      contracts: {
        Row: {
          id: string;
          job_id: string;
          producer_id: string;
          worker_id: string;
          application_id: string;
          status: 'active' | 'completed' | 'cancelled' | 'no_show';
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          producer_id: string;
          worker_id: string;
          application_id: string;
          status?: 'active' | 'completed' | 'cancelled' | 'no_show';
          started_at?: string;
          completed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          producer_id?: string;
          worker_id?: string;
          application_id?: string;
          status?: 'active' | 'completed' | 'cancelled' | 'no_show';
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          contract_id: string;
          from_user: string;
          to_user: string;
          stars: number;
          tags: string[];
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          contract_id: string;
          from_user: string;
          to_user: string;
          stars: number;
          tags?: string[];
          comment?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          contract_id?: string;
          from_user?: string;
          to_user?: string;
          stars?: number;
          tags?: string[];
          comment?: string | null;
          created_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          job_id: string;
          producer_id: string;
          worker_id: string;
          last_message_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          producer_id: string;
          worker_id: string;
          last_message_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          producer_id?: string;
          worker_id?: string;
          last_message_at?: string | null;
          created_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          body: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          body: string;
          read_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          body?: string;
          read_at?: string | null;
          created_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          reported_user_id: string;
          reason: string;
          details: string | null;
          status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
          created_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          reported_user_id: string;
          reason: string;
          details?: string;
          status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
          created_at?: string;
        };
        Update: {
          id?: string;
          reporter_id?: string;
          reported_user_id?: string;
          reason?: string;
          details?: string | null;
          status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
          created_at?: string;
        };
      };
      job_payments: {
        Row: {
          id: string;
          job_id: string;
          producer_id: string;
          amount_eur: number;
          stripe_session_id: string | null;
          stripe_payment_intent_id: string | null;
          status: 'created' | 'paid' | 'failed' | 'refunded';
          paid_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          producer_id: string;
          amount_eur?: number;
          stripe_session_id?: string;
          stripe_payment_intent_id?: string;
          status?: 'created' | 'paid' | 'failed' | 'refunded';
          paid_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          producer_id?: string;
          amount_eur?: number;
          stripe_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          status?: 'created' | 'paid' | 'failed' | 'refunded';
          paid_at?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
