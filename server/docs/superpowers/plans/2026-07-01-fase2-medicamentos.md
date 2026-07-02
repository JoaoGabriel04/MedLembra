# MedLembra — Fase 2: Medicamentos

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar CRUD completo de medicamentos com horários, incluindo o helper `assertAccessToIdoso` que valida acesso em todos os endpoints.

**Architecture:** Mesma estrutura de camadas da Fase 1 (routes → controllers → services). `assertAccessToIdoso` vive em `src/utils/acesso.ts` e é chamado pelos services antes de qualquer operação. Horários são sempre criados/substituídos em transação junto com o medicamento.

**Tech Stack:** Express 5, Prisma 7, TypeScript 6, Zod, dotenv.

## Global Constraints

- TypeScript `strict: true`, `module: CommonJS`
- Base URL: `/api`
- JWT Bearer token — payload `{ sub: usuarioId, tipo: 'IDOSO' | 'CUIDADOR' }`
- Enums MAIÚSCULAS: `IDOSO`, `CUIDADOR`
- Erro: `{ error: string, message: string, details?: unknown }`
- Status: 200 GET/PUT, 201 POST criação, 204 DELETE, 400 validação, 403 permissão, 404 not found, 409 conflito
- `horarios.length` deve ser igual a `frequenciaDiaria` ao criar
- `estoqueAtual` inteiro >= 0
- Horários no formato `HH:mm`, sem duplicatas
- `dataValidade` retornada como `YYYY-MM-DD`
- Commits da raiz do monorepo
- Comandos npm/npx executados em `server/`

---

## Mapa de arquivos

```
server/src/
├── utils/
│   └── acesso.ts               ← CREATE (Task 1) — assertAccessToIdoso
├── services/
│   └── medicamentos.service.ts ← CREATE (Task 2) — CRUD + horários
├── controllers/
│   └── medicamentos.controller.ts ← CREATE (Task 3)
├── routes/
│   └── medicamentos.routes.ts  ← CREATE (Task 3)
└── server.ts                   ← MODIFY (Task 3) — wire medicamentosRoutes
```

---

### Task 1: assertAccessToIdoso

**Files:**
- Create: `server/src/utils/acesso.ts`

**Interfaces:**
- Consumes: `prisma` de `src/lib/prisma.ts`; `AppError` de `src/lib/errors.ts`
- Produces: `assertAccessToIdoso(userId, tipo, idosoId): Promise<void>` — lança 404 se idoso não existe, 403 se o usuário não tem acesso

- [ ] **Step 1: Criar src/utils/acesso.ts**

```typescript
import { prisma } from '../lib/prisma'
import { AppError } from '../lib/errors'

export async function assertAccessToIdoso(
  userId: number,
  tipo: 'IDOSO' | 'CUIDADOR',
  idosoId: number
): Promise<void> {
  if (tipo === 'IDOSO') {
    if (userId !== idosoId) {
      throw new AppError(403, 'FORBIDDEN', 'Acesso negado')
    }
    return
  }
  const idoso = await prisma.usuario.findUnique({ where: { id: idosoId } })
  if (!idoso) {
    throw new AppError(404, 'NOT_FOUND', 'Idoso não encontrado')
  }
  if (idoso.cuidadorId !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'Idoso não vinculado a você')
  }
}
```

- [ ] **Step 2: Verificar TypeScript**

Execute em `server/`:

```bash
npx tsc --noEmit
```

Esperado: nenhum output.

- [ ] **Step 3: Commit**

Da raiz:

```bash
git add server/src/utils/acesso.ts
git commit -m "feat: add assertAccessToIdoso utility"
```

---

### Task 2: Medicamentos Service

**Files:**
- Create: `server/src/services/medicamentos.service.ts`

**Interfaces:**
- Consumes: `prisma`, `AppError`, `assertAccessToIdoso`
- Produces:
  - `criarMedicamento(userId, tipo, input): Promise<MedicamentoFormatado>`
  - `listarMedicamentos(userId, tipo, idosoId?): Promise<{ medicamentos: MedicamentoFormatado[] }>`
  - `getMedicamento(userId, tipo, id): Promise<MedicamentoFormatado>`
  - `atualizarMedicamento(userId, tipo, id, input): Promise<MedicamentoFormatado>`
  - `deletarMedicamento(userId, tipo, id): Promise<void>`

