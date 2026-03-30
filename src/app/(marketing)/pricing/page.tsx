import { Fragment } from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Check, Minus, ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'מחירים | GarageOS',
  description: 'תוכניות ומחירים למערכת ניהול המוסך GarageOS. התחילו בחינם.',
}

const tiers = [
  {
    name: 'חינם',
    nameEn: 'Free',
    price: '0',
    period: '',
    description: 'מושלם להתחלה ולמוסכים קטנים',
    cta: 'התחל בחינם',
    highlighted: false,
  },
  {
    name: 'פרו',
    nameEn: 'Pro',
    price: '149',
    period: '/חודש',
    description: 'למוסכים שרוצים לצמוח',
    cta: 'התחל תקופת ניסיון',
    highlighted: true,
  },
  {
    name: 'עסקי',
    nameEn: 'Business',
    price: '349',
    period: '/חודש',
    description: 'לרשתות מוסכים ועסקים גדולים',
    cta: 'צור קשר',
    highlighted: false,
  },
]

type FeatureValue = boolean | string

interface ComparisonRow {
  label: string
  free: FeatureValue
  pro: FeatureValue
  business: FeatureValue
}

const comparisonCategories: { category: string; rows: ComparisonRow[] }[] = [
  {
    category: 'כללי',
    rows: [
      { label: 'משתמשים', free: '1', pro: '5', business: '15' },
      { label: 'סניפים', free: '1', pro: '1', business: '3' },
      { label: 'הזמנות בחודש', free: '50', pro: 'ללא הגבלה', business: 'ללא הגבלה' },
    ],
  },
  {
    category: 'ניהול הזמנות',
    rows: [
      { label: 'הזמנות עבודה', free: true, pro: true, business: true },
      { label: 'הצעות מחיר', free: false, pro: true, business: true },
      { label: 'חשבוניות PDF', free: false, pro: true, business: true },
      { label: 'חתימה דיגיטלית', free: false, pro: true, business: true },
    ],
  },
  {
    category: 'ניהול לקוחות',
    rows: [
      { label: 'מאגר לקוחות', free: true, pro: true, business: true },
      { label: 'היסטוריית רכבים', free: true, pro: true, business: true },
      { label: 'ייבוא לקוחות', free: false, pro: true, business: true },
    ],
  },
  {
    category: 'מלאי',
    rows: [
      { label: 'ניהול מלאי בסיסי', free: true, pro: true, business: true },
      { label: 'התראות מלאי נמוך', free: false, pro: true, business: true },
      { label: 'ניהול ספקים', free: false, pro: true, business: true },
      { label: 'הזמנות רכש', free: false, pro: false, business: true },
    ],
  },
  {
    category: 'התראות ותקשורת',
    rows: [
      { label: 'התראות מערכת', free: true, pro: true, business: true },
      { label: 'הודעות SMS', free: false, pro: true, business: true },
      { label: 'הודעות וואטסאפ', free: false, pro: true, business: true },
      { label: 'אימייל אוטומטי', free: false, pro: true, business: true },
    ],
  },
  {
    category: 'דוחות',
    rows: [
      { label: 'דשבורד בסיסי', free: true, pro: true, business: true },
      { label: 'דוחות מתקדמים', free: false, pro: true, business: true },
      { label: 'ייצוא לאקסל', free: false, pro: true, business: true },
      { label: 'דוחות מותאמים', free: false, pro: false, business: true },
    ],
  },
  {
    category: 'תמיכה ושירות',
    rows: [
      { label: 'תמיכה במייל', free: true, pro: true, business: true },
      { label: 'תמיכה בצ\'אט', free: false, pro: true, business: true },
      { label: 'תמיכה טלפונית', free: false, pro: false, business: true },
      { label: 'מנהל חשבון ייעודי', free: false, pro: false, business: true },
      { label: 'SLA מובטח', free: false, pro: false, business: true },
      { label: 'API וחיבורים', free: false, pro: false, business: true },
    ],
  },
]

function CellValue({ value }: { value: FeatureValue }) {
  if (typeof value === 'string') {
    return <span className="text-sm text-[#fafafa]">{value}</span>
  }
  if (value) {
    return <Check className="w-4 h-4 text-[#22c55e] mx-auto" />
  }
  return <Minus className="w-4 h-4 text-[#3f3f46] mx-auto" />
}

