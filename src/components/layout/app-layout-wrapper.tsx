import { createClient } from '@/lib/supabase/server'
import { AppLayout } from './app-layout'
import { CommandPalette } from '@/components/command-palette'

export async function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  let userName = 'יוסי כהן'
  let userRole = 'מנהל מוסך'

  const isDemo = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')
  if (!isDemo) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('full_name, role')
        .eq('id', user.id)
        .single()
      if (profile) {
        userName = profile.full_name ?? userName
        userRole = profile.role ?? userRole
      }
    }
  }

  return (
    <>
      <AppLayout userName={userName} userRole={userRole}>
        {children}
      </AppLayout>
      <CommandPalette />
    </>
  )
}
