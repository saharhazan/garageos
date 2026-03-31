import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeft, Shield, Sparkles, Flag } from 'lucide-react'

export const metadata: Metadata = {
  title: 'אודות | GarageOS',
  description: 'הסיפור מאחורי GarageOS — מערכת ניהול מוסכים ישראלית שנבנתה עבור המכונאים ובעלי המוסכים של ישראל.',
}

const values = [
  {
    icon: Shield,
    title: 'אמינות',
    description:
      'המערכת שלנו זמינה 99.9% מהזמן. הנתונים מוצפנים, מגובים ומאובטחים ברמה הגבוהה ביותר. כשאתם עובדים, אנחנו עובדים.',
    iconColor: 'text-primary',
    bgColor: 'bg-primary/20',
    borderColor: 'border-primary',
  },
  {
    icon: Sparkles,
    title: 'פשטות',
    description:
      'בנינו את GarageOS כדי שכל מכונאי יוכל להשתמש בו מהיום הראשון. בלי הדרכות ארוכות, בלי מורכבות מיותרת. פשוט עובד.',
    iconColor: 'text-secondary',
    bgColor: 'bg-secondary/20',
    borderColor: 'border-secondary',
  },
  {
    icon: Flag,
    title: 'ישראליות',
    description:
      'נבנה בישראל, עבור מוסכים ישראליים. תמיכה בעברית, חשבוניות לפי תקנות מס הכנסה, והבנה אמיתית של השוק המקומי.',
    iconColor: 'text-tertiary',
    bgColor: 'bg-tertiary/20',
    borderColor: 'border-tertiary',
  },
]

const team = [
  { name: 'בקרוב', role: 'מנכ"ל ומייסד', initials: 'CEO' },
  { name: 'בקרוב', role: 'סמנכ"ל טכנולוגיה', initials: 'CTO' },
  { name: 'בקרוב', role: 'ראש מוצר', initials: 'CPO' },
]

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-16 sm:pt-24 pb-12">
        <div className="mx-auto max-w-4xl px-6 md:px-8 text-center">
          <span className="inline-block px-4 py-1.5 bg-secondary-container/20 text-secondary border border-secondary/20 rounded-full text-xs font-bold mb-6 tracking-widest uppercase">
            עלינו
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-on-surface tracking-tight mb-6">
            המשימה שלנו
          </h1>
          <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            בנינו את GarageOS כי המוסכים בישראל ראויים לכלים מודרניים. מספיק עם דפי נייר,
            אקסלים מסובכים ותוכנות מיושנות. הגיע הזמן לעבוד חכם.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 sm:py-24 bg-surface-low">
        <div className="mx-auto max-w-4xl px-6 md:px-8">
          <div className="bg-surface-container rounded-2xl p-8 md:p-12 border border-white/5">
            <h2 className="text-2xl md:text-3xl font-black text-on-surface mb-6 text-right tracking-tight">
              הסיפור שלנו
            </h2>
            <div className="space-y-4 text-on-surface-variant leading-relaxed text-right">
              <p>
                GarageOS נולד מתוך הכרות אמיתית עם עולם המוסכים בישראל. ראינו מוסכים מצוינים
                שמפסידים לקוחות כי הם לא מצליחים לעקוב אחרי ההזמנות, ומכונאים מוכשרים שמבזבזים
                שעות על ניירת במקום לעשות את מה שהם הכי טובים בו.
              </p>
              <p>
                החלטנו לבנות מערכת שמכבדת את העבודה של אנשי המקצוע. מערכת שפשוטה מספיק
                למכונאי שלא גדל על טכנולוגיה, אבל חכמה מספיק למנהל שרוצה לדעת מה קורה
                בכל רגע.
              </p>
              <p>
                הצוות שלנו יושב בישראל, מדבר עברית, ומבין את האתגרים הייחודיים של שוק
                המוסכים המקומי — מחשבוניות מס ועד חיבור ל-WhatsApp. אנחנו לא עוד תוכנה
                אמריקאית עם תרגום לעברית. אנחנו ישראלים שבנו מערכת ישראלית.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 sm:py-24 bg-surface">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-on-surface tracking-tight mb-4">
              הערכים שמנחים אותנו
            </h2>
            <p className="text-lg text-on-surface-variant max-w-xl mx-auto">
              שלושה עקרונות שמלווים אותנו בכל החלטה, בכל שורת קוד ובכל שיחה עם לקוח.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {values.map((value) => (
              <div
                key={value.title}
                className={`bg-surface-container p-8 md:p-10 rounded-xl border-b-4 ${value.borderColor} transition-all hover:bg-surface-highest`}
              >
                <div className={`${value.bgColor} w-14 h-14 rounded-lg flex items-center justify-center mb-6`}>
                  <value.icon className={`w-7 h-7 ${value.iconColor}`} />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-on-surface mb-3">
                  {value.title}
                </h3>
                <p className="text-on-surface-variant leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 sm:py-24 bg-surface-low">
        <div className="mx-auto max-w-4xl px-6 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-on-surface tracking-tight mb-4">
              הצוות
            </h2>
            <p className="text-lg text-on-surface-variant">
              אנשים שמבינים מוסכים ובונים טכנולוגיה.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {team.map((member) => (
              <div
                key={member.role}
                className="bg-surface-container rounded-xl p-6 md:p-8 text-center border border-white/5 transition-all hover:bg-surface-highest"
              >
                <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-black text-sm">{member.initials}</span>
                </div>
                <h3 className="text-lg font-bold text-on-surface mb-1">{member.name}</h3>
                <p className="text-sm text-on-surface-variant">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-16 px-6 md:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="bg-primary-container rounded-2xl px-8 py-12 sm:px-12 sm:py-16 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-20" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-black text-on-primary-container mb-4 tracking-tight">
                הצטרף אלינו
              </h2>
              <p className="text-on-primary max-w-md mx-auto mb-8">
                הצטרפו למאות מוסכים שכבר עברו למערכת ניהול מודרנית. התחלה חינמית, ללא התחייבות.
              </p>
              <Link href="/login">
                <button className="machined-button bg-on-primary text-primary-container px-8 py-4 font-black rounded-lg hover:scale-105 transition-transform">
                  התחל בחינם
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
