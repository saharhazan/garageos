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
  { href: '/dashboard', icon: LayoutDashboard, label: 'דשבורד' },
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
    return pathname.startsWith(href)
  }

  return (
    <nav
      className={cn(
        'fixed bottom-0 inset-x-0 z-40 bg-[#111113] border-t border-[#27272a]',
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
                className="flex items-center justify-center w-11 h-11 rounded-full bg-[#3b82f6] shadow-lg shadow-blue-500/20 active:bg-[#2563eb] transition-colors"
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
                <span className="absolute top-1 w-1 h-1 rounded-full bg-[#3b82f6]" />
              )}
              <item.icon
                size={20}
                className={cn(
                  'transition-colors',
                  active ? 'text-[#3b82f6]' : 'text-[#52525b]'
                )}
              />
              {item.label && (
                <span
                  className={cn(
                    'text-[10px] font-medium leading-none transition-colors',
                    active ? 'text-[#3b82f6]' : 'text-[#52525b]'
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
