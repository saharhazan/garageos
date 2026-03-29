'use client'

import { useQuery } from '@tanstack/react-query'
import type { DashboardStats, WorkOrder } from '@/types'

async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch('/api/dashboard/stats')
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'שגיאת שרת' }))
    throw new Error(err.error ?? 'שגיאה בטעינת סטטיסטיקות')
  }
  const json = await res.json()
  return json.data as DashboardStats
}

async function fetchRecentOrders(): Promise<WorkOrder[]> {
  const params = new URLSearchParams({ page: '1', limit: '10' })
  const res = await fetch(`/api/orders?${params.toString()}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'שגיאת שרת' }))
    throw new Error(err.error ?? 'שגיאה בטעינת הזמנות אחרונות')
  }
  const json = await res.json()
  return json.data as WorkOrder[]
}

export function useDashboardStats() {
  return useQuery<DashboardStats, Error>({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 30,
  })
}

export function useRecentOrders() {
  return useQuery<WorkOrder[], Error>({
    queryKey: ['recent-orders'],
    queryFn: fetchRecentOrders,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 30,
  })
}
