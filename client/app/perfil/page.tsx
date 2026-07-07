'use client'

import { useRef, useState, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Camera, Check, Link2, LogOut, Trash2, X } from 'lucide-react'
import { mutate } from 'swr'
import { api } from '@/lib/api'
import { swrKeys } from '@/lib/swr-keys'
import { useAuthStore } from '@/lib/auth-store'
import { useFotoPerfil } from '@/hooks/use-foto-perfil'
import { useMe } from '@/hooks/use-me'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function initials(nome: string): string {
  return nome.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
}

function AvatarEditor({ fotoUrl, nome }: { fotoUrl: string | null; nome: string }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState(false)
  const { uploadFoto, removerFoto } = useFotoPerfil()

  const displayUrl = previewUrl ?? fotoUrl
  const isPending = !!previewUrl

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(file))
    setPendingFile(file)
  }

  function handleCancelar() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setPendingFile(null)
  }

  async function handleConfirmar() {
    if (!pendingFile) return
    setSaving(true)
    try {
      await uploadFoto(pendingFile)
      toast.success('Foto de perfil atualizada!')
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
      setPendingFile(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível salvar a foto')
    } finally {
      setSaving(false)
    }
  }

  async function handleRemover() {
    setRemoving(true)
    try {
      await removerFoto()
      toast.success('Foto removida')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível remover a foto')
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar com overlay de câmera */}
      <div className="relative">
        <div className="size-24 rounded-full bg-primary overflow-hidden flex items-center justify-center shrink-0 ring-4 ring-background">
          {displayUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={displayUrl} alt={nome} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-white">{initials(nome)}</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={saving || removing}
          className="absolute bottom-0 right-0 size-7 rounded-full bg-card border-2 border-background shadow-md flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors disabled:opacity-50"
          aria-label="Alterar foto de perfil"
        >
          <Camera className="size-3.5" />
        </button>
      </div>

      {/* Ações no estado de preview */}
      {isPending && (
        <div className="flex flex-col items-center gap-2 w-full max-w-[200px]">
          <p className="text-xs text-muted-foreground text-center">Prévia da nova foto</p>
          <div className="flex gap-2 w-full">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-md px-2 py-1.5 transition-colors"
            >
              <Camera className="size-3" /> Trocar
            </button>
            <button
              type="button"
              onClick={handleCancelar}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-md px-2 py-1.5 transition-colors"
            >
              <X className="size-3" /> Cancelar
            </button>
          </div>
          <Button
            type="button"
            variant="primary"
            size="default"
            className="w-full"
            onClick={handleConfirmar}
            disabled={saving}
          >
            {saving ? (
              'Salvando...'
            ) : (
              <><Check className="size-4" /> Confirmar foto</>
            )}
          </Button>
        </div>
      )}

      {/* Remover foto salva */}
      {!isPending && fotoUrl && (
        <button
          type="button"
          onClick={handleRemover}
          disabled={removing}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
        >
          <Trash2 className="size-3" />
          {removing ? 'Removendo...' : 'Remover foto'}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  )
}

function PerfilIdoso() {
  const { usuario, logout } = useAuthStore()
  const { data } = useMe()
  const router = useRouter()

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
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 md:py-8">
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-label)]">
          Idoso
        </p>
        <h1 className="text-[28px] font-bold text-foreground mt-0.5">Meu perfil</h1>
      </div>

      {/* Card de identidade com editor de foto */}
      <div className="bg-card rounded-lg border border-border shadow-card p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <AvatarEditor fotoUrl={data?.fotoUrl ?? null} nome={usuario?.nome ?? ''} />
          <div className="text-center sm:text-left">
            <p className="text-lg font-semibold text-foreground">{usuario?.nome}</p>
            <p className="text-sm text-muted-foreground">{usuario?.email}</p>
            <span className="mt-1.5 inline-block text-xs px-2 py-0.5 rounded-sm bg-[rgba(59,93,231,0.08)] text-primary font-medium">
              Idoso
            </span>
          </div>
        </div>
      </div>

      {/* Cuidador */}
      <div className="bg-card rounded-lg border border-border shadow-card p-6 mb-6">
        <h2 className="text-base font-semibold text-foreground mb-4">Meu cuidador</h2>
        {cuidador ? (
          <div className="flex items-center gap-4">
            <div className="size-10 rounded-full bg-[var(--color-accent)] flex items-center justify-center shrink-0">
              <span className="text-sm font-semibold text-white">{initials(cuidador.nome)}</span>
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
              <Button type="submit" variant="primary" size="default" className="shrink-0" disabled={linking}>
                {linking ? 'Vinculando...' : 'Vincular'}
              </Button>
            </form>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button variant="secondary" size="default" onClick={handleLogout}>
          <LogOut className="size-4" /> Sair da conta
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
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 md:py-8">
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-label)]">
          Cuidador
        </p>
        <h1 className="text-[28px] font-bold text-foreground mt-0.5">Meu perfil</h1>
      </div>

      {/* Card de identidade com editor de foto */}
      <div className="bg-card rounded-lg border border-border shadow-card p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <AvatarEditor fotoUrl={data?.fotoUrl ?? null} nome={usuario?.nome ?? ''} />
          <div className="text-center sm:text-left">
            <p className="text-lg font-semibold text-foreground">{usuario?.nome}</p>
            <p className="text-sm text-muted-foreground">{usuario?.email}</p>
            <span className="mt-1.5 inline-block text-xs px-2 py-0.5 rounded-sm bg-[rgba(139,92,246,0.1)] text-[var(--color-accent)] font-medium">
              Cuidador
            </span>
          </div>
        </div>
      </div>

      {/* Idosos vinculados */}
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
                    {initials(idoso.nome)}
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
          <LogOut className="size-4" /> Sair da conta
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
