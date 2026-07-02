import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { criarRegistro, listarRegistros } from '../services/registros.service'

const criarRegistroSchema = z.object({
  status: z.enum(['TOMADO', 'PULADO']),
  horarioId: z.number().int().positive().optional(),
  dataHora: z.string().optional()
})

const listarQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(30),
  offset: z.coerce.number().int().min(0).default(0),
  desde: z.string().optional(),
  ate: z.string().optional()
})

export async function criar(req: Request, res: Response, next: NextFunction): Promise<void> {
  const medicamentoId = Number(req.params.id)
  const result = criarRegistroSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Dados inválidos', details: result.error.flatten() })
    return
  }
  try {
    const data = await criarRegistro(req.user!.id, req.user!.tipo, medicamentoId, result.data)
    res.status(201).json(data)
  } catch (err) { next(err) }
}

export async function listar(req: Request, res: Response, next: NextFunction): Promise<void> {
  const medicamentoId = Number(req.params.id)
  const result = listarQuerySchema.safeParse(req.query)
  if (!result.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Query inválida', details: result.error.flatten() })
    return
  }
  try {
    const data = await listarRegistros(req.user!.id, req.user!.tipo, medicamentoId, result.data)
    res.json(data)
  } catch (err) { next(err) }
}
