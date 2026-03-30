import { Fragment } from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Check, Minus, ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'מחירים | GarageOS',
  description: 'תוכניות ומחירים למערכת ניהול המוסך GarageOS.',
}

const tiers = [
  {
    name: 'מוסך בוטיק',
    price: '249',
    period: '/חודש',
    description: 'מושלם למוסכים קטנים עם עד 2 עמדות',
    cta: 'בחר תוכנית',
    highlighted: false,
  },
  {
    name: 'מוסך מקצועי',
    price: '499',
    period: '/חודש',
    description: 'למוסכים שרוצים לצמוח ולהתייעל',
    cta: 'התחל עכשיו',
    highlighted: true,
  },
  {
    name: 'רשת מוסכים',
    price: '999',
    period: '/חודש',
    description: 'לרשתות מוסכים ועסקים גדולים',
    cta: 'צור קשר',
    highlighted: false,
  },
]

type FeatureValue = boolean | string

interface ComparisonRow {
  label: string
  boutique: FeatureValue
  pro: FeatureValue
  enterprise: FeatureValue
}

const comparisonCategories: { category: string; rows: ComparisonRow[] }[] = [
  {
    category: 'כללי',
    rows: [
      { label: 'עמדות עבודה', boutique: '2', pro: 'ללא הגבלה', enterprise: 'ללא הגבלה' },
      { label: 'סניפים', boutique: '1', pro: '1', enterprise: 'ללא הגבלה' },
      { label: 'משתמשים', boutique: '3', pro: '10', enterprise: 'ללא הגבלה' },
    ],
  },
  {
    category: 'ניהול עבודות',
    rows: [
      { label: 'כרטיסי עבודה', boutique: true, pro: true, enterprise: true },
      { label: 'הצעות מחיר', boutique: false, pro: true, enterprise: true },
      { label: 'חשבוניות PDF', boutique: true, pro: true, enterprise: true },
      { label: 'חתימה דיגיטלית', boutique: false, pro: true, enterprise: true },
    ],
  },
  {
    category: 'ניהול לקוחות',
    rows: [
      { label: 'מאגר לקוחות (CRM)', boutique: true, pro: true, enterprise: true },
      { label: 'היסטוריית רכבים', boutique: true, pro: true, enterprise: true },
      { label: 'ייבוא לקוחות', boutique: false, pro: true, enterprise: true },
    ],
  },
  {
    category: 'מלאי',
    rows: [
      { label: 'ניהול מלאי בסיסי', boutique: true, pro: true, enterprise: true },
      { label: 'ניהול מלאי מתקדם', boutique: false, pro: true, enterprise: true },
      { label: 'ניהול ספקים', boutique: false, pro: true, enterprise: true },
      { label: 'הזמנות רכש', boutique: false, pro: false, enterprise: true },
    ],
  },
  {
    category: 'התראות ותקשורת',
    rows: [
      { label: 'התראות מערכת', boutique: true, pro: true, enterprise: true },
      { label: 'WhatsApp אוטומטי', boutique: false, pro: true, enterprise: true },
      { label: 'הודעות SMS', boutique: false, pro: true, enterprise: true },
      { label: 'אימייל אוטומטי', boutique: false, pro: true, enterprise: true },
    ],
  },
  {
    category: 'דוחות ואנליטיקה',
    rows: [
      { label: 'לוח בקרה בסיסי', boutique: true, pro: true, enterprise: true },
      { label: 'דוחות מתקדמים', boutique: false, pro: true, enterprise: true },
      { label: 'דוחות BI מותאמים', boutique: false, pro: false, enterprise: true },
      { label: 'ייצוא לאקסל', boutique: false, pro: true, enterprise: true },
    ],
  },
  {
    category: 'אינטגרציות',
    rows: [
      { label: 'חיבור OBD', boutique: false, pro: true, enterprise: true },
      { label: 'API וחיבורים', boutique: false, pro: false, enterprise: true },
    ],
  },
  {
    category: 'תמיכה ושירות',
    rows: [
      { label: 'תמיכה במייל', boutique: true, pro: true, enterprise: true },
      { label: 'תמיכה בצ\'אט', boutique: false, pro: true, enterprise: true },
      { label: 'תמיכה טלפונית', boutique: false, pro: false, enterprise: true },
      { label: 'תמיכה VIP 24/7', boutique: false, pro: false, enterprise: true },
      { label: 'מנהל חשבון ייעודי', boutique: false, pro: false, enterprise: true },
    ],
  },
]

