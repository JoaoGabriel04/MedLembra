import { Request, Response, NextFunction } from 'express'
import { getHoje } from '../services/idoso.service'

export async function hoje(req: Request, res: Response, next: NextFunction): Promise<void> {
  const idosoId = req.query.idosoId ? Number(req.query.idosoId) : undefined
  try {
    const data = await getHoje(req.user!.id, req.user!.tipo, idosoId)
    res.json(data)
  } catch (err) { next(err) }
}
