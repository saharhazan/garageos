import type { SupabaseClient } from '@supabase/supabase-js'

// ─── Types ────────────────────────────────────────────────
export interface PlanLimits {
  maxUsers: number
  maxOrdersPerMonth: number
  maxGarages: number
  features: {
    quotes: boolean
    whatsapp: boolean
    sms: boolean
    email: boolean
    advancedReports: boolean
    excelExport: boolean
    customFields: boolean
    api: boolean
  }
}

// ─── Plan definitions ─────────────────────────────────────
const PLAN_LIMITS: Record<string, PlanLimits> = {
  starter: {
    maxUsers: 3,
    maxOrdersPerMonth: 100,
    maxGarages: 1,
    features: {
      quotes: false,
      whatsapp: false,
      sms: false,
      email: false,
      advancedReports: false,
      excelExport: false,
      customFields: false,
      api: false,
    },
  },
  pro: {
    maxUsers: 10,
    maxOrdersPerMonth: Infinity,
    maxGarages: 1,
    features: {
      quotes: true,
      whatsapp: true,
      sms: true,
      email: true,
      advancedReports: true,
      excelExport: true,
      customFields: true,
      api: false,
    },
  },
  enterprise: {
    maxUsers: Infinity,
    maxOrdersPerMonth: Infinity,
    maxGarages: Infinity,
    features: {
      quotes: true,
      whatsapp: true,
      sms: true,
      email: true,
      advancedReports: true,
      excelExport: true,
      customFields: true,
      api: true,
    },
  },
}

// ─── Plan display names ───────────────────────────────────
export const PLAN_DISPLAY_NAMES: Record<string, string> = {
  starter: 'חינם',
  pro: 'מקצועי',
  enterprise: 'עסקי',
}

export const NEXT_PLAN: Record<string, string> = {
  starter: 'pro',
  pro: 'enterprise',
}

// ─── Helpers ──────────────────────────────────────────────

export function getPlanLimits(plan: string): PlanLimits {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.starter
}

export async function checkOrderLimit(
  supabase: SupabaseClient,
  garageId: string,
  plan: string
): Promise<{ allowed: boolean; current: number; max: number }> {
  const limits = getPlanLimits(plan)
  if (limits.maxOrdersPerMonth === Infinity) {
    return { allowed: true, current: 0, max: Infinity }
  }

  // Count orders created this month
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()

  const { count } = await supabase
    .from('work_orders')
    .select('*', { count: 'exact', head: true })
    .eq('garage_id', garageId)
    .gte('created_at', monthStart)
    .lt('created_at', monthEnd)

  const current = count ?? 0
  return {
    allowed: current < limits.maxOrdersPerMonth,
    current,
    max: limits.maxOrdersPerMonth,
  }
}

export async function checkUserLimit(
  supabase: SupabaseClient,
  garageId: string,
  plan: string
): Promise<{ allowed: boolean; current: number; max: number }> {
  const limits = getPlanLimits(plan)
  if (limits.maxUsers === Infinity) {
    return { allowed: true, current: 0, max: Infinity }
  }

  const { count } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('garage_id', garageId)
    .eq('is_active', true)

  const current = count ?? 0
  return {
    allowed: current < limits.maxUsers,
    current,
    max: limits.maxUsers,
  }
}

export function canUseFeature(
  plan: string,
  feature: keyof PlanLimits['features']
): boolean {
  const limits = getPlanLimits(plan)
  return limits.features[feature]
}
