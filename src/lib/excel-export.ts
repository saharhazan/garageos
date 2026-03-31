import * as XLSX from 'xlsx'

export interface ExcelColumn {
  key: string
  label: string
}

/**
 * Generate and download an Excel file from data.
 * Handles RTL, Hebrew headers, and auto-width columns.
 */
export function exportToExcel(
  data: Record<string, unknown>[],
  columns: ExcelColumn[],
  filename: string
): void {
  // Build header row
  const headers = columns.map((c) => c.label)

  // Build data rows
  const rows = data.map((row) =>
    columns.map((col) => {
      const value = row[col.key]
      if (value === null || value === undefined) return ''
      return value
    })
  )

  // Create worksheet from array of arrays
  const wsData = [headers, ...rows]
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // Auto-width: measure max content length per column
  const colWidths = columns.map((col, i) => {
    let maxLen = col.label.length
    for (const row of rows) {
      const cellValue = String(row[i] ?? '')
      if (cellValue.length > maxLen) maxLen = cellValue.length
    }
    // Multiply by ~1.3 for Hebrew chars, min 10
    return { wch: Math.max(10, Math.ceil(maxLen * 1.3)) }
  })
  ws['!cols'] = colWidths

  // Set RTL for the worksheet
  if (!ws['!sheetViews']) {
    ws['!sheetViews'] = [{ rightToLeft: true }]
  }

  // Create workbook
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')

  // Set workbook views to RTL
  if (!wb.Workbook) wb.Workbook = {}
  if (!wb.Workbook.Views) wb.Workbook.Views = []
  if (wb.Workbook.Views.length === 0) wb.Workbook.Views.push({})
  wb.Workbook.Views[0].RTL = true

  // Download
  XLSX.writeFile(wb, filename)
}
