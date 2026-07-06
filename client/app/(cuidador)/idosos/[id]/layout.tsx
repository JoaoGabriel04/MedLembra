'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDashboard } from '@/hooks/use-dashboard'

const TABS = [
  { label: 'Dashboard', exact: true, href: (id: string) => `/idosos/${id}` },
  { label: 'Hoje', exact: false, href: (id: string) => `/idosos/${id}/hoje` },
  { label: 'Medicamentos', exact: false, href: (id: string) => `/idosos/${id}/medicamentos` },
]

export default function IdosoDetailLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>()
  const idosoId = Number(id)
  const { data } = useDashboard(idosoId)
  const pathname = usePathname()

  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      {/* Voltar + título */}
      <div className="mb-6">
        <Link
          href="/idosos"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3"
        >
          <ChevronLeft className="size-4" />
          Meus Idosos
        </Link>
        <h1 className="text-[28px] font-bold text-foreground">
          {data?.idoso.nome ?? '...'}
        </h1>
        <p className="text-[15px] text-muted-foreground mt-0.5">Painel de acompanhamento</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border mb-6">
        {TABS.map(({ label, href, exact }) => {
          const tabHref = href(id)
          const isActive = exact ? pathname === tabHref : pathname.startsWith(tabHref)
          return (
            <Link
              key={label}
              href={tabHref}
              className={cn(
                'px-4 py-2.5 text-[15px] font-medium border-b-2 -mb-px transition-colors',
                isActive
                  ? 'text-primary border-primary'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              )}
            >
              {label}
            </Link>
          )
        })}
      </div>

      {children}
    </div>
  )
}
