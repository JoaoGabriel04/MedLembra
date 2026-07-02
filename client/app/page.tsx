'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth-store'

export default function HomePage() {
  const { token, usuario, hidratado } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!hidratado) return
    if (!token) {
      router.replace('/login')
      return
    }
    router.replace(usuario?.tipo === 'IDOSO' ? '/hoje' : '/idosos')
  }, [hidratado, token, usuario, router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
    </div>
  )
}
