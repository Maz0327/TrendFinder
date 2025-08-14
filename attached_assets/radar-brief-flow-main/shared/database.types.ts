// Supabase generated types placeholder for this project
// IMPORTANT: This file is the single source of truth for Database types.
// If you regenerate types, overwrite this file keeping the same exports.

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
          email: string | null
          first_name: string | null
          last_name: string | null
          profile_image_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['users']['Row']>
        Update: Partial<Database['public']['Tables']['users']['Row']>
      }
      projects: {
        Row: {
          id: string
          user_id?: string | null
          name: string
          description: string | null
          created_at: string
          updated_at: string
          client: string | null
          status: string | null
        }
        Insert: Partial<Database['public']['Tables']['projects']['Row']>
        Update: Partial<Database['public']['Tables']['projects']['Row']>
      }
      captures: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          title: string | null
          content: string | null
          platform: string | null
          url: string | null
          tags?: string[] | null
          viral_score: number | null
          ai_analysis?: Json | null
          image_url?: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['captures']['Row']>
        Update: Partial<Database['public']['Tables']['captures']['Row']>
      }
      cultural_moments: {
        Row: {
          id: string
          title: string
          description: string
          intensity: number
          platforms: string[]
          demographics: string[]
          duration: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['cultural_moments']['Row']>
        Update: Partial<Database['public']['Tables']['cultural_moments']['Row']>
      }
      dsd_briefs: {
        Row: {
          id: string
          user_id: string
          client_profile_id: string | null
          project_id?: string | null
          title: string
          status: string | null
          define_section: Json | null
          shift_section: Json | null
          deliver_section: Json | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['dsd_briefs']['Row']>
        Update: Partial<Database['public']['Tables']['dsd_briefs']['Row']>
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
        Insert: Partial<Database['public']['Tables']['user_feeds']['Row']>
        Update: Partial<Database['public']['Tables']['user_feeds']['Row']>
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}

// Convenient row type aliases
export type ProjectRow = Database['public']['Tables']['projects']['Row']
export type CaptureRow = Database['public']['Tables']['captures']['Row']
export type MomentRow = Database['public']['Tables']['cultural_moments']['Row']
export type BriefRow = Database['public']['Tables']['dsd_briefs']['Row']
export type UserFeedRow = Database['public']['Tables']['user_feeds']['Row']
