'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PenLine } from 'lucide-react'
import { SignaturePad } from '@/components/ui/signature-pad'
import { createClient } from '@/lib/supabase/client'
import type { OrderStatus } from '@/types'

interface SignatureSectionProps {
  orderId: string
  orderStatus: OrderStatus
  signatureUrl: string | null
}

export function SignatureSection({ orderId, orderStatus, signatureUrl }: SignatureSectionProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [savedUrl, setSavedUrl] = useState(signatureUrl)

  const canSign = orderStatus === 'ready' || orderStatus === 'delivered'

  if (!canSign) return null

  async function handleSave(dataUrl: string) {
    setSaving(true)
    setError('')

    try {
      // Convert data URL to blob
      const res = await fetch(dataUrl)
      const blob = await res.blob()

      // Upload to Supabase Storage
      const supabase = createClient()
      const fileName = `${orderId}-${Date.now()}.png`

      const { error: uploadError } = await supabase.storage
        .from('signatures')
        .upload(fileName, blob, {
          contentType: 'image/png',
          upsert: true,
        })

      if (uploadError) {
        throw new Error(uploadError.message)
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('signatures')
        .getPublicUrl(fileName)

      const publicUrl = urlData.publicUrl

      // Update order with signature URL
      const patchRes = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature_url: publicUrl }),
      })

      if (!patchRes.ok) {
        const result = await patchRes.json()
        throw new Error(result.error ?? 'שגיאה בשמירת חתימה')
      }

      setSavedUrl(publicUrl)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בשמירת חתימה')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-surface-high rounded-xl p-6 shadow-lg border border-white/5">
      <div className="flex items-center gap-2 justify-end mb-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">חתימת לקוח</span>
        <PenLine size={16} className="text-primary" />
      </div>

      {savedUrl ? (
        <div className="flex flex-col items-center gap-3">
          <div className="bg-white rounded-lg p-3 border border-outline-variant/20 w-full max-w-[500px]">
            <img
              src={savedUrl}
              alt="חתימת לקוח"
              className="w-full h-auto"
            />
          </div>
          <p className="text-xs text-on-surface-variant">החתימה נשמרה בהצלחה</p>
        </div>
      ) : (
        <>
          {saving ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                שומר חתימה...
              </div>
            </div>
          ) : (
            <SignaturePad onSave={handleSave} />
          )}
        </>
      )}

      {error && (
        <p className="text-xs text-error mt-2 text-center">{error}</p>
      )}
    </div>
  )
}
