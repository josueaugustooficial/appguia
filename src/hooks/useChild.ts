'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useChild() {
  const supabase = createClient()
  const [children, setChildren] = useState<Record<string, unknown>[]>([])
  const [activeChild, setActiveChildState] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChildren = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', user.id)
        .order('created_at', { ascending: true })

      if (data && data.length > 0) {
        setChildren(data)
        // Load active child from localStorage or default to first
        const savedId = localStorage.getItem('farol_active_child')
        const found = data.find(c => c.id === savedId)
        setActiveChildState(found || data[0])
      }
      setLoading(false)
    }
    fetchChildren()
  }, [supabase])

  const setActiveChild = (child: Record<string, unknown>) => {
    setActiveChildState(child)
    localStorage.setItem('farol_active_child', child.id as string)
  }

  const refreshChildren = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('children')
      .select('*')
      .eq('parent_id', user.id)
    if (data) {
      setChildren(data)
      if (!activeChild && data.length > 0) setActiveChildState(data[0])
    }
  }

  return { children, activeChild, setActiveChild, loading, refreshChildren, supabase }
}
