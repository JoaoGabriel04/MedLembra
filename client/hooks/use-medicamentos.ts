import useSWR, { mutate } from 'swr'
import { api } from '@/lib/api'
import { swrKeys } from '@/lib/swr-keys'
import type {
  MedicamentosResponse,
  MedicamentoResponse,
  CriarMedicamentoInput,
  AtualizarMedicamentoInput,
} from '@/types/api'

export function useMedicamentos(idosoId: number) {
  return useSWR<MedicamentosResponse>(swrKeys.medicamentos(idosoId))
}

export function useMedicamento(id: number) {
  return useSWR<MedicamentoResponse>(swrKeys.medicamento(id))
}

async function invalidar(idosoId: number, id?: number) {
  await Promise.all([
    mutate(swrKeys.medicamentos(idosoId)),
    mutate(swrKeys.hoje(idosoId)),
    mutate(swrKeys.dashboard(idosoId)),
    ...(id ? [mutate(swrKeys.medicamento(id))] : []),
  ])
}

export async function criarMedicamento(idosoId: number, data: CriarMedicamentoInput) {
  const res = await api<MedicamentoResponse>('/medicamentos', {
    method: 'POST',
    body: JSON.stringify({ idosoId, ...data }),
  })
  await invalidar(idosoId)
  return res
}

export async function atualizarMedicamento(
  id: number,
  idosoId: number,
  data: AtualizarMedicamentoInput
) {
  const res = await api<MedicamentoResponse>(`/medicamentos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  await invalidar(idosoId, id)
  return res
}

export async function deletarMedicamento(id: number, idosoId: number) {
  await api(`/medicamentos/${id}`, { method: 'DELETE' })
  await invalidar(idosoId, id)
}