- [ ] **Step 1: Criar src/services/medicamentos.service.ts**

```typescript
import { Medicamento, Horario } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { AppError } from '../lib/errors'
import { assertAccessToIdoso } from '../utils/acesso'

type MedicamentoComHorarios = Medicamento & { horarios: Horario[] }

function formatMedicamento(med: MedicamentoComHorarios) {
  return {
    id: med.id,
    idosoId: med.idosoId,
    nome: med.nome,
    dosagem: med.dosagem,
    frequenciaDiaria: med.frequenciaDiaria,
    estoqueAtual: med.estoqueAtual,
    dataValidade: med.dataValidade.toISOString().slice(0, 10),
    horarios: med.horarios.map(h => ({ id: h.id, hora: h.hora })),
    criadoEm: med.criadoEm.toISOString(),
    atualizadoEm: med.atualizadoEm.toISOString()
  }
}

interface CriarMedicamentoInput {
  idosoId: number
  nome: string
  dosagem: string
  frequenciaDiaria: number
  estoqueAtual: number
  dataValidade: string
  horarios: string[]
}

interface AtualizarMedicamentoInput {
  nome?: string
  dosagem?: string
  frequenciaDiaria?: number
  estoqueAtual?: number
  dataValidade?: string
  horarios?: string[]
}

export async function criarMedicamento(
  userId: number,
  tipo: 'IDOSO' | 'CUIDADOR',
  input: CriarMedicamentoInput
) {
  await assertAccessToIdoso(userId, tipo, input.idosoId)

  const medicamento = await prisma.medicamento.create({
    data: {
      idosoId: input.idosoId,
      nome: input.nome,
      dosagem: input.dosagem,
      frequenciaDiaria: input.frequenciaDiaria,
      estoqueAtual: input.estoqueAtual,
      dataValidade: new Date(input.dataValidade),
      horarios: { create: input.horarios.map(hora => ({ hora })) }
    },
    include: { horarios: true }
  })

  return formatMedicamento(medicamento)
}

export async function listarMedicamentos(
  userId: number,
  tipo: 'IDOSO' | 'CUIDADOR',
  idosoIdQuery?: number
) {
  const idosoId = tipo === 'IDOSO' ? userId : idosoIdQuery
  if (tipo === 'CUIDADOR' && !idosoId) {
    throw new AppError(400, 'IDOSO_ID_OBRIGATORIO', 'idosoId é obrigatório para CUIDADOR')
  }
  await assertAccessToIdoso(userId, tipo, idosoId!)

  const medicamentos = await prisma.medicamento.findMany({
    where: { idosoId },
    include: { horarios: true }
  })

  return { medicamentos: medicamentos.map(formatMedicamento) }
}

export async function getMedicamento(
  userId: number,
  tipo: 'IDOSO' | 'CUIDADOR',
  id: number
) {
  const medicamento = await prisma.medicamento.findUnique({
    where: { id },
    include: { horarios: true }
  })
  if (!medicamento) {
    throw new AppError(404, 'NOT_FOUND', 'Medicamento não encontrado')
  }
  await assertAccessToIdoso(userId, tipo, medicamento.idosoId)

  return formatMedicamento(medicamento)
}

export async function atualizarMedicamento(
  userId: number,
  tipo: 'IDOSO' | 'CUIDADOR',
  id: number,
  input: AtualizarMedicamentoInput
) {
  const existing = await prisma.medicamento.findUnique({ where: { id } })
  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', 'Medicamento não encontrado')
  }
  await assertAccessToIdoso(userId, tipo, existing.idosoId)

  const novaFrequencia = input.horarios
    ? (input.frequenciaDiaria ?? input.horarios.length)
    : input.frequenciaDiaria

  const medicamento = await prisma.$transaction(async tx => {
    if (input.horarios) {
      await tx.horario.deleteMany({ where: { medicamentoId: id } })
    }
    return tx.medicamento.update({
      where: { id },
      data: {
        ...(input.nome !== undefined && { nome: input.nome }),
        ...(input.dosagem !== undefined && { dosagem: input.dosagem }),
        ...(novaFrequencia !== undefined && { frequenciaDiaria: novaFrequencia }),
        ...(input.estoqueAtual !== undefined && { estoqueAtual: input.estoqueAtual }),
        ...(input.dataValidade !== undefined && { dataValidade: new Date(input.dataValidade) }),
        ...(input.horarios && {
          horarios: { create: input.horarios.map(hora => ({ hora })) }
        })
      },
      include: { horarios: true }
    })
  })

  return formatMedicamento(medicamento)
}

export async function deletarMedicamento(
  userId: number,
  tipo: 'IDOSO' | 'CUIDADOR',
  id: number
): Promise<void> {
  const existing = await prisma.medicamento.findUnique({ where: { id } })
  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', 'Medicamento não encontrado')
  }
  await assertAccessToIdoso(userId, tipo, existing.idosoId)
  await prisma.medicamento.delete({ where: { id } })
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: nenhum output.

- [ ] **Step 3: Commit**

```bash
git add server/src/services/medicamentos.service.ts
git commit -m "feat: add medicamentos service — CRUD with horarios"
```

---

### Task 3: Controller, Routes, server.ts

**Files:**
- Create: `server/src/controllers/medicamentos.controller.ts`
- Create: `server/src/routes/medicamentos.routes.ts`
- Modify: `server/src/server.ts`

**Interfaces:**
- Consumes: todos os exports de `medicamentos.service.ts`; `authMiddleware` de `auth.middleware.ts`
- Produces:
  - `POST /api/medicamentos` → 201
  - `GET /api/medicamentos?idosoId=` → 200
  - `GET /api/medicamentos/:id` → 200
  - `PUT /api/medicamentos/:id` → 200
  - `DELETE /api/medicamentos/:id` → 204

- [ ] **Step 1: Criar src/controllers/medicamentos.controller.ts**

```typescript
import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import {
  criarMedicamento,
  listarMedicamentos,
  getMedicamento,
  atualizarMedicamento,
  deletarMedicamento
} from '../services/medicamentos.service'

