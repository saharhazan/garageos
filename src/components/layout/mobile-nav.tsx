'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Wrench, Plus, Users, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileNavItem {
  href: string
  icon: React.ElementType
  label: string
  isMain?: boolean
}

const mobileNavItems: MobileNavItem[] = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'לוח בקרה' },
  { href: '/orders', icon: Wrench, label: 'עבודות' },
  { href: '/orders/new', icon: Plus, label: '', isMain: true },
  { href: '/customers', icon: Users, label: 'לקוחות' },
  { href: '/settings', icon: Settings, label: 'הגדרות' },
]

interface MobileNavProps {
  className?: string
}

export function MobileNav({ className }: MobileNavProps) {
  const pathname = usePathname()

  const isActive = (href: string, isMain?: boolean) => {
    if (isMain) return false
    if (href === '/dashboard') return pathname === '/dashboard'
    // For /orders, match /orders but NOT /orders/new
    if (href === '/orders') return pathname === '/orders' || (pathname.startsWith('/orders/') && pathname !== '/orders/new')
    return pathname.startsWith(href)
  }

  return (
    <nav
      className={cn(
        'fixed bottom-0 inset-x-0 z-40 bg-surface border-t border-white/5',
        className
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around px-2 h-14">
        {mobileNavItems.map((item) => {
          const active = isActive(item.href, item.isMain)

          if (item.isMain) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-center w-11 h-11 rounded-full bg-secondary-container shadow-[0_0_16px_rgba(232,114,12,0.3)] active:scale-95 transition-all"
                aria-label="עבודה חדשה"
              >
                <item.icon size={20} className="text-white" />
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] justify-center relative"
            >
              {active && (
                <span className="absolute top-1 w-1 h-1 rounded-full bg-primary" />
              )}
              <item.icon
                size={20}
                className={cn(
                  'transition-colors',
                  active ? 'text-primary' : 'text-on-surface-variant/50'
                )}
              />
              {item.label && (
                <span
                  className={cn(
                    'text-[10px] font-bold leading-none transition-colors',
                    active ? 'text-primary' : 'text-on-surface-variant/50'
                  )}
                >
                  {item.label}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
