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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          available_seats: number | null
          created_at: string | null
          current_driver_location: Json | null
          discount_applied: number | null
          driver_id: string | null
          driver_name: string | null
          driver_phone: string | null
          driver_vehicle_number: string | null
          dropoff_location: string
          estimated_distance: number | null
          estimated_fare: number | null
          fare_per_person: number | null
          id: string
          is_primary_booking: boolean | null
          is_shared_ride: boolean | null
          offer_id: string | null
          parent_booking_id: string | null
          passenger_count: number
          passenger_name: string
          passenger_phone: string
          payment_method: string | null
          payment_status: string | null
          pickup_date: string
          pickup_location: string
          pickup_time: string
          route_segment_end: string | null
          route_segment_start: string | null
          special_requests: string | null
          status: string | null
          tracking_enabled: boolean | null
          updated_at: string | null
          user_id: string
          vehicle_id: string
        }
        Insert: {
          available_seats?: number | null
          created_at?: string | null
          current_driver_location?: Json | null
          discount_applied?: number | null
          driver_id?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          driver_vehicle_number?: string | null
          dropoff_location: string
          estimated_distance?: number | null
          estimated_fare?: number | null
          fare_per_person?: number | null
          id?: string
          is_primary_booking?: boolean | null
          is_shared_ride?: boolean | null
          offer_id?: string | null
          parent_booking_id?: string | null
          passenger_count: number
          passenger_name: string
          passenger_phone: string
          payment_method?: string | null
          payment_status?: string | null
          pickup_date: string
          pickup_location: string
          pickup_time: string
          route_segment_end?: string | null
          route_segment_start?: string | null
          special_requests?: string | null
          status?: string | null
          tracking_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
          vehicle_id: string
        }
        Update: {
          available_seats?: number | null
          created_at?: string | null
          current_driver_location?: Json | null
          discount_applied?: number | null
          driver_id?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          driver_vehicle_number?: string | null
          dropoff_location?: string
          estimated_distance?: number | null
          estimated_fare?: number | null
          fare_per_person?: number | null
          id?: string
          is_primary_booking?: boolean | null
          is_shared_ride?: boolean | null
          offer_id?: string | null
          parent_booking_id?: string | null
          passenger_count?: number
          passenger_name?: string
          passenger_phone?: string
          payment_method?: string | null
          payment_status?: string | null
          pickup_date?: string
          pickup_location?: string
          pickup_time?: string
          route_segment_end?: string | null
          route_segment_start?: string | null
          special_requests?: string | null
          status?: string | null
          tracking_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "driver_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "ride_share_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_parent_booking_id_fkey"
            columns: ["parent_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_earnings: {
        Row: {
          base_amount: number
          booking_id: string
          commission_amount: number
          created_at: string | null
          driver_id: string
          id: string
          net_amount: number
          payment_date: string | null
          payment_status: string | null
        }
        Insert: {
          base_amount: number
          booking_id: string
          commission_amount: number
          created_at?: string | null
          driver_id: string
          id?: string
          net_amount: number
          payment_date?: string | null
          payment_status?: string | null
        }
        Update: {
          base_amount?: number
          booking_id?: string
          commission_amount?: number
          created_at?: string | null
          driver_id?: string
          id?: string
          net_amount?: number
          payment_date?: string | null
          payment_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_earnings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_earnings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "driver_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_profiles: {
        Row: {
          aadhar_number: string | null
          bank_account: string | null
          created_at: string | null
          current_location: Json | null
          id: string
          ifsc_code: string | null
          is_available: boolean | null
          license_expiry: string
          license_number: string
          pan_number: string | null
          rating: number | null
          status: string | null
          total_rides: number | null
          updated_at: string | null
          user_id: string
          vehicle_registration: string | null
        }
        Insert: {
          aadhar_number?: string | null
          bank_account?: string | null
          created_at?: string | null
          current_location?: Json | null
          id?: string
          ifsc_code?: string | null
          is_available?: boolean | null
          license_expiry: string
          license_number: string
          pan_number?: string | null
          rating?: number | null
          status?: string | null
          total_rides?: number | null
          updated_at?: string | null
          user_id: string
          vehicle_registration?: string | null
        }
        Update: {
          aadhar_number?: string | null
          bank_account?: string | null
          created_at?: string | null
          current_location?: Json | null
          id?: string
          ifsc_code?: string | null
          is_available?: boolean | null
          license_expiry?: string
          license_number?: string
          pan_number?: string | null
          rating?: number | null
          status?: string | null
          total_rides?: number | null
          updated_at?: string | null
          user_id?: string
          vehicle_registration?: string | null
        }
        Relationships: []
      }
      driver_route_preferences: {
        Row: {
          created_at: string | null
          driver_id: string
          id: string
          max_distance_km: number | null
          preferred_cities: string[] | null
          preferred_routes: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          driver_id: string
          id?: string
          max_distance_km?: number | null
          preferred_cities?: string[] | null
          preferred_routes?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          driver_id?: string
          id?: string
          max_distance_km?: number | null
          preferred_cities?: string[] | null
          preferred_routes?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_route_preferences_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: true
            referencedRelation: "driver_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_vehicles: {
        Row: {
          capacity: number
          color: string | null
          created_at: string | null
          driver_id: string
          fitness_cert_expiry: string | null
          id: string
          insurance_expiry: string
          is_active: boolean | null
          pollution_cert_expiry: string
          registration_number: string
          updated_at: string | null
          vehicle_model: string
          vehicle_type: string
          vehicle_year: number
        }
        Insert: {
          capacity: number
          color?: string | null
          created_at?: string | null
          driver_id: string
          fitness_cert_expiry?: string | null
          id?: string
          insurance_expiry: string
          is_active?: boolean | null
          pollution_cert_expiry: string
          registration_number: string
          updated_at?: string | null
          vehicle_model: string
          vehicle_type: string
          vehicle_year: number
        }
        Update: {
          capacity?: number
          color?: string | null
          created_at?: string | null
          driver_id?: string
          fitness_cert_expiry?: string | null
          id?: string
          insurance_expiry?: string
          is_active?: boolean | null
          pollution_cert_expiry?: string
          registration_number?: string
          updated_at?: string | null
          vehicle_model?: string
          vehicle_type?: string
          vehicle_year?: number
        }
        Relationships: [
          {
            foreignKeyName: "driver_vehicles_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "driver_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string | null
          id: string
          payment_method: string
          status: string | null
          stripe_payment_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string | null
          id?: string
          payment_method: string
          status?: string | null
          stripe_payment_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string | null
          id?: string
          payment_method?: string
          status?: string | null
          stripe_payment_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ride_share_offers: {
        Row: {
          created_at: string | null
          description: string
          discount_percentage: number
          id: string
          is_active: boolean | null
          min_participants: number | null
          title: string
          valid_from: string | null
          valid_until: string
        }
        Insert: {
          created_at?: string | null
          description: string
          discount_percentage: number
          id?: string
          is_active?: boolean | null
          min_participants?: number | null
          title: string
          valid_from?: string | null
          valid_until: string
        }
        Update: {
          created_at?: string | null
          description?: string
          discount_percentage?: number
          id?: string
          is_active?: boolean | null
          min_participants?: number | null
          title?: string
          valid_from?: string | null
          valid_until?: string
        }
        Relationships: []
      }
      routes: {
        Row: {
          created_at: string | null
          distance_km: number
          from_location: string
          id: string
          to_location: string
        }
        Insert: {
          created_at?: string | null
          distance_km: number
          from_location: string
          id?: string
          to_location: string
        }
        Update: {
          created_at?: string | null
          distance_km?: number
          from_location?: string
          id?: string
          to_location?: string
        }
        Relationships: []
      }
      shared_ride_participants: {
        Row: {
          created_at: string | null
          dropoff_location: string
          fare_amount: number
          id: string
          participant_booking_id: string
          pickup_location: string
          primary_booking_id: string
        }
        Insert: {
          created_at?: string | null
          dropoff_location: string
          fare_amount: number
          id?: string
          participant_booking_id: string
          pickup_location: string
          primary_booking_id: string
        }
        Update: {
          created_at?: string | null
          dropoff_location?: string
          fare_amount?: number
          id?: string
          participant_booking_id?: string
          pickup_location?: string
          primary_booking_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_ride_participants_participant_booking_id_fkey"
            columns: ["participant_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_ride_participants_primary_booking_id_fkey"
            columns: ["primary_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          capacity: number
          created_at: string | null
          id: string
          image_url: string | null
          name: string
          price_per_km: number
          vehicle_type: string
        }
        Insert: {
          capacity: number
          created_at?: string | null
          id?: string
          image_url?: string | null
          name: string
          price_per_km: number
          vehicle_type: string
        }
        Update: {
          capacity?: number
          created_at?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price_per_km?: number
          vehicle_type?: string
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
      app_role: "passenger" | "driver" | "admin"
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
      app_role: ["passenger", "driver", "admin"],
    },
  },
} as const
