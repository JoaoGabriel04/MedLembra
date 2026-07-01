import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware'
import { criar } from '../controllers/vinculos.controller'

export const vinculosRoutes = Router()

vinculosRoutes.post('/', authMiddleware, criar)
