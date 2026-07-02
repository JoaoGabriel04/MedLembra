# MedLembra — Fase 4: Dashboard e Alertas

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar o dashboard consolidado do cuidador (`/cuidador/dashboard/:idosoId`) e a listagem de alertas de todos os idosos vinculados (`/cuidador/alertas`), com cálculos de adesão dos últimos 7 dias e detecção de estoque baixo e validade próxima.

**Architecture:** `utils/alertas.ts` centraliza a lógica de detecção de alertas (`ESTOQUE_BAIXO` e `VALIDADE_PROXIMA`). Os novos endpoints são adicionados ao `cuidador.routes.ts` existente, com controller e service separados por clareza. O cálculo de 7 dias reutiliza `getInicio7DiasFortaleza` do `utils/datas.ts` criado na Fase 3.

**Tech Stack:** Express 5, Prisma 7, TypeScript 6.

## Global Constraints

- TypeScript `strict: true`, `module: CommonJS`
- Base URL: `/api`
- JWT Bearer token
- Apenas `CUIDADOR` acessa os endpoints desta fase
- `adesao7dias = totalTomadas7dias / totalDosesAgendadas7dias`, arredondado a 2 casas decimais
- `totalDosesAgendadas7dias = soma de frequenciaDiaria * 7` para todos os medicamentos do idoso
- `ESTOQUE_BAIXO`: `Math.floor(estoqueAtual / frequenciaDiaria) <= 7`
- `VALIDADE_PROXIMA`: `dataValidade - hoje <= 30 dias`
- `diasRestantes` e `diasParaVencer` arredondados para baixo/para cima respectivamente
- Commits da raiz; comandos npm em `server/`

---

## Mapa de arquivos

```
server/src/
├── utils/
│   └── alertas.ts              ← CREATE (Task 1) — calcularAlertas
├── services/
│   └── dashboard.service.ts    ← CREATE (Task 2) — getDashboard, getAlertas
├── controllers/
│   └── dashboard.controller.ts ← CREATE (Task 2)
└── routes/
    └── cuidador.routes.ts      ← MODIFY (Task 2) — adicionar /dashboard/:idosoId e /alertas
```

Nota: `server.ts` **não** precisa de alteração — `cuidadorRoutes` já está montado em `/api/cuidador`.

---

### Task 1: Utils de alertas

**Files:**
- Create: `server/src/utils/alertas.ts`

**Interfaces:**
- Consumes: nada externo
- Produces:
  - `type Alerta = AlertaEstoqueBaixo | AlertaValidadeProxima`
  - `calcularAlertas(medicamentos: MedParaAlerta[]): Alerta[]`

- [ ] **Step 1: Criar src/utils/alertas.ts**

