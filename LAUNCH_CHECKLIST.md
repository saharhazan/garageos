# GarageOS Launch Checklist -- Israeli Market
**Date:** March 30, 2026 | **Product:** GarageOS (garage management SaaS)

---

## PRIORITY 1: MUST DO BEFORE LAUNCH

### 1.1 Business Registration & Legal Entity

- [ ] **Register as Osek Murshe (עוסק מורשה)** -- Required for any Israeli business generating revenue
  - Register with 3 authorities: VAT (Ma'am), Income Tax (Mas Hachnasa), National Insurance (Bituach Leumi)
  - Free to register; accountant assistance costs 300-600 NIS
  - You MUST collect 18% VAT (as of Jan 2025 the rate increased from 17% to 18%) on all SaaS subscriptions sold to Israeli customers
  - **Update the app's default tax rate from 17% to 18%** (currently hardcoded in settings)
  - Alternative: Register a Ltd company (חברה בע"מ) if you want liability protection. Corporate tax is 23%. Recommended if taking investment
- [ ] **Open a business bank account** -- Required for receiving payments, issuing invoices
- [ ] **Engage an accountant (רו"ח)** -- Monthly bookkeeping, bi-monthly VAT reports, annual tax return. Budget: 500-1,500 NIS/month

### 1.2 Invoicing & Tax Compliance

- [ ] **Set up invoicing software** -- Israeli law requires proper tax invoices (חשבונית מס)
  - **Recommended: Green Invoice (חשבונית ירוקה / Morning)** -- Market leader for Israeli freelancers and small businesses
    - Has API for programmatic invoice generation
    - Supports JWT authentication, production + sandbox environments
    - Auto-integration with Israel Tax Authority for allocation numbers
    - WordPress/Wix plugins exist; custom API integration straightforward
  - Alternatives: Invoice4U, iCount, Rivhit, Hashavshevet
- [ ] **Israel Invoice Model (מודל חשבוניות ישראל) compliance:**
  - As of Jan 1, 2026: Allocation number (מספר הקצאה) required for invoices >10,000 NIS (before VAT)
  - As of June 1, 2026: Threshold drops to 5,000 NIS
  - Your accounting software must connect to Tax Authority API for automatic allocation
  - Customers can only deduct input VAT if the invoice has an allocation number
- [ ] **VAT on SaaS subscriptions:**
  - Domestic (Israeli customers): 18% VAT -- must be added to subscription price and remitted
  - Export (non-Israeli customers): 0% VAT -- if the service is consumed outside Israel
  - Must issue proper tax invoices for every subscription payment

### 1.3 Domain & DNS

- [ ] **Buy a .co.il domain**
  - **Israeli registrars:** Galcomm ($25/year, renewal $20), DTNT (domainthenet.com -- official ISOC-IL registrar)
  - **International registrars that support .co.il:** INWX, EuroDNS, OnlyDomains, Gandi.net
  - Registration takes up to 3 working days (manual approval by ISOC-IL registry)
  - No citizenship/residency requirement -- both individuals and organizations can register
  - Suggested domains: garageos.co.il, garage-os.co.il
  - Also secure: garageos.com (for international expansion later)
- [ ] **DNS setup with Vercel:**
  - Add domain in Vercel dashboard -> Project -> Settings -> Domains
  - For apex domain (garageos.co.il): Add A record pointing to Vercel's IP (76.76.21.21)
  - For www subdomain: Add CNAME record pointing to cname.vercel-dns.com
  - Vercel auto-provisions SSL certificate after DNS verification
  - DNS propagation: minutes to hours depending on registrar

### 1.4 Privacy & Legal Documents

- [ ] **Privacy Policy (מדיניות פרטיות)** -- LEGALLY REQUIRED under Privacy Protection Law
  - Must cover: what data you collect, purposes, storage location, third-party sharing, retention periods, user rights
  - Amendment 13 (effective Aug 2025) requires GDPR-like disclosures
  - Must be in Hebrew for Israeli users
  - Document the database: type of data, sources, purposes, processors, storage country, deletion policies, security measures
  - Fines: up to NIS 3.2 million (~$1M USD) for severe non-compliance
- [ ] **Terms of Service (תנאי שימוש)** -- Required for SaaS
  - Service description, subscription terms, billing/cancellation, intellectual property, limitation of liability
  - Governing law: Israeli law, jurisdiction in Tel Aviv or relevant district court
  - Cancellation policy must comply with Consumer Protection Law
- [ ] **Cookie consent banner:**
  - Israeli PPA recommends opt-in for non-essential cookies
  - No explicit cookie law like EU, but PPA enforcement could impose 50-100 NIS per affected individual (min 30,000 NIS)
  - **Recommendation:** Implement basic cookie consent banner -- low effort, avoids risk
  - Tools: cookie-script.com, CookieYes, or build simple custom one
- [ ] **Accessibility Statement (הצהרת נגישות)** -- Required by IS 5568
  - Israeli Standard 5568 requires WCAG 2.1 Level AA compliance
  - Applies to every organization offering services to the public
  - Must provide accessibility statement explaining compliance + contact for reporting issues
  - Non-compliance penalty: up to 50,000 NIS per plaintiff (no need to prove damages)
  - **Tools:** accessiBe, EqualWeb (both Israeli companies), or manual compliance
  - **At minimum:** Ensure keyboard navigation, proper contrast ratios, alt text, form labels

### 1.5 Data Protection Officer (DPO)

- [ ] **Assess DPO requirement:**
  - Amendment 13 requires DPO for entities meeting certain criteria (size, sensitivity of data)
  - For a SaaS startup: likely not required immediately, but becomes required as you grow
  - DPO responsibilities: compliance oversight, risk assessments, monitoring data processing
  - **Recommendation:** Designate someone internally for now; formal DPO when >50 customers

### 1.6 Email Setup

- [ ] **Domain email (Google Workspace or equivalent):**
  - Required addresses: support@garageos.co.il, info@garageos.co.il, privacy@garageos.co.il (for DPO/privacy requests)
  - Google Workspace: $6/user/month (Business Starter)
  - Setup: Verify domain ownership via TXT/CNAME record, configure MX records
  - Set up SPF, DKIM, DMARC records for email deliverability
  - Free aliases (support@, info@, privacy@, legal@) -- don't count as users
- [ ] **Transactional email service:**
  - **Recommended: Resend** -- Best DX for developers, 3,000 emails/month free forever, 40% cheaper than SendGrid, 8-minute setup
  - Alternative: SendGrid (better at enterprise scale, 95.5% delivery rate, but removed free tier -- now 60-day trial only)
  - Alternative: Amazon SES (cheapest at scale, $0.10 per 1,000 emails, more setup required)
  - Use for: Welcome emails, password resets, order status notifications, invoice delivery, subscription confirmations
  - Configure custom sending domain (e.g., mail.garageos.co.il) with SPF/DKIM

### 1.7 Stripe / Payment Processing

- [ ] **Stripe status for Israel:**
  - **Israel is NOT a fully supported Stripe country** as of March 2026
  - GarageOS already has Stripe integration in the codebase -- this works but requires a workaround
  - **Workaround:** Register a US LLC (via doola.com, Firstbase, or similar), get EIN, open US bank account -> use Stripe through US entity
  - Cost: ~$300-500 for LLC formation + $100-200/year registered agent
  - **OR** use an Israeli payment processor for local customers:
- [ ] **Israeli payment processor alternatives:**
  - **Cardcom (CAL/Leumi Card):** Deep local banking integration, supports ILS, OTP, local fraud rules
  - **Tranzila:** Trusted Israeli gateway, supports credit cards + PayPal + mobile payments, 1.5-3% fees, Bank of Israel approved
  - **PayMe (Isracard):** Widely used for local consumers, ILS processing, domestic card support
  - **Recommendation for Israeli market launch:** Use Cardcom or Tranzila for Israeli customers. Keep Stripe via US LLC for international expansion later
- [ ] **Integrate with Green Invoice API** to auto-generate tax invoices on each subscription payment

### 1.8 Google Setup (Essential)

- [ ] **Google Search Console:**
  - Go to search.google.com/search-console, sign in with Google account
  - Add domain property (garageos.co.il) -- covers all subdomains and protocols
  - Verify via DNS TXT record at your registrar
  - Submit sitemap.xml after site is live
  - Monitor indexing status, search performance, crawl errors
- [ ] **Google Analytics 4:**
  - Create GA4 property at analytics.google.com
  - Install via `@next/third-parties/google` (Next.js native library)
  - Add `<GoogleAnalytics gaId="G-XXXXXXX" />` to root layout (client-side only)
  - Track key events: page_view, sign_up, subscription_started, first_order_created
  - Set up "Key Events" (formerly Conversions): pricing page visit, signup completion, trial start, paid conversion
  - GA4 is free and essential -- no reason not to set up
- [ ] **Google Tag Manager (optional but recommended):**
  - Use `@next/third-parties/google` `<GoogleTagManager gtmId="GTM-XYZ" />`
  - Allows marketing team to add/modify tracking without code deploys
  - Set up History Change triggers for SPA navigation tracking
  - Manage Google Ads conversion pixels, Facebook Pixel, etc. through GTM
- [ ] **Google Business Profile:**
  - Pure SaaS companies do NOT qualify (requires physical location or service area)
  - **Skip unless** you have a physical office that customers visit
  - If you do qualify (e.g., you also offer on-site consulting): Create profile at business.google.com

### 1.9 SEO Foundation

- [ ] **sitemap.xml:**
  - Create `src/app/sitemap.ts` using Next.js native sitemap generation
  - Export default function returning array of URLs with lastmod dates
  - Include all public pages: landing, pricing, features, blog posts
  - Exclude: app routes (dashboard, settings, etc.), API routes
  - Will auto-serve at /sitemap.xml
- [ ] **robots.txt:**
  - Create `src/app/robots.ts` using Next.js native robots generation
  - Allow all crawlers on public pages
  - Disallow: /api/*, /dashboard/*, /settings/*, /orders/*, etc.
  - Reference sitemap: `Sitemap: https://garageos.co.il/sitemap.xml`
- [ ] **Structured Data (Schema.org):**
  - Add `SoftwareApplication` schema to landing page (JSON-LD in head)
  - Include: name, applicationCategory, operatingSystem, offers (pricing), aggregateRating
  - Add `Organization` schema: name, url, logo, contactPoint
  - Schema-compliant pages are cited 3.1x more in AI Overviews (Google)
- [ ] **Hebrew SEO specifics:**
  - Set `<html lang="he" dir="rtl">` on all Hebrew pages
  - Use `<link rel="alternate" hreflang="he" />` and `hreflang="en"` when English is added
  - Hebrew keyword considerations: Israelis use short queries (2-3 words), morphologically rich language
  - Target keywords: "תוכנה לניהול מוסך", "מערכת ניהול מוסך", "תוכנה למוסך", "ניהול מוסך בענן"
  - Write meta titles and descriptions in Hebrew
  - Mobile-first: 58% of Israeli searches are mobile

### 1.10 Uptime & Error Monitoring

- [ ] **Error tracking -- Sentry:**
  - Install `@sentry/nextjs` -- provides automatic error capture for Server Components, Actions, Routes
  - Wrap next.config with `withSentryConfig`
  - Supabase integration available (`supabaseIntegration`) for query performance tracking
  - Free tier: 5K errors/month, 10K performance transactions
- [ ] **Uptime monitoring:**
  - **UptimeRobot** (recommended for launch): Free tier with 50 monitors, 60s check intervals
  - Alternative: Better Stack ($29/mo) -- monitoring + incident management + status pages in one
  - Monitor: main site, API endpoints, Supabase health, Stripe webhook endpoint
  - Set up alerts: email + SMS/WhatsApp to founder

---

## PRIORITY 2: SHOULD DO FIRST WEEK AFTER LAUNCH

### 2.1 Analytics & Tracking

- [ ] **Product analytics tool (pick one):**
  - **PostHog (recommended):** Open source, self-hostable, free 1M events/month, autocapture (clicks/pageviews tracked automatically), includes session replay + feature flags. Best for developer-led teams
  - Mixpanel: Best for beginners, 1M events free, requires manual event tracking but cleaner data
  - Amplitude: Best for mature analytics orgs, 10K MTUs free, warehouse-native queries
  - Plausible: Privacy-friendly, no cookies, GDPR compliant by default, lightweight. Good as GA4 supplement
  - **Recommendation:** GA4 (free, essential) + PostHog (free tier, all-in-one) for launch
- [ ] **Key events to track:**
  - **Acquisition:** Landing page visit, pricing page visit, signup button click
  - **Activation:** Account created, garage onboarded, first customer added, first order created
  - **Revenue:** Trial started, subscription started, subscription upgraded/downgraded, subscription cancelled
  - **Engagement:** Daily/weekly active usage, orders per week, invoices generated, SMS/WhatsApp sent
  - **Retention:** Return visit after 7 days, monthly active, churn prediction signals
- [ ] **Conversion funnel:**
  - Landing -> Pricing -> Signup -> Onboarding -> First Order -> Paid Subscription
  - Track drop-off at each stage
  - Set up GA4 funnel exploration report

### 2.2 Marketing Website Content

- [ ] **Landing page SEO optimization:**
  - Hebrew meta title: "GarageOS - תוכנה לניהול מוסך | מערכת ניהול מוסך בענן"
  - Meta description targeting garage owners' pain points
  - H1 with primary keyword, H2s with secondary keywords
  - Fast loading (Vercel edge, Next.js static generation for public pages)
- [ ] **Create essential pages:**
  - /pricing -- Clear pricing tiers in NIS, VAT note
  - /features -- Feature grid with screenshots
  - /about -- Story, team, why GarageOS
  - /contact -- Form + WhatsApp link + phone number
  - /privacy -- Privacy policy in Hebrew
  - /terms -- Terms of service in Hebrew
  - /accessibility -- Accessibility statement (IS 5568 requirement)
- [ ] **Blog setup for SEO:**
  - Create /blog with Hebrew content targeting garage owner searches
  - First articles: "איך לנהל מוסך ביעילות", "מערכת ניהול מוסך - מדריך בחירה", "מעבר מתוכנת נשר לענן"
  - 58% of Israeli searches are mobile -- ensure blog is mobile-optimized

### 2.3 Social Media Presence

- [ ] **Facebook Business Page:**
  - Most important platform for reaching Israeli garage owners (Facebook is dominant in Israel for SMBs)
  - Page name: GarageOS - מערכת ניהול מוסך
  - Post in Hebrew, share product updates, tips for garage management
  - Join and engage in: "איגוד המוסכים, תעסוקה עם אופק" Facebook group
- [ ] **LinkedIn Company Page:**
  - Important for B2B credibility in Israel
  - 80% of B2B leads from social come from LinkedIn
  - Post in both Hebrew and English
  - Connect with garage industry professionals
- [ ] **Instagram (secondary):**
  - Good for visual content: before/after garage transformations, product screenshots
  - Less critical than Facebook/LinkedIn for B2B SaaS
- [ ] **TikTok:** Skip for now -- not relevant for B2B garage SaaS market

### 2.4 WhatsApp Marketing Setup

- [ ] **WhatsApp Business account:**
  - Already integrated via Evolution API -- leverage for marketing
  - Israeli law (Amendment to Communications Law) requires:
    - Prior opt-in consent before sending marketing messages
    - Unsubscribe option in every message
    - No unsolicited messages to people on the Do Not Call registry
    - Fine: NIS 46,080 per violation
  - **Safe approach:** Only send to customers who explicitly opt in during signup
  - **Use for:** Product updates, feature announcements, onboarding tips

### 2.5 Competitor Awareness

- [ ] **Israeli competitors to monitor:**
  - **Nesher (תוכנת נשר) by Tevelsoft:** Most popular in Israel, 1,500+ installations, desktop software. THE main competitor
  - **Manoa (מנוע) by BMSD:** Smart business management system with garage module. Cloud-based
  - **Mosakit 2020 (מוסכית) by Eyal Software:** Professional garage management, serves car mechanics, body shops, A/C, trucks
  - **Minisoft garage module:** Part of broader ERP system
  - **PAYPER:** Cloud-based business management with garage vertical
  - **Priza:** Cloud CRM/ERP with garage management module
  - **Key insight:** Most Israeli competitors are desktop-based or legacy. GarageOS being cloud-native + mobile-first is a real differentiator
- [ ] **International competitors' marketing playbooks:**
  - **Tekmetric (US):** Content marketing (blog, guides), built-in marketing features (booking, reminders, reviews, campaigns). Founded by former shop owner -- origin story matters
  - **Garage Hive (UK):** Community-driven (conferences, Office Hours webinars, Ideas page), industry event sponsorship (The Blend conference), partner integrations (partslink24, GSF). International partnership program launched
  - **Common pattern:** Both lead with education/community, not aggressive sales

---

## PRIORITY 3: NICE TO HAVE FIRST MONTH

### 3.1 Google Ads

- [ ] **Google Ads for Israeli garage market:**
  - Israel CPC is ~55% cheaper than US average
  - Automotive repair average CPC: ~$3.13 US; in Israel likely 5-8 NIS per click
  - Auto repair conversion rate: ~12.96% (one of the best across industries)
  - **Hebrew keywords to target:**
    - "תוכנה לניהול מוסך" (garage management software)
    - "מערכת ניהול מוסך" (garage management system)
    - "תוכנה למוסך" (software for garage)
    - "ניהול מוסך בענן" (cloud garage management)
    - "תוכנה לניהול הזמנות עבודה" (work order management software)
    - "CRM למוסך" (CRM for garage)
  - Start with small budget: 1,000-2,000 NIS/month
  - Target: Israel only, Hebrew language, desktop + mobile
  - Landing page must match ad language (Hebrew)
- [ ] **Google Ads conversion tracking:**
  - Set up via GTM: Track signup completion, trial start, paid conversion
  - Import GA4 key events as Google Ads conversions
  - Use Google Ads Conversion Linker tag

### 3.2 Direct Outreach & Sales

- [ ] **Cold outreach to garage owners:**
  - Phone calls ARE effective in Israeli B2B -- Israelis are direct and respond to personal contact
  - Best approach: WhatsApp message first -> phone call follow-up
  - Target: Garages currently using Nesher (desktop) who want to modernize to cloud
  - Pitch: "ניהול המוסך מהטלפון, בלי התקנות, בלי שרת" (manage your garage from your phone, no installations, no server)
  - Build list from: Garage Association directory, Google Maps listings, Facebook groups
  - Time calls for 8-9 AM or 1-2 PM (before/after peak work hours)
- [ ] **Garage Association (איגוד המוסכים בישראל):**
  - 60,000+ members in the auto repair industry
  - Facebook page: 18,000+ likes -- active community
  - Chairman: Ronen Levy
  - Website: iga.org.il
  - **Actions:** Contact for partnership/sponsorship, attend events, potentially get listed as recommended tool
  - They offer a technology college -- potential for product demos at training events

### 3.3 Industry Events

- [ ] **No major dedicated automotive trade show found in Israel for 2026**
  - Monitor: Tel Aviv Convention Center (Expo Tel Aviv) event calendar
  - The Garage Association runs regional events and training programs
  - Consider: Sponsoring or presenting at association events
  - Alternative: Host your own webinar/meetup for garage owners ("ניהול מוסך חכם 2026")

### 3.4 Content Marketing

- [ ] **SEO content strategy (Hebrew):**
  - Israelis spend 11 minutes average on a page but view fewer pages -- be direct, deliver value fast
  - Blog topics that garage owners search for:
    - "איך לנהל מוסך ביעילות" (how to manage a garage efficiently)
    - "תוכנה לניהול מוסך - השוואה" (garage management software comparison)
    - "מעבר מניהול ידני לדיגיטלי במוסך" (moving from manual to digital management)
    - "ניהול מלאי חלקי חילוף" (spare parts inventory management)
    - "שליחת הודעות ללקוחות מוסך" (sending messages to garage customers)
  - Format: Short, actionable guides with screenshots
  - Professional tone but conversational (credibility matters in Hebrew content)

### 3.5 App Distribution

- [ ] **Google Play Store via TWA:**
  - GarageOS is already a PWA -- can be packaged for Play Store
  - Use Bubblewrap or PWABuilder to create TWA (Trusted Web Activity) wrapper
  - Requirements: Lighthouse score 80+, Digital Asset Links verification, $25 Google Developer account
  - TWA renders in Chrome engine with no browser UI -- looks like native app
  - Users get automatic updates (it's still your web app)
  - **Recommended:** Do this in first month -- adds credibility ("available on Google Play")
- [ ] **Apple App Store:**
  - PWAs CANNOT be listed on App Store -- Apple rejects "repackaged websites"
  - iOS PWA limitations: No App Store distribution, no background sync, limited push (iOS 16.4+ only, not in EU)
  - EU users: PWAs open as Safari tabs (no standalone mode) since iOS 17.4
  - 50MB cache limit on iOS Safari
  - **Recommendation:** PWA is fine for iOS initially. Native app (React Native/Capacitor) is a Phase 4 item

### 3.6 Supabase Backup Strategy

- [ ] **Configure database backups:**
  - **Pro Plan (current):** Automatic daily backups, 7-day retention
  - **PITR (Point-in-Time Recovery):** Add-on, allows restore to any second. Requires Small compute add-on minimum
  - PITR replaces daily backups (finer granularity)
  - **Recommendation for launch:** Pro Plan daily backups are sufficient. Add PITR when you have paying customers with critical data
  - Also: Export critical tables (customers, orders) to external backup weekly via pg_dump or Supabase CLI

### 3.7 Status Page

- [ ] **Public status page:**
  - Better Stack: Beautiful, customizable, included in $29/mo plan
  - Alternative: Free Instatus, Atlassian Statuspage
  - URL: status.garageos.co.il
  - Shows: API status, App status, Database status, SMS/WhatsApp status
  - Builds trust with paying customers

### 3.8 Advanced Monitoring & Logging

- [ ] **Logging:**
  - Vercel provides built-in function logs
  - For advanced: Axiom (free tier, Vercel integration), Better Stack Logs, or Loki
  - Log: API errors, authentication failures, payment events, notification delivery status
- [ ] **Performance monitoring:**
  - Sentry Performance (included in error tracking setup)
  - Vercel Speed Insights (free, built-in)
  - Monitor: page load times, API response times, database query performance

### 3.9 GDPR-Adjacent Compliance Tools

- [ ] **Data export (right to portability):**
  - Build admin endpoint to export all customer data as JSON/CSV
  - Required by Israeli Privacy Protection Law (and GDPR if you expand)
- [ ] **Data deletion (right to erasure):**
  - Build admin endpoint to delete all data associated with a customer/user
  - Must cascade: user -> garage -> orders -> customers -> vehicles -> inventory
  - Log all deletion requests and completions
- [ ] **Data processing record:**
  - Maintain a document listing: all personal data types, purposes, processors, countries, retention periods
  - Required by Amendment 13

---

## REFERENCE: KEY CONTACTS & RESOURCES

### Registrars
| Service | URL | Notes |
|---------|-----|-------|
| Galcomm | galcomm.com | .co.il domains, $25/year |
| DTNT | domainthenet.com | Official ISOC-IL registrar |
| ISOC-IL | isoc.org.il | .il domain registry |

### Payment Processors (Israel)
| Service | Type | Fees |
|---------|------|------|
| Cardcom/CAL | Gateway + acquirer | 1.5-3% |
| Tranzila | Gateway | 1.5-3%, Bank of Israel approved |
| PayMe/Isracard | Gateway | Local ILS processing |
| Green Invoice | Invoicing + payments | See pricing on greeninvoice.co.il |

### Invoicing Software
| Service | URL | Notes |
|---------|-----|-------|
| Green Invoice (Morning) | greeninvoice.co.il | Market leader, has API, auto allocation numbers |
| Invoice4U | invoice4u.co.il | Popular alternative |
| iCount | icount.co.il | Online accounting + invoicing |
| Rivhit | rivhit.co.il | Accounting software |

### Analytics Tools
| Tool | Free Tier | Best For |
|------|-----------|----------|
| GA4 | Unlimited | Essential web analytics |
| PostHog | 1M events/mo | Product analytics + session replay + flags |
| Mixpanel | 1M events/mo | Event analytics for PMs |
| Plausible | Self-host free | Privacy-friendly, no cookies |

### Email Services
| Service | Free Tier | Best For |
|---------|-----------|----------|
| Resend | 3,000/mo forever | Dev-friendly transactional email |
| SendGrid | 60-day trial | Enterprise scale |
| Amazon SES | 3,000/mo (with AWS) | Cheapest at volume |

### Israeli Competitors
| Product | Type | Est. Users | Tech |
|---------|------|-----------|------|
| Nesher (נשר) | Desktop | 1,500+ installs | Legacy/desktop |
| Manoa (מנוע) | Cloud | Unknown | Web-based |
| Mosakit 2020 (מוסכית) | Desktop | Unknown | Legacy |
| PAYPER | Cloud | Unknown | Web-based |
| Minisoft | Desktop module | Unknown | ERP system |

### Legal/Compliance
| Requirement | Status | Penalty |
|-------------|--------|---------|
| Privacy Policy | Required | Up to NIS 3.2M |
| Accessibility (IS 5568) | Required (WCAG 2.1 AA) | Up to NIS 50K per claim |
| Cookie Consent | Recommended (PPA guidance) | NIS 50-100 per person |
| Terms of Service | Required for SaaS | Civil liability |
| Tax Invoices | Required | Tax Authority enforcement |
| WhatsApp Marketing Consent | Required (opt-in) | NIS 46K per violation |

### Key Hebrew SEO Keywords
| Keyword | Meaning | Priority |
|---------|---------|----------|
| תוכנה לניהול מוסך | Garage management software | HIGH |
| מערכת ניהול מוסך | Garage management system | HIGH |
| תוכנה למוסך | Software for garage | HIGH |
| ניהול מוסך בענן | Cloud garage management | HIGH |
| ניהול הזמנות עבודה | Work order management | MEDIUM |
| CRM למוסך | CRM for garage | MEDIUM |
| הפקת חשבוניות למוסך | Invoice generation for garage | MEDIUM |
| ניהול מלאי חלפים | Parts inventory management | MEDIUM |

---

## SUMMARY: LAUNCH TIMELINE

### Week -2 to -1 (Before Launch)
1. Register Osek Murshe / business entity
2. Buy .co.il domain, configure DNS + Vercel
3. Set up Green Invoice + tax compliance
4. Set up payment processor (Cardcom/Tranzila OR Stripe via US LLC)
5. Write privacy policy, terms of service, accessibility statement (in Hebrew)
6. Add cookie consent banner
7. Set up Google Workspace email (support@, info@, privacy@)
8. Set up Resend for transactional emails
9. Configure Google Search Console + GA4
10. Create sitemap.xml, robots.txt, structured data
11. Set up Sentry error tracking
12. Set up UptimeRobot monitoring
13. **Fix VAT rate from 17% to 18%**

### Week 1 (Launch Week)
1. Go live on garageos.co.il
2. Submit sitemap to Google Search Console
3. Set up PostHog analytics
4. Create Facebook Business Page + LinkedIn Company Page
5. Post launch announcement on social media (Hebrew)
6. Begin SEO blog content (2 articles)
7. Contact Garage Association for partnership discussion
8. Start small Google Ads campaign (1,000 NIS/month)

### Week 2-4 (First Month)
1. Package PWA for Google Play Store via TWA
2. Set up conversion tracking (GA4 -> Google Ads)
3. Begin cold outreach to garage owners (WhatsApp + phone)
4. Publish 4-6 blog posts targeting Hebrew keywords
5. Configure Supabase PITR backups
6. Set up public status page
7. Build data export/deletion capabilities for privacy compliance
8. Attend/engage with Garage Association events
9. Iterate on product based on first user feedback

---

## COST ESTIMATE: MONTHLY OPERATING COSTS

| Item | Monthly Cost | Notes |
|------|-------------|-------|
| Vercel | $0-20 | Pro plan if needed |
| Supabase | $25 | Pro plan |
| Google Workspace | $6-12 | 1-2 users |
| Resend | $0 | Free tier (3K emails) |
| Sentry | $0 | Free tier |
| UptimeRobot | $0 | Free tier |
| PostHog | $0 | Free tier (1M events) |
| Green Invoice | ~100-200 NIS | Invoicing software |
| Domain (.co.il) | ~$2/mo | $25/year |
| Accountant | 500-1,500 NIS | Monthly bookkeeping |
| Google Ads | 1,000-2,000 NIS | Optional, adjustable |
| US LLC (if Stripe) | ~$50/mo | $500-600/year total |
| **TOTAL** | **~1,800-4,000 NIS/mo** | **~$500-1,100/mo** |
