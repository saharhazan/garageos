'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { exportToExcel } from '@/lib/excel-export'
import { formatCurrency, STATUS_LABELS } from '@/lib/utils'

export function ExportReportButton() {
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    setExporting(true)
    try {
      // Fetch all delivered orders for report export
      const res = await fetch('/api/export?type=orders')
      const json = await res.json()
      if (!res.ok || !json.data) return

      const rows = json.data.map((o: Record<string, unknown>) => {
        const cust = Array.isArray(o.customer) ? o.customer[0] : o.customer
        const veh = Array.isArray(o.vehicle) ? o.vehicle[0] : o.vehicle
        return {
          job_number: o.job_number ?? '',
          customer_name: (cust as Record<string, unknown>)?.full_name ?? '',
          vehicle: veh
            ? `${(veh as Record<string, unknown>).make ?? ''} ${(veh as Record<string, unknown>).model ?? ''}`
            : '',
          license_plate: (veh as Record<string, unknown>)?.license_plate ?? '',
          status: STATUS_LABELS[o.status as string] ?? o.status ?? '',
          total_amount: o.total_amount ?? 0,
          created_at: o.created_at ?? '',
        }
      })

      const today = new Date().toISOString().slice(0, 10)
      exportToExcel(
        rows,
        [
          { key: 'job_number', label: 'מספר עבודה' },
          { key: 'customer_name', label: 'לקוח' },
          { key: 'vehicle', label: 'רכב' },
          { key: 'license_plate', label: 'לוחית' },
          { key: 'status', label: 'סטטוס' },
          { key: 'total_amount', label: 'סכום' },
          { key: 'created_at', label: 'תאריך' },
        ],
        `report-${today}.xlsx`
      )
    } catch (err) {
      console.error('Report export error:', err)
    } finally {
      setExporting(false)
    }
  }

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleExport}
      disabled={exporting}
      loading={exporting}
    >
      <Download size={14} />
      ייצוא דוח
    </Button>
  )
}
