import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware'
import { hoje } from '../controllers/idoso.controller'

export const idosoRoutes = Router()

idosoRoutes.get('/hoje', authMiddleware, hoje)
