'use client'

import { useMemo } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Pill } from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'
import { useHoje, marcarTomada } from '@/hooks/use-hoje'
import { useMe } from '@/hooks/use-me'
import { useIdosoAlertas } from '@/hooks/use-idoso-alertas'
import { ProgressoDiario } from '@/components/idoso/progresso-diario'
import { Timeline } from '@/components/idoso/timeline'
import { CardVinculo } from '@/components/idoso/card-vinculo'
import { CardAlertaDestaque } from '@/components/idoso/card-alerta-destaque'
import type { TimelineItem } from '@/components/idoso/timeline'

function getDataFortaleza(): string {
  const now = new Date()
  return format(now, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })
}

export default function HojePage() {
  const { usuario } = useAuthStore()
  const { data, error, isLoading } = useHoje()
  const { data: me } = useMe()
  const { data: alertasData } = useIdosoAlertas()

  const primeiroNome = (me?.nome ?? usuario?.nome ?? '').split(' ')[0]

  const { timelineItems, tomados, total } = useMemo(() => {
    if (!data) return { timelineItems: [] as TimelineItem[], tomados: 0, total: 0 }

    const items: TimelineItem[] = data.medicamentos.flatMap((med) =>
      med.horarios.map((h) => ({
        horario: h,
        medicamento: { id: med.id, nome: med.nome, dosagem: med.dosagem },
      }))
    )
    items.sort((a, b) => a.horario.hora.localeCompare(b.horario.hora))

    const tomados = items.filter((i) => i.horario.status === 'TOMADO').length
    return { timelineItems: items, tomados, total: items.length }
  }, [data])

  async function handleMarcar(medId: number, horarioId: number, status: 'TOMADO' | 'PULADO') {
    await marcarTomada(medId, horarioId, status)
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-5 w-56 bg-muted animate-pulse rounded-md" />
            <div className="h-10 w-72 bg-muted animate-pulse rounded-md" />
            <div className="h-4 w-48 bg-muted animate-pulse rounded-md" />
            <div className="h-24 bg-muted animate-pulse rounded-lg" />
            <div className="h-36 bg-muted animate-pulse rounded-lg" />
            <div className="h-36 bg-muted animate-pulse rounded-lg" />
          </div>
          <div className="space-y-4">
            <div className="h-40 bg-muted animate-pulse rounded-xl" />
            <div className="h-28 bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-8 py-4">
        <div className="rounded-md bg-[var(--color-warning-bg)] border border-[var(--color-warning)] px-4 py-3 text-sm text-[var(--color-warning)]">
          Não foi possível atualizar os dados. Tentando novamente...
        </div>
      </div>
    )
  }

  const emptyState = !data || data.medicamentos.length === 0

  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main — 2/3 */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Saudação + data */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-label)]">
              {getDataFortaleza()}
            </p>
            <h1 className="text-[36px] font-bold text-foreground leading-tight mt-1">
              Olá, {primeiroNome}!
            </h1>
            <p className="text-lg text-muted-foreground mt-1">
              Aqui está seu planejamento de hoje.
            </p>
          </div>

          {/* Progresso — só se tiver medicamentos */}
          {!emptyState && <ProgressoDiario tomados={tomados} total={total} />}

          {/* Agenda ou estado vazio */}
          {emptyState ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <Pill className="size-12 text-muted-foreground" />
              <div>
                <p className="text-lg font-semibold text-foreground">
                  Nenhum medicamento cadastrado
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Peça para seu cuidador adicionar seus medicamentos.
                </p>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-[22px] font-semibold text-foreground">Agenda de Hoje</h2>
              <Timeline items={timelineItems} onMarcar={handleMarcar} />
            </>
          )}
        </div>

        {/* Sidebar — 1/3 */}
        <div className="flex flex-col gap-4">
          <CardAlertaDestaque alertas={alertasData?.alertas ?? []} />
          <CardVinculo cuidador={me?.cuidador ?? null} />
        </div>
      </div>
    </div>
  )
}
