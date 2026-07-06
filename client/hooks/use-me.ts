import useSWR from 'swr'
import { swrKeys } from '@/lib/swr-keys'
import type { MeResponse } from '@/types/api'

export function useMe() {
  return useSWR<MeResponse>(swrKeys.me())
}
