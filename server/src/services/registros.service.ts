import { StatusTomada } from '@prisma/client'
import { AppError } from '../lib/errors'
import { assertAccessToIdoso } from '../utils/acesso'
import * as medicamentosRepo from '../repositories/medicamentos.repository'
import * as registrosRepo from '../repositories/registros.repository'

interface CriarRegistroInput {
  status: StatusTomada
  horarioId?: number
  dataHora?: string
}

interface ListarRegistrosQuery {
  limit: number
  offset: number
  desde?: string
  ate?: string
}

export async function criarRegistro(
  userId: number,
  tipo: 'IDOSO' | 'CUIDADOR',
  medicamentoId: number,
  input: CriarRegistroInput
) {
  const medicamento = await medicamentosRepo.findById(medicamentoId)
  if (!medicamento) {
    throw new AppError(404, 'NOT_FOUND', 'Medicamento não encontrado')
  }
  await assertAccessToIdoso(userId, tipo, medicamento.idosoId)

  const dataHora = input.dataHora ? new Date(input.dataHora) : new Date()
  const registroData = { horarioId: input.horarioId ?? null, dataHora }

  if (input.status === 'TOMADO') {
    const registro = await registrosRepo.criarTomadoComDecremento(medicamentoId, registroData)
    const medAtualizado = await medicamentosRepo.findEstoque(medicamentoId)

    return {
      registro: {
        id: registro.id,
        medicamentoId: registro.medicamentoId,
        horarioId: registro.horarioId,
        dataHora: registro.dataHora.toISOString(),
        status: registro.status
      },
      medicamento: medAtualizado!
    }
  }

  const registro = await registrosRepo.criarPulado(medicamentoId, registroData)

  return {
    registro: {
      id: registro.id,
      medicamentoId: registro.medicamentoId,
      horarioId: registro.horarioId,
      dataHora: registro.dataHora.toISOString(),
      status: registro.status
    },
    medicamento: { id: medicamento.id, estoqueAtual: medicamento.estoqueAtual }
  }
}

export async function listarRegistros(
  userId: number,
  tipo: 'IDOSO' | 'CUIDADOR',
  medicamentoId: number,
  query: ListarRegistrosQuery
) {
  const medicamento = await medicamentosRepo.findById(medicamentoId)
  if (!medicamento) {
    throw new AppError(404, 'NOT_FOUND', 'Medicamento não encontrado')
  }
  await assertAccessToIdoso(userId, tipo, medicamento.idosoId)

  const { registros, total } = await registrosRepo.findMany(medicamentoId, query)

  return {
    registros: registros.map(r => ({
      id: r.id,
      horarioId: r.horarioId,
      dataHora: r.dataHora.toISOString(),
      status: r.status
    })),
    total
  }
}
