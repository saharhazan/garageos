'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})

  function validate() {
    const errors: { email?: string; password?: string } = {}
    if (!email.trim()) errors.email = 'שדה חובה'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'כתובת אימייל לא תקינה'
    if (!password) errors.password = 'שדה חובה'
    else if (password.length < 6) errors.password = 'הסיסמה חייבת להכיל לפחות 6 תווים'
    return errors
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setLoading(true)
    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (authError) {
        setError('אימייל או סיסמה שגויים')
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('אירעה שגיאה. נסה שוב.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl bg-surface-high p-6 border border-white/5">
      <div className="mb-6">
        <h1 className="text-lg font-black text-on-surface tracking-tight">כניסה למערכת</h1>
        <p className="text-sm text-on-surface-variant mt-1">ברוך הבא חזרה</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          type="email"
          label="אימייל"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }))
          }}
          error={fieldErrors.email}
          autoComplete="email"
          inputMode="email"
          dir="ltr"
        />

        <Input
          type="password"
          label="סיסמה"
          placeholder="••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }))
          }}
          error={fieldErrors.password}
          autoComplete="current-password"
          dir="ltr"
        />

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-xs text-on-surface-variant hover:text-primary transition-colors"
          >
            שכחתי סיסמה
          </Link>
        </div>

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
          כניסה
        </Button>

        <div className="relative flex items-center gap-3 py-1">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-xs text-on-surface-variant">או</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        <Button
          type="button"
          variant="default"
          size="lg"
          className="w-full"
          onClick={() => router.push('/verify')}
        >
          כניסה עם SMS
        </Button>

        <p className="text-center text-xs text-on-surface-variant pt-2">
          אין לך חשבון?{' '}
          <Link href="/signup" className="text-primary hover:underline font-bold">
            הרשמה
          </Link>
        </p>
      </form>
    </div>
  )
}
