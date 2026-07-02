import * as usuariosRepo from '../repositories/usuarios.repository'

export async function listarIdosos(cuidadorId: number): Promise<{
  idosos: Array<{ id: number; nome: string; email: string }>
}> {
  const idosos = await usuariosRepo.findIdososByCuidadorId(cuidadorId)
  return { idosos }
}
