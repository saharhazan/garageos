# GarageOS Competitive Analysis & International Expansion Strategy

**Date:** March 30, 2026
**Prepared for:** GarageOS Product Team

---

## 1. COMPETITIVE LANDSCAPE SUMMARY

### 1.1 US Market (Largest, Most Competitive)

| Product | Pricing | Target | Key Differentiator |
|---------|---------|--------|-------------------|
| **Tekmetric** | $199-$439/mo | Independent shops, multi-shop | Cloud-native, best DVI, Smart Jobs, Tire Suite |
| **Shop-Ware** | $117-$224+/mo | Larger shops, multi-location | 89% work approval rate, built-in accounting, transparency tools |
| **Shopmonkey** | $125-$179+/mo | Small-to-mid shops | Best UX, dedicated tech app, Buy Now Pay Later |
| **Mitchell 1 Manager SE** | Custom | Independent + dealerships | 180+ reports, OEM repair data (ProDemand), industry veteran |
| **AutoLeap** | Custom (annual) | Independent shops | Strong DVI, QuickBooks integration, Google Reviews |
| **Shop Boss** | $199-$399/mo | Independent, multi-shop | DVI with video, live chat, employee time clock |
| **AutoFluent** | $95-$259/mo | Tire dealers, multi-location | CARFAX integration, multi-location inventory, commission tracking |
| **RepairPal** | Custom | Certified shop network | Consumer-facing price estimator, shop certification program |

### 1.2 UK/EU Market

| Product | Pricing | Target | Key Differentiator |
|---------|---------|--------|-------------------|
| **Garage Hive** | From GBP 109/mo | UK independent garages | Built on Microsoft Dynamics 365, MOT reminders, GSF Parts integration |
| **MAM Autowork Online** | From GBP 75/mo | UK workshops (3000+ garages) | Autocat parts catalog, VRM lookup, Bookar online booking |
| **TyreSoft** | Custom | UK tyre centres | Tyre-specific workflows, TPMS |
| **GaragePlug** | Custom | Global (India-based) | Virtual service advisor, self-check-in, WhatsApp integration |
| **GarageBox** | Custom | EU garages | Online booking, WhatsApp/SMS/Email updates, custom web forms |

### 1.3 Market Observations

1. **The US market is dominated by cloud-native SaaS players** (Tekmetric, Shopmonkey, Shop-Ware) that have raised significant VC funding and built comprehensive platforms.
2. **The UK/EU market is more fragmented**, with regional players and less sophisticated tooling. This represents an opportunity.
3. **No single player dominates internationally.** Most are US-focused or UK-focused with no cross-border playbook.
4. **Pricing ranges from $95/mo to $439/mo** depending on features and shop size. The sweet spot for independent shops is $150-$250/mo.
5. **WhatsApp integration is rare in US tools but common in EU/UK/global tools** -- this is a GarageOS strength.
6. **DVI (Digital Vehicle Inspection) is the single most important feature** driving adoption in 2025-2026.

---

## 2. FEATURE COMPARISON: GarageOS vs. INDUSTRY

### 2.1 What GarageOS Currently Has

| Feature | Status | Notes |
|---------|--------|-------|
| Work Order Management | YES | Create, track status, items, notes, status flow |
| Customer CRM | YES | Name, phone, email, vehicles, notes |
| Vehicle Registry | YES | License plate, make/model/year/color/VIN |
| Inventory Tracking | YES | SKU, quantity, min-stock alerts, supplier, category |
| Dashboard KPIs | YES | Open orders, revenue today/week/month, ready count |
| SMS Notifications | YES | Via Twilio |
| WhatsApp Notifications | YES | Via Evolution API |
| Monthly Reports | BASIC | Revenue, order count, avg per order, top customers |
| Role-Based Access | YES | 5 roles (super_admin, manager, receptionist, technician, viewer) |
| Multi-Tenant | YES | Multiple garages per deployment |
| Hebrew RTL UI | YES | Full RTL with Heebo font |
| PWA Mobile | YES | Progressive Web App |
| Stripe Billing | YES | Checkout, portal, webhook handling |
| Quote Management | YES | Draft/sent/accepted/rejected/expired, quote-to-order |
| PDF Generation | YES | Work order PDF with Hebrew RTL |
| Status Timeline | YES | Visual progress bar (received > in_progress > ready > delivered) |
| License Plate Display | YES | Israeli-style yellow plate rendering |
| Settings Management | YES | Profile, garage, notifications, security, billing |
| Job Number Sequencing | YES | Auto-incrementing per garage per year |
| Tax Calculation | YES | Configurable tax rate (default 17% for Israel VAT) |

