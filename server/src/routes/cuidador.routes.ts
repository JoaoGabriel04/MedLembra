import { Router } from 'express'
import { authMiddleware, requireTipo } from '../middlewares/auth.middleware'
import { getIdosos } from '../controllers/cuidador.controller'
import { dashboard, alertas } from '../controllers/dashboard.controller'

export const cuidadorRoutes = Router()

cuidadorRoutes.get('/idosos', authMiddleware, requireTipo('CUIDADOR'), getIdosos)
cuidadorRoutes.get('/dashboard/:idosoId', authMiddleware, requireTipo('CUIDADOR'), dashboard)
cuidadorRoutes.get('/alertas', authMiddleware, requireTipo('CUIDADOR'), alertas)
