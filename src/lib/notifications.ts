import type { OrderStatus, GarageSettings } from '@/types'

/**
 * Build a Hebrew SMS/WhatsApp message for a given order status change.
 */
export function buildStatusMessage(
  status: OrderStatus,
  vehiclePlate: string,
  garageName: string
): string {
  switch (status) {
    case 'received':
      return `✓ הרכב ${vehiclePlate} התקבל ב${garageName}. נעדכן אותך כשיהיה מוכן.`
    case 'in_progress':
      return `🔧 הטיפול ב${vehiclePlate} החל. נעדכן אותך בסיום.`
    case 'ready':
      return `🎉 הרכב ${vehiclePlate} מוכן לאיסוף! אפשר לבוא.`
    case 'delivered':
      return `תודה שבחרת ב${garageName}! נשמח לראותך שוב.`
    case 'cancelled':
      return `הזמנת הטיפול לרכב ${vehiclePlate} בוטלה. ליצירת קשר: ${garageName}.`
    default:
      return `עדכון עבור הרכב ${vehiclePlate} מ${garageName}.`
  }
}

interface OrderForNotification {
  id: string
  garage_id: string
  customer: {
    phone: string
    full_name: string
  }
  vehicle: {
    license_plate: string
  }
  garage: {
    name: string
    settings: GarageSettings
  }
}

/**
 * Send a status notification for an order.
 * Fetches order details and dispatches to the appropriate channel.
 */
export async function sendOrderNotification(
  order: OrderForNotification,
  status: OrderStatus
): Promise<void> {
  const { customer, vehicle, garage } = order
  const settings = garage.settings
  const message = buildStatusMessage(status, vehicle.license_plate, garage.name)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

  if (!settings.auto_notify_on_status_change) return
  if (!settings.sms_enabled && !settings.whatsapp_enabled) return

  if (settings.whatsapp_enabled) {
    await fetch(`${baseUrl}/api/whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: customer.phone, message }),
    }).catch((err) => console.error('sendOrderNotification (whatsapp) error:', err))
  } else if (settings.sms_enabled) {
    await fetch(`${baseUrl}/api/sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: customer.phone, message }),
    }).catch((err) => console.error('sendOrderNotification (sms) error:', err))
  }
}