### 2.2 Industry Table Stakes (Must-Have by 2026)

| Feature | GarageOS | Tekmetric | Shopmonkey | Shop-Ware | Garage Hive |
|---------|----------|-----------|------------|-----------|-------------|
| Work Orders/RO | YES | YES | YES | YES | YES |
| Customer CRM | YES | YES | YES | YES | YES |
| Vehicle Management | YES | YES | YES | YES | YES |
| Inventory Management | YES | YES | YES | YES | YES |
| Dashboard/KPIs | YES | YES | YES | YES | YES |
| **Digital Vehicle Inspection (DVI)** | **NO** | YES | YES | YES | YES |
| **Parts Catalog Integration** | **NO** | YES | YES | YES | YES |
| **Appointment Scheduling/Calendar** | **NO** | YES | YES | YES | YES |
| **Customer Portal** | **NO** | YES | YES | YES | YES |
| **Accounting Integration (QB/Xero)** | **NO** | YES | YES | YES | YES |
| **Payment Processing (in-app)** | **NO** | YES | YES | YES | YES |
| **Two-Way Customer Texting** | **NO** | YES | YES | YES | Partial |
| **Native Mobile App (iOS/Android)** | **NO** (PWA) | YES | YES | YES | NO |
| **Technician Time Tracking** | **NO** | YES | YES | YES | YES |
| **Multi-Location Management** | **NO** | YES | YES | YES | YES |
| SMS/WhatsApp Notifications | YES | YES (SMS) | YES (SMS) | YES (SMS) | YES |
| Quote/Estimate Management | YES | YES | YES | YES | YES |
| PDF/Invoice Generation | YES | YES | YES | YES | YES |
| Reporting/Analytics | BASIC | Advanced | Advanced | Advanced | Advanced |
| Role-Based Access | YES | YES | YES | YES | YES |

---

## 3. TOP 10 MISSING FEATURES (Ranked by Priority for International Expansion)

### PRIORITY 1: CRITICAL (Blocks sales -- competitors all have these)

#### 1. Digital Vehicle Inspection (DVI) with Photos/Video
**Why:** DVI is the #1 feature driving SaaS adoption in auto repair. Shops using DVI report 76% more approved work (AutoVitals data). Every major competitor has this. Without DVI, GarageOS cannot compete internationally.

**What to build:**
- Multi-point inspection checklist (customizable per service type)
- Photo capture with annotations/markup
- Video recording support
- Red/Yellow/Green condition indicators
- Customer-facing inspection report (shareable via link, SMS, WhatsApp)
- Inspection-to-estimate conversion
- Mobile-first UX (technicians use tablets/phones under the car)

**Effort:** Large (6-8 weeks)
**Revenue impact:** HIGH -- shops will not consider software without DVI

---

#### 2. Appointment Scheduling / Calendar
**Why:** Online booking and calendar management is expected by every shop owner. It reduces phone calls, prevents double-booking, and is the entry point for the customer journey.

