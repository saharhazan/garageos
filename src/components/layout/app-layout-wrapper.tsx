import { getAuthProfile } from '@/lib/auth'
import { AppLayout } from './app-layout'
import { CommandPalette } from '@/components/command-palette'
import { AuthProvider } from '@/hooks/use-auth-context'

export async function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  let userName = 'יוסי כהן'
  let userRole = 'מנהל מוסך'

  const profile = await getAuthProfile()
  if (profile) {
    userName = profile.fullName ?? userName
    userRole = profile.role ?? userRole
  }

  return (
    <>
      <AuthProvider>
        <AppLayout userName={userName} userRole={userRole}>
          {children}
        </AppLayout>
        <CommandPalette />
      </AuthProvider>
    </>
  )
}
