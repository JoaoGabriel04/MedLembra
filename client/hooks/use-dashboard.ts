import useSWR from 'swr'
import { swrKeys } from '@/lib/swr-keys'
import type { DashboardResponse } from '@/types/api'

export function useDashboard(idosoId: number) {
  return useSWR<DashboardResponse>(swrKeys.dashboard(idosoId))
}
