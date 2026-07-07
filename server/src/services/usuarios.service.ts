import { AppError } from '../lib/errors'
import { uploadAvatar, deleteAvatar } from '../lib/cloudinary'
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
      fotoUrl: usuario.fotoUrl ?? null,
      cuidadorId: usuario.cuidadorId,
      cuidador: usuario.cuidador
        ? { ...usuario.cuidador, fotoUrl: usuario.cuidador.fotoUrl ?? null }
        : null,
    }
  }

  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    tipo: usuario.tipo,
    fotoUrl: usuario.fotoUrl ?? null,
    idosos: usuario.idosos.map((i) => ({ ...i, fotoUrl: i.fotoUrl ?? null })),
  }
}

export async function uploadFotoService(userId: number, buffer: Buffer): Promise<string> {
  try {
    const url = await uploadAvatar(buffer, userId)
    await usuariosRepo.updateFotoUrl(userId, url)
    return url
  } catch {
    throw new AppError(500, 'UPLOAD_FALHOU', 'Não foi possível salvar a foto')
  }
}

export async function removerFotoService(userId: number): Promise<void> {
  try {
    await deleteAvatar(userId)
  } catch {
    // ignora falha de deleção no Cloudinary (imagem pode não existir)
  }
  await usuariosRepo.updateFotoUrl(userId, null)
}
