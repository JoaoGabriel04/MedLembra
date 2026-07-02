# MedLembra — Fase 3: Registros de Tomada + /idoso/hoje

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar o registro de doses (TOMADO/PULADO) com decremento atômico de estoque, histórico paginado de registros, e o endpoint `/idoso/hoje` que agrega o checklist diário de medicamentos com status por horário.

**Architecture:** Mesma estrutura de camadas. `utils/datas.ts` centraliza o cálculo de "hoje" e "7 dias" no fuso `America/Fortaleza` (UTC-3, sem DST). Registros de medicamento ficam em `registros.routes.ts` montado em `/api/medicamentos/:id/registros` com `mergeParams: true` para herdar o `:id` do path pai. O endpoint `/idoso/hoje` fica em `idoso.routes.ts`.

**Tech Stack:** Express 5, Prisma 7, TypeScript 6, Zod.

## Global Constraints

- TypeScript `strict: true`, `module: CommonJS`
- Base URL: `/api`
- JWT Bearer token
- `status`: `TOMADO`, `PULADO`, `PENDENTE` (enum)
- `POST /registros` com `status=TOMADO` decrementa `estoqueAtual` em transação; estoque zerado → 409
- `dataHora` opcional no POST — default é `now()` do servidor (UTC)
- `horarioId` opcional no POST
- `GET /registros`: `limit` default 30 max 100; `offset` default 0; `desde`/`ate` são ISO dates
- `GET /idoso/hoje`: resolve "hoje" em `America/Fortaleza` (UTC-3)
- Para CUIDADOR: `?idosoId=` obrigatório em `/idoso/hoje`
- Commits da raiz; comandos npm em `server/`

---

## Mapa de arquivos

```
server/src/
├── utils/
│   └── datas.ts                ← CREATE (Task 1) — getHojeFortaleza, getInicio7DiasFortaleza
├── services/
│   ├── registros.service.ts    ← CREATE (Task 2) — criarRegistro, listarRegistros
│   └── idoso.service.ts        ← CREATE (Task 3) — getHoje
├── controllers/
│   ├── registros.controller.ts ← CREATE (Task 2)
│   └── idoso.controller.ts     ← CREATE (Task 3)
├── routes/
│   ├── registros.routes.ts     ← CREATE (Task 2) — mergeParams: true
│   └── idoso.routes.ts         ← CREATE (Task 3)
└── server.ts                   ← MODIFY (Tasks 2, 3) — wire novas rotas
```

---

### Task 1: Utils de data — fuso America/Fortaleza

**Files:**
- Create: `server/src/utils/datas.ts`

**Interfaces:**
- Produces:
  - `getHojeFortaleza(): { inicio: Date; fim: Date; dataStr: string }` — início e fim do dia de hoje em UTC equivalente ao dia de Fortaleza, mais a string `"YYYY-MM-DD"`
  - `getInicio7DiasFortaleza(): Date` — início de 7 dias atrás (inclusive hoje) em UTC

- [ ] **Step 1: Criar src/utils/datas.ts**

```typescript
const FORTALEZA_OFFSET_MS = -3 * 60 * 60 * 1000

function agoraEmFortaleza(): Date {
  return new Date(Date.now() + FORTALEZA_OFFSET_MS)
}

export function getHojeFortaleza(): { inicio: Date; fim: Date; dataStr: string } {
  const em = agoraEmFortaleza()
  const ano = em.getUTCFullYear()
  const mes = em.getUTCMonth()
  const dia = em.getUTCDate()
  // meia-noite em Fortaleza (UTC-3) = 03:00 UTC
  const inicio = new Date(Date.UTC(ano, mes, dia, 3, 0, 0))
  const fim = new Date(Date.UTC(ano, mes, dia + 1, 3, 0, 0))
  const dataStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
  return { inicio, fim, dataStr }
}

export function getInicio7DiasFortaleza(): Date {
  const em = agoraEmFortaleza()
  const ano = em.getUTCFullYear()
  const mes = em.getUTCMonth()
  const dia = em.getUTCDate()
  // 6 dias atrás para incluir hoje = janela de 7 dias
  return new Date(Date.UTC(ano, mes, dia - 6, 3, 0, 0))
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: nenhum output.

- [ ] **Step 3: Commit**

```bash
git add server/src/utils/datas.ts
git commit -m "feat: add datas util — Fortaleza timezone helpers"
```

---

### Task 2: Registros — POST e GET

**Files:**
- Create: `server/src/services/registros.service.ts`
- Create: `server/src/controllers/registros.controller.ts`
- Create: `server/src/routes/registros.routes.ts`
- Modify: `server/src/server.ts`

**Interfaces:**
- Consumes: `prisma`, `AppError`, `assertAccessToIdoso` de `utils/acesso.ts`
- Produces:
  - `criarRegistro(userId, tipo, medicamentoId, input): Promise<RegistroResult>`
  - `listarRegistros(userId, tipo, medicamentoId, query): Promise<ListaRegistrosResult>`
  - `POST /api/medicamentos/:id/registros` → 201
  - `GET /api/medicamentos/:id/registros` → 200

- [ ] **Step 1: Criar src/services/registros.service.ts**

```typescript
import { StatusTomada } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { AppError } from '../lib/errors'
import { assertAccessToIdoso } from '../utils/acesso'

