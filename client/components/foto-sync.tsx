'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/lib/auth-store'
import { useMe } from '@/hooks/use-me'

export function FotoSync() {
  const { usuario, setFotoUrl } = useAuthStore()
  const { data } = useMe()

  useEffect(() => {
    if (usuario && data?.fotoUrl !== undefined) {
      setFotoUrl(data.fotoUrl)
    }
  }, [data?.fotoUrl, usuario, setFotoUrl])

  return null
}
