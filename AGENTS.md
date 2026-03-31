<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# GarageOS — Sprint Work Items

## Current State
- 55 pages, 16+ API routes, 6 document templates, 6 migrations
- Iron Amber design system, Hebrew RTL
- Real Supabase (Frankfurt), Vercel production deploy
- Auth context, RLS working, server-side garage validation

---

## SPRINT: Next 15 Work Items

### WI-01: Add Vehicles to sidebar navigation
**Priority:** HIGH | **Effort:** 5 min
**Why:** Vehicles page exists at `/vehicles` but is unreachable from sidebar.
**Fix:** Add vehicles nav item to sidebar between "לקוחות" and "מלאי"
**Files:** `src/components/layout/sidebar.tsx`

### WI-02: Team member management (invite users)
**Priority:** HIGH | **Effort:** 2-3 hours
**Why:** A garage has multiple employees. Currently only the owner exists. Can't add technicians, receptionists, or managers.
**Build:**
- [ ] Settings page: "צוות" section with team member list
- [ ] Invite form: email + role selection
- [ ] `POST /api/team/invite` — creates auth user + users record
- [ ] Team list with role badges, edit role, deactivate member
- [ ] `src/app/(app)/settings/team/page.tsx`

### WI-03: Delete functionality (customers, vehicles, quotes)
**Priority:** HIGH | **Effort:** 1 hour
**Why:** Users can create but can't delete. Need delete buttons + confirmation dialogs.
**Build:**
- [ ] Delete button on customer detail page → `DELETE /api/customers/[id]`
- [ ] Delete button on vehicle (in customer detail) → `DELETE /api/vehicles/[id]`
- [ ] Delete button on quote detail → `DELETE /api/quotes/[id]`
- [ ] Delete button on order detail (manager+ only) → `DELETE /api/orders/[id]`
- [ ] Confirmation dialog: "האם למחוק? פעולה זו לא ניתנת לביטול"
- [ ] Use existing Dialog component

### WI-04: Custom 404 page
**Priority:** MEDIUM | **Effort:** 15 min
**Why:** Default Next.js 404 looks broken. Need branded page.
**Build:**
- [ ] `src/app/not-found.tsx` — Iron Amber styled, "הדף לא נמצא" message, link to dashboard
- [ ] Logo, "חזרה לדף הראשי" button

### WI-05: Documents list page (generated documents)
**Priority:** MEDIUM | **Effort:** 1 hour
**Why:** Users generate invoices/quotes but can't see a list or re-download them.
**Build:**
- [ ] `src/app/(app)/documents/page.tsx` — list all generated documents
- [ ] Filter by type (invoice, quote, work order, etc.)
- [ ] Show: doc number, type, customer, amount, date
- [ ] Click to re-open/download
- [ ] Add "מסמכים" to sidebar nav

### WI-06: Notification feedback + toast integration
**Priority:** MEDIUM | **Effort:** 30 min
**Why:** Actions like saving settings, creating orders, changing status don't show feedback.
**Build:**
- [ ] After order creation → `toast.success('כרטיס עבודה נוצר בהצלחה')`
- [ ] After status update → `toast.success('סטטוס עודכן')`
- [ ] After settings save → `toast.success('ההגדרות נשמרו')`
- [ ] After customer/vehicle creation → success toast
- [ ] After delete → `toast.info('נמחק בהצלחה')`
- [ ] On API errors → `toast.error('שגיאה: ...')`

### WI-07: Onboarding → session fix
**Priority:** MEDIUM | **Effort:** 30 min
**Why:** After onboarding creates a garage, the AuthProvider doesn't refresh. User sees empty dashboard.
**Fix:**
- [ ] After `/api/onboarding` success, call `router.refresh()` to re-run server components
- [ ] Or add a `refetch()` method to AuthProvider
- [ ] Verify the full flow: signup → onboarding → dashboard with data

