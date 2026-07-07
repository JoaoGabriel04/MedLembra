import { Router } from 'express'
import { authMiddleware, requireTipo } from '../middlewares/auth.middleware'
import { hoje, alertasIdoso } from '../controllers/idoso.controller'

export const idosoRoutes = Router()

idosoRoutes.get('/hoje', authMiddleware, hoje)
idosoRoutes.get('/alertas', authMiddleware, requireTipo('IDOSO'), alertasIdoso)
