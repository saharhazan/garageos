<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# GarageOS — Work Items

## Project Overview
GarageOS is a multi-tenant SaaS for auto repair shop management (Hebrew-first, RTL).
Stack: Next.js 16 + Supabase + TailwindCSS 4 + React Query + PWA.
Design: Iron Amber industrial premium theme.

---

## P0 — CRITICAL BUGS (App doesn't work without these)

### BUG-001: Fix `garage_users` → `users` table mismatch
**Status:** NOT STARTED
**Impact:** Dashboard, settings, order detail, select-garage all crash
**Details:** Multiple pages query `garage_users` table which does not exist. The actual table is `users`.
**Files to fix:**
- [ ] `src/app/(app)/dashboard/page.tsx` — line querying `garage_users`
- [ ] `src/app/(app)/orders/[id]/page.tsx` — technician join uses `garage_users`
- [ ] `src/app/(auth)/select-garage/page.tsx` — queries `garage_users`
- [ ] `src/app/(app)/settings/page.tsx` — profile load queries `garage_users`
**Test:** Dashboard loads without error after login

### BUG-002: Fix RLS — garage_id not in JWT
**Status:** NOT STARTED
**Impact:** ALL RLS policies silently fail, data leaks between tenants
**Details:** `auth_garage_id()` reads `auth.jwt() ->> 'garage_id'` but Supabase doesn't add custom claims automatically. Returns NULL → all policies evaluate to `garage_id = NULL` → no rows returned.
**Fix options:**
- [ ] Option A: Create a Supabase Auth Hook (Postgres function) that adds garage_id to JWT on login
- [ ] Option B: Rewrite RLS policies to join `users` table instead of reading JWT
- [ ] Option C: Bypass RLS entirely, enforce at API layer with service role
**Recommended:** Option B — most reliable, no JWT customization needed
**Migration needed:** Replace `auth_garage_id()` with a function that queries users table

### BUG-003: Remove localStorage garage_id dependency
**Status:** NOT STARTED
**Impact:** Security vulnerability — user can modify localStorage to access other garages
**Details:** `orders/new`, `settings`, `quotes/new` all use `localStorage.getItem('selected_garage_id')` to determine which garage to write data to. This is client-side and insecure.
**Fix:**
- [ ] Create a server-side utility `getAuthGarageId(supabase)` that fetches garage_id from `users` table
- [ ] Replace all localStorage reads with this utility
- [ ] For client components, use a React context that fetches garage_id once on mount
**Files to fix:**
- [ ] `src/app/(app)/orders/new/page.tsx`
- [ ] `src/app/(app)/quotes/new/page.tsx`
- [ ] `src/app/(app)/settings/page.tsx`
- [ ] `src/app/(auth)/select-garage/page.tsx`

### BUG-004: Dashboard stats query broken
**Status:** NOT STARTED
**Impact:** Dashboard shows wrong or no data
**Details:** Dashboard page manually queries `work_orders` without garage_id filter, and uses wrong table name for user profile.
**Fix:**
- [ ] Fix table name `garage_users` → `users`
- [ ] Add `.eq('garage_id', garageId)` to all work_orders queries
- [ ] Use `dashboard_stats` view instead of manual aggregation

---

## P1 — SECURITY (Must fix before any real users)

### SEC-001: Server-side garage_id validation on all API routes
**Status:** NOT STARTED
**Details:** API routes trust client-sent garage_id. Must verify user belongs to requested garage.
- [ ] Create shared utility: `getAuthProfile(supabase)` → returns `{ user_id, garage_id, role }`
- [ ] Add to ALL API routes: verify `profile.garage_id === requestedGarageId`
- [ ] Return 403 if mismatch
**Routes to fix:**
- [ ] `/api/orders/route.ts`
- [ ] `/api/orders/[id]/route.ts`
- [ ] `/api/customers/route.ts`
- [ ] `/api/customers/[id]/route.ts`
- [ ] `/api/vehicles/route.ts`
- [ ] `/api/vehicles/[id]/route.ts`
- [ ] `/api/inventory/route.ts`
- [ ] `/api/inventory/[id]/route.ts`
- [ ] `/api/quotes/route.ts`
- [ ] `/api/quotes/[id]/route.ts`
- [ ] `/api/settings/profile/route.ts`
- [ ] `/api/settings/garage/route.ts`
- [ ] `/api/notify/route.ts`
- [ ] `/api/dashboard/stats/route.ts`

### SEC-002: Remove demo mode bypass
**Status:** NOT STARTED
**Details:** Middleware and layout check for `placeholder` in URL to skip auth. Now that we have real credentials, remove this.
- [ ] `src/lib/supabase/middleware.ts` — remove `isDemo` check
- [ ] `src/app/(app)/layout.tsx` — remove `isDemo` check

### SEC-003: Rate limiting on auth endpoints
**Status:** NOT STARTED
- [ ] Add rate limiting to `/api/auth/*` endpoints
- [ ] Add rate limiting to `/api/stripe/webhook`

---

