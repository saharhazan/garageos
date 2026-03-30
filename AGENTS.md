<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# GarageOS — Production Readiness Tasks

## Project Overview
GarageOS is a multi-tenant SaaS for auto repair shop management (Hebrew-first, RTL).
Stack: Next.js 16 + Supabase + TailwindCSS 4 + React Query + PWA.

---

## INFRA Tasks

### INFRA-1: Supabase Production Setup
- [ ] Create production Supabase project
- [ ] Run all migrations (`supabase/migrations/`)
- [ ] Configure RLS policies with `(select auth.uid())` optimization
- [ ] Set up Supabase Storage bucket for vehicle images and signatures
- [ ] Enable Supabase Realtime for `work_orders` table
- [ ] Configure auth email templates (Hebrew)
- [ ] Set SMTP provider for transactional emails

### INFRA-2: Vercel Deployment
- [ ] Connect GitHub repo to Vercel
- [ ] Configure environment variables (Supabase, Stripe, Twilio, Evolution API)
- [ ] Set region to match Supabase project (eu-central-1 for Israel)
- [ ] Configure custom domain
- [ ] Enable Vercel Analytics + Speed Insights

### INFRA-3: Security Hardening
- [ ] Add Content-Security-Policy headers
- [ ] Add X-Frame-Options, X-Content-Type-Options headers
- [ ] Configure rate limiting on API routes
- [ ] Ensure service role key never leaks to client
- [ ] Add error boundaries for graceful failure handling
- [ ] Validate all env vars at build time

### INFRA-4: PWA & Performance
- [ ] Configure service worker for offline job viewing
- [ ] Add PWA manifest with correct icons (192x192, 512x512)
- [ ] Enable push notifications for job status changes
- [ ] Add loading skeletons for all data-fetching pages
- [ ] Optimize images with next/image

### INFRA-5: Monitoring & Observability
- [ ] Integrate Sentry for error tracking
- [ ] Set up Vercel Analytics for Core Web Vitals
- [ ] Add health check endpoint (`/api/health`)
- [ ] Configure uptime monitoring

---

## BACKEND Tasks

### BE-1: Stripe Subscription Billing
- [ ] Install `stripe` package
- [ ] Create `/api/stripe/webhook` endpoint
- [ ] Handle `checkout.session.completed`, `customer.subscription.updated/deleted`, `invoice.payment_failed`
- [ ] Create `/api/stripe/checkout` for subscription creation
- [ ] Create `/api/stripe/portal` for customer self-service
- [ ] Add `stripe_customer_id` and `stripe_subscription_id` to garages table
- [ ] Enforce plan limits (users, orders/month) via middleware
- [ ] Pricing tiers: Free (1 user, 50 orders/mo), Pro (5 users, unlimited), Business (15 users, 3 garages)

### BE-2: User Registration & Onboarding
- [ ] Add `/api/auth/signup` endpoint
- [ ] Create garage provisioning flow (insert garage + first user as super_admin)
- [ ] Add sample data seeding for new garages
- [ ] Implement email verification flow

### BE-3: Quotes Feature
- [ ] Add `quotes` table migration (mirrors work_orders with status: draft/sent/accepted/rejected)
- [ ] Create `/api/quotes` CRUD endpoints
- [ ] Add quote-to-order conversion endpoint
- [ ] Generate quote PDF with jspdf

### BE-4: Settings API
- [ ] `PATCH /api/settings/profile` — update user name, phone, avatar
- [ ] `PATCH /api/settings/garage` — update garage name, address, phone, tax rate
- [ ] `PATCH /api/settings/notifications` — toggle SMS/WhatsApp/email per event
- [ ] `POST /api/settings/password` — change password via Supabase auth

### BE-5: PDF Invoice Generation
- [ ] Generate work order PDF with garage branding
- [ ] Include items, totals, tax breakdown, signature
- [ ] Store generated PDFs in Supabase Storage
- [ ] Send PDF via WhatsApp/email to customer

---

## FRONTEND Tasks

### FE-1: Landing Page
- [ ] Hero section with value proposition
- [ ] Feature highlights (orders, inventory, notifications, reports)
- [ ] Pricing table (Free / Pro / Business)
- [ ] CTA buttons → signup
- [ ] Mobile responsive, dark theme matching app
- [ ] Hebrew + English toggle

### FE-2: Signup & Onboarding
- [ ] Registration form (name, email, password, phone)
- [ ] Garage creation wizard (name, address, phone, logo)
- [ ] First work order tutorial/walkthrough
- [ ] Plan selection step

### FE-3: Quotes Page (Full Implementation)
- [ ] Quote list with search and status filter
- [ ] New quote form (reuse order item components)
- [ ] Quote detail view with edit capability
- [ ] Convert-to-order button
- [ ] Send quote to customer (WhatsApp/SMS/Email)

### FE-4: Settings Page (Wire Up)
- [ ] Profile edit form with avatar upload
- [ ] Garage settings form
- [ ] Notification preferences toggles
- [ ] Password change form
- [ ] Team management (invite users, assign roles)
- [ ] Billing/subscription management (Stripe portal link)

### FE-5: Polish & Production UX
- [ ] Add error boundaries to all route segments
- [ ] Add loading.tsx skeletons to all pages
- [ ] Empty state illustrations for all list views
- [ ] Toast notifications for success/error feedback
- [ ] Keyboard shortcuts (command palette)
- [ ] Print-friendly work order view
