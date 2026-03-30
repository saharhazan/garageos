import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  ClipboardList,
  Users,
  Package,
  Bell,
  BarChart3,
  Smartphone,
  Check,
  ArrowLeft,
} from 'lucide-react'

const features = [
  {
    icon: ClipboardList,
    title: 'הזמנות עבודה',
    description:
      'נהל הזמנות עבודה מקבלה ועד מסירה. מעקב סטטוסים, חלקים ועלויות במקום אחד.',
  },
  {
    icon: Users,
    title: 'ניהול לקוחות',
    description:
      'מאגר לקוחות מרכזי עם היסטוריית רכבים וטיפולים. חיפוש מהיר לפי שם, טלפון או לוחית.',
  },
  {
    icon: Package,
    title: 'מלאי חלקים',
    description:
      'ניהול מלאי חכם עם התראות כשחלקים אוזלים. מעקב ספקים ומחירים.',
  },
  {
    icon: Bell,
    title: 'התראות ועדכונים',
    description:
      'שלח ללקוח עדכון סטטוס בוואטסאפ או SMS. תזכורות אוטומטיות לטיפולים.',
  },
  {
    icon: BarChart3,
    title: 'דוחות ותובנות',
    description:
      'דשבורד עם מדדים עסקיים. הכנסות, עומסי עבודה וביצועי צוות במבט אחד.',
  },
  {
    icon: Smartphone,
    title: 'אפליקציה ניידת',
    description:
      'עובד מכל מכשיר. ממשק PWA מותאם לנייד — עדכן הזמנות ישירות מהמוסך.',
  },
]

const pricingTiers = [
  {
    name: 'חינם',
    nameEn: 'Free',
    price: '0',
    period: '',
    description: 'מושלם להתחלה ולמוסכים קטנים',
    features: [
      'משתמש אחד',
      'עד 50 הזמנות בחודש',
      'ניהול לקוחות',
      'ניהול מלאי בסיסי',
      'דוחות בסיסיים',
    ],
    cta: 'התחל בחינם',
    highlighted: false,
  },
  {
    name: 'פרו',
    nameEn: 'Pro',
    price: '149',
    period: '/חודש',
    description: 'למוסכים שרוצים לצמוח',
    features: [
      'עד 5 משתמשים',
      'הזמנות ללא הגבלה',
      'התראות וואטסאפ ו-SMS',
      'ניהול מלאי מתקדם',
      'דוחות מתקדמים',
      'תמיכה בעדיפות',
    ],
    cta: 'התחל תקופת ניסיון',
    highlighted: true,
  },
  {
    name: 'עסקי',
    nameEn: 'Business',
    price: '349',
    period: '/חודש',
    description: 'לרשתות מוסכים ועסקים גדולים',
    features: [
      'עד 15 משתמשים',
      'עד 3 סניפים',
      'הזמנות ללא הגבלה',
      'כל תכונות פרו',
      'API וחיבורים',
      'מנהל חשבון ייעודי',
      'SLA מובטח',
    ],
    cta: 'צור קשר',
    highlighted: false,
  },
]

