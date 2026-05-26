'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  // ✅ FIX CRÍTICO: useMemo garante que a instância do cliente Supabase
  // seja criada UMA única vez por montagem do componente.
  // Sem isso, createClient() retorna um objeto novo a cada render,
  // fazendo o array de deps do useEffect detectar uma mudança falsa
  // e re-executar infinitamente → loading infinito.
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

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
  // ✅ supabase está memoizado, então é seguro incluí-lo aqui
  }, [supabase])

  useEffect(() => {
    let mounted = true

    // ✅ Timeout de segurança: se em 8s o Supabase não responder,
    // força saída do estado de loading para evitar tela travada.
    const safetyTimer = setTimeout(() => {
      if (mounted) {
        setLoading(false)
      }
    }, 8000)

    // 1. Carrega sessão imediatamente — não espera pelo evento
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

    // 2. Continua ouvindo mudanças de estado (logout, refresh de token)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
        // Garante que loading seja false após qualquer evento de auth
        setLoading(false)
      }
    )

    return () => {
      mounted = false
      clearTimeout(safetyTimer)
      subscription.unsubscribe()
    }
  // ✅ supabase e fetchProfile são estáveis (useMemo/useCallback),
  // portanto este useEffect executa UMA ÚNICA VEZ por montagem.
  }, [supabase, fetchProfile])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return { user, profile, loading, signOut, supabase }
}
