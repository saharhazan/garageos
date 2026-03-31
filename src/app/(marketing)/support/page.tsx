'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Phone, MessageCircle, ChevronDown, ArrowLeft } from 'lucide-react'

const contactMethods = [
  {
    icon: Mail,
    title: 'אימייל',
    description: 'נחזור אליכם תוך 24 שעות',
    value: 'support@garageos.co.il',
    href: 'mailto:support@garageos.co.il',
    iconColor: 'text-primary',
    bgColor: 'bg-primary/20',
    borderColor: 'border-primary',
  },
  {
    icon: Phone,
    title: 'טלפון',
    description: 'ימים א-ה, 09:00-18:00',
    value: '03-123-4567',
    href: 'tel:+97231234567',
    iconColor: 'text-secondary',
    bgColor: 'bg-secondary/20',
    borderColor: 'border-secondary',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    description: 'תמיכה מהירה בהודעות',
    value: 'שלחו הודעה',
    href: 'https://wa.me/97231234567',
    iconColor: 'text-tertiary',
    bgColor: 'bg-tertiary/20',
    borderColor: 'border-tertiary',
  },
]

const faqs = [
  {
    question: 'איך מתחילים?',
    answer:
      'ההרשמה לוקחת פחות מ-2 דקות. הכנסו לדף ההרשמה, מלאו את פרטי המוסך, ותוכלו להתחיל לעבוד מיד. המערכת כוללת מדריך התחלתי שמלווה אתכם צעד אחרי צעד.',
  },
  {
    question: 'איך מוסיפים מכונאי למערכת?',
    answer:
      'היכנסו להגדרות > צוות, ולחצו על "הוסף משתמש". הזינו את שם המכונאי, כתובת האימייל שלו והתפקיד. הוא יקבל הזמנה למייל עם קישור להגדרת סיסמה.',
  },
  {
    question: 'איך שולחים הודעה ללקוח?',
    answer:
      'מתוך כרטיס העבודה, לחצו על כפתור "עדכן לקוח". תוכלו לשלוח עדכון סטטוס ב-WhatsApp או ב-SMS. המערכת תשלח הודעה אוטומטית עם פרטי העבודה והסטטוס הנוכחי.',
  },
  {
    question: 'האם אפשר לייבא לקוחות מאקסל?',
    answer:
      'כן! היכנסו לדף לקוחות > ייבוא, והעלו קובץ אקסל (xlsx) או CSV. המערכת תזהה אוטומטית את העמודות (שם, טלפון, אימייל, מספר רכב) ותייבא את הנתונים. ניתן לבדוק ולאשר לפני הייבוא הסופי.',
  },
  {
    question: 'מה קורה אם אשכח סיסמה?',
    answer:
      'בדף הכניסה, לחצו על "שכחתי סיסמה". הזינו את כתובת האימייל שלכם ונשלח לכם קישור לאיפוס סיסמה. הקישור תקף ל-60 דקות.',
  },
  {
    question: 'איך מפיקים חשבונית מס?',
    answer:
      'בסיום העבודה, לחצו על "הפק חשבונית" בכרטיס העבודה. המערכת תייצר חשבונית מס דיגיטלית הכוללת את כל פרטי העבודה, החלקים והעלויות. ניתן לשלוח את החשבונית ישירות ללקוח במייל או ב-WhatsApp.',
  },
  {
    question: 'האם המערכת עובדת בנייד?',
    answer:
      'כן! GarageOS מותאם לחלוטין למכשירים ניידים. ניתן להתקין את האפליקציה כ-PWA (Progressive Web App) ישירות מהדפדפן, ולקבל חוויה כמו אפליקציה מותקנת — כולל עבודה ללא חיבור אינטרנט.',
  },
  {
    question: 'מה כלול בתוכנית החינמית?',
    answer:
      'תקופת הניסיון החינמית כוללת 14 ימים של גישה מלאה לתוכנית "מוסך בוטיק": עד 2 עמדות עבודה, ניהול לקוחות (CRM), הפקת חשבוניות וקבלות, ולוח בקרה בסיסי. לא נדרש אמצעי תשלום להרשמה.',
  },
]

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="rounded-xl bg-surface-container border border-white/5 transition-all hover:bg-surface-highest">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-4 p-6 text-right"
      >
        <ChevronDown
          className={`w-5 h-5 text-on-surface-variant shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
        <h3 className="text-base font-bold text-on-surface flex-1">{question}</h3>
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? 'max-h-96 pb-6' : 'max-h-0'
        }`}
      >
        <p className="px-6 text-sm text-on-surface-variant leading-relaxed text-right">
          {answer}
        </p>
      </div>
    </div>
  )
}

export default function SupportPage() {
  return (
    <>
      {/* Header */}
      <section className="pt-16 sm:pt-24 pb-12">
        <div className="mx-auto max-w-4xl px-6 md:px-8 text-center">
          <span className="inline-block px-4 py-1.5 bg-secondary-container/20 text-secondary border border-secondary/20 rounded-full text-xs font-bold mb-6 tracking-widest uppercase">
            תמיכה
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-on-surface tracking-tight mb-4">
            מרכז תמיכה
          </h1>
          <p className="text-lg text-on-surface-variant max-w-xl mx-auto">
            אנחנו כאן בשבילכם. צרו קשר בכל דרך שנוחה לכם או מצאו תשובות לשאלות הנפוצות.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="pb-16 sm:pb-24">
        <div className="mx-auto max-w-4xl px-6 md:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {contactMethods.map((method) => (
              <a
                key={method.title}
                href={method.href}
                target={method.href.startsWith('https') ? '_blank' : undefined}
                rel={method.href.startsWith('https') ? 'noopener noreferrer' : undefined}
                className={`bg-surface-container rounded-xl p-6 md:p-8 text-center border-b-4 ${method.borderColor} transition-all hover:bg-surface-highest group`}
              >
                <div
                  className={`${method.bgColor} w-14 h-14 rounded-lg flex items-center justify-center mx-auto mb-4`}
                >
                  <method.icon className={`w-7 h-7 ${method.iconColor}`} />
                </div>
                <h3 className="text-lg font-bold text-on-surface mb-1">{method.title}</h3>
                <p className="text-xs text-on-surface-variant mb-3">{method.description}</p>
                <span className={`text-sm font-bold ${method.iconColor} group-hover:underline`}>
                  {method.value}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-24 bg-surface-low">
        <div className="mx-auto max-w-3xl px-6 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-on-surface tracking-tight mb-4">
              שאלות נפוצות
            </h2>
            <p className="text-on-surface-variant">
              תשובות לשאלות שהכי שואלים אותנו.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
            ))}
          </div>

          {/* Didn't find answer */}
          <div className="mt-12 text-center bg-surface-container rounded-xl p-8 border border-white/5">
            <h3 className="text-lg font-bold text-on-surface mb-2">
              לא מצאת תשובה?
            </h3>
            <p className="text-sm text-on-surface-variant mb-6">
              שלחו לנו מייל ונחזור אליכם בהקדם.
            </p>
            <a
              href="mailto:support@garageos.co.il"
              className="inline-flex items-center gap-2 bg-secondary-container text-white px-6 py-3 font-bold rounded-md machined-button hover:brightness-110 active:scale-95 transition-all"
            >
              <Mail className="w-4 h-4" />
              support@garageos.co.il
            </a>
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
                עדיין לא לקוח?
              </h2>
              <p className="text-on-primary max-w-md mx-auto mb-8">
                התחילו תקופת ניסיון חינמית ותגלו למה מאות מוסכים כבר עברו ל-GarageOS.
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
