import { AppError } from '../lib/errors'
import * as usuariosRepo from '../repositories/usuarios.repository'

export async function getMe(userId: number) {
  const usuario = await usuariosRepo.findById(userId)
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