function CellValue({ value }: { value: FeatureValue }) {
  if (typeof value === 'string') {
    return <span className="text-sm text-on-surface font-medium">{value}</span>
  }
  if (value) {
    return <Check className="w-4 h-4 text-primary mx-auto" />
  }
  return <Minus className="w-4 h-4 text-outline-variant/40 mx-auto" />
}

export default function PricingPage() {
  return (
    <>
      {/* Header */}
      <section className="pt-16 sm:pt-24 pb-12">
        <div className="mx-auto max-w-6xl px-6 md:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-black text-on-surface tracking-tight">
            תוכניות שמתאימות לכל מוסך
          </h1>
          <p className="mt-4 text-lg text-on-surface-variant max-w-2xl mx-auto">
            בלי אותיות קטנות, בלי דמי התקנה. בחרו את התוכנית המתאימה ושדרגו בכל זמן.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16 sm:pb-24">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-xl p-8 md:p-10 flex flex-col ${
                  tier.highlighted
                    ? 'bg-surface-highest md:scale-105 shadow-[0_0_40px_rgba(232,114,12,0.1)] border-2 border-secondary/30'
                    : 'bg-surface border border-white/5'
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-on-secondary-container px-4 py-1 text-xs font-black rounded-full uppercase tracking-tighter">
                    הכי פופולרי
                  </div>
                )}

                <div className="mb-5">
                  <h3 className={`text-xl font-bold mb-1 ${tier.highlighted ? 'text-secondary' : 'text-on-surface-variant'}`}>
                    {tier.name}
                  </h3>
                  <p className="text-xs text-on-surface-variant/60">{tier.description}</p>
                </div>

                <div className="flex items-baseline gap-1 mb-8">
                  <span className={`font-black text-on-surface ${tier.highlighted ? 'text-5xl' : 'text-4xl'}`}>
                    &#8362;{tier.price}
                  </span>
                  <span className="text-on-surface-variant">{tier.period}</span>
                </div>

                <Link href="/login" className="mt-auto">
                  {tier.highlighted ? (
                    <button className="w-full py-4 bg-secondary text-on-secondary-container font-black rounded machined-button hover:brightness-110 active:scale-95 transition-all">
                      {tier.cta}
                    </button>
                  ) : (
                    <button className="w-full py-4 border border-outline-variant font-bold rounded hover:bg-white/5 transition-all active:scale-95">
                      {tier.cta}
                    </button>
                  )}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="pb-16 sm:pb-24 pt-16 sm:pt-24 bg-surface-low">
        <div className="mx-auto max-w-5xl px-6 md:px-8">
          <h2 className="text-3xl font-black text-on-surface text-center mb-10 tracking-tight">
            השוואת תכונות מלאה
          </h2>

          {/* Desktop comparison table */}
          <div className="hidden md:block">
            <div className="overflow-hidden rounded-xl border border-outline-variant/20">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-high">
                    <th className="text-right py-4 px-6 text-sm font-bold text-on-surface-variant w-2/5">
                      תכונה
                    </th>
                    {tiers.map((tier) => (
                      <th
                        key={tier.name}
                        className={`py-4 px-6 text-center text-sm font-bold w-1/5 ${
                          tier.highlighted ? 'text-secondary' : 'text-on-surface-variant'
                        }`}
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
                          className="py-3 px-6 text-sm font-black text-on-surface bg-surface-lowest"
                        >
                          {cat.category}
                        </td>
                      </tr>
                      {cat.rows.map((row) => (
                        <tr key={row.label} className="bg-surface-container border-t border-outline-variant/10">
                          <td className="py-3 px-6 text-sm text-on-surface-variant">
                            {row.label}
                          </td>
                          <td className="py-3 px-6 text-center">
                            <CellValue value={row.boutique} />
                          </td>
                          <td className="py-3 px-6 text-center">
                            <CellValue value={row.pro} />
                          </td>
                          <td className="py-3 px-6 text-center">
                            <CellValue value={row.enterprise} />
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
                className={`rounded-xl p-6 ${
                  tier.highlighted
                    ? 'bg-surface-highest border-2 border-secondary/30 shadow-[0_0_40px_rgba(232,114,12,0.1)]'
                    : 'bg-surface border border-white/5'
                }`}
              >
                <div className="flex items-baseline gap-2 mb-4 flex-row-reverse">
                  <h3 className={`text-lg font-bold ${tier.highlighted ? 'text-secondary' : 'text-on-surface'}`}>
                    {tier.name}
                  </h3>
                  <span className="mr-auto text-lg font-black text-on-surface">
                    &#8362;{tier.price}
                  </span>
                </div>

                {comparisonCategories.map((cat) => (
                  <div key={cat.category} className="mb-4 last:mb-0">
                    <p className="text-xs font-black text-on-surface-variant/60 uppercase mb-2">
                      {cat.category}
                    </p>
                    <ul className="space-y-1.5">
                      {cat.rows.map((row) => {
                        const val =
                          tier.name === 'מוסך בוטיק'
                            ? row.boutique
                            : tier.name === 'מוסך מקצועי'
                              ? row.pro
                              : row.enterprise
                        const isIncluded = val === true || (typeof val === 'string' && val !== '')
                        return (
                          <li
                            key={row.label}
                            className="flex items-center gap-2 text-sm"
                          >
                            {isIncluded ? (
                              <Check className={`w-3.5 h-3.5 shrink-0 ${tier.highlighted ? 'text-secondary' : 'text-primary'}`} />
                            ) : (
                              <Minus className="w-3.5 h-3.5 text-outline-variant/30 shrink-0" />
                            )}
                            <span
                              className={
                                isIncluded ? 'text-on-surface-variant' : 'text-outline-variant/40'
                              }
                            >
                              {row.label}
                              {typeof val === 'string' && val && (
                                <span className="text-on-surface font-medium mr-1">
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

                <Link href="/login" className="block mt-6">
                  {tier.highlighted ? (
                    <button className="w-full py-4 bg-secondary text-on-secondary-container font-black rounded machined-button hover:brightness-110 active:scale-95 transition-all">
                      {tier.cta}
                    </button>
                  ) : (
                    <button className="w-full py-4 border border-outline-variant font-bold rounded hover:bg-white/5 transition-all active:scale-95">
                      {tier.cta}
                    </button>
                  )}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-24 bg-surface">
        <div className="mx-auto max-w-2xl px-6 md:px-8">
          <h2 className="text-3xl font-black text-on-surface text-center mb-10 tracking-tight">
            שאלות נפוצות
          </h2>

          <div className="space-y-4">
            {[
              {
                q: 'האם אפשר לנסות בחינם?',
                a: 'כן! תוכנית מוסך בוטיק כוללת תקופת ניסיון חינם של 14 יום. אפשר לשדרג בכל רגע.',
              },
              {
                q: 'האם צריך להתקין משהו?',
                a: 'לא. GarageOS עובד ישירות מהדפדפן וזמין גם כאפליקציה ניידת (PWA). אין צורך בהתקנה.',
              },
              {
                q: 'אפשר לבטל בכל זמן?',
                a: 'כמובן. אין התחייבות. אפשר לשדרג, להחליף תוכנית או לבטל את המנוי בכל רגע.',
              },
              {
                q: 'האם המידע שלי מאובטח?',
                a: 'המערכת מאוחסנת בענן מאובטח עם הצפנה מלאה. כל מוסך רואה רק את המידע שלו.',
              },
              {
                q: 'איך מעבירים נתונים ממערכת אחרת?',
                a: 'ניתן לייבא לקוחות ורכבים מקובץ אקסל. בתוכנית רשת מוסכים מנהל חשבון מלווה את תהליך ההעברה.',
              },
            ].map((item) => (
              <div
                key={item.q}
                className="rounded-xl bg-surface-container p-6 transition-all hover:bg-surface-highest"
              >
                <h3 className="text-base font-bold text-on-surface mb-2">{item.q}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-12 md:py-16 px-6 md:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="bg-primary-container rounded-2xl px-8 py-12 sm:px-12 sm:py-16 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-20" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-black text-on-primary-container mb-4 tracking-tight">
                מוכנים להתחיל?
              </h2>
              <p className="text-on-primary max-w-md mx-auto mb-8">
                התחילו עם תקופת ניסיון חינם ושדרגו כשתהיו מוכנים.
              </p>
              <Link href="/login">
                <button className="machined-button bg-on-primary text-primary-container px-8 py-4 font-black rounded-lg hover:scale-105 transition-transform">
                  התחל בחינם עכשיו
                  <ArrowLeft className="w-4 h-4 inline mr-2" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
