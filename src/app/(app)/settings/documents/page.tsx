'use client'

import { useState, useEffect } from 'react'
import {
  ChevronLeft, Save, Plus, Trash2, Palette, Building2, FileText
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth-context'
import { Topbar } from '@/components/layout/topbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/input'
import type { GarageBusinessDetails, CustomField, DocType } from '@/types'
import { DOC_TYPE_LABELS } from '@/types'

type SettingsTab = 'branding' | 'custom_fields'

const ALL_DOC_TYPES: DocType[] = [
  'invoice_receipt', 'invoice', 'receipt', 'quote', 'work_order', 'intake', 'release', 'warranty',
]

const FIELD_TYPE_LABELS: Record<string, string> = {
  text: 'טקסט',
  number: 'מספר',
  date: 'תאריך',
  checkbox: 'תיבת סימון',
  select: 'בחירה מרשימה',
}

export default function DocumentSettingsPage() {
  const { garageId } = useAuth()
  const [tab, setTab] = useState<SettingsTab>('branding')

  return (
    <div className="min-h-full">
      <Topbar title="הגדרות מסמכים" />

      <div className="px-4 py-4 max-w-2xl mx-auto space-y-6">
        <Link
          href="/settings"
          className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <ChevronLeft size={14} />
          חזרה להגדרות
        </Link>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setTab('branding')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              tab === 'branding'
                ? 'bg-primary-container text-white shadow-inner'
                : 'bg-surface-high text-on-surface-variant hover:bg-surface-highest border border-white/5'
            }`}
          >
            <Building2 size={14} />
            מיתוג ופרטי עסק
          </button>
          <button
            onClick={() => setTab('custom_fields')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              tab === 'custom_fields'
                ? 'bg-primary-container text-white shadow-inner'
                : 'bg-surface-high text-on-surface-variant hover:bg-surface-highest border border-white/5'
            }`}
          >
            <FileText size={14} />
            שדות מותאמים
          </button>
        </div>

        {tab === 'branding' && <BrandingForm garageId={garageId} />}
        {tab === 'custom_fields' && <CustomFieldsManager garageId={garageId} />}
      </div>
    </div>
  )
}

