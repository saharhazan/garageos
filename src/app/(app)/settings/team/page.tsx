'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  ChevronLeft, UserPlus, Shield, Eye, Wrench, UserCheck,
  Crown, Loader2, Copy, Check, Power, PowerOff
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth-context'
import { useToastActions } from '@/hooks/use-toast'
import { Topbar } from '@/components/layout/topbar'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'
import type { UserRole } from '@/types'

interface TeamMember {
  id: string
  garage_id: string
  full_name: string
  email: string | null
  phone: string | null
  role: UserRole
  avatar_url: string | null
  is_active: boolean
  created_at: string
  last_login: string | null
}

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'מנהל ראשי',
  manager: 'מנהל',
  receptionist: 'קבלה',
  technician: 'טכנאי',
  viewer: 'צופה',
}

const ROLE_ICONS: Record<UserRole, React.ElementType> = {
  super_admin: Crown,
  manager: Shield,
  receptionist: UserCheck,
  technician: Wrench,
  viewer: Eye,
}

const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: 'bg-brand/15 text-brand border-brand/20',
  manager: 'bg-primary/15 text-primary border-primary/20',
  receptionist: 'bg-secondary-container/20 text-secondary-container border-secondary-container/20',
  technician: 'bg-on-surface-variant/10 text-on-surface-variant border-on-surface-variant/20',
  viewer: 'bg-outline-variant/10 text-outline-variant border-outline-variant/20',
}

