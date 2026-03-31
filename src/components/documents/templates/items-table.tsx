'use client'

import type { DocumentData } from '@/types'
import { getDocumentStyles, formatCurrencyDoc } from './shared-styles'

interface ItemsTableProps {
  data: DocumentData
  showTotals?: boolean
}

export function ItemsTable({ data, showTotals = true }: ItemsTableProps) {
  const s = getDocumentStyles(data.garage.primary_color, data.garage.secondary_color)

  if (!data.items || data.items.length === 0) {
    return null
  }

  return (
    <>
      <div style={s.sectionTitle}>פירוט עבודות וחלפים</div>
      <table style={s.table}>
        <thead>
          <tr style={s.tableHeader}>
            <th style={s.th}>#</th>
            <th style={{ ...s.th, width: '50%' }}>תיאור</th>
            <th style={{ ...s.th, textAlign: 'center' }}>כמות</th>
            <th style={{ ...s.th, textAlign: 'left' }}>מחיר יחידה</th>
            <th style={{ ...s.th, textAlign: 'left' }}>סה&quot;כ</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => (
            <tr key={item.id || index} style={index % 2 === 1 ? s.rowEven : undefined}>
              <td style={s.td}>{index + 1}</td>
              <td style={s.td}>{item.description}</td>
              <td style={s.tdCenter}>{item.quantity}</td>
              <td style={s.tdLeft}>{formatCurrencyDoc(item.unit_price)}</td>
              <td style={{ ...s.tdLeft, fontWeight: '600' }}>{formatCurrencyDoc(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showTotals && (
        <div style={s.totalsSection}>
          <div style={s.totalsBox}>
            <div style={s.totalsRow}>
              <span style={s.totalLabel}>סכום ביניים:</span>
              <span style={s.totalValue}>{formatCurrencyDoc(data.subtotal)}</span>
            </div>
            <div style={s.totalsRow}>
              <span style={s.totalLabel}>מע&quot;מ ({data.tax_rate}%):</span>
              <span style={s.totalValue}>{formatCurrencyDoc(data.tax_amount)}</span>
            </div>
            <div style={s.totalsFinalRow}>
              <span style={s.totalFinalLabel}>סה&quot;כ לתשלום:</span>
              <span style={s.totalFinalValue}>{formatCurrencyDoc(data.total_amount)}</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
