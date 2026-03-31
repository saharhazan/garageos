'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [fieldError, setFieldError] = useState('')

  function validate(): string {
    if (!email.trim()) return 'שדה חובה'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'כתובת אימייל לא תקינה'
    return ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const err = validate()
    setFieldError(err)
    if (err) return

    setLoading(true)
    try {
      const supabase = createClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (resetError) {
        setError('אירעה שגיאה. נסה שוב.')
        return
      }

      setSent(true)
    } catch {
      setError('אירעה שגיאה. נסה שוב.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="rounded-xl bg-surface-high p-6 border border-white/5">
        <div className="mb-6">
          <h1 className="text-lg font-black text-on-surface tracking-tight">איפוס סיסמה</h1>
        </div>

        <div className="rounded-md bg-primary/10 border border-primary/20 px-4 py-3 mb-6">
          <p className="text-sm text-on-surface leading-relaxed">
            אם הכתובת קיימת במערכת, נשלח אליה קישור לאיפוס סיסמה
          </p>
        </div>

        <Link href="/login">
          <Button variant="default" size="lg" className="w-full">
            חזרה לכניסה
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-surface-high p-6 border border-white/5">
      <div className="mb-6">
        <h1 className="text-lg font-black text-on-surface tracking-tight">שכחתי סיסמה</h1>
        <p className="text-sm text-on-surface-variant mt-1">הזן את כתובת האימייל שלך ונשלח לך קישור לאיפוס</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          type="email"
          label="אימייל"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (fieldError) setFieldError('')
          }}
          error={fieldError}
          autoComplete="email"
          inputMode="email"
          dir="ltr"
        />

        {error && (
          <div className="rounded-md bg-error-container/20 border border-error/20 px-3 py-2">
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          className="w-full"
        >
          שלח קישור לאיפוס
        </Button>

        <p className="text-center text-xs text-on-surface-variant pt-2">
          <Link href="/login" className="text-primary hover:underline font-bold">
            חזרה לכניסה
          </Link>
        </p>
      </form>
    </div>
  )
}
