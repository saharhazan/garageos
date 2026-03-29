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
    <div className="rounded-xl border border-[#27272a] bg-[#18181b] p-6">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-[#fafafa]">כניסה למערכת</h1>
        <p className="text-sm text-[#71717a] mt-1">ברוך הבא חזרה</p>
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
            className="text-xs text-[#52525b] hover:text-[#a1a1aa] transition-colors"
          >
            שכחתי סיסמה
          </Link>
        </div>

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
          כניסה
        </Button>

        <div className="relative flex items-center gap-3 py-1">
          <div className="flex-1 h-px bg-[#27272a]" />
          <span className="text-xs text-[#52525b]">או</span>
          <div className="flex-1 h-px bg-[#27272a]" />
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
      </form>
    </div>
  )
}
