import { Link2 } from 'lucide-react'
import Link from 'next/link'
import type { MeResponse } from '@/types/api'

interface Props {
  cuidador: MeResponse['cuidador']
}

function initials(nome: string): string {
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

export function CardVinculo({ cuidador }: Props) {
  return (
    <div className="bg-card rounded-lg border border-border shadow-card p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-label)] mb-4">
        Meu Cuidador
      </p>

      {cuidador ? (
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="text-sm font-semibold text-white">{initials(cuidador.nome)}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{cuidador.nome}</p>
            <p className="text-xs text-muted-foreground truncate">{cuidador.email}</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">Nenhum cuidador vinculado.</p>
          <Link
            href="/perfil"
            className="text-sm font-semibold text-primary hover:underline flex items-center gap-1.5"
          >
            <Link2 className="size-4" />
            Vincular agora
          </Link>
        </div>
      )}
    </div>
  )
}
