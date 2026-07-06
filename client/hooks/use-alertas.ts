import useSWR from 'swr'
import { swrKeys } from '@/lib/swr-keys'
import type { AlertasResponse } from '@/types/api'

export function useAlertas() {
  return useSWR<AlertasResponse>(swrKeys.alertas())
}
