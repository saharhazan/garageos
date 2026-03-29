'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Topbar } from '@/components/layout/topbar'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { formatCurrency } from '@/lib/utils'
import type { InventoryItem } from '@/types'

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchItems() {
      setLoading(true)
      const supabase = createClient()
      let query = supabase
        .from('inventory_items')
        .select('*')
        .order('name')

      if (search.trim()) {
        query = query.ilike('name', `%${search}%`)
      }

      const { data } = await query
      setItems(data ?? [])
      setLoading(false)
    }
    fetchItems()
  }, [search])

  const lowStock = items.filter((i) => i.quantity <= i.min_quantity)

  return (
    <div className="min-h-full">
      <Topbar title="מלאי" />

      <div className="px-4 py-4 max-w-4xl mx-auto space-y-4">
        {lowStock.length > 0 && (
          <div className="flex items-center gap-2.5 rounded-[8px] border border-yellow-500/20 bg-yellow-500/8 px-3 py-2.5">
            <AlertTriangle size={14} className="text-yellow-400 shrink-0" />
            <p className="text-sm text-yellow-400">
              {lowStock.length} פריטים במלאי נמוך
            </p>
          </div>
        )}

        <div className="relative">
          <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52525b] pointer-events-none" />
          <input
            type="search"
            placeholder="חפש פריט..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-[6px] border border-[#27272a] bg-[#09090b] pr-9 pl-3 text-sm text-[#fafafa] placeholder:text-[#52525b] outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-blue-500/10 transition-all"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : (
          <div className="rounded-xl border border-[#27272a] overflow-hidden">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#27272a] bg-[#09090b]">
                  <th className="text-right px-4 h-9 text-xs font-medium text-[#52525b]">שם פריט</th>
                  <th className="text-right px-4 h-9 text-xs font-medium text-[#52525b]">קטגוריה</th>
                  <th className="text-right px-4 h-9 text-xs font-medium text-[#52525b]">מלאי</th>
                  <th className="text-right px-4 h-9 text-xs font-medium text-[#52525b]">מחיר</th>
                  <th className="text-right px-4 h-9 text-xs font-medium text-[#52525b]">ספק</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-[#52525b]">
                      {search ? 'לא נמצאו פריטים' : 'אין פריטים במלאי'}
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const isLow = item.quantity <= item.min_quantity
                    return (
                      <tr key={item.id} className="border-b border-[#27272a] hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 h-11">
                          <div className="flex items-center gap-2">
                            <span className="text-[#fafafa] font-medium">{item.name}</span>
                            {item.sku && (
                              <span className="text-[10px] text-[#52525b] font-mono">{item.sku}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 h-11 text-[#71717a]">{item.category ?? '—'}</td>
                        <td className="px-4 h-11">
                          <div className="flex items-center gap-2">
                            <span className={isLow ? 'text-yellow-400 font-semibold' : 'text-[#fafafa]'}>
                              {item.quantity}
                            </span>
                            {isLow && (
                              <Badge variant="yellow" dot>נמוך</Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 h-11 text-[#a1a1aa] tabular-nums">
                          {formatCurrency(item.unit_price)}
                        </td>
                        <td className="px-4 h-11 text-[#71717a]">{item.supplier ?? '—'}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
