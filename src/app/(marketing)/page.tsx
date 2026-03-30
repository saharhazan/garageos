import Link from 'next/link'
import {
  ClipboardCheck,
  Wrench,
  CheckCircle,
  Check,
  ArrowLeft,
  Gauge,
  CloudCog,
} from 'lucide-react'

const kpis = [
  { label: 'חיסכון זמן חודשי', value: '42', unit: 'שעות', border: 'border-primary', unitColor: 'text-primary' },
  { label: 'גידול ברווחיות', value: '18%', unit: 'ממוצע', border: 'border-secondary', unitColor: 'text-secondary' },
  { label: 'שביעות רצון לקוחות', value: '4.9', unit: 'כוכבים', border: 'border-primary', unitColor: 'text-primary' },
  { label: 'כרטיסי עבודה היום', value: '124', unit: 'פעיל', border: 'border-tertiary', unitColor: 'text-tertiary' },
]

const workflowSteps = [
  {
    number: '1',
    icon: ClipboardCheck,
    title: 'קבלה ודיאגנוסטיקה',
    description: 'סריקת רישיון מהירה, תיעוד נזקים בתמונות ופתיחת כרטיס עבודה דיגיטלי בשניות.',
    badgeColor: 'bg-primary',
    badgeText: 'text-on-primary',
    iconColor: 'text-primary',
  },
  {
    number: '2',
    icon: Wrench,
    title: 'ניהול וביצוע',
    description: 'הקצאת מכונאים, מעקב מלאי בזמן אמת ועדכוני סטטוס אוטומטיים ללקוח ב-WhatsApp.',
    badgeColor: 'bg-secondary',
    badgeText: 'text-on-secondary-container',
    iconColor: 'text-secondary',
  },
  {
    number: '3',
    icon: CheckCircle,
    title: 'שחרור ותשלום',
    description: 'הפקת חשבונית דיגיטלית, סליקה מהירה וסגירת כרטיס עם היסטוריה מלאה בענן.',
    badgeColor: 'bg-primary',
    badgeText: 'text-on-primary',
    iconColor: 'text-primary',
  },
]

const pricingTiers = [
  {
    name: 'מוסך בוטיק',
    price: '249',
    features: ['עד 2 עמדות עבודה', 'ניהול לקוחות (CRM)', 'חשבוניות וקבלות'],
    cta: 'בחר תוכנית',
    highlighted: false,
    checkColor: 'text-primary',
  },
  {
    name: 'מוסך מקצועי',
    price: '499',
    features: ['עמדות ללא הגבלה', 'ניהול מלאי מתקדם', 'WhatsApp אוטומטי ללקוח', 'חיבור למכשירי OBD'],
    cta: 'התחל עכשיו',
    highlighted: true,
    checkColor: 'text-secondary',
  },
  {
    name: 'רשת מוסכים',
    price: '999',
    features: ['ניהול מספר סניפים', 'דוחות BI מותאמים', 'תמיכה VIP 24/7'],
    cta: 'צור קשר',
    highlighted: false,
    checkColor: 'text-primary',
  },
]

const previewFeatures = [
  {
    icon: Gauge,
    title: 'מהירות תגובה',
    description: 'המערכת עובדת מהר יותר מהמכונאי הכי זריז שלכם. ללא השהיות, ללא תקלות.',
    bgColor: 'bg-primary/20',
    iconColor: 'text-primary',
  },
  {
    icon: CloudCog,
    title: 'סנכרון מלא',
    description: 'המידע זמין מהסמארטפון, מהטאבלט או מהמחשב במשרד בו-זמנית.',
    bgColor: 'bg-secondary/20',
    iconColor: 'text-secondary',
  },
]

