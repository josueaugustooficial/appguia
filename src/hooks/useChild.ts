'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useChild() {
  // ✅ FIX CRÍTICO: mesma correção do useAuth.
  // createClient() estava sendo chamado a cada render, criando uma nova
  // referência de objeto que disparava o useEffect em loop infinito.
  const supabase = useMemo(() => createClient(), [])
  const [children, setChildren] = useState<Record<string, unknown>[]>([])
  const [activeChild, setActiveChildState] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchChildren = useCallback(async () => {
    try {
      // ✅ getSession é o método correto para uso no cliente.
      // Mais confiável e rápido que getUser (não faz round-trip ao servidor).
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', session.user.id)
        .order('created_at', { ascending: true })

      if (error) {
        // ✅ Loga o erro em vez de silenciar completamente
        console.error('[useChild] Erro ao buscar filhos:', error.message)
        setChildren([])
        setActiveChildState(null)
        return
      }

      if (data && data.length > 0) {
        setChildren(data)
        // Recupera o filho ativo salvo em localStorage, ou usa o primeiro
        const savedId = typeof window !== 'undefined'
          ? localStorage.getItem('farol_active_child')
          : null
        const found = data.find(c => c.id === savedId)
        setActiveChildState(found || data[0])
      } else {
        setChildren([])
        setActiveChildState(null)
      }
    } catch (err) {
      // ✅ Tratamento robusto — tabela pode não existir ainda em ambiente de dev
      console.error('[useChild] Exceção ao buscar filhos:', err)
      setChildren([])
      setActiveChildState(null)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    let mounted = true

    // ✅ Timeout de segurança: se em 8s não resolver, força loading=false
    const safetyTimer = setTimeout(() => {
      if (mounted) setLoading(false)
    }, 8000)

    const run = async () => {
      await fetchChildren()
      if (mounted) clearTimeout(safetyTimer)
    }

    run()

    return () => {
      mounted = false
      clearTimeout(safetyTimer)
    }
  // ✅ fetchChildren é estável (useCallback com supabase memoizado),
  // portanto este useEffect executa UMA ÚNICA VEZ por montagem.
  }, [fetchChildren])

  const setActiveChild = (child: Record<string, unknown>) => {
    setActiveChildState(child)
    if (typeof window !== 'undefined') {
      localStorage.setItem('farol_active_child', child.id as string)
    }
  }

  const refreshChildren = useCallback(async () => {
    await fetchChildren()
  }, [fetchChildren])

  return { children, activeChild, setActiveChild, loading, refreshChildren, supabase }
}
