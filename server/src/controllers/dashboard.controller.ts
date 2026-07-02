import { Request, Response, NextFunction } from 'express'
import { getDashboard, getAlertas } from '../services/dashboard.service'

export async function dashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  const idosoId = Number(req.params.idosoId)
  try {
    const data = await getDashboard(req.user!.id, idosoId)
    res.json(data)
  } catch (err) { next(err) }
}

export async function alertas(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await getAlertas(req.user!.id)
    res.json(data)
  } catch (err) { next(err) }
}
