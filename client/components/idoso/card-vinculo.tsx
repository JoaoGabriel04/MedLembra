import { Link2 } from 'lucide-react'
import Link from 'next/link'
import type { UsuarioBasico } from '@/types/api'
import { AvatarUpload } from '@/components/ui/avatar-upload'

interface Props {
  cuidador: UsuarioBasico | null
}

export function CardVinculo({ cuidador }: Props) {
  return (
    <div className="bg-card rounded-lg border border-border shadow-card p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-label)] mb-4">
        Meu Cuidador
      </p>

      {cuidador ? (
        <div className="flex items-center gap-3">
          <AvatarUpload fotoUrl={cuidador.fotoUrl} nome={cuidador.nome} size="sm" />
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
