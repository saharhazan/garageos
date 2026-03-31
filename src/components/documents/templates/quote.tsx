'use client'

import type { DocumentData } from '@/types'
import { getDocumentStyles, formatDateDoc } from './shared-styles'
import { DocumentHeader } from './document-header'
import { CustomerVehicleSection } from './customer-vehicle-section'
import { ItemsTable } from './items-table'
import { CustomFieldsSection } from './custom-fields-section'

interface QuoteTemplateProps {
  data: DocumentData
}

export function QuoteTemplate({ data }: QuoteTemplateProps) {
  const s = getDocumentStyles(data.garage.primary_color, data.garage.secondary_color)

  return (
    <div style={s.page}>
      <DocumentHeader data={data} title="הצעת מחיר" />

      {/* Quote-specific info */}
      {data.quote_number && (
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <span style={s.badge}>הצעה מס׳: {data.quote_number}</span>
        </div>
      )}

      <CustomerVehicleSection data={data} />

      {/* Validity */}
      {data.valid_until && (
        <div style={{ marginBottom: '16px' }}>
          <div style={s.sectionTitle}>תוקף ההצעה</div>
          <div style={s.infoRow}>
            <span style={s.infoLabel}>בתוקף עד:</span>
            <span style={{ ...s.infoValue, fontWeight: '700' }}>{formatDateDoc(data.valid_until)}</span>
          </div>
        </div>
      )}

      <ItemsTable data={data} showTotals={true} />

      <CustomFieldsSection data={data} />

      {/* Terms */}
      <div style={{ marginBottom: '16px' }}>
        <div style={s.sectionTitle}>תנאים</div>
        <div style={s.notesBox}>
          <p style={s.notesText}>
            {data.custom_fields?.terms ||
              'הצעת מחיר זו תקפה לתקופה המצוינת לעיל. המחירים כוללים מע"מ כחוק. זמני ביצוע משוערים ויתואמו עם הלקוח. אחריות על עבודות ע"פ תנאי המוסך.'}
          </p>
        </div>
      </div>

      {/* Approval signature */}
      <div style={s.signatureLine}>
        <div style={s.signatureBlock}>
          <div style={s.signatureDivider} />
          <div style={s.signatureLabel}>אישור וחתימת לקוח</div>
        </div>
        <div style={s.signatureBlock}>
          <div style={s.signatureDivider} />
          <div style={s.signatureLabel}>תאריך אישור</div>
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
