'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Customer, Vehicle } from '@/types'

interface CustomerWithVehicles extends Customer {
  vehicles: Vehicle[]
}

interface PlateResult {
  customer: Customer | null
  vehicle: Vehicle | null
}

interface CreateCustomerPayload {
  full_name: string
  phone: string
  email?: string | null
  notes?: string | null
}

interface UpdateCustomerPayload {
  full_name?: string
  phone?: string
  email?: string | null
  notes?: string | null
}

async function fetchCustomers(search?: string): Promise<Customer[]> {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  const res = await fetch(`/api/customers?${params.toString()}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'שגיאת שרת' }))
    throw new Error(err.error ?? 'שגיאה בטעינת לקוחות')
  }
  const json = await res.json()
  return json.data as Customer[]
}

async function fetchCustomer(id: string): Promise<CustomerWithVehicles> {
  const res = await fetch(`/api/customers/${id}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'שגיאת שרת' }))
    throw new Error(err.error ?? 'שגיאה בטעינת לקוח')
  }
  const json = await res.json()
  return json.data as CustomerWithVehicles
}

async function lookupByPlate(plate: string): Promise<PlateResult> {
  const params = new URLSearchParams({ plate })
  const res = await fetch(`/api/vehicles?${params.toString()}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'שגיאת שרת' }))
    throw new Error(err.error ?? 'שגיאה בחיפוש לוחית')
  }
  const json = await res.json()
  const vehicle = (json.data?.[0] as (Vehicle & { customer?: Customer }) | undefined) ?? null
  return {
    vehicle: vehicle ?? null,
    customer: vehicle?.customer ?? null,
  }
}

export function useCustomers(search?: string) {
  return useQuery<Customer[], Error>({
    queryKey: ['customers', search],
    queryFn: () => fetchCustomers(search),
    staleTime: 1000 * 60,
  })
}

export function useCustomer(id: string) {
  return useQuery<CustomerWithVehicles, Error>({
    queryKey: ['customers', id],
    queryFn: () => fetchCustomer(id),
    enabled: !!id,
    staleTime: 1000 * 60,
  })
}

export function useLookupByPlate(plate: string) {
  return useQuery<PlateResult, Error>({
    queryKey: ['vehicle-plate', plate],
    queryFn: () => lookupByPlate(plate),
    enabled: plate.length >= 5,
    staleTime: 1000 * 30,
  })
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()

  return useMutation<Customer, Error, CreateCustomerPayload>({
    mutationFn: async (payload) => {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'שגיאת שרת' }))
        throw new Error(err.error ?? 'שגיאה ביצירת לקוח')
      }
      const json = await res.json()
      return json.data as Customer
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient()

  return useMutation<Customer, Error, { id: string; data: UpdateCustomerPayload }>({
    mutationFn: async ({ id, data }) => {
      const res = await fetch(`/api/customers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'שגיאת שרת' }))
        throw new Error(err.error ?? 'שגיאה בעדכון לקוח')
      }
      const json = await res.json()
      return json.data as Customer
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<Customer>(['customers', updated.id], updated)
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}
