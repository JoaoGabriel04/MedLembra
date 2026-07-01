import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../lib/jwt'

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'Token ausente ou malformado' })
    return
  }

  const token = authHeader.slice(7)
  try {
    const payload = verifyToken(token)
    req.user = { id: payload.sub, tipo: payload.tipo }
    next()
  } catch {
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'Token inválido ou expirado' })
  }
}

export function requireTipo(tipo: 'IDOSO' | 'CUIDADOR') {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.tipo !== tipo) {
      res.status(403).json({
        error: 'FORBIDDEN',
        message: `Acesso restrito a ${tipo}`
      })
      return
    }
    next()
  }
}
