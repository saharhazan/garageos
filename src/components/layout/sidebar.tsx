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
      { href: '/dashboard', icon: LayoutDashboard, label: 'לוח בקרה' },
      { href: '/orders', icon: Wrench, label: 'עבודות' },
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

  return (
    <aside
      className={cn(
        'flex flex-col w-64 shrink-0 h-dvh bg-surface shadow-[0_0_24px_rgba(232,114,12,0.08)]',
        className
      )}
    >
      {/* Logo + Profile */}
      <div className="flex items-center justify-between px-4 pt-6 pb-4">
        <div className="flex items-center gap-2.5 flex-row-reverse">
          <img src="/logo.png" alt="" className="w-9 h-9 object-contain" />
          <span className="text-lg font-black text-brand uppercase tracking-tighter">
            GarageOS
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-surface-highest shrink-0">
          <div className="w-full h-full flex items-center justify-center text-on-surface-variant text-sm font-bold">
            {userName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>
        </div>
      </div>
      <div className="px-4 pb-4">
        <p className="text-xs text-outline">ניהול מוסך מתקדם</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-3">
        {navItems.map((section) => (
          <div key={section.section} className="mb-4">
            <div className="px-3 py-1 mb-1">
              <span className="text-[10px] font-bold text-outline-variant uppercase tracking-wider">
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
                    'flex items-center gap-3 h-10 px-3 rounded-md text-sm font-bold transition-all mb-0.5',
                    active
                      ? 'bg-primary-container text-white shadow-inner'
                      : 'text-on-surface-variant/60 hover:bg-surface-low hover:text-on-surface'
                  )}
                >
                  <item.icon
                    size={18}
                    className="shrink-0"
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom CTA */}
      <div className="p-3">
        <Link
          href="/orders/new"
          className="flex items-center justify-center gap-2 w-full bg-secondary-container text-white py-3.5 rounded-xl font-black machined-button hover:brightness-110 active:scale-95 transition-all"
        >
          <Plus size={18} />
          <span>הוסף כרטיס עבודה</span>
        </Link>
      </div>

      {/* Footer: user info + settings */}
      <div className="p-3 pt-0">
        <div className="flex items-center gap-2.5">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-on-surface truncate">{userName}</p>
            <p className="text-[10px] text-outline truncate">{userRole}</p>
          </div>
          <Link
            href="/settings"
            className="shrink-0 p-1.5 rounded-md text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-low transition-colors"
          >
            <Settings size={16} />
          </Link>
        </div>
      </div>
    </aside>
  )
}
