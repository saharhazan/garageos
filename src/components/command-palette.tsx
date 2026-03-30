'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommandItem {
  id: string
  label: string
  description?: string
  icon: React.ElementType
  href?: string
  action?: () => void
  group: 'פעולות מהירות' | 'ניווט'
}

const navCommands: CommandItem[] = [
  { id: 'dashboard', label: 'דשבורד', icon: LayoutDashboard, href: '/dashboard', group: 'ניווט' },
  { id: 'orders', label: 'עבודות', icon: Wrench, href: '/orders', group: 'ניווט' },
  { id: 'new-order', label: 'עבודה חדשה', description: 'פתח טופס עבודה חדש', icon: Plus, href: '/orders/new', group: 'פעולות מהירות' },
  { id: 'quotes', label: 'הצעות מחיר', icon: FileText, href: '/quotes', group: 'ניווט' },
  { id: 'customers', label: 'לקוחות', icon: Users, href: '/customers', group: 'ניווט' },
  { id: 'inventory', label: 'מלאי', icon: Package, href: '/inventory', group: 'ניווט' },
  { id: 'reports', label: 'דוחות', icon: BarChart2, href: '/reports', group: 'ניווט' },
  { id: 'settings', label: 'הגדרות', icon: Settings, href: '/settings', group: 'ניווט' },
]

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

function CommandPaletteContent({ open, onClose }: CommandPaletteProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const filtered = query.trim()
    ? navCommands.filter(
        (c) =>
          c.label.includes(query) ||
          (c.description ?? '').includes(query) ||
          c.id.toLowerCase().includes(query.toLowerCase())
      )
    : navCommands

  // Group results
  const groups = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = []
    acc[item.group].push(item)
    return acc
  }, {})

  const flatItems = Object.values(groups).flat()

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
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

  if (!open) return null

  let flatIndex = 0

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel — full-screen bottom sheet on mobile, floating on desktop */}
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
            placeholder="חפש פעולה או עמוד..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-outline outline-none"
          />
          <kbd className="hidden md:flex items-center gap-1 text-[10px] text-outline bg-surface-highest rounded px-1.5 py-0.5">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="overflow-y-auto max-h-[60dvh] md:max-h-[50dvh] py-2">
          {flatItems.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-outline">
              לא נמצאו תוצאות עבור &quot;{query}&quot;
            </div>
          ) : (
            Object.entries(groups).map(([groupName, items]) => (
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

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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

  if (!mounted) return null

  return createPortal(
    <CommandPaletteContent open={open} onClose={() => setOpen(false)} />,
    document.body
  )
}
