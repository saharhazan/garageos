'use client'

import type { DocumentData } from '@/types'
import { getDocumentStyles } from './shared-styles'

interface CustomFieldsSectionProps {
  data: DocumentData
}

export function CustomFieldsSection({ data }: CustomFieldsSectionProps) {
  const s = getDocumentStyles(data.garage.primary_color, data.garage.secondary_color)
  const fields = data.custom_field_definitions || []
  const values = data.custom_fields || {}

  if (fields.length === 0) return null

  // Only show fields that have values
  const fieldsWithValues = fields.filter((f) => values[f.field_name])
  if (fieldsWithValues.length === 0) return null

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={s.sectionTitle}>שדות נוספים</div>
      <div style={s.infoGrid}>
        {fieldsWithValues.map((field) => (
          <div key={field.id} style={s.infoRow}>
            <span style={s.infoLabel}>{field.field_label}:</span>
            <span style={s.infoValue}>
              {field.field_type === 'checkbox'
                ? values[field.field_name] === 'true'
                  ? 'כן'
                  : 'לא'
                : values[field.field_name]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
