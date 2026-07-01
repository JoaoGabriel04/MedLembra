import express from 'express'
import dotenv from 'dotenv'
import { authRoutes } from './routes/auth.routes'
import { errorHandler } from './middlewares/error.middleware'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3333

app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
