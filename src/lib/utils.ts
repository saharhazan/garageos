import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import { he } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'dd/MM/yyyy', { locale: he })
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: he })
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: he })
}

export function generateJobNumber(prefix: string, year: number, sequence: number): string {
  return `${prefix}-${year}-${String(sequence).padStart(4, '0')}`
}

export const STATUS_LABELS: Record<string, string> = {
  received: 'התקבל',
  in_progress: 'בטיפול',
  ready: 'מוכן',
  delivered: 'נמסר',
  cancelled: 'בוטל',
}

export const PRIORITY_LABELS: Record<string, string> = {
  normal: 'רגיל',
  high: 'גבוה',
  urgent: 'דחוף',
}

export const ROLE_LABELS: Record<string, string> = {
  super_admin: 'מנהל מערכת',
  manager: 'מנהל מוסך',
  receptionist: 'קבלה',
  technician: 'מכונאי',
  viewer: 'צפייה בלבד',
}
