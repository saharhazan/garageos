'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Wrench,
  Plus,
  FileText,
  Users,
  Package,
  BarChart2,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  icon: React.ElementType
  label: string
  isAction?: boolean
}

interface NavSection {
  section: string
  items: NavItem[]
}

const navItems: NavSection[] = [
  {
    section: 'ניהול',
    items: [
      { href: '/dashboard', icon: LayoutDashboard, label: 'דשבורד' },
      { href: '/orders', icon: Wrench, label: 'עבודות' },
      { href: '/orders/new', icon: Plus, label: 'עבודה חדשה', isAction: true },
      { href: '/quotes', icon: FileText, label: 'הצעות מחיר' },
    ],
  },
  {
    section: 'CRM',
    items: [
      { href: '/customers', icon: Users, label: 'לקוחות' },
      { href: '/inventory', icon: Package, label: 'מלאי' },
    ],
  },
  {
    section: 'ניתוח',
    items: [
      { href: '/reports', icon: BarChart2, label: 'דוחות' },
    ],
  },
]

interface SidebarProps {
  className?: string
  userName?: string
  userRole?: string
}

export function Sidebar({ className, userName = 'משתמש', userRole = 'מנהל' }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <aside
      className={cn(
        'flex flex-col w-[216px] shrink-0 h-dvh bg-[#111113] border-l border-[#27272a]',
        className
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-12 border-b border-[#27272a]">
        <div className="flex items-center justify-center w-[22px] h-[22px] rounded-[4px] bg-[#3b82f6] shrink-0">
          <span className="text-white text-xs font-bold leading-none">G</span>
        </div>
        <span className="text-sm font-semibold text-[#fafafa]">GarageOS</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {navItems.map((section) => (
          <div key={section.section} className="mb-4">
            <div className="px-2 py-1 mb-1">
              <span className="text-[10px] font-semibold text-[#3f3f46] uppercase tracking-wider">
                {section.section}
              </span>
            </div>
            {section.items.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 h-8 px-2 rounded-[6px] text-sm transition-colors mb-0.5',
                    active
                      ? 'bg-white/[0.06] text-[#fafafa]'
                      : 'text-[#71717a] hover:bg-white/[0.04] hover:text-[#a1a1aa]'
                  )}
                >
                  <item.icon
                    size={15}
                    className={cn(
                      'shrink-0',
                      active ? 'text-[#fafafa]' : 'text-[#52525b]'
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#27272a] p-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#3b82f6]/20 shrink-0">
            <span className="text-xs font-semibold text-[#3b82f6]">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[#fafafa] truncate">{userName}</p>
            <p className="text-[10px] text-[#52525b] truncate">{userRole}</p>
          </div>
          <Link
            href="/settings"
            className="shrink-0 p-1 rounded-[4px] text-[#52525b] hover:text-[#a1a1aa] hover:bg-white/[0.04] transition-colors"
          >
            <Settings size={14} />
          </Link>
        </div>
      </div>
    </aside>
  )
}
