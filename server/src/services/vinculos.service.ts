import { AppError } from '../lib/errors'
import * as usuariosRepo from '../repositories/usuarios.repository'

export async function criarVinculo(
  userId: number,
  tipoUser: 'IDOSO' | 'CUIDADOR',
  email: string
): Promise<{ vinculo: { idosoId: number; cuidadorId: number } }> {
  const outro = await usuariosRepo.findByEmail(email)
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

  await usuariosRepo.setCuidador(idosoId, cuidadorId)

  return { vinculo: { idosoId, cuidadorId } }
}
