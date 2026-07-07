import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { registerUser, loginUser } from '../services/auth.service'
import { verificarCodigo, reenviarCodigo } from '../services/verificacao-email.service'
import { zodErrorResponse } from '../lib/validation'

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

const verificarEmailSchema = z.object({
  email: z.string().email(),
  codigo: z.string().length(6, 'Código deve ter 6 dígitos').regex(/^\d{6}$/, 'Código deve conter apenas números')
})

const reenviarSchema = z.object({
  email: z.string().email()
})

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  const result = registerSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json(zodErrorResponse(result.error))
    return
  }
  try {
    const data = await registerUser(result.data)
    res.status(201).json(data)
  } catch (err) { next(err) }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  const result = loginSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json(zodErrorResponse(result.error))
    return
  }
  try {
    const data = await loginUser(result.data)
    res.status(200).json(data)
  } catch (err) { next(err) }
}

export async function verificarEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
  const result = verificarEmailSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json(zodErrorResponse(result.error))
    return
  }
  try {
    const data = await verificarCodigo(result.data.email, result.data.codigo)
    res.status(200).json(data)
  } catch (err) { next(err) }
}

export async function reenviar(req: Request, res: Response, next: NextFunction): Promise<void> {
  const result = reenviarSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json(zodErrorResponse(result.error))
    return
  }
  try {
    await reenviarCodigo(result.data.email)
    res.status(200).json({ message: 'Código reenviado com sucesso' })
  } catch (err) { next(err) }
}