## P2 — CORE FUNCTIONALITY (Make the app actually usable)

### CORE-001: Fix order creation flow
**Status:** NOT STARTED
**Details:** New order page creates orders client-side via Supabase direct insert. Should use API route.
- [ ] Move order creation to `/api/orders` POST (already exists)
- [ ] Use server-side `next_job_number()` RPC for job numbers (not client-side count)
- [ ] Remove manual job number generation from `orders/new/page.tsx`
- [ ] Add notification trigger after order creation

### CORE-002: Create auth context provider
**Status:** NOT STARTED
**Details:** Need a shared React context for auth user + garage_id + role.
- [ ] Create `src/hooks/use-auth-context.tsx` — provider + hook
- [ ] Fetch user profile (garage_id, role, full_name) once on mount
- [ ] Expose `garageId`, `userId`, `role`, `userName` to all components
- [ ] Replace all localStorage.getItem + individual auth queries

### CORE-003: Fix onboarding → dashboard flow
**Status:** NOT STARTED
**Details:** After onboarding creates a garage, user needs garage_id in their session.
- [ ] After `/api/onboarding` success, store garage_id in context/session
- [ ] Redirect to `/dashboard` with garage context
- [ ] Handle case where user has no garages (show onboarding)

### CORE-004: Create forgot-password page
**Status:** NOT STARTED
**Details:** Login links to `/forgot-password` but page doesn't exist.
- [ ] Create `src/app/(auth)/forgot-password/page.tsx`
- [ ] Use `supabase.auth.resetPasswordForEmail()`
- [ ] Match Iron Amber auth page style

