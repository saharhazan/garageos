'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Phone, ChevronLeft, Car, Download, FileSpreadsheet } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Topbar } from '@/components/layout/topbar'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { formatDate } from '@/lib/utils'
import { exportToExcel } from '@/lib/excel-export'
import type { Customer } from '@/types'

interface CustomerWithMeta extends Customer {
  vehicle_count?: number
  last_order_date?: string | null
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerWithMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    setExporting(true)
    try {
      const res = await fetch('/api/export?type=customers')
      const json = await res.json()
      if (!res.ok || !json.data) return

      const rows = json.data.map((c: Record<string, unknown>) => ({
        full_name: c.full_name ?? '',
        phone: c.phone ?? '',
        email: c.email ?? '',
        notes: c.notes ?? '',
        created_at: c.created_at ? formatDate(c.created_at as string) : '',
      }))

      const today = new Date().toISOString().slice(0, 10)
      exportToExcel(rows, [
        { key: 'full_name', label: 'שם' },
        { key: 'phone', label: 'טלפון' },
        { key: 'email', label: 'אימייל' },
        { key: 'notes', label: 'הערות' },
        { key: 'created_at', label: 'תאריך הצטרפות' },
      ], `customers-${today}.xlsx`)
    } catch (err) {
      console.error('Export error:', err)
    } finally {
      setExporting(false)
    }
  }

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
      <Topbar
        title="לקוחות"
        actions={
          <div className="flex gap-2">
            <Link href="/customers/import">
              <Button variant="teal" size="sm">
                <FileSpreadsheet size={14} />
                <span className="hidden md:inline">ייבוא מאקסל</span>
              </Button>
            </Link>
            <Button variant="default" size="sm" onClick={handleExport} disabled={exporting} loading={exporting}>
              <Download size={14} />
              ייצוא
            </Button>
          </div>
        }
      />

      <div className="px-4 py-4 max-w-3xl mx-auto space-y-4">
        {/* Search */}
        <div className="relative">
          <Search
            size={15}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none"
          />
          <input
            type="search"
            placeholder="חפש לפי שם או טלפון..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-[6px] border border-white/5 bg-surface-lowest pr-9 pl-3 text-sm text-on-surface placeholder:text-outline outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : customers.length === 0 ? (
          <div className="rounded-xl border border-white/5 bg-surface-high px-4 py-12 text-center">
            <p className="text-sm text-outline">
              {search ? 'לא נמצאו לקוחות' : 'אין לקוחות עדיין'}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-white/5 overflow-hidden">
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
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors ${
                    index > 0 ? 'border-t border-white/5' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary-container/15 shrink-0">
                    <span className="text-xs font-semibold text-primary">{initials}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface truncate">
                      {customer.full_name}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <div className="flex items-center gap-1 text-xs text-outline">
                        <Phone size={10} />
                        <span dir="ltr">{customer.phone}</span>
                      </div>
                      {(customer.vehicle_count ?? 0) > 0 && (
                        <div className="flex items-center gap-1 text-xs text-outline">
                          <Car size={10} />
                          <span>{customer.vehicle_count} רכב</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <ChevronLeft size={16} className="text-outline-variant shrink-0" />
                </Link>
              )
            })}
          </div>
        )}

        {/* Count */}
        {!loading && customers.length > 0 && (
          <p className="text-xs text-outline text-center">
            {customers.length} לקוחות
          </p>
        )}
      </div>
    </div>
  )
}
