import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware'
import { uploadFotoMiddleware } from '../middlewares/multer.middleware'
import { me, uploadFoto, removerFoto } from '../controllers/usuarios.controller'

export const usuariosRoutes = Router()

usuariosRoutes.get('/me', authMiddleware, me)
usuariosRoutes.put('/me/foto', authMiddleware, uploadFotoMiddleware, uploadFoto)
usuariosRoutes.delete('/me/foto', authMiddleware, removerFoto)
