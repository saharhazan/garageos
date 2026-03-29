'use client'

import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { User as AuthUser } from '@supabase/supabase-js'
import type { User, Garage } from '@/types'

const supabase = createClient()

async function fetchProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) return null
  return data as User
}

async function fetchGarage(garageId: string): Promise<Garage | null> {
  const { data, error } = await supabase
    .from('garages')
    .select('*')
    .eq('id', garageId)
    .single()
  if (error) return null
  return data as Garage
}

export function useAuth() {
  const queryClient = useQueryClient()

  const {
    data: authData,
    isLoading: authLoading,
  } = useQuery<AuthUser | null>({
    queryKey: ['auth-user'],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser()
      return data.user ?? null
    },
    staleTime: 1000 * 60 * 5,
  })

  const {
    data: profile,
    isLoading: profileLoading,
  } = useQuery<User | null>({
    queryKey: ['auth-profile', authData?.id],
    queryFn: () => fetchProfile(authData!.id),
    enabled: !!authData?.id,
    staleTime: 1000 * 60 * 5,
  })

  const {
    data: garage,
    isLoading: garageLoading,
  } = useQuery<Garage | null>({
    queryKey: ['auth-garage', profile?.garage_id],
    queryFn: () => fetchGarage(profile!.garage_id),
    enabled: !!profile?.garage_id,
    staleTime: 1000 * 60 * 10,
  })

  const signIn = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth-user'] })
    },
  })

  const signOut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.clear()
    },
  })

  return {
    user: authData ?? null,
    profile: profile ?? null,
    garage: garage ?? null,
    isLoading: authLoading || profileLoading || garageLoading,
    signIn: (email: string, password: string) =>
      signIn.mutateAsync({ email, password }),
    signOut: () => signOut.mutateAsync(),
  }
}
