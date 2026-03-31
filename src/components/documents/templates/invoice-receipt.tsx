'use client'

import type { DocumentData } from '@/types'
import { getDocumentStyles } from './shared-styles'
import { DocumentHeader } from './document-header'
import { CustomerVehicleSection } from './customer-vehicle-section'
import { ItemsTable } from './items-table'
import { CustomFieldsSection } from './custom-fields-section'

interface InvoiceReceiptProps {
  data: DocumentData
}

export function InvoiceReceipt({ data }: InvoiceReceiptProps) {
  const s = getDocumentStyles(data.garage.primary_color, data.garage.secondary_color)

  const title =
    data.doc_type === 'invoice'
      ? 'חשבונית מס'
      : data.doc_type === 'receipt'
      ? 'קבלה'
      : 'חשבונית מס / קבלה'

  return (
    <div style={s.page}>
      <DocumentHeader data={data} title={title} />

      {/* Reference: job number */}
      {data.order?.job_number && (
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <span style={s.badge}>כרטיס עבודה: {data.order.job_number}</span>
        </div>
      )}

      <CustomerVehicleSection data={data} />

      <ItemsTable data={data} showTotals={true} />

      <CustomFieldsSection data={data} />

      {/* Payment Method */}
      {data.doc_type !== 'invoice' && (
        <div style={{ marginBottom: '16px' }}>
          <div style={s.sectionTitle}>אמצעי תשלום</div>
          <div style={s.infoRow}>
            <span style={s.infoLabel}>אופן תשלום:</span>
            <span style={s.infoValue}>{data.custom_fields?.payment_method || 'מזומן / אשראי / העברה'}</span>
          </div>
        </div>
      )}

      {/* Bank Details */}
      {(data.garage.bank_name || data.garage.bank_account) && (
        <div style={{ marginBottom: '16px' }}>
          <div style={s.sectionTitle}>פרטי חשבון בנק</div>
          <div style={s.infoGrid}>
            {data.garage.bank_name && (
              <div style={s.infoRow}>
                <span style={s.infoLabel}>בנק:</span>
                <span style={s.infoValue}>{data.garage.bank_name}</span>
              </div>
            )}
            {data.garage.bank_branch && (
              <div style={s.infoRow}>
                <span style={s.infoLabel}>סניף:</span>
                <span style={s.infoValue}>{data.garage.bank_branch}</span>
              </div>
            )}
            {data.garage.bank_account && (
              <div style={s.infoRow}>
                <span style={s.infoLabel}>חשבון:</span>
                <span style={s.infoValue}>{data.garage.bank_account}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Signature Line */}
      <div style={s.signatureLine}>
        <div style={s.signatureBlock}>
          <div style={s.signatureDivider} />
          <div style={s.signatureLabel}>חתימת הלקוח</div>
        </div>
        <div style={s.signatureBlock}>
          <div style={s.signatureDivider} />
          <div style={s.signatureLabel}>חתימת המוסך</div>
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
