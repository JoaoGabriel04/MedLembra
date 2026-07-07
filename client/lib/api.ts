import { useAuthStore } from '@/lib/auth-store'

export const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api'

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public campos?: Record<string, string[]>
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = useAuthStore.getState().token

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init?.headers as Record<string, string> ?? {}),
  }

  const res = await fetch(`${BASE}${path}`, { ...init, headers })

  if (res.status === 401) {
    if (token) {
      useAuthStore.getState().logout()
      if (typeof window !== 'undefined') {
        window.location.replace('/login')
      }
      throw new ApiError(401, 'UNAUTHORIZED', 'Sessão expirada')
    }
    const body = await res.json().catch(() => ({}))
    throw new ApiError(401, body.error ?? 'UNAUTHORIZED', body.message ?? 'Credenciais inválidas')
  }

  if (res.status === 204) {
    return undefined as T
  }

  const body = await res.json()

  if (!res.ok) {
    throw new ApiError(
      res.status,
      body.error ?? 'ERROR',
      body.message ?? 'Não foi possível concluir a ação',
      body.campos
    )
  }

  return body as T
}
