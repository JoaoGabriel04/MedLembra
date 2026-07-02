import { Medicamento, Horario } from '@prisma/client'
import { AppError } from '../lib/errors'
import { assertAccessToIdoso } from '../utils/acesso'
import * as medicamentosRepo from '../repositories/medicamentos.repository'

type MedicamentoComHorarios = Medicamento & { horarios: Horario[] }

function formatMedicamento(med: MedicamentoComHorarios) {
  return {
    id: med.id,
    idosoId: med.idosoId,
    nome: med.nome,
    dosagem: med.dosagem,
    frequenciaDiaria: med.frequenciaDiaria,
    estoqueAtual: med.estoqueAtual,
    dataValidade: med.dataValidade.toISOString().slice(0, 10),
    horarios: med.horarios.map(h => ({ id: h.id, hora: h.hora })),
    criadoEm: med.criadoEm.toISOString(),
    atualizadoEm: med.atualizadoEm.toISOString()
  }
}

interface CriarMedicamentoInput {
  idosoId: number
  nome: string
  dosagem: string
  frequenciaDiaria: number
  estoqueAtual: number
  dataValidade: string
  horarios: string[]
}

interface AtualizarMedicamentoInput {
  nome?: string
  dosagem?: string
  frequenciaDiaria?: number
  estoqueAtual?: number
  dataValidade?: string
  horarios?: string[]
}

export async function criarMedicamento(
  userId: number,
  tipo: 'IDOSO' | 'CUIDADOR',
  input: CriarMedicamentoInput
) {
  await assertAccessToIdoso(userId, tipo, input.idosoId)

  const medicamento = await medicamentosRepo.create({
    idosoId: input.idosoId,
    nome: input.nome,
    dosagem: input.dosagem,
    frequenciaDiaria: input.frequenciaDiaria,
    estoqueAtual: input.estoqueAtual,
    dataValidade: new Date(input.dataValidade),
    horarios: { create: input.horarios.map(hora => ({ hora })) }
  })

  return formatMedicamento(medicamento)
}

export async function listarMedicamentos(
  userId: number,
  tipo: 'IDOSO' | 'CUIDADOR',
  idosoIdQuery?: number
) {
  const idosoId = tipo === 'IDOSO' ? userId : idosoIdQuery
  if (tipo === 'CUIDADOR' && !idosoId) {
    throw new AppError(400, 'IDOSO_ID_OBRIGATORIO', 'idosoId é obrigatório para CUIDADOR')
  }
  await assertAccessToIdoso(userId, tipo, idosoId!)

  const medicamentos = await medicamentosRepo.findMany(idosoId!)
  return { medicamentos: medicamentos.map(formatMedicamento) }
}

export async function getMedicamento(
  userId: number,
  tipo: 'IDOSO' | 'CUIDADOR',
  id: number
) {
  const medicamento = await medicamentosRepo.findById(id)
  if (!medicamento) {
    throw new AppError(404, 'NOT_FOUND', 'Medicamento não encontrado')
  }
  await assertAccessToIdoso(userId, tipo, medicamento.idosoId)

  return formatMedicamento(medicamento)
}

export async function atualizarMedicamento(
  userId: number,
  tipo: 'IDOSO' | 'CUIDADOR',
  id: number,
  input: AtualizarMedicamentoInput
) {
  const existing = await medicamentosRepo.findById(id)
  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', 'Medicamento não encontrado')
  }
  await assertAccessToIdoso(userId, tipo, existing.idosoId)

  const novaFrequencia = input.horarios
    ? (input.frequenciaDiaria ?? input.horarios.length)
    : input.frequenciaDiaria

  const updateData: medicamentosRepo.UpdateMedicamentoData = {
    ...(input.nome !== undefined && { nome: input.nome }),
    ...(input.dosagem !== undefined && { dosagem: input.dosagem }),
    ...(novaFrequencia !== undefined && { frequenciaDiaria: novaFrequencia }),
    ...(input.estoqueAtual !== undefined && { estoqueAtual: input.estoqueAtual }),
    ...(input.dataValidade !== undefined && { dataValidade: new Date(input.dataValidade) })
  }

  const medicamento = await medicamentosRepo.updateComHorarios(id, updateData, input.horarios)
  return formatMedicamento(medicamento)
}

export async function deletarMedicamento(
  userId: number,
  tipo: 'IDOSO' | 'CUIDADOR',
  id: number
): Promise<void> {
  const existing = await medicamentosRepo.findById(id)
  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', 'Medicamento não encontrado')
  }
  await assertAccessToIdoso(userId, tipo, existing.idosoId)
  await medicamentosRepo.remove(id)
}
