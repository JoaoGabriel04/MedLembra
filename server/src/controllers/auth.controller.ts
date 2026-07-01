import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { registerUser, loginUser } from '../services/auth.service'

const registerSchema = z.object({
  nome: z.string().min(1),
  email: z.string().email(),
  senha: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  tipo: z.enum(['IDOSO', 'CUIDADOR'])
})

const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(1)
})

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  const result = registerSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Dados inválidos',
      details: result.error.flatten()
    })
    return
  }

  try {
    const data = await registerUser(result.data)
    res.status(201).json(data)
  } catch (err) {
    next(err)
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  const result = loginSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Dados inválidos',
      details: result.error.flatten()
    })
    return
  }

  try {
    const data = await loginUser(result.data)
    res.status(200).json(data)
  } catch (err) {
    next(err)
  }
}
