import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'מדיניות פרטיות | GarageOS',
  description: 'מדיניות הפרטיות של GarageOS — כיצד אנו אוספים, משתמשים ומגנים על המידע שלכם.',
}

export default function PrivacyPage() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-6 md:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-black text-on-surface tracking-tight mb-4">
            מדיניות פרטיות
          </h1>
          <p className="text-on-surface-variant">
            עדכון אחרון: מרץ 2026
          </p>
        </div>

        {/* Content */}
        <div className="prose-custom space-y-10 text-right" dir="rtl">

          {/* 1. Introduction */}
          <section>
            <h2 className="text-xl font-black text-on-surface mb-4">1. מבוא</h2>
            <div className="text-on-surface-variant leading-relaxed space-y-3">
              <p>
                ברוכים הבאים למדיניות הפרטיות של GarageOS (להלן: &quot;החברה&quot;, &quot;אנחנו&quot; או &quot;שלנו&quot;).
                GarageOS היא מערכת מבוססת ענן לניהול מוסכים, המאפשרת לבעלי מוסכים, מנהלי עבודה
                ומכונאים לנהל את פעילותם העסקית באופן יעיל ודיגיטלי.
              </p>
              <p>
                מדיניות פרטיות זו מסבירה כיצד אנו אוספים, משתמשים, מאחסנים, משתפים ומגנים על
                המידע האישי שלכם בהתאם לחוק הגנת הפרטיות, התשמ&quot;א-1981, תקנות הגנת הפרטיות
                (אבטחת מידע), התשע&quot;ז-2017, והתקנות האירופיות להגנת מידע (GDPR) ככל שחלות.
              </p>
              <p>
                שימוש בשירותים שלנו מהווה הסכמה לאיסוף ולעיבוד מידע כמתואר במדיניות זו.
                אם אינכם מסכימים לתנאים אלה, אנא אל תשתמשו בשירות.
              </p>
            </div>
          </section>

          {/* 2. Data We Collect */}
          <section>
            <h2 className="text-xl font-black text-on-surface mb-4">2. איזה מידע אנחנו אוספים</h2>
            <div className="text-on-surface-variant leading-relaxed space-y-4">
              <p>אנו אוספים את סוגי המידע הבאים:</p>

              <div>
                <h3 className="text-base font-bold text-on-surface mb-2">2.1 מידע אישי של בעל החשבון</h3>
                <ul className="list-disc pr-6 space-y-1">
                  <li>שם מלא</li>
                  <li>כתובת דואר אלקטרוני</li>
                  <li>מספר טלפון</li>
                  <li>סיסמה מוצפנת</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-bold text-on-surface mb-2">2.2 מידע עסקי</h3>
                <ul className="list-disc pr-6 space-y-1">
                  <li>שם המוסך</li>
                  <li>כתובת העסק</li>
                  <li>מספר עוסק / ח.פ.</li>
                  <li>פרטי תוכנית ותשלום</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-bold text-on-surface mb-2">2.3 נתוני רכבים</h3>
                <ul className="list-disc pr-6 space-y-1">
                  <li>מספרי רישוי</li>
                  <li>יצרן ודגם</li>
                  <li>שנת ייצור</li>
                  <li>מספר קילומטרים</li>
                  <li>היסטוריית טיפולים</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-bold text-on-surface mb-2">2.4 נתוני לקוחות המוסך (מידע מעובד)</h3>
                <p>
                  בעל המוסך מזין למערכת מידע אודות לקוחותיו (שם, טלפון, אימייל, רכבים).
                  ביחס למידע זה, GarageOS משמשת כ&quot;מעבד מידע&quot; (Data Processor) בלבד,
                  ובעל המוסך הוא &quot;בעל המאגר&quot; (Data Controller) האחראי לקבלת הסכמה
                  מלקוחותיו בהתאם לדין.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-on-surface mb-2">2.5 נתוני שימוש</h3>
                <ul className="list-disc pr-6 space-y-1">
                  <li>כתובת IP ומיקום כללי</li>
                  <li>סוג דפדפן ומכשיר</li>
                  <li>דפים שנצפו וזמני גלישה</li>
                  <li>תכונות שנעשה בהן שימוש</li>
                  <li>שגיאות וקריסות</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 3. Purpose */}
          <section>
            <h2 className="text-xl font-black text-on-surface mb-4">3. למה אנחנו אוספים את המידע</h2>
            <div className="text-on-surface-variant leading-relaxed space-y-3">
              <p>אנו משתמשים במידע שנאסף למטרות הבאות:</p>
              <ul className="list-disc pr-6 space-y-2">
                <li>
                  <strong className="text-on-surface">אספקת השירות:</strong> ניהול חשבונכם, עיבוד כרטיסי
                  עבודה, הפקת חשבוניות, שליחת התראות ללקוחותיכם ותפעול כלל תכונות המערכת.
                </li>
                <li>
                  <strong className="text-on-surface">תמיכה ושירות לקוחות:</strong> מענה לפניות,
                  פתרון תקלות ומתן הדרכה.
                </li>
                <li>
                  <strong className="text-on-surface">שיפור המוצר:</strong> ניתוח דפוסי שימוש כדי
                  לשפר את חוויית המשתמש, לפתח תכונות חדשות ולתקן באגים.
                </li>
                <li>
                  <strong className="text-on-surface">תקשורת:</strong> שליחת עדכונים חשובים אודות
                  השירות, שינויים בתנאים ומידע רלוונטי לחשבונכם.
                </li>
                <li>
                  <strong className="text-on-surface">עמידה בדרישות חוק:</strong> מילוי חובות
                  רגולטוריות, לרבות דיני מס, תקנות הגנת פרטיות ודרישות רשויות מוסמכות.
                </li>
                <li>
                  <strong className="text-on-surface">אבטחה:</strong> מניעת הונאות, זיהוי
                  פעילות חשודה והגנה על תקינות המערכת.
                </li>
              </ul>
            </div>
          </section>

          {/* 4. Third-party Sharing */}
          <section>
            <h2 className="text-xl font-black text-on-surface mb-4">4. שיתוף מידע עם צדדים שלישיים</h2>
            <div className="text-on-surface-variant leading-relaxed space-y-3">
              <p>
                אנו לא מוכרים, משכירים או סוחרים במידע האישי שלכם. אנו משתפים מידע עם צדדים
                שלישיים רק במקרים הבאים ובמידה הנדרשת:
              </p>
              <ul className="list-disc pr-6 space-y-2">
                <li>
                  <strong className="text-on-surface">Supabase:</strong> אחסון מסד הנתונים בשרתים
                  באירופה (פרנקפורט, גרמניה). Supabase עומד בדרישות ה-GDPR.
                </li>
                <li>
                  <strong className="text-on-surface">Vercel:</strong> אירוח האתר והאפליקציה.
                  Vercel מעבד בקשות HTTP ומידע טכני בלבד.
                </li>
                <li>
                  <strong className="text-on-surface">Stripe:</strong> עיבוד תשלומים. Stripe מקבלת
                  את פרטי התשלום שלכם בלבד ופועלת בהתאם לתקן PCI DSS.
                </li>
                <li>
                  <strong className="text-on-surface">Twilio:</strong> שליחת הודעות SMS ללקוחות
                  המוסך. Twilio מקבלת מספרי טלפון ותוכן הודעות בלבד.
                </li>
                <li>
                  <strong className="text-on-surface">רשויות חוק:</strong> נשתף מידע עם רשויות
                  אכיפת חוק אם נידרש לכך על-פי צו שיפוטי או דרישה חוקית מחייבת.
                </li>
              </ul>
              <p className="font-bold text-on-surface">
                אנו לא מוכרים מידע אישי לצדדים שלישיים לצרכי פרסום או שיווק.
              </p>
            </div>
          </section>

          {/* 5. Data Security */}
          <section>
            <h2 className="text-xl font-black text-on-surface mb-4">5. אבטחת מידע</h2>
            <div className="text-on-surface-variant leading-relaxed space-y-3">
              <p>
                אנו נוקטים באמצעי אבטחה מתקדמים בהתאם לתקנות הגנת הפרטיות (אבטחת מידע),
                התשע&quot;ז-2017, ולסטנדרטים בינלאומיים מקובלים:
              </p>
              <ul className="list-disc pr-6 space-y-2">
                <li>
                  <strong className="text-on-surface">הצפנה בתעבורה:</strong> כל התקשורת עם
                  השרתים מוצפנת באמצעות TLS 1.3.
                </li>
                <li>
                  <strong className="text-on-surface">הצפנה באחסון:</strong> נתוני מסד הנתונים
                  מוצפנים במנוחה (encryption at rest) באמצעות AES-256.
                </li>
                <li>
                  <strong className="text-on-surface">הפרדת נתונים (Row-Level Security):</strong> כל
                  מוסך רואה אך ורק את המידע שלו. אין גישה לנתונים של מוסכים אחרים ברמת מסד
                  הנתונים.
                </li>
                <li>
                  <strong className="text-on-surface">סיסמאות:</strong> סיסמאות מאוחסנות בגיבוב
                  (hash) חד-כיווני באמצעות bcrypt. אין לנו גישה לסיסמאות שלכם.
                </li>
                <li>
                  <strong className="text-on-surface">גיבויים:</strong> גיבוי יומי אוטומטי
                  של מסד הנתונים עם שמירה מוצפנת.
                </li>
                <li>
                  <strong className="text-on-surface">בקרות גישה:</strong> גישה לשרתים ולמסדי
                  נתונים מוגבלת לצוות מורשה בלבד, עם אימות דו-שלבי.
                </li>
                <li>
                  <strong className="text-on-surface">ביקורות אבטחה:</strong> אנו מבצעים
                  בדיקות אבטחה תקופתיות וסריקות פגיעויות.
                </li>
              </ul>
              <p>
                למרות מאמצינו, אף מערכת אינה חסינה לחלוטין. אנו מתחייבים לדווח על כל
                אירוע אבטחה משמעותי בהתאם לדרישות החוק.
              </p>
            </div>
          </section>

          {/* 6. User Rights */}
          <section>
            <h2 className="text-xl font-black text-on-surface mb-4">6. זכויות המשתמש</h2>
            <div className="text-on-surface-variant leading-relaxed space-y-3">
              <p>
                בהתאם לחוק הגנת הפרטיות הישראלי ולתקנות ה-GDPR (ככל שחלות), עומדות לכם
                הזכויות הבאות:
              </p>
              <ul className="list-disc pr-6 space-y-2">
                <li>
                  <strong className="text-on-surface">זכות עיון:</strong> הזכות לבקש ולקבל עותק
                  של המידע האישי שאנו מחזיקים עליכם.
                </li>
                <li>
                  <strong className="text-on-surface">זכות תיקון:</strong> הזכות לבקש תיקון מידע
                  שגוי או לא מעודכן.
                </li>
                <li>
                  <strong className="text-on-surface">זכות מחיקה:</strong> הזכות לבקש מחיקה של
                  המידע האישי שלכם, בכפוף להוראות חוק המחייבות אותנו לשמור מידע מסוים (למשל,
                  לצרכי מס).
                </li>
                <li>
                  <strong className="text-on-surface">זכות ניידות:</strong> הזכות לקבל את המידע
                  שלכם בפורמט מובנה ונפוץ (כגון CSV או JSON) לצורך העברה לשירות אחר.
                </li>
                <li>
                  <strong className="text-on-surface">זכות התנגדות:</strong> הזכות להתנגד לעיבוד
                  מידע לצרכי שיווק ישיר.
                </li>
              </ul>
              <p>
                למימוש זכויותיכם, פנו אלינו בכתובת{' '}
                <a href="mailto:privacy@garageos.co.il" className="text-primary hover:underline">
                  privacy@garageos.co.il
                </a>
                . נשיב לפנייתכם תוך 30 ימים, כנדרש בחוק.
              </p>
            </div>
          </section>

          {/* 7. Cookies */}
          <section>
            <h2 className="text-xl font-black text-on-surface mb-4">7. עוגיות (Cookies)</h2>
            <div className="text-on-surface-variant leading-relaxed space-y-3">
              <p>אנו משתמשים בעוגיות (cookies) לצרכים הבאים:</p>
              <ul className="list-disc pr-6 space-y-2">
                <li>
                  <strong className="text-on-surface">עוגיות חיוניות (הכרחיות):</strong> עוגיות
                  אימות המשמשות לזיהוי המשתמש ושמירת סשן פעיל. עוגיות אלה הכרחיות לתפעול
                  השירות ולא ניתן לבטלן.
                </li>
                <li>
                  <strong className="text-on-surface">עוגיות אנליטיקה (אופציונליות):</strong> אנו
                  עשויים להשתמש בכלי אנליטיקה לניתוח דפוסי שימוש ושיפור השירות. עוגיות אלה
                  נאספות רק באישורכם.
                </li>
              </ul>
              <p>
                ניתן לנהל את העדפות העוגיות בהגדרות הדפדפן שלכם. שימו לב שחסימת עוגיות
                חיוניות עלולה לפגוע בתפקוד השירות.
              </p>
            </div>
          </section>

          {/* 8. Data Retention */}
          <section>
            <h2 className="text-xl font-black text-on-surface mb-4">8. שמירת מידע</h2>
            <div className="text-on-surface-variant leading-relaxed space-y-3">
              <p>
                אנו שומרים את המידע שלכם כל עוד חשבונכם פעיל ולמשך תקופה סבירה לאחר מכן,
                בהתאם לדרישות חוק:
              </p>
              <ul className="list-disc pr-6 space-y-2">
                <li>נתוני חשבון: נשמרים כל עוד החשבון פעיל.</li>
                <li>לאחר מחיקת חשבון: המידע נשמר 30 ימים נוספים למקרה של שחזור, ולאחר מכן נמחק לצמיתות.</li>
                <li>נתוני חשבוניות ותשלום: נשמרים 7 שנים בהתאם לפקודת מס הכנסה וחוק מע&quot;מ.</li>
                <li>לוגים טכניים: נשמרים עד 90 ימים ונמחקים אוטומטית.</li>
              </ul>
            </div>
          </section>

          {/* 9. Policy Changes */}
          <section>
            <h2 className="text-xl font-black text-on-surface mb-4">9. שינויים במדיניות</h2>
            <div className="text-on-surface-variant leading-relaxed space-y-3">
              <p>
                אנו עשויים לעדכן מדיניות פרטיות זו מעת לעת. במקרה של שינויים מהותיים, נודיע
                לכם באמצעות הודעת דואר אלקטרוני לפחות 14 ימים לפני כניסת השינויים לתוקף.
              </p>
              <p>
                המשך השימוש בשירות לאחר כניסת השינויים לתוקף מהווה הסכמה למדיניות המעודכנת.
              </p>
            </div>
          </section>

          {/* 10. Transfer of Data */}
          <section>
            <h2 className="text-xl font-black text-on-surface mb-4">10. העברת מידע מחוץ לישראל</h2>
            <div className="text-on-surface-variant leading-relaxed space-y-3">
              <p>
                חלק מספקי השירות שלנו (כגון Vercel ו-Stripe) מעבדים מידע מחוץ לישראל.
                במקרים אלה, אנו מוודאים כי:
              </p>
              <ul className="list-disc pr-6 space-y-2">
                <li>המידע מועבר למדינות עם רמת הגנה הולמת בהתאם לחוק הגנת הפרטיות.</li>
                <li>קיימים הסכמי עיבוד מידע (DPA) המבטיחים רמת הגנה שווה או גבוהה יותר.</li>
                <li>מסד הנתונים העיקרי (Supabase) מאוחסן באירופה (פרנקפורט, גרמניה) תחת ה-GDPR.</li>
              </ul>
            </div>
          </section>

          {/* 11. Minors */}
          <section>
            <h2 className="text-xl font-black text-on-surface mb-4">11. קטינים</h2>
            <div className="text-on-surface-variant leading-relaxed space-y-3">
              <p>
                השירות מיועד לשימוש עסקי בלבד ואינו מיועד לקטינים מתחת לגיל 18.
                אנו לא אוספים ביודעין מידע מקטינים. אם נודע לנו שנאסף מידע מקטין,
                נמחק אותו מיידית.
              </p>
            </div>
          </section>

          {/* 12. Contact */}
          <section>
            <h2 className="text-xl font-black text-on-surface mb-4">12. יצירת קשר</h2>
            <div className="text-on-surface-variant leading-relaxed space-y-3">
              <p>
                לשאלות, בקשות או תלונות בנוגע למדיניות פרטיות זו או לטיפול במידע האישי שלכם,
                ניתן לפנות אלינו:
              </p>
              <ul className="list-disc pr-6 space-y-1">
                <li>
                  דואר אלקטרוני:{' '}
                  <a href="mailto:privacy@garageos.co.il" className="text-primary hover:underline">
                    privacy@garageos.co.il
                  </a>
                </li>
                <li>מיקום: ישראל</li>
              </ul>
              <p>
                כמו כן, אתם רשאים להגיש תלונה לרשות להגנת הפרטיות (רשם מאגרי מידע) במשרד
                המשפטים, בכתובת{' '}
                <a
                  href="https://www.gov.il/he/departments/the_privacy_protection_authority"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  www.gov.il
                </a>
                .
              </p>
            </div>
          </section>

          {/* Last updated */}
          <div className="pt-8 border-t border-white/5">
            <p className="text-sm text-on-surface-variant">
              <strong className="text-on-surface">תאריך עדכון אחרון:</strong> מרץ 2026
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
