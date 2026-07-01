import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { criarVinculo } from '../services/vinculos.service'

const vinculoSchema = z.object({
  email: z.string().email()
})

export async function criar(req: Request, res: Response, next: NextFunction): Promise<void> {
  const result = vinculoSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Dados inválidos',
      details: result.error.flatten()
    })
    return
  }

  try {
    const data = await criarVinculo(req.user!.id, req.user!.tipo, result.data.email)
    res.json(data)
  } catch (err) {
    next(err)
  }
}