```typescript
export interface MedParaAlerta {
  id: number
  nome: string
  estoqueAtual: number
  frequenciaDiaria: number
  dataValidade: Date
}

export interface AlertaEstoqueBaixo {
  tipo: 'ESTOQUE_BAIXO'
  medicamentoId: number
  medicamentoNome: string
  diasRestantes: number
}

export interface AlertaValidadeProxima {
  tipo: 'VALIDADE_PROXIMA'
  medicamentoId: number
  medicamentoNome: string
  diasParaVencer: number
  dataValidade: string
}

export type Alerta = AlertaEstoqueBaixo | AlertaValidadeProxima

export function calcularAlertas(medicamentos: MedParaAlerta[]): Alerta[] {
  const hojeMs = Date.UTC(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    new Date().getUTCDate()
  )

  const alertas: Alerta[] = []

  for (const med of medicamentos) {
    const diasRestantes = Math.floor(med.estoqueAtual / med.frequenciaDiaria)
    if (diasRestantes <= 7) {
      alertas.push({
        tipo: 'ESTOQUE_BAIXO',
        medicamentoId: med.id,
        medicamentoNome: med.nome,
        diasRestantes
      })
    }

    const validadeMs = med.dataValidade.getTime()
    const diasParaVencer = Math.ceil((validadeMs - hojeMs) / (1000 * 60 * 60 * 24))
    if (diasParaVencer <= 30) {
      alertas.push({
        tipo: 'VALIDADE_PROXIMA',
        medicamentoId: med.id,
        medicamentoNome: med.nome,
        diasParaVencer,
        dataValidade: med.dataValidade.toISOString().slice(0, 10)
      })
    }
  }

  return alertas
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: nenhum output.

- [ ] **Step 3: Commit**

```bash
git add server/src/utils/alertas.ts
git commit -m "feat: add alertas util — ESTOQUE_BAIXO e VALIDADE_PROXIMA"
```

---

### Task 2: Dashboard service, controller e rotas

**Files:**
- Create: `server/src/services/dashboard.service.ts`
- Create: `server/src/controllers/dashboard.controller.ts`
- Modify: `server/src/routes/cuidador.routes.ts`

**Interfaces:**
- Consumes: `prisma`, `AppError`, `assertAccessToIdoso`, `getInicio7DiasFortaleza` de `utils/datas.ts`, `calcularAlertas` de `utils/alertas.ts`
- Produces:
  - `getDashboard(cuidadorId, idosoId): Promise<DashboardResult>`
  - `getAlertas(cuidadorId): Promise<{ alertas: AlertaComIdoso[] }>`
  - `GET /api/cuidador/dashboard/:idosoId` → 200 (apenas CUIDADOR)
  - `GET /api/cuidador/alertas` → 200 (apenas CUIDADOR)

- [ ] **Step 1: Criar src/services/dashboard.service.ts**

```typescript
import { prisma } from '../lib/prisma'
import { assertAccessToIdoso } from '../utils/acesso'
import { getInicio7DiasFortaleza } from '../utils/datas'
import { calcularAlertas, Alerta } from '../utils/alertas'

export async function getDashboard(cuidadorId: number, idosoId: number) {
  await assertAccessToIdoso(cuidadorId, 'CUIDADOR', idosoId)

  const idoso = await prisma.usuario.findUnique({
    where: { id: idosoId },
    select: { id: true, nome: true, email: true }
  })

  const medicamentos = await prisma.medicamento.findMany({
    where: { idosoId },
    select: { id: true, nome: true, estoqueAtual: true, frequenciaDiaria: true, dataValidade: true }
  })

  const inicio7dias = getInicio7DiasFortaleza()

  const registros = await prisma.registroTomada.findMany({
    where: {
      medicamento: { idosoId },
      dataHora: { gte: inicio7dias }
    },
    select: { status: true }
  })

  const totalTomadas = registros.filter(r => r.status === 'TOMADO').length
  const totalPuladas = registros.filter(r => r.status === 'PULADO').length
  const totalDosesAgendadas = medicamentos.reduce((acc, m) => acc + m.frequenciaDiaria * 7, 0)
  const totalPendentes = Math.max(0, totalDosesAgendadas - totalTomadas - totalPuladas)
  const adesao = totalDosesAgendadas > 0
    ? Math.round((totalTomadas / totalDosesAgendadas) * 100) / 100
    : 0

  const alertas = calcularAlertas(medicamentos)

  return {
    idoso,
    resumo: {
      totalMedicamentos: medicamentos.length,
      adesao7dias: adesao,
      totalDosesAgendadas7dias: totalDosesAgendadas,
      totalTomadas7dias: totalTomadas,
      totalPuladas7dias: totalPuladas,
      totalPendentes7dias: totalPendentes
    },
    alertas
  }
}

export async function getAlertas(cuidadorId: number) {
  const idosos = await prisma.usuario.findMany({
    where: { cuidadorId },
    select: { id: true, nome: true }
  })

  const todasAlertas: Array<Alerta & { idosoId: number; idosoNome: string }> = []

  for (const idoso of idosos) {
    const medicamentos = await prisma.medicamento.findMany({
      where: { idosoId: idoso.id },
      select: { id: true, nome: true, estoqueAtual: true, frequenciaDiaria: true, dataValidade: true }
    })

    const alertas = calcularAlertas(medicamentos)
    for (const alerta of alertas) {
      todasAlertas.push({ idosoId: idoso.id, idosoNome: idoso.nome, ...alerta })
    }
  }

  return { alertas: todasAlertas }
}
```

- [ ] **Step 2: Criar src/controllers/dashboard.controller.ts**

```typescript
import { Request, Response, NextFunction } from 'express'
import { getDashboard, getAlertas } from '../services/dashboard.service'

