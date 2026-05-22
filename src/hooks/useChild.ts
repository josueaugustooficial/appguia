'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useChild() {
  const supabase = createClient()
  const [children, setChildren] = useState<Record<string, unknown>[]>([])
  const [activeChild, setActiveChildState] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const fetchChildren = async () => {
      try {
        // Usa getSession que é mais confiável que getUser no cliente
        const { data: { session } } = await supabase.auth.getSession()
        if (!mounted) return
        if (!session?.user) {
          setLoading(false)
          return
        }

        const { data } = await supabase
          .from('children')
          .select('*')
          .eq('parent_id', session.user.id)
          .order('created_at', { ascending: true })

        if (!mounted) return

        if (data && data.length > 0) {
          setChildren(data)
          const savedId = localStorage.getItem('farol_active_child')
          const found = data.find(c => c.id === savedId)
          setActiveChildState(found || data[0])
        } else {
          setChildren([])
          setActiveChildState(null)
        }
      } catch {
        // Silencia erros — tabela pode não existir ainda
        if (mounted) {
          setChildren([])
          setActiveChildState(null)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchChildren()
    return () => { mounted = false }
  }, [supabase])

  const setActiveChild = (child: Record<string, unknown>) => {
    setActiveChildState(child)
    localStorage.setItem('farol_active_child', child.id as string)
  }

  const refreshChildren = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return
    const { data } = await supabase
      .from('children')
      .select('*')
      .eq('parent_id', session.user.id)
    if (data) {
      setChildren(data)
      if (!activeChild && data.length > 0) setActiveChildState(data[0])
    }
  }

  return { children, activeChild, setActiveChild, loading, refreshChildren, supabase }
}
