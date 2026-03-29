import { createClient } from '@/lib/supabase/server'
import { AppLayout } from './app-layout'
import { CommandPalette } from '@/components/command-palette'

export async function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userName = 'משתמש'
  let userRole = 'מנהל'

  if (user) {
    const { data: profile } = await supabase
      .from('garage_users')
      .select('full_name, role')
      .eq('id', user.id)
      .single()

    if (profile) {
      userName = profile.full_name ?? userName
      userRole = profile.role ?? userRole
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
