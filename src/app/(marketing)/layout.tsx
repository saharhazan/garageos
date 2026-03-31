import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'

const navLinks = [
  { href: '/', label: 'בית' },
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
    <div className="min-h-dvh flex flex-col bg-surface">
      {/* Navbar */}
      <header className="fixed top-0 right-0 left-0 h-16 z-50 bg-surface/80 backdrop-blur-md border-b border-white/5 flex items-center px-6 md:px-8">
        <div className="w-full max-w-7xl mx-auto flex flex-row-reverse justify-between items-center">
          {/* Logo + Nav */}
          <div className="flex items-center gap-10 flex-row-reverse">
            <Link href="/">
              <img src="/logo.png" alt="GarageOS" className="h-16 w-auto object-contain" />
            </Link>
            <nav className="hidden md:flex flex-row-reverse gap-8 items-center">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-bold text-sm text-on-surface-variant/60 hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Auth buttons */}
          <div className="flex items-center gap-4 flex-row-reverse">
            <Link href="/login" className="hidden sm:inline-flex">
              <Button variant="ghost" size="sm" className="text-on-surface-variant hover:text-primary">
                כניסה
              </Button>
            </Link>
            <Link href="/login">
              <button className="bg-primary-container text-white px-6 py-2 font-bold rounded-md machined-button hover:brightness-110 active:scale-95 transition-all">
                התחל בחינם
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pt-16">{children}</main>

      {/* Footer */}
      <footer className="bg-surface-lowest py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="flex flex-col md:flex-row-reverse justify-between items-center gap-8">
            {/* Logo */}
            <Link href="/">
              <img src="/logo.png" alt="GarageOS" className="h-20 w-auto object-contain" />
            </Link>

            {/* Footer links */}
            <div className="flex gap-12 flex-row-reverse text-right">
              <div>
                <h5 className="font-bold text-on-surface mb-4">מוצר</h5>
                <ul className="text-on-surface-variant space-y-2 text-sm">
                  <li><Link className="hover:text-primary transition-colors" href="/#features">תכונות</Link></li>
                  <li><Link className="hover:text-primary transition-colors" href="/pricing">מחירים</Link></li>
                  <li><Link className="hover:text-primary transition-colors" href="/#features">אבטחה</Link></li>
                </ul>
              </div>
              <div>
                <h5 className="font-bold text-on-surface mb-4">חברה</h5>
                <ul className="text-on-surface-variant space-y-2 text-sm">
                  <li><Link className="hover:text-primary transition-colors" href="/about">עלינו</Link></li>
                  <li><Link className="hover:text-primary transition-colors" href="/support">תמיכה</Link></li>
                </ul>
              </div>
              <div>
                <h5 className="font-bold text-on-surface mb-4">משפטי</h5>
                <ul className="text-on-surface-variant space-y-2 text-sm">
                  <li><Link className="hover:text-primary transition-colors" href="/privacy">מדיניות פרטיות</Link></li>
                  <li><Link className="hover:text-primary transition-colors" href="/terms">תנאי שימוש</Link></li>
                </ul>
              </div>
            </div>

            {/* Copyright */}
            <div className="text-center md:text-right">
              <p className="text-on-surface-variant text-sm">
                {'\u00A9'} {new Date().getFullYear()} GarageOS. כל הזכויות שמורות.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
