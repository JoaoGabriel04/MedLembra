'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CheckCircle2, Clock, Hourglass, MinusCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { HorarioHoje, StatusHoje } from '@/types/api'

export interface TimelineItem {
  horario: HorarioHoje
  medicamento: { id: number; nome: string; dosagem: string }
}

interface Props {
  items: TimelineItem[]
  readonly?: boolean
  onMarcar?: (medicamentoId: number, horarioId: number, status: 'TOMADO' | 'PULADO') => Promise<void>
}

function getNowFortaleza(): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Fortaleza',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date())
}

type DisplayStatus = 'AGORA' | StatusHoje

function computeDisplayStatus(hora: string, status: StatusHoje): DisplayStatus {
  if (status === 'PENDENTE') {
    return hora <= getNowFortaleza() ? 'AGORA' : 'PENDENTE'
  }
  return status
}

function StatusDot({ status }: { status: DisplayStatus }) {
  if (status === 'TOMADO') {
    return (
      <div className="size-8 rounded-full bg-[var(--color-success-bg)] flex items-center justify-center">
        <CheckCircle2 className="size-4 text-[var(--color-success)]" />
      </div>
    )
  }
  if (status === 'AGORA') {
    return (
      <div className="size-8 rounded-full bg-card border-2 border-[var(--color-primary)] flex items-center justify-center">
        <Clock className="size-4 text-[var(--color-primary)]" />
      </div>
    )
  }
  if (status === 'PULADO') {
    return (
      <div className="size-8 rounded-full bg-background flex items-center justify-center">
        <MinusCircle className="size-4 text-[var(--color-muted-icon)]" />
      </div>
    )
  }
  return (
    <div className="size-8 rounded-full bg-background flex items-center justify-center">
      <Hourglass className="size-4 text-[var(--color-muted-icon)]" />
    </div>
  )
}

function StatusBadge({
  status,
  registradoEm,
  readonly,
}: {
  status: DisplayStatus
  registradoEm: string | null
  readonly?: boolean
}) {
  if (status === 'TOMADO') {
    const hora = registradoEm
      ? format(parseISO(registradoEm), 'HH:mm', { locale: ptBR })
      : ''
    return (
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-success)]">
        Tomado{hora ? ` às ${hora}` : ''}
      </span>
    )
  }
  if (status === 'AGORA' && !readonly) {
    return (
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)]">
        Agora
      </span>
    )
  }
  if (status === 'PULADO') {
    return (
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-icon)]">
        Pulado
      </span>
    )
  }
  const isAtrasado = status === 'AGORA' && readonly
  return (
    <span
      className={cn(
        'text-xs font-semibold uppercase tracking-wide',
        isAtrasado ? 'text-[var(--color-warning)]' : 'text-[var(--color-muted-icon)]'
      )}
    >
      {isAtrasado ? 'Atrasado' : 'Aguardando'}
    </span>
  )
}

function TimelineCard({
  item,
  isLast,
  readonly,
  onMarcar,
}: {
  item: TimelineItem
  isLast: boolean
  readonly?: boolean
  onMarcar?: Props['onMarcar']
}) {
  const [confirmPular, setConfirmPular] = useState(false)
  const [loading, setLoading] = useState<'TOMADO' | 'PULADO' | null>(null)
  const { horario, medicamento } = item
  const status = computeDisplayStatus(horario.hora, horario.status)

  async function handleMarcar(s: 'TOMADO' | 'PULADO') {
    if (!onMarcar) return
    setLoading(s)
    try {
      await onMarcar(medicamento.id, horario.horarioId, s)
    } finally {
      setLoading(null)
      setConfirmPular(false)
    }
  }

  return (
    <div className="flex gap-4">
      {/* Trilho + bolinha */}
      <div className="flex flex-col items-center" style={{ width: 48 }}>
        <StatusDot status={status} />
        {!isLast && <div className="flex-1 w-px bg-border mt-1" />}
      </div>

      {/* Card do medicamento */}
      <div
        className={cn(
          'flex-1 bg-card rounded-lg shadow-card p-5 mb-4',
          status === 'AGORA' && !readonly
            ? 'border-2 border-[var(--color-primary)]'
            : 'border border-border'
        )}
      >
        {/* Hora + badge */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-semibold text-foreground">{horario.hora}</span>
          <StatusBadge
            status={status}
            registradoEm={horario.registradoEm}
            readonly={readonly}
          />
        </div>

        {/* Medicamento */}
        <p className="text-lg font-bold text-foreground">{medicamento.nome}</p>
        <p className="text-sm text-muted-foreground">{medicamento.dosagem}</p>

        {/* CTA — apenas se AGORA e não readonly */}
        {status === 'AGORA' && !readonly && (
          <div className="mt-4 flex flex-col gap-2">
            {!confirmPular ? (
              <>
                <Button
                  variant="primary"
                  size="idoso"
                  className="w-full"
                  disabled={loading !== null}
                  onClick={() => handleMarcar('TOMADO')}
                >
                  {loading === 'TOMADO' ? 'Registrando...' : 'Confirmar que Tomei'}
                </Button>
                <button
                  type="button"
                  className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground text-center py-1"
                  onClick={() => setConfirmPular(true)}
                >
                  Pulei essa dose
                </button>
              </>
            ) : (
              <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-warning-bg)] p-4 flex flex-col gap-3">
                <p className="text-sm font-medium text-foreground">
                  Tem certeza que pulou essa dose?
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="default"
                    className="flex-1"
                    disabled={loading !== null}
                    onClick={() => setConfirmPular(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    size="default"
                    className="flex-1"
                    disabled={loading !== null}
                    onClick={() => handleMarcar('PULADO')}
                  >
                    {loading === 'PULADO' ? 'Registrando...' : 'Sim, pulei'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function Timeline({ items, readonly, onMarcar }: Props) {
  if (items.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Nenhum horário agendado para hoje.
      </div>
    )
  }

  return (
    <div>
      {items.map((item, i) => (
        <TimelineCard
          key={`${item.medicamento.id}-${item.horario.horarioId}`}
          item={item}
          isLast={i === items.length - 1}
          readonly={readonly}
          onMarcar={onMarcar}
        />
      ))}
    </div>
  )
}
