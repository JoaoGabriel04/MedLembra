import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware'
import { criar, listar, getUm, atualizar, deletar, buscaExterna } from '../controllers/medicamentos.controller'

export const medicamentosRoutes = Router()

medicamentosRoutes.post('/', authMiddleware, criar)
medicamentosRoutes.get('/', authMiddleware, listar)
medicamentosRoutes.get('/busca-externa', authMiddleware, buscaExterna)
medicamentosRoutes.get('/:id', authMiddleware, getUm)
medicamentosRoutes.put('/:id', authMiddleware, atualizar)
medicamentosRoutes.delete('/:id', authMiddleware, deletar)
