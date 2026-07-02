import { prisma } from '../lib/prisma'
import { AppError } from '../lib/errors'
import { assertAccessToIdoso } from '../utils/acesso'
import { getInicio7DiasFortaleza } from '../utils/datas'
import { calcularAlertas, Alerta } from '../utils/alertas'

export async function getDashboard(cuidadorId: number, idosoId: number) {
  await assertAccessToIdoso(cuidadorId, 'CUIDADOR', idosoId)

  const idoso = await prisma.usuario.findUnique({
    where: { id: idosoId },
    select: { id: true, nome: true, email: true }
  })

  if (!idoso) {
    throw new AppError(404, 'NOT_FOUND', 'Idoso não encontrado')
  }

  const medicamentos = await prisma.medicamento.findMany({
    where: { idosoId },
    select: { id: true, nome: true, estoqueAtual: true, frequenciaDiaria: true, dataValidade: true }
  })

  const inicio7dias = getInicio7DiasFortaleza()

  const registros = await prisma.registroTomada.findMany({
    where: {
      medicamento: { idosoId },
      dataHora: { gte: inicio7dias }
    },
    select: { status: true }
  })

  const totalTomadas = registros.filter(r => r.status === 'TOMADO').length
  const totalPuladas = registros.filter(r => r.status === 'PULADO').length
  const totalDosesAgendadas = medicamentos.reduce((acc, m) => acc + m.frequenciaDiaria * 7, 0)
  const totalPendentes = Math.max(0, totalDosesAgendadas - totalTomadas - totalPuladas)
  const adesao = totalDosesAgendadas > 0
    ? Math.round((totalTomadas / totalDosesAgendadas) * 100) / 100
    : 0

  const alertas = calcularAlertas(medicamentos)

  return {
    idoso,
    resumo: {
      totalMedicamentos: medicamentos.length,
      adesao7dias: adesao,
      totalDosesAgendadas7dias: totalDosesAgendadas,
      totalTomadas7dias: totalTomadas,
      totalPuladas7dias: totalPuladas,
      totalPendentes7dias: totalPendentes
    },
    alertas
  }
}

export async function getAlertas(cuidadorId: number) {
  const idosos = await prisma.usuario.findMany({
    where: { cuidadorId },
    select: { id: true, nome: true }
  })

  const todasAlertas: Array<Alerta & { idosoId: number; idosoNome: string }> = []

  for (const idoso of idosos) {
    const medicamentos = await prisma.medicamento.findMany({
      where: { idosoId: idoso.id },
      select: { id: true, nome: true, estoqueAtual: true, frequenciaDiaria: true, dataValidade: true }
    })

    const alertas = calcularAlertas(medicamentos)
    for (const alerta of alertas) {
      todasAlertas.push({ idosoId: idoso.id, idosoNome: idoso.nome, ...alerta })
    }
  }

  return { alertas: todasAlertas }
}
