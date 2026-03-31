'use client'

import type { DocumentData } from '@/types'
import { getDocumentStyles, formatCurrencyDoc } from './shared-styles'
import { DocumentHeader } from './document-header'
import { CustomerVehicleSection } from './customer-vehicle-section'
import { CustomFieldsSection } from './custom-fields-section'

interface VehicleReleaseProps {
  data: DocumentData
}

export function VehicleReleaseTemplate({ data }: VehicleReleaseProps) {
  const s = getDocumentStyles(data.garage.primary_color, data.garage.secondary_color)

  return (
    <div style={s.page}>
      <DocumentHeader data={data} title="טופס מסירת רכב" />

      {data.order?.job_number && (
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <span style={s.badge}>כרטיס עבודה: {data.order.job_number}</span>
        </div>
      )}

      <CustomerVehicleSection data={data} showVehicleExtended />

      {/* Work summary */}
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
            <div style={{ height: '60px' }} />
          </div>
        )}
      </div>

      {/* Total */}
      {data.total_amount > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={s.totalsSection}>
            <div style={s.totalsBox}>
              <div style={s.totalsFinalRow}>
                <span style={s.totalFinalLabel}>סה&quot;כ לתשלום:</span>
                <span style={s.totalFinalValue}>{formatCurrencyDoc(data.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      {data.order?.notes && (
        <div style={{ marginBottom: '16px' }}>
          <div style={s.sectionTitle}>הערות</div>
          <div style={s.notesBox}>
            <p style={s.notesText}>{data.order.notes}</p>
          </div>
        </div>
      )}

      <CustomFieldsSection data={data} />

      {/* Confirmation */}
      <div style={{ marginBottom: '16px', padding: '10px', backgroundColor: '#d4edda', borderRadius: '4px', border: '1px solid #28a745' }}>
        <p style={{ fontSize: '10px', color: '#155724', margin: 0 }}>
          הנני מאשר/ת כי קיבלתי את הרכב חזרה, בדקתי את מצבו, ואני מרוצה מהעבודה שבוצעה.
          אני מודע/ת לתנאי האחריות על העבודות שבוצעו.
        </p>
      </div>

      {/* Signature */}
      <div style={s.signatureLine}>
        <div style={s.signatureBlock}>
          <div style={s.signatureDivider} />
          <div style={s.signatureLabel}>חתימת הלקוח</div>
        </div>
        <div style={s.signatureBlock}>
          <div style={s.signatureDivider} />
          <div style={s.signatureLabel}>חתימת נציג המוסך</div>
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
