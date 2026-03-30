'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const RESEND_SECONDS = 60

export default function VerifyPage() {
  const router = useRouter()
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(RESEND_SECONDS)
  const [resending, setResending] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const submitOtp = useCallback(
    async (code: string) => {
      setLoading(true)
      setError('')
      try {
        const supabase = createClient()
        // Phone is typically passed via search params or state
        const phone = new URLSearchParams(window.location.search).get('phone') ?? ''
        const { error: verifyError } = await supabase.auth.verifyOtp({
          phone,
          token: code,
          type: 'sms',
        })
        if (verifyError) {
          setError('הקוד שגוי או פג תוקף. נסה שוב.')
          setDigits(['', '', '', '', '', ''])
          inputRefs.current[0]?.focus()
        } else {
          router.push('/select-garage')
        }
      } catch {
        setError('אירעה שגיאה. נסה שוב.')
      } finally {
        setLoading(false)
      }
    },
    [router]
  )

  function handleChange(index: number, value: string) {
    // Handle paste
    if (value.length > 1) {
      const pastedDigits = value.replace(/\D/g, '').slice(0, 6).split('')
      const newDigits = [...digits]
      pastedDigits.forEach((d, i) => {
        if (index + i < 6) newDigits[index + i] = d
      })
      setDigits(newDigits)
      const nextIndex = Math.min(index + pastedDigits.length, 5)
      inputRefs.current[nextIndex]?.focus()
      if (newDigits.every((d) => d !== '') && newDigits.join('').length === 6) {
        submitOtp(newDigits.join(''))
      }
      return
    }

    const digit = value.replace(/\D/g, '').slice(-1)
    const newDigits = [...digits]
    newDigits[index] = digit
    setDigits(newDigits)

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    if (newDigits.every((d) => d !== '')) {
      submitOtp(newDigits.join(''))
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const newDigits = [...digits]
        newDigits[index] = ''
        setDigits(newDigits)
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus()
        const newDigits = [...digits]
        newDigits[index - 1] = ''
        setDigits(newDigits)
      }
    } else if (e.key === 'ArrowRight' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowLeft' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  async function handleResend() {
    if (countdown > 0 || resending) return
    setResending(true)
    setError('')
    try {
      const phone = new URLSearchParams(window.location.search).get('phone') ?? ''
      const supabase = createClient()
      await supabase.auth.signInWithOtp({ phone })
      setCountdown(RESEND_SECONDS)
      setDigits(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch {
      setError('לא הצלחנו לשלוח קוד חדש')
    } finally {
      setResending(false)
    }
  }

  const phone = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('phone') ?? ''
    : ''

  return (
    <div className="rounded-xl border border-white/5 bg-surface-high p-6">
      <div className="mb-6 text-center">
        <h1 className="text-lg font-semibold text-on-surface">אימות מספר טלפון</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          {phone
            ? `שלחנו קוד אימות ל-${phone}`
            : 'הזן את קוד האימות שנשלח אליך'}
        </p>
      </div>

      {/* OTP boxes */}
      <div className="flex justify-center gap-2 mb-6" dir="ltr">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onFocus={(e) => e.target.select()}
            className={cn(
              'w-11 h-12 text-center text-lg font-semibold rounded-[6px] border bg-surface-lowest text-on-surface',
              'outline-none transition-all',
              digit
                ? 'border-primary/40 ring-2 ring-blue-500/10'
                : 'border-white/5',
              'focus:border-primary/40 focus:ring-2 focus:ring-primary/10',
            )}
            disabled={loading}
            autoFocus={index === 0}
          />
        ))}
      </div>

      {error && (
        <div className="rounded-[6px] border border-error/20 bg-error/10 px-3 py-2 mb-4">
          <p className="text-sm text-error text-center">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex justify-center mb-4">
          <p className="text-sm text-on-surface-variant">מאמת...</p>
        </div>
      )}

      {/* Resend */}
      <div className="text-center">
        {countdown > 0 ? (
          <p className="text-sm text-outline">
            שליחה מחדש בעוד {countdown} שניות
          </p>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResend}
            loading={resending}
          >
            שלח קוד מחדש
          </Button>
        )}
      </div>
    </div>
  )
}
