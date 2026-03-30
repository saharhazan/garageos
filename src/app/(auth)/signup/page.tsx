'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{
    full_name?: string
    email?: string
    password?: string
  }>({})

  function validate() {
    const errors: { full_name?: string; email?: string; password?: string } = {}
    if (!fullName.trim()) errors.full_name = 'שדה חובה'
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
      const { error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim() || undefined,
          },
        },
      })

      if (authError) {
        setError(authError.message)
        return
      }

      router.push('/onboarding')
      router.refresh()
    } catch {
      setError('אירעה שגיאה. נסה שוב.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-[#27272a] bg-[#18181b] p-6">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-[#fafafa]">יצירת חשבון חדש</h1>
        <p className="text-sm text-[#71717a] mt-1">הצטרף ל-GarageOS וניהול המוסך שלך</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          type="text"
          label="שם מלא"
          placeholder="ישראל ישראלי"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value)
            if (fieldErrors.full_name) setFieldErrors((p) => ({ ...p, full_name: undefined }))
          }}
          error={fieldErrors.full_name}
          autoComplete="name"
        />

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
          autoComplete="new-password"
          dir="ltr"
        />

        <Input
          type="tel"
          label="טלפון (אופציונלי)"
          placeholder="050-1234567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
          inputMode="tel"
          dir="ltr"
        />

        {error && (
          <div className="rounded-[6px] border border-red-500/20 bg-red-500/10 px-3 py-2">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          className="w-full"
        >
          הרשמה
        </Button>

        <p className="text-center text-sm text-[#52525b]">
          כבר יש לך חשבון?{' '}
          <Link
            href="/login"
            className="text-[#3b82f6] hover:text-[#60a5fa] transition-colors"
          >
            התחבר
          </Link>
        </p>
      </form>
    </div>
  )
}
