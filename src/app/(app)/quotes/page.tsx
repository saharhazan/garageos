'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, FileText, ArrowLeftRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Topbar } from '@/components/layout/topbar'
import { Button } from '@/components/ui/button'
import { Chip } from '@/components/ui/chip'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Quote, QuoteStatus } from '@/types'

const STATUS_FILTERS: { label: string; value: QuoteStatus | 'all' }[] = [
  { label: 'הכל', value: 'all' },
  { label: 'טיוטה', value: 'draft' },
  { label: 'נשלחה', value: 'sent' },
  { label: 'אושרה', value: 'accepted' },
  { label: 'נדחתה', value: 'rejected' },
]

const STATUS_COLORS: Record<QuoteStatus, { bg: string; text: string; label: string }> = {
  draft: { bg: 'bg-[#27272a]', text: 'text-[#a1a1aa]', label: 'טיוטה' },
  sent: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'נשלחה' },
  accepted: { bg: 'bg-green-500/10', text: 'text-green-400', label: 'אושרה' },
  rejected: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'נדחתה' },
  expired: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: 'פג תוקף' },
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'all'>('all')
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 20

  useEffect(() => {
    setPage(0)
  }, [search, statusFilter])

  useEffect(() => {
    async function fetchQuotes() {
      setLoading(true)
      const supabase = createClient()
      let query = supabase
        .from('quotes')
        .select(
          '*, customer:customers(full_name, phone), vehicle:vehicles(license_plate, make, model)'
        )
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      if (search.trim()) {
        query = query.or(
          `quote_number.ilike.%${search}%,customer.full_name.ilike.%${search}%`
        )
      }

      const { data } = await query
      setQuotes(data ?? [])
      setLoading(false)
    }
    fetchQuotes()
  }, [statusFilter, search, page])

  return (
    <div className="min-h-full">
      <Topbar
        title="הצעות מחיר"
        actions={
          <Link href="/quotes/new">
            <Button variant="primary" size="sm">
              <Plus size={14} />
              הצעה חדשה
            </Button>
          </Link>
        }
      />

      <div className="px-4 py-4 max-w-6xl mx-auto space-y-4">
        {/* Search */}
        <div className="relative">
          <Search
            size={15}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52525b] pointer-events-none"
          />
          <input
            type="search"
            placeholder="חפש לפי מספר הצעה, שם לקוח..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-[6px] border border-[#27272a] bg-[#09090b] pr-9 pl-3 text-sm text-[#fafafa] placeholder:text-[#52525b] outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-blue-500/10 transition-all"
          />
        </div>

        {/* Status filter chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4">
          {STATUS_FILTERS.map((f) => (
            <Chip
              key={f.value}
              active={statusFilter === f.value}
              onClick={() => setStatusFilter(f.value)}
              className="shrink-0"
            >
              {f.label}
            </Chip>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        )}

        {/* Content */}
        {!loading && (
          <>
            {quotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <FileText size={40} className="text-[#3f3f46]" />
                <div className="text-center">
                  <h2 className="text-sm font-semibold text-[#fafafa]">
                    {search || statusFilter !== 'all' ? 'לא נמצאו תוצאות' : 'אין הצעות מחיר עדיין'}
                  </h2>
                  <p className="text-xs text-[#52525b] mt-1">
                    {search || statusFilter !== 'all'
                      ? 'נסה לשנות את החיפוש או הסינון'
                      : 'צור הצעת מחיר חדשה ללקוח'}
                  </p>
                </div>
                {!search && statusFilter === 'all' && (
                  <Link href="/quotes/new">
                    <Button variant="primary" size="default">
                      <Plus size={14} />
                      הצעה חדשה
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block rounded-xl border border-[#27272a] overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>מספר</TableHead>
                        <TableHead>לקוח</TableHead>
                        <TableHead>רכב</TableHead>
                        <TableHead>סטטוס</TableHead>
                        <TableHead>סכום</TableHead>
                        <TableHead>תוקף</TableHead>
                        <TableHead>תאריך</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quotes.map((quote) => {
                        const status = STATUS_COLORS[quote.status]
                        return (
                          <TableRow key={quote.id} className="cursor-pointer">
                            <TableCell>
                              <Link
                                href={`/quotes/${quote.id}`}
                                className="font-mono text-xs text-[#3b82f6] hover:underline"
                              >
                                {quote.quote_number}
                              </Link>
                            </TableCell>
                            <TableCell className="text-[#fafafa] font-medium">
                              {quote.customer?.full_name ?? '—'}
                            </TableCell>
                            <TableCell>
                              {quote.vehicle ? (
                                <span className="font-mono text-xs bg-[#27272a] px-1.5 py-0.5 rounded">
                                  {quote.vehicle.license_plate}
                                </span>
                              ) : '—'}
                            </TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${status.bg} ${status.text}`}>
                                {status.label}
                              </span>
                            </TableCell>
                            <TableCell className="tabular-nums text-[#fafafa]">
                              {formatCurrency(quote.total_amount)}
                            </TableCell>
                            <TableCell className="text-xs">
                              {quote.valid_until ? formatDate(quote.valid_until) : '—'}
                            </TableCell>
                            <TableCell className="text-xs">
                              {formatDate(quote.created_at)}
                            </TableCell>
                            <TableCell>
                              {quote.status === 'accepted' && (
                                <Button variant="ghost" size="sm" title="המר לעבודה">
                                  <ArrowLeftRight size={13} />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile card list */}
                <div className="md:hidden space-y-2">
                  {quotes.map((quote) => {
                    const status = STATUS_COLORS[quote.status]
                    return (
                      <Link
                        key={quote.id}
                        href={`/quotes/${quote.id}`}
                        className="block rounded-xl border border-[#27272a] bg-[#18181b] p-4 hover:border-[#3f3f46] transition-colors active:bg-white/[0.02]"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-xs text-[#3b82f6]">
                            {quote.quote_number}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${status.bg} ${status.text}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-[#fafafa] mb-0.5">
                          {quote.customer?.full_name ?? '—'}
                        </p>
                        {quote.vehicle && (
                          <div className="flex items-center gap-2 text-xs text-[#52525b]">
                            <span className="font-mono bg-[#27272a] px-1.5 py-0.5 rounded">
                              {quote.vehicle.license_plate}
                            </span>
                            <span>{quote.vehicle.make} {quote.vehicle.model}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#27272a]">
                          <span className="text-sm font-bold text-[#fafafa]">
                            {formatCurrency(quote.total_amount)}
                          </span>
                          <span className="text-xs text-[#52525b]">
                            {formatDate(quote.created_at)}
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    הקודם
                  </Button>
                  <span className="text-xs text-[#52525b]">עמוד {page + 1}</span>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={quotes.length < PAGE_SIZE}
                  >
                    הבא
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Mobile FAB */}
      <div className="md:hidden fixed bottom-20 left-4 z-30">
        <Link href="/quotes/new">
          <button className="flex items-center justify-center w-12 h-12 rounded-full bg-[#3b82f6] shadow-lg shadow-blue-500/30 text-white transition-transform active:scale-95">
            <Plus size={20} />
          </button>
        </Link>
      </div>
    </div>
  )
}