export default function LandingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#3b82f6]/5 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-20 pb-16 sm:pt-28 sm:pb-24">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#27272a] bg-[#18181b] px-3 py-1 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
              <span className="text-xs text-[#a1a1aa]">מערכת SaaS ענן -- ללא התקנה</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#fafafa] leading-tight tracking-tight">
              מערכת ניהול המוסך
              <br />
              <span className="text-[#3b82f6]">החכמה</span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-[#a1a1aa] max-w-xl mx-auto leading-relaxed">
              חסכו שעות של עבודה ידנית. נהלו הזמנות עבודה, לקוחות, מלאי
              והתראות -- הכל ממקום אחד, בעברית, מכל מכשיר.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/login">
                <Button variant="primary" size="lg" className="px-6 text-base h-11">
                  התחל בחינם
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="default" size="lg" className="px-6 text-base h-11">
                  כניסה למערכת
                </Button>
              </Link>
            </div>

            <p className="mt-4 text-xs text-[#52525b]">
              ללא כרטיס אשראי -- תוכנית חינם לנצח
            </p>
          </div>

          {/* Dashboard preview placeholder */}
          <div className="mt-14 mx-auto max-w-4xl rounded-xl border border-[#27272a] bg-[#18181b] overflow-hidden shadow-2xl shadow-black/30">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#27272a]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]/60" />
              <span className="mr-auto text-xs text-[#52525b]">GarageOS Dashboard</span>
            </div>
            <div className="p-6 sm:p-10">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'הזמנות פתוחות', value: '12', color: 'text-[#3b82f6]' },
                  { label: 'הושלמו החודש', value: '47', color: 'text-[#22c55e]' },
                  { label: 'לקוחות', value: '234', color: 'text-[#fafafa]' },
                  { label: 'הכנסות החודש', value: '45,200', color: 'text-[#eab308]' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-lg border border-[#27272a] bg-[#09090b] p-4"
                  >
                    <p className="text-xs text-[#52525b] mb-1">{stat.label}</p>
                    <p className={`text-xl sm:text-2xl font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#fafafa]">
              כל מה שצריך לניהול מוסך
            </h2>
            <p className="mt-3 text-[#a1a1aa] max-w-lg mx-auto">
              כלים מתקדמים שנבנו במיוחד עבור בעלי מוסכים בישראל
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-[#27272a] bg-[#18181b] p-5 transition-colors hover:border-[#3f3f46]"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#3b82f6]/10 mb-4">
                  <feature.icon className="w-5 h-5 text-[#3b82f6]" />
                </div>
                <h3 className="text-base font-semibold text-[#fafafa] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#a1a1aa] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 sm:py-24 border-t border-[#27272a]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#fafafa]">
              תוכניות ומחירים
            </h2>
            <p className="mt-3 text-[#a1a1aa] max-w-lg mx-auto">
              בחרו את התוכנית שמתאימה למוסך שלכם. שדרגו בכל זמן.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 max-w-4xl mx-auto">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-xl border p-6 flex flex-col ${
                  tier.highlighted
                    ? 'border-[#3b82f6] bg-[#3b82f6]/5'
                    : 'border-[#27272a] bg-[#18181b]'
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 right-4 rounded-full bg-[#3b82f6] px-3 py-0.5">
                    <span className="text-xs font-medium text-white">הכי פופולרי</span>
                  </div>
                )}

                <div className="mb-5">
                  <div className="flex items-baseline gap-1.5">
                    <h3 className="text-lg font-semibold text-[#fafafa]">{tier.name}</h3>
                    <span className="text-xs text-[#52525b]">{tier.nameEn}</span>
                  </div>
                  <p className="text-xs text-[#52525b] mt-1">{tier.description}</p>
                </div>

                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-3xl font-bold text-[#fafafa]">{tier.price}</span>
                  <span className="text-lg text-[#52525b]">{'\u20AA'}</span>
                  {tier.period && (
                    <span className="text-sm text-[#52525b]">{tier.period}</span>
                  )}
                </div>

                <ul className="space-y-2.5 mb-6 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#22c55e] mt-0.5 shrink-0" />
                      <span className="text-sm text-[#a1a1aa]">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/login">
                  <Button
                    variant={tier.highlighted ? 'primary' : 'default'}
                    size="lg"
                    className="w-full"
                  >
                    {tier.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 border-t border-[#27272a]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="relative rounded-2xl border border-[#27272a] bg-[#18181b] overflow-hidden">
            {/* Gradient accent */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#3b82f6]/10 via-transparent to-transparent" />

            <div className="relative px-6 py-12 sm:px-12 sm:py-16 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#fafafa] mb-4">
                מוכנים לשדרג את המוסך?
              </h2>
              <p className="text-[#a1a1aa] max-w-lg mx-auto mb-8">
                הצטרפו למאות בעלי מוסכים שכבר עברו ל-GarageOS.
                התחילו בחינם -- ללא התחייבות.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/login">
                  <Button variant="primary" size="lg" className="px-8 text-base h-11">
                    התחל בחינם עכשיו
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="default" size="lg" className="px-6 text-base h-11">
                    השווה תוכניות
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
