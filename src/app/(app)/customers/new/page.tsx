'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Topbar } from '@/components/layout/topbar'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth-context'

export default function NewCustomerPage() {
  const router = useRouter()
  const { garageId } = useAuth()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  function validate() {
    const errs: Record<string, string> = {}
    if (!fullName.trim()) errs.fullName = 'שדה חובה'
    if (!phone.trim()) errs.phone = 'שדה חובה'
    return errs
  }

  async function handleSave() {
    const errs = validate()
    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || null,
          notes: notes.trim() || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'שגיאה ביצירת לקוח')
        return
      }

      const { data } = await res.json()
      router.push(`/customers/${data.id}`)
    } catch {
      setError('אירעה שגיאה. נסה שוב.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-full">
      <Topbar title="לקוח חדש" backHref="/customers" />

      <div className="px-4 py-5 max-w-lg mx-auto space-y-6">
        {error && (
          <div className="rounded-md bg-error/10 border border-error/20 px-3 py-2">
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        <Input
          label="שם מלא *"
          placeholder="ישראל ישראלי"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={fieldErrors.fullName}
        />

        <Input
          label="טלפון *"
          placeholder="050-0000000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={fieldErrors.phone}
          type="tel"
          dir="ltr"
          inputMode="tel"
        />

        <Input
          label="אימייל"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          dir="ltr"
        />

        <Textarea
          label="הערות"
          placeholder="הערות על הלקוח..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleSave}
          loading={saving}
        >
          שמור לקוח
        </Button>
      </div>
    </div>
  )
}
