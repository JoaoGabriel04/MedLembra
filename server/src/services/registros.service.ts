import { StatusTomada } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { AppError } from '../lib/errors'
import { assertAccessToIdoso } from '../utils/acesso'

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
  const medicamento = await prisma.medicamento.findUnique({ where: { id: medicamentoId } })
  if (!medicamento) {
    throw new AppError(404, 'NOT_FOUND', 'Medicamento não encontrado')
  }
  await assertAccessToIdoso(userId, tipo, medicamento.idosoId)

  const dataHora = input.dataHora ? new Date(input.dataHora) : new Date()

  if (input.status === 'TOMADO') {
    if (medicamento.estoqueAtual <= 0) {
      throw new AppError(409, 'ESTOQUE_ZERADO', 'Estoque insuficiente para registrar tomada')
    }

    const [registro, medAtualizado] = await prisma.$transaction([
      prisma.registroTomada.create({
        data: {
          medicamentoId,
          horarioId: input.horarioId ?? null,
          dataHora,
          status: 'TOMADO'
        }
      }),
      prisma.medicamento.update({
        where: { id: medicamentoId },
        data: { estoqueAtual: { decrement: 1 } },
        select: { id: true, estoqueAtual: true }
      })
    ])

    return {
      registro: {
        id: registro.id,
        medicamentoId: registro.medicamentoId,
        horarioId: registro.horarioId,
        dataHora: registro.dataHora.toISOString(),
        status: registro.status
      },
      medicamento: medAtualizado
    }
  }

  // status === 'PULADO'
  const registro = await prisma.registroTomada.create({
    data: {
      medicamentoId,
      horarioId: input.horarioId ?? null,
      dataHora,
      status: 'PULADO'
    }
  })

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
  const medicamento = await prisma.medicamento.findUnique({ where: { id: medicamentoId } })
  if (!medicamento) {
    throw new AppError(404, 'NOT_FOUND', 'Medicamento não encontrado')
  }
  await assertAccessToIdoso(userId, tipo, medicamento.idosoId)

  const where = {
    medicamentoId,
    ...(query.desde || query.ate ? {
      dataHora: {
        ...(query.desde && { gte: new Date(query.desde) }),
        ...(query.ate && { lte: new Date(query.ate) })
      }
    } : {})
  }

  const [registros, total] = await Promise.all([
    prisma.registroTomada.findMany({
      where,
      orderBy: { dataHora: 'desc' },
      take: query.limit,
      skip: query.offset,
      select: { id: true, horarioId: true, dataHora: true, status: true }
    }),
    prisma.registroTomada.count({ where })
  ])

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
