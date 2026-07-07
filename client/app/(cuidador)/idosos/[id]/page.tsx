'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { CalendarClock, FileDown, Loader2, PackageOpen, Pill, TrendingUp } from 'lucide-react'
import { useDashboard } from '@/hooks/use-dashboard'
import { GraficoAdesao } from '@/components/cuidador/grafico-adesao'
import { BASE } from '@/lib/api'
import { useAuthStore } from '@/lib/auth-store'
import type { Alerta } from '@/types/api'

function SummaryCard({
  title,
  value,
  icon: Icon,
  warn,
}: {
  title: string
  value: string | number
  icon: React.ElementType
  warn?: boolean
}) {
  return (
    <div className="bg-card rounded-lg border border-border shadow-card p-5">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="size-9 rounded-md flex items-center justify-center"
          style={{ background: warn ? 'var(--color-warning-bg)' : 'rgba(59,93,231,0.08)' }}
        >
          <Icon
            className="size-5"
            style={{ color: warn ? 'var(--color-warning)' : 'var(--color-primary)' }}
          />
        </div>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
      <p className="text-[28px] font-bold text-foreground">{value}</p>
    </div>
  )
}

function AlertaRow({ alerta }: { alerta: Alerta }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-card rounded-lg border border-border shadow-card">
      <div className="size-8 rounded-md bg-[var(--color-warning-bg)] flex items-center justify-center shrink-0">
        {alerta.tipo === 'ESTOQUE_BAIXO' ? (
          <PackageOpen className="size-4 text-[var(--color-warning)]" />
        ) : (
          <CalendarClock className="size-4 text-[var(--color-warning)]" />
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{alerta.medicamentoNome}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {alerta.tipo === 'ESTOQUE_BAIXO'
            ? `Estoque acaba em ${alerta.diasRestantes} dia${alerta.diasRestantes !== 1 ? 's' : ''}`
            : `Validade em ${alerta.diasParaVencer} dia${alerta.diasParaVencer !== 1 ? 's' : ''}`}
        </p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { id } = useParams<{ id: string }>()
  const idosoId = Number(id)
  const { data, isLoading } = useDashboard(idosoId)
  const [exportando, setExportando] = useState(false)
  const token = useAuthStore((s) => s.token)

  async function exportarRelatorio() {
    setExportando(true)
    try {
      const res = await fetch(`${BASE}/cuidador/dashboard/${idosoId}/relatorio?periodo=7`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Falha ao gerar relatório')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio-${idosoId}-${new Date().toISOString().slice(0, 10)}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      // toast is not available here — just log
      console.error('Erro ao exportar relatório')
    } finally {
      setExportando(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="h-52 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  if (!data) return null

  const { resumo, alertas } = data

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={exportarRelatorio}
          disabled={exportando}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-[var(--color-surface-alt)] border border-[var(--color-border)] text-foreground hover:bg-[var(--color-surface)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exportando
            ? <Loader2 className="size-4 animate-spin" />
            : <FileDown className="size-4" />
          }
          {exportando ? 'Gerando relatório...' : 'Exportar relatório'}
        </button>
      </div>

      {/* 3 cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard title="Medicamentos" value={resumo.totalMedicamentos} icon={Pill} />
        <SummaryCard
          title="Adesão 7 dias"
          value={`${resumo.adesao7dias.toFixed(0)}%`}
          icon={TrendingUp}
        />
        <SummaryCard
          title="Alertas ativos"
          value={alertas.length}
          icon={PackageOpen}
          warn={alertas.length > 0}
        />
      </div>

      {/* Gráfico */}
      <GraficoAdesao resumo={resumo} />

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-foreground">Alertas ativos</h3>
          {alertas.map((alerta, i) => (
            <AlertaRow key={i} alerta={alerta} />
          ))}
        </div>
      )}

      {alertas.length === 0 && (
        <div className="text-center py-8 text-sm text-muted-foreground">
          Nenhum alerta ativo. Tudo em ordem.
        </div>
      )}
    </div>
  )
}
