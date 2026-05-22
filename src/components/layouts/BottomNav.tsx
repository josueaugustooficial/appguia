'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  House, FirstAid, CalendarDots, NotePencil, User
} from '@phosphor-icons/react'

const NAV_ITEMS = [
  { href: '/home', icon: House, label: 'Home' },
  { href: '/rotinas', icon: CalendarDots, label: 'Rotinas' },
  { href: '/sos', icon: FirstAid, label: 'Farol', isSOS: true },
  { href: '/diario', icon: NotePencil, label: 'Diário' },
  { href: '/perfil', icon: User, label: 'Perfil' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Navegação principal">
      {NAV_ITEMS.map(item => {
        const Icon = item.icon
        const isActive = pathname === item.href

        if (item.isSOS) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="bottom-nav-item bottom-nav-sos animate-pulse-red"
              aria-label="Modo SOS - Protocolo de crise"
              id="nav-sos-button"
            >
              <Icon size={22} weight="fill" color="white" />
              <span style={{ fontSize: '0.55rem', fontWeight: 700 }}>SOS</span>
            </Link>
          )
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            id={`nav-${item.label.toLowerCase()}`}
          >
            <Icon
              size={22}
              weight={isActive ? 'fill' : 'regular'}
              color={isActive ? 'var(--amber-core)' : 'var(--text-muted)'}
            />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
