// Database types for Supabase - auto-generated types would go here
// For now, we'll define the essential types based on your schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string | null
          role: string | null
          onboarding_completed: boolean | null
          tour_completed: boolean | null
          progress_data: Json | null
          google_tokens: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          username?: string | null
          role?: string | null
          onboarding_completed?: boolean | null
          tour_completed?: boolean | null
          progress_data?: Json | null
          google_tokens?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          role?: string | null
          onboarding_completed?: boolean | null
          tour_completed?: boolean | null
          progress_data?: Json | null
          google_tokens?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      captures: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          platform: string | null
          url: string | null
          tags: string[] | null
          viral_score: number | null
          ai_analysis: Json | null
          dsd_tags: string[] | null
          dsd_section: string | null
          predicted_virality: number | null
          actual_virality: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          platform?: string | null
          url?: string | null
          tags?: string[] | null
          viral_score?: number | null
          ai_analysis?: Json | null
          dsd_tags?: string[] | null
          dsd_section?: string | null
          predicted_virality?: number | null
          actual_virality?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          platform?: string | null
          url?: string | null
          tags?: string[] | null
          viral_score?: number | null
          ai_analysis?: Json | null
          dsd_tags?: string[] | null
          dsd_section?: string | null
          predicted_virality?: number | null
          actual_virality?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      cultural_moments: {
        Row: {
          id: string
          title: string
          description: string
          intensity: number
          platforms: string[] | null
          demographics: string[] | null
          duration: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          intensity: number
          platforms?: string[] | null
          demographics?: string[] | null
          duration?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          intensity?: number
          platforms?: string[] | null
          demographics?: string[] | null
          duration?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      dsd_briefs: {
        Row: {
          id: string
          user_id: string
          client_profile_id: string | null
          title: string
          status: string | null
          define_section: Json | null
          shift_section: Json | null
          deliver_section: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_profile_id?: string | null
          title: string
          status?: string | null
          define_section?: Json | null
          shift_section?: Json | null
          deliver_section?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          client_profile_id?: string | null
          title?: string
          status?: string | null
          define_section?: Json | null
          shift_section?: Json | null
          deliver_section?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_feeds: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          feed_url: string
          title: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          feed_url: string
          title?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          feed_url?: string
          title?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}