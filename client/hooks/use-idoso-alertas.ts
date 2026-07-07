import useSWR from 'swr'
import { swrKeys } from '@/lib/swr-keys'
import type { IdosoAlertasResponse } from '@/types/api'

export function useIdosoAlertas() {
  return useSWR<IdosoAlertasResponse>(swrKeys.idosoAlertas())
}
