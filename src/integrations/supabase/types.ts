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
      blog_posts: {
        Row: {
          author_name: string
          content: string
          created_at: string
          excerpt: string
          id: string
          image_url: string | null
          published: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_name?: string
          content?: string
          created_at?: string
          excerpt?: string
          id?: string
          image_url?: string | null
          published?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author_name?: string
          content?: string
          created_at?: string
          excerpt?: string
          id?: string
          image_url?: string | null
          published?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      brands: {
        Row: {
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          name: string
          order: number
          slug: string
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          order?: number
          slug: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          order?: number
          slug?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          order: number
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          order?: number
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          order?: number
          slug?: string
        }
        Relationships: []
      }
      faq_items: {
        Row: {
          answer: string
          created_at: string
          id: string
          order: number
          question: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          order?: number
          question: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          order?: number
          question?: string
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          city: string | null
          created_at: string
          customer_name: string
          customer_type: string | null
          email: string | null
          governorate: string | null
          id: string
          message: string
          metadata: Json
          phone: string
          product_id: string | null
          source: string
          status: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          customer_name: string
          customer_type?: string | null
          email?: string | null
          governorate?: string | null
          id?: string
          message?: string
          metadata?: Json
          phone: string
          product_id?: string | null
          source?: string
          status?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          customer_name?: string
          customer_type?: string | null
          email?: string | null
          governorate?: string | null
          id?: string
          message?: string
          metadata?: Json
          phone?: string
          product_id?: string | null
          source?: string
          status?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          order: number
          product_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          order?: number
          product_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          order?: number
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_notes: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          note: string
          product_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          note: string
          product_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_notes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          applications: Json
          availability: string
          brand: string | null
          brand_id: string | null
          category_id: string | null
          compatible_product_ids: string[]
          created_at: string
          description: string
          downloads: Json
          featured: boolean
          features: Json
          id: string
          image_url: string | null
          long_description: string | null
          meta_description: string | null
          meta_title: string | null
          product_code: string | null
          sizes: string[]
          slug: string
          specs: Json
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          applications?: Json
          availability?: string
          brand?: string | null
          brand_id?: string | null
          category_id?: string | null
          compatible_product_ids?: string[]
          created_at?: string
          description?: string
          downloads?: Json
          featured?: boolean
          features?: Json
          id?: string
          image_url?: string | null
          long_description?: string | null
          meta_description?: string | null
          meta_title?: string | null
          product_code?: string | null
          sizes?: string[]
          slug: string
          specs?: Json
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          applications?: Json
          availability?: string
          brand?: string | null
          brand_id?: string | null
          category_id?: string | null
          compatible_product_ids?: string[]
          created_at?: string
          description?: string
          downloads?: Json
          featured?: boolean
          features?: Json
          id?: string
          image_url?: string | null
          long_description?: string | null
          meta_description?: string | null
          meta_title?: string | null
          product_code?: string | null
          sizes?: string[]
          slug?: string
          specs?: Json
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          phone: string
        }
        Insert: {
          created_at?: string
          full_name?: string
          id: string
          phone?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          phone?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          value: string
        }
        Insert: {
          id?: string
          key: string
          value?: string
        }
        Update: {
          id?: string
          key?: string
          value?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          content: string
          created_at: string
          id: string
          name: string
          rating: number
          role: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          name: string
          rating?: number
          role?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          name?: string
          rating?: number
          role?: string
        }
        Relationships: []
      }
      tips: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          published?: boolean
          title?: string
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
      app_role: "admin" | "staff" | "customer" | "manager" | "sales" | "content"
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
      app_role: ["admin", "staff", "customer", "manager", "sales", "content"],
    },
  },
} as const
