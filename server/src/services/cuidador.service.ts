import { prisma } from '../lib/prisma'

export async function listarIdosos(cuidadorId: number): Promise<{
  idosos: Array<{ id: number; nome: string; email: string }>
}> {
  const idosos = await prisma.usuario.findMany({
    where: { cuidadorId },
    select: { id: true, nome: true, email: true }
  })
  return { idosos }
}
