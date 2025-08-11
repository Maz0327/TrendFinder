export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      auth_config: {
        Row: {
          created_at: string
          enable_hibp_check: boolean
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enable_hibp_check?: boolean
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enable_hibp_check?: boolean
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      brief_captures: {
        Row: {
          added_at: string
          brief_id: string
          capture_id: string
          position: number | null
        }
        Insert: {
          added_at?: string
          brief_id: string
          capture_id: string
          position?: number | null
        }
        Update: {
          added_at?: string
          brief_id?: string
          capture_id?: string
          position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "brief_captures_brief_id_fkey"
            columns: ["brief_id"]
            isOneToOne: false
            referencedRelation: "briefs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brief_captures_capture_id_fkey"
            columns: ["capture_id"]
            isOneToOne: false
            referencedRelation: "captures"
            referencedColumns: ["id"]
          },
        ]
      }
      briefs: {
        Row: {
          content: Json
          created_at: string
          exports: Json | null
          id: string
          project_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: Json
          created_at?: string
          exports?: Json | null
          id?: string
          project_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          exports?: Json | null
          id?: string
          project_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "briefs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "briefs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "dashboard_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      captures: {
        Row: {
          content: string | null
          created_at: string
          engagement: Json | null
          id: string
          image_data: string | null
          image_url: string | null
          is_draft: boolean | null
          last_analyzed: string | null
          metadata: Json | null
          platform: string | null
          project_id: string | null
          status: string | null
          summary: string | null
          title: string | null
          truth_analysis: Json | null
          type: string | null
          updated_at: string
          url: string | null
          user_id: string
          viral_score: number | null
          visual_analysis: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          engagement?: Json | null
          id?: string
          image_data?: string | null
          image_url?: string | null
          is_draft?: boolean | null
          last_analyzed?: string | null
          metadata?: Json | null
          platform?: string | null
          project_id?: string | null
          status?: string | null
          summary?: string | null
          title?: string | null
          truth_analysis?: Json | null
          type?: string | null
          updated_at?: string
          url?: string | null
          user_id: string
          viral_score?: number | null
          visual_analysis?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string
          engagement?: Json | null
          id?: string
          image_data?: string | null
          image_url?: string | null
          is_draft?: boolean | null
          last_analyzed?: string | null
          metadata?: Json | null
          platform?: string | null
          project_id?: string | null
          status?: string | null
          summary?: string | null
          title?: string | null
          truth_analysis?: Json | null
          type?: string | null
          updated_at?: string
          url?: string | null
          user_id?: string
          viral_score?: number | null
          visual_analysis?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "captures_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "captures_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "dashboard_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      intelligence_summaries: {
        Row: {
          data: Json
          last_refreshed: string
          tier1_signals: number
          tier2_signals: number
          total_signals: number
          trends_count: number
          user_id: string
        }
        Insert: {
          data?: Json
          last_refreshed?: string
          tier1_signals?: number
          tier2_signals?: number
          total_signals?: number
          trends_count?: number
          user_id: string
        }
        Update: {
          data?: Json
          last_refreshed?: string
          tier1_signals?: number
          tier2_signals?: number
          total_signals?: number
          trends_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "intelligence_summaries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "dashboard_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      projects: {
        Row: {
          brief_template: string | null
          client: string | null
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          name: string
          settings: Json | null
          status: string | null
          tags: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          brief_template?: string | null
          client?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          name: string
          settings?: Json | null
          status?: string | null
          tags?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          brief_template?: string | null
          client?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          name?: string
          settings?: Json | null
          status?: string | null
          tags?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "dashboard_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      sessions: {
        Row: {
          expire: string
          sess: Json
          sid: string
        }
        Insert: {
          expire: string
          sess: Json
          sid: string
        }
        Update: {
          expire?: string
          sess?: Json
          sid?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          profile_image_url: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          profile_image_url?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          profile_image_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      dashboard_stats: {
        Row: {
          avg_viral_score: number | null
          total_briefs: number | null
          total_captures: number | null
          total_projects: number | null
          truth_analyzed: number | null
          user_id: string | null
        }
        Insert: {
          avg_viral_score?: never
          total_briefs?: never
          total_captures?: never
          total_projects?: never
          truth_analyzed?: never
          user_id?: string | null
        }
        Update: {
          avg_viral_score?: never
          total_briefs?: never
          total_captures?: never
          total_projects?: never
          truth_analyzed?: never
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_dashboard_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_captures: number
          avg_viral_score: number
          total_projects: number
          truth_analyzed: number
          total_briefs: number
        }[]
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
