'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { DashboardResponse } from '@/types/api'

interface Props {
  resumo: DashboardResponse['resumo']
}

export function GraficoAdesao({ resumo }: Props) {
  const data = [
    { name: 'Agendadas', valor: resumo.totalDosesAgendadas7dias },
    { name: 'Tomadas', valor: resumo.totalTomadas7dias },
    { name: 'Puladas', valor: resumo.totalPuladas7dias },
  ]

  return (
    <div className="bg-card rounded-lg border border-border shadow-card p-5">
      <p className="text-[15px] font-semibold text-foreground mb-1">
        Adesão dos últimos 7 dias
      </p>
      <p className="text-xs text-muted-foreground mb-4">
        {resumo.adesao7dias.toFixed(0)}% de adesão no período
      </p>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} barSize={48}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              background: 'white',
            }}
            cursor={{ fill: 'rgba(59,93,231,0.06)' }}
          />
          <Bar dataKey="valor" radius={[4, 4, 0, 0]} fill="var(--color-primary)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
