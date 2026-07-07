import { TipoAlerta } from '@prisma/client'
import { prisma } from '../lib/prisma'

export async function findOne(medicamentoId: number, tipo: TipoAlerta) {
  return prisma.alertaNotificado.findFirst({
    where: { medicamentoId, tipo }
  })
}

export async function create(medicamentoId: number, tipo: TipoAlerta) {
  return prisma.alertaNotificado.create({
    data: { medicamentoId, tipo }
  })
}

export async function deleteByMedicamento(medicamentoId: number): Promise<void> {
  await prisma.alertaNotificado.deleteMany({
    where: { medicamentoId }
  })
}
