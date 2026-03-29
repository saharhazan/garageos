export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      garages: {
        Row: {
          id: string
          name: string
          address: string | null
          phone: string | null
          subscription_plan: 'starter' | 'pro' | 'enterprise'
          settings: Json
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          phone?: string | null
          subscription_plan?: 'starter' | 'pro' | 'enterprise'
          settings?: Json
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          phone?: string | null
          subscription_plan?: 'starter' | 'pro' | 'enterprise'
          settings?: Json
          is_active?: boolean
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          garage_id: string
          full_name: string
          phone: string | null
          role: 'super_admin' | 'manager' | 'receptionist' | 'technician' | 'viewer'
          avatar_url: string | null
          is_active: boolean
          last_login: string | null
          created_at: string
        }
        Insert: {
          id: string
          garage_id: string
          full_name: string
          phone?: string | null
          role?: 'super_admin' | 'manager' | 'receptionist' | 'technician' | 'viewer'
          avatar_url?: string | null
          is_active?: boolean
          last_login?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          garage_id?: string
          full_name?: string
          phone?: string | null
          role?: 'super_admin' | 'manager' | 'receptionist' | 'technician' | 'viewer'
          avatar_url?: string | null
          is_active?: boolean
          last_login?: string | null
          created_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          garage_id: string
          full_name: string
          phone: string
          email: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          garage_id: string
          full_name: string
          phone: string
          email?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          garage_id?: string
          full_name?: string
          phone?: string
          email?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      vehicles: {
        Row: {
          id: string
          garage_id: string
          customer_id: string
          license_plate: string
          make: string
          model: string
          year: number | null
          color: string | null
          vin: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          garage_id: string
          customer_id: string
          license_plate: string
          make: string
          model: string
          year?: number | null
          color?: string | null
          vin?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          garage_id?: string
          customer_id?: string
          license_plate?: string
          make?: string
          model?: string
          year?: number | null
          color?: string | null
          vin?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      work_orders: {
        Row: {
          id: string
          garage_id: string
          job_number: string
          customer_id: string
          vehicle_id: string
          technician_id: string | null
          status: 'received' | 'in_progress' | 'ready' | 'delivered' | 'cancelled'
          priority: 'normal' | 'high' | 'urgent'
          items: Json
          notes: string | null
          mileage: number | null
          subtotal: number
          tax_amount: number
          total_amount: number
          images: string[]
          signature_url: string | null
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          garage_id: string
          job_number: string
          customer_id: string
          vehicle_id: string
          technician_id?: string | null
          status?: 'received' | 'in_progress' | 'ready' | 'delivered' | 'cancelled'
          priority?: 'normal' | 'high' | 'urgent'
          items?: Json
          notes?: string | null
          mileage?: number | null
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          images?: string[]
          signature_url?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          garage_id?: string
          job_number?: string
          customer_id?: string
          vehicle_id?: string
          technician_id?: string | null
          status?: 'received' | 'in_progress' | 'ready' | 'delivered' | 'cancelled'
          priority?: 'normal' | 'high' | 'urgent'
          items?: Json
          notes?: string | null
          mileage?: number | null
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          images?: string[]
          signature_url?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
      }
      inventory: {
        Row: {
          id: string
          garage_id: string
          name: string
          sku: string | null
          quantity: number
          min_quantity: number
          unit_price: number
          supplier: string | null
          category: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          garage_id: string
          name: string
          sku?: string | null
          quantity?: number
          min_quantity?: number
          unit_price?: number
          supplier?: string | null
          category?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          garage_id?: string
          name?: string
          sku?: string | null
          quantity?: number
          min_quantity?: number
          unit_price?: number
          supplier?: string | null
          category?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          garage_id: string
          order_id: string | null
          type: 'sms' | 'whatsapp' | 'email'
          recipient: string
          message: string
          status: 'pending' | 'sent' | 'failed'
          sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          garage_id: string
          order_id?: string | null
          type: 'sms' | 'whatsapp' | 'email'
          recipient: string
          message: string
          status?: 'pending' | 'sent' | 'failed'
          sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          garage_id?: string
          order_id?: string | null
          type?: 'sms' | 'whatsapp' | 'email'
          recipient?: string
          message?: string
          status?: 'pending' | 'sent' | 'failed'
          sent_at?: string | null
          created_at?: string
        }
      }
      job_sequences: {
        Row: {
          garage_id: string
          year: number
          last_number: number
        }
        Insert: {
          garage_id: string
          year: number
          last_number?: number
        }
        Update: {
          garage_id?: string
          year?: number
          last_number?: number
        }
      }
    }
    Views: {
      dashboard_stats: {
        Row: {
          garage_id: string
          open_orders: number
          in_progress: number
          ready_for_pickup: number
          completed_today: number
          revenue_today: number
          revenue_week: number
          revenue_month: number
        }
      }
    }
    Functions: {
      next_job_number: {
        Args: { p_garage_id: string }
        Returns: number
      }
      auth_garage_id: {
        Args: Record<string, never>
        Returns: string
      }
      auth_user_role: {
        Args: Record<string, never>
        Returns: string
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

export type Views<T extends keyof Database['public']['Views']> =
  Database['public']['Views'][T]['Row']
