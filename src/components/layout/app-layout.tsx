'use client'

import { cn } from '@/lib/utils'
import { Sidebar } from './sidebar'
import { MobileNav } from './mobile-nav'

interface AppLayoutProps {
  children: React.ReactNode
  className?: string
  userName?: string
  userRole?: string
}

export function AppLayout({ children, className, userName, userRole }: AppLayoutProps) {
  return (
    <div className={cn('flex h-dvh bg-surface', className)}>
      {/* Desktop Sidebar - hidden on mobile */}
      <Sidebar
        className="hidden md:flex"
        userName={userName}
        userRole={userRole}
      />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 min-w-0">
        {children}
      </main>

      {/* Mobile bottom nav - hidden on desktop */}
      <MobileNav className="md:hidden" />
    </div>
  )
}
