'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileSpreadsheet, ArrowLeft, ArrowRight, Check, AlertTriangle, X } from 'lucide-react'
import { Topbar } from '@/components/layout/topbar'
import { Button } from '@/components/ui/button'
import * as XLSX from 'xlsx'

// GarageOS target fields
const TARGET_FIELDS = [
  { key: 'full_name', label: 'שם מלא', required: true },
  { key: 'phone', label: 'טלפון', required: true },
  { key: 'email', label: 'אימייל', required: false },
  { key: 'notes', label: 'הערות', required: false },
  { key: 'license_plate', label: 'לוחית רישוי', required: false },
  { key: 'make', label: 'יצרן', required: false },
  { key: 'model', label: 'דגם', required: false },
  { key: 'year', label: 'שנה', required: false },
  { key: 'color', label: 'צבע', required: false },
] as const

type TargetFieldKey = (typeof TARGET_FIELDS)[number]['key']

// Hebrew column name auto-detection mapping
const AUTO_DETECT_MAP: Record<string, TargetFieldKey> = {
  'שם': 'full_name',
  'שם מלא': 'full_name',
  'שם לקוח': 'full_name',
  'שם הלקוח': 'full_name',
  'name': 'full_name',
  'full_name': 'full_name',
  'full name': 'full_name',
  'customer name': 'full_name',
  'טלפון': 'phone',
  'נייד': 'phone',
  'phone': 'phone',
  'mobile': 'phone',
  'tel': 'phone',
  'telephone': 'phone',
  'מספר טלפון': 'phone',
  'אימייל': 'email',
  'דוא"ל': 'email',
  'מייל': 'email',
  'email': 'email',
  'e-mail': 'email',
  'הערות': 'notes',
  'הערה': 'notes',
  'notes': 'notes',
  'note': 'notes',
  'לוחית': 'license_plate',
  'לוחית רישוי': 'license_plate',
  'מספר רכב': 'license_plate',
  'license plate': 'license_plate',
  'license_plate': 'license_plate',
  'plate': 'license_plate',
  'יצרן': 'make',
  'מותג': 'make',
  'make': 'make',
  'brand': 'make',
  'manufacturer': 'make',
  'דגם': 'model',
  'model': 'model',
  'שנה': 'year',
  'שנת ייצור': 'year',
  'year': 'year',
  'צבע': 'color',
  'color': 'color',
  'colour': 'color',
}

type Step = 'upload' | 'mapping' | 'preview' | 'importing' | 'done'

interface ImportRecord {
  full_name: string
  phone: string
  email?: string | null
  notes?: string | null
  license_plate?: string | null
  make?: string | null
  model?: string | null
  year?: number | null
  color?: string | null
}

interface ImportResult {
  imported: number
  errors: string[]
  total: number
}

