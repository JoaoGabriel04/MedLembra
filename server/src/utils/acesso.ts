import { AppError } from '../lib/errors'
import * as usuariosRepo from '../repositories/usuarios.repository'

export async function assertAccessToIdoso(
  userId: number,
  tipo: 'IDOSO' | 'CUIDADOR',
  idosoId: number
): Promise<void> {
  if (tipo === 'IDOSO') {
    if (userId !== idosoId) {
      throw new AppError(403, 'FORBIDDEN', 'Acesso negado')
    }
    return
  }
  const idoso = await usuariosRepo.findByIdParaAcesso(idosoId)
  if (!idoso) {
    throw new AppError(404, 'NOT_FOUND', 'Idoso não encontrado')
  }
  if (idoso.cuidadorId !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'Idoso não vinculado a você')
  }
}
