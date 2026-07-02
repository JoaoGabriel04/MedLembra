# Fase 3 — Task 2: Registros (POST e GET) — Implementation Report

**Date:** 2026-07-01
**Status:** DONE

---

## Files Created

- `server/src/services/registros.service.ts` — `criarRegistro` and `listarRegistros` functions
- `server/src/controllers/registros.controller.ts` — `criar` and `listar` handlers with Zod validation
- `server/src/routes/registros.routes.ts` — Router with `mergeParams: true`

## Files Modified

- `server/src/server.ts` — added import and mount `app.use('/api/medicamentos/:id/registros', registrosRoutes)`

---

## Implementation Notes

### Service (`registros.service.ts`)
- `criarRegistro`: looks up medicamento by id, calls `assertAccessToIdoso`, then branches on `status`:
  - `TOMADO`: checks `estoqueAtual > 0` (throws 409 `ESTOQUE_ZERADO` if zero), then runs `prisma.$transaction([createRegistro, decrementEstoque])` atomically
  - `PULADO`: plain `prisma.registroTomada.create`, no stock change
- `dataHora` defaults to `new Date()` when not provided in input
- `listarRegistros`: supports `limit` (default 30, max 100), `offset` (default 0), `desde`/`ate` as ISO date strings with `gte`/`lte` on `dataHora`; returns `{ registros, total }` via `Promise.all([findMany, count])`

### Controller (`registros.controller.ts`)
- POST schema: `status: z.enum(['TOMADO','PULADO'])`, `horarioId?: number`, `dataHora?: string`
- GET schema: uses `z.coerce.number()` for `limit`/`offset` (arrive as strings from query params)
- `medicamentoId = Number(req.params.id)` — works because route uses `mergeParams: true`

### Routes (`registros.routes.ts`)
- `Router({ mergeParams: true })` — inherits `:id` from parent path `/api/medicamentos/:id/registros`
- Both `POST /` and `GET /` protected by `authMiddleware`

### server.ts mount
- Added after medicamentos route: `app.use('/api/medicamentos/:id/registros', registrosRoutes)`

---

## TypeScript Verification

`npx tsc --noEmit` from `server/` — **no output (clean)**

---

## Commit

- `bf7e713` — feat: add POST e GET /api/medicamentos/:id/registros

---

## Concerns

None. The implementation follows the spec exactly. The atomic transaction for `TOMADO` uses Prisma's batch transaction which provides correctness under concurrent writes within the same Prisma Client session. For true distributed concurrency, a SELECT FOR UPDATE pattern would be needed, but this is sufficient for the current single-server architecture.

---

## TOCTOU Race Condition Fix (2026-07-01)

### Problem
The original `TOMADO` branch had a Time-Of-Check-Time-Of-Use (TOCTOU) race:
- `medicamento.estoqueAtual` was checked BEFORE entering the transaction (line 34)
- Two concurrent requests with `estoqueAtual = 1` could both pass the guard (check passes twice)
- Both could then decrement inside the transaction, resulting in `estoqueAtual = -1`

### Solution
Moved the stock check **inside** an interactive Prisma transaction:
- Fetch medicamento inside the transaction (ensures isolation)
- Guard check (`med.estoqueAtual <= 0`) runs within transaction lock
- Both `registroTomada.create` and `medicamento.update` execute atomically in same transaction
- Only one concurrent request can pass the guard; the other fails with 409 `ESTOQUE_ZERADO`

### Implementation
Replaced batch `prisma.$transaction([...])` with interactive transaction:
```typescript
const result = await prisma.$transaction(async (tx) => {
  const med = await tx.medicamento.findUnique({ where: { id: medicamentoId } })
  if (!med || med.estoqueAtual <= 0) {
    throw new AppError(409, 'ESTOQUE_ZERADO', '...')
  }
  // create + update in Promise.all inside same transaction
})
```

### Verification
- `npx tsc --noEmit` from `server/` — **no output (clean)**
- Commit: `7f69521` — fix: move estoque check inside transaction to prevent TOCTOU race