export default function CustomerImportPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<Step>('upload')
  const [fileName, setFileName] = useState('')
  const [rawHeaders, setRawHeaders] = useState<string[]>([])
  const [rawRows, setRawRows] = useState<Record<string, unknown>[]>([])
  const [columnMapping, setColumnMapping] = useState<Record<string, TargetFieldKey | ''>>(
    {}
  )
  const [parsedRecords, setParsedRecords] = useState<ImportRecord[]>([])
  const [issues, setIssues] = useState<string[]>([])
  const [importProgress, setImportProgress] = useState(0)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [parseError, setParseError] = useState('')

  // ─── Step 1: File Upload ─────────────────────────────
  const processFile = useCallback((file: File) => {
    setParseError('')
    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
          defval: '',
        })

        if (jsonData.length === 0) {
          setParseError('הקובץ ריק או לא ניתן לקרוא אותו')
          return
        }

        const headers = Object.keys(jsonData[0])
        setRawHeaders(headers)
        setRawRows(jsonData)

        // Auto-detect column mapping
        const autoMapping: Record<string, TargetFieldKey | ''> = {}
        headers.forEach((header) => {
          const normalizedHeader = header.trim().toLowerCase()
          const detected = AUTO_DETECT_MAP[normalizedHeader]
          autoMapping[header] = detected ?? ''
        })
        setColumnMapping(autoMapping)

        setStep('mapping')
      } catch {
        setParseError('שגיאה בקריאת הקובץ. ודא שמדובר בקובץ Excel או CSV תקין.')
      }
    }
    reader.readAsArrayBuffer(file)
  }, [])

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  // ─── Step 2: Column Mapping ──────────────────────────
  function handleMappingChange(header: string, targetKey: TargetFieldKey | '') {
    setColumnMapping((prev) => ({ ...prev, [header]: targetKey }))
  }

  function proceedToPreview() {
    // Validate that required fields are mapped
    const mappedFields = Object.values(columnMapping).filter(Boolean)
    if (!mappedFields.includes('full_name') || !mappedFields.includes('phone')) {
      setParseError('חובה למפות לפחות "שם מלא" ו"טלפון"')
      return
    }
    setParseError('')

    // Build reverse mapping: targetKey -> header
    const reverseMap: Partial<Record<TargetFieldKey, string>> = {}
    Object.entries(columnMapping).forEach(([header, targetKey]) => {
      if (targetKey) reverseMap[targetKey] = header
    })

    const records: ImportRecord[] = []
    const foundIssues: string[] = []
    const seenPhones = new Set<string>()

    rawRows.forEach((row, index) => {
      const fullName = String(reverseMap.full_name ? row[reverseMap.full_name] ?? '' : '').trim()
      const phone = String(reverseMap.phone ? row[reverseMap.phone] ?? '' : '')
        .replace(/[-\s()]/g, '')
        .trim()

      if (!fullName) {
        foundIssues.push(`שורה ${index + 2}: חסר שם מלא`)
        return
      }
      if (!phone) {
        foundIssues.push(`שורה ${index + 2}: חסר טלפון`)
        return
      }

      if (seenPhones.has(phone)) {
        foundIssues.push(`שורה ${index + 2}: טלפון ${phone} כפול בקובץ`)
      }
      seenPhones.add(phone)

      const yearRaw = reverseMap.year ? row[reverseMap.year] : null
      const yearNum = yearRaw ? parseInt(String(yearRaw), 10) : null

      records.push({
        full_name: fullName,
        phone,
        email: reverseMap.email ? String(row[reverseMap.email] ?? '').trim() || null : null,
        notes: reverseMap.notes ? String(row[reverseMap.notes] ?? '').trim() || null : null,
        license_plate: reverseMap.license_plate
          ? String(row[reverseMap.license_plate] ?? '').trim() || null
          : null,
        make: reverseMap.make ? String(row[reverseMap.make] ?? '').trim() || null : null,
        model: reverseMap.model ? String(row[reverseMap.model] ?? '').trim() || null : null,
        year: yearNum && !isNaN(yearNum) && yearNum > 1900 && yearNum < 2100 ? yearNum : null,
        color: reverseMap.color ? String(row[reverseMap.color] ?? '').trim() || null : null,
      })
    })

    setParsedRecords(records)
    setIssues(foundIssues)
    setStep('preview')
  }

  // ─── Step 3/4: Import ────────────────────────────────
  async function runImport() {
    setStep('importing')
    setImportProgress(0)

    const batchSize = 50
    let totalImported = 0
    const allErrors: string[] = []

    for (let i = 0; i < parsedRecords.length; i += batchSize) {
      const batch = parsedRecords.slice(i, i + batchSize)

      try {
        const res = await fetch('/api/customers/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ records: batch }),
        })

        const result = await res.json()

        if (res.ok) {
          totalImported += result.imported
          if (result.errors?.length) {
            // Adjust row numbers for batch offset
            allErrors.push(...result.errors)
          }
        } else {
          allErrors.push(result.error ?? 'שגיאה לא ידועה')
        }
      } catch {
        allErrors.push(`שגיאה בשליחת אצוות ${Math.floor(i / batchSize) + 1}`)
      }

      setImportProgress(Math.min(100, Math.round(((i + batch.length) / parsedRecords.length) * 100)))
    }

    setImportResult({
      imported: totalImported,
      errors: allErrors,
      total: parsedRecords.length,
    })
    setImportProgress(100)
    setStep('done')
  }

  return (
    <div className="min-h-full">
      <Topbar
        title="ייבוא לקוחות מאקסל"
        backHref="/customers"
      />

      <div className="px-4 py-6 max-w-3xl mx-auto space-y-6">

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 text-xs text-on-surface-variant">
          <StepIndicator label="העלאת קובץ" num={1} active={step === 'upload'} done={step !== 'upload'} />
          <div className="w-6 h-px bg-outline-variant/30" />
          <StepIndicator label="מיפוי עמודות" num={2} active={step === 'mapping'} done={['preview', 'importing', 'done'].includes(step)} />
          <div className="w-6 h-px bg-outline-variant/30" />
          <StepIndicator label="תצוגה מקדימה" num={3} active={step === 'preview'} done={['importing', 'done'].includes(step)} />
          <div className="w-6 h-px bg-outline-variant/30" />
          <StepIndicator label="ייבוא" num={4} active={step === 'importing' || step === 'done'} done={step === 'done'} />
        </div>

        {/* ─── STEP 1: Upload ──────────────────────────── */}
        {step === 'upload' && (
          <div
            className={`
              rounded-xl border-2 border-dashed transition-colors p-12 text-center
              ${dragOver
                ? 'border-primary bg-primary/5'
                : 'border-outline-variant/20 bg-surface-high hover:border-primary/30'
              }
            `}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <FileSpreadsheet size={28} className="text-primary" />
              </div>
              <div>
                <p className="text-on-surface font-bold text-lg">גרור קובץ לכאן</p>
                <p className="text-on-surface-variant text-sm mt-1">או לחץ לבחירת קובץ</p>
                <p className="text-outline text-xs mt-2">תומך בקובצי Excel (.xlsx, .xls) ו-CSV</p>
              </div>
              <Button
                variant="primary"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={14} />
                בחר קובץ
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          </div>
        )}

        {/* ─── STEP 2: Column Mapping ──────────────────── */}
        {step === 'mapping' && (
          <div className="space-y-4">
            <div className="bg-surface-high rounded-xl p-6 border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-on-surface-variant">קובץ: {fileName} ({rawRows.length} שורות)</p>
                <h3 className="font-bold text-on-surface">מיפוי עמודות</h3>
              </div>
              <p className="text-sm text-on-surface-variant mb-6 text-right">
                התאם כל עמודה מהקובץ לשדה המתאים במערכת. שדות נדרשים מסומנים בכוכבית.
              </p>

              <div className="space-y-3">
                {rawHeaders.map((header) => (
                  <div
                    key={header}
                    className="flex items-center gap-3 bg-surface-lowest rounded-lg p-3"
                  >
                    <ArrowLeft size={14} className="text-outline-variant shrink-0" />
                    <select
                      value={columnMapping[header] ?? ''}
                      onChange={(e) => handleMappingChange(header, e.target.value as TargetFieldKey | '')}
                      className="h-9 flex-1 rounded-md border border-outline-variant/20 bg-surface-high px-3 text-sm text-on-surface outline-none focus:border-primary/40"
                    >
                      <option value="">-- דלג --</option>
                      {TARGET_FIELDS.map((field) => (
                        <option key={field.key} value={field.key}>
                          {field.label} {field.required ? '*' : ''}
                        </option>
                      ))}
                    </select>
                    <span className="text-sm font-bold text-on-surface truncate max-w-[200px] text-left" dir="auto">
                      {header}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {parseError && (
              <div className="bg-error/10 border border-error/20 rounded-lg p-3 flex items-center gap-2 justify-end">
                <span className="text-sm text-error">{parseError}</span>
                <AlertTriangle size={14} className="text-error shrink-0" />
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="default" onClick={() => { setStep('upload'); setParseError('') }}>
                <ArrowRight size={14} />
                חזור
              </Button>
              <Button variant="primary" onClick={proceedToPreview}>
                <ArrowLeft size={14} />
                תצוגה מקדימה
              </Button>
            </div>
          </div>
        )}

        {/* ─── STEP 3: Preview ─────────────────────────── */}
        {step === 'preview' && (
          <div className="space-y-4">
            <div className="bg-surface-high rounded-xl p-6 border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {issues.length > 0 && (
                    <span className="bg-warning/10 text-warning text-xs px-2 py-1 rounded-full border border-warning/20">
                      {issues.length} בעיות
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-on-surface">
                  נמצאו {parsedRecords.length} לקוחות
                </h3>
              </div>

              {/* Issues */}
              {issues.length > 0 && (
                <div className="bg-warning/5 border border-warning/20 rounded-lg p-3 mb-4 max-h-32 overflow-y-auto">
                  {issues.slice(0, 10).map((issue, i) => (
                    <p key={i} className="text-xs text-warning flex items-center gap-1 justify-end mb-1">
                      {issue}
                      <AlertTriangle size={10} />
                    </p>
                  ))}
                  {issues.length > 10 && (
                    <p className="text-xs text-warning text-right mt-1">...ועוד {issues.length - 10} בעיות</p>
                  )}
                </div>
              )}

              {/* Preview Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="text-xs text-on-surface-variant border-b border-white/5">
                      <th className="px-3 py-2">#</th>
                      <th className="px-3 py-2">שם מלא</th>
                      <th className="px-3 py-2">טלפון</th>
                      <th className="px-3 py-2">אימייל</th>
                      <th className="px-3 py-2">לוחית</th>
                      <th className="px-3 py-2">יצרן</th>
                      <th className="px-3 py-2">דגם</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRecords.slice(0, 20).map((record, i) => (
                      <tr
                        key={i}
                        className="border-b border-white/5 hover:bg-white/[0.02]"
                      >
                        <td className="px-3 py-2 text-outline tabular-nums">{i + 1}</td>
                        <td className="px-3 py-2 text-on-surface font-medium">{record.full_name}</td>
                        <td className="px-3 py-2 text-on-surface-variant tabular-nums" dir="ltr">{record.phone}</td>
                        <td className="px-3 py-2 text-on-surface-variant" dir="ltr">{record.email ?? '-'}</td>
                        <td className="px-3 py-2 text-on-surface-variant" dir="ltr">{record.license_plate ?? '-'}</td>
                        <td className="px-3 py-2 text-on-surface-variant">{record.make ?? '-'}</td>
                        <td className="px-3 py-2 text-on-surface-variant">{record.model ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedRecords.length > 20 && (
                  <p className="text-xs text-outline text-center py-3">
                    מציג 20 מתוך {parsedRecords.length} לקוחות
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="default" onClick={() => setStep('mapping')}>
                <ArrowRight size={14} />
                חזור למיפוי
              </Button>
              <Button
                variant="primary"
                onClick={runImport}
                disabled={parsedRecords.length === 0}
              >
                <Upload size={14} />
                ייבא {parsedRecords.length} לקוחות
              </Button>
            </div>
          </div>
        )}

        {/* ─── STEP 4: Importing ──────────────────────── */}
        {step === 'importing' && (
          <div className="bg-surface-high rounded-xl p-8 border border-white/5 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <svg
                  className="animate-spin h-6 w-6 text-primary"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
              <div>
                <p className="text-on-surface font-bold text-lg">מייבא לקוחות...</p>
                <p className="text-on-surface-variant text-sm mt-1">{importProgress}%</p>
              </div>
              <div className="w-full max-w-sm bg-surface-lowest rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${importProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 5: Done ───────────────────────────── */}
        {step === 'done' && importResult && (
          <div className="space-y-4">
            <div className="bg-surface-high rounded-xl p-8 border border-white/5 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  importResult.imported > 0 ? 'bg-success/10' : 'bg-error/10'
                }`}>
                  {importResult.imported > 0 ? (
                    <Check size={28} className="text-success" />
                  ) : (
                    <X size={28} className="text-error" />
                  )}
                </div>
                <div>
                  <p className="text-on-surface font-bold text-xl">
                    {importResult.imported > 0 ? 'הייבוא הושלם!' : 'הייבוא נכשל'}
                  </p>
                  <p className="text-on-surface-variant text-sm mt-2">
                    יובאו {importResult.imported} מתוך {importResult.total} לקוחות
                  </p>
                </div>

                {importResult.errors.length > 0 && (
                  <div className="w-full bg-error/5 border border-error/20 rounded-lg p-4 text-right max-h-40 overflow-y-auto">
                    <p className="text-xs font-bold text-error mb-2">שגיאות:</p>
                    {importResult.errors.slice(0, 20).map((err, i) => (
                      <p key={i} className="text-xs text-error/80 mb-1">{err}</p>
                    ))}
                    {importResult.errors.length > 20 && (
                      <p className="text-xs text-error/60 mt-1">...ועוד {importResult.errors.length - 20} שגיאות</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <Button variant="default" onClick={() => router.push('/customers')}>
                חזור ללקוחות
              </Button>
              <Button variant="primary" onClick={() => {
                setStep('upload')
                setFileName('')
                setRawHeaders([])
                setRawRows([])
                setColumnMapping({})
                setParsedRecords([])
                setIssues([])
                setImportProgress(0)
                setImportResult(null)
              }}>
                <Upload size={14} />
                ייבוא נוסף
              </Button>
            </div>
          </div>
        )}

        {/* Parse error on upload step */}
        {step === 'upload' && parseError && (
          <div className="bg-error/10 border border-error/20 rounded-lg p-3 flex items-center gap-2 justify-end">
            <span className="text-sm text-error">{parseError}</span>
            <AlertTriangle size={14} className="text-error shrink-0" />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Step indicator component ─────────────────────────
function StepIndicator({ label, num, active, done }: { label: string; num: number; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px]">{label}</span>
      <div className={`
        w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold
        ${done && !active
          ? 'bg-primary text-on-primary'
          : active
          ? 'bg-primary/20 text-primary border border-primary/40'
          : 'bg-surface-highest text-on-surface-variant'
        }
      `}>
        {done && !active ? <Check size={10} /> : num}
      </div>
    </div>
  )
}
