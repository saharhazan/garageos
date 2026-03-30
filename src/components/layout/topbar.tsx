'use client'

import Link from 'next/link'
import { ChevronRight, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TopbarProps {
  title: string
  actions?: React.ReactNode
  backHref?: string
  className?: string
}

export function Topbar({ title, actions, backHref, className }: TopbarProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex items-center h-12 px-4 border-b border-white/5 bg-surface/80 backdrop-blur-md',
        className
      )}
    >
      {/* Right side: back button or title */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {backHref && (
          <Link
            href={backHref}
            className="flex items-center justify-center w-7 h-7 -mr-1 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors md:hidden"
          >
            <ChevronRight size={16} />
          </Link>
        )}
        <h1 className="text-sm font-bold text-on-surface truncate">{title}</h1>
      </div>

      {/* Left side: actions + notifications */}
      <div className="flex items-center gap-1 shrink-0">
        {actions}
        <button
          className="flex items-center justify-center w-8 h-8 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors relative"
          aria-label="התראות"
        >
          <Bell size={16} />
        </button>
      </div>
    </header>
  )
}
