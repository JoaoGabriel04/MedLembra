import { Request, Response, NextFunction } from 'express'
import { AppError } from '../lib/errors'

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    const body: Record<string, unknown> = {
      error: err.code,
      message: err.message
    }
    if (err.details !== undefined) body.details = err.details
    res.status(err.status).json(body)
    return
  }

  console.error(err)
  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: 'Erro inesperado'
  })
}