interface CriarRegistroInput {
  status: StatusTomada
  horarioId?: number
  dataHora?: string
}

interface ListarRegistrosQuery {
  limit: number
  offset: number
  desde?: string
  ate?: string
}

export async function criarRegistro(
  userId: number,
  tipo: 'IDOSO' | 'CUIDADOR',
  medicamentoId: number,
  input: CriarRegistroInput
) {
  const medicamento = await prisma.medicamento.findUnique({ where: { id: medicamentoId } })
  if (!medicamento) {
    throw new AppError(404, 'NOT_FOUND', 'Medicamento não encontrado')
  }
  await assertAccessToIdoso(userId, tipo, medicamento.idosoId)

  const dataHora = input.dataHora ? new Date(input.dataHora) : new Date()

  if (input.status === 'TOMADO') {
    if (medicamento.estoqueAtual <= 0) {
      throw new AppError(409, 'ESTOQUE_ZERADO', 'Estoque insuficiente para registrar tomada')
    }

    const [registro, medAtualizado] = await prisma.$transaction([
      prisma.registroTomada.create({
        data: {
          medicamentoId,
          horarioId: input.horarioId ?? null,
          dataHora,
          status: 'TOMADO'
        }
      }),
      prisma.medicamento.update({
        where: { id: medicamentoId },
        data: { estoqueAtual: { decrement: 1 } },
        select: { id: true, estoqueAtual: true }
      })
    ])

    return {
      registro: {
        id: registro.id,
        medicamentoId: registro.medicamentoId,
        horarioId: registro.horarioId,
        dataHora: registro.dataHora.toISOString(),
        status: registro.status
      },
      medicamento: medAtualizado
    }
  }

  // status === 'PULADO'
  const registro = await prisma.registroTomada.create({
    data: {
      medicamentoId,
      horarioId: input.horarioId ?? null,
      dataHora,
      status: 'PULADO'
    }
  })

  return {
    registro: {
      id: registro.id,
      medicamentoId: registro.medicamentoId,
      horarioId: registro.horarioId,
      dataHora: registro.dataHora.toISOString(),
      status: registro.status
    },
    medicamento: { id: medicamento.id, estoqueAtual: medicamento.estoqueAtual }
  }
}

export async function listarRegistros(
  userId: number,
  tipo: 'IDOSO' | 'CUIDADOR',
  medicamentoId: number,
  query: ListarRegistrosQuery
) {
  const medicamento = await prisma.medicamento.findUnique({ where: { id: medicamentoId } })
  if (!medicamento) {
    throw new AppError(404, 'NOT_FOUND', 'Medicamento não encontrado')
  }
  await assertAccessToIdoso(userId, tipo, medicamento.idosoId)

  const where = {
    medicamentoId,
    ...(query.desde || query.ate ? {
      dataHora: {
        ...(query.desde && { gte: new Date(query.desde) }),
        ...(query.ate && { lte: new Date(query.ate) })
      }
    } : {})
  }

  const [registros, total] = await Promise.all([
    prisma.registroTomada.findMany({
      where,
      orderBy: { dataHora: 'desc' },
      take: query.limit,
      skip: query.offset,
      select: { id: true, horarioId: true, dataHora: true, status: true }
    }),
    prisma.registroTomada.count({ where })
  ])

  return {
    registros: registros.map(r => ({
      id: r.id,
      horarioId: r.horarioId,
      dataHora: r.dataHora.toISOString(),
      status: r.status
    })),
    total
  }
}
```

- [ ] **Step 2: Criar src/controllers/registros.controller.ts**

```typescript
import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { criarRegistro, listarRegistros } from '../services/registros.service'

const criarRegistroSchema = z.object({
  status: z.enum(['TOMADO', 'PULADO']),
  horarioId: z.number().int().positive().optional(),
  dataHora: z.string().optional()
})

const listarQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(30),
  offset: z.coerce.number().int().min(0).default(0),
  desde: z.string().optional(),
  ate: z.string().optional()
})

export async function criar(req: Request, res: Response, next: NextFunction): Promise<void> {
  const medicamentoId = Number(req.params.id)
  const result = criarRegistroSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Dados inválidos', details: result.error.flatten() })
    return
  }
  try {
    const data = await criarRegistro(req.user!.id, req.user!.tipo, medicamentoId, result.data)
    res.status(201).json(data)
  } catch (err) { next(err) }
}

export async function listar(req: Request, res: Response, next: NextFunction): Promise<void> {
  const medicamentoId = Number(req.params.id)
  const result = listarQuerySchema.safeParse(req.query)
  if (!result.success) {
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Query inválida', details: result.error.flatten() })
    return
  }
  try {
    const data = await listarRegistros(req.user!.id, req.user!.tipo, medicamentoId, result.data)
    res.json(data)
  } catch (err) { next(err) }
}
```

- [ ] **Step 3: Criar src/routes/registros.routes.ts**

```typescript
import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware'
import { criar, listar } from '../controllers/registros.controller'

export const registrosRoutes = Router({ mergeParams: true })

registrosRoutes.post('/', authMiddleware, criar)
registrosRoutes.get('/', authMiddleware, listar)
```

- [ ] **Step 4: Atualizar src/server.ts — adicionar registrosRoutes**

```typescript
import express from 'express'
import dotenv from 'dotenv'
import { authRoutes } from './routes/auth.routes'
import { usuariosRoutes } from './routes/usuarios.routes'
import { vinculosRoutes } from './routes/vinculos.routes'
import { cuidadorRoutes } from './routes/cuidador.routes'
import { medicamentosRoutes } from './routes/medicamentos.routes'
import { registrosRoutes } from './routes/registros.routes'
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
app.use('/api/medicamentos/:id/registros', registrosRoutes)

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

- [ ] **Step 5: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: nenhum output.

- [ ] **Step 6: Subir e testar registros**

Crie um medicamento com `estoqueAtual: 3` e guarde o id (ex: 1) e o `horarioId` (ex: 1).

Registrar TOMADO:

```bash
curl -s -X POST http://localhost:7000/api/medicamentos/1/registros \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_IDOSO" \
  -d '{"status":"TOMADO","horarioId":1}'
```

Esperado (201): `{ "registro": {..., "status":"TOMADO"}, "medicamento": {"id":1, "estoqueAtual":2} }`

Registrar PULADO:

```bash
curl -s -X POST http://localhost:7000/api/medicamentos/1/registros \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_IDOSO" \
  -d '{"status":"PULADO","horarioId":2}'
```

Esperado (201): estoque não muda.

Listar registros:

```bash
curl -s "http://localhost:7000/api/medicamentos/1/registros" \
  -H "Authorization: Bearer TOKEN_IDOSO"
```

Esperado (200): `{ "registros": [...], "total": 2 }`

Zerar estoque e testar 409: atualize `estoqueAtual` para 0 via PUT e tente registrar TOMADO.

```bash
curl -s -X PUT http://localhost:7000/api/medicamentos/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_IDOSO" \
  -d '{"estoqueAtual":0}'

curl -s -X POST http://localhost:7000/api/medicamentos/1/registros \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_IDOSO" \
  -d '{"status":"TOMADO"}'
```

Esperado: 409 `ESTOQUE_ZERADO`.

- [ ] **Step 7: Commit**

```bash
git add server/src/services/registros.service.ts server/src/controllers/registros.controller.ts server/src/routes/registros.routes.ts server/src/server.ts
git commit -m "feat: add POST e GET /api/medicamentos/:id/registros"
```

---

### Task 3: /idoso/hoje

**Files:**
- Create: `server/src/services/idoso.service.ts`
- Create: `server/src/controllers/idoso.controller.ts`
- Create: `server/src/routes/idoso.routes.ts`
- Modify: `server/src/server.ts`

**Interfaces:**
- Consumes: `prisma`, `AppError`, `assertAccessToIdoso`, `getHojeFortaleza` de `utils/datas.ts`
- Produces:
  - `getHoje(userId, tipo, idosoId?): Promise<HojeResult>`
  - `GET /api/idoso/hoje` → 200

- [ ] **Step 1: Criar src/services/idoso.service.ts**

