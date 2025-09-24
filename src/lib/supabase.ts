import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database tables
export interface Database {
  public: {
    Tables: {
      reviews_brands: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          logo_url: string | null;
          website_url: string | null;
          notification_email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          logo_url?: string | null;
          website_url?: string | null;
          notification_email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          logo_url?: string | null;
          website_url?: string | null;
          notification_email?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      reviews_locations: {
        Row: {
          id: string;
          brand_id: string;
          name: string;
          slug: string;
          rating_type: 'emoji' | 'thumbs';
          platform_urls: Record<string, string>;
          platform_order: string[];
          notification_email: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          brand_id: string;
          name: string;
          slug: string;
          rating_type?: 'emoji' | 'thumbs';
          platform_urls?: Record<string, string>;
          platform_order?: string[];
          notification_email?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          brand_id?: string;
          name?: string;
          slug?: string;
          rating_type?: 'emoji' | 'thumbs';
          platform_urls?: Record<string, string>;
          platform_order?: string[];
          notification_email?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      reviews_reviews: {
        Row: {
          id: string;
          location_id: string;
          nps_score: number;
          customer_name: string | null;
          customer_email: string | null;
          customer_phone: string | null;
          comments: string | null;
          feedback_type: 'positive' | 'negative';
          external_review_url: string | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          location_id: string;
          nps_score: number;
          customer_name?: string | null;
          customer_email?: string | null;
          customer_phone?: string | null;
          comments?: string | null;
          feedback_type: 'positive' | 'negative';
          external_review_url?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          location_id?: string;
          nps_score?: number;
          customer_name?: string | null;
          customer_email?: string | null;
          customer_phone?: string | null;
          comments?: string | null;
          feedback_type?: 'positive' | 'negative';
          external_review_url?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      reviews_platforms: {
        Row: {
          id: string;
          name: string;
          key: string;
          logo_url: string | null;
          color: string;
          priority: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          key: string;
          logo_url?: string | null;
          color?: string;
          priority?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          key?: string;
          logo_url?: string | null;
          color?: string;
          priority?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      reviews_negative_feedback: {
        Row: {
          id: string;
          review_id: string;
          location_id: string;
          email_sent: boolean;
          email_sent_at: string | null;
          gm_notified: boolean;
          gm_notified_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          review_id: string;
          location_id: string;
          email_sent?: boolean;
          email_sent_at?: string | null;
          gm_notified?: boolean;
          gm_notified_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          review_id?: string;
          location_id?: string;
          email_sent?: boolean;
          email_sent_at?: string | null;
          gm_notified?: boolean;
          gm_notified_at?: string | null;
          created_at?: string;
        };
      };
      reviews_admin_users: {
        Row: {
          id: string;
          email: string;
          name: string;
          password_hash: string;
          role: 'admin' | 'super_admin';
          is_active: boolean;
          reset_token: string | null;
          reset_token_expires: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          password_hash: string;
          role?: 'admin' | 'super_admin';
          is_active?: boolean;
          reset_token?: string | null;
          reset_token_expires?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          password_hash?: string;
          role?: 'admin' | 'super_admin';
          is_active?: boolean;
          reset_token?: string | null;
          reset_token_expires?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