export default function LandingPage() {
  return (
    <>
      {/* ═══════════════ Hero Section ═══════════════ */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center overflow-hidden">
        {/* Background image placeholder with gradient overlay */}
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-surface-high opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent" />
        </div>

        <div className="container mx-auto px-6 md:px-8 relative z-10 text-right">
          <div className="max-w-3xl mr-0 ml-auto">
            {/* Badge */}
            <span className="inline-block px-4 py-1.5 bg-secondary-container/20 text-secondary border border-secondary/20 rounded-full text-xs font-bold mb-6 tracking-widest uppercase">
              מהפכה בניהול המוסך
            </span>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black leading-[1.1] mb-8 tracking-tighter text-on-surface">
              המוסך שלך.
              <br />
              <span className="text-primary">סוף סוף בסדר.</span>
            </h1>

            {/* Subtext */}
            <p className="text-lg md:text-2xl text-on-surface-variant mb-12 font-medium max-w-xl leading-relaxed">
              מערכת הניהול היחידה שנבנתה עבור המכונאים, מנהלי העבודה ובעלי המוסכים של ישראל. דיוק גרמני, חוצפה ישראלית.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row-reverse gap-4">
              <Link href="/login">
                <button className="bg-secondary-container hover:brightness-110 text-white px-10 py-5 text-xl font-black rounded-md machined-button shadow-[0_0_24px_rgba(232,114,12,0.2)] active:scale-95 transition-all">
                  התחל בחינם
                </button>
              </Link>
              <Link href="#features">
                <button className="border border-outline-variant hover:bg-white/5 text-on-surface px-10 py-5 text-xl font-bold rounded-md transition-all active:scale-95">
                  צפה בהדגמה
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* License Plate Badge */}
        <div className="absolute bottom-12 left-12 transform -rotate-3 hidden lg:block">
          <div className="bg-[#F5D015] text-black px-6 py-2 rounded-sm flex items-center gap-4 shadow-2xl border-2 border-black/10">
            <div className="flex flex-col items-center leading-none border-l-2 border-black/20 pl-4">
              <div className="w-6 h-4 bg-primary-container flex flex-col justify-around p-0.5">
                <div className="w-full h-0.5 bg-white opacity-50" />
                <span className="text-[6px] text-white font-bold leading-none">IL</span>
              </div>
              <span className="text-[8px] font-bold mt-1 uppercase">ישראל</span>
            </div>
            <span className="text-4xl font-black font-mono license-plate">88-202-OS</span>
          </div>
        </div>
      </section>

      {/* ═══════════════ KPI Section ═══════════════ */}
      <section className="py-16 md:py-24 bg-surface-low">
        <div className="container mx-auto px-6 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {kpis.map((kpi) => (
              <div
                key={kpi.label}
                className={`bg-surface-high p-6 md:p-8 rounded-lg border-b-4 ${kpi.border}`}
              >
                <span className="text-on-surface-variant font-bold text-xs uppercase block mb-2">
                  {kpi.label}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl md:text-5xl font-black text-on-surface tabular-nums">
                    {kpi.value}
                  </span>
                  <span className={`text-base md:text-xl font-bold ${kpi.unitColor}`}>
                    {kpi.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ Workflow Section ═══════════════ */}
      <section id="features" className="py-20 md:py-32 bg-surface">
        <div className="container mx-auto px-6 md:px-8">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">
              תהליך עבודה חכם ומכונן
            </h2>
            <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto">
              מנהלים את המוסך ב-3 שלבים פשוטים, מהכניסה ועד לשחרור הרכב.
            </p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {workflowSteps.map((step) => (
              <div
                key={step.number}
                className="group relative bg-surface-container p-8 md:p-10 rounded-xl transition-all hover:bg-surface-highest"
              >
                {/* Number badge */}
                <div className={`absolute -top-6 right-8 md:right-10 w-12 h-12 ${step.badgeColor} flex items-center justify-center ${step.badgeText} text-2xl font-black rounded-lg`}>
                  {step.number}
                </div>

                {/* Icon */}
                <div className={`mb-6 md:mb-8 ${step.iconColor}`}>
                  <step.icon className="w-12 h-12 md:w-16 md:h-16" strokeWidth={1.5} />
                </div>

                <h3 className="text-xl md:text-2xl font-black mb-4">{step.title}</h3>
                <p className="text-on-surface-variant leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ Pricing Section ═══════════════ */}
      <section id="pricing" className="py-20 md:py-32 bg-surface-low">
        <div className="container mx-auto px-6 md:px-8">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-3xl md:text-5xl font-black mb-6">
              תוכניות שמתאימות לכל מוסך
            </h2>
            <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto">
              בלי אותיות קטנות, בלי דמי התקנה. פשוט לעבוד.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`p-8 md:p-10 rounded-xl flex flex-col relative ${
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

                <h3 className={`text-xl font-bold mb-2 ${tier.highlighted ? 'text-secondary' : 'text-on-surface-variant'}`}>
                  {tier.name}
                </h3>

                <div className="mb-8">
                  <span className={`font-black ${tier.highlighted ? 'text-5xl' : 'text-4xl'} text-on-surface`}>
                    &#8362;{tier.price}
                  </span>
                  <span className="text-on-surface-variant">/חודש</span>
                </div>

                <ul className="space-y-4 mb-10 flex-grow">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 flex-row-reverse text-right">
                      <Check className={`w-4 h-4 ${tier.checkColor} shrink-0`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/login" className="block">
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

      {/* ═══════════════ Product Preview Section ═══════════════ */}
      <section className="py-20 md:py-32 overflow-hidden bg-surface">
        <div className="container mx-auto px-6 md:px-8">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20">
            {/* Text content */}
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-black mb-8">לוח בקרה אינטואיטיבי</h2>
              <div className="space-y-6">
                {previewFeatures.map((feature) => (
                  <div key={feature.title} className="flex gap-4 flex-row-reverse text-right">
                    <div className={`${feature.bgColor} p-3 rounded-lg h-fit`}>
                      <feature.icon className={`w-5 h-5 ${feature.iconColor}`} />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-1">{feature.title}</h4>
                      <p className="text-on-surface-variant">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dashboard image placeholder */}
            <div className="lg:w-1/2 relative w-full">
              <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-full" />
              <div className="relative glass-panel rounded-2xl border border-white/10 p-4 shadow-2xl">
                {/* Dashboard placeholder content */}
                <div className="rounded-xl bg-surface-high p-6 md:p-8 min-h-[280px] md:min-h-[360px] flex flex-col">
                  <div className="flex items-center gap-3 mb-6 flex-row-reverse">
                    <div className="w-3 h-3 rounded-full bg-primary/60" />
                    <div className="w-3 h-3 rounded-full bg-secondary/60" />
                    <div className="w-3 h-3 rounded-full bg-tertiary/60" />
                    <span className="text-xs text-on-surface-variant/40 mr-auto">GarageOS Dashboard</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-surface-container rounded-lg p-4 border-b-2 border-primary">
                      <span className="block text-[10px] text-on-surface-variant mb-1">עבודות פתוחות</span>
                      <span className="text-2xl font-black tabular-nums">12</span>
                    </div>
                    <div className="bg-surface-container rounded-lg p-4 border-b-2 border-secondary">
                      <span className="block text-[10px] text-on-surface-variant mb-1">הושלמו החודש</span>
                      <span className="text-2xl font-black tabular-nums">47</span>
                    </div>
                  </div>
                  <div className="flex-1 bg-surface-container rounded-lg p-4">
                    <div className="flex items-center gap-2 flex-row-reverse mb-3">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-xs text-on-surface-variant">סטטוס עבודות</span>
                    </div>
                    <div className="flex gap-1 items-end h-16">
                      {[40, 65, 45, 80, 55, 70, 90, 60, 75, 50, 85, 65].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-sm bg-primary/30"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ Bottom CTA Section ═══════════════ */}
      <section className="py-12 md:py-16 px-6 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-primary-container rounded-2xl p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden shadow-2xl">
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-20" />
            <div className="relative z-10 text-center md:text-right">
              <div className="text-3xl md:text-4xl font-black text-on-primary-container mb-2 tracking-tighter">
                1,200+
              </div>
              <div className="text-on-primary font-bold">רכבים מטופלים החודש דרך המערכת</div>
            </div>
            <Link href="/login" className="relative z-10">
              <button className="machined-button bg-on-primary text-primary-container px-8 py-4 font-black rounded-lg hover:scale-105 transition-transform">
                הצטרף למהפכה
                <ArrowLeft className="w-4 h-4 inline mr-2" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
