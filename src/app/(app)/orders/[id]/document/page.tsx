'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { FileText, Loader2, RefreshCw } from 'lucide-react'
import { Topbar } from '@/components/layout/topbar'
import { Button } from '@/components/ui/button'
import { DocumentRenderer } from '@/components/documents/document-renderer'
import type { DocType, DocumentData } from '@/types'
import { DOC_TYPE_LABELS } from '@/types'

const ORDER_DOC_TYPES: DocType[] = [
  'invoice_receipt',
  'work_order',
  'intake',
  'release',
  'warranty',
]

export default function OrderDocumentPage() {
  const params = useParams()
  const orderId = params.id as string

  const [selectedType, setSelectedType] = useState<DocType>('invoice_receipt')
  const [documentData, setDocumentData] = useState<DocumentData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generated, setGenerated] = useState(false)

  const generateDocument = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/documents/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doc_type: selectedType,
          order_id: orderId,
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'שגיאה בהפקת המסמך')
      }

      const result = await res.json()
      setDocumentData(result.document_data)
      setGenerated(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה לא צפויה')
    } finally {
      setLoading(false)
    }
  }, [selectedType, orderId])

  // Reset when type changes
  useEffect(() => {
    setDocumentData(null)
    setGenerated(false)
    setError(null)
  }, [selectedType])

  return (
    <div className="min-h-full">
      <Topbar
        title="הפקת מסמך"
        backHref={`/orders/${orderId}`}
        actions={
          <Button variant="default" size="sm" onClick={generateDocument} loading={loading}>
            <FileText size={14} />
            <span className="hidden md:inline">הפק מסמך</span>
          </Button>
        }
      />

      <div className="px-4 py-6 max-w-5xl mx-auto space-y-6">
        {/* Document type tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {ORDER_DOC_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                selectedType === type
                  ? 'bg-primary-container text-white shadow-inner'
                  : 'bg-surface-high text-on-surface-variant hover:bg-surface-highest hover:text-on-surface border border-white/5'
              }`}
            >
              {DOC_TYPE_LABELS[type]}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-error/20 bg-error/10 px-4 py-3">
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        {/* Not generated yet */}
        {!generated && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-highest flex items-center justify-center mb-4">
              <FileText size={28} className="text-on-surface-variant" />
            </div>
            <h3 className="text-lg font-bold text-on-surface mb-2">
              {DOC_TYPE_LABELS[selectedType]}
            </h3>
            <p className="text-sm text-on-surface-variant mb-6 max-w-sm">
              לחץ על &ldquo;הפק מסמך&rdquo; כדי ליצור {DOC_TYPE_LABELS[selectedType]} עבור כרטיס עבודה זה.
              כל מסמך מקבל מספר ייחודי ונשמר במערכת.
            </p>
            <Button variant="primary" size="lg" onClick={generateDocument} loading={loading}>
              <FileText size={16} />
              הפק {DOC_TYPE_LABELS[selectedType]}
            </Button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-primary mb-4" />
            <p className="text-sm text-on-surface-variant">מפיק מסמך...</p>
          </div>
        )}

        {/* Generated document */}
        {generated && documentData && !loading && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-on-surface-variant">
                  מסמך מס׳ {documentData.doc_number}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setGenerated(false)
                  setDocumentData(null)
                }}
              >
                <RefreshCw size={14} />
                הפק מחדש
              </Button>
            </div>
            <DocumentRenderer data={documentData} />
          </div>
        )}
      </div>
    </div>
  )
}
