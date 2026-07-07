import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { authRoutes } from './routes/auth.routes'
import { usuariosRoutes } from './routes/usuarios.routes'
import { vinculosRoutes } from './routes/vinculos.routes'
import { cuidadorRoutes } from './routes/cuidador.routes'
import { medicamentosRoutes } from './routes/medicamentos.routes'
import { registrosRoutes } from './routes/registros.routes'
import { idosoRoutes } from './routes/idoso.routes'
import { errorHandler } from './middlewares/error.middleware'
import { seedMedicamentosSeVazio } from './lib/seed-medicamentos'

dotenv.config()

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET obrigatório no .env')
  process.exit(1)
}

const app = express()
const PORT = process.env.PORT || 3333
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000'

app.set('trust proxy', 1)

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'RATE_LIMIT_EXCEEDED', message: 'Muitas requisições. Tente novamente em alguns minutos.' }
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'RATE_LIMIT_EXCEEDED', message: 'Muitas tentativas. Tente novamente em 15 minutos.' }
})

app.use(helmet())
app.use(cors({
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(globalLimiter)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/usuarios', usuariosRoutes)
app.use('/api/vinculos', vinculosRoutes)
app.use('/api/cuidador', cuidadorRoutes)
app.use('/api/medicamentos', medicamentosRoutes)
app.use('/api/medicamentos/:id/registros', registrosRoutes)
app.use('/api/idoso', idosoRoutes)

app.use((_req, res) => {
  res.status(404).json({ error: 'NOT_FOUND', message: 'Rota não encontrada' })
})

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  void seedMedicamentosSeVazio().catch(err =>
    console.error('[seed] Falha ao popular medicamentos_referencia:', err)
  )
})
