'use client'

import { useEffect } from 'react'
import useSWR from 'swr'
import { useAuthStore } from '@/lib/auth-store'
import { api } from '@/lib/api'
import { swrKeys } from '@/lib/swr-keys'
import type { MeResponse } from '@/types/api'

export function FotoSync() {
  const { usuario, setFotoUrl } = useAuthStore()
  const { data } = useSWR<MeResponse>(
    usuario ? swrKeys.me() : null,
    (key: string) => api<MeResponse>(key)
  )

  useEffect(() => {
    if (data?.fotoUrl !== undefined) {
      setFotoUrl(data.fotoUrl)
    }
  }, [data?.fotoUrl, setFotoUrl])

  return null
}
