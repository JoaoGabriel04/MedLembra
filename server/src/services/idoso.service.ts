import { prisma } from '../lib/prisma'
import { AppError } from '../lib/errors'
import { assertAccessToIdoso } from '../utils/acesso'
import { getHojeFortaleza } from '../utils/datas'

export async function getHoje(
  userId: number,
  tipo: 'IDOSO' | 'CUIDADOR',
  idosoIdQuery?: number
) {
  const idosoId = tipo === 'IDOSO' ? userId : idosoIdQuery
  if (tipo === 'CUIDADOR' && !idosoId) {
    throw new AppError(400, 'IDOSO_ID_OBRIGATORIO', 'idosoId é obrigatório para CUIDADOR')
  }
  await assertAccessToIdoso(userId, tipo, idosoId!)

  const { inicio, fim, dataStr } = getHojeFortaleza()

  const medicamentos = await prisma.medicamento.findMany({
    where: { idosoId },
    include: {
      horarios: {
        include: {
          registros: {
            where: { dataHora: { gte: inicio, lt: fim } },
            orderBy: { dataHora: 'desc' },
            take: 1
          }
        }
      }
    }
  })

  return {
    data: dataStr,
    medicamentos: medicamentos.map(med => ({
      id: med.id,
      nome: med.nome,
      dosagem: med.dosagem,
      estoqueAtual: med.estoqueAtual,
      horarios: med.horarios.map(h => {
        const registro = h.registros[0]
        return {
          horarioId: h.id,
          hora: h.hora,
          status: registro?.status ?? 'PENDENTE',
          registroId: registro?.id ?? null,
          registradoEm: registro?.dataHora.toISOString() ?? null
        }
      })
    }))
  }
}
