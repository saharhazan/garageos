// ─── Garage ────────────────────────────────────────────
export interface Garage {
  id: string
  name: string
  address: string | null
  phone: string | null
  subscription_plan: 'starter' | 'pro' | 'enterprise'
  settings: GarageSettings
  created_at: string
  is_active: boolean
}

export interface GarageSettings {
  sms_enabled: boolean
  whatsapp_enabled: boolean
  auto_notify_on_status_change: boolean
  tax_rate: number
  currency: string
  job_prefix: string
}

// ─── User ──────────────────────────────────────────────
export type UserRole = 'super_admin' | 'manager' | 'receptionist' | 'technician' | 'viewer'

export interface User {
  id: string
  garage_id: string
  full_name: string
  email: string | null
  phone: string | null
  role: UserRole
  avatar_url: string | null
  is_active: boolean
  created_at: string
  last_login: string | null
}

// ─── Customer ──────────────────────────────────────────
export interface Customer {
  id: string
  garage_id: string
  full_name: string
  phone: string
  email: string | null
  notes: string | null
  created_at: string
  vehicles?: Vehicle[]
}

// ─── Vehicle ───────────────────────────────────────────
export interface Vehicle {
  id: string
  customer_id: string
  garage_id: string
  license_plate: string
  make: string
  model: string
  year: number | null
  color: string | null
  vin: string | null
  notes: string | null
  created_at: string
  customer?: Customer
}

// ─── Work Order ────────────────────────────────────────
export type OrderStatus = 'received' | 'in_progress' | 'ready' | 'delivered' | 'cancelled'
export type OrderPriority = 'normal' | 'high' | 'urgent'

export interface OrderItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  total: number
}

export interface WorkOrder {
  id: string
  garage_id: string
  job_number: string
  customer_id: string
  vehicle_id: string
  technician_id: string | null
  status: OrderStatus
  priority: OrderPriority
  items: OrderItem[]
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
  customer?: Customer
  vehicle?: Vehicle
  technician?: User
}

// ─── Inventory ─────────────────────────────────────────
export interface InventoryItem {
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
}

// ─── Quote ────────────────────────────────────────────
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'

export interface Quote {
  id: string
  garage_id: string
  quote_number: string
  customer_id: string
  vehicle_id: string
  items: OrderItem[]
  notes: string | null
  subtotal: number
  tax_amount: number
  total_amount: number
  status: QuoteStatus
  valid_until: string | null
  created_at: string
  updated_at: string
  customer?: Customer
  vehicle?: Vehicle
}

// ─── Dashboard ─────────────────────────────────────────
export interface DashboardStats {
  open_orders: number
  in_progress: number
  ready_for_pickup: number
  completed_today: number
  revenue_today: number
  revenue_week: number
  revenue_month: number
  appointments_today: number
}
