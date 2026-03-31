'use client'

import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PrintButtonProps {
  label?: string
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'ghost' | 'primary' | 'teal'
}

export function PrintButton({ label = 'הדפס', size = 'sm', variant = 'default' }: PrintButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => window.print()}
      className="no-print"
    >
      <Printer size={14} />
      <span className="hidden md:inline">{label}</span>
    </Button>
  )
}
