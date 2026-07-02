# Fase 1 — Task 4: Auth — Register + Login

## Contexto

Backend MedLembra. Tasks 1-3 prontas: schema Prisma, lib (prisma/jwt/bcrypt/AppError), middlewares.
- Pasta do servidor: `C:\Projetos\Aulas Ericson\MedLembra\server\`
- Commits da raiz: `C:\Projetos\Aulas Ericson\MedLembra\`
- `src/lib/prisma.ts` exporta `prisma`
- `src/lib/bcrypt.ts` exporta `hashSenha`, `compareSenha`
- `src/lib/jwt.ts` exporta `signToken`, `JwtPayload`
- `src/lib/errors.ts` exporta `AppError`
- `src/middlewares/error.middleware.ts` exporta `errorHandler`

## O que fazer

**Files a criar:**
- `server/src/services/auth.service.ts`
- `server/src/controllers/auth.controller.ts`
- `server/src/routes/auth.routes.ts`

**File a modificar:**
- `server/src/server.ts` — adicionar rota `/api/auth` e `errorHandler`

**Produces:**
- `POST /api/auth/register` → 201 `{ token, usuario: { id, nome, email, tipo } }`
- `POST /api/auth/login` → 200 `{ token, usuario: { id, nome, email, tipo } }`
- 409 se email duplicado; 401 se credenciais inválidas; 400 se validação falhar

### Step 1: Criar src/services/auth.service.ts

```typescript
import { TipoUsuario } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { hashSenha, compareSenha } from '../lib/bcrypt'
import { signToken } from '../lib/jwt'
import { AppError } from '../lib/errors'

interface RegisterInput {
  nome: string
  email: string
  senha: string
  tipo: TipoUsuario
}

interface LoginInput {
  email: string
  senha: string
}

interface AuthResult {
  token: string
  usuario: {
    id: number
    nome: string
    email: string
    tipo: TipoUsuario
  }
}

export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  const existing = await prisma.usuario.findUnique({ where: { email: input.email } })
  if (existing) {
    throw new AppError(409, 'EMAIL_DUPLICADO', 'Email já cadastrado')
  }

  const hash = await hashSenha(input.senha)
  const usuario = await prisma.usuario.create({
    data: {
      nome: input.nome,
      email: input.email,
      senha: hash,
      tipo: input.tipo
    }
  })

  const token = signToken({ sub: usuario.id, tipo: usuario.tipo })
  return {
    token,
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo }
  }
}

export async function loginUser(input: LoginInput): Promise<AuthResult> {
  const usuario = await prisma.usuario.findUnique({ where: { email: input.email } })
  if (!usuario) {
    throw new AppError(401, 'CREDENCIAIS_INVALIDAS', 'Credenciais inválidas')
  }

  const valid = await compareSenha(input.senha, usuario.senha)
  if (!valid) {
    throw new AppError(401, 'CREDENCIAIS_INVALIDAS', 'Credenciais inválidas')
  }

  const token = signToken({ sub: usuario.id, tipo: usuario.tipo })
  return {
    token,
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo }
  }
}
```

### Step 2: Criar src/controllers/auth.controller.ts

```typescript
import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { registerUser, loginUser } from '../services/auth.service'

const registerSchema = z.object({
  nome: z.string().min(1),
  email: z.string().email(),
  senha: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  tipo: z.enum(['IDOSO', 'CUIDADOR'])
})

const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(1)
})

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  const result = registerSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Dados inválidos',
      details: result.error.flatten()
    })
    return
  }

  try {
    const data = await registerUser(result.data)
    res.status(201).json(data)
  } catch (err) {
    next(err)
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  const result = loginSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Dados inválidos',
      details: result.error.flatten()
    })
    return
  }

  try {
    const data = await loginUser(result.data)
    res.status(200).json(data)
  } catch (err) {
    next(err)
  }
}
```

### Step 3: Criar src/routes/auth.routes.ts

```typescript
import { Router } from 'express'
import { register, login } from '../controllers/auth.controller'

export const authRoutes = Router()

authRoutes.post('/register', register)
authRoutes.post('/login', login)
```

### Step 4: Atualizar src/server.ts

Substituir o conteúdo COMPLETO de `server/src/server.ts` por:

```typescript
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
```

### Step 5: Verificar TypeScript

Execute dentro de `server/`:

```bash
npx tsc --noEmit
```

Esperado: sem erros.

### Step 6: Testar endpoints

Suba o servidor em `server/`:

```bash
npm run dev
```

Teste register (em outro terminal):

```bash
curl -s -X POST http://localhost:3333/api/auth/register -H "Content-Type: application/json" -d "{\"nome\":\"Maria Silva\",\"email\":\"maria@teste.com\",\"senha\":\"senha123\",\"tipo\":\"IDOSO\"}"
```

Esperado: JSON com `token` e `usuario` com `id`, `nome`, `email`, `tipo`.

Teste login:

```bash
curl -s -X POST http://localhost:3333/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"maria@teste.com\",\"senha\":\"senha123\"}"
```

Esperado: mesmo formato, status 200.

Pare o servidor (Ctrl+C).

### Step 7: Commit (da raiz)

```bash
git add server/src/services/auth.service.ts server/src/controllers/auth.controller.ts server/src/routes/auth.routes.ts server/src/server.ts
git commit -m "feat: add auth endpoints — POST /api/auth/register and /login"
```

## Report

Escreva em: `C:\Projetos\Aulas Ericson\MedLembra\.superpowers\sdd\fase1-task-4-report.md`

Inclua: status, hash do commit, output do tsc --noEmit, output do curl de register e login, concerns.

Retorne: STATUS, hash do commit, resumo de 1 linha.
