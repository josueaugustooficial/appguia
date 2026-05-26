'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  // ✅ useMemo: instância criada UMA vez por montagem — evita loop de re-render
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      setProfile(data)
    } catch {
      setProfile(null)
    }
  }, [supabase])

  useEffect(() => {
    let mounted = true

    const safetyTimer = setTimeout(() => {
      if (mounted) setLoading(false)
    }, 8000)

    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!mounted) return
        if (session?.user) {
          setUser(session.user)
          await fetchProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
        }
      } catch {
        if (mounted) {
          setUser(null)
          setProfile(null)
        }
      } finally {
        if (mounted) {
          clearTimeout(safetyTimer)
          setLoading(false)
        }
      }
    }

    initSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => {
      mounted = false
      clearTimeout(safetyTimer)
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile])

  // ✅ FIX LOGOUT: await + router.refresh() + window.location fallback
  const signOut = async () => {
    setIsLoggingOut(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('[useAuth] Erro no logout:', error.message)
        // Mesmo com erro, força o redirect para garantir saída
      }
      // router.refresh() invalida o cache do servidor — middleware rele o cookie limpo
      router.refresh()
      // window.location garante que o estado React é zerado completamente
      window.location.href = '/login'
    } catch (err) {
      console.error('[useAuth] Exceção no logout:', err)
      window.location.href = '/login'
    } finally {
      setIsLoggingOut(false)
    }
  }

  return { user, profile, loading, isLoggingOut, signOut, supabase }
}