export async function dashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  const idosoId = Number(req.params.idosoId)
  try {
    const data = await getDashboard(req.user!.id, idosoId)
    res.json(data)
  } catch (err) { next(err) }
}

export async function alertas(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await getAlertas(req.user!.id)
    res.json(data)
  } catch (err) { next(err) }
}
```

- [ ] **Step 3: Atualizar src/routes/cuidador.routes.ts**

```typescript
import { Router } from 'express'
import { authMiddleware, requireTipo } from '../middlewares/auth.middleware'
import { getIdosos } from '../controllers/cuidador.controller'
import { dashboard, alertas } from '../controllers/dashboard.controller'

export const cuidadorRoutes = Router()

cuidadorRoutes.get('/idosos', authMiddleware, requireTipo('CUIDADOR'), getIdosos)
cuidadorRoutes.get('/dashboard/:idosoId', authMiddleware, requireTipo('CUIDADOR'), dashboard)
cuidadorRoutes.get('/alertas', authMiddleware, requireTipo('CUIDADOR'), alertas)
```

- [ ] **Step 4: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: nenhum output.

- [ ] **Step 5: Subir e testar dashboard**

Garanta que há: 1 cuidador vinculado a 1 idoso, com pelo menos 1 medicamento com alguns registros de tomada.

```bash
curl -s http://localhost:7000/api/cuidador/dashboard/ID_IDOSO \
  -H "Authorization: Bearer TOKEN_CUIDADOR"
```

Esperado (200):
```json
{
  "idoso": { "id": 2, "nome": "Maria Idosa", "email": "idosa@teste.com" },
  "resumo": {
    "totalMedicamentos": 1,
    "adesao7dias": 0.14,
    "totalDosesAgendadas7dias": 14,
    "totalTomadas7dias": 2,
    "totalPuladas7dias": 1,
    "totalPendentes7dias": 11
  },
  "alertas": []
}
```

Testar alertas de estoque baixo: atualize `estoqueAtual` do medicamento para 5 com `frequenciaDiaria: 2` → `diasRestantes = 2`, entra alerta `ESTOQUE_BAIXO`.

```bash
curl -s -X PUT http://localhost:7000/api/medicamentos/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_IDOSO" \
  -d '{"estoqueAtual":5}'

curl -s http://localhost:7000/api/cuidador/dashboard/ID_IDOSO \
  -H "Authorization: Bearer TOKEN_CUIDADOR"
```

Esperado: `alertas` com `{ "tipo": "ESTOQUE_BAIXO", "diasRestantes": 2, ... }`.

Testar validade próxima: crie um medicamento com `dataValidade` daqui a 10 dias.

```bash
curl -s http://localhost:7000/api/cuidador/alertas \
  -H "Authorization: Bearer TOKEN_CUIDADOR"
```

Esperado (200): `{ "alertas": [...] }` com alertas de todos os idosos.

Testar acesso negado: chamar `/dashboard/:id` com token de IDOSO → 403.

- [ ] **Step 6: Commit final**

```bash
git add server/src/services/dashboard.service.ts server/src/controllers/dashboard.controller.ts server/src/routes/cuidador.routes.ts
git commit -m "feat: add GET /cuidador/dashboard/:idosoId e /cuidador/alertas — Fase 4 completa"
```

---

## Verificação Final — Todas as Fases

Tabela completa de endpoints após Fases 2–4:

| Endpoint | Auth | Tipo | Status |
|---|---|---|---|
| POST /api/medicamentos | Sim | qualquer | 201 |
| GET /api/medicamentos?idosoId= | Sim | qualquer | 200 |
| GET /api/medicamentos/:id | Sim | qualquer | 200 |
| PUT /api/medicamentos/:id | Sim | qualquer | 200 |
| DELETE /api/medicamentos/:id | Sim | qualquer | 204 |
| POST /api/medicamentos/:id/registros | Sim | qualquer | 201 |
| GET /api/medicamentos/:id/registros | Sim | qualquer | 200 |
| GET /api/idoso/hoje | Sim | qualquer | 200 |
| GET /api/cuidador/dashboard/:idosoId | Sim | CUIDADOR | 200 |
| GET /api/cuidador/alertas | Sim | CUIDADOR | 200 |