// ─── Branding Form ────────────────────────────────────
function BrandingForm({ garageId }: { garageId: string | null }) {
  const [details, setDetails] = useState<GarageBusinessDetails>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!garageId) return
      const supabase = createClient()
      const { data } = await supabase
        .from('garages')
        .select('business_details')
        .eq('id', garageId)
        .single()

      if (data?.business_details) {
        setDetails(data.business_details as GarageBusinessDetails)
      }
      setLoading(false)
    }
    load()
  }, [garageId])

  const updateField = (key: keyof GarageBusinessDetails, value: string) => {
    setDetails((d) => ({ ...d, [key]: value }))
    setSaved(false)
  }

  async function handleSave() {
    if (!garageId) return
    setSaving(true)
    setSaved(false)

    const supabase = createClient()
    const { error } = await supabase
      .from('garages')
      .update({ business_details: details })
      .eq('id', garageId)

    setSaving(false)
    if (!error) setSaved(true)
  }

  if (loading) return <FormSkeleton />

  return (
    <div className="space-y-6">
      {/* Business Identity */}
      <div>
        <p className="text-xs font-semibold text-outline-variant uppercase tracking-wider mb-3 px-1">
          פרטי עסק
        </p>
        <div className="rounded-xl border border-white/5 p-4 space-y-4 bg-surface-low">
          <Input
            label="שם עסק (משפטי)"
            value={details.legal_name || ''}
            onChange={(e) => updateField('legal_name', e.target.value)}
            placeholder="שם החברה / עוסק מורשה"
          />
          <Input
            label="מספר עוסק / ח.פ"
            value={details.osek_number || ''}
            onChange={(e) => updateField('osek_number', e.target.value)}
            placeholder="515123456"
            dir="ltr"
          />
          <Input
            label="כתובת"
            value={details.address || ''}
            onChange={(e) => updateField('address', e.target.value)}
            placeholder="רחוב, עיר, מיקוד"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="טלפון"
              value={details.phone || ''}
              onChange={(e) => updateField('phone', e.target.value)}
              dir="ltr"
              inputMode="tel"
            />
            <Input
              label="אימייל"
              value={details.email || ''}
              onChange={(e) => updateField('email', e.target.value)}
              dir="ltr"
              inputMode="email"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="שם מנהל מקצועי"
              value={details.manager_name || ''}
              onChange={(e) => updateField('manager_name', e.target.value)}
            />
            <Input
              label="רישיון מוסך"
              value={details.manager_license || ''}
              onChange={(e) => updateField('manager_license', e.target.value)}
              dir="ltr"
            />
          </div>
        </div>
      </div>

      {/* Bank Details */}
      <div>
        <p className="text-xs font-semibold text-outline-variant uppercase tracking-wider mb-3 px-1">
          פרטי בנק
        </p>
        <div className="rounded-xl border border-white/5 p-4 space-y-4 bg-surface-low">
          <Input
            label="שם בנק"
            value={details.bank_name || ''}
            onChange={(e) => updateField('bank_name', e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="סניף"
              value={details.bank_branch || ''}
              onChange={(e) => updateField('bank_branch', e.target.value)}
              dir="ltr"
            />
            <Input
              label="מספר חשבון"
              value={details.bank_account || ''}
              onChange={(e) => updateField('bank_account', e.target.value)}
              dir="ltr"
            />
          </div>
        </div>
      </div>

      {/* Branding */}
      <div>
        <p className="text-xs font-semibold text-outline-variant uppercase tracking-wider mb-3 px-1">
          <Palette size={12} className="inline ml-1" />
          מיתוג
        </p>
        <div className="rounded-xl border border-white/5 p-4 space-y-4 bg-surface-low">
          <Input
            label="קישור ללוגו (URL)"
            value={details.logo_url || ''}
            onChange={(e) => updateField('logo_url', e.target.value)}
            dir="ltr"
            placeholder="https://..."
            hint="העלה תמונה ל-Supabase Storage והדבק את הקישור"
          />
          <Input
            label="קישור לחותמת (URL)"
            value={details.stamp_url || ''}
            onChange={(e) => updateField('stamp_url', e.target.value)}
            dir="ltr"
            placeholder="https://..."
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-on-surface-variant">צבע ראשי</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={details.primary_color || '#0d5c63'}
                  onChange={(e) => updateField('primary_color', e.target.value)}
                  className="w-11 h-11 rounded-md border border-outline-variant/20 bg-surface-lowest cursor-pointer"
                />
                <Input
                  value={details.primary_color || '#0d5c63'}
                  onChange={(e) => updateField('primary_color', e.target.value)}
                  dir="ltr"
                  placeholder="#0d5c63"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-on-surface-variant">צבע משני</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={details.secondary_color || '#e57007'}
                  onChange={(e) => updateField('secondary_color', e.target.value)}
                  className="w-11 h-11 rounded-md border border-outline-variant/20 bg-surface-lowest cursor-pointer"
                />
                <Input
                  value={details.secondary_color || '#e57007'}
                  onChange={(e) => updateField('secondary_color', e.target.value)}
                  dir="ltr"
                  placeholder="#e57007"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Button variant="primary" size="lg" className="w-full" onClick={handleSave} loading={saving}>
        <Save size={14} />
        {saved ? 'נשמר!' : 'שמור שינויים'}
      </Button>
    </div>
  )
}

// ─── Custom Fields Manager ────────────────────────────
function CustomFieldsManager({ garageId }: { garageId: string | null }) {
  const [fields, setFields] = useState<CustomField[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDocType, setSelectedDocType] = useState<DocType>('invoice_receipt')
  const [showAdd, setShowAdd] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function fetchFields() {
      if (!garageId) return
      const supabase = createClient()
      const { data } = await supabase
        .from('custom_fields')
        .select('*')
        .eq('garage_id', garageId)
        .order('sort_order', { ascending: true })

      if (!cancelled) {
        if (data) setFields(data as CustomField[])
        setLoading(false)
      }
    }
    fetchFields()
    return () => { cancelled = true }
  }, [garageId, reloadKey])

  const filteredFields = fields.filter((f) => f.doc_type === selectedDocType)

  async function deleteField(id: string) {
    if (!garageId) return
    const supabase = createClient()
    await supabase.from('custom_fields').delete().eq('id', id).eq('garage_id', garageId)
    setFields((f) => f.filter((x) => x.id !== id))
  }

  if (loading) return <FormSkeleton />

  return (
    <div className="space-y-4">
      {/* Doc type selector */}
      <Select
        label="סוג מסמך"
        value={selectedDocType}
        onChange={(e) => {
          setSelectedDocType(e.target.value as DocType)
          setShowAdd(false)
        }}
      >
        {ALL_DOC_TYPES.map((t) => (
          <option key={t} value={t}>{DOC_TYPE_LABELS[t]}</option>
        ))}
      </Select>

      {/* Fields list */}
      <div className="space-y-2">
        {filteredFields.length === 0 && !showAdd && (
          <div className="text-center py-8">
            <p className="text-sm text-on-surface-variant mb-4">אין שדות מותאמים ל{DOC_TYPE_LABELS[selectedDocType]}</p>
          </div>
        )}

        {filteredFields.map((field) => (
          <div
            key={field.id}
            className="flex items-center justify-between rounded-xl border border-white/5 px-4 py-3 bg-surface-low"
          >
            <div>
              <p className="text-sm font-bold text-on-surface">{field.field_label}</p>
              <p className="text-xs text-outline">
                {field.field_name} | {FIELD_TYPE_LABELS[field.field_type] || field.field_type}
                {field.required && ' | חובה'}
              </p>
            </div>
            <button
              onClick={() => deleteField(field.id)}
              className="p-2 rounded-md text-error/60 hover:text-error hover:bg-error/10 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Add field form */}
      {showAdd ? (
        <AddFieldForm
          garageId={garageId}
          docType={selectedDocType}
          onAdded={() => {
            setShowAdd(false)
            setReloadKey((k) => k + 1)
          }}
          onCancel={() => setShowAdd(false)}
        />
      ) : (
        <Button
          variant="default"
          size="default"
          className="w-full"
          onClick={() => setShowAdd(true)}
        >
          <Plus size={14} />
          הוסף שדה מותאם
        </Button>
      )}
    </div>
  )
}

// ─── Add Field Form ───────────────────────────────────
function AddFieldForm({
  garageId,
  docType,
  onAdded,
  onCancel,
}: {
  garageId: string | null
  docType: DocType
  onAdded: () => void
  onCancel: () => void
}) {
  const [fieldName, setFieldName] = useState('')
  const [fieldLabel, setFieldLabel] = useState('')
  const [fieldType, setFieldType] = useState('text')
  const [required, setRequired] = useState(false)
  const [options, setOptions] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!garageId || !fieldName || !fieldLabel) return
    setSaving(true)

    const supabase = createClient()
    await supabase.from('custom_fields').insert({
      garage_id: garageId,
      doc_type: docType,
      field_name: fieldName,
      field_label: fieldLabel,
      field_type: fieldType,
      required,
      options: fieldType === 'select' ? options.split(',').map((o) => o.trim()).filter(Boolean) : null,
      sort_order: 0,
    })

    setSaving(false)
    onAdded()
  }

  return (
    <div className="rounded-xl border border-primary/20 bg-surface-low p-4 space-y-3">
      <p className="text-xs font-bold text-primary mb-2">שדה חדש ל{DOC_TYPE_LABELS[docType]}</p>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="שם פנימי (אנגלית)"
          value={fieldName}
          onChange={(e) => setFieldName(e.target.value)}
          dir="ltr"
          placeholder="payment_method"
        />
        <Input
          label="תווית (עברית)"
          value={fieldLabel}
          onChange={(e) => setFieldLabel(e.target.value)}
          placeholder="אמצעי תשלום"
        />
      </div>

      <Select
        label="סוג שדה"
        value={fieldType}
        onChange={(e) => setFieldType(e.target.value)}
      >
        <option value="text">טקסט</option>
        <option value="number">מספר</option>
        <option value="date">תאריך</option>
        <option value="checkbox">תיבת סימון</option>
        <option value="select">בחירה מרשימה</option>
      </Select>

      {fieldType === 'select' && (
        <Input
          label="אפשרויות (מופרדות בפסיק)"
          value={options}
          onChange={(e) => setOptions(e.target.value)}
          placeholder="מזומן, אשראי, העברה בנקאית"
        />
      )}

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="required"
          checked={required}
          onChange={(e) => setRequired(e.target.checked)}
          className="w-4 h-4 rounded border-outline-variant/20 accent-primary"
        />
        <label htmlFor="required" className="text-sm text-on-surface-variant">שדה חובה</label>
      </div>

      <div className="flex gap-2">
        <Button variant="primary" size="default" onClick={handleSave} loading={saving} className="flex-1">
          <Save size={14} />
          שמור
        </Button>
        <Button variant="ghost" size="default" onClick={onCancel}>
          ביטול
        </Button>
      </div>
    </div>
  )
}

// ─── Shared Loading Skeleton ──────────────────────────
function FormSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i}>
          <div className="h-3 w-16 bg-surface-highest rounded mb-2" />
          <div className="h-10 bg-surface-highest rounded-[6px]" />
        </div>
      ))}
    </div>
  )
}