**What to build:**
- Workshop calendar with bay/technician assignment
- Drag-and-drop scheduling
- Online booking widget (embeddable on shop's website)
- Automated confirmation SMS/WhatsApp/email
- Reminder notifications (24h before, 1h before)
- Google Calendar sync
- Time-slot management with service duration estimates

**Effort:** Medium-Large (4-6 weeks)
**Revenue impact:** HIGH -- table stakes for any modern shop

---

#### 3. Accounting Integration (QuickBooks Online + Xero)
**Why:** Every shop uses accounting software. Manual double-entry of invoices is a dealbreaker. QuickBooks dominates the US; Xero is strong in UK/AU/NZ.

**What to build:**
- QuickBooks Online OAuth2 integration
- Auto-sync invoices, payments, customer records
- Chart of accounts mapping
- Xero OAuth2 integration
- Tax code mapping (VAT for UK/EU, sales tax for US)

**Effort:** Medium (3-4 weeks per integration)
**Revenue impact:** HIGH -- shops will churn without this

---

### PRIORITY 2: HIGH (Significant competitive disadvantage without these)

#### 4. Parts Catalog Integration / Online Parts Ordering
**Why:** Integrated parts lookup and ordering saves service writers 15-30 minutes per repair order. PartsTech alone connects to 30,000+ supplier locations and 6M+ parts. In the UK, Autocat/TecDoc serves this role.

**What to build:**
- PartsTech API integration (US market -- punchout or full API)
- TecDoc/Autocat integration (UK/EU market)
- VIN-based parts lookup
- Multi-supplier price comparison
- One-click order from repair order
- Parts margin/markup management

**Effort:** Medium-Large (4-6 weeks)
**Revenue impact:** HIGH for US market, MEDIUM for initial launch

---

#### 5. Customer Portal / Self-Service
**Why:** Customers expect to view their vehicle's status, approve estimates, view inspection reports, and pay online -- all without calling the shop.

**What to build:**
- Unique customer-facing URL per order/vehicle
- Real-time status tracking
- DVI report viewing
- Estimate approval (approve/decline individual line items)
- Online payment (credit card, ACH)
- Service history view
- No login required (magic link or token-based access)

**Effort:** Medium (3-5 weeks)
**Revenue impact:** MEDIUM-HIGH -- differentiator for modern shops

---

#### 6. In-App Payment Processing
**Why:** Collecting payment within the software (not just billing for the SaaS) eliminates reconciliation headaches. Competitors offer credit card, ACH, and even Buy Now Pay Later.

**What to build:**
- Stripe Connect for marketplace payments (shop gets paid, GarageOS takes fee)
- Credit card payments on invoices
- Card-on-file for repeat customers
- Payment link via SMS/WhatsApp
- Partial payments / deposits
- Payment history and reconciliation
- Buy Now Pay Later partnership (Affirm, Klarna, PaymentAssist UK)

**Effort:** Medium (3-4 weeks)
**Revenue impact:** MEDIUM-HIGH -- also creates a revenue stream for GarageOS (payment processing fees)

---

#### 7. Two-Way Customer Communication Hub
**Why:** GarageOS currently sends one-way notifications. Competitors offer full two-way texting where customers can reply, ask questions, and approve work -- all tracked in the order timeline.

**What to build:**
- Two-way SMS conversation (threaded per customer/order)
- Two-way WhatsApp conversation (using WhatsApp Business API)
- Email communication with templates
- Communication timeline on order detail
- Canned responses / templates
- Automated follow-ups (post-service review request, next service reminder)

**Effort:** Medium (3-4 weeks)
**Revenue impact:** MEDIUM -- improves retention and customer satisfaction

---

### PRIORITY 3: IMPORTANT (Needed for growth, but not immediate blockers)

#### 8. Advanced Reporting & Analytics
**Why:** Current reports are basic (monthly revenue, order count, top customers). Competitors offer 100-180+ report types with trend analysis, technician productivity, parts margins, customer retention, and more.

**What to build:**
- Revenue trends (daily/weekly/monthly/yearly with charts)
- Technician productivity (hours billed vs. hours clocked)
- Parts margin analysis
- Customer retention / repeat visit rate
- Average Repair Order (ARO) tracking
- Service type breakdown
- Export to CSV/PDF
- Scheduled report delivery via email
- Custom date range filtering

**Effort:** Medium (3-4 weeks)
**Revenue impact:** MEDIUM -- important for shop owners making business decisions

---

#### 9. Technician Time Tracking / Labor Clock
**Why:** Tracking technician hours per job is essential for productivity analysis, payroll, and accurate labor billing. Every major competitor includes this.

**What to build:**
- Clock in/out per work order
- Timer per service line item
- Break tracking
- Productivity dashboard (billed hours vs. clock hours = efficiency %)
- Payroll export
- Mobile-friendly (technicians clock in from phone/tablet)

**Effort:** Small-Medium (2-3 weeks)
**Revenue impact:** MEDIUM -- especially important for shops with 3+ technicians

---

#### 10. Multi-Location Management
**Why:** Growing shops expand to 2-5+ locations. They need unified reporting, shared customer databases, and cross-location inventory visibility. GarageOS has multi-tenant but not multi-location per owner.

**What to build:**
- Single owner account managing multiple garage locations
- Consolidated reporting across locations
- Customer record sharing across locations
- Inventory transfer between locations
- Per-location settings (tax rate, hours, staff)
- Location switcher in UI

**Effort:** Medium (3-4 weeks -- schema already supports garage_id per tenant)
**Revenue impact:** MEDIUM -- unlocks the "Business" tier pricing

---

## 4. LOCALIZATION REQUIREMENTS FOR INTERNATIONAL LAUNCH

### 4.1 Language & UI Direction

| Requirement | Current State | Needed | Effort |
|-------------|--------------|--------|--------|
| Primary language | Hebrew only | English as primary, Hebrew as option | Large |
| Text direction | RTL hardcoded | RTL/LTR dynamic switching via `dir` attribute | Medium |
| Font | Heebo (Hebrew-optimized) | Inter/Geist for Latin, Heebo for Hebrew | Small |
| Date format | Hebrew locale | Locale-aware (US: MM/DD, EU: DD/MM, IL: DD.MM) | Small |
| Number format | Hebrew locale | Locale-aware (US: 1,000.00, EU: 1.000,00) | Small |

**Implementation approach:**
- Adopt `next-intl` or `react-i18next` for internationalization
- Extract all hardcoded Hebrew strings into translation files (JSON)
- Support `en`, `he` locales initially, with framework for adding more
- Dynamic `dir="rtl"` / `dir="ltr"` based on locale
- Use `Intl.NumberFormat` and `Intl.DateTimeFormat` for locale-aware formatting

### 4.2 Currency

| Market | Currency | Symbol | Tax System |
|--------|----------|--------|------------|
| Israel | ILS | ILS | 17% VAT (Ma'am) |
| US | USD | $ | Sales tax (varies by state, 0-10.25%) |
| UK | GBP | GBP | 20% VAT |
| EU (generic) | EUR | EUR | VAT (varies, 17-27%) |
| Canada | CAD | C$ | GST + PST / HST |
| Australia | AUD | A$ | 10% GST |

**Implementation:**
- Currency already stored in `garages.settings.currency` (good)
- Need `Intl.NumberFormat` with locale + currency for proper formatting
- Tax system needs to support both VAT (percentage on total) and US sales tax (percentage varies by jurisdiction, may not apply to labor)
- Multi-tax support for Canadian HST/GST/PST

### 4.3 Phone Number Formats

| Market | Format | Example |
|--------|--------|---------|
| Israel | +972-XX-XXX-XXXX | +972-50-428-4168 |
| US/Canada | +1-XXX-XXX-XXXX | +1-555-123-4567 |
| UK | +44-XXXX-XXXXXX | +44-7700-900123 |
| EU | +XX-XXX-XXXXXXX | Varies by country |

**Implementation:**
- Store all phone numbers in E.164 format (+XXXXXXXXXXX)
- Use `libphonenumber` for parsing, validation, and display formatting
- WhatsApp API already expects E.164
- Current hardcoded `972` prefix in WhatsApp URL (order detail page) must be made dynamic

### 4.4 Parts Catalog by Market

| Market | Primary Catalogs | API/Integration |
|--------|-----------------|-----------------|
| US | PartsTech, Nexpart, WorldPac, MOTOR, ALLDATA | PartsTech API (covers 30K+ stores) |
| UK | Autocat (MAM), GSF, Euro Car Parts, TecDoc | TecDoc API, Autocat API |
| EU | TecDoc, regional suppliers | TecDoc API |
| Australia | Repco, Supercheap Auto, Burson | Regional APIs |
| Israel | Local suppliers (no standard API) | Manual / custom |

### 4.5 Vehicle Data by Market

| Market | License Plate Lookup | VIN Decode |
|--------|---------------------|------------|
| Israel | Misrad HaRishui API | NHTSA vPIC |
| US | No standard plate lookup | NHTSA vPIC (free), CARFAX (paid) |
| UK | DVLA MOT history API (free) | HPI Check |
| EU | Varies by country | OpenVINDecoder |

### 4.6 Legal & Compliance

| Requirement | US | UK | EU | Israel |
|-------------|----|----|----|----|
| Data protection | State laws (CCPA in CA) | UK GDPR | EU GDPR | Privacy Protection Law 5741 |
| Data residency | No strict requirement | UK servers preferred | EU/EEA required for GDPR | No strict requirement |
| Cookie consent | Varies by state | Required | Required (ePrivacy) | Recommended |
| Right to deletion | CCPA (CA only) | Required | Required | Required |
| Invoice requirements | Flexible | VAT invoice format | VAT invoice format | Tax invoice (Hashbonit Mas) |
| E-invoicing | Not required | Not required yet | Mandatory in many EU countries | Not required yet |

**Key GDPR considerations:**
- Deploy EU instance on EU-based Supabase project (eu-central-1 Frankfurt)
- Implement data export (right to portability)
- Implement data deletion (right to erasure)
- Cookie consent banner
- Privacy policy and DPA (Data Processing Agreement)
- Data breach notification procedures

---

## 5. RECOMMENDED ROADMAP FOR INTERNATIONAL LAUNCH

### Phase 1: Foundation (Weeks 1-6) -- "Make It Sellable"

| Week | Deliverable | Why |
|------|------------|-----|
| 1-2 | **i18n Framework + English Translation** | Cannot sell to English-speaking markets without English UI |
| 2-3 | **RTL/LTR Dynamic Switching** | Core infrastructure for multi-language |
| 3-4 | **Currency & Tax Localization** | Every market has different currency and tax |
| 4-6 | **Appointment Scheduling / Calendar** | Table stakes; no shop will adopt without this |

### Phase 2: Competitive Parity (Weeks 7-14) -- "Match the Market"

| Week | Deliverable | Why |
|------|------------|-----|
| 7-10 | **Digital Vehicle Inspection (DVI)** | The #1 feature gap; highest impact on sales |
| 10-12 | **QuickBooks Online Integration** | Required for US market |
| 12-14 | **Customer Portal + Online Estimate Approval** | Modern shops expect customer self-service |

### Phase 3: Differentiation (Weeks 15-22) -- "Win Deals"

| Week | Deliverable | Why |
|------|------------|-----|
| 15-17 | **In-App Payment Processing** (Stripe Connect) | Revenue stream + customer convenience |
| 17-19 | **Two-Way Communication Hub** (SMS + WhatsApp) | Upgrade from one-way to conversational |
| 19-20 | **Technician Time Tracking** | Needed for shops with 3+ techs |
| 20-22 | **Advanced Reporting & Analytics** | Upgrade from basic to comprehensive |

### Phase 4: Growth (Weeks 23-30) -- "Scale"

| Week | Deliverable | Why |
|------|------------|-----|
| 23-25 | **PartsTech Integration** (US) | Major workflow improvement |
| 25-26 | **Xero Integration** (UK/AU) | Required for UK/AU market |
| 26-28 | **Multi-Location Management** | Unlocks Business tier pricing |
| 28-30 | **Native Mobile App** (React Native or Capacitor) | Dedicated tech app for DVI/time tracking |

### Milestone Targets

- **Week 6:** English-language GarageOS with scheduling -- ready for beta testers in US/UK
- **Week 14:** Feature-complete for competitive demo against Shopmonkey/Tekmetric
- **Week 22:** Full-featured product ready for paid international launch
- **Week 30:** Platform parity with market leaders + unique differentiators

---

## 6. UNIQUE SELLING PROPOSITION (USP) SUGGESTIONS

### 6.1 What Makes GarageOS Different Today

1. **WhatsApp-Native Communication** -- US competitors rely on SMS only. WhatsApp is dominant in UK, EU, Latin America, Middle East, India, and Africa. GarageOS has this built-in from day one.

2. **Modern Tech Stack** -- Next.js 16 + React 19 + Supabase is significantly more modern than competitors built on legacy stacks. This means faster development velocity, easier hiring, and better performance.

3. **Multi-Tenant Architecture from Day One** -- The Supabase RLS + garage_id isolation is clean and scalable. Many competitors bolted on multi-tenant later.

4. **Israeli Market Expertise** -- GarageOS understands RTL, Hebrew, Israeli license plates, local tax, and local workflows. This is a template for entering OTHER non-English markets that US competitors ignore.

5. **Pricing Opportunity** -- Competitors charge $199-$439/mo. GarageOS can undercut at $99-$149/mo while maintaining healthy margins thanks to lower infrastructure costs (Supabase vs. custom backends).

### 6.2 Recommended Positioning for International Markets

**Primary USP: "The Modern, Global Garage Management Platform"**

Position GarageOS as the first garage management software built for the global market from day one:

- **For US shops:** "Shopmonkey-level features at half the price, with WhatsApp built in for your Spanish-speaking customers"
- **For UK shops:** "Garage Hive alternative with better UX, WhatsApp integration, and online booking -- from GBP 79/mo"
- **For emerging markets (LATAM, MENA, SEA):** "The only garage management software with WhatsApp-first communication, multi-language support, and local currency billing"

### 6.3 Strategic Differentiators to Build

1. **WhatsApp Business API as a Core Channel** -- Not just notifications, but full two-way customer communication, estimate approvals via WhatsApp, and payment links via WhatsApp. No US competitor does this well.

2. **AI-Powered Features** (future) -- Leverage Claude/GPT for:
   - Auto-generating repair descriptions from DVI photos
   - Smart scheduling (predict repair duration from vehicle + service type)
   - Customer communication drafting
   - Parts recommendation from diagnostic codes

3. **True Multi-Language from Day One** -- Most competitors are English-only. GarageOS can support Hebrew, English, Spanish, Portuguese, Arabic, French -- opening markets that US competitors cannot serve.

4. **Developer-Friendly API** -- Offer a public API that lets shops integrate with their existing tools, POS systems, and local parts suppliers. Very few competitors offer this outside their Enterprise tier.

5. **Transparent, Fair Pricing** -- No contracts, no hidden fees, no annual lock-in. This directly counters AutoLeap's aggressive contract practices and Mitchell 1's opaque pricing.

---

## 7. COMPETITIVE THREAT ASSESSMENT

### High Threat
- **Tekmetric** -- Best product, strong brand, well-funded. Difficult to beat head-on in the US.
- **Shopmonkey** -- Best UX, fast iteration, dedicated mobile apps. Direct competitor for modern shops.

### Medium Threat
- **Shop-Ware** -- Strong in multi-location, but higher price and more complex onboarding.
- **Garage Hive** -- Strong in UK but built on Microsoft Dynamics (heavy, expensive infrastructure).
- **AutoLeap** -- Aggressive sales but poor reputation for contracts. Vulnerable to better alternatives.

### Low Threat
- **Mitchell 1** -- Legacy player, slow to innovate. Losing market share to cloud-native tools.
- **AutoFluent** -- Dated UX, focused on tire dealers. Not a direct threat.
- **MAM Autowork Online** -- UK-only, mature but not innovating fast.

### The Real Opportunity
The largest untapped market segments are:
1. **UK independent garages** dissatisfied with Garage Hive's complexity and MAM's dated UX
2. **Spanish-speaking US shops** (15% of US auto repair market) with no Spanish-language options
3. **Latin America, Middle East, Southeast Asia** -- no credible SaaS options exist
4. **Small shops (1-3 techs)** priced out of Tekmetric/Shop-Ware's $200+/mo plans

---

## 8. EXECUTIVE SUMMARY

### Current GarageOS Strengths
- Solid work order and CRM foundation
- WhatsApp integration (rare among competitors)
- Modern tech stack (Next.js 16, Supabase, React 19)
- Multi-tenant architecture
- RTL/Hebrew expertise (template for localization)
- Attractive pricing potential

### Critical Gaps (Must Fix Before International Launch)
1. No Digital Vehicle Inspection (DVI)
2. No appointment scheduling
3. No accounting integration (QuickBooks/Xero)
4. No customer portal
5. No parts catalog integration
6. English UI does not exist yet
7. No in-app payment processing
8. No two-way customer communication
9. No technician time tracking
10. Reporting is too basic

### Recommended Strategy
1. **Spend 6 weeks on localization + scheduling** to become sellable internationally
2. **Spend 8 weeks on DVI + QuickBooks + customer portal** to reach competitive parity
3. **Spend 8 weeks on payments + communication + reporting** to differentiate
4. **Launch internationally at $99-$149/mo** undercutting Tekmetric ($199+) and Shopmonkey ($179+)
5. **Lead with WhatsApp-first communication** as primary differentiator in UK/EU/global markets
6. **Target UK market first** (English-speaking, WhatsApp-heavy, fragmented competition)

### Expected Timeline to International Launch
- **Beta-ready:** 6 weeks (English UI + scheduling)
- **Competitive launch:** 14 weeks (DVI + QuickBooks + customer portal)
- **Full platform:** 30 weeks (all 10 features + native mobile app)
