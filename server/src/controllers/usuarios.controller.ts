import { Request, Response, NextFunction } from 'express'
import { getMe, uploadFotoService, removerFotoService } from '../services/usuarios.service'

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await getMe(req.user!.id)
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export async function uploadFoto(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'ARQUIVO_AUSENTE', message: 'Nenhum arquivo enviado' })
      return
    }
    const fotoUrl = await uploadFotoService(req.user!.id, req.file.buffer)
    res.json({ fotoUrl })
  } catch (err) {
    next(err)
  }
}

export async function removerFoto(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await removerFotoService(req.user!.id)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
