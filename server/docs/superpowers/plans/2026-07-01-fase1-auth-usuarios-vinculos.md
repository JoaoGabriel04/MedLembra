# MedLembra — Fase 1: Autenticação, Usuários e Vínculos

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar o schema Prisma completo (todos os models) e os endpoints de autenticação, perfil e vínculo entre idoso e cuidador.

**Architecture:** Estrutura em camadas (routes → controllers → services). Controllers são thin (só HTTP + validação Zod). Services contêm toda a lógica de negócio e chamam o Prisma. Erros são lançados como `AppError` e capturados pelo `errorHandler` central. Lib/ centraliza singletons (prisma, jwt, bcrypt) e errors.

**Tech Stack:** Express 5, Prisma 7, TypeScript 6, jsonwebtoken, zod, bcryptjs, dotenv.

## Global Constraints

- TypeScript `strict: true`, `module: CommonJS`
- Base URL de todas as rotas: `/api`
- JWT no header `Authorization: Bearer <token>` — payload `{ sub: usuarioId, tipo: 'IDOSO' | 'CUIDADOR' }`
- Token expira em `JWT_EXPIRES_IN` (env, default `7d`)
- Enums em MAIÚSCULAS: `IDOSO`, `CUIDADOR`, `TOMADO`, `PULADO`, `PENDENTE`
- Todo erro retorna `{ error: string, message: string, details?: unknown }`
- Status codes: 200 GET/PUT, 201 POST criação, 204 DELETE, 400 validação, 401 auth, 403 permissão, 404 not found, 409 conflito
- Senhas mínimo 8 caracteres, hasheadas com bcryptjs (10 rounds)
- Commits da raiz do monorepo: `C:\Projetos\Aulas Ericson\MedLembra\`
- Comandos npm/npx executados em `C:\Projetos\Aulas Ericson\MedLembra\server\`

---

## Mapa de arquivos

```
server/
├── prisma/
│   └── schema.prisma          ← MODIFY (Task 1) — todos os models
├── src/
│   ├── lib/
│   │   ├── prisma.ts          ← CREATE (Task 2) — singleton PrismaClient
│   │   ├── jwt.ts             ← CREATE (Task 2) — signToken, verifyToken, JwtPayload
│   │   ├── bcrypt.ts          ← CREATE (Task 2) — hashSenha, compareSenha
│   │   └── errors.ts          ← CREATE (Task 2) — classe AppError
│   ├── types/
│   │   └── express.d.ts       ← CREATE (Task 2) — augment req.user
│   ├── middlewares/
│   │   ├── auth.middleware.ts  ← CREATE (Task 3) — authMiddleware, requireTipo
│   │   └── error.middleware.ts ← CREATE (Task 3) — errorHandler
│   ├── services/
│   │   ├── auth.service.ts     ← CREATE (Task 4) — registerUser, loginUser
│   │   ├── usuarios.service.ts ← CREATE (Task 5) — getMe
│   │   ├── vinculos.service.ts ← CREATE (Task 6) — criarVinculo
│   │   └── cuidador.service.ts ← CREATE (Task 6) — listarIdosos
│   ├── controllers/
│   │   ├── auth.controller.ts     ← CREATE (Task 4) — register, login
│   │   ├── usuarios.controller.ts ← CREATE (Task 5) — me
│   │   ├── vinculos.controller.ts ← CREATE (Task 6) — criar
│   │   └── cuidador.controller.ts ← CREATE (Task 6) — getIdosos
│   ├── routes/
│   │   ├── auth.routes.ts     ← CREATE (Task 4)
│   │   ├── usuarios.routes.ts ← CREATE (Task 5)
│   │   ├── vinculos.routes.ts ← CREATE (Task 6)
│   │   └── cuidador.routes.ts ← CREATE (Task 6)
│   └── server.ts              ← MODIFY (Tasks 4, 5, 6) — wire routes + errorHandler
```

---

### Task 1: Prisma Schema — todos os models

**Files:**
- Modify: `server/prisma/schema.prisma`

**Interfaces:**
- Produces: modelos `Usuario`, `Medicamento`, `Horario`, `RegistroTomada` disponíveis via `@prisma/client`; enums `TipoUsuario`, `StatusTomada`

- [ ] **Step 1: Substituir prisma/schema.prisma pelo schema completo**

O arquivo `server/prisma/schema.prisma` deve ficar exatamente assim:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

enum TipoUsuario {
  IDOSO
  CUIDADOR
}

enum StatusTomada {
  TOMADO
  PULADO
  PENDENTE
}

model Usuario {
  id           Int         @id @default(autoincrement())
  nome         String
  email        String      @unique
  senha        String
  tipo         TipoUsuario

  cuidadorId   Int?
  cuidador     Usuario?    @relation("CuidadorIdosos", fields: [cuidadorId], references: [id])
  idosos       Usuario[]   @relation("CuidadorIdosos")

  medicamentos Medicamento[]

  criadoEm    DateTime    @default(now())
  atualizadoEm DateTime   @updatedAt
}

model Medicamento {
  id               Int      @id @default(autoincrement())
  idosoId          Int
  idoso            Usuario  @relation(fields: [idosoId], references: [id], onDelete: Cascade)
  nome             String
  dosagem          String
  frequenciaDiaria Int
  estoqueAtual     Int
  dataValidade     DateTime @db.Date

  horarios         Horario[]
  registros        RegistroTomada[]

  criadoEm        DateTime @default(now())
  atualizadoEm    DateTime @updatedAt
}

model Horario {
  id            Int         @id @default(autoincrement())
  medicamentoId Int
  medicamento   Medicamento @relation(fields: [medicamentoId], references: [id], onDelete: Cascade)
  hora          String

  registros     RegistroTomada[]
}

model RegistroTomada {
  id            Int          @id @default(autoincrement())
  medicamentoId Int
  medicamento   Medicamento  @relation(fields: [medicamentoId], references: [id], onDelete: Cascade)
  horarioId     Int?
  horario       Horario?     @relation(fields: [horarioId], references: [id])
  dataHora      DateTime     @default(now())
  status        StatusTomada
}
```

