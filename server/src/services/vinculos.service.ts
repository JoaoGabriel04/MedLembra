import { prisma } from '../lib/prisma'
import { AppError } from '../lib/errors'

export async function criarVinculo(
  userId: number,
  tipoUser: 'IDOSO' | 'CUIDADOR',
  email: string
): Promise<{ vinculo: { idosoId: number; cuidadorId: number } }> {
  const outro = await prisma.usuario.findUnique({ where: { email } })
  if (!outro) {
    throw new AppError(404, 'NOT_FOUND', 'Usuário não encontrado com esse email')
  }

  if (outro.id === userId) {
    throw new AppError(409, 'AUTO_VINCULO', 'Não é possível se vincular a si mesmo')
  }

  if (tipoUser === 'CUIDADOR' && outro.tipo !== 'IDOSO') {
    throw new AppError(400, 'TIPO_INCOMPATIVEL', 'O email deve pertencer a um IDOSO')
  }

  if (tipoUser === 'IDOSO' && outro.tipo !== 'CUIDADOR') {
    throw new AppError(400, 'TIPO_INCOMPATIVEL', 'O email deve pertencer a um CUIDADOR')
  }

  const idosoId = tipoUser === 'IDOSO' ? userId : outro.id
  const cuidadorId = tipoUser === 'CUIDADOR' ? userId : outro.id

  await prisma.usuario.update({
    where: { id: idosoId },
    data: { cuidadorId }
  })

  return { vinculo: { idosoId, cuidadorId } }
}
