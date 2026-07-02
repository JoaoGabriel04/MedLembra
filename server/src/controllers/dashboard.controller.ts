import { Request, Response, NextFunction } from 'express'
import { getDashboard, getAlertas } from '../services/dashboard.service'
import { zodErrorResponse, zIntParam } from '../lib/validation'

export async function dashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  const paramResult = zIntParam.safeParse(req.params.idosoId)
  if (!paramResult.success) {
    res.status(400).json(zodErrorResponse(paramResult.error))
    return
  }
  try {
    const data = await getDashboard(req.user!.id, paramResult.data)
    res.json(data)
  } catch (err) { next(err) }
}

export async function alertas(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await getAlertas(req.user!.id)
    res.json(data)
  } catch (err) { next(err) }
}
