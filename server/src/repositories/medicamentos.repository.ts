import { prisma } from '../lib/prisma'

const includeHorarios = { horarios: true } as const

export interface UpdateMedicamentoData {
  nome?: string
  dosagem?: string
  frequenciaDiaria?: number
  estoqueAtual?: number
  dataValidade?: Date
}

export async function create(data: {
  idosoId: number
  nome: string
  dosagem: string
  frequenciaDiaria: number
  estoqueAtual: number
  dataValidade: Date
  horarios: { create: { hora: string }[] }
}) {
  return prisma.medicamento.create({ data, include: includeHorarios })
}

export async function findMany(idosoId: number) {
  return prisma.medicamento.findMany({ where: { idosoId }, include: includeHorarios })
}

export async function findById(id: number) {
  return prisma.medicamento.findUnique({ where: { id }, include: includeHorarios })
}

export async function findResumo(idosoId: number) {
  return prisma.medicamento.findMany({
    where: { idosoId },
    select: { id: true, nome: true, estoqueAtual: true, frequenciaDiaria: true, dataValidade: true }
  })
}

export async function findHojeComRegistros(idosoId: number, inicio: Date, fim: Date) {
  return prisma.medicamento.findMany({
    where: { idosoId },
    include: {
      horarios: {
        include: {
          registros: {
            where: { dataHora: { gte: inicio, lt: fim } },
            orderBy: { dataHora: 'desc' },
            take: 1
          }
        }
      }
    }
  })
}

export async function findEstoque(id: number) {
  return prisma.medicamento.findUnique({
    where: { id },
    select: { id: true, estoqueAtual: true }
  })
}

export async function updateComHorarios(
  id: number,
  data: UpdateMedicamentoData,
  novosHorarios?: string[]
) {
  return prisma.$transaction(async tx => {
    if (novosHorarios) {
      await tx.horario.deleteMany({ where: { medicamentoId: id } })
    }
    return tx.medicamento.update({
      where: { id },
      data: {
        ...data,
        ...(novosHorarios && {
          horarios: { create: novosHorarios.map(hora => ({ hora })) }
        })
      },
      include: includeHorarios
    })
  })
}

export async function remove(id: number) {
  await prisma.medicamento.delete({ where: { id } })
}
