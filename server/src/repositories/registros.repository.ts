import { prisma } from '../lib/prisma'
import { AppError } from '../lib/errors'

export async function criarTomadoComDecremento(
  medicamentoId: number,
  data: { horarioId?: number | null; dataHora: Date }
) {
  return prisma.$transaction(async tx => {
    const upd = await tx.medicamento.updateMany({
      where: { id: medicamentoId, estoqueAtual: { gt: 0 } },
      data: { estoqueAtual: { decrement: 1 } }
    })
    if (upd.count === 0) {
      throw new AppError(409, 'ESTOQUE_ZERADO', 'Estoque insuficiente para registrar tomada')
    }
    return tx.registroTomada.create({
      data: {
        medicamentoId,
        horarioId: data.horarioId ?? null,
        dataHora: data.dataHora,
        status: 'TOMADO'
      }
    })
  })
}

export async function criarPulado(
  medicamentoId: number,
  data: { horarioId?: number | null; dataHora: Date }
) {
  return prisma.registroTomada.create({
    data: {
      medicamentoId,
      horarioId: data.horarioId ?? null,
      dataHora: data.dataHora,
      status: 'PULADO'
    }
  })
}

export async function findMany(
  medicamentoId: number,
  query: { limit: number; offset: number; desde?: string; ate?: string }
) {
  const where = {
    medicamentoId,
    ...((query.desde || query.ate) ? {
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

  return { registros, total }
}

export async function findStatusSince(idosoId: number, since: Date) {
  return prisma.registroTomada.findMany({
    where: {
      medicamento: { idosoId },
      dataHora: { gte: since }
    },
    select: { status: true }
  })
}
