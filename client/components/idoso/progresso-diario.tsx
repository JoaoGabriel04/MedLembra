const R = 32
const CIRCUMFERENCE = 2 * Math.PI * R

interface Props {
  tomados: number
  total: number
}

export function ProgressoDiario({ tomados, total }: Props) {
  const ratio = total > 0 ? tomados / total : 0
  const offset = CIRCUMFERENCE * (1 - ratio)

  return (
    <div className="bg-card rounded-lg border border-border shadow-card p-6 flex items-center gap-6">
      {/* Ring SVG */}
      <div className="relative shrink-0">
        <svg width="80" height="80" className="-rotate-90" aria-hidden>
          <circle
            cx="40"
            cy="40"
            r={R}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="8"
          />
          <circle
            cx="40"
            cy="40"
            r={R}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-foreground">
          {tomados}/{total}
        </span>
      </div>

      {/* Texto */}
      <div>
        <p className="text-lg font-semibold text-foreground">Progresso Diário</p>
        <p className="text-sm text-muted-foreground mt-1">
          {total === 0
            ? 'Nenhum medicamento agendado para hoje.'
            : `Você já tomou ${tomados} de ${total} medicamento${total !== 1 ? 's' : ''} agendado${total !== 1 ? 's' : ''} para hoje.`}
        </p>
      </div>
    </div>
  )
}
