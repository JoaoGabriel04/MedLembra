'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Pill } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/lib/auth-store'
import { AvatarUpload } from '@/components/ui/avatar-upload'

const NAV = {
  IDOSO: [
    { label: 'Hoje', href: '/hoje' },
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
  const links = usuario ? NAV[usuario.tipo] : []
  const homeHref = usuario?.tipo === 'CUIDADOR' ? '/idosos' : '/hoje'

  return (
    <header className="h-[72px] bg-card border-b border-border px-8 flex items-center gap-8 shrink-0">
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

      {/* Nav central */}
      <nav className="flex items-center gap-6 flex-1 justify-center">
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

      {/* Avatar do usuário */}
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
    </header>
  )
}
