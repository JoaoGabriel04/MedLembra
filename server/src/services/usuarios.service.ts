import { prisma } from '../lib/prisma'
import { AppError } from '../lib/errors'

export async function getMe(userId: number) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: userId },
    include: {
      cuidador: { select: { id: true, nome: true, email: true } },
      idosos: { select: { id: true, nome: true, email: true } }
    }
  })

  if (!usuario) {
    throw new AppError(404, 'NOT_FOUND', 'Usuário não encontrado')
  }

  if (usuario.tipo === 'IDOSO') {
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo,
      cuidadorId: usuario.cuidadorId,
      cuidador: usuario.cuidador
    }
  }

  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    tipo: usuario.tipo,
    idosos: usuario.idosos
  }
}