const horarioRegex = /^\d{2}:\d{2}$/

const criarSchema = z.object({
  idosoId: z.number().int().positive(),
  nome: z.string().min(1),
  dosagem: z.string().min(1),
  frequenciaDiaria: z.number().int().positive(),
  estoqueAtual: z.number().int().min(0),
  dataValidade: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'formato YYYY-MM-DD'),
  horarios: z.array(z.string().regex(horarioRegex, 'formato HH:mm')).min(1)
}).refine(d => d.horarios.length === d.frequenciaDiaria, {
  message: 'horarios.length deve ser igual a frequenciaDiaria'
})

const atualizarSchema = z.object({
  nome: z.string().min(1).optional(),
  dosagem: z.string().min(1).optional(),
  frequenciaDiaria: z.number().int().positive().optional(),
  estoqueAtual: z.number().int().min(0).optional(),
  dataValidade: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  horarios: z.array(z.string().regex(horarioRegex)).min(1).optional()
}).refine(d => {
  if (d.horarios && d.frequenciaDiaria) {
    return d.horarios.length === d.frequenciaDiaria
  }
  return true
}, { message: 'horarios.length deve ser igual a frequenciaDiaria' })

export async function criar(req: Request, res: Response, next: NextFunction): Promise<void> {
  const result = criarSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Dados inválidos', details: result.error.flatten() })
    return
  }
  try {
    const data = await criarMedicamento(req.user!.id, req.user!.tipo, result.data)
    res.status(201).json(data)
  } catch (err) { next(err) }
}

export async function listar(req: Request, res: Response, next: NextFunction): Promise<void> {
  const idosoId = req.query.idosoId ? Number(req.query.idosoId) : undefined
  try {
    const data = await listarMedicamentos(req.user!.id, req.user!.tipo, idosoId)
    res.json(data)
  } catch (err) { next(err) }
}

