import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware'
import { criar, listar } from '../controllers/registros.controller'

export const registrosRoutes = Router({ mergeParams: true })

registrosRoutes.post('/', authMiddleware, criar)
registrosRoutes.get('/', authMiddleware, listar)
