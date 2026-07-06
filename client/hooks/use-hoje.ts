import useSWR, { mutate } from 'swr'
import { api } from '@/lib/api'
import { swrKeys } from '@/lib/swr-keys'
import type { HojeResponse, StatusTomada } from '@/types/api'

export function useHoje(idosoId?: number) {
  return useSWR<HojeResponse>(swrKeys.hoje(idosoId))
}

function aplicarStatusOtimista(
  atual: HojeResponse,
  medicamentoId: number,
  horarioId: number,
  status: StatusTomada
): HojeResponse {
  return {
    ...atual,
    medicamentos: atual.medicamentos.map((med) =>
      med.id !== medicamentoId
        ? med
        : {
            ...med,
            horarios: med.horarios.map((h) =>
              h.horarioId !== horarioId
                ? h
                : { ...h, status, registradoEm: new Date().toISOString() }
            ),
          }
    ),
  }
}

export async function marcarTomada(
  medicamentoId: number,
  horarioId: number,
  status: StatusTomada,
  idosoId?: number
) {
  const key = swrKeys.hoje(idosoId)
  await mutate(
    key,
    async () => {
      await api(`/medicamentos/${medicamentoId}/registros`, {
        method: 'POST',
        body: JSON.stringify({ status, horarioId }),
      })
      return undefined
    },
    {
      optimisticData: (atual: HojeResponse | undefined) =>
        atual ? aplicarStatusOtimista(atual, medicamentoId, horarioId, status) : atual!,
      rollbackOnError: true,
      revalidate: true,
    }
  )
  if (idosoId) {
    await mutate(swrKeys.dashboard(idosoId))
  }
}