export default function PricingPage() {
  return (
    <>
      {/* Header */}
      <section className="pt-16 sm:pt-24 pb-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#fafafa]">
            תוכניות ומחירים
          </h1>
          <p className="mt-4 text-[#a1a1aa] max-w-lg mx-auto">
            בחרו את התוכנית המתאימה לגודל ולצרכים של המוסך שלכם.
            התחילו בחינם ושדרגו בכל זמן.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16 sm:pb-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            {tiers.map((tier) => (
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

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-bold text-[#fafafa]">{tier.price}</span>
                  <span className="text-lg text-[#52525b]">{'\u20AA'}</span>
                  {tier.period && (
                    <span className="text-sm text-[#52525b]">{tier.period}</span>
                  )}
                </div>

                <Link href="/login" className="mt-auto">
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

      {/* Feature Comparison Table */}
      <section className="pb-16 sm:pb-24 border-t border-[#27272a] pt-16 sm:pt-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-[#fafafa] text-center mb-10">
            השוואת תכונות מלאה
          </h2>

          {/* Sticky header row (desktop) */}
          <div className="hidden md:block">
            <div className="overflow-hidden rounded-xl border border-[#27272a]">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#18181b]">
                    <th className="text-right py-3 px-4 text-sm font-medium text-[#a1a1aa] w-2/5">
                      תכונה
                    </th>
                    {tiers.map((tier) => (
                      <th
                        key={tier.name}
                        className="py-3 px-4 text-center text-sm font-medium text-[#a1a1aa] w-1/5"
                      >
                        {tier.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonCategories.map((cat) => (
                    <Fragment key={cat.category}>
                      <tr>
                        <td
                          colSpan={4}
                          className="py-3 px-4 text-sm font-semibold text-[#fafafa] bg-[#09090b] border-t border-[#27272a]"
                        >
                          {cat.category}
                        </td>
                      </tr>
                      {cat.rows.map((row) => (
                        <tr key={row.label} className="border-t border-[#27272a]/50">
                          <td className="py-2.5 px-4 text-sm text-[#a1a1aa]">
                            {row.label}
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <CellValue value={row.free} />
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <CellValue value={row.pro} />
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <CellValue value={row.business} />
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile comparison (cards per tier) */}
          <div className="md:hidden space-y-6">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-xl border p-5 ${
                  tier.highlighted
                    ? 'border-[#3b82f6] bg-[#3b82f6]/5'
                    : 'border-[#27272a] bg-[#18181b]'
                }`}
              >
                <div className="flex items-baseline gap-1.5 mb-4">
                  <h3 className="text-lg font-semibold text-[#fafafa]">{tier.name}</h3>
                  <span className="text-xs text-[#52525b]">{tier.nameEn}</span>
                  <span className="mr-auto text-lg font-bold text-[#fafafa]">
                    {tier.price}{'\u20AA'}
                  </span>
                </div>

                {comparisonCategories.map((cat) => (
                  <div key={cat.category} className="mb-4 last:mb-0">
                    <p className="text-xs font-medium text-[#52525b] uppercase mb-2">
                      {cat.category}
                    </p>
                    <ul className="space-y-1.5">
                      {cat.rows.map((row) => {
                        const val =
                          tier.nameEn === 'Free'
                            ? row.free
                            : tier.nameEn === 'Pro'
                              ? row.pro
                              : row.business
                        const isIncluded = val === true || (typeof val === 'string' && val !== '')
                        return (
                          <li
                            key={row.label}
                            className="flex items-center gap-2 text-sm"
                          >
                            {isIncluded ? (
                              <Check className="w-3.5 h-3.5 text-[#22c55e] shrink-0" />
                            ) : (
                              <Minus className="w-3.5 h-3.5 text-[#3f3f46] shrink-0" />
                            )}
                            <span
                              className={
                                isIncluded ? 'text-[#a1a1aa]' : 'text-[#3f3f46]'
                              }
                            >
                              {row.label}
                              {typeof val === 'string' && val && (
                                <span className="text-[#fafafa] font-medium mr-1">
                                  ({val})
                                </span>
                              )}
                            </span>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                ))}

                <Link href="/login" className="block mt-4">
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

      {/* FAQ */}
      <section className="pb-16 sm:pb-24 border-t border-[#27272a] pt-16 sm:pt-24">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-[#fafafa] text-center mb-10">
            שאלות נפוצות
          </h2>

          <div className="space-y-4">
            {[
              {
                q: 'האם אפשר לנסות בחינם?',
                a: 'כן! התוכנית החינמית כוללת משתמש אחד ועד 50 הזמנות בחודש, ללא הגבלת זמן. אפשר לשדרג בכל רגע.',
              },
              {
                q: 'האם צריך להתקין משהו?',
                a: 'לא. GarageOS עובד ישירות מהדפדפן וזמין גם כאפליקציה ניידת (PWA). אין צורך בהתקנה.',
              },
              {
                q: 'אפשר לבטל בכל זמן?',
                a: 'כמובן. אין התחייבות. אפשר לשדרג, לשנמך או לבטל את המנוי בכל רגע.',
              },
              {
                q: 'האם המידע שלי מאובטח?',
                a: 'המערכת מאוחסנת בענן מאובטח עם הצפנה מלאה. כל מוסך רואה רק את המידע שלו.',
              },
              {
                q: 'איך מעבירים נתונים ממערכת אחרת?',
                a: 'ניתן לייבא לקוחות ורכבים מקובץ אקסל. בתוכנית העסקית מנהל חשבון מלווה את תהליך ההעברה.',
              },
            ].map((item) => (
              <div
                key={item.q}
                className="rounded-xl border border-[#27272a] bg-[#18181b] p-5"
              >
                <h3 className="text-sm font-medium text-[#fafafa] mb-2">{item.q}</h3>
                <p className="text-sm text-[#a1a1aa] leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="pb-16 sm:pb-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-2xl border border-[#27272a] bg-[#18181b] px-6 py-12 sm:px-12 sm:py-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#3b82f6]/10 via-transparent to-transparent" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#fafafa] mb-4">
                מוכנים להתחיל?
              </h2>
              <p className="text-[#a1a1aa] max-w-md mx-auto mb-8">
                התחילו עם התוכנית החינמית ושדרגו כשתהיו מוכנים.
              </p>
              <Link href="/login">
                <Button variant="primary" size="lg" className="px-8 text-base h-11">
                  התחל בחינם עכשיו
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
