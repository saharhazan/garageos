'use client'

import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import {
  Search,
  LayoutDashboard,
  Wrench,
  Plus,
  FileText,
  Users,
  Package,
  BarChart2,
  Settings,
  ArrowRight,
  Hash,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────

interface CommandItem {
  id: string
  label: string
  description?: string
  icon: React.ElementType
  href?: string
  action?: () => void
  group: string
}

// ─── Static commands ──────────────────────────────────

const quickActions: CommandItem[] = [
  { id: 'new-order', label: 'כרטיס עבודה חדש', description: 'פתח טופס עבודה חדש', icon: Plus, href: '/orders/new', group: 'פעולות מהירות' },
  { id: 'new-customer', label: 'לקוח חדש', description: 'הוסף לקוח חדש למערכת', icon: Users, href: '/customers?new=1', group: 'פעולות מהירות' },
  { id: 'settings', label: 'הגדרות', description: 'הגדרות מוסך ומשתמש', icon: Settings, href: '/settings', group: 'פעולות מהירות' },
]

const navCommands: CommandItem[] = [
  { id: 'dashboard', label: 'לוח בקרה', icon: LayoutDashboard, href: '/dashboard', group: 'ניווט' },
  { id: 'orders', label: 'עבודות', icon: Wrench, href: '/orders', group: 'ניווט' },
  { id: 'quotes', label: 'הצעות מחיר', icon: FileText, href: '/quotes', group: 'ניווט' },
  { id: 'customers', label: 'לקוחות', icon: Users, href: '/customers', group: 'ניווט' },
  { id: 'inventory', label: 'מלאי', icon: Package, href: '/inventory', group: 'ניווט' },
  { id: 'reports', label: 'דוחות', icon: BarChart2, href: '/reports', group: 'ניווט' },
  { id: 'settings-nav', label: 'הגדרות', icon: Settings, href: '/settings', group: 'ניווט' },
]

const allStaticCommands = [...quickActions, ...navCommands]

// ─── Custom event for opening the palette ─────────────

export const COMMAND_PALETTE_OPEN_EVENT = 'command-palette:open'

export function openCommandPalette() {
  window.dispatchEvent(new CustomEvent(COMMAND_PALETTE_OPEN_EVENT))
}

// ─── Palette content ──────────────────────────────────

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

function CommandPaletteContent({ open, onClose }: CommandPaletteProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [dynamicResults, setDynamicResults] = useState<CommandItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Search Supabase for orders and customers
  const searchDatabase = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setDynamicResults([])
      return
    }

    setIsSearching(true)
    try {
      const supabase = createClient()
      const trimmed = searchQuery.trim()

      // Search orders by job_number
      const ordersPromise = supabase
        .from('work_orders')
        .select('id, job_number, status, customer:customers(full_name)')
        .or(`job_number.ilike.%${trimmed}%`)
        .limit(5)

      // Search customers by name or phone
      const customersPromise = supabase
        .from('customers')
        .select('id, full_name, phone')
        .or(`full_name.ilike.%${trimmed}%,phone.ilike.%${trimmed}%`)
        .limit(5)

      const [ordersRes, customersRes] = await Promise.all([ordersPromise, customersPromise])

      const results: CommandItem[] = []

      // Map orders
      if (ordersRes.data) {
        for (const order of ordersRes.data) {
          const customerData = order.customer as unknown as { full_name: string } | null
          const statusLabels: Record<string, string> = {
            received: 'התקבלה',
            in_progress: 'בעבודה',
            ready: 'מוכנה',
            delivered: 'נמסרה',
            cancelled: 'בוטלה',
          }
          results.push({
            id: `order-${order.id}`,
            label: `עבודה #${order.job_number}`,
            description: `${customerData?.full_name ?? 'ללא לקוח'} — ${statusLabels[order.status] ?? order.status}`,
            icon: Hash,
            href: `/orders/${order.id}`,
            group: 'עבודות',
          })
        }
      }

      // Map customers
      if (customersRes.data) {
        for (const customer of customersRes.data) {
          results.push({
            id: `customer-${customer.id}`,
            label: customer.full_name,
            description: customer.phone,
            icon: User,
            href: `/customers/${customer.id}`,
            group: 'לקוחות',
          })
        }
      }

      setDynamicResults(results)
    } catch {
      // Silently fail - static results still work
      setDynamicResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (query.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        searchDatabase(query)
      }, 250)
    } else {
      setDynamicResults([])
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [query, searchDatabase])

  // Filter static commands
  const filteredStatic = query.trim()
    ? allStaticCommands.filter(
        (c) =>
          c.label.includes(query) ||
          (c.description ?? '').includes(query) ||
          c.id.toLowerCase().includes(query.toLowerCase())
      )
    : allStaticCommands

  // Combine static + dynamic results
  const allItems = query.trim().length >= 2
    ? [...dynamicResults, ...filteredStatic]
    : filteredStatic

  // Group results with ordering
  const groupOrder: string[] = ['פעולות מהירות', 'עבודות', 'לקוחות', 'ניווט']
  const groups = allItems.reduce<Record<string, CommandItem[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = []
    acc[item.group].push(item)
    return acc
  }, {})

  const orderedGroupEntries = groupOrder
    .filter((g) => groups[g])
    .map((g) => [g, groups[g]] as const)

  const flatItems = orderedGroupEntries.flatMap(([, items]) => items)

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      setDynamicResults([])
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const selectItem = useCallback(
    (item: CommandItem) => {
      onClose()
      if (item.action) {
        item.action()
      } else if (item.href) {
        router.push(item.href)
      }
    },
    [onClose, router]
  )

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, flatItems.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const item = flatItems[activeIndex]
        if (item) selectItem(item)
      } else if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, flatItems, activeIndex, selectItem, onClose])

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return
    const activeEl = listRef.current.querySelector('[data-active="true"]')
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex])

  if (!open) return null

  let flatIndex = 0

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel - full-screen bottom sheet on mobile, floating on desktop */}
      <div className={cn(
        'absolute inset-x-0 bottom-0 rounded-t-2xl bg-surface-high border-t border-white/5',
        'md:relative md:inset-auto md:rounded-xl md:border md:border-white/5 md:max-w-lg md:w-full md:mx-auto md:top-[20vh]',
        'overflow-hidden shadow-2xl',
      )}>
        {/* Drag handle mobile */}
        <div className="flex justify-center pt-3 pb-0 md:hidden">
          <div className="w-8 h-1 rounded-full bg-outline-variant" />
        </div>

        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
          <Search size={16} className="text-outline shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="חפש עבודה, לקוח, או פעולה..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-outline outline-none"
          />
          {isSearching && (
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin shrink-0" />
          )}
          <kbd className="hidden md:flex items-center gap-1 text-[10px] text-outline bg-surface-highest rounded px-1.5 py-0.5">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="overflow-y-auto max-h-[60dvh] md:max-h-[50dvh] py-2">
          {flatItems.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-outline">
              {isSearching ? 'מחפש...' : `לא נמצאו תוצאות עבור "${query}"`}
            </div>
          ) : (
            orderedGroupEntries.map(([groupName, items]) => (
              <div key={groupName} className="mb-1">
                <div className="px-4 py-1.5">
                  <span className="text-[10px] font-semibold text-outline-variant uppercase tracking-wider">
                    {groupName}
                  </span>
                </div>
                {items.map((item) => {
                  const currentIndex = flatIndex++
                  const isActive = currentIndex === activeIndex

                  return (
                    <button
                      key={item.id}
                      type="button"
                      data-active={isActive}
                      onClick={() => selectItem(item)}
                      onMouseEnter={() => setActiveIndex(currentIndex)}
                      className={cn(
                        'flex items-center gap-3 w-full px-4 py-2.5 text-right transition-colors',
                        isActive ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
                      )}
                    >
                      <div className={cn(
                        'flex items-center justify-center w-7 h-7 rounded-[6px] shrink-0 transition-colors',
                        isActive ? 'bg-primary-container/20 text-primary' : 'bg-surface-highest text-outline'
                      )}>
                        <item.icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-sm font-medium truncate', isActive ? 'text-on-surface' : 'text-on-surface-variant')}>
                          {item.label}
                        </p>
                        {item.description && (
                          <p className="text-xs text-outline truncate">{item.description}</p>
                        )}
                      </div>
                      {isActive && (
                        <ArrowRight size={14} className="text-primary shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-white/5">
          <span className="text-[10px] text-outline-variant">↑↓ ניווט</span>
          <span className="text-[10px] text-outline-variant">↵ בחר</span>
          <span className="text-[10px] text-outline-variant">ESC סגור</span>
        </div>
      </div>
    </div>
  )
}

// ─── Exported component ───────────────────────────────

const emptySubscribe = () => () => {}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false)

  // Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  // Listen for custom open event (from topbar search button)
  useEffect(() => {
    const handleOpen = () => setOpen(true)
    window.addEventListener(COMMAND_PALETTE_OPEN_EVENT, handleOpen)
    return () => window.removeEventListener(COMMAND_PALETTE_OPEN_EVENT, handleOpen)
  }, [])

  if (!mounted) return null

  return createPortal(
    <CommandPaletteContent open={open} onClose={() => setOpen(false)} />,
    document.body
  )
}
