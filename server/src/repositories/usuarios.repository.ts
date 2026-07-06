import { TipoUsuario } from '@prisma/client'
import { prisma } from '../lib/prisma'

export async function findByEmail(email: string) {
  return prisma.usuario.findUnique({ where: { email } })
}

export async function findById(id: number) {
  return prisma.usuario.findUnique({
    where: { id },
    include: {
      cuidador: { select: { id: true, nome: true, email: true } },
      idosos: { select: { id: true, nome: true, email: true } }
    }
  })
}

export async function findByIdParaAcesso(id: number) {
  return prisma.usuario.findUnique({
    where: { id },
    select: { id: true, cuidadorId: true }
  })
}

export async function findByIdSelect(id: number) {
  return prisma.usuario.findUnique({
    where: { id },
    select: { id: true, nome: true, email: true }
  })
}

export async function create(data: { nome: string; email: string; senhaHash: string; tipo: TipoUsuario }) {
  return prisma.usuario.create({ data })
}

export async function findIdososByCuidadorId(cuidadorId: number) {
  return prisma.usuario.findMany({
    where: { cuidadorId },
    select: { id: true, nome: true, email: true }
  })
}

export async function findIdososNomeByCuidadorId(cuidadorId: number) {
  return prisma.usuario.findMany({
    where: { cuidadorId },
    select: { id: true, nome: true }
  })
}

export async function setCuidador(idosoId: number, cuidadorId: number) {
  return prisma.usuario.update({
    where: { id: idosoId },
    data: { cuidadorId }
  })
}