- [ ] **Step 2: Validar o schema**

Execute dentro de `server/`:

```bash
npx prisma validate
```

Esperado: `The schema at prisma/schema.prisma is valid 🚀`

- [ ] **Step 3: Rodar a migration**

Execute dentro de `server/`:

```bash
npx prisma migrate dev --name init
```

Esperado: saída confirmando que 4 tabelas foram criadas (`Usuario`, `Medicamento`, `Horario`, `RegistroTomada`) e 2 enums. Se aparecer aviso sobre `@db.Date` não reconhecido, Prisma 7 suporta via `prisma-client-js` — é aceitável.

- [ ] **Step 4: Verificar que o Prisma Client foi gerado**

Execute dentro de `server/`:

```bash
npx prisma generate
```

Esperado: `Generated Prisma Client` (ou similar confirmando geração bem-sucedida).

- [ ] **Step 5: Commit**

Da raiz do monorepo:

```bash
git add server/prisma/schema.prisma server/prisma/migrations/
git commit -m "feat: add full prisma schema — Usuario, Medicamento, Horario, RegistroTomada"
```

---

### Task 2: Core Lib + Types

**Files:**
- Create: `server/src/lib/prisma.ts`
- Create: `server/src/lib/jwt.ts`
- Create: `server/src/lib/bcrypt.ts`
- Create: `server/src/lib/errors.ts`
- Create: `server/src/types/express.d.ts`

**Interfaces:**
- Consumes: `@prisma/client` (gerado na Task 1); `jsonwebtoken`, `bcryptjs` (instalados)
- Produces:
  - `prisma` — instância `PrismaClient` exportada de `src/lib/prisma.ts`
  - `signToken(payload: JwtPayload): string` em `src/lib/jwt.ts`
  - `verifyToken(token: string): JwtPayload` em `src/lib/jwt.ts`
  - `JwtPayload = { sub: number; tipo: 'IDOSO' | 'CUIDADOR' }` em `src/lib/jwt.ts`
  - `hashSenha(senha: string): Promise<string>` em `src/lib/bcrypt.ts`
  - `compareSenha(senha: string, hash: string): Promise<boolean>` em `src/lib/bcrypt.ts`
  - `AppError(status, code, message, details?)` em `src/lib/errors.ts`
  - `req.user: { id: number; tipo: 'IDOSO' | 'CUIDADOR' }` disponível globalmente

- [ ] **Step 1: Criar src/lib/prisma.ts**

```typescript
import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()
```

- [ ] **Step 2: Criar src/lib/errors.ts**

```typescript
export class AppError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
  }
}
```

- [ ] **Step 3: Criar src/lib/jwt.ts**

