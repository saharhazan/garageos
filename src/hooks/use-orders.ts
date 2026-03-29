'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { WorkOrder, OrderStatus, OrderItem } from '@/types'

interface OrderFilters {
  status?: string
  search?: string
  page?: number
}

interface OrdersResponse {
  data: WorkOrder[]
  total: number
}

interface CreateOrderPayload {
  customer_id: string
  vehicle_id: string
  technician_id?: string
  priority?: 'normal' | 'high' | 'urgent'
  items: OrderItem[]
  notes?: string
  mileage?: number
}

interface UpdateOrderPayload {
  status?: OrderStatus
  priority?: 'normal' | 'high' | 'urgent'
  technician_id?: string | null
  items?: OrderItem[]
  notes?: string | null
  mileage?: number | null
  signature_url?: string | null
  images?: string[]
}

async function fetchOrders(filters: OrderFilters = {}): Promise<OrdersResponse> {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.search) params.set('search', filters.search)
  if (filters.page) params.set('page', String(filters.page))

  const res = await fetch(`/api/orders?${params.toString()}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'שגיאת שרת' }))
    throw new Error(err.error ?? 'שגיאה בטעינת הזמנות')
  }
  const json = await res.json()
  return { data: json.data, total: json.total }
}

async function fetchOrder(id: string): Promise<WorkOrder> {
  const res = await fetch(`/api/orders/${id}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'שגיאת שרת' }))
    throw new Error(err.error ?? 'שגיאה בטעינת הזמנה')
  }
  const json = await res.json()
  return json.data as WorkOrder
}

export function useOrders(filters: OrderFilters = {}) {
  return useQuery<OrdersResponse, Error>({
    queryKey: ['orders', filters],
    queryFn: () => fetchOrders(filters),
    staleTime: 1000 * 30,
  })
}

export function useOrder(id: string) {
  return useQuery<WorkOrder, Error>({
    queryKey: ['orders', id],
    queryFn: () => fetchOrder(id),
    enabled: !!id,
    staleTime: 1000 * 30,
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation<WorkOrder, Error, CreateOrderPayload>({
    mutationFn: async (payload) => {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'שגיאת שרת' }))
        throw new Error(err.error ?? 'שגיאה ביצירת הזמנה')
      }
      const json = await res.json()
      return json.data as WorkOrder
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useUpdateOrderStatus(id: string) {
  const queryClient = useQueryClient()

  return useMutation<WorkOrder, Error, OrderStatus>({
    mutationFn: async (status) => {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'שגיאת שרת' }))
        throw new Error(err.error ?? 'שגיאה בעדכון סטטוס')
      }
      const json = await res.json()
      return json.data as WorkOrder
    },
    onMutate: async (status) => {
      await queryClient.cancelQueries({ queryKey: ['orders', id] })
      const previous = queryClient.getQueryData<WorkOrder>(['orders', id])
      if (previous) {
        queryClient.setQueryData<WorkOrder>(['orders', id], {
          ...previous,
          status,
        })
      }
      return { previous }
    },
    onError: (_err, _status, context) => {
      const ctx = context as { previous?: WorkOrder } | undefined
      if (ctx?.previous) {
        queryClient.setQueryData(['orders', id], ctx.previous)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['recent-orders'] })
    },
  })
}

export function useUpdateOrder(id: string) {
  const queryClient = useQueryClient()

  return useMutation<WorkOrder, Error, UpdateOrderPayload>({
    mutationFn: async (payload) => {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'שגיאת שרת' }))
        throw new Error(err.error ?? 'שגיאה בעדכון הזמנה')
      }
      const json = await res.json()
      return json.data as WorkOrder
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<WorkOrder>(['orders', id], updated)
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}
