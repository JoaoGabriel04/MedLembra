import { prisma } from '../lib/prisma'

export async function criar(usuarioId: number, codigo: string, expiraEm: Date) {
  return prisma.codigoVerificacao.create({ data: { usuarioId, codigo, expiraEm } })
}

export async function findValido(usuarioId: number, codigo: string) {
  return prisma.codigoVerificacao.findFirst({
    where: {
      usuarioId,
      codigo,
      usadoEm: null,
      expiraEm: { gt: new Date() }
    }
  })
}

export async function marcarUsado(id: number) {
  await prisma.codigoVerificacao.update({ where: { id }, data: { usadoEm: new Date() } })
}

export async function deletarPorUsuario(usuarioId: number) {
  await prisma.codigoVerificacao.deleteMany({ where: { usuarioId } })
}