```typescript
import jwt from 'jsonwebtoken'

export type JwtPayload = {
  sub: number
  tipo: 'IDOSO' | 'CUIDADOR'
}

const SECRET = process.env.JWT_SECRET!
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN as jwt.SignOptions['expiresIn'] })
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload
}
```

- [ ] **Step 4: Criar src/lib/bcrypt.ts**

```typescript
import bcrypt from 'bcryptjs'

const ROUNDS = 10

export function hashSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, ROUNDS)
}

export function compareSenha(senha: string, hash: string): Promise<boolean> {
  return bcrypt.compare(senha, hash)
}
```

- [ ] **Step 5: Criar src/types/express.d.ts**

```typescript
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number
        tipo: 'IDOSO' | 'CUIDADOR'
      }
    }
  }
}

export {}
```

- [ ] **Step 6: Verificar que o TypeScript compila sem erros**

Execute dentro de `server/`:

```bash
npx tsc --noEmit
```

Esperado: nenhum output (sem erros). Se aparecer erro relacionado a `@prisma/client` não encontrado, rode `npx prisma generate` primeiro.

- [ ] **Step 7: Commit**

Da raiz:

```bash
git add server/src/lib/ server/src/types/
git commit -m "feat: add core lib (prisma singleton, jwt, bcrypt, AppError) and express type augmentation"
```

---

### Task 3: Middlewares

**Files:**
- Create: `server/src/middlewares/auth.middleware.ts`
- Create: `server/src/middlewares/error.middleware.ts`

**Interfaces:**
- Consumes: `verifyToken` de `src/lib/jwt.ts`; `AppError` de `src/lib/errors.ts`
- Produces:
  - `authMiddleware` — Express middleware que valida Bearer token e injeta `req.user`
  - `requireTipo(tipo)` — factory que bloqueia se `req.user.tipo` diferente
  - `errorHandler` — middleware de 4 parâmetros para capturar erros

- [ ] **Step 1: Criar src/middlewares/auth.middleware.ts**

```typescript
import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../lib/jwt'

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'Token ausente ou malformado' })
    return
  }

  const token = authHeader.slice(7)
  try {
    const payload = verifyToken(token)
    req.user = { id: payload.sub, tipo: payload.tipo }
    next()
  } catch {
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'Token inválido ou expirado' })
  }
}

export function requireTipo(tipo: 'IDOSO' | 'CUIDADOR') {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.tipo !== tipo) {
      res.status(403).json({
        error: 'FORBIDDEN',
        message: `Acesso restrito a ${tipo}`
      })
      return
    }
    next()
  }
}
```

- [ ] **Step 2: Criar src/middlewares/error.middleware.ts**

```typescript
import { Request, Response, NextFunction } from 'express'
import { AppError } from '../lib/errors'

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    const body: Record<string, unknown> = {
      error: err.code,
      message: err.message
    }
    if (err.details !== undefined) body.details = err.details
    res.status(err.status).json(body)
    return
  }

  console.error(err)
  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: 'Erro inesperado'
  })
}
```

- [ ] **Step 3: Verificar TypeScript**

Execute dentro de `server/`:

```bash
npx tsc --noEmit
```

Esperado: nenhum output.

- [ ] **Step 4: Commit**

Da raiz:

```bash
git add server/src/middlewares/
git commit -m "feat: add auth and error middlewares"
```

---

### Task 4: Auth — Register + Login

**Files:**
- Create: `server/src/services/auth.service.ts`
- Create: `server/src/controllers/auth.controller.ts`
- Create: `server/src/routes/auth.routes.ts`
- Modify: `server/src/server.ts`

**Interfaces:**
- Consumes: `prisma` de `src/lib/prisma.ts`; `hashSenha`, `compareSenha` de `src/lib/bcrypt.ts`; `signToken` de `src/lib/jwt.ts`; `AppError` de `src/lib/errors.ts`; `errorHandler` de `src/middlewares/error.middleware.ts`
- Produces:
  - `registerUser(input: RegisterInput): Promise<AuthResult>` em `src/services/auth.service.ts`
  - `loginUser(input: LoginInput): Promise<AuthResult>` em `src/services/auth.service.ts`
  - `POST /api/auth/register` → 201 `{ token, usuario }`
  - `POST /api/auth/login` → 200 `{ token, usuario }`

- [ ] **Step 1: Criar src/services/auth.service.ts**

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

