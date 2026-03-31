'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AuthContextType {
  userId: string | null
  garageId: string | null
  fullName: string | null
  role: string | null
  loading: boolean
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  userId: null, garageId: null, fullName: null, role: null, loading: true, refresh: async () => {}
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Omit<AuthContextType, 'refresh'>>({
    userId: null, garageId: null, fullName: null, role: null, loading: true
  })

  const loadProfile = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setState(s => ({ ...s, loading: false }))
      return
    }

    const { data: profile } = await supabase
      .from('users')
      .select('garage_id, full_name, role')
      .eq('id', user.id)
      .single()

    setState({
      userId: user.id,
      garageId: profile?.garage_id ?? null,
      fullName: profile?.full_name ?? null,
      role: profile?.role ?? null,
      loading: false,
    })
  }, [])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  return (
    <AuthContext.Provider value={{ ...state, refresh: loadProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
