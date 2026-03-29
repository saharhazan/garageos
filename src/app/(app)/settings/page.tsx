'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, User, Bell, Building2, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Topbar } from '@/components/layout/topbar'
import { Button } from '@/components/ui/button'

interface SettingRowProps {
  icon: React.ElementType
  label: string
  description?: string
  onClick?: () => void
  destructive?: boolean
}

function SettingRow({ icon: Icon, label, description, onClick, destructive }: SettingRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/[0.02] transition-colors text-right"
    >
      <div className={`flex items-center justify-center w-8 h-8 rounded-[8px] shrink-0 ${
        destructive ? 'bg-red-500/10' : 'bg-[#27272a]'
      }`}>
        <Icon size={15} className={destructive ? 'text-red-400' : 'text-[#71717a]'} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${destructive ? 'text-red-400' : 'text-[#fafafa]'}`}>
          {label}
        </p>
        {description && (
          <p className="text-xs text-[#52525b] mt-0.5">{description}</p>
        )}
      </div>
    </button>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    localStorage.removeItem('selected_garage_id')
    router.push('/login')
  }

  const sections = [
    {
      title: 'חשבון',
      items: [
        { icon: User, label: 'פרופיל', description: 'עדכן שם, תפקיד ותמונה' },
        { icon: Bell, label: 'התראות', description: 'הגדרות SMS ו-WhatsApp' },
        { icon: Shield, label: 'אבטחה', description: 'שנה סיסמה ואימות דו-שלבי' },
      ],
    },
    {
      title: 'מוסך',
      items: [
        { icon: Building2, label: 'פרטי המוסך', description: 'שם, כתובת, טלפון' },
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
                <SettingRow
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  description={item.description}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Sign out */}
        <div className="rounded-xl border border-[#27272a] overflow-hidden">
          <SettingRow
            icon={LogOut}
            label="התנתק"
            description="צא מהמערכת"
            onClick={handleSignOut}
            destructive
          />
        </div>

        {/* Version */}
        <p className="text-center text-xs text-[#3f3f46] pt-2">
          GarageOS v0.1.0
        </p>
      </div>
    </div>
  )
}
