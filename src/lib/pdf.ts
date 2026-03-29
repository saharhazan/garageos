import jsPDF from 'jspdf'
import type { WorkOrder } from '@/types'
import { formatDate, formatCurrency } from '@/lib/utils'

/**
 * Generate a Hebrew RTL PDF for a work order using only jspdf (no autotable).
 * Returns a Blob suitable for download or base64 encoding for WhatsApp.
 */
export async function generateOrderPdf(order: WorkOrder): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  // Enable RTL
  doc.setR2L(true)

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  const rightEdge = pageWidth - margin

  // ── Garage header ──────────────────────────────────────────────────────────
  const headerName =
    (order as WorkOrder & { garage_name?: string }).garage_name ?? 'מוסך המרכז'

  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(headerName, rightEdge, 20, { align: 'right' })

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  let y = 28

  const garagePhone = (order as WorkOrder & { garage_phone?: string }).garage_phone
  const garageAddress = (order as WorkOrder & { garage_address?: string }).garage_address

  if (garagePhone) {
    doc.text(`טל׳: ${garagePhone}`, rightEdge, y, { align: 'right' })
    y += 6
  }

  if (garageAddress) {
    doc.text(garageAddress, rightEdge, y, { align: 'right' })
    y += 6
  }

  // Divider
  doc.setLineWidth(0.5)
  doc.line(margin, y + 2, rightEdge, y + 2)
  y += 10

  // ── Order info ─────────────────────────────────────────────────────────────
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(`הזמנת עבודה: ${order.job_number}`, rightEdge, y, { align: 'right' })
  y += 7

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`תאריך: ${formatDate(order.created_at)}`, rightEdge, y, { align: 'right' })
  y += 10

  // ── Customer info ─────────────────────────────────────────────────────────
  if (order.customer) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('פרטי לקוח', rightEdge, y, { align: 'right' })
    y += 6
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`שם: ${order.customer.full_name}`, rightEdge, y, { align: 'right' })
    y += 5
    doc.text(`טלפון: ${order.customer.phone}`, rightEdge, y, { align: 'right' })
    y += 8
  }

  // ── Vehicle info ──────────────────────────────────────────────────────────
  if (order.vehicle) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('פרטי רכב', rightEdge, y, { align: 'right' })
    y += 6
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`לוחית רישוי: ${order.vehicle.license_plate}`, rightEdge, y, { align: 'right' })
    y += 5
    const vehicleDesc = `${order.vehicle.make} ${order.vehicle.model}${order.vehicle.year ? ` (${order.vehicle.year})` : ''}`
    doc.text(vehicleDesc, rightEdge, y, { align: 'right' })
    y += 5
    if (order.mileage) {
      doc.text(
        `קילומטרז׳: ${order.mileage.toLocaleString('he-IL')}`,
        rightEdge,
        y,
        { align: 'right' }
      )
      y += 5
    }
    y += 3
  }

  // ── Items table header ────────────────────────────────────────────────────
  const colWidths = { desc: 90, qty: 18, unitPrice: 30, total: 30 }
  const tableRight = rightEdge
  const tableLeft = margin

  // Header row background
  doc.setFillColor(41, 128, 185)
  doc.rect(tableLeft, y, tableRight - tableLeft, 8, 'F')

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)

  // Column headers (RTL order: total | unit price | qty | description)
  let colX = tableRight
  colX -= colWidths.total
  doc.text('סה״כ', colX + colWidths.total - 2, y + 5.5, { align: 'right' })
  colX -= colWidths.unitPrice
  doc.text('מחיר', colX + colWidths.unitPrice - 2, y + 5.5, { align: 'right' })
  colX -= colWidths.qty
  doc.text('כמות', colX + colWidths.qty - 2, y + 5.5, { align: 'right' })
  doc.text('תיאור', tableLeft + 2, y + 5.5, { align: 'left' })

  doc.setTextColor(0, 0, 0)
  y += 8

  // Item rows
  doc.setFont('helvetica', 'normal')
  order.items.forEach((item, idx) => {
    const rowH = 7
    if (idx % 2 === 1) {
      doc.setFillColor(240, 245, 255)
      doc.rect(tableLeft, y, tableRight - tableLeft, rowH, 'F')
    }

    doc.setFontSize(9)
    colX = tableRight
    colX -= colWidths.total
    doc.text(formatCurrency(item.total), colX + colWidths.total - 2, y + 5, { align: 'right' })
    colX -= colWidths.unitPrice
    doc.text(formatCurrency(item.unit_price), colX + colWidths.unitPrice - 2, y + 5, {
      align: 'right',
    })
    colX -= colWidths.qty
    doc.text(String(item.quantity), colX + colWidths.qty - 2, y + 5, { align: 'right' })
    // Description — truncate if too long
    const maxDescWidth = tableRight - tableLeft - colWidths.total - colWidths.unitPrice - colWidths.qty - 4
    const desc =
      doc.getStringUnitWidth(item.description) * 9 * 0.352 > maxDescWidth
        ? item.description.substring(0, 40) + '...'
        : item.description
    doc.text(desc, tableLeft + 2, y + 5, { align: 'left' })

    y += rowH
  })

  // Table bottom border
  doc.setLineWidth(0.3)
  doc.line(tableLeft, y, tableRight, y)
  y += 8

  // ── Totals ─────────────────────────────────────────────────────────────────
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`סכום ביניים:`, rightEdge - 30, y, { align: 'right' })
  doc.text(formatCurrency(order.subtotal), rightEdge, y, { align: 'right' })
  y += 6

  doc.text(`מע״מ (17%):`, rightEdge - 30, y, { align: 'right' })
  doc.text(formatCurrency(order.tax_amount), rightEdge, y, { align: 'right' })
  y += 2

  doc.setLineWidth(0.3)
  doc.line(rightEdge - 55, y, rightEdge, y)
  y += 5

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(`סה״כ לתשלום:`, rightEdge - 30, y, { align: 'right' })
  doc.text(formatCurrency(order.total_amount), rightEdge, y, { align: 'right' })
  y += 8

  // ── Notes ──────────────────────────────────────────────────────────────────
  if (order.notes) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`הערות: ${order.notes}`, rightEdge, y, { align: 'right' })
    y += 6
  }

  // ── Footer ─────────────────────────────────────────────────────────────────
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(150)
  doc.text('תודה שבחרת בנו!', pageWidth / 2, pageHeight - 10, { align: 'center' })
  doc.setTextColor(0)

  return doc.output('blob')
}

/**
 * Convert a PDF Blob to a base64 string (without data URL prefix).
 */
export async function pdfBlobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      const base64 = result.split(',')[1]
      if (base64) resolve(base64)
      else reject(new Error('Failed to convert PDF to base64'))
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

/**
 * Trigger a browser download of the PDF.
 */
export function downloadOrderPdf(blob: Blob, jobNumber: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `order-${jobNumber}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
