'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Link2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/lib/auth-store'
import { useCuidadorIdosos, vincularIdoso } from '@/hooks/use-cuidador-idosos'
import { useAlertas } from '@/hooks/use-alertas'

function getInitials(nome: string): string {
  return nome.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
}

export default function IdososPage() {
  const { usuario } = useAuthStore()
  const { data, isLoading } = useCuidadorIdosos()
  const { data: alertasData } = useAlertas()
  const [modalOpen, setModalOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [linking, setLinking] = useState(false)

  const primeiroNome = (usuario?.nome ?? '').split(' ')[0]

  const alertasPorIdoso = alertasData?.alertas.reduce<Record<number, number>>((acc, a) => {
    acc[a.idosoId] = (acc[a.idosoId] ?? 0) + 1
    return acc
  }, {})

  async function handleVincular(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLinking(true)
    try {
      await vincularIdoso(email.trim())
      toast.success('Idoso vinculado com sucesso')
      setModalOpen(false)
      setEmail('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível vincular')
    } finally {
      setLinking(false)
    }
  }

  const idosos = data?.idosos ?? []

  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      {/* Topo */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-label)]">
            Painel do cuidador
          </p>
          <h1 className="text-[28px] font-bold text-foreground mt-0.5">
            Olá, {primeiroNome}.
          </h1>
        </div>
        <Button variant="primary" size="cta" onClick={() => setModalOpen(true)}>
          <Plus className="size-4" />
          Vincular novo idoso
        </Button>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      )}

      {/* Estado vazio */}
      {!isLoading && idosos.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <Link2 className="size-12 text-muted-foreground" />
          <div>
            <p className="text-lg font-semibold text-foreground">Nenhum idoso vinculado</p>
            <p className="text-sm text-muted-foreground mt-1">
              Clique em "Vincular novo idoso" para começar.
            </p>
          </div>
        </div>
      )}

      {/* Grid de idosos */}
      {!isLoading && idosos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {idosos.map((idoso) => {
            const nAlertas = alertasPorIdoso?.[idoso.id] ?? 0
            return (
              <Link
                key={idoso.id}
                href={`/idosos/${idoso.id}`}
                className="bg-card rounded-lg border border-border shadow-card p-5 flex items-center gap-4 hover:shadow-elevated transition-shadow"
              >
                <div className="size-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-white">
                    {getInitials(idoso.nome)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-foreground truncate">
                    {idoso.nome}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{idoso.email}</p>
                </div>
                <span
                  className={cn(
                    'shrink-0 text-xs font-semibold px-2.5 py-1 rounded-sm',
                    nAlertas > 0
                      ? 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]'
                      : 'bg-[var(--color-success-bg)] text-[var(--color-success)]'
                  )}
                >
                  {nAlertas > 0 ? `${nAlertas} alerta${nAlertas !== 1 ? 's' : ''}` : 'Tudo em ordem'}
                </span>
              </Link>
            )
          })}
        </div>
      )}

      {/* Modal vincular */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-sm bg-card rounded-xl shadow-elevated p-8 flex flex-col gap-6">
            <div>
              <h2 className="text-[22px] font-semibold text-foreground">Vincular Idoso</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Insira o e-mail da conta do idoso.
              </p>
            </div>
            <form onSubmit={handleVincular} className="flex flex-col gap-4">
              <Input
                label="E-mail do idoso"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="idoso@email.com"
                autoFocus
              />
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="default"
                  className="flex-1"
                  onClick={() => {
                    setModalOpen(false)
                    setEmail('')
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="default"
                  className="flex-1"
                  disabled={linking}
                >
                  {linking ? 'Vinculando...' : 'Vincular'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
