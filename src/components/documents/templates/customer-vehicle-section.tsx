'use client'

import type { DocumentData } from '@/types'
import { getDocumentStyles } from './shared-styles'

interface CustomerVehicleSectionProps {
  data: DocumentData
  showVehicleExtended?: boolean
}

export function CustomerVehicleSection({ data, showVehicleExtended }: CustomerVehicleSectionProps) {
  const s = getDocumentStyles(data.garage.primary_color, data.garage.secondary_color)

  return (
    <div style={s.infoGrid}>
      {/* Customer */}
      {data.customer && (
        <div>
          <div style={s.sectionTitle}>פרטי לקוח</div>
          <div style={s.infoRow}>
            <span style={s.infoLabel}>שם:</span>
            <span style={s.infoValue}>{data.customer.full_name}</span>
          </div>
          <div style={s.infoRow}>
            <span style={s.infoLabel}>טלפון:</span>
            <span style={{ ...s.infoValue, direction: 'ltr', textAlign: 'right' }}>{data.customer.phone}</span>
          </div>
          {data.customer.email && (
            <div style={s.infoRow}>
              <span style={s.infoLabel}>אימייל:</span>
              <span style={{ ...s.infoValue, direction: 'ltr', textAlign: 'right' }}>{data.customer.email}</span>
            </div>
          )}
        </div>
      )}

      {/* Vehicle */}
      {data.vehicle && (
        <div>
          <div style={s.sectionTitle}>פרטי רכב</div>
          <div style={s.infoRow}>
            <span style={s.infoLabel}>לוחית רישוי:</span>
            <span style={{ ...s.infoValue, fontWeight: '800', letterSpacing: '0.1em', direction: 'ltr', textAlign: 'right' }}>
              {data.vehicle.license_plate}
            </span>
          </div>
          <div style={s.infoRow}>
            <span style={s.infoLabel}>יצרן / דגם:</span>
            <span style={s.infoValue}>
              {data.vehicle.make} {data.vehicle.model}
            </span>
          </div>
          {data.vehicle.year && (
            <div style={s.infoRow}>
              <span style={s.infoLabel}>שנת ייצור:</span>
              <span style={s.infoValue}>{data.vehicle.year}</span>
            </div>
          )}
          {data.vehicle.color && (
            <div style={s.infoRow}>
              <span style={s.infoLabel}>צבע:</span>
              <span style={s.infoValue}>{data.vehicle.color}</span>
            </div>
          )}
          {showVehicleExtended && data.vehicle.vin && (
            <div style={s.infoRow}>
              <span style={s.infoLabel}>מס׳ שלדה:</span>
              <span style={{ ...s.infoValue, direction: 'ltr', textAlign: 'right' }}>{data.vehicle.vin}</span>
            </div>
          )}
          {data.order?.mileage && (
            <div style={s.infoRow}>
              <span style={s.infoLabel}>קילומטראז׳:</span>
              <span style={s.infoValue}>{data.order.mileage.toLocaleString('he-IL')} ק&quot;מ</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
