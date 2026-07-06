import { CalendarClock, PackageOpen } from 'lucide-react'
import type { AlertaGlobal } from '@/types/api'

interface Props {
  alerta: AlertaGlobal
}

export function CardAlerta({ alerta }: Props) {
  const descricao =
    alerta.tipo === 'ESTOQUE_BAIXO'
      ? `Estoque acaba em ${alerta.diasRestantes} dia${alerta.diasRestantes !== 1 ? 's' : ''}`
      : `Validade em ${alerta.diasParaVencer} dia${alerta.diasParaVencer !== 1 ? 's' : ''}`

  return (
    <div className="flex items-start gap-3 p-4 bg-card rounded-lg border border-border shadow-card">
      <div className="size-8 rounded-md bg-[var(--color-warning-bg)] flex items-center justify-center shrink-0">
        {alerta.tipo === 'ESTOQUE_BAIXO' ? (
          <PackageOpen className="size-4 text-[var(--color-warning)]" />
        ) : (
          <CalendarClock className="size-4 text-[var(--color-warning)]" />
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">
          {alerta.idosoNome} — {alerta.medicamentoNome}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{descricao}</p>
      </div>
    </div>
  )
}
