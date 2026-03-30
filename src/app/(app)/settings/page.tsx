'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  LogOut, User, Bell, Building2, Shield, CreditCard,
  ChevronLeft, Save, Loader2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Topbar } from '@/components/layout/topbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type SettingsView = 'main' | 'profile' | 'notifications' | 'security' | 'garage' | 'billing'

export default function SettingsPage() {
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)
  const [view, setView] = useState<SettingsView>('main')

  async function handleSignOut() {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    localStorage.removeItem('selected_garage_id')
    router.push('/login')
  }

  if (view !== 'main') {
    return (
      <div className="min-h-full">
        <Topbar
          title={
            view === 'profile' ? 'פרופיל' :
            view === 'notifications' ? 'התראות' :
            view === 'security' ? 'אבטחה' :
            view === 'garage' ? 'פרטי המוסך' :
            'מנוי וחיוב'
          }
        />
        <div className="px-4 py-4 max-w-lg mx-auto">
          <button
            onClick={() => setView('main')}
            className="flex items-center gap-1 text-xs text-[#52525b] hover:text-[#a1a1aa] transition-colors mb-4"
          >
            <ChevronLeft size={14} />
            חזרה להגדרות
          </button>

          {view === 'profile' && <ProfileForm />}
          {view === 'notifications' && <NotificationSettings />}
          {view === 'security' && <SecurityForm />}
          {view === 'garage' && <GarageForm />}
          {view === 'billing' && <BillingSection />}
        </div>
      </div>
    )
  }

  const sections = [
    {
      title: 'חשבון',
      items: [
        { icon: User, label: 'פרופיל', description: 'עדכן שם, תפקיד ותמונה', view: 'profile' as SettingsView },
        { icon: Bell, label: 'התראות', description: 'הגדרות SMS ו-WhatsApp', view: 'notifications' as SettingsView },
        { icon: Shield, label: 'אבטחה', description: 'שנה סיסמה', view: 'security' as SettingsView },
      ],
    },
    {
      title: 'מוסך',
      items: [
        { icon: Building2, label: 'פרטי המוסך', description: 'שם, כתובת, טלפון', view: 'garage' as SettingsView },
        { icon: CreditCard, label: 'מנוי וחיוב', description: 'נהל את המנוי שלך', view: 'billing' as SettingsView },
      ],
    },
  ]

  return (
    <div className="min-h-full">
      <Topbar title="הגדרות" />

      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="text-xs font-semibold text-[#3f3f46] uppercase tracking-wider mb-2 px-1">
              {section.title}
            </p>
            <div className="rounded-xl border border-[#27272a] overflow-hidden divide-y divide-[#27272a]">
              {section.items.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setView(item.view)}
                  className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/[0.02] transition-colors text-right"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-[8px] bg-[#27272a] shrink-0">
                    <item.icon size={15} className="text-[#71717a]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#fafafa]">{item.label}</p>
                    <p className="text-xs text-[#52525b] mt-0.5">{item.description}</p>
                  </div>
                  <ChevronLeft size={14} className="text-[#3f3f46] shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Sign out */}
        <div className="rounded-xl border border-[#27272a] overflow-hidden">
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/[0.02] transition-colors text-right"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-[8px] bg-red-500/10 shrink-0">
              {signingOut ? (
                <Loader2 size={15} className="text-red-400 animate-spin" />
              ) : (
                <LogOut size={15} className="text-red-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-400">התנתק</p>
              <p className="text-xs text-[#52525b] mt-0.5">צא מהמערכת</p>
            </div>
          </button>
        </div>

        <p className="text-center text-xs text-[#3f3f46] pt-2">
          GarageOS v0.1.0
        </p>
      </div>
    </div>
  )
}

// ─── Profile Form ──────────────────────────────────────
function ProfileForm() {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const garageId = localStorage.getItem('selected_garage_id')
      if (!garageId) return
      const { data } = await supabase
        .from('users')
        .select('full_name, phone')
        .eq('id', user.id)
        .eq('garage_id', garageId)
        .single()
      if (data) {
        setFullName(data.full_name ?? '')
        setPhone(data.phone ?? '')
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    const res = await fetch('/api/settings/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: fullName, phone }),
    })
    setSaving(false)
    if (res.ok) setSaved(true)
  }

  if (loading) return <FormSkeleton />

  return (
    <div className="space-y-4">
      <Input label="שם מלא" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      <Input label="טלפון" value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" inputMode="tel" />
      <Button variant="primary" size="lg" className="w-full" onClick={handleSave} loading={saving}>
        <Save size={14} />
        {saved ? 'נשמר!' : 'שמור שינויים'}
      </Button>
    </div>
  )
}

