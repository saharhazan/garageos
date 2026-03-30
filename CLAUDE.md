@AGENTS.md

# GarageOS

Multi-tenant SaaS for auto repair shop management. Hebrew-first, RTL.

## Stack
- Next.js 16 (App Router), React 19, TypeScript 5
- Supabase (Auth, PostgreSQL, RLS, Storage)
- TailwindCSS 4, class-variance-authority
- TanStack React Query v5
- Stripe (billing), Twilio (SMS), Evolution API (WhatsApp)
- PWA with next-pwa

## Commands
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — eslint

## Key Patterns
- API routes at `src/app/api/` use Supabase server client
- Client components use `createClient` from `@/lib/supabase/client`
- Server components use `createClient` from `@/lib/supabase/server`
- React Query hooks in `src/hooks/`
- UI components in `src/components/ui/` (Button, Input, Card, Table, etc.)
- All text in Hebrew, RTL direction
- Dark theme: bg #09090b, surface #18181b, border #27272a
- Font: Heebo (Hebrew + Latin)