export default function TeamSettingsPage() {
  const { userId, role: currentRole } = useAuth()
  const { toast } = useToastActions()

  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('technician')
  const [inviting, setInviting] = useState(false)
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const [copiedPassword, setCopiedPassword] = useState(false)

  const canManage = currentRole === 'super_admin' || currentRole === 'manager'

  const fetchTeam = useCallback(async () => {
    try {
      const res = await fetch('/api/team')
      if (!res.ok) throw new Error()
      const json = await res.json()
      setMembers(json.data ?? [])
    } catch {
      toast.error('שגיאה בטעינת הצוות')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchTeam()
  }, [fetchTeam])

  async function handleInvite() {
    if (!inviteEmail || !inviteName) {
      toast.error('נא למלא שם ואימייל')
      return
    }
    setInviting(true)
    setTempPassword(null)
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          full_name: inviteName,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'שגיאה בהזמנה')
        return
      }
      toast.success(`${inviteName} הוזמן/ה בהצלחה!`)
      setTempPassword(json.temp_password)
      setMembers((prev) => [...prev, json.data])
      setInviteEmail('')
      setInviteName('')
      setInviteRole('technician')
    } catch {
      toast.error('שגיאה בהזמנת המשתמש')
    } finally {
      setInviting(false)
    }
  }

  async function handleUpdateRole(memberId: string, newRole: UserRole) {
    try {
      const res = await fetch(`/api/team/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'שגיאה בעדכון')
        return
      }
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      )
      setEditingId(null)
      toast.success('התפקיד עודכן')
    } catch {
      toast.error('שגיאה בעדכון התפקיד')
    }
  }

  async function handleToggleActive(member: TeamMember) {
    const newStatus = !member.is_active
    try {
      const res = await fetch(`/api/team/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: newStatus }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'שגיאה בעדכון')
        return
      }
      setMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, is_active: newStatus } : m))
      )
      toast.success(newStatus ? 'המשתמש הופעל' : 'המשתמש הושבת')
    } catch {
      toast.error('שגיאה בעדכון הסטטוס')
    }
  }

  function copyPassword() {
    if (!tempPassword) return
    navigator.clipboard.writeText(tempPassword)
    setCopiedPassword(true)
    setTimeout(() => setCopiedPassword(false), 2000)
  }

  return (
    <div className="min-h-full">
      <Topbar title="צוות" />

      <div className="px-4 py-4 max-w-2xl mx-auto space-y-6">
        <Link
          href="/settings"
          className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <ChevronLeft size={14} />
          חזרה להגדרות
        </Link>

        {/* Invite section */}
        {canManage && (
          <div className="space-y-3">
            {!showInvite ? (
              <Button
                variant="primary"
                onClick={() => { setShowInvite(true); setTempPassword(null) }}
                className="w-full sm:w-auto"
              >
                <UserPlus size={14} />
                הזמן לצוות
              </Button>
            ) : (
              <div className="rounded-xl border border-white/5 bg-surface-high p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-on-surface">הזמנת חבר/ת צוות</h3>
                  <button
                    onClick={() => { setShowInvite(false); setTempPassword(null) }}
                    className="text-xs text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    ביטול
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="שם מלא"
                    placeholder="ישראל ישראלי"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                  />
                  <Input
                    label="אימייל"
                    type="email"
                    placeholder="user@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    dir="ltr"
                  />
                </div>

                <Select
                  label="תפקיד"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                >
                  <option value="technician">טכנאי</option>
                  <option value="receptionist">קבלה</option>
                  <option value="manager">מנהל</option>
                  {currentRole === 'super_admin' && (
                    <option value="super_admin">מנהל ראשי</option>
                  )}
                  <option value="viewer">צופה</option>
                </Select>

                <Button
                  variant="primary"
                  onClick={handleInvite}
                  loading={inviting}
                  className="w-full"
                >
                  <UserPlus size={14} />
                  הזמן
                </Button>

                {/* Temp password display */}
                {tempPassword && (
                  <div className="rounded-lg border border-success/20 bg-success/10 p-3 space-y-2">
                    <p className="text-sm text-success font-bold">המשתמש נוצר בהצלחה!</p>
                    <p className="text-xs text-on-surface-variant">
                      שתף/י את הסיסמה הזמנית עם חבר/ת הצוות. ניתן לשנות בהגדרות.
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-surface-lowest rounded-md px-3 py-2 text-sm text-on-surface font-mono" dir="ltr">
                        {tempPassword}
                      </code>
                      <button
                        onClick={copyPassword}
                        className="shrink-0 p-2 rounded-md bg-surface-lowest hover:bg-surface-highest transition-colors text-on-surface-variant"
                        title="העתק סיסמה"
                      >
                        {copiedPassword ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Team list */}
        <div>
          <h2 className="text-xs font-semibold text-outline-variant uppercase tracking-wider mb-2 px-1">
            חברי צוות ({members.length})
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-primary" />
            </div>
          ) : members.length === 0 ? (
            <div className="rounded-xl border border-white/5 px-4 py-8 text-center">
              <p className="text-sm text-outline">אין חברי צוות עדיין</p>
            </div>
          ) : (
            <div className="rounded-xl border border-white/5 overflow-hidden divide-y divide-white/5">
              {members.map((member) => {
                const isMe = member.id === userId
                const RoleIcon = ROLE_ICONS[member.role]
                const isEditing = editingId === member.id

                return (
                  <div
                    key={member.id}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                      !member.is_active ? 'opacity-50' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-surface-highest shrink-0 text-on-surface-variant text-xs font-bold">
                      {member.full_name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-on-surface truncate">
                          {member.full_name}
                        </p>
                        {isMe && (
                          <span className="text-[10px] font-bold text-primary bg-primary/10 rounded px-1.5 py-0.5 shrink-0">
                            את/ה
                          </span>
                        )}
                        {!member.is_active && (
                          <span className="text-[10px] font-bold text-error bg-error/10 rounded px-1.5 py-0.5 shrink-0">
                            מושבת
                          </span>
                        )}
                      </div>
                      {member.email && (
                        <p className="text-xs text-outline truncate" dir="ltr">{member.email}</p>
                      )}
                    </div>

                    {/* Role badge or editor */}
                    {isEditing && canManage && !isMe ? (
                      <select
                        value={member.role}
                        onChange={(e) => handleUpdateRole(member.id, e.target.value as UserRole)}
                        onBlur={() => setEditingId(null)}
                        autoFocus
                        className="h-8 rounded-md border border-outline-variant/20 bg-surface-lowest px-2 text-xs text-on-surface outline-none focus:border-primary/40 appearance-none cursor-pointer"
                      >
                        <option value="technician">טכנאי</option>
                        <option value="receptionist">קבלה</option>
                        <option value="manager">מנהל</option>
                        {currentRole === 'super_admin' && (
                          <option value="super_admin">מנהל ראשי</option>
                        )}
                        <option value="viewer">צופה</option>
                      </select>
                    ) : (
                      <button
                        onClick={() => canManage && !isMe ? setEditingId(member.id) : undefined}
                        disabled={!canManage || isMe}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-bold shrink-0 transition-colors ${
                          ROLE_COLORS[member.role]
                        } ${canManage && !isMe ? 'cursor-pointer hover:brightness-110' : 'cursor-default'}`}
                        title={canManage && !isMe ? 'לחץ לשינוי תפקיד' : undefined}
                      >
                        <RoleIcon size={12} />
                        {ROLE_LABELS[member.role]}
                      </button>
                    )}

                    {/* Activate/Deactivate */}
                    {canManage && !isMe && (
                      <button
                        onClick={() => handleToggleActive(member)}
                        className={`shrink-0 p-1.5 rounded-md transition-colors ${
                          member.is_active
                            ? 'text-on-surface-variant hover:text-error hover:bg-error/10'
                            : 'text-outline hover:text-success hover:bg-success/10'
                        }`}
                        title={member.is_active ? 'השבת משתמש' : 'הפעל משתמש'}
                      >
                        {member.is_active ? <PowerOff size={14} /> : <Power size={14} />}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