- [ ] **Step 2: Criar src/controllers/auth.controller.ts**

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

- [ ] **Step 3: Criar src/routes/auth.routes.ts**

```typescript
import { Router } from 'express'
import { register, login } from '../controllers/auth.controller'

export const authRoutes = Router()

authRoutes.post('/register', register)
authRoutes.post('/login', login)
```

- [ ] **Step 4: Atualizar src/server.ts**

Substituir o conteúdo de `server/src/server.ts` por:

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

- [ ] **Step 5: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: sem erros.

- [ ] **Step 6: Subir servidor e testar register**

Em um terminal, dentro de `server/`:

```bash
npm run dev
```

Em outro terminal:

```bash
curl -X POST http://localhost:3333/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"nome\":\"Maria Silva\",\"email\":\"maria@teste.com\",\"senha\":\"senha123\",\"tipo\":\"IDOSO\"}"
```

Esperado (201):

```json
{
  "token": "eyJhbGci...",
  "usuario": { "id": 1, "nome": "Maria Silva", "email": "maria@teste.com", "tipo": "IDOSO" }
}
```

- [ ] **Step 7: Testar login**

```bash
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"maria@teste.com\",\"senha\":\"senha123\"}"
```

Esperado (200): mesmo formato de register.

- [ ] **Step 8: Parar servidor e fazer commit**

Da raiz:

```bash
git add server/src/services/auth.service.ts server/src/controllers/auth.controller.ts server/src/routes/auth.routes.ts server/src/server.ts
git commit -m "feat: add auth endpoints — POST /api/auth/register and /login"
```

---

### Task 5: Usuários — GET /usuarios/me

**Files:**
- Create: `server/src/services/usuarios.service.ts`
- Create: `server/src/controllers/usuarios.controller.ts`
- Create: `server/src/routes/usuarios.routes.ts`
- Modify: `server/src/server.ts`

**Interfaces:**
- Consumes: `prisma` de `src/lib/prisma.ts`; `AppError` de `src/lib/errors.ts`; `authMiddleware` de `src/middlewares/auth.middleware.ts`; `req.user.id` e `req.user.tipo`
- Produces:
  - `getMe(userId: number): Promise<MeResult>` em `src/services/usuarios.service.ts`
  - `GET /api/usuarios/me` → 200 (shape diferente para IDOSO e CUIDADOR)

- [ ] **Step 1: Criar src/services/usuarios.service.ts**

```typescript
import { prisma } from '../lib/prisma'
import { AppError } from '../lib/errors'

export async function getMe(userId: number) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: userId },
    include: {
      cuidador: { select: { id: true, nome: true, email: true } },
      idosos: { select: { id: true, nome: true, email: true } }
    }
  })

  if (!usuario) {
    throw new AppError(404, 'NOT_FOUND', 'Usuário não encontrado')
  }

  if (usuario.tipo === 'IDOSO') {
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo,
      cuidadorId: usuario.cuidadorId,
      cuidador: usuario.cuidador
    }
  }

  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    tipo: usuario.tipo,
    idosos: usuario.idosos
  }
}
```

- [ ] **Step 2: Criar src/controllers/usuarios.controller.ts**

```typescript
import { Request, Response, NextFunction } from 'express'
import { getMe } from '../services/usuarios.service'

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await getMe(req.user!.id)
    res.json(data)
  } catch (err) {
    next(err)
  }
}
```

- [ ] **Step 3: Criar src/routes/usuarios.routes.ts**

```typescript
import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware'
import { me } from '../controllers/usuarios.controller'

export const usuariosRoutes = Router()

usuariosRoutes.get('/me', authMiddleware, me)
```

- [ ] **Step 4: Atualizar src/server.ts**

Substituir o conteúdo por:

```typescript
import express from 'express'
import dotenv from 'dotenv'
import { authRoutes } from './routes/auth.routes'
import { usuariosRoutes } from './routes/usuarios.routes'
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

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

- [ ] **Step 5: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: sem erros.

- [ ] **Step 6: Subir servidor e testar /me**

Em um terminal:

```bash
npm run dev
```

Registrar um cuidador (se não existir):

```bash
curl -X POST http://localhost:3333/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"nome\":\"João Silva\",\"email\":\"joao@teste.com\",\"senha\":\"senha123\",\"tipo\":\"CUIDADOR\"}"
```

Copiar o token retornado e usar em:

```bash
curl http://localhost:3333/api/usuarios/me \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

