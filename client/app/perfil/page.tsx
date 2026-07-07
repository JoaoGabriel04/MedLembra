'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Link2, LogOut } from 'lucide-react'
import { mutate } from 'swr'
import { api } from '@/lib/api'
import { swrKeys } from '@/lib/swr-keys'
import { useAuthStore } from '@/lib/auth-store'
import { useMe } from '@/hooks/use-me'
import { AvatarUpload } from '@/components/ui/avatar-upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function getInitials(nome: string) {
  return nome.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
}

function PerfilIdoso() {
  const { usuario } = useAuthStore()
  const { data } = useMe()
  const router = useRouter()
  const { logout } = useAuthStore()

  const [email, setEmail] = useState('')
  const [linking, setLinking] = useState(false)
  const cuidador = data?.cuidador

  async function handleVincular(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLinking(true)
    try {
      await api('/vinculos', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim() }),
      })
      await mutate(swrKeys.me())
      toast.success('Cuidador vinculado com sucesso')
      setEmail('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível vincular')
    } finally {
      setLinking(false)
    }
  }

  function handleLogout() {
    logout()
    router.push('/login')
  }

  return (
    <div className="max-w-2xl mx-auto px-8 py-8">
      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-label)]">
          Idoso
        </p>
        <h1 className="text-[28px] font-bold text-foreground mt-0.5">Meu perfil</h1>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-card p-6 flex items-center gap-5 mb-6">
        <AvatarUpload
          fotoUrl={data?.fotoUrl}
          nome={usuario?.nome ?? ''}
          size="lg"
          editavel
        />
        <div>
          <p className="text-lg font-semibold text-foreground">{usuario?.nome}</p>
          <p className="text-sm text-muted-foreground">{usuario?.email}</p>
          <p className="text-xs mt-1 inline-block px-2 py-0.5 rounded-sm bg-[rgba(59,93,231,0.08)] text-primary font-medium">
            Idoso
          </p>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-card p-6 mb-6">
        <h2 className="text-base font-semibold text-foreground mb-4">Meu cuidador</h2>
        {cuidador ? (
          <div className="flex items-center gap-4">
            <div className="size-10 rounded-full bg-[var(--color-accent)] flex items-center justify-center shrink-0">
              <span className="text-sm font-semibold text-white">{getInitials(cuidador.nome)}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{cuidador.nome}</p>
              <p className="text-xs text-muted-foreground">{cuidador.email}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Nenhum cuidador vinculado. Insira o e-mail do cuidador para conectar as contas.
            </p>
            <form onSubmit={handleVincular} className="flex gap-3">
              <div className="flex-1">
                <Input
                  label=""
                  type="email"
                  placeholder="E-mail do cuidador"
                  icon={<Link2 />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="default"
                className="shrink-0"
                disabled={linking}
              >
                {linking ? 'Vinculando...' : 'Vincular'}
              </Button>
            </form>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button variant="secondary" size="default" onClick={handleLogout}>
          <LogOut className="size-4" />
          Sair da conta
        </Button>
      </div>
    </div>
  )
}

function PerfilCuidador() {
  const { usuario, logout } = useAuthStore()
  const { data } = useMe()
  const router = useRouter()
  const idosos = data?.idosos ?? []

  function handleLogout() {
    logout()
    router.push('/login')
  }

  return (
    <div className="max-w-2xl mx-auto px-8 py-8">
      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-label)]">
          Cuidador
        </p>
        <h1 className="text-[28px] font-bold text-foreground mt-0.5">Meu perfil</h1>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-card p-6 flex items-center gap-5 mb-6">
        <AvatarUpload
          fotoUrl={data?.fotoUrl}
          nome={usuario?.nome ?? ''}
          size="lg"
          editavel
        />
        <div>
          <p className="text-lg font-semibold text-foreground">{usuario?.nome}</p>
          <p className="text-sm text-muted-foreground">{usuario?.email}</p>
          <p className="text-xs mt-1 inline-block px-2 py-0.5 rounded-sm bg-[rgba(139,92,246,0.1)] text-[var(--color-accent)] font-medium">
            Cuidador
          </p>
        </div>
      </div>

      {idosos.length > 0 && (
        <div className="bg-card rounded-lg border border-border shadow-card p-6 mb-6">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Idosos vinculados ({idosos.length})
          </h2>
          <div className="flex flex-col gap-3">
            {idosos.map((idoso) => (
              <div key={idoso.id} className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {getInitials(idoso.nome)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{idoso.nome}</p>
                  <p className="text-xs text-muted-foreground">{idoso.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button variant="secondary" size="default" onClick={handleLogout}>
          <LogOut className="size-4" />
          Sair da conta
        </Button>
      </div>
    </div>
  )
}

export default function PerfilPage() {
  const { usuario } = useAuthStore()

  if (usuario?.tipo === 'CUIDADOR') return <PerfilCuidador />
  return <PerfilIdoso />
}
