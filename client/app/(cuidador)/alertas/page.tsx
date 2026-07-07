'use client'

import Link from 'next/link'
import { BellOff } from 'lucide-react'
import { useAlertas } from '@/hooks/use-alertas'
import { CardAlerta } from '@/components/cuidador/card-alerta'

export default function AlertasPage() {
  const { data, isLoading } = useAlertas()
  const alertas = data?.alertas ?? []

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 md:py-8">
      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-label)]">
          Cuidador
        </p>
        <h1 className="text-[28px] font-bold text-foreground mt-0.5">Alertas</h1>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && alertas.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <BellOff className="size-10 text-muted-foreground" />
          <div>
            <p className="text-lg font-semibold text-foreground">Nenhum alerta ativo</p>
            <p className="text-sm text-muted-foreground mt-1">
              Todos os medicamentos estão em ordem.
            </p>
          </div>
        </div>
      )}

      {!isLoading && alertas.length > 0 && (
        <div className="flex flex-col gap-3">
          {alertas.map((alerta, i) => (
            <Link key={i} href={`/idosos/${alerta.idosoId}`} className="block hover:opacity-80 transition-opacity">
              <CardAlerta alerta={alerta} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
