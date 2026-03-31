'use client'

import type { DocumentData } from '@/types'
import { getDocumentStyles, formatDateDoc } from './shared-styles'
import { DocumentHeader } from './document-header'
import { CustomerVehicleSection } from './customer-vehicle-section'
import { CustomFieldsSection } from './custom-fields-section'

interface WarrantyTemplateProps {
  data: DocumentData
}

export function WarrantyTemplate({ data }: WarrantyTemplateProps) {
  const s = getDocumentStyles(data.garage.primary_color, data.garage.secondary_color)

  return (
    <div style={s.page}>
      <DocumentHeader data={data} title="תעודת אחריות" />

      {data.order?.job_number && (
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <span style={s.badge}>כרטיס עבודה: {data.order.job_number}</span>
        </div>
      )}

      {/* Garage license */}
      {data.garage.manager_license && (
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <span style={s.badge}>רישיון מוסך: {data.garage.manager_license}</span>
        </div>
      )}

      <CustomerVehicleSection data={data} showVehicleExtended />

      {/* Work performed */}
      <div style={{ marginBottom: '16px' }}>
        <div style={s.sectionTitle}>סיכום עבודות שבוצעו</div>
        {data.items && data.items.length > 0 ? (
          <table style={s.table}>
            <thead>
              <tr style={s.tableHeader}>
                <th style={s.th}>#</th>
                <th style={{ ...s.th, width: '60%' }}>תיאור</th>
                <th style={{ ...s.th, textAlign: 'center' }}>כמות</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={item.id || index} style={index % 2 === 1 ? s.rowEven : undefined}>
                  <td style={s.td}>{index + 1}</td>
                  <td style={s.td}>{item.description}</td>
                  <td style={s.tdCenter}>{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={s.notesBox}>
            <p style={s.notesText}>
              {data.custom_fields?.work_summary || ''}
            </p>
            {!data.custom_fields?.work_summary && <div style={{ height: '60px' }} />}
          </div>
        )}
      </div>

      {/* Parts info */}
      <div style={{ marginBottom: '16px' }}>
        <div style={s.sectionTitle}>חלקים שהותקנו</div>
        <div style={s.infoRow}>
          <span style={s.infoLabel}>סוג חלקים:</span>
          <span style={s.infoValue}>{data.parts_type || data.custom_fields?.parts_type || 'חדש'}</span>
        </div>
      </div>

      {/* Warranty period */}
      <div style={{ marginBottom: '16px' }}>
        <div style={s.sectionTitle}>תקופת אחריות</div>
        <div style={{ ...s.notesBox, borderRightColor: data.garage.primary_color || '#0d5c63' }}>
          <p style={{ ...s.notesText, fontWeight: '700', fontSize: '13px' }}>
            {data.warranty_period || data.custom_fields?.warranty_period || '12 חודשים / 20,000 ק"מ (המוקדם מביניהם)'}
          </p>
        </div>
      </div>

      {/* Warranty conditions */}
      <div style={{ marginBottom: '16px' }}>
        <div style={s.sectionTitle}>תנאי אחריות</div>
        <div style={s.notesBox}>
          <p style={s.notesText}>
            {data.warranty_conditions ||
              data.custom_fields?.warranty_conditions ||
              `1. האחריות תקפה מתאריך ${formatDateDoc(data.date)} בלבד.\n2. האחריות חלה על עבודות ו/או חלקים כמפורט לעיל בלבד.\n3. האחריות מותנית בשימוש סביר ותקין ברכב.\n4. האחריות אינה חלה במקרה של נזק עקב תאונה, שימוש לא סביר, או טיפול במוסך אחר.\n5. על הלקוח להביא את הרכב למוסך מיד עם גילוי תקלה הקשורה לעבודה שבוצעה.\n6. אין החזר כספי - תיקון חוזר בלבד.`}
          </p>
        </div>
      </div>

      {/* Order dates */}
      {data.order && (
        <div style={{ marginBottom: '16px' }}>
          <div style={s.infoGrid}>
            <div style={s.infoRow}>
              <span style={s.infoLabel}>תאריך עבודה:</span>
              <span style={s.infoValue}>{formatDateDoc(data.order.created_at)}</span>
            </div>
            {data.order.completed_at && (
              <div style={s.infoRow}>
                <span style={s.infoLabel}>תאריך סיום:</span>
                <span style={s.infoValue}>{formatDateDoc(data.order.completed_at)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <CustomFieldsSection data={data} />

      {/* Signature */}
      <div style={s.signatureLine}>
        <div style={s.signatureBlock}>
          {data.garage.stamp_url && (
            <img
              src={data.garage.stamp_url}
              alt="חותמת"
              style={{ width: '80px', height: '80px', objectFit: 'contain', margin: '0 auto' }}
            />
          )}
          <div style={s.signatureDivider} />
          <div style={s.signatureLabel}>
            {data.garage.manager_name
              ? `${data.garage.manager_name} - מנהל מקצועי`
              : 'חתימת המנהל המקצועי'}
          </div>
        </div>
        <div style={s.signatureBlock}>
          <div style={s.signatureDivider} />
          <div style={s.signatureLabel}>חתימת הלקוח</div>
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
