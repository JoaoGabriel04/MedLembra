'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Pill, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/lib/auth-store'
import { AvatarUpload } from '@/components/ui/avatar-upload'

const NAV = {
  IDOSO: [
    { label: 'Hoje', href: '/hoje' },
    { label: 'Meus Medicamentos', href: '/meus-medicamentos' },
    { label: 'Perfil', href: '/perfil' },
  ],
  CUIDADOR: [
    { label: 'Idosos', href: '/idosos' },
    { label: 'Alertas', href: '/alertas' },
    { label: 'Perfil', href: '/perfil' },
  ],
} as const

export function HeaderTopo() {
  const { usuario } = useAuthStore()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const links = usuario ? NAV[usuario.tipo] : []
  const homeHref = usuario?.tipo === 'CUIDADOR' ? '/idosos' : '/hoje'

  return (
    <>
      <header className="h-[72px] bg-card border-b border-border px-4 md:px-8 flex items-center gap-4 md:gap-8 shrink-0 relative z-30">
        {/* Logo */}
        <Link href={homeHref} className="flex items-center gap-2 shrink-0">
          <div
            className="size-8 rounded-md flex items-center justify-center"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <Pill className="size-4 text-white" />
          </div>
          <span className="text-lg font-bold text-foreground">MediSmart</span>
        </Link>

        {/* Nav central — desktop */}
        <nav className="hidden md:flex items-center gap-6 flex-1 justify-center">
          {links.map(({ label, href }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'text-[15px] font-medium border-b-2 pb-0.5 transition-colors',
                  active
                    ? 'text-primary border-primary'
                    : 'text-muted-foreground border-transparent hover:text-foreground'
                )}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Direita: avatar + hamburguer */}
        <div className="flex items-center gap-3 ml-auto">
          {usuario && (
            <div className="flex items-center gap-3 shrink-0">
              <AvatarUpload fotoUrl={usuario.fotoUrl} nome={usuario.nome} size="sm" />
              <div className="leading-tight text-left hidden sm:block">
                <p className="text-sm font-medium text-foreground line-clamp-1">{usuario.nome}</p>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-label)]">
                  {usuario.tipo === 'IDOSO' ? 'Paciente' : 'Cuidador'}
                </p>
              </div>
            </div>
          )}

          {/* Hamburguer — só mobile */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden flex items-center justify-center size-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </header>

      {/* Menu mobile — overlay */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-black/30" onClick={() => setMenuOpen(false)} />
      )}
      <nav
        className={cn(
          'md:hidden fixed top-[72px] left-0 right-0 z-20 bg-card border-b border-border shadow-elevated transition-all duration-200 overflow-hidden',
          menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        )}
      >
        <div className="flex flex-col py-2">
          {links.map(({ label, href }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'px-6 py-3.5 text-[15px] font-medium transition-colors',
                  active
                    ? 'text-primary bg-[var(--color-primary-bg)]'
                    : 'text-foreground hover:bg-muted'
                )}
              >
                {label}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