export async function getUm(req: Request, res: Response, next: NextFunction): Promise<void> {
  const id = Number(req.params.id)
  try {
    const data = await getMedicamento(req.user!.id, req.user!.tipo, id)
    res.json(data)
  } catch (err) { next(err) }
}

export async function atualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
  const id = Number(req.params.id)
  const result = atualizarSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Dados inválidos', details: result.error.flatten() })
    return
  }
  try {
    const data = await atualizarMedicamento(req.user!.id, req.user!.tipo, id, result.data)
    res.json(data)
  } catch (err) { next(err) }
}

export async function deletar(req: Request, res: Response, next: NextFunction): Promise<void> {
  const id = Number(req.params.id)
  try {
    await deletarMedicamento(req.user!.id, req.user!.tipo, id)
    res.status(204).send()
  } catch (err) { next(err) }
}
```

- [ ] **Step 2: Criar src/routes/medicamentos.routes.ts**

```typescript
import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware'
import { criar, listar, getUm, atualizar, deletar } from '../controllers/medicamentos.controller'

export const medicamentosRoutes = Router()

medicamentosRoutes.post('/', authMiddleware, criar)
medicamentosRoutes.get('/', authMiddleware, listar)
medicamentosRoutes.get('/:id', authMiddleware, getUm)
medicamentosRoutes.put('/:id', authMiddleware, atualizar)
medicamentosRoutes.delete('/:id', authMiddleware, deletar)
```

- [ ] **Step 3: Atualizar src/server.ts**

```typescript
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
```

- [ ] **Step 4: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: nenhum output.

- [ ] **Step 5: Subir servidor e testar fluxo completo**

Registrar idoso e pegar token:

```bash
curl -s -X POST http://localhost:7000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nome":"Maria","email":"maria2@t.com","senha":"senha123","tipo":"IDOSO"}'
```

Guardar o token retornado como TOKEN_IDOSO.

Criar medicamento (usando token):

```bash
curl -s -X POST http://localhost:7000/api/medicamentos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_IDOSO" \
  -d '{"idosoId":ID_IDOSO,"nome":"Losartana","dosagem":"50mg","frequenciaDiaria":2,"estoqueAtual":60,"dataValidade":"2026-12-31","horarios":["08:00","20:00"]}'
```

Esperado (201):
```json
{
  "id": 1, "idosoId": 2, "nome": "Losartana", "dosagem": "50mg",
  "frequenciaDiaria": 2, "estoqueAtual": 60, "dataValidade": "2026-12-31",
  "horarios": [{"id":1,"hora":"08:00"},{"id":2,"hora":"20:00"}],
  "criadoEm": "...", "atualizadoEm": "..."
}
```

Listar medicamentos:

```bash
curl -s http://localhost:7000/api/medicamentos \
  -H "Authorization: Bearer TOKEN_IDOSO"
```

Esperado (200): `{ "medicamentos": [{ ... }] }`

Buscar por ID:

```bash
curl -s http://localhost:7000/api/medicamentos/1 \
  -H "Authorization: Bearer TOKEN_IDOSO"
```

Atualizar (troca horários):

```bash
curl -s -X PUT http://localhost:7000/api/medicamentos/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_IDOSO" \
  -d '{"estoqueAtual":90,"horarios":["07:00","19:00"]}'
```

Esperado (200): horarios atualizados para `["07:00","19:00"]`, `estoqueAtual: 90`.

Deletar:

```bash
curl -s -X DELETE http://localhost:7000/api/medicamentos/1 \
  -H "Authorization: Bearer TOKEN_IDOSO" -v
```

Esperado: HTTP 204.

Testar erros:
- POST com `horarios.length != frequenciaDiaria` → 400
- GET de medicamento de outro idoso → 403

- [ ] **Step 6: Commit final**

```bash
git add server/src/controllers/medicamentos.controller.ts server/src/routes/medicamentos.routes.ts server/src/server.ts
git commit -m "feat: add medicamentos endpoints — CRUD completo (Fase 2)"
```
