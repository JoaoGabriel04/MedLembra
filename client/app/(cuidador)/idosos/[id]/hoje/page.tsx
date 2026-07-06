'use client'

import { useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useHoje } from '@/hooks/use-hoje'
import { Timeline } from '@/components/idoso/timeline'
import type { TimelineItem } from '@/components/idoso/timeline'

export default function HojeReadonlyPage() {
  const { id } = useParams<{ id: string }>()
  const idosoId = Number(id)
  const { data, isLoading } = useHoje(idosoId)

  const timelineItems = useMemo(() => {
    if (!data) return [] as TimelineItem[]
    const items: TimelineItem[] = data.medicamentos.flatMap((med) =>
      med.horarios.map((h) => ({
        horario: h,
        medicamento: { id: med.id, nome: med.nome, dosagem: med.dosagem },
      }))
    )
    return items.sort((a, b) => a.horario.hora.localeCompare(b.horario.hora))
  }, [data])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-36 bg-muted animate-pulse rounded-lg" />
        <div className="h-36 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-6">
        Visão somente leitura da agenda do idoso.
      </p>
      <Timeline items={timelineItems} readonly />
    </div>
  )
}
