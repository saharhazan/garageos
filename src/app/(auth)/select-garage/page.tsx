'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, MapPin, Wrench } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ROLE_LABELS } from '@/lib/utils'

interface GarageMembership {
  garage_id: string
  role: string
  garage: {
    id: string
    name: string
    address: string | null
    is_active: boolean
  }
  open_orders?: number
}

export default function SelectGaragePage() {
  const router = useRouter()
  const [memberships, setMemberships] = useState<GarageMembership[]>([])
  const [loading, setLoading] = useState(true)
  const [selecting, setSelecting] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('garage_users')
        .select('garage_id, role, garage:garages(id, name, address, is_active)')
        .eq('id', user.id)

      // Supabase returns joined relation as array - normalize to single object
      const normalized: GarageMembership[] = (data ?? []).map((row) => ({
        ...row,
        garage: Array.isArray(row.garage) ? row.garage[0] : row.garage,
      })) as GarageMembership[]

      if (normalized.length === 1) {
        handleSelect(normalized[0], true)
        return
      }

      setMemberships(normalized)
      setLoading(false)
    }
    load()
  }, [router])

  async function handleSelect(membership: GarageMembership, silent = false) {
    if (!silent) setSelecting(membership.garage_id)
    localStorage.setItem('selected_garage_id', membership.garage_id)
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-on-surface-variant">טוען...</p>
      </div>
    )
  }

  if (memberships.length === 0) {
    return (
      <div className="rounded-xl border border-white/5 bg-surface-high p-6 text-center">
        <Building2 size={32} className="text-outline-variant mx-auto mb-3" />
        <h2 className="text-sm font-semibold text-on-surface mb-1">אין מוסכים מקושרים</h2>
        <p className="text-xs text-on-surface-variant">פנה למנהל המערכת להוסיף אותך למוסך</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-lg font-semibold text-on-surface">בחר מוסך</h1>
        <p className="text-sm text-on-surface-variant mt-1">לאיזה מוסך ברצונך להיכנס?</p>
      </div>

      <div className="space-y-2">
        {memberships.map((m) => {
          const roleLabelKey = m.role as keyof typeof ROLE_LABELS
          const roleLabel = ROLE_LABELS[roleLabelKey] ?? m.role
          const isSelecting = selecting === m.garage_id

          return (
            <button
              key={m.garage_id}
              type="button"
              onClick={() => handleSelect(m)}
              disabled={isSelecting || !!selecting}
              className={cn(
                'w-full text-right rounded-xl border bg-surface-high p-4 transition-all',
                'border-white/5 hover:border-primary/40/40 hover:bg-primary-container/5',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                isSelecting && 'border-primary/40/40 bg-primary-container/5'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-on-surface truncate">
                      {m.garage?.name}
                    </span>
                    {!m.garage?.is_active && (
                      <Badge variant="red" dot>מושהה</Badge>
                    )}
                  </div>

                  {m.garage?.address && (
                    <div className="flex items-center gap-1 text-xs text-outline">
                      <MapPin size={11} />
                      <span className="truncate">{m.garage.address}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <Badge variant="blue">{roleLabel}</Badge>
                  {isSelecting && (
                    <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                      <Spinner size="sm" />
                      <span>נכנס...</span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
