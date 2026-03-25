export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      charge_items: {
        Row: {
          category: string
          cleared_at: string | null
          content: string
          created_at: string
          id: string
          is_cleared: boolean
          operator_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          category: string
          cleared_at?: string | null
          content: string
          created_at?: string
          id?: string
          is_cleared?: boolean
          operator_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category?: string
          cleared_at?: string | null
          content?: string
          created_at?: string
          id?: string
          is_cleared?: boolean
          operator_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "charge_items_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
        ]
      }
      operators: {
        Row: {
          created_at: string
          email: string
          enrolled_at: string
          first_name: string
          id: string
          last_active_at: string | null
          last_name: string
          signature_name: string | null
          slug: string
          status: string
          step_0_completed: boolean
          step_0_completed_at: string | null
          step_1_completed: boolean
          step_1_completed_at: string | null
          step_2_completed: boolean
          step_2_completed_at: string | null
          step_3_completed: boolean
          step_3_completed_at: string | null
          step_4_completed: boolean
          step_4_completed_at: string | null
          step_5_completed: boolean
          step_5_completed_at: string | null
          step_6_completed: boolean
          step_6_completed_at: string | null
          step_7_completed: boolean
          step_7_completed_at: string | null
          step_8_completed: boolean
          step_8_completed_at: string | null
          step_9_completed: boolean
          step_9_completed_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          enrolled_at?: string
          first_name: string
          id?: string
          last_active_at?: string | null
          last_name: string
          signature_name?: string | null
          slug: string
          status?: string
          step_0_completed?: boolean
          step_0_completed_at?: string | null
          step_1_completed?: boolean
          step_1_completed_at?: string | null
          step_2_completed?: boolean
          step_2_completed_at?: string | null
          step_3_completed?: boolean
          step_3_completed_at?: string | null
          step_4_completed?: boolean
          step_4_completed_at?: string | null
          step_5_completed?: boolean
          step_5_completed_at?: string | null
          step_6_completed?: boolean
          step_6_completed_at?: string | null
          step_7_completed?: boolean
          step_7_completed_at?: string | null
          step_8_completed?: boolean
          step_8_completed_at?: string | null
          step_9_completed?: boolean
          step_9_completed_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          enrolled_at?: string
          first_name?: string
          id?: string
          last_active_at?: string | null
          last_name?: string
          signature_name?: string | null
          slug?: string
          status?: string
          step_0_completed?: boolean
          step_0_completed_at?: string | null
          step_1_completed?: boolean
          step_1_completed_at?: string | null
          step_2_completed?: boolean
          step_2_completed_at?: string | null
          step_3_completed?: boolean
          step_3_completed_at?: string | null
          step_4_completed?: boolean
          step_4_completed_at?: string | null
          step_5_completed?: boolean
          step_5_completed_at?: string | null
          step_6_completed?: boolean
          step_6_completed_at?: string | null
          step_7_completed?: boolean
          step_7_completed_at?: string | null
          step_8_completed?: boolean
          step_8_completed_at?: string | null
          step_9_completed?: boolean
          step_9_completed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
