import { Request, Response, NextFunction } from 'express'
import { getMe } from '../services/usuarios.service'

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await getMe(req.user!.id)
    res.json(data)
  } catch (err) {
    next(err)
  }
}
