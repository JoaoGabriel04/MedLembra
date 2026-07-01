import express from 'express'
import dotenv from 'dotenv'
import { authRoutes } from './routes/auth.routes'
import { usuariosRoutes } from './routes/usuarios.routes'
import { vinculosRoutes } from './routes/vinculos.routes'
import { cuidadorRoutes } from './routes/cuidador.routes'
import { medicamentosRoutes } from './routes/medicamentos.routes'
import { errorHandler } from './middlewares/error.middleware'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3333

app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/usuarios', usuariosRoutes)
app.use('/api/vinculos', vinculosRoutes)
app.use('/api/cuidador', cuidadorRoutes)
app.use('/api/medicamentos', medicamentosRoutes)

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
