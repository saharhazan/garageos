'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AuthContextType {
  userId: string | null
  garageId: string | null
  fullName: string | null
  role: string | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  userId: null, garageId: null, fullName: null, role: null, loading: true
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthContextType>({
    userId: null, garageId: null, fullName: null, role: null, loading: true
  })

  useEffect(() => {
    async function loadProfile() {
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
    }
    loadProfile()
  }, [])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