Esperado (200) para CUIDADOR:

```json
{
  "id": 2,
  "nome": "João Silva",
  "email": "joao@teste.com",
  "tipo": "CUIDADOR",
  "idosos": []
}
```

- [ ] **Step 7: Parar e commit**

Da raiz:

```bash
git add server/src/services/usuarios.service.ts server/src/controllers/usuarios.controller.ts server/src/routes/usuarios.routes.ts server/src/server.ts
git commit -m "feat: add GET /api/usuarios/me"
```

---

### Task 6: Vínculos + Cuidador/Idosos

**Files:**
- Create: `server/src/services/vinculos.service.ts`
- Create: `server/src/controllers/vinculos.controller.ts`
- Create: `server/src/routes/vinculos.routes.ts`
- Create: `server/src/services/cuidador.service.ts`
- Create: `server/src/controllers/cuidador.controller.ts`
- Create: `server/src/routes/cuidador.routes.ts`
- Modify: `server/src/server.ts`

**Interfaces:**
- Consumes: `prisma`, `AppError`, `authMiddleware`, `requireTipo`
- Produces:
  - `criarVinculo(userId, tipo, email): Promise<{ vinculo: { idosoId, cuidadorId } }>` em `vinculos.service.ts`
  - `listarIdosos(cuidadorId): Promise<{ idosos: [...] }>` em `cuidador.service.ts`
  - `POST /api/vinculos` → 200 `{ vinculo: { idosoId, cuidadorId } }`
  - `GET /api/cuidador/idosos` → 200 `{ idosos: [...] }` (só CUIDADOR)

- [ ] **Step 1: Criar src/services/vinculos.service.ts**

```typescript
import { prisma } from '../lib/prisma'
import { AppError } from '../lib/errors'

export async function criarVinculo(
  userId: number,
  tipoUser: 'IDOSO' | 'CUIDADOR',
  email: string
): Promise<{ vinculo: { idosoId: number; cuidadorId: number } }> {
  const outro = await prisma.usuario.findUnique({ where: { email } })
  if (!outro) {
    throw new AppError(404, 'NOT_FOUND', 'Usuário não encontrado com esse email')
  }

  if (outro.id === userId) {
    throw new AppError(409, 'AUTO_VINCULO', 'Não é possível se vincular a si mesmo')
  }

  if (tipoUser === 'CUIDADOR' && outro.tipo !== 'IDOSO') {
    throw new AppError(400, 'TIPO_INCOMPATIVEL', 'O email deve pertencer a um IDOSO')
  }

  if (tipoUser === 'IDOSO' && outro.tipo !== 'CUIDADOR') {
    throw new AppError(400, 'TIPO_INCOMPATIVEL', 'O email deve pertencer a um CUIDADOR')
  }

  const idosoId = tipoUser === 'IDOSO' ? userId : outro.id
  const cuidadorId = tipoUser === 'CUIDADOR' ? userId : outro.id

  await prisma.usuario.update({
    where: { id: idosoId },
    data: { cuidadorId }
  })

  return { vinculo: { idosoId, cuidadorId } }
}
```

- [ ] **Step 2: Criar src/controllers/vinculos.controller.ts**

```typescript
import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { criarVinculo } from '../services/vinculos.service'

const vinculoSchema = z.object({
  email: z.string().email()
})

export async function criar(req: Request, res: Response, next: NextFunction): Promise<void> {
  const result = vinculoSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Dados inválidos',
      details: result.error.flatten()
    })
    return
  }

  try {
    const data = await criarVinculo(req.user!.id, req.user!.tipo, result.data.email)
    res.json(data)
  } catch (err) {
    next(err)
  }
}
```

- [ ] **Step 3: Criar src/routes/vinculos.routes.ts**

```typescript
import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware'
import { criar } from '../controllers/vinculos.controller'

export const vinculosRoutes = Router()

vinculosRoutes.post('/', authMiddleware, criar)
```

- [ ] **Step 4: Criar src/services/cuidador.service.ts**

```typescript
import { prisma } from '../lib/prisma'

export async function listarIdosos(cuidadorId: number): Promise<{
  idosos: Array<{ id: number; nome: string; email: string }>
}> {
  const idosos = await prisma.usuario.findMany({
    where: { cuidadorId },
    select: { id: true, nome: true, email: true }
  })
  return { idosos }
}
```

- [ ] **Step 5: Criar src/controllers/cuidador.controller.ts**