// ─── Notification Settings ─────────────────────────────
function NotificationSettings() {
  const [settings, setSettings] = useState({
    sms_enabled: false,
    whatsapp_enabled: false,
    auto_notify_on_status_change: false,
  })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const garageId = localStorage.getItem('selected_garage_id')
      if (!garageId) return
      const { data } = await supabase
        .from('garages')
        .select('settings')
        .eq('id', garageId)
        .single()
      if (data?.settings) {
        setSettings({
          sms_enabled: data.settings.sms_enabled ?? false,
          whatsapp_enabled: data.settings.whatsapp_enabled ?? false,
          auto_notify_on_status_change: data.settings.auto_notify_on_status_change ?? false,
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave() {
    setSaving(true)
    await fetch('/api/settings/garage', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings }),
    })
    setSaving(false)
  }

  if (loading) return <FormSkeleton />

  const toggles = [
    { key: 'sms_enabled' as const, label: 'הודעות SMS', desc: 'שלח SMS ללקוח על שינוי סטטוס' },
    { key: 'whatsapp_enabled' as const, label: 'הודעות WhatsApp', desc: 'שלח WhatsApp ללקוח על שינוי סטטוס' },
    { key: 'auto_notify_on_status_change' as const, label: 'התראה אוטומטית', desc: 'שלח הודעה אוטומטית בכל שינוי סטטוס' },
  ]

  return (
    <div className="space-y-3">
      {toggles.map((t) => (
        <div key={t.key} className="flex items-center justify-between rounded-xl border border-[#27272a] px-4 py-3">
          <div>
            <p className="text-sm font-medium text-[#fafafa]">{t.label}</p>
            <p className="text-xs text-[#52525b] mt-0.5">{t.desc}</p>
          </div>
          <button
            onClick={() => setSettings((s) => ({ ...s, [t.key]: !s[t.key] }))}
            className={`relative w-10 h-5 rounded-full transition-colors ${
              settings[t.key] ? 'bg-[#3b82f6]' : 'bg-[#27272a]'
            }`}
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
              settings[t.key] ? 'right-0.5' : 'right-5'
            }`} />
          </button>
        </div>
      ))}
      <Button variant="primary" size="lg" className="w-full mt-4" onClick={handleSave} loading={saving}>
        <Save size={14} />
        שמור
      </Button>
    </div>
  )
}

// ─── Security Form ─────────────────────────────────────
function SecurityForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSave() {
    setError('')
    setSuccess(false)
    if (password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים')
      return
    }
    if (password !== confirmPassword) {
      setError('הסיסמאות לא תואמות')
      return
    }
    setSaving(true)
    const res = await fetch('/api/settings/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    setSaving(false)
    if (res.ok) {
      setSuccess(true)
      setPassword('')
      setConfirmPassword('')
    } else {
      setError('שגיאה בעדכון הסיסמה')
    }
  }

  return (
    <div className="space-y-4">
      <Input
        type="password"
        label="סיסמה חדשה"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        dir="ltr"
        autoComplete="new-password"
      />
      <Input
        type="password"
        label="אישור סיסמה"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        dir="ltr"
        autoComplete="new-password"
      />
      {error && (
        <div className="rounded-[6px] border border-red-500/20 bg-red-500/10 px-3 py-2">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
      {success && (
        <div className="rounded-[6px] border border-green-500/20 bg-green-500/10 px-3 py-2">
          <p className="text-sm text-green-400">הסיסמה עודכנה בהצלחה</p>
        </div>
      )}
      <Button variant="primary" size="lg" className="w-full" onClick={handleSave} loading={saving}>
        <Shield size={14} />
        עדכן סיסמה
      </Button>
    </div>
  )
}

// ─── Garage Form ───────────────────────────────────────
function GarageForm() {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [taxRate, setTaxRate] = useState('17')
  const [jobPrefix, setJobPrefix] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const garageId = localStorage.getItem('selected_garage_id')
      if (!garageId) return
      const { data } = await supabase.from('garages').select('*').eq('id', garageId).single()
      if (data) {
        setName(data.name ?? '')
        setAddress(data.address ?? '')
        setPhone(data.phone ?? '')
        setTaxRate(String(data.settings?.tax_rate ?? 17))
        setJobPrefix(data.settings?.job_prefix ?? '')
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave() {
    setSaving(true)
    await fetch('/api/settings/garage', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        address,
        phone,
        settings: {
          tax_rate: parseFloat(taxRate) || 17,
          job_prefix: jobPrefix,
        },
      }),
    })
    setSaving(false)
  }

  if (loading) return <FormSkeleton />

  return (
    <div className="space-y-4">
      <Input label="שם המוסך" value={name} onChange={(e) => setName(e.target.value)} />
      <Input label="כתובת" value={address} onChange={(e) => setAddress(e.target.value)} />
      <Input label="טלפון" value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" inputMode="tel" />
      <div className="grid grid-cols-2 gap-3">
        <Input label="אחוז מע״מ" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} dir="ltr" inputMode="decimal" />
        <Input label="קידומת עבודה" value={jobPrefix} onChange={(e) => setJobPrefix(e.target.value)} dir="ltr" placeholder="AK" />
      </div>
      <Button variant="primary" size="lg" className="w-full" onClick={handleSave} loading={saving}>
        <Save size={14} />
        שמור
      </Button>
    </div>
  )
}

// ─── Billing Section ───────────────────────────────────
function BillingSection() {
  const [loading, setLoading] = useState(false)

  async function openPortal() {
    setLoading(true)
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    }
    setLoading(false)
  }

  const plans = [
    { name: 'חינם', price: '0₪', features: ['משתמש אחד', '50 עבודות לחודש', 'ניהול מלאי בסיסי'], plan: 'starter' },
    { name: 'פרו', price: '149₪', features: ['5 משתמשים', 'עבודות ללא הגבלה', 'SMS + WhatsApp', 'דוחות מתקדמים'], plan: 'pro' },
    { name: 'עסקי', price: '349₪', features: ['15 משתמשים', '3 מוסכים', 'API גישה', 'תמיכה מועדפת'], plan: 'business' },
  ]

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {plans.map((p) => (
          <div key={p.plan} className="rounded-xl border border-[#27272a] p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-[#fafafa]">{p.name}</h3>
              <span className="text-sm font-bold text-[#3b82f6]">{p.price}/חודש</span>
            </div>
            <ul className="space-y-1">
              {p.features.map((f) => (
                <li key={f} className="text-xs text-[#52525b]">• {f}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <Button variant="default" size="lg" className="w-full" onClick={openPortal} loading={loading}>
        <CreditCard size={14} />
        ניהול מנוי ותשלום
      </Button>
    </div>
  )
}

// ─── Shared Loading Skeleton ───────────────────────────
function FormSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i}>
          <div className="h-3 w-16 bg-[#27272a] rounded mb-2" />
          <div className="h-10 bg-[#27272a] rounded-[6px]" />
        </div>
      ))}
    </div>
  )
}
