import { Router } from 'express'
import { authMiddleware, requireTipo } from '../middlewares/auth.middleware'
import { getIdosos } from '../controllers/cuidador.controller'

export const cuidadorRoutes = Router()

cuidadorRoutes.get('/idosos', authMiddleware, requireTipo('CUIDADOR'), getIdosos)
