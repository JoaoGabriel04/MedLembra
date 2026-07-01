import { Request, Response, NextFunction } from 'express'
import { listarIdosos } from '../services/cuidador.service'

export async function getIdosos(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await listarIdosos(req.user!.id)
    res.json(data)
  } catch (err) {
    next(err)
  }
}
