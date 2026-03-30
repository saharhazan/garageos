'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Quote, QuoteStatus, OrderItem } from '@/types'

interface QuoteFilters {
  status?: string
  search?: string
  page?: number
}

interface QuotesResponse {
  data: Quote[]
  total: number
}

interface CreateQuotePayload {
  customer_id: string
  vehicle_id: string
  items: OrderItem[]
  notes?: string
  valid_until?: string
}

interface UpdateQuotePayload {
  items?: OrderItem[]
  notes?: string | null
  status?: QuoteStatus
  valid_until?: string | null
}

async function fetchQuotes(filters: QuoteFilters = {}): Promise<QuotesResponse> {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.search) params.set('search', filters.search)
  if (filters.page) params.set('page', String(filters.page))

  const res = await fetch(`/api/quotes?${params.toString()}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'שגיאת שרת' }))
    throw new Error(err.error ?? 'שגיאה בטעינת הצעות מחיר')
  }
  const json = await res.json()
  return { data: json.data, total: json.total }
}

async function fetchQuote(id: string): Promise<Quote> {
  const res = await fetch(`/api/quotes/${id}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'שגיאת שרת' }))
    throw new Error(err.error ?? 'שגיאה בטעינת הצעת מחיר')
  }
  const json = await res.json()
  return json.data as Quote
}

export function useQuotes(filters: QuoteFilters = {}) {
  return useQuery<QuotesResponse, Error>({
    queryKey: ['quotes', filters],
    queryFn: () => fetchQuotes(filters),
    staleTime: 1000 * 30,
  })
}

export function useQuote(id: string) {
  return useQuery<Quote, Error>({
    queryKey: ['quotes', id],
    queryFn: () => fetchQuote(id),
    enabled: !!id,
    staleTime: 1000 * 30,
  })
}

export function useCreateQuote() {
  const queryClient = useQueryClient()

  return useMutation<Quote, Error, CreateQuotePayload>({
    mutationFn: async (payload) => {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'שגיאת שרת' }))
        throw new Error(err.error ?? 'שגיאה ביצירת הצעת מחיר')
      }
      const json = await res.json()
      return json.data as Quote
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
    },
  })
}

export function useUpdateQuote(id: string) {
  const queryClient = useQueryClient()

  return useMutation<Quote, Error, UpdateQuotePayload>({
    mutationFn: async (payload) => {
      const res = await fetch(`/api/quotes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'שגיאת שרת' }))
        throw new Error(err.error ?? 'שגיאה בעדכון הצעת מחיר')
      }
      const json = await res.json()
      return json.data as Quote
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<Quote>(['quotes', id], updated)
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
    },
  })
}

export function useConvertQuoteToOrder(id: string) {
  const queryClient = useQueryClient()

  return useMutation<{ order_id: string }, Error, void>({
    mutationFn: async () => {
      const res = await fetch(`/api/quotes/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'convert' }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'שגיאת שרת' }))
        throw new Error(err.error ?? 'שגיאה בהמרת הצעה לעבודה')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
