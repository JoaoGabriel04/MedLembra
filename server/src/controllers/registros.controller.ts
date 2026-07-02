import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { criarRegistro, listarRegistros } from '../services/registros.service'
import { zodErrorResponse, zIntParam } from '../lib/validation'

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
  const paramResult = zIntParam.safeParse(req.params.id)
  if (!paramResult.success) {
    res.status(400).json(zodErrorResponse(paramResult.error))
    return
  }
  const result = criarRegistroSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json(zodErrorResponse(result.error))
    return
  }
  try {
    const data = await criarRegistro(req.user!.id, req.user!.tipo, paramResult.data, result.data)
    res.status(201).json(data)
  } catch (err) { next(err) }
}

export async function listar(req: Request, res: Response, next: NextFunction): Promise<void> {
  const paramResult = zIntParam.safeParse(req.params.id)
  if (!paramResult.success) {
    res.status(400).json(zodErrorResponse(paramResult.error))
    return
  }
  const result = listarQuerySchema.safeParse(req.query)
  if (!result.success) {
    res.status(400).json(zodErrorResponse(result.error))
    return
  }
  try {
    const data = await listarRegistros(req.user!.id, req.user!.tipo, paramResult.data, result.data)
    res.json(data)
  } catch (err) { next(err) }
}
