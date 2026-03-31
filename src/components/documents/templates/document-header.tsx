'use client'

import type { DocumentData } from '@/types'
import { getDocumentStyles, formatDateDoc } from './shared-styles'

interface DocumentHeaderProps {
  data: DocumentData
  title: string
}

export function DocumentHeader({ data, title }: DocumentHeaderProps) {
  const s = getDocumentStyles(data.garage.primary_color, data.garage.secondary_color)

  return (
    <>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerRight}>
          {data.garage.logo_url && (
            <img src={data.garage.logo_url} alt="לוגו" style={s.logo} />
          )}
          <p style={s.garageName}>{data.garage.legal_name || data.garage.name}</p>
          {data.garage.osek_number && (
            <p style={s.garageInfo}>ע.מ / ח.פ: {data.garage.osek_number}</p>
          )}
          {data.garage.address && <p style={s.garageInfo}>{data.garage.address}</p>}
          {data.garage.phone && <p style={s.garageInfo}>טל: {data.garage.phone}</p>}
          {data.garage.email && <p style={s.garageInfo}>{data.garage.email}</p>}
        </div>
        <div style={s.headerLeft}>
          <p style={{ ...s.garageInfo, fontSize: '10px' }}>תאריך: {formatDateDoc(data.date)}</p>
          {data.garage.manager_license && (
            <p style={s.garageInfo}>רישיון מוסך: {data.garage.manager_license}</p>
          )}
        </div>
      </div>

      {/* Title */}
      <div style={s.docTitle}>{title}</div>
      <div style={s.docNumber}>מספר: {data.doc_number}</div>
    </>
  )
}