```typescript
import { prisma } from '../lib/prisma'
import { AppError } from '../lib/errors'
import { assertAccessToIdoso } from '../utils/acesso'
import { getHojeFortaleza } from '../utils/datas'

export async function getHoje(
  userId: number,
  tipo: 'IDOSO' | 'CUIDADOR',
  idosoIdQuery?: number
) {
  const idosoId = tipo === 'IDOSO' ? userId : idosoIdQuery
  if (tipo === 'CUIDADOR' && !idosoId) {
    throw new AppError(400, 'IDOSO_ID_OBRIGATORIO', 'idosoId é obrigatório para CUIDADOR')
  }
  await assertAccessToIdoso(userId, tipo, idosoId!)

  const { inicio, fim, dataStr } = getHojeFortaleza()

  const medicamentos = await prisma.medicamento.findMany({
    where: { idosoId },
    include: {
      horarios: {
        include: {
          registros: {
            where: { dataHora: { gte: inicio, lt: fim } },
            orderBy: { dataHora: 'desc' },
            take: 1
          }
        }
      }
    }
  })

  return {
    data: dataStr,
    medicamentos: medicamentos.map(med => ({
      id: med.id,
      nome: med.nome,
      dosagem: med.dosagem,
      estoqueAtual: med.estoqueAtual,
      horarios: med.horarios.map(h => {
        const registro = h.registros[0]
        return {
          horarioId: h.id,
          hora: h.hora,
          status: registro?.status ?? 'PENDENTE',
          registroId: registro?.id ?? null,
          registradoEm: registro?.dataHora.toISOString() ?? null
        }
      })
    }))
  }
}
```

- [ ] **Step 2: Criar src/controllers/idoso.controller.ts**

```typescript
import { Request, Response, NextFunction } from 'express'
import { getHoje } from '../services/idoso.service'

export async function hoje(req: Request, res: Response, next: NextFunction): Promise<void> {
  const idosoId = req.query.idosoId ? Number(req.query.idosoId) : undefined
  try {
    const data = await getHoje(req.user!.id, req.user!.tipo, idosoId)
    res.json(data)
  } catch (err) { next(err) }
}
```

- [ ] **Step 3: Criar src/routes/idoso.routes.ts**

```typescript
import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware'
import { hoje } from '../controllers/idoso.controller'

export const idosoRoutes = Router()

idosoRoutes.get('/hoje', authMiddleware, hoje)
```

- [ ] **Step 4: Atualizar src/server.ts — versão final da Fase 3**

```typescript
import express from 'express'
import dotenv from 'dotenv'
import { authRoutes } from './routes/auth.routes'
import { usuariosRoutes } from './routes/usuarios.routes'
import { vinculosRoutes } from './routes/vinculos.routes'
import { cuidadorRoutes } from './routes/cuidador.routes'
import { medicamentosRoutes } from './routes/medicamentos.routes'
import { registrosRoutes } from './routes/registros.routes'
import { idosoRoutes } from './routes/idoso.routes'
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
app.use('/api/medicamentos/:id/registros', registrosRoutes)
app.use('/api/idoso', idosoRoutes)

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

- [ ] **Step 5: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: nenhum output.

- [ ] **Step 6: Testar /idoso/hoje**

Com o medicamento de estoque 2 criado anteriormente (horarioId 1 TOMADO, horarioId 2 PULADO), chame:

```bash
curl -s "http://localhost:7000/api/idoso/hoje" \
  -H "Authorization: Bearer TOKEN_IDOSO"
```

Esperado (200):
```json
{
  "data": "2026-07-01",
  "medicamentos": [
    {
      "id": 1, "nome": "Losartana", "dosagem": "50mg", "estoqueAtual": 2,
      "horarios": [
        { "horarioId": 1, "hora": "08:00", "status": "TOMADO", "registroId": 1, "registradoEm": "..." },
        { "horarioId": 2, "hora": "20:00", "status": "PULADO", "registroId": 2, "registradoEm": "..." }
      ]
    }
  ]
}
```

Testar cuidador com `?idosoId=`:

```bash
curl -s "http://localhost:7000/api/idoso/hoje?idosoId=ID_IDOSO" \
  -H "Authorization: Bearer TOKEN_CUIDADOR"
```

Testar cuidador sem `idosoId` → 400.

- [ ] **Step 7: Commit final**

```bash
git add server/src/services/idoso.service.ts server/src/controllers/idoso.controller.ts server/src/routes/idoso.routes.ts server/src/server.ts
git commit -m "feat: add GET /api/idoso/hoje — checklist diário com status por horário (Fase 3)"
```
