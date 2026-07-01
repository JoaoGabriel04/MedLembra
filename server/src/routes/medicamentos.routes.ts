import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware'
import { criar, listar, getUm, atualizar, deletar } from '../controllers/medicamentos.controller'

export const medicamentosRoutes = Router()

medicamentosRoutes.post('/', authMiddleware, criar)
medicamentosRoutes.get('/', authMiddleware, listar)
medicamentosRoutes.get('/:id', authMiddleware, getUm)
medicamentosRoutes.put('/:id', authMiddleware, atualizar)
medicamentosRoutes.delete('/:id', authMiddleware, deletar)
