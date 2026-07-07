import { mutate } from 'swr'
import { useAuthStore } from '@/lib/auth-store'
import { swrKeys } from '@/lib/swr-keys'
import { ApiError, BASE } from '@/lib/api'

export function useFotoPerfil() {
  const token = useAuthStore((s) => s.token)
  const setFotoUrl = useAuthStore((s) => s.setFotoUrl)

  async function uploadFoto(file: File): Promise<void> {
    const form = new FormData()
    form.append('foto', file)

    const res = await fetch(`${BASE}/usuarios/me/foto`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new ApiError(res.status, body.error ?? 'ERROR', body.message ?? 'Falha no upload')
    }

    const { fotoUrl } = await res.json() as { fotoUrl: string }
    setFotoUrl(fotoUrl)
    await mutate(swrKeys.me())
  }

  async function removerFoto(): Promise<void> {
    const res = await fetch(`${BASE}/usuarios/me/foto`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok && res.status !== 204) {
      const body = await res.json().catch(() => ({}))
      throw new ApiError(res.status, body.error ?? 'ERROR', body.message ?? 'Falha ao remover foto')
    }

    setFotoUrl(null)
    await mutate(swrKeys.me())
  }

  return { uploadFoto, removerFoto }
}
