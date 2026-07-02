import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import {
  criarMedicamento,
  listarMedicamentos,
  getMedicamento,
  atualizarMedicamento,
  deletarMedicamento
} from '../services/medicamentos.service'
import { zodErrorResponse, zIntParam } from '../lib/validation'

const horarioRegex = /^\d{2}:\d{2}$/

const criarSchema = z.object({
  idosoId: z.number().int().positive(),
  nome: z.string().min(1),
  dosagem: z.string().min(1),
  frequenciaDiaria: z.number().int().positive(),
  estoqueAtual: z.number().int().min(0),
  dataValidade: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'formato YYYY-MM-DD'),
  horarios: z.array(z.string().regex(horarioRegex, 'formato HH:mm')).min(1)
}).refine(d => d.horarios.length === d.frequenciaDiaria, {
  message: 'horarios.length deve ser igual a frequenciaDiaria'
}).refine(d => new Set(d.horarios).size === d.horarios.length, {
  message: 'horarios não pode ter duplicatas',
  path: ['horarios']
})

const atualizarSchema = z.object({
  nome: z.string().min(1).optional(),
  dosagem: z.string().min(1).optional(),
  frequenciaDiaria: z.number().int().positive().optional(),
  estoqueAtual: z.number().int().min(0).optional(),
  dataValidade: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  horarios: z.array(z.string().regex(horarioRegex)).min(1).optional()
}).refine(d => {
  if (d.horarios && d.frequenciaDiaria) {
    return d.horarios.length === d.frequenciaDiaria
  }
  return true
}, { message: 'horarios.length deve ser igual a frequenciaDiaria' })
.refine(d => {
  if (d.frequenciaDiaria !== undefined && !d.horarios) {
    return false
  }
  return true
}, { message: 'ao alterar frequenciaDiaria, horarios deve ser fornecido' })
.refine(d => !d.horarios || new Set(d.horarios).size === d.horarios.length, {
  message: 'horarios não pode ter duplicatas',
  path: ['horarios']
})

export async function criar(req: Request, res: Response, next: NextFunction): Promise<void> {
  const result = criarSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json(zodErrorResponse(result.error))
    return
  }
  try {
    const data = await criarMedicamento(req.user!.id, req.user!.tipo, result.data)
    res.status(201).json(data)
  } catch (err) { next(err) }
}

export async function listar(req: Request, res: Response, next: NextFunction): Promise<void> {
  const idosoId = req.query.idosoId ? Number(req.query.idosoId) : undefined
  try {
    const data = await listarMedicamentos(req.user!.id, req.user!.tipo, idosoId)
    res.json(data)
  } catch (err) { next(err) }
}

export async function getUm(req: Request, res: Response, next: NextFunction): Promise<void> {
  const paramResult = zIntParam.safeParse(req.params.id)
  if (!paramResult.success) {
    res.status(400).json(zodErrorResponse(paramResult.error))
    return
  }
  try {
    const data = await getMedicamento(req.user!.id, req.user!.tipo, paramResult.data)
    res.json(data)
  } catch (err) { next(err) }
}

export async function atualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
  const paramResult = zIntParam.safeParse(req.params.id)
  if (!paramResult.success) {
    res.status(400).json(zodErrorResponse(paramResult.error))
    return
  }
  const result = atualizarSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json(zodErrorResponse(result.error))
    return
  }
  try {
    const data = await atualizarMedicamento(req.user!.id, req.user!.tipo, paramResult.data, result.data)
    res.json(data)
  } catch (err) { next(err) }
}

export async function deletar(req: Request, res: Response, next: NextFunction): Promise<void> {
  const paramResult = zIntParam.safeParse(req.params.id)
  if (!paramResult.success) {
    res.status(400).json(zodErrorResponse(paramResult.error))
    return
  }
  try {
    await deletarMedicamento(req.user!.id, req.user!.tipo, paramResult.data)
    res.status(204).send()
  } catch (err) { next(err) }
}
