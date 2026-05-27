'use client'

// ═══════════════════════════════════════════════════════════
// useSubscription — verifica o status de assinatura do usuário.
//
// ✅ NÃO faz query adicional ao Supabase.
// Lê profile.subscription_status já carregado pelo useAuth.
//
// Retorna:
//   isPremium: boolean          — true se assinatura ativa
//   isLoading: boolean          — herdado do useAuth
//   subscriptionStatus: string  — 'free' | 'active' | 'cancelled' | 'expired'
//   canUseFeature(f): boolean   — verifica limite do plano free
// ═══════════════════════════════════════════════════════════

import { useMemo } from 'react'
import { useAuth } from './useAuth'

// ─── Definição dos limites do plano free ────────────────────────────────────
export const FREE_LIMITS = {
  routines: 3,           // Máx. 3 rotinas
  diaryDays: 30,         // Últimos 30 dias de histórico
  children: 1,           // Máx. 1 filho
} as const

// ─── Features que são sempre free ───────────────────────────────────────────
export const FREE_FEATURES = [
  'home',
  'sos',
  'diary_basic',         // Últimos 30 dias
  'routines_basic',      // Até 3 rotinas
  'sensory_passport',
  'profile',
] as const

// ─── Features que requerem premium ─────────────────────────────────────────
export const PREMIUM_FEATURES = [
  'routines_unlimited',  // Acima de 3 rotinas
  'diary_full',          // Histórico completo (acima de 30 dias)
  'legal_documents',     // Documentos legais gerados por IA
  'doctor_reports',      // Relatórios para médicos/escola
  'multiple_children',   // Acima de 1 filho
  'advanced_communication', // Comunicação alternativa avançada
] as const

export type FreeFeature = typeof FREE_FEATURES[number]
export type PremiumFeature = typeof PREMIUM_FEATURES[number]
export type AnyFeature = FreeFeature | PremiumFeature

export function useSubscription() {
  const { profile, loading } = useAuth()

  const subscriptionStatus = useMemo(() => {
    if (!profile) return 'free'
    return (profile.subscription_status as string) ?? 'free'
  }, [profile])

  const isPremium = useMemo(() => {
    return subscriptionStatus === 'active'
  }, [subscriptionStatus])

  /**
   * Verifica se o usuário pode usar uma feature.
   * Features free: sempre true.
   * Features premium: true apenas se isPremium.
   */
  const canUseFeature = useMemo(() => {
    return (feature: AnyFeature): boolean => {
      if (isPremium) return true
      return (FREE_FEATURES as readonly string[]).includes(feature)
    }
  }, [isPremium])

  /**
   * Verifica limite numérico do plano free.
   * Ex: hasReachedLimit('routines', 3) → true se no plano free e já tem 3+ rotinas.
   */
  const hasReachedLimit = useMemo(() => {
    return (resource: keyof typeof FREE_LIMITS, currentCount: number): boolean => {
      if (isPremium) return false
      return currentCount >= FREE_LIMITS[resource]
    }
  }, [isPremium])

  return {
    isPremium,
    isLoading: loading,
    subscriptionStatus,
    canUseFeature,
    hasReachedLimit,
  }
}