```typescript
import { Request, Response, NextFunction } from 'express'
import { listarIdosos } from '../services/cuidador.service'

export async function getIdosos(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await listarIdosos(req.user!.id)
    res.json(data)
  } catch (err) {
    next(err)
  }
}
```

- [ ] **Step 6: Criar src/routes/cuidador.routes.ts**

```typescript
import { Router } from 'express'
import { authMiddleware, requireTipo } from '../middlewares/auth.middleware'
import { getIdosos } from '../controllers/cuidador.controller'

export const cuidadorRoutes = Router()

cuidadorRoutes.get('/idosos', authMiddleware, requireTipo('CUIDADOR'), getIdosos)
```

- [ ] **Step 7: Atualizar src/server.ts (versão final da Fase 1)**

Substituir por:

```typescript
import express from 'express'
import dotenv from 'dotenv'
import { authRoutes } from './routes/auth.routes'
import { usuariosRoutes } from './routes/usuarios.routes'
import { vinculosRoutes } from './routes/vinculos.routes'
import { cuidadorRoutes } from './routes/cuidador.routes'
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

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

- [ ] **Step 8: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: sem erros.

- [ ] **Step 9: Teste completo do fluxo de vínculo**

Suba o servidor (`npm run dev`) e execute em sequência:

**Registrar idoso:**

```bash
curl -X POST http://localhost:3333/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"nome\":\"Maria Idosa\",\"email\":\"idosa@teste.com\",\"senha\":\"senha123\",\"tipo\":\"IDOSO\"}"
```

Salvar o token do idoso como `TOKEN_IDOSO`.

**Registrar cuidador:**

```bash
curl -X POST http://localhost:3333/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"nome\":\"Carlos Cuidador\",\"email\":\"cuidador@teste.com\",\"senha\":\"senha123\",\"tipo\":\"CUIDADOR\"}"
```

Salvar o token do cuidador como `TOKEN_CUIDADOR`.

**Criar vínculo (cuidador vincula idoso pelo email):**

```bash
curl -X POST http://localhost:3333/api/vinculos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_CUIDADOR" \
  -d "{\"email\":\"idosa@teste.com\"}"
```

Esperado (200):

```json
{ "vinculo": { "idosoId": 1, "cuidadorId": 2 } }
```

**Listar idosos do cuidador:**

```bash
curl http://localhost:3333/api/cuidador/idosos \
  -H "Authorization: Bearer TOKEN_CUIDADOR"
```

Esperado (200):

```json
{ "idosos": [{ "id": 1, "nome": "Maria Idosa", "email": "idosa@teste.com" }] }
```

**Verificar /me do idoso (deve ter cuidador vinculado):**

```bash
curl http://localhost:3333/api/usuarios/me \
  -H "Authorization: Bearer TOKEN_IDOSO"
```

Esperado (200):

```json
{
  "id": 1,
  "nome": "Maria Idosa",
  "email": "idosa@teste.com",
  "tipo": "IDOSO",
  "cuidadorId": 2,
  "cuidador": { "id": 2, "nome": "Carlos Cuidador", "email": "cuidador@teste.com" }
}
```

- [ ] **Step 10: Parar servidor e commit final**

Da raiz:

```bash
git add server/src/services/vinculos.service.ts server/src/controllers/vinculos.controller.ts server/src/routes/vinculos.routes.ts server/src/services/cuidador.service.ts server/src/controllers/cuidador.controller.ts server/src/routes/cuidador.routes.ts server/src/server.ts
git commit -m "feat: add POST /api/vinculos and GET /api/cuidador/idosos — Phase 1 complete"
```

---

## Verificação Final da Fase 1

Confirmar que todos os endpoints respondem corretamente:

| Endpoint | Auth | Esperado |
|---|---|---|
| POST /api/auth/register | Não | 201 `{ token, usuario }` |
| POST /api/auth/login | Não | 200 `{ token, usuario }` |
| GET /api/usuarios/me | Sim | 200 (shape diferente por tipo) |
| POST /api/vinculos | Sim | 200 `{ vinculo: { idosoId, cuidadorId } }` |
| GET /api/cuidador/idosos | Sim (CUIDADOR) | 200 `{ idosos: [...] }` |

Testar erros:
- Register com email duplicado → 409
- Login com senha errada → 401
- /me sem token → 401
- /cuidador/idosos com token de IDOSO → 403
