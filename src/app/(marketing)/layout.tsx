import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'

const navLinks = [
  { href: '/', label: 'ראשי' },
  { href: '/#features', label: 'תכונות' },
  { href: '/pricing', label: 'מחירים' },
]

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }
  return (
    <div className="min-h-dvh flex flex-col bg-[#09090b]">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-[#27272a] bg-[#09090b]/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-[6px] bg-[#3b82f6]">
              <span className="text-white text-base font-bold leading-none">G</span>
            </div>
            <span className="text-lg font-semibold text-[#fafafa]">GarageOS</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-[#a1a1aa] hover:text-[#fafafa] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                כניסה
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="primary" size="sm">
                התחל בחינם
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-[#27272a] bg-[#09090b]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Link href="/" className="flex items-center gap-2.5 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-[6px] bg-[#3b82f6]">
                  <span className="text-white text-base font-bold leading-none">G</span>
                </div>
                <span className="text-lg font-semibold text-[#fafafa]">GarageOS</span>
              </Link>
              <p className="text-sm text-[#52525b] max-w-xs">
                מערכת ניהול מוסך מקצועית שנבנתה כדי לפשט את העבודה היומיומית שלך.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-medium text-[#fafafa] mb-3">מוצר</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/#features" className="text-sm text-[#52525b] hover:text-[#a1a1aa] transition-colors">
                    תכונות
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-sm text-[#52525b] hover:text-[#a1a1aa] transition-colors">
                    מחירים
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-sm font-medium text-[#fafafa] mb-3">תמיכה</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/login" className="text-sm text-[#52525b] hover:text-[#a1a1aa] transition-colors">
                    כניסה למערכת
                  </Link>
                </li>
                <li>
                  <span className="text-sm text-[#52525b]">
                    support@garageos.co.il
                  </span>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-medium text-[#fafafa] mb-3">משפטי</h4>
              <ul className="space-y-2">
                <li>
                  <span className="text-sm text-[#52525b]">
                    תנאי שימוש
                  </span>
                </li>
                <li>
                  <span className="text-sm text-[#52525b]">
                    מדיניות פרטיות
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 pt-6 border-t border-[#27272a] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#52525b]">
              {'\u00A9'} {new Date().getFullYear()} GarageOS. כל הזכויות שמורות.
            </p>
            <p className="text-xs text-[#52525b]">
              נבנה באהבה לבעלי מוסכים בישראל
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
