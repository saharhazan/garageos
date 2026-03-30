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
          <div className="flex items-center gap-2.5 rounded-[8px] border border-tertiary/20 bg-tertiary/8 px-3 py-2.5">
            <AlertTriangle size={14} className="text-tertiary shrink-0" />
            <p className="text-sm text-tertiary">
              {lowStock.length} פריטים במלאי נמוך
            </p>
          </div>
        )}

        <div className="relative">
          <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none" />
          <input
            type="search"
            placeholder="חפש פריט..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-[6px] border border-white/5 bg-surface-lowest pr-9 pl-3 text-sm text-on-surface placeholder:text-outline outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : (
          <div className="rounded-xl border border-white/5 overflow-hidden">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-surface-lowest">
                  <th className="text-right px-4 h-9 text-xs font-medium text-outline">שם פריט</th>
                  <th className="text-right px-4 h-9 text-xs font-medium text-outline">קטגוריה</th>
                  <th className="text-right px-4 h-9 text-xs font-medium text-outline">מלאי</th>
                  <th className="text-right px-4 h-9 text-xs font-medium text-outline">מחיר</th>
                  <th className="text-right px-4 h-9 text-xs font-medium text-outline">ספק</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-outline">
                      {search ? 'לא נמצאו פריטים' : 'אין פריטים במלאי'}
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const isLow = item.quantity <= item.min_quantity
                    return (
                      <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 h-11">
                          <div className="flex items-center gap-2">
                            <span className="text-on-surface font-medium">{item.name}</span>
                            {item.sku && (
                              <span className="text-[10px] text-outline font-mono">{item.sku}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 h-11 text-on-surface-variant">{item.category ?? '-'}</td>
                        <td className="px-4 h-11">
                          <div className="flex items-center gap-2">
                            <span className={isLow ? 'text-tertiary font-semibold' : 'text-on-surface'}>
                              {item.quantity}
                            </span>
                            {isLow && (
                              <Badge variant="yellow" dot>נמוך</Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 h-11 text-on-surface-variant tabular-nums">
                          {formatCurrency(item.unit_price)}
                        </td>
                        <td className="px-4 h-11 text-on-surface-variant">{item.supplier ?? '-'}</td>
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
