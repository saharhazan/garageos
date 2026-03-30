import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppLayoutWrapper } from '@/components/layout/app-layout-wrapper'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const isDemo = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')
  if (!isDemo) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')
  }

  return <AppLayoutWrapper>{children}</AppLayoutWrapper>
}
