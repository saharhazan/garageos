'use client'

import type { DocumentData } from '@/types'
import { getDocumentStyles } from './shared-styles'
import { DocumentHeader } from './document-header'
import { CustomerVehicleSection } from './customer-vehicle-section'
import { CustomFieldsSection } from './custom-fields-section'

interface VehicleIntakeProps {
  data: DocumentData
}

export function VehicleIntakeTemplate({ data }: VehicleIntakeProps) {
  const s = getDocumentStyles(data.garage.primary_color, data.garage.secondary_color)

  return (
    <div style={s.page}>
      <DocumentHeader data={data} title="טופס קבלת רכב" />

      {data.order?.job_number && (
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <span style={s.badge}>כרטיס עבודה: {data.order.job_number}</span>
        </div>
      )}

      <CustomerVehicleSection data={data} showVehicleExtended />

      {/* Extended vehicle details */}
      <div style={{ marginBottom: '16px' }}>
        <div style={s.sectionTitle}>מצב הרכב בקבלה</div>
        <div style={s.infoGrid}>
          <div style={s.infoRow}>
            <span style={s.infoLabel}>קילומטראז׳:</span>
            <span style={s.infoValue}>
              {data.order?.mileage
                ? `${data.order.mileage.toLocaleString('he-IL')} ק"מ`
                : data.custom_fields?.mileage || '________'}
            </span>
          </div>
          <div style={s.infoRow}>
            <span style={s.infoLabel}>מפלס דלק:</span>
            <span style={s.infoValue}>{data.fuel_level || data.custom_fields?.fuel_level || '________'}</span>
          </div>
        </div>
      </div>

      {/* Existing damage */}
      <div style={{ marginBottom: '16px' }}>
        <div style={s.sectionTitle}>נזקים קיימים / הערות</div>
        <div style={s.notesBox}>
          <p style={s.notesText}>
            {data.existing_damage || data.custom_fields?.existing_damage || ''}
          </p>
          {!data.existing_damage && !data.custom_fields?.existing_damage && (
            <div style={{ height: '60px' }} />
          )}
        </div>
      </div>

      {/* Customer complaint */}
      {data.order?.notes && (
        <div style={{ marginBottom: '16px' }}>
          <div style={s.sectionTitle}>תיאור תקלה / בקשת לקוח</div>
          <div style={s.notesBox}>
            <p style={s.notesText}>{data.order.notes}</p>
          </div>
        </div>
      )}

      {/* Personal belongings */}
      <div style={{ marginBottom: '16px' }}>
        <div style={s.sectionTitle}>חפצים אישיים ברכב</div>
        <div style={s.notesBox}>
          <p style={s.notesText}>
            {data.personal_belongings || data.custom_fields?.personal_belongings || ''}
          </p>
          {!data.personal_belongings && !data.custom_fields?.personal_belongings && (
            <div style={{ height: '40px' }} />
          )}
        </div>
      </div>

      {/* Keys */}
      <div style={{ marginBottom: '16px' }}>
        <div style={s.infoRow}>
          <span style={s.infoLabel}>מספר מפתחות שנמסרו:</span>
          <span style={s.infoValue}>{data.keys_count || data.custom_fields?.keys_count || '________'}</span>
        </div>
      </div>

      <CustomFieldsSection data={data} />

      {/* Disclaimer */}
      <div style={{ marginBottom: '16px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '4px', border: '1px solid #ffc107' }}>
        <p style={{ fontSize: '9px', color: '#856404', margin: 0 }}>
          המוסך אינו אחראי לחפצים אישיים שנשארו ברכב. הלקוח מאשר כי בדק את הרכב ומסר את המפתחות.
          כל נזק קיים ברכב תועד למעלה. המוסך לא יהיה אחראי לנזקים שלא תועדו בטופס זה.
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
