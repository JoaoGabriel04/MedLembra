'use client'

import { format, parseISO, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Pill, Package, CalendarClock } from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'
import { useMedicamentos } from '@/hooks/use-medicamentos'
import type { Medicamento } from '@/types/api'

function EstoqueBadge({ estoque }: { estoque: number }) {
  if (estoque === 0)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-danger-bg)] text-[var(--color-danger)]">
        <Package className="size-3" /> Sem estoque
      </span>
    )
  if (estoque <= 7)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-warning-bg)] text-[var(--color-warning)]">
        <Package className="size-3" /> {estoque} dose{estoque !== 1 ? 's' : ''}
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-success-bg)] text-[var(--color-success)]">
      <Package className="size-3" /> {estoque} doses
    </span>
  )
}

function ValidadeBadge({ dataValidade }: { dataValidade: string }) {
  const hoje = new Date()
  const validade = parseISO(dataValidade)
  const dias = differenceInDays(validade, hoje)
  const label = format(validade, "dd/MM/yyyy", { locale: ptBR })

  if (dias < 0)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-danger-bg)] text-[var(--color-danger)]">
        <CalendarClock className="size-3" /> Vencido ({label})
      </span>
    )
  if (dias <= 30)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-warning-bg)] text-[var(--color-warning)]">
        <CalendarClock className="size-3" /> Vence em {dias}d ({label})
      </span>
    )
  return (
    <span className="text-xs text-muted-foreground">
      Válido até {label}
    </span>
  )
}

function CardMedicamento({ med }: { med: Medicamento }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-card p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-md bg-[var(--color-primary-bg)] flex items-center justify-center shrink-0">
            <Pill className="size-4 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground leading-tight">{med.nome}</p>
            <p className="text-sm text-muted-foreground">{med.dosagem} · {med.frequenciaDiaria}x ao dia</p>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <EstoqueBadge estoque={med.estoqueAtual} />
        <ValidadeBadge dataValidade={med.dataValidade} />
      </div>
    </div>
  )
}

export default function MeusMedicamentosPage() {
  const { usuario } = useAuthStore()
  const idosoId = usuario?.id ?? 0
  const { data, isLoading, error } = useMedicamentos(idosoId)

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-8 py-8 flex flex-col gap-4">
        <div className="h-8 w-56 bg-muted animate-pulse rounded-md" />
        <div className="h-4 w-40 bg-muted animate-pulse rounded-md" />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-8 py-4">
        <div className="rounded-md bg-[var(--color-warning-bg)] border border-[var(--color-warning)] px-4 py-3 text-sm text-[var(--color-warning)]">
          Não foi possível carregar os medicamentos. Tentando novamente...
        </div>
      </div>
    )
  }

  const medicamentos = data?.medicamentos ?? []

  return (
    <div className="max-w-3xl mx-auto px-8 py-8 flex flex-col gap-6">
      <div>
        <h1 className="text-[32px] font-bold text-foreground leading-tight">Meus Medicamentos</h1>
        <p className="text-muted-foreground mt-1">
          {medicamentos.length > 0
            ? `${medicamentos.length} medicamento${medicamentos.length !== 1 ? 's' : ''} cadastrado${medicamentos.length !== 1 ? 's' : ''}`
            : 'Nenhum medicamento cadastrado'}
        </p>
      </div>

      {medicamentos.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <Pill className="size-12 text-muted-foreground" />
          <div>
            <p className="text-lg font-semibold text-foreground">Nenhum medicamento</p>
            <p className="text-sm text-muted-foreground mt-1">
              Peça para seu cuidador adicionar seus medicamentos.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {medicamentos.map(med => (
            <CardMedicamento key={med.id} med={med} />
          ))}
        </div>
      )}
    </div>
  )
}
