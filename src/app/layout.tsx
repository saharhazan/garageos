import type { Metadata, Viewport } from 'next'
import { Heebo } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  variable: '--font-heebo',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'GarageOS - מערכת ניהול מוסך חכמה',
    template: '%s | GarageOS',
  },
  description: 'מערכת ניהול המוסך החכמה של ישראל. נהלו כרטיסי עבודה, לקוחות, מלאי והתראות - הכל ממקום אחד, בעברית, מכל מכשיר.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    apple: '/icon-192.png',
  },
  openGraph: {
    type: 'website',
    locale: 'he_IL',
    siteName: 'GarageOS',
    title: 'GarageOS - המוסך שלך. סוף סוף בסדר.',
    description: 'מערכת ניהול המוסך היחידה שנבנתה עבור המכונאים, מנהלי העבודה ובעלי המוסכים של ישראל. התחילו בחינם.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GarageOS - מערכת ניהול מוסך',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GarageOS - המוסך שלך. סוף סוף בסדר.',
    description: 'מערכת ניהול המוסך היחידה שנבנתה עבור המכונאים של ישראל. התחילו בחינם.',
    images: ['/og-image.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GarageOS',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#121414',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="he"
      dir="rtl"
      suppressHydrationWarning
      className={heebo.variable}
      style={{ fontFamily: 'var(--font-heebo), system-ui, sans-serif' }}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
