# GarageOS — Design Brief for Figma AI

## What This Document Is

A comprehensive design specification for **GarageOS**, a garage/auto repair management SaaS built for the Israeli market. This document should be used to redesign the entire product from scratch — landing page, authentication, dashboard, and all app screens — with a distinctive, premium identity that does NOT look like a generic AI-generated dark SaaS template.

---

## The Problem With the Current Design

The current UI suffers from "AI template syndrome":

- **Generic dark mode** — zinc/gray palette (#09090b, #18181b, #27272a) is identical to every Vercel/shadcn template
- **Stock blue accent** (#3b82f6) — the most overused color in SaaS. Zero brand recognition
- **Flat, lifeless layout** — cards-in-grid, no rhythm, no visual tension, no storytelling
- **No brand personality** — could be any SaaS for any industry. Nothing says "garage" or "automotive"
- **Boring typography** — single font (Heebo), no type scale contrast, no editorial feel
- **Icon-driven features section** — the #1 AI design cliche. 6 cards with lucide icons in a 3x2 grid
- **Fake dashboard preview** — placeholder stats in a browser chrome mockup. Nobody is fooled by this
- **No imagery** — zero photography, illustrations, or visual storytelling
- **No motion/depth** — everything is flat. No shadows, no layering, no dimensionality
- **Cookie-cutter pricing** — 3-column cards with checkmarks. Seen on literally every SaaS

---

## Brand Identity

### Brand Essence
GarageOS is the operating system for modern garages. It should feel like a **professional tool that a mechanic would trust** — not a Silicon Valley dashboard that a designer would admire. Think: **Snap-on tools catalog meets Monday.com** — industrial confidence with digital sophistication.

### Brand Personality
- **Confident** — not flashy, not minimal. Assertive and direct
- **Warm** — approachable, human, not cold/corporate
- **Industrial** — grounded in the physical world of wrenches, lifts, and grease
- **Israeli** — not American SaaS translated to Hebrew. Actually Israeli in tone, layout thinking, and cultural references
- **Trustworthy** — this handles people's businesses. It should feel reliable, not trendy

### Brand Name Treatment
- "GarageOS" — always written as one word, capital G and OS
- Hebrew: "מערכת GarageOS" or just "GarageOS"
- The logo should incorporate something automotive (wrench, gear, piston, lift) — NOT a generic letter in a colored square
- Logo should work at 24px (sidebar) and 48px (landing page)

---

## Color System

### DO NOT USE
- Tailwind blue (#3b82f6) — overused, generic
- Pure black backgrounds (#000, #09090b) — too "hacker terminal"
- The zinc gray scale exclusively — looks like every AI template

### Direction
Design a palette that feels **automotive/industrial** with warmth:

**Primary palette options** (pick ONE direction):

1. **Deep Teal + Warm Orange** — think petroleum blue meets caution tape
   - Primary: deep teal (#0d5c63 range)
   - Accent: warm amber/orange (#e8720c range)
   - Background: very dark warm gray (not pure black — add a hint of brown/green warmth)

2. **Charcoal + Safety Yellow** — think garage floor markings
   - Primary: rich charcoal (#2d2d2d range with warm undertone)
   - Accent: industrial yellow (#f5c518 range)
   - Background: dark warm gray with subtle texture feel

3. **Midnight Navy + Copper** — think premium tools
   - Primary: deep navy (#1a2332 range)
   - Accent: copper/bronze (#c47d3e range)
   - Background: very dark blue-gray

**Surface system:**
- Don't just darken the background for cards. Use subtle elevation via:
  - Very slight border + tiny shadow (depth, not flatness)
  - OR slight background tint shift (cooler/warmer, not just lighter)
  - Cards should feel like they're floating slightly, not painted on

**Status colors:**
- Keep semantic colors functional but adjust to match palette warmth:
  - Success: not generic green. Try a muted teal-green
  - Warning: amber (integrate with brand if using orange/yellow direction)
  - Error: warm red, not neon red
  - Info: steel blue

---

## Typography

### Hebrew Font
- **Primary: Heebo** (already loaded) — but use it with INTENTION:
  - Headlines: Heebo 700/800, large size, tight tracking (-0.02em)
  - Body: Heebo 400, generous line height (1.6+)
  - Labels/Captions: Heebo 500, slightly spaced

### Type Scale (design a real one)
The current design uses random sizes. Define a deliberate scale:

```
Display:    40px / 48px line  — Landing hero only
H1:         32px / 40px line  — Page titles
H2:         24px / 32px line  — Section headings
H3:         18px / 26px line  — Card titles, feature names
Body:       15px / 24px line  — Primary text
Body-sm:    13px / 20px line  — Secondary text, descriptions
Caption:    11px / 16px line  — Labels, timestamps, badges
Mono:       13px / 20px line  — Job numbers, license plates, prices
```

### Typography Rules
- Headlines should have **presence**. Not just bigger text — different weight, tighter spacing, maybe a subtle color accent on a keyword
- Numbers (prices, stats, KPIs) should use **tabular figures** and feel bold/prominent
- License plates and job numbers should feel monospaced and "stamped" — like they're printed on a form
- Don't center-align body text. Hebrew reads RTL — left-align or justify

---

## Landing Page Design

### Overall Approach
STOP thinking "SaaS landing page." Think **product magazine ad** or **automotive brand site**. The landing page should sell the feeling of having your garage under control.

### Hero Section
**Kill the fake dashboard screenshot.** Instead:

- **Option A: Split layout** — Left side: big bold headline + CTA. Right side: actual high-quality photograph of a clean, organized modern Israeli garage (not American — Israeli street visible through the door, Hebrew signage)
- **Option B: Video background** — Short looping video of a garage in action (subtle, desaturated). Text overlaid with a semi-transparent dark gradient
- **Option C: Illustrated dashboard** — If showing the product, show a REAL annotated screenshot at an angle with callout labels, not a fake flat mockup. Add depth with shadows and slight perspective

**Headline treatment:**
- Current: "מערכת ניהול המוסך החכמה" — generic
- Better: something with personality. Examples:
  - "המוסך שלך. סוף סוף בסדר." (Your garage. Finally in order.)
  - "כל עבודה במקום. כל לקוח מרוצה." (Every job in place. Every customer happy.)
  - "ניהול מוסך בלי כאב ראש." (Garage management without the headache.)
- The headline should be LARGE (48-56px), bold, and the most prominent element on the page

**Sub-headline:**
- One sentence, warm, practical. Not a list of features
- "תנהלו הזמנות, לקוחות ומלאי — הכל מהנייד, הכל בעברית."

**CTA:**
- ONE primary button. Not two buttons fighting for attention
- "התחל בחינם" — primary, large, with personality (maybe rounded, with a subtle icon)
- "כניסה" — text link or ghost button, smaller

### How It Works Section (REPLACE Features Grid)
Instead of 6 icon cards, show a **3-step workflow**:

```
שלב 1: קבלת רכב          שלב 2: ניהול העבודה          שלב 3: מסירה ותשלום
הזן לוחית → פרטים נמשכים   עדכן סטטוס, הוסף חלקים       שלח הודעה ללקוח, הפק חשבונית
[illustration/screenshot]   [illustration/screenshot]     [illustration/screenshot]
```

Each step should include a REAL product screenshot (or detailed mockup) showing that exact flow. Not an icon in a colored square.

### Social Proof Section
- "מוסכים שכבר עובדים עם GarageOS" — logos or testimonials
- Even if you have to use placeholder garages, show Hebrew names, Israeli cities
- Testimonial format: photo (or avatar), name, garage name, city, one sentence quote
- Example: "מאז שעברנו ל-GarageOS חסכנו שעתיים ביום על ניירת. הלקוחות מקבלים עדכונים אוטומטיים ומפסיקים להתקשר." — יוסי כהן, מוסך המרכז, תל אביב

### Pricing Section
- Don't do 3 equal columns. Make the recommended plan **visually dominant**:
  - Pro plan: larger card, slightly elevated, colored border, "מומלץ" badge
  - Free plan: compact, understated
  - Business: compact, "לעסקים גדולים" tag
- Show prices in ILS prominently: **₪149/חודש** (shekel symbol + number + period)
- Add a toggle: "חודשי / שנתי (חסכו 20%)"
- Below pricing: "שאלות נפוצות" accordion (not a grid of Q&A cards)

### Footer
- Minimal. Logo, copyright, links to legal pages, contact email
- Don't over-design the footer. 2 columns max
- Add: "נבנה בישראל 🇮🇱" (Built in Israel) — authentic touch

---

## Navigation Design

### Desktop Sidebar
- **Width:** 220-240px, fixed left side (RTL — so it's on the right visually)
- **Background:** slightly different from page background (subtle surface color)
- **Logo:** top of sidebar, with the automotive icon mark
- **Nav items:** icon + label, 36-40px height, 8px border-radius
  - Active state: filled background (primary color at 10-15% opacity) + primary text
  - Hover: subtle background shift
  - Icons: 18px, consistent stroke weight
- **Sections:** grouped with small uppercase labels ("ניהול", "CRM", "ניתוח")
- **Quick action:** "עבודה חדשה" button near the top, prominent
- **User footer:** avatar, name, role, settings gear icon

### Mobile Bottom Navigation
- 5 items: Dashboard, Orders, [+New], Customers, Settings
- The center "+" button should be **elevated** — raised above the bar, circular, primary color, with a subtle shadow
- Active state: icon color change + small dot indicator above
- Tab bar: solid background (not transparent/blur — this is a work tool, not a social app)
- Height: 56px + safe area

### Top Bar (App Pages)
- Page title (bold, left-aligned in RTL)
- Right side: primary action button (e.g., "עבודה חדשה")
- No breadcrumbs. Keep it flat
- Subtle bottom border

---

## Dashboard Design

### Layout
- **Greeting:** personalized, with today's date in Hebrew format
- **KPI cards row:** 4 cards, horizontal scroll on mobile
  - Each card: metric name (small), value (large, bold), trend indicator (up/down arrow + percentage)
  - DIFFERENTIATE the cards. Don't make them all identical gray boxes:
    - "Open orders" could have a warm accent border
    - "Revenue" could have the amount in accent color
    - "Ready for pickup" could pulse subtly or have a notification dot
- **Recent orders list:** the main content area
  - Table on desktop, card list on mobile
  - Status badges should be **distinctive** — not just colored text:
    - "received" — outline badge, neutral
    - "in_progress" — filled badge, pulsing dot
    - "ready" — filled badge, success color, prominent
    - "delivered" — muted, completed feel
    - "cancelled" — strikethrough style
- **Quick actions:** floating or sticky bar with "עבודה חדשה" and "קבלת לקוח"

### KPI Card Design (IMPORTANT)
Current cards are boring rectangles. Make them feel like **instrument panel gauges**:
- Slight inner shadow or inset border
- The number should be the hero — 28px+ bold
- Subtle background gradient (not flat solid)
- Icon should be integrated, not just dropped in a colored square
- Consider adding a sparkline or mini trend chart for revenue

---

## Order Detail Page

This is the **most important screen** in the app. Mechanics and receptionists live here.

### Layout
- **Header:** Job number (monospaced, "stamped" feel), status badge (prominent), customer name
- **Status timeline:** horizontal progress bar showing: קבלה → בטיפול → מוכן → נמסר
  - Completed steps: filled with primary color
  - Current step: pulsing/highlighted
  - Future steps: muted
- **Two-column layout on desktop:**
  - Left (wider): items/services list, notes, images
  - Right (narrower): customer info card, vehicle info card, cost summary
- **Items list:** each item row should feel like a **line item on a receipt**
  - Description | Qty | Price | Total
  - Subtle alternating row background
  - Total row: bold, separated, prominent
- **Action bar (bottom, sticky):**
  - "עדכן סטטוס" (primary action) — progress to next status
  - "שלח הודעה ללקוח" — secondary
  - "הדפס / PDF" — tertiary

### License Plate Display
License plates should look like **actual Israeli license plates**:
- Yellow background (#F5D015), black text, monospaced
- Rounded rectangle, slight border
- 16-18px font size
- This is a key identifier — make it scannable

---

## Forms Design

### Input Fields
- **Height:** 44px (touch-friendly)
- **Border radius:** 8px
- **Border:** 1px solid, subtle. NOT invisible until focus
- **Focus state:** primary color border + subtle glow/shadow (not just color change)
- **Label:** above the field, 13px, medium weight, primary text color
- **Placeholder:** lighter color, italic or regular weight
- **Error state:** red border + red text below + subtle red background tint
- **LTR inputs** (email, phone, license plate): explicitly `dir="ltr"`, left-aligned text

### Buttons
- **Primary:** solid filled, primary color, white text, 44px height, 8px radius
  - Hover: slightly darker
  - Active: scale down slightly (0.98)
  - Loading: spinner replaces text
- **Secondary/Default:** outlined or subtle filled, not competing with primary
- **Ghost:** text only, used for cancel/back actions
- **Destructive:** red tint, used for delete/cancel operations

### Form Sections
- Group related fields with a subtle header ("פרטי רכב", "פרטי לקוח")
- Section headers: small text, uppercase-style (Hebrew doesn't have uppercase, so use weight + size + color to differentiate)
- Spacing: 24px between sections, 16px between fields within a section

---

## Component Library

### Cards
- **Border radius:** 12px (app cards), 16px (landing page cards)
- **Border:** 1px solid, surface border color
- **Shadow:** subtle, warm (not pure black shadow — add color tint)
- **Padding:** 20px (default), 24px (large), 16px (compact)
- **Hover:** border color shifts subtly, slight translateY(-1px)

### Badges / Status Indicators
- **Rounded pill shape** (not square badges)
- **Small dot + text** format: ● בטיפול
- Each status gets a unique color pair (background + text):
  - received: gray
  - in_progress: primary color (animated dot)
  - ready: success/green (strong)
  - delivered: muted success
  - cancelled: muted red, strikethrough optional

### Tables
- **Header:** slightly different background, sticky on scroll
- **Rows:** generous height (48px), subtle hover
- **Cell alignment:** text right-aligned (RTL), numbers left-aligned
- **Borders:** horizontal only (no vertical grid lines)
- **Mobile:** tables transform into card lists (NOT horizontally scrollable tables)

### Modals / Dialogs
- **Backdrop:** dark overlay with blur
- **Container:** centered, rounded (16px), max-width 480px
- **Animation:** slide up + fade in (not just fade)
- **Close:** X button top-left (RTL) + click outside

### Toast Notifications
- **Position:** bottom-right (RTL: bottom-left)
- **Style:** solid background matching type (success/error/info)
- **Animation:** slide in from bottom
- **Auto-dismiss:** 4 seconds with progress bar

---

## Mobile-Specific Design

### Principles
- This is a **work tool used in a garage**. Fingers might be dirty. Targets must be large (44px minimum)
- High contrast — garages can be bright (sunlight) or dim (under a lift)
- One-hand usable — key actions reachable with thumb
- Offline-aware — show connection status subtly

### Mobile Layout
- **Full-width cards** — no side margins less than 16px
- **Bottom-sheet patterns** — for filters, quick actions
- **Pull-to-refresh** — for order lists
- **Swipe actions** — swipe left on order card to change status quickly
- **FAB (Floating Action Button)** — "+" for new order, always accessible

---

## Authentication Pages

### Login Page
- **Center-aligned layout** with logo above
- **Simple:** email + password fields, login button, "forgot password" link
- **SMS option:** "כניסה עם SMS" as secondary option
- **Background:** subtle pattern or gradient. Not flat solid
- **Don't make it look like a bank login** — add warmth. Maybe a small illustration or the garage photo in the background (blurred/dimmed)

### Signup Page
- **Keep it short:** name, email, password. Phone optional
- **After signup → onboarding wizard** (garage creation)
- Link to login: "כבר יש לך חשבון? כניסה"

### Onboarding Wizard
- **3 steps with progress indicator**
- Step 1: Garage details (name, address, phone)
- Step 2: Plan selection (visual cards, not a radio list)
- Step 3: Success + "Go to dashboard"
- Each step should feel rewarding — not like a bureaucratic form

---

## Responsive Breakpoints

```
Mobile:     0 - 639px      (single column, bottom nav, full-width cards)
Tablet:     640 - 1023px   (sidebar collapses to icons, 2-column grids)
Desktop:    1024px+         (full sidebar, 3-4 column grids, tables)
```

---

## Spacing System

Use an 4px base grid:
```
4px   — micro spacing (between icon and label)
8px   — tight spacing (between related elements)
12px  — default component padding
16px  — between components
20px  — section padding (mobile)
24px  — section padding (desktop)
32px  — between page sections
48px  — large section gaps
64px  — landing page section gaps
```

---

## Animation & Motion

- **Page transitions:** fade (150ms). No sliding pages
- **Card hover:** border color + slight lift (translateY -1px, 200ms ease)
- **Button press:** scale 0.98 (100ms)
- **Loading spinners:** custom, not generic. A rotating wrench? A gear?
- **Status change:** smooth color transition + checkmark animation
- **Skeleton loading:** gentle pulse animation on gray rectangles
- **Toast enter:** slide up + fade in (300ms spring)

---

## Iconography

- **Style:** outline icons, 1.5px stroke, rounded caps
- **Size:** 18px (navigation), 20px (page content), 24px (feature highlights)
- **Source:** Lucide React (already in project) — but choose icons carefully:
  - Orders: `Wrench` (not clipboard)
  - Customers: `Users`
  - Inventory: `Package`
  - Reports: `BarChart3`
  - Settings: `Settings`
  - Notifications: `Bell`
  - New order: `Plus`
  - Dashboard: `LayoutDashboard`

---

## Dark Mode Only (For Now)

The app is dark-mode only. But "dark mode" doesn't mean "black background with gray cards."

**Good dark mode feels warm and layered:**
- Background: NOT pure black. Add a subtle warm or cool tint
- Surfaces: clearly distinct from background, with elevation
- Text: NOT pure white (#fafafa is fine, but ensure adequate contrast)
- Borders: subtle but visible. They create structure
- Shadows: yes, dark themes CAN have shadows. Use them for elevation (lighter on top, darker below)

---

## Design Deliverables Expected

### Figma Pages to Create:

1. **Design System**
   - Color palette with all semantic colors
   - Typography scale with examples
   - Component library (buttons, inputs, cards, badges, tables, nav items)
   - Icon set with sizing
   - Spacing tokens

2. **Landing Page**
   - Desktop (1440px)
   - Mobile (390px)
   - All sections: hero, how it works, social proof, pricing, FAQ, CTA, footer

3. **Authentication**
   - Login (desktop + mobile)
   - Signup (desktop + mobile)
   - Onboarding wizard — all 3 steps (desktop + mobile)

4. **App — Dashboard**
   - Desktop with sidebar
   - Mobile with bottom nav

5. **App — Orders**
   - Order list (desktop + mobile)
   - New order form (desktop + mobile)
   - Order detail (desktop + mobile)

6. **App — Customers**
   - Customer list
   - Customer detail (with vehicle history)

7. **App — Inventory**
   - Inventory list with low-stock alerts

8. **App — Quotes**
   - Quote list
   - New quote form

9. **App — Settings**
   - All sub-pages: profile, garage, notifications, security, billing

10. **App — Reports**
    - Monthly analytics view

---

## Summary: What "Not AI-Generated" Means

| AI-Generated Feel | Human-Designed Feel |
|---|---|
| Generic blue accent | Distinctive brand color tied to automotive |
| Pure black background | Warm dark with subtle tint |
| Cards in grids | Intentional layout hierarchy |
| Lucide icons in colored squares | Integrated, contextual iconography |
| "Feature 1, Feature 2, Feature 3" | Storytelling: "Here's how it works" |
| Fake dashboard screenshot | Real product screenshots at angles with depth |
| Same card component everywhere | Varied components for different contexts |
| No imagery | Photography + illustrations |
| Flat everything | Layers, shadows, depth |
| Predictable layout | Visual tension, asymmetry, editorial moments |
| "SaaS Landing Page Template" | "This brand knows who they are" |
