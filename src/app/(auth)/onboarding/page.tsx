'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Plan = 'starter' | 'pro' | 'enterprise'

const plans: { id: Plan; name: string; price: string; features: string[] }[] = [
  {
    id: 'starter',
    name: 'Free',
    price: 'חינם',
    features: ['משתמש אחד', 'עד 50 הזמנות בחודש', 'ניהול לקוחות בסיסי'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₪149/חודש',
    features: ['עד 5 משתמשים', 'הזמנות ללא הגבלה', 'התראות SMS ו-WhatsApp', 'דוחות מתקדמים'],
  },
  {
    id: 'enterprise',
    name: 'Business',
    price: '₪399/חודש',
    features: ['עד 15 משתמשים', 'עד 3 סניפים', 'API מלא', 'תמיכה עדיפה', 'התאמה אישית'],
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 1 fields
  const [garageName, setGarageName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ garage_name?: string }>({})

  // Step 2
  const [selectedPlan, setSelectedPlan] = useState<Plan>('starter')

  function validateStep1() {
    const errors: { garage_name?: string } = {}
    if (!garageName.trim()) errors.garage_name = 'שדה חובה'
    return errors
  }

  function handleNext() {
    if (step === 1) {
      const errors = validateStep1()
      setFieldErrors(errors)
      if (Object.keys(errors).length > 0) return
    }
    setStep((s) => s + 1)
  }

  function handleBack() {
    setStep((s) => s - 1)
  }

  async function handleComplete() {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          garage_name: garageName.trim(),
          address: address.trim() || null,
          phone: phone.trim() || null,
          plan: selectedPlan,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'אירעה שגיאה')
        return
      }

      setStep(3)
    } catch {
      setError('אירעה שגיאה. נסה שוב.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-[#27272a] bg-[#18181b] p-6">
      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              s <= step ? 'bg-[#3b82f6]' : 'bg-[#27272a]'
            }`}
          />
        ))}
      </div>

      {/* Step 1: Garage Details */}
      {step === 1 && (
        <>
          <div className="mb-6">
            <h1 className="text-lg font-semibold text-[#fafafa]">פרטי המוסך</h1>
            <p className="text-sm text-[#71717a] mt-1">ספר לנו על המוסך שלך</p>
          </div>

          <div className="space-y-4">
            <Input
              type="text"
              label="שם המוסך"
              placeholder="מוסך ישראל"
              value={garageName}
              onChange={(e) => {
                setGarageName(e.target.value)
                if (fieldErrors.garage_name) setFieldErrors({})
              }}
              error={fieldErrors.garage_name}
              autoComplete="organization"
            />

            <Input
              type="text"
              label="כתובת"
              placeholder="רחוב הרצל 1, תל אביב"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              autoComplete="street-address"
            />

            <Input
              type="tel"
              label="טלפון המוסך"
              placeholder="03-1234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              inputMode="tel"
              dir="ltr"
            />

            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleNext}
            >
              המשך
            </Button>
          </div>
        </>
      )}

      {/* Step 2: Select Plan */}
      {step === 2 && (
        <>
          <div className="mb-6">
            <h1 className="text-lg font-semibold text-[#fafafa]">בחירת מסלול</h1>
            <p className="text-sm text-[#71717a] mt-1">בחר את המסלול המתאים לך</p>
          </div>

          <div className="space-y-3 mb-6">
            {plans.map((plan) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlan(plan.id)}
                className={`w-full rounded-lg border p-4 text-right transition-all ${
                  selectedPlan === plan.id
                    ? 'border-[#3b82f6] bg-[#3b82f6]/5'
                    : 'border-[#27272a] bg-[#09090b] hover:border-[#3f3f46]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[#fafafa]">{plan.name}</span>
                  <span className="text-sm font-medium text-[#3b82f6]">{plan.price}</span>
                </div>
                <ul className="space-y-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="text-xs text-[#71717a] flex items-center gap-1.5">
                      <span className="text-[#3b82f6]">&#10003;</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>

          {error && (
            <div className="rounded-[6px] border border-red-500/20 bg-red-500/10 px-3 py-2 mb-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="default"
              size="lg"
              className="flex-1"
              onClick={handleBack}
            >
              חזרה
            </Button>
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="flex-1"
              loading={loading}
              onClick={handleComplete}
            >
              סיום הרשמה
            </Button>
          </div>
        </>
      )}

      {/* Step 3: Success */}
      {step === 3 && (
        <div className="text-center py-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#3b82f6]/10 mx-auto mb-4">
            <svg
              className="w-7 h-7 text-[#3b82f6]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-[#fafafa] mb-2">המוסך שלך מוכן!</h1>
          <p className="text-sm text-[#71717a] mb-6">
            הכל מוכן. אפשר להתחיל לנהל את המוסך.
          </p>
          <Button
            type="button"
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => {
              router.push('/dashboard')
              router.refresh()
            }}
          >
            כניסה ללוח הבקרה
          </Button>
        </div>
      )}
    </div>
  )
}
