'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Phone, ChevronLeft, Car } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Topbar } from '@/components/layout/topbar'
import { Spinner } from '@/components/ui/spinner'
import { formatDate } from '@/lib/utils'
import type { Customer } from '@/types'

interface CustomerWithMeta extends Customer {
  vehicle_count?: number
  last_order_date?: string | null
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerWithMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchCustomers() {
      setLoading(true)
      const supabase = createClient()

      let query = supabase
        .from('customers')
        .select('*, vehicles(id)')
        .order('full_name')

      if (search.trim()) {
        query = query.or(
          `full_name.ilike.%${search}%,phone.ilike.%${search}%`
        )
      }

      const { data } = await query

      const enriched = (data ?? []).map((c) => ({
        ...c,
        vehicle_count: Array.isArray(c.vehicles) ? c.vehicles.length : 0,
      }))

      setCustomers(enriched)
      setLoading(false)
    }
    fetchCustomers()
  }, [search])

  return (
    <div className="min-h-full">
      <Topbar title="לקוחות" />

      <div className="px-4 py-4 max-w-3xl mx-auto space-y-4">
        {/* Search */}
        <div className="relative">
          <Search
            size={15}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52525b] pointer-events-none"
          />
          <input
            type="search"
            placeholder="חפש לפי שם או טלפון..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-[6px] border border-[#27272a] bg-[#09090b] pr-9 pl-3 text-sm text-[#fafafa] placeholder:text-[#52525b] outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-blue-500/10 transition-all"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : customers.length === 0 ? (
          <div className="rounded-xl border border-[#27272a] bg-[#18181b] px-4 py-12 text-center">
            <p className="text-sm text-[#52525b]">
              {search ? 'לא נמצאו לקוחות' : 'אין לקוחות עדיין'}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-[#27272a] overflow-hidden">
            {customers.map((customer, index) => {
              const initials = customer.full_name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()

              return (
                <Link
                  key={customer.id}
                  href={`/customers/${customer.id}`}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors ${
                    index > 0 ? 'border-t border-[#27272a]' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#3b82f6]/15 shrink-0">
                    <span className="text-xs font-semibold text-[#3b82f6]">{initials}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#fafafa] truncate">
                      {customer.full_name}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <div className="flex items-center gap-1 text-xs text-[#52525b]">
                        <Phone size={10} />
                        <span dir="ltr">{customer.phone}</span>
                      </div>
                      {(customer.vehicle_count ?? 0) > 0 && (
                        <div className="flex items-center gap-1 text-xs text-[#52525b]">
                          <Car size={10} />
                          <span>{customer.vehicle_count} רכב</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <ChevronLeft size={16} className="text-[#3f3f46] shrink-0" />
                </Link>
              )
            })}
          </div>
        )}

        {/* Count */}
        {!loading && customers.length > 0 && (
          <p className="text-xs text-[#52525b] text-center">
            {customers.length} לקוחות
          </p>
        )}
      </div>
    </div>
  )
}
