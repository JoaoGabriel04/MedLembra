import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { getHoje, getAlertasIdoso } from '../services/idoso.service'
import { zodErrorResponse } from '../lib/validation'

const hojeQuerySchema = z.object({
  idosoId: z.coerce.number().int().positive().optional()
})

export async function hoje(req: Request, res: Response, next: NextFunction): Promise<void> {
  const result = hojeQuerySchema.safeParse(req.query)
  if (!result.success) {
    res.status(400).json(zodErrorResponse(result.error))
    return
  }
  try {
    const data = await getHoje(req.user!.id, req.user!.tipo, result.data.idosoId)
    res.json(data)
  } catch (err) { next(err) }
}

export async function alertasIdoso(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await getAlertasIdoso(req.user!.id)
    res.json(data)
  } catch (err) { next(err) }
}
