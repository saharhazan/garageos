import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'תנאי שימוש | GarageOS',
  description: 'תנאי השימוש של GarageOS — התנאים המסדירים את השימוש במערכת ניהול המוסכים שלנו.',
}

export default function TermsPage() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-6 md:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-black text-on-surface tracking-tight mb-4">
            תנאי שימוש
          </h1>
          <p className="text-on-surface-variant">
            עדכון אחרון: מרץ 2026
          </p>
        </div>

        {/* Content */}
        <div className="prose-custom space-y-10 text-right" dir="rtl">

          {/* 1. Definitions */}
          <section>
            <h2 className="text-xl font-black text-on-surface mb-4">1. הגדרות</h2>
            <div className="text-on-surface-variant leading-relaxed space-y-3">
              <p>במסמך זה, למונחים הבאים תהיה המשמעות שלצידם:</p>
              <ul className="list-disc pr-6 space-y-2">
                <li>
                  <strong className="text-on-surface">&quot;השירות&quot;</strong> — מערכת GarageOS
                  לניהול מוסכים, על כל רכיביה, לרבות האתר, האפליקציה, ממשקי API וכל תכונה
                  נלווית.
                </li>
                <li>
                  <strong className="text-on-surface">&quot;המשתמש&quot;</strong> — כל אדם או
                  ישות משפטית הנרשמים לשירות או משתמשים בו, לרבות בעל המוסך, מנהלי עבודה,
                  מכונאים ועובדים אחרים.
                </li>
                <li>
                  <strong className="text-on-surface">&quot;המוסך&quot;</strong> — העסק (מוסך
                  לתיקון רכבים או עסק דומה) שלשמו נפתח החשבון.
                </li>
                <li>
                  <strong className="text-on-surface">&quot;נתוני לקוחות&quot;</strong> — כל מידע
                  שהמשתמש מזין למערכת, לרבות פרטי לקוחות המוסך, נתוני רכבים, כרטיסי עבודה,
                  חשבוניות ומסמכים.
                </li>
                <li>
                  <strong className="text-on-surface">&quot;החברה&quot;</strong> — GarageOS,
                  ישראל.
                </li>
              </ul>
            </div>
          </section>

          {/* 2. Acceptance */}
          <section>
            <h2 className="text-xl font-black text-on-surface mb-4">2. קבלת התנאים</h2>
            <div className="text-on-surface-variant leading-relaxed space-y-3">
              <p>
                בהרשמה לשירות, בגישה אליו או בשימוש בו, אתם מאשרים כי קראתם, הבנתם
                ומסכימים להיות מחויבים לתנאי שימוש אלה. אם אתם נרשמים בשם ארגון, אתם מצהירים
                שיש לכם סמכות לחייב את הארגון בתנאים אלה.
              </p>
              <p>
                אם אינכם מסכימים לתנאים אלה, אנא אל תשתמשו בשירות.
              </p>
            </div>
          </section>

          {/* 3. Service Description */}
          <section>
            <h2 className="text-xl font-black text-on-surface mb-4">3. תיאור השירות</h2>
            <div className="text-on-surface-variant leading-relaxed space-y-3">
              <p>
                GarageOS היא מערכת מבוססת ענן לניהול מוסכים, הכוללת בין היתר:
              </p>
              <ul className="list-disc pr-6 space-y-1">
                <li>ניהול כרטיסי עבודה</li>
                <li>ניהול לקוחות ורכבים (CRM)</li>
                <li>הפקת הצעות מחיר, חשבוניות וקבלות</li>
                <li>ניהול מלאי חלקים</li>
                <li>שליחת התראות ללקוחות (SMS, WhatsApp)</li>
                <li>לוח בקרה ודוחות</li>
                <li>ניהול צוות עובדים</li>
              </ul>
              <p>
                החברה שומרת לעצמה את הזכות לשנות, להוסיף או להסיר תכונות מהשירות בכל
                עת, בכפוף להודעה מוקדמת למשתמשים בתוכניות בתשלום.
              </p>
            </div>
          </section>

          {/* 4. Registration & Account */}
          <section>
            <h2 className="text-xl font-black text-on-surface mb-4">4. הרשמה וחשבון</h2>
            <div className="text-on-surface-variant leading-relaxed space-y-3">
              <ul className="list-disc pr-6 space-y-2">
                <li>
                  <strong className="text-on-surface">מידע מדויק:</strong> עליכם לספק מידע
                  מדויק, מלא ועדכני בעת ההרשמה. אתם אחראים לעדכן את פרטיכם בכל שינוי.
                </li>
                <li>
                  <strong className="text-on-surface">אבטחת חשבון:</strong> אתם אחראים לשמירה
                  על סודיות הסיסמה שלכם. אנא אל תשתפו את פרטי הכניסה שלכם עם אחרים.
                  הודיעו לנו מיד על כל שימוש בלתי מורשה בחשבונכם.
                </li>
                <li>
                  <strong className="text-on-surface">חשבון אחד:</strong> כל אדם רשאי להחזיק
                  חשבון משתמש אחד בלבד. ניתן להיות מוזמן למספר מוסכים תחת אותו חשבון.
                </li>
                <li>
                  <strong className="text-on-surface">גיל מינימלי:</strong> השירות מיועד
                  למשתמשים מעל גיל 18 בלבד.
                </li>
              </ul>
            </div>
          </section>

          {/* 5. Acceptable Use */}
          <section>
            <h2 className="text-xl font-black text-on-surface mb-4">5. שימוש מותר</h2>
            <div className="text-on-surface-variant leading-relaxed space-y-3">
              <p>אתם מתחייבים להשתמש בשירות אך ורק לצרכים חוקיים הקשורים לניהול מוסך. בפרט:</p>
              <ul className="list-disc pr-6 space-y-2">
                <li>לא תשתמשו בשירות לפעילות בלתי חוקית או שאינה מורשית.</li>
                <li>לא תנסו לגשת לנתונים של מוסכים או משתמשים אחרים.</li>
                <li>לא תנסו לפרוץ, לשבש או להעמיס את המערכת.</li>
                <li>לא תעתיקו, תפרקו או תבצעו הנדסה הפוכה של תוכנת השירות.</li>
                <li>לא תשתמשו בשירות לשליחת ספאם, תוכן פוגעני או הטעיה.</li>
                <li>לא תעלו קבצים זדוניים או קוד מזיק.</li>
              </ul>
              <p>
                הפרת סעיף זה עלולה לגרור השעיה או סגירה מיידית של החשבון, ללא הודעה מוקדמת.
              </p>
            </div>
          </section>

          {/* 6. Plans & Payment */}
          <section>
            <h2 className="text-xl font-black text-on-surface mb-4">6. תוכניות ותשלום</h2>
            <div className="text-on-surface-variant leading-relaxed space-y-3">
              <ul className="list-disc pr-6 space-y-2">
                <li>
                  <strong className="text-on-surface">תקופת ניסיון:</strong> תוכנית ניסיון חינמית
                  זמינה ל-14 ימים. בתום תקופת הניסיון, יש לבחור תוכנית בתשלום כדי להמשיך
                  להשתמש בשירות.
                </li>
                <li>
                  <strong className="text-on-surface">חיוב:</strong> תוכניות בתשלום מחויבות
                  מדי חודש. החיוב מתבצע באופן אוטומטי באמצעות אמצעי התשלום שהגדרתם.
                </li>
                <li>
                  <strong className="text-on-surface">מחירים:</strong> כל המחירים מוצגים
                  בשקלים חדשים (ILS) ואינם כוללים מע&quot;מ. מע&quot;מ יתווסף בהתאם לשיעור
                  המע&quot;מ החוקי (נכון למועד זה: 18%).
                </li>
                <li>
                  <strong className="text-on-surface">שינויי מחירים:</strong> אנו שומרים לעצמנו
                  את הזכות לשנות מחירים בהודעה מוקדמת של 30 ימים. השינוי ייכנס לתוקף במחזור
                  החיוב הבא.
                </li>
                <li>
                  <strong className="text-on-surface">ביטול:</strong> ניתן לבטל את המנוי בכל
                  עת דרך הגדרות החשבון. הביטול ייכנס לתוקף בסוף תקופת החיוב הנוכחית.
                </li>
                <li>
                  <strong className="text-on-surface">מדיניות החזרים:</strong> לא ניתנים החזרים
                  עבור חודשים חלקיים. במקרה של ביטול באמצע חודש, השירות ימשיך לפעול עד סוף
                  תקופת החיוב ששולמה.
                </li>
                <li>
                  <strong className="text-on-surface">כשלון חיוב:</strong> במקרה של כשלון בחיוב,
                  ננסה לחייב שוב עד 3 פעמים. אם החיוב לא יצליח, החשבון יוגבל לגישה לקריאה
                  בלבד עד להסדרת התשלום.
                </li>
              </ul>
            </div>
          </section>

          {/* 7. Intellectual Property */}
          <section>
            <h2 className="text-xl font-black text-on-surface mb-4">7. קניין רוחני</h2>
            <div className="text-on-surface-variant leading-relaxed space-y-3">
              <ul className="list-disc pr-6 space-y-2">
                <li>
                  <strong className="text-on-surface">בעלות על השירות:</strong> כל הזכויות
                  בשירות, לרבות התוכנה, העיצוב, הלוגו, הקוד, התיעוד והתוכן, שייכות לחברה
                  ומוגנות בזכויות יוצרים ובדיני קניין רוחני.
                </li>
                <li>
                  <strong className="text-on-surface">רישיון שימוש:</strong> אנו מעניקים לכם
                  רישיון מוגבל, לא בלעדי, לא ניתן להעברה, לשימוש בשירות בהתאם לתנאים אלה
                  ולתוכנית שנבחרה.
                </li>
                <li>
                  <strong className="text-on-surface">בעלות על הנתונים:</strong> אתם הבעלים
                  של כל הנתונים שאתם מזינים למערכת. אנו לא טוענים לבעלות על נתוני הלקוחות
                  שלכם. אתם רשאים לייצא את הנתונים שלכם בכל עת.
                </li>
                <li>
                  <strong className="text-on-surface">משוב:</strong> כל משוב, הצעה או רעיון
                  שתשלחו לנו בנוגע לשירות ניתנים לנו ברישיון חופשי לשימוש, ללא חובת תגמול.
                </li>
              </ul>
            </div>
          </section>

          {/* 8. Limitation of Liability */}
          <section>
            <h2 className="text-xl font-black text-on-surface mb-4">8. הגבלת אחריות</h2>
            <div className="text-on-surface-variant leading-relaxed space-y-3">
              <ul className="list-disc pr-6 space-y-2">
                <li>
                  <strong className="text-on-surface">שירות &quot;כמו שהוא&quot; (As Is):</strong> השירות
                  ניתן &quot;כמו שהוא&quot; (as is) ו-&quot;כפי שזמין&quot; (as available), ללא
                  אחריות מכל סוג, מפורשת או משתמעת.
                </li>
                <li>
                  <strong className="text-on-surface">זמינות:</strong> אנו שואפים לזמינות של
                  99.9%, אך איננו מתחייבים לזמינות רציפה וללא הפרעות. השירות עשוי שלא להיות
                  זמין בעת תחזוקה מתוכננת או אירועים בלתי צפויים.
                </li>
                <li>
                  <strong className="text-on-surface">אובדן נתונים:</strong> אנו נוקטים באמצעים
                  סבירים לגיבוי נתונים, אך איננו אחראים לאובדן נתונים מעבר לאמצעים סבירים אלה.
                  מומלץ לגבות את הנתונים שלכם באופן עצמאי.
                </li>
                <li>
                  <strong className="text-on-surface">תקרת אחריות:</strong> בכל מקרה, האחריות
                  המצטברת של החברה כלפי המשתמש לא תעלה על הסכום ששילם המשתמש לחברה ב-12
                  החודשים שקדמו לאירוע שגרם לנזק.
                </li>
                <li>
                  <strong className="text-on-surface">נזקים עקיפים:</strong> החברה לא תהיה
                  אחראית בשום מקרה לנזקים עקיפים, תוצאתיים, מיוחדים או עונשיים, לרבות אובדן
                  רווחים, אובדן מוניטין או הפסד עסקי.
                </li>
              </ul>
            </div>
          </section>

          {/* 9. Termination */}
          <section>
            <h2 className="text-xl font-black text-on-surface mb-4">9. סיום שירות</h2>
            <div className="text-on-surface-variant leading-relaxed space-y-3">
              <ul className="list-disc pr-6 space-y-2">
                <li>
                  <strong className="text-on-surface">ביטול על-ידי המשתמש:</strong> אתם רשאים
                  לסגור את חשבונכם בכל עת דרך הגדרות החשבון או בפנייה אלינו.
                </li>
                <li>
                  <strong className="text-on-surface">השעיה על-ידי החברה:</strong> אנו רשאים
                  להשעות או לסיים את חשבונכם מיידית אם הפרתם את תנאי השימוש, במיוחד סעיף
                  השימוש המותר (סעיף 5).
                </li>
                <li>
                  <strong className="text-on-surface">שמירת נתונים:</strong> לאחר סגירת החשבון,
                  נשמור את הנתונים שלכם למשך 30 ימים לצורך שחזור אפשרי. לאחר 30 ימים,
                  הנתונים יימחקו לצמיתות.
                </li>
                <li>
                  <strong className="text-on-surface">ייצוא נתונים:</strong> לפני סגירת החשבון,
                  מומלץ לייצא את הנתונים שלכם באמצעות כלי הייצוא במערכת.
                </li>
                <li>
                  <strong className="text-on-surface">חובות שורדים:</strong> סעיפי קניין רוחני,
                  הגבלת אחריות, שיפוי ודין חל ימשיכו לחול גם לאחר סיום ההתקשרות.
                </li>
              </ul>
            </div>
          </section>

          {/* 10. Changes */}
          <section>
            <h2 className="text-xl font-black text-on-surface mb-4">10. שינויים בתנאים</h2>
            <div className="text-on-surface-variant leading-relaxed space-y-3">
              <p>
                אנו רשאים לעדכן תנאי שימוש אלה מעת לעת. במקרה של שינויים מהותיים, נודיע
                לכם באמצעות:
              </p>
              <ul className="list-disc pr-6 space-y-1">
                <li>הודעת דואר אלקטרוני לפחות 30 ימים מראש.</li>
                <li>הודעה בולטת בממשק המערכת.</li>
              </ul>
              <p>
                המשך השימוש בשירות לאחר כניסת השינויים לתוקף מהווה הסכמה לתנאים המעודכנים.
                אם אינכם מסכימים לשינויים, עליכם להפסיק את השימוש בשירות ולסגור את חשבונכם.
              </p>
            </div>
          </section>

          {/* 11. Indemnification */}
          <section>
            <h2 className="text-xl font-black text-on-surface mb-4">11. שיפוי</h2>
            <div className="text-on-surface-variant leading-relaxed space-y-3">
              <p>
                אתם מתחייבים לשפות ולפצות את החברה, עובדיה, מנהליה ושלוחיה מפני כל תביעה,
                דרישה, נזק, הפסד או הוצאה (לרבות שכ&quot;ט עורכי דין) הנובעים מ:
              </p>
              <ul className="list-disc pr-6 space-y-1">
                <li>הפרת תנאי שימוש אלה על-ידכם.</li>
                <li>שימוש בלתי חוקי או בלתי מורשה בשירות.</li>
                <li>הפרת זכויות צד שלישי על-ידכם.</li>
                <li>מידע שגוי או מטעה שסיפקתם.</li>
              </ul>
            </div>
          </section>

          {/* 12. SLA */}
          <section>
            <h2 className="text-xl font-black text-on-surface mb-4">12. רמת שירות (SLA)</h2>
            <div className="text-on-surface-variant leading-relaxed space-y-3">
              <p>
                אנו שואפים לספק זמינות של 99.9% (uptime). תחזוקה מתוכננת תתבצע בשעות
                הלילה (00:00-06:00 שעון ישראל) ככל הניתן, ותתואם מראש עם הודעה של 48 שעות.
              </p>
              <p>
                במקרה של תקלה משמעותית, נעדכן את המשתמשים בדף הסטטוס של המערכת
                ובאמצעות דואר אלקטרוני.
              </p>
            </div>
          </section>

          {/* 13. Governing Law */}
          <section>
            <h2 className="text-xl font-black text-on-surface mb-4">13. דין חל וסמכות שיפוט</h2>
            <div className="text-on-surface-variant leading-relaxed space-y-3">
              <p>
                על תנאי שימוש אלה יחולו דיני מדינת ישראל בלבד, ללא התחשבות בכללי ברירת
                הדין.
              </p>
              <p>
                לבתי המשפט המוסמכים בתל אביב-יפו תהיה סמכות שיפוט ייחודית ובלעדית בכל
                סכסוך הנובע מתנאי שימוש אלה או הקשור אליהם.
              </p>
              <p>
                הצדדים ינסו לפתור כל מחלוקת בדרכי הידברות ומשא ומתן בתום לב לפני פנייה
                לערכאות.
              </p>
            </div>
          </section>

          {/* 14. Miscellaneous */}
          <section>
            <h2 className="text-xl font-black text-on-surface mb-4">14. שונות</h2>
            <div className="text-on-surface-variant leading-relaxed space-y-3">
              <ul className="list-disc pr-6 space-y-2">
                <li>
                  <strong className="text-on-surface">הפרדת סעיפים:</strong> אם סעיף כלשהו
                  בתנאים אלה יימצא בלתי תקף או בלתי אכיף, שאר הסעיפים ימשיכו לחול במלואם.
                </li>
                <li>
                  <strong className="text-on-surface">ויתור:</strong> אי-אכיפה של זכות מצד
                  החברה לא תהווה ויתור על אותה זכות.
                </li>
                <li>
                  <strong className="text-on-surface">הסכם מלא:</strong> תנאים אלה, יחד עם
                  מדיניות הפרטיות, מהווים את ההסכם המלא ביניכם לבין החברה ומחליפים כל
                  הסכמה קודמת.
                </li>
                <li>
                  <strong className="text-on-surface">המחאה:</strong> אינכם רשאים להמחות או
                  להעביר את זכויותיכם לפי תנאים אלה ללא הסכמתנו בכתב מראש.
                </li>
              </ul>
            </div>
          </section>

          {/* 15. Contact */}
          <section>
            <h2 className="text-xl font-black text-on-surface mb-4">15. יצירת קשר</h2>
            <div className="text-on-surface-variant leading-relaxed space-y-3">
              <p>
                לשאלות בנוגע לתנאי שימוש אלה, ניתן לפנות אלינו:
              </p>
              <ul className="list-disc pr-6 space-y-1">
                <li>
                  דואר אלקטרוני:{' '}
                  <a href="mailto:legal@garageos.co.il" className="text-primary hover:underline">
                    legal@garageos.co.il
                  </a>
                </li>
                <li>מיקום: ישראל</li>
              </ul>
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
