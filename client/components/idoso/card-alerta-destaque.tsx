'use client'

import Link from 'next/link'
import { PackageOpen, CalendarClock } from 'lucide-react'
import type { Alerta } from '@/types/api'

interface Props {
  alertas: Alerta[]
}

function descricaoAlerta(alerta: Alerta): string {
  if (alerta.tipo === 'ESTOQUE_BAIXO') {
    return alerta.diasRestantes === 0
      ? `O estoque de ${alerta.medicamentoNome} acabou.`
      : `O estoque de ${alerta.medicamentoNome} acabará em ${alerta.diasRestantes} dia${alerta.diasRestantes !== 1 ? 's' : ''}.`
  }
  return alerta.diasParaVencer <= 0
    ? `${alerta.medicamentoNome} está vencido.`
    : `${alerta.medicamentoNome} vence em ${alerta.diasParaVencer} dia${alerta.diasParaVencer !== 1 ? 's' : ''}.`
}

export function CardAlertaDestaque({ alertas }: Props) {
  if (alertas.length === 0) return null

  const primeiro = alertas[0]
  const Icon = primeiro.tipo === 'ESTOQUE_BAIXO' ? PackageOpen : CalendarClock
  const extras = alertas.length - 1

  return (
    <div
      className="rounded-xl p-6 flex flex-col gap-4"
      style={{ background: 'var(--gradient-alert-card)' }}
    >
      {/* Topo */}
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-md bg-white/20 flex items-center justify-center shrink-0">
          <Icon className="size-5 text-white" />
        </div>
        <p className="text-[18px] font-semibold text-white leading-tight">Alerta</p>
      </div>

      {/* Corpo */}
      <div className="flex flex-col gap-1">
        <p className="text-[15px] text-white/90 leading-relaxed">
          {descricaoAlerta(primeiro)}
        </p>
        {extras > 0 && (
          <p className="text-sm text-white/60">
            e mais {extras} alerta{extras !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* CTA */}
      <Link
        href="/meus-medicamentos"
        className="inline-flex items-center justify-center px-4 py-2.5 rounded-md bg-white text-sm font-semibold"
        style={{ color: 'var(--color-accent)' }}
      >
        Ver estoque completo
      </Link>
    </div>
  )
}
