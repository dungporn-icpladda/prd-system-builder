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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      approval_logs: {
        Row: {
          action: string
          action_at: string
          action_by: string | null
          comment: string | null
          id: string
          packaging_format_id: string
        }
        Insert: {
          action: string
          action_at?: string
          action_by?: string | null
          comment?: string | null
          id?: string
          packaging_format_id: string
        }
        Update: {
          action?: string
          action_at?: string
          action_by?: string | null
          comment?: string | null
          id?: string
          packaging_format_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_logs_packaging_format_id_fkey"
            columns: ["packaging_format_id"]
            isOneToOne: false
            referencedRelation: "packaging_formats"
            referencedColumns: ["id"]
          },
        ]
      }
      attachments: {
        Row: {
          file_name: string
          file_type: string | null
          file_url: string
          id: string
          packaging_format_id: string
          storage_path: string | null
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          file_name: string
          file_type?: string | null
          file_url: string
          id?: string
          packaging_format_id: string
          storage_path?: string | null
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          file_name?: string
          file_type?: string | null
          file_url?: string
          id?: string
          packaging_format_id?: string
          storage_path?: string | null
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attachments_packaging_format_id_fkey"
            columns: ["packaging_format_id"]
            isOneToOne: false
            referencedRelation: "packaging_formats"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          action_at: string
          action_by: string | null
          after_value: Json | null
          before_value: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          note: string | null
        }
        Insert: {
          action: string
          action_at?: string
          action_by?: string | null
          after_value?: Json | null
          before_value?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          note?: string | null
        }
        Update: {
          action?: string
          action_at?: string
          action_by?: string | null
          after_value?: Json | null
          before_value?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          note?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          contact_name: string | null
          created_at: string
          created_by: string | null
          customer_code: string
          customer_name: string
          email: string | null
          id: string
          phone: string | null
          status: Database["public"]["Enums"]["record_status"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_name?: string | null
          created_at?: string
          created_by?: string | null
          customer_code: string
          customer_name: string
          email?: string | null
          id?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_name?: string | null
          created_at?: string
          created_by?: string | null
          customer_code?: string
          customer_name?: string
          email?: string | null
          id?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Relationships: []
      }
      packaging_formats: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          barcode: string | null
          carton_per_pallet: number | null
          created_at: string
          created_by: string | null
          customer_id: string
          dimension_height: number | null
          dimension_length: number | null
          dimension_width: number | null
          gross_weight: number | null
          id: string
          is_active_version: boolean
          label_requirement: string | null
          material: string | null
          net_weight: number | null
          pack_per_carton: number | null
          packaging_code: string
          packaging_type: string | null
          product_id: string
          qr_code: string | null
          special_instruction: string | null
          status: Database["public"]["Enums"]["pf_status"]
          unit_per_pack: number | null
          updated_at: string
          version: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          barcode?: string | null
          carton_per_pallet?: number | null
          created_at?: string
          created_by?: string | null
          customer_id: string
          dimension_height?: number | null
          dimension_length?: number | null
          dimension_width?: number | null
          gross_weight?: number | null
          id?: string
          is_active_version?: boolean
          label_requirement?: string | null
          material?: string | null
          net_weight?: number | null
          pack_per_carton?: number | null
          packaging_code: string
          packaging_type?: string | null
          product_id: string
          qr_code?: string | null
          special_instruction?: string | null
          status?: Database["public"]["Enums"]["pf_status"]
          unit_per_pack?: number | null
          updated_at?: string
          version?: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          barcode?: string | null
          carton_per_pallet?: number | null
          created_at?: string
          created_by?: string | null
          customer_id?: string
          dimension_height?: number | null
          dimension_length?: number | null
          dimension_width?: number | null
          gross_weight?: number | null
          id?: string
          is_active_version?: boolean
          label_requirement?: string | null
          material?: string | null
          net_weight?: number | null
          pack_per_carton?: number | null
          packaging_code?: string
          packaging_type?: string | null
          product_id?: string
          qr_code?: string | null
          special_instruction?: string | null
          status?: Database["public"]["Enums"]["pf_status"]
          unit_per_pack?: number | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "packaging_formats_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packaging_formats_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          created_by: string | null
          customer_id: string
          description: string | null
          id: string
          product_code: string
          product_name: string
          status: Database["public"]["Enums"]["record_status"]
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          customer_id: string
          description?: string | null
          id?: string
          product_code: string
          product_name: string
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string
          description?: string | null
          id?: string
          product_code?: string
          product_name?: string
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          department: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "sales"
        | "product"
        | "qc"
        | "production"
        | "warehouse"
        | "manager"
      pf_status: "draft" | "pending" | "approved" | "rejected" | "archived"
      record_status: "active" | "inactive"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: [
        "admin",
        "sales",
        "product",
        "qc",
        "production",
        "warehouse",
        "manager",
      ],
      pf_status: ["draft", "pending", "approved", "rejected", "archived"],
      record_status: ["active", "inactive"],
    },
  },
} as const
