import type { OrderStatus, OrderItem } from '@/types'

interface EmailTemplateData {
  garageName: string
  garageAddress?: string
  garagePhone?: string
  garageLogo?: string
  customerName: string
  jobNumber: string
  vehicleMake?: string
  vehicleModel?: string
  vehiclePlate: string
  items?: OrderItem[]
  totalAmount?: number
}

const STATUS_SUBJECTS: Record<OrderStatus, (garageName: string) => string> = {
  received: (g) => `הרכב שלך התקבל במוסך ${g}`,
  in_progress: (g) => `התחלנו לטפל ברכב שלך - ${g}`,
  ready: (g) => `הרכב שלך מוכן לאיסוף! - ${g}`,
  delivered: (g) => `תודה שבחרת ב-${g}`,
  cancelled: (g) => `עדכון מ${g}`,
}

const STATUS_BODY: Record<OrderStatus, (data: EmailTemplateData) => string> = {
  received: (d) =>
    `שלום ${d.customerName},<br><br>הרכב שלך (${d.vehicleMake ?? ''} ${d.vehicleModel ?? ''} - ${d.vehiclePlate}) התקבל במוסך <strong>${d.garageName}</strong>.<br>מספר עבודה: <strong>${d.jobNumber}</strong><br><br>נעדכן אותך כשנתחיל לטפל ברכב.`,
  in_progress: (d) =>
    `שלום ${d.customerName},<br><br>התחלנו לטפל ברכב שלך (${d.vehicleMake ?? ''} ${d.vehicleModel ?? ''} - ${d.vehiclePlate}).<br>מספר עבודה: <strong>${d.jobNumber}</strong><br><br>נעדכן אותך כשהרכב יהיה מוכן.`,
  ready: (d) =>
    `שלום ${d.customerName},<br><br>🎉 <strong>הרכב שלך מוכן לאיסוף!</strong><br>רכב: ${d.vehicleMake ?? ''} ${d.vehicleModel ?? ''} - ${d.vehiclePlate}<br>מספר עבודה: <strong>${d.jobNumber}</strong><br><br>אפשר לבוא לאסוף את הרכב.`,
  delivered: (d) =>
    `שלום ${d.customerName},<br><br>תודה שבחרת ב<strong>${d.garageName}</strong>!<br>רכבך (${d.vehiclePlate}) נמסר בהצלחה.<br><br>נשמח לראותך שוב!`,
  cancelled: (d) =>
    `שלום ${d.customerName},<br><br>הזמנת הטיפול עבור הרכב ${d.vehiclePlate} (מספר עבודה: ${d.jobNumber}) בוטלה.<br><br>ליצירת קשר: ${d.garageName}`,
}

function buildItemsTable(items: OrderItem[]): string {
  if (!items || items.length === 0) return ''
  const rows = items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #3a3c3c;color:#e2e2e2;font-size:14px;">${item.description}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #3a3c3c;color:#bfc8c9;font-size:14px;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #3a3c3c;color:#bfc8c9;font-size:14px;text-align:left;">₪${item.unit_price.toLocaleString()}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #3a3c3c;color:#e2e2e2;font-size:14px;font-weight:bold;text-align:left;">₪${item.total.toLocaleString()}</td>
        </tr>`
    )
    .join('')
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:16px;">
      <thead>
        <tr style="background-color:#1e2020;">
          <th style="padding:8px 12px;text-align:right;color:#8fd1d9;font-size:12px;font-weight:600;border-bottom:2px solid #0d5c63;">פירוט</th>
          <th style="padding:8px 12px;text-align:center;color:#8fd1d9;font-size:12px;font-weight:600;border-bottom:2px solid #0d5c63;">כמות</th>
          <th style="padding:8px 12px;text-align:left;color:#8fd1d9;font-size:12px;font-weight:600;border-bottom:2px solid #0d5c63;">מחיר</th>
          <th style="padding:8px 12px;text-align:left;color:#8fd1d9;font-size:12px;font-weight:600;border-bottom:2px solid #0d5c63;">סה&quot;כ</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`
}

/**
 * Generate a styled HTML email for order status notifications.
 * Uses inline CSS for maximum email client compatibility.
 */
export function buildStatusEmailHtml(
  status: OrderStatus,
  data: EmailTemplateData
): string {
  const body = STATUS_BODY[status]?.(data) ?? `עדכון עבור הרכב ${data.vehiclePlate} מ${data.garageName}.`
  const itemsHtml = data.items && data.items.length > 0 ? buildItemsTable(data.items) : ''
  const totalHtml =
    data.totalAmount != null
      ? `<div style="margin-top:12px;padding:12px 16px;background-color:#0d5c63;border-radius:8px;text-align:left;">
          <span style="color:#bfc8c9;font-size:13px;">סה&quot;כ: </span>
          <span style="color:#e2e2e2;font-size:18px;font-weight:bold;">₪${data.totalAmount.toLocaleString()}</span>
        </div>`
      : ''

  const logoHtml = data.garageLogo
    ? `<img src="${data.garageLogo}" alt="${data.garageName}" style="max-height:48px;max-width:180px;margin-bottom:12px;" />`
    : ''

  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${STATUS_SUBJECTS[status]?.(data.garageName) ?? 'עדכון'}</title>
</head>
<body style="margin:0;padding:0;background-color:#121414;font-family:'Heebo','Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#121414;padding:24px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#282a2a;border-radius:12px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color:#0d5c63;padding:20px 24px;text-align:center;">
              ${logoHtml}
              <h1 style="margin:0;color:#e2e2e2;font-size:18px;font-weight:700;">${data.garageName}</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:24px;">
              <p style="margin:0 0 16px 0;color:#e2e2e2;font-size:15px;line-height:1.7;">
                ${body}
              </p>
              ${itemsHtml}
              ${totalHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 24px;border-top:1px solid #3a3c3c;text-align:center;">
              <p style="margin:0;color:#bfc8c9;font-size:12px;line-height:1.6;">
                ${data.garageAddress ? `${data.garageAddress}<br>` : ''}
                ${data.garagePhone ? `טלפון: ${data.garagePhone}<br>` : ''}
                <span style="color:#8fd1d9;">${data.garageName}</span> &mdash; ניהול מוסכים חכם
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/**
 * Get the email subject for a given status.
 */
export function getStatusEmailSubject(
  status: OrderStatus,
  garageName: string
): string {
  return STATUS_SUBJECTS[status]?.(garageName) ?? `עדכון מ${garageName}`
}
