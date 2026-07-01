import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware'
import { me } from '../controllers/usuarios.controller'

export const usuariosRoutes = Router()

usuariosRoutes.get('/me', authMiddleware, me)
