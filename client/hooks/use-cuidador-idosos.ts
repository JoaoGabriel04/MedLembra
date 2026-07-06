import useSWR, { mutate } from 'swr'
import { api } from '@/lib/api'
import { swrKeys } from '@/lib/swr-keys'
import type { CuidadorIdososResponse } from '@/types/api'

export function useCuidadorIdosos() {
  return useSWR<CuidadorIdososResponse>(swrKeys.cuidadorIdosos())
}

export async function vincularIdoso(email: string) {
  await api('/vinculos', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
  await Promise.all([
    mutate(swrKeys.cuidadorIdosos()),
    mutate(swrKeys.me()),
  ])
}
