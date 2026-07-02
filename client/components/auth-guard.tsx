'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth-store'
import type { TipoUsuario } from '@/types/api'

interface AuthGuardProps {
  children: React.ReactNode
  requireTipo?: TipoUsuario
}

export function AuthGuard({ children, requireTipo }: AuthGuardProps) {
  const { token, usuario, hidratado } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!hidratado) return
    if (!token) {
      router.replace('/login')
      return
    }
    if (requireTipo && usuario?.tipo !== requireTipo) {
      router.replace(usuario?.tipo === 'IDOSO' ? '/hoje' : '/idosos')
    }
  }, [hidratado, token, usuario, requireTipo, router])

  if (!hidratado) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!token) return null

  if (requireTipo && usuario?.tipo !== requireTipo) return null

  return <>{children}</>
}
