import { Router } from 'express'
import { register, login, verificarEmail, reenviar } from '../controllers/auth.controller'

export const authRoutes = Router()

authRoutes.post('/register', register)
authRoutes.post('/login', login)
authRoutes.post('/verificar-email', verificarEmail)
authRoutes.post('/reenviar-codigo', reenviar)
