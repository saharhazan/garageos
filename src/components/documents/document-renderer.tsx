'use client'

import { useRef, useState, useCallback } from 'react'
import { Download, Loader2 } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { Button } from '@/components/ui/button'
import type { DocumentData, DocType } from '@/types'
import { InvoiceReceipt } from './templates/invoice-receipt'
import { WorkOrderTemplate } from './templates/work-order'
import { QuoteTemplate } from './templates/quote'
import { VehicleIntakeTemplate } from './templates/vehicle-intake'
import { VehicleReleaseTemplate } from './templates/vehicle-release'
import { WarrantyTemplate } from './templates/warranty'

interface DocumentRendererProps {
  data: DocumentData
}

const TEMPLATE_MAP: Record<DocType, React.ComponentType<{ data: DocumentData }>> = {
  invoice: InvoiceReceipt,
  receipt: InvoiceReceipt,
  invoice_receipt: InvoiceReceipt,
  quote: QuoteTemplate,
  work_order: WorkOrderTemplate,
  intake: VehicleIntakeTemplate,
  release: VehicleReleaseTemplate,
  warranty: WarrantyTemplate,
}

export function DocumentRenderer({ data }: DocumentRendererProps) {
  const documentRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)

  const TemplateComponent = TEMPLATE_MAP[data.doc_type]

  const handleDownloadPdf = useCallback(async () => {
    if (!documentRef.current) return
    setDownloading(true)

    try {
      const canvas = await html2canvas(documentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 794, // A4 at 96dpi
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      // Calculate image dimensions to fit A4
      const imgWidth = pdfWidth
      const imgHeight = (canvas.height * pdfWidth) / canvas.width

      // If content is taller than one page, we need to handle multi-page
      if (imgHeight <= pdfHeight) {
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      } else {
        let heightLeft = imgHeight
        let position = 0

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pdfHeight

        while (heightLeft > 0) {
          position -= pdfHeight
          pdf.addPage()
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
          heightLeft -= pdfHeight
        }
      }

      const fileName = `${data.doc_type}-${data.doc_number.replace('/', '-')}.pdf`
      pdf.save(fileName)
    } catch (error) {
      console.error('PDF generation error:', error)
    } finally {
      setDownloading(false)
    }
  }, [data.doc_type, data.doc_number])

  if (!TemplateComponent) {
    return <div>סוג מסמך לא נתמך</div>
  }

  return (
    <div>
      {/* Actions bar */}
      <div className="flex items-center gap-3 mb-4">
        <Button
          variant="primary"
          size="default"
          onClick={handleDownloadPdf}
          disabled={downloading}
        >
          {downloading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Download size={14} />
          )}
          {downloading ? 'מייצר PDF...' : 'הורד PDF'}
        </Button>
      </div>

      {/* Document preview */}
      <div className="overflow-auto rounded-xl border border-white/10 shadow-2xl">
        <div
          ref={documentRef}
          style={{
            background: '#ffffff',
            margin: '0 auto',
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          }}
        >
          <TemplateComponent data={data} />
        </div>
      </div>
    </div>
  )
}
