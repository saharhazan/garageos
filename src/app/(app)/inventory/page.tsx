'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { AlertTriangle, Search, Download, Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Topbar } from '@/components/layout/topbar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { formatCurrency } from '@/lib/utils'
import { exportToExcel } from '@/lib/excel-export'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToastActions } from '@/hooks/use-toast'
import type { InventoryItem } from '@/types'

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [exporting, setExporting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToastActions()

  async function handleExport() {
    setExporting(true)
    try {
      const res = await fetch('/api/export?type=inventory')
      const json = await res.json()
      if (!res.ok || !json.data) return

      const rows = json.data.map((item: Record<string, unknown>) => ({
        name: item.name ?? '',
        sku: item.sku ?? '',
        quantity: item.quantity ?? 0,
        min_quantity: item.min_quantity ?? 0,
        unit_price: item.unit_price ?? 0,
        supplier: item.supplier ?? '',
        category: item.category ?? '',
      }))

      const today = new Date().toISOString().slice(0, 10)
      exportToExcel(rows, [
        { key: 'name', label: 'שם' },
        { key: 'sku', label: 'מק"ט' },
        { key: 'quantity', label: 'כמות' },
        { key: 'min_quantity', label: 'מינימום' },
        { key: 'unit_price', label: 'מחיר' },
        { key: 'supplier', label: 'ספק' },
        { key: 'category', label: 'קטגוריה' },
      ], `inventory-${today}.xlsx`)
    } catch (err) {
      console.error('Export error:', err)
    } finally {
      setExporting(false)
    }
  }

  const fetchItems = useCallback(async () => {
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
  }, [search])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  async function handleDeleteItem() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/inventory/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const json = await res.json()
        toast.error(json.error ?? 'שגיאה במחיקת פריט')
        return
      }
      toast.success('הפריט נמחק')
      fetchItems()
    } catch {
      toast.error('שגיאה במחיקת פריט')
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  const lowStock = items.filter((i) => i.quantity <= i.min_quantity)

  return (
    <div className="min-h-full">
      <Topbar
        title="מלאי"
        actions={
          <div className="flex items-center gap-1.5">
            <Button variant="default" size="sm" onClick={handleExport} disabled={exporting} loading={exporting}>
              <Download size={14} />
              ייצוא
            </Button>
            <Link href="/inventory/new">
              <Button variant="primary" size="sm">
                <Plus size={14} />
                פריט חדש
              </Button>
            </Link>
          </div>
        }
      />

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
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-outline">
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
                        <td className="px-2 h-11">
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(item)}
                            className="flex items-center justify-center w-8 h-8 rounded-md text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
                            title="מחק פריט"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteItem}
        title="מחיקת פריט מלאי"
        description={`האם למחוק את "${deleteTarget?.name ?? ''}"? פעולה זו לא ניתנת לביטול.`}
        confirmLabel="מחק פריט"
        loading={deleting}
      />
    </div>
  )
}