### CORE-005: Wire up order status updates
**Status:** NOT STARTED
**Details:** Order detail page has "עדכן סטטוס" button but status update flow is incomplete.
- [ ] Verify PATCH `/api/orders/[id]` handles status transitions
- [ ] Add status transition validation (can't go backwards)
- [ ] Trigger notification on status change (SMS/WhatsApp)
- [ ] Update status timeline UI to reflect changes immediately

### CORE-006: Complete customer detail page
**Status:** NOT STARTED
- [ ] Create `src/app/(app)/customers/[id]/page.tsx`
- [ ] Show customer info, vehicles, order history
- [ ] Allow editing customer details
- [ ] Link to create new order for this customer

### CORE-007: Fix reports page with real data
**Status:** NOT STARTED
**Details:** Reports page may use hardcoded or incorrect queries.
- [ ] Verify queries filter by garage_id
- [ ] Add date range picker (this month, last month, custom)
- [ ] Revenue chart (daily/weekly/monthly)
- [ ] Top customers by revenue
- [ ] Orders by status breakdown

---

## P3 — BACKEND FEATURES

### BE-001: Wire up SMS notifications (Twilio)
**Status:** NOT STARTED
- [ ] Add Twilio env vars to .env.local and Vercel
- [ ] Test `/api/sms` route with real Twilio credentials
- [ ] Trigger SMS on status change (received → in_progress → ready → delivered)
- [ ] Hebrew SMS templates

### BE-002: Wire up WhatsApp notifications (Evolution API)
**Status:** NOT STARTED
- [ ] Add Evolution API env vars
- [ ] Test `/api/whatsapp` route
- [ ] Send order status updates via WhatsApp
- [ ] Send quote PDFs via WhatsApp

### BE-003: Complete Stripe billing flow
**Status:** NOT STARTED
- [ ] Create Stripe products/prices for 3 tiers
- [ ] Add STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET env vars
- [ ] Test checkout flow end-to-end
- [ ] Test webhook handling (subscription created, cancelled, updated)
- [ ] Enforce plan limits (max users, max orders/month)

### BE-004: PDF invoice generation
**Status:** NOT STARTED
- [ ] Generate work order PDF with garage branding
- [ ] Hebrew RTL support in PDF
- [ ] Include items, totals, tax breakdown
- [ ] Store PDFs in Supabase Storage
- [ ] Download button on order detail page

### BE-005: File uploads (images, signatures)
**Status:** NOT STARTED
- [ ] Set up Supabase Storage bucket for vehicle images
- [ ] Add image upload to order creation/edit
- [ ] Add signature capture component
- [ ] Store URLs in work_orders.images[] and .signature_url

### BE-006: Audit logging
**Status:** NOT STARTED
- [ ] Create `audit_log` table (user_id, action, resource_type, resource_id, changes, timestamp)
- [ ] Log all create/update/delete operations
- [ ] Admin view for audit log

---

## P4 — FRONTEND POLISH

### FE-001: Toast notification system
**Status:** NOT STARTED
- [ ] Create toast component (success, error, info)
- [ ] Show toast after order creation, status update, settings save
- [ ] Position: bottom-left (RTL), auto-dismiss 4s

### FE-002: Empty states with illustrations
**Status:** NOT STARTED
- [ ] Orders page: "אין כרטיסי עבודה" with illustration
- [ ] Customers page: "אין לקוחות" with CTA
- [ ] Inventory page: "מלאי ריק" with add button
- [ ] Quotes page: "אין הצעות מחיר"

### FE-003: Loading skeletons for all pages
**Status:** NOT STARTED
- [ ] Dashboard: skeleton KPI cards + table
- [ ] Orders list: skeleton rows
- [ ] Order detail: skeleton layout
- [ ] Use `loading.tsx` per route segment

### FE-004: Keyboard shortcuts (command palette)
**Status:** NOT STARTED
**Details:** Command palette component exists but needs wiring.
- [ ] Cmd+K to open command palette
- [ ] Quick nav to pages
- [ ] Search orders, customers, vehicles
- [ ] Quick actions (new order, new customer)

### FE-005: Print-friendly order view
**Status:** NOT STARTED
- [ ] CSS @media print styles for order detail
- [ ] Hide navigation, show only order content
- [ ] Include garage header/logo, customer info, items, totals

### FE-006: Responsive table improvements
**Status:** NOT STARTED
- [ ] Test all tables on 375px screen
- [ ] Verify mobile card views work correctly
- [ ] Fix any overflow issues
- [ ] Swipe-to-action on mobile order cards

---

## P5 — COMPETITIVE FEATURES (International expansion)

### COMP-001: i18n framework + English translation
**Status:** NOT STARTED
- [ ] Install `next-intl` or similar
- [ ] Extract all Hebrew strings to translation files
- [ ] Create English translation
- [ ] RTL ↔ LTR dynamic switching
- [ ] Language picker in settings

### COMP-002: Appointment scheduling / calendar
**Status:** NOT STARTED
- [ ] Create `appointments` table
- [ ] Calendar view (week/day)
- [ ] Online booking page (public)
- [ ] SMS/WhatsApp reminders

### COMP-003: Digital Vehicle Inspection (DVI)
**Status:** NOT STARTED
- [ ] Multi-point inspection checklist
- [ ] Photo capture with annotations
- [ ] Red/Yellow/Green condition indicators
- [ ] Customer-facing inspection report (shareable link)
- [ ] Inspection → estimate conversion

### COMP-004: Customer portal
**Status:** NOT STARTED
- [ ] Public page for customers to view order status
- [ ] Approve/decline quotes online
- [ ] View inspection reports
- [ ] Payment link

### COMP-005: Accounting integration (QuickBooks / Xero)
**Status:** NOT STARTED
- [ ] QuickBooks Online OAuth + API
- [ ] Sync invoices to QuickBooks
- [ ] Xero integration (UK market)

### COMP-006: Two-way customer communication
**Status:** NOT STARTED
- [ ] Upgrade from one-way notifications to conversational
- [ ] WhatsApp Business API two-way messaging
- [ ] SMS two-way (Twilio)
- [ ] In-app chat thread per order

### COMP-007: Technician time tracking
**Status:** NOT STARTED
- [ ] Clock in/out per order
- [ ] Track hours per job
- [ ] Labor rate calculation
- [ ] Technician performance dashboard

### COMP-008: Multi-currency + tax localization
**Status:** NOT STARTED
- [ ] Currency selector per garage (ILS, USD, EUR, GBP)
- [ ] Tax rate per country/region
- [ ] Proper invoice formatting per locale

---

## Database Migration Queue

### MIG-004: Fix RLS policies
- Replace `auth_garage_id()` with direct `users` table join
- Add proper RLS for quotes table

### MIG-005: Add audit_log table
- user_id, action, resource_type, resource_id, changes JSONB, created_at

### MIG-006: Add appointments table
- garage_id, customer_id, vehicle_id, scheduled_at, duration, notes, status

### MIG-007: Add inspections table (DVI)
- garage_id, order_id, vehicle_id, checklist JSONB, photos[], status, created_by

---

## Environment Variables Needed

| Variable | Status | Purpose |
|----------|--------|---------|
| NEXT_PUBLIC_SUPABASE_URL | ✅ SET | Supabase project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | ✅ SET | Supabase anon key |
| SUPABASE_SERVICE_ROLE_KEY | ✅ SET | Supabase service role |
| STRIPE_SECRET_KEY | ❌ MISSING | Stripe payments |
| STRIPE_WEBHOOK_SECRET | ❌ MISSING | Stripe webhook verification |
| STRIPE_PRICE_PRO | ❌ MISSING | Pro plan price ID |
| STRIPE_PRICE_BUSINESS | ❌ MISSING | Business plan price ID |
| TWILIO_ACCOUNT_SID | ❌ MISSING | SMS notifications |
| TWILIO_AUTH_TOKEN | ❌ MISSING | SMS auth |
| TWILIO_PHONE_NUMBER | ❌ MISSING | SMS sender number |
| EVOLUTION_API_URL | ❌ MISSING | WhatsApp API |
| EVOLUTION_API_KEY | ❌ MISSING | WhatsApp auth |
| EVOLUTION_INSTANCE | ❌ MISSING | WhatsApp instance |
| NEXT_PUBLIC_APP_URL | ❌ MISSING | App URL for callbacks |
