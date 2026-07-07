'use client'

import { useRef, useState } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useFotoPerfil } from '@/hooks/use-foto-perfil'

interface AvatarUploadProps {
  fotoUrl?: string | null
  nome: string
  size?: 'sm' | 'lg'
  editavel?: boolean
}

function initials(nome: string): string {
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

export function AvatarUpload({ fotoUrl, nome, size = 'lg', editavel = false }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const { uploadFoto, removerFoto } = useFotoPerfil()

  const sizeClass = size === 'sm' ? 'size-9' : 'size-16'
  const textClass = size === 'sm' ? 'text-xs font-semibold' : 'text-xl font-bold'

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setUploading(true)
    try {
      await uploadFoto(file)
      toast.success('Foto atualizada')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível salvar a foto')
    } finally {
      setUploading(false)
    }
  }

  async function handleRemover(e: React.MouseEvent) {
    e.stopPropagation()
    setUploading(true)
    try {
      await removerFoto()
      toast.success('Foto removida')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível remover a foto')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="relative shrink-0 inline-flex flex-col items-center gap-2">
      <button
        type="button"
        disabled={!editavel || uploading}
        onClick={() => editavel && inputRef.current?.click()}
        className={[
          sizeClass,
          'rounded-full overflow-hidden bg-primary flex items-center justify-center',
          editavel ? 'cursor-pointer hover:opacity-80 transition-opacity' : 'cursor-default',
        ].join(' ')}
        aria-label={editavel ? 'Alterar foto de perfil' : undefined}
      >
        {uploading ? (
          <Loader2 className="size-4 animate-spin text-white" />
        ) : fotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={fotoUrl} alt={nome} className="w-full h-full object-cover" />
        ) : (
          <span className={`${textClass} text-white`}>{initials(nome)}</span>
        )}
      </button>

      {editavel && fotoUrl && !uploading && (
        <button
          type="button"
          onClick={handleRemover}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="size-3" />
          Remover foto
        </button>
      )}

      {editavel && (
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      )}
    </div>
  )
}
