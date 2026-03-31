'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ShareStatusButtonProps {
  orderId: string
}

export function ShareStatusButton({ orderId }: ShareStatusButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const url = `${window.location.origin}/status/${orderId}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = url
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Button variant="default" size="sm" onClick={handleCopy}>
      {copied ? (
        <>
          <Check size={14} className="text-success" />
          <span className="hidden md:inline">הועתק!</span>
        </>
      ) : (
        <>
          <Share2 size={14} className="text-primary" />
          <span className="hidden md:inline">שתף קישור סטטוס</span>
        </>
      )}
    </Button>
  )
}