### WI-08: Appointment scheduling (calendar view)
**Priority:** HIGH | **Effort:** 4-6 hours
**Why:** Every garage needs appointment booking. This is the #1 missing competitive feature.
**Build:**
- [ ] `appointments` table migration (garage_id, customer_id, vehicle_id, scheduled_at, duration_minutes, notes, status)
- [ ] `src/app/(app)/appointments/page.tsx` — calendar view (week/day)
- [ ] Create appointment form (customer, vehicle, date/time, service type)
- [ ] `/api/appointments` CRUD routes
- [ ] Color-coded by status (scheduled, confirmed, in-progress, completed, cancelled)
- [ ] Add "לוח זמנים" to sidebar nav

### WI-09: Customer-facing order status page (public)
**Priority:** HIGH | **Effort:** 2 hours
**Why:** Customers call to ask "is my car ready?" A public status page eliminates these calls.
**Build:**
- [ ] `src/app/status/[id]/page.tsx` — public page (no auth required)
- [ ] Shows: garage name, vehicle info, status timeline, estimated completion
- [ ] Shareable via WhatsApp/SMS link
- [ ] Add link to notification messages: "צפה בסטטוס: {url}"
- [ ] Add to middleware as public route

### WI-10: Dashboard real-time updates
**Priority:** MEDIUM | **Effort:** 1 hour
**Why:** Dashboard shows stale data. When another user updates an order, dashboard doesn't reflect it.
**Build:**
- [ ] Supabase Realtime subscription on `work_orders` table
- [ ] Auto-refresh KPI cards when orders change
- [ ] Visual indicator for new/updated orders ("חדש" badge)
- [ ] Or: simple polling every 30 seconds with React Query refetchInterval

### WI-11: Bulk operations on orders
**Priority:** MEDIUM | **Effort:** 1.5 hours
**Why:** Shops with 20+ open orders need to update multiple at once.
**Build:**
- [ ] Checkbox selection on orders list (desktop)
- [ ] Bulk actions bar: "עדכן סטטוס", "שלח הודעה", "ייצוא"
- [ ] `PATCH /api/orders/bulk` endpoint
- [ ] Select all / deselect all

### WI-12: Low stock alerts on dashboard
**Priority:** MEDIUM | **Effort:** 30 min
**Why:** Inventory items below min_quantity should show a warning on the dashboard.
**Build:**
- [ ] Dashboard: "התראות מלאי" card showing items where quantity <= min_quantity
- [ ] Red/amber badge with count
- [ ] Click to navigate to inventory page filtered by low stock
- [ ] Optional: notification when item drops below minimum

### WI-13: Customer search in order creation
**Priority:** HIGH | **Effort:** 1 hour
**Why:** When creating a new order, the user types customer name/phone. Should show autocomplete suggestions.
**Build:**
- [ ] Autocomplete dropdown on customer name and phone fields in `/orders/new`
- [ ] Debounced search via Supabase (by name or phone)
- [ ] Click suggestion → auto-fill all customer + vehicle fields
- [ ] Same for quotes/new page

### WI-14: Print-friendly views
**Priority:** MEDIUM | **Effort:** 45 min
**Why:** Garages still print work orders and invoices on paper.
**Build:**
- [ ] CSS `@media print` styles
- [ ] Order detail: hide nav, show only order content with garage header
- [ ] Print button on order detail page
- [ ] Invoice/quote: already has PDF, but also add direct print button

### WI-15: Plan enforcement (free tier limits)
**Priority:** HIGH | **Effort:** 2 hours
**Why:** Pricing page promises limits (2 workstations, 3 users for boutique plan) but nothing enforces them.
**Build:**
- [ ] Middleware/utility: `checkPlanLimits(garageId, action)`
- [ ] Check on: user invite (max users), order creation (max per month for free)
- [ ] Show upgrade prompt when limit reached: "שדרגו לתוכנית מקצועי כדי להוסיף עוד משתמשים"
- [ ] `/api/stripe/checkout` integration for upgrade flow
- [ ] Add plan badge to sidebar footer

---

## Priorities Summary

| Priority | Items | Total Effort |
|----------|-------|-------------|
| **HIGH** | WI-01, 02, 03, 08, 09, 13, 15 | ~13 hours |
| **MEDIUM** | WI-04, 05, 06, 07, 10, 11, 12, 14 | ~6 hours |

**Recommended order:** WI-01 → WI-03 → WI-04 → WI-06 → WI-13 → WI-02 → WI-09 → WI-08 → WI-15
