'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { InventoryItem } from '@/types'

interface UpsertInventoryPayload {
  id?: string
  name: string
  sku?: string | null
  quantity: number
  min_quantity?: number
  unit_price: number
  supplier?: string | null
  category?: string | null
}

async function fetchInventory(): Promise<InventoryItem[]> {
  const res = await fetch('/api/inventory')
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'שגיאת שרת' }))
    throw new Error(err.error ?? 'שגיאה בטעינת מלאי')
  }
  const json = await res.json()
  return json.data as InventoryItem[]
}

export function useInventory() {
  return useQuery<InventoryItem[], Error>({
    queryKey: ['inventory'],
    queryFn: fetchInventory,
    staleTime: 1000 * 60,
  })
}

export function useLowStockItems() {
  return useQuery<InventoryItem[], Error>({
    queryKey: ['inventory-low-stock'],
    queryFn: async () => {
      const items = await fetchInventory()
      return items.filter((item) => item.quantity <= item.min_quantity)
    },
    staleTime: 1000 * 60,
  })
}

export function useUpsertInventory() {
  const queryClient = useQueryClient()

  return useMutation<InventoryItem, Error, UpsertInventoryPayload>({
    mutationFn: async (payload) => {
      const isUpdate = !!payload.id
      const url = isUpdate ? `/api/inventory/${payload.id}` : '/api/inventory'
      const method = isUpdate ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'שגיאת שרת' }))
        throw new Error(err.error ?? 'שגיאה בשמירת פריט מלאי')
      }
      const json = await res.json()
      return json.data as InventoryItem
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-low-stock'] })
    },
  })
}
