'use client'

import type { DocumentData } from '@/types'
import { getDocumentStyles, formatDateDoc } from './shared-styles'
import { DocumentHeader } from './document-header'
import { CustomerVehicleSection } from './customer-vehicle-section'
import { ItemsTable } from './items-table'
import { CustomFieldsSection } from './custom-fields-section'

interface WorkOrderTemplateProps {
  data: DocumentData
}

const STATUS_LABELS: Record<string, string> = {
  received: 'התקבל',
  in_progress: 'בטיפול',
  ready: 'מוכן לאיסוף',
  delivered: 'נמסר ללקוח',
  cancelled: 'בוטל',
}

const PRIORITY_LABELS: Record<string, string> = {
  normal: 'רגיל',
  high: 'גבוה',
  urgent: 'דחוף',
}

export function WorkOrderTemplate({ data }: WorkOrderTemplateProps) {
  const s = getDocumentStyles(data.garage.primary_color, data.garage.secondary_color)

  return (
    <div style={s.page}>
      <DocumentHeader data={data} title="כרטיס עבודה" />

      {/* Order meta */}
      {data.order && (
        <div style={{ ...s.infoGrid, marginBottom: '16px' }}>
          <div>
            <div style={s.sectionTitle}>פרטי עבודה</div>
            <div style={s.infoRow}>
              <span style={s.infoLabel}>מספר עבודה:</span>
              <span style={{ ...s.infoValue, fontWeight: '800' }}>{data.order.job_number}</span>
            </div>
            <div style={s.infoRow}>
              <span style={s.infoLabel}>סטטוס:</span>
              <span style={s.infoValue}>{STATUS_LABELS[data.order.status] || data.order.status}</span>
            </div>
            <div style={s.infoRow}>
              <span style={s.infoLabel}>עדיפות:</span>
              <span style={s.infoValue}>{PRIORITY_LABELS[data.order.priority] || data.order.priority}</span>
            </div>
            {data.order.technician_name && (
              <div style={s.infoRow}>
                <span style={s.infoLabel}>מכונאי:</span>
                <span style={s.infoValue}>{data.order.technician_name}</span>
              </div>
            )}
          </div>
          <div>
            <div style={s.sectionTitle}>תאריכים</div>
            <div style={s.infoRow}>
              <span style={s.infoLabel}>נפתח:</span>
              <span style={s.infoValue}>{formatDateDoc(data.order.created_at)}</span>
            </div>
            <div style={s.infoRow}>
              <span style={s.infoLabel}>עודכן:</span>
              <span style={s.infoValue}>{formatDateDoc(data.order.updated_at)}</span>
            </div>
            {data.order.completed_at && (
              <div style={s.infoRow}>
                <span style={s.infoLabel}>הושלם:</span>
                <span style={s.infoValue}>{formatDateDoc(data.order.completed_at)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <CustomerVehicleSection data={data} showVehicleExtended />

      {/* Customer complaint */}
      {data.order?.notes && (
        <div style={{ marginBottom: '16px' }}>
          <div style={s.sectionTitle}>תיאור תקלה / בקשת לקוח</div>
          <div style={s.notesBox}>
            <p style={s.notesText}>{data.order.notes}</p>
          </div>
        </div>
      )}

      <ItemsTable data={data} showTotals={true} />

      <CustomFieldsSection data={data} />

      {/* Signatures */}
      <div style={s.signatureLine}>
        <div style={s.signatureBlock}>
          <div style={s.signatureDivider} />
          <div style={s.signatureLabel}>חתימת לקוח בקבלה</div>
        </div>
        <div style={s.signatureBlock}>
          <div style={s.signatureDivider} />
          <div style={s.signatureLabel}>חתימת מכונאי</div>
        </div>
        <div style={s.signatureBlock}>
          <div style={s.signatureDivider} />
          <div style={s.signatureLabel}>חתימת לקוח במסירה</div>
        </div>
      </div>

      {/* Footer */}
      <div style={s.footer}>
        <p style={{ margin: 0 }}>
          {data.garage.legal_name || data.garage.name}
          {data.garage.osek_number && ` | ע.מ ${data.garage.osek_number}`}
          {data.garage.address && ` | ${data.garage.address}`}
        </p>
        <p style={{ margin: '2px 0 0 0' }}>מסמך זה הופק על ידי מערכת GarageOS</p>
      </div>
    </div>
  )
}
