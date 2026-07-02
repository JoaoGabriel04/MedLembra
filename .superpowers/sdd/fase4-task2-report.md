# Fase 4 — Task 2: Dashboard service, controller e rotas

## Status: DONE

## Commit
- `6e2f5bb` feat: add GET /cuidador/dashboard/:idosoId e /cuidador/alertas — Fase 4 completa

## Files Created/Modified
- CREATE `server/src/services/dashboard.service.ts`
- CREATE `server/src/controllers/dashboard.controller.ts`
- MODIFY `server/src/routes/cuidador.routes.ts`

## TypeScript Check
`npx tsc --noEmit` from `server/` — zero output, zero errors.

## Implementation Summary

### dashboard.service.ts
- `getDashboard(cuidadorId, idosoId)`: calls `assertAccessToIdoso`, fetches idoso and medicamentos, queries `registroTomada` filtered by `medicamento.idosoId` and `dataHora >= getInicio7DiasFortaleza()`, computes totalTomadas/totalPuladas/totalPendentes/adesao7dias, calls `calcularAlertas`.
- `getAlertas(cuidadorId)`: fetches all idosos where `cuidadorId = cuidadorId`, loops each idoso fetching their medicamentos and running `calcularAlertas`, merges alerts with `idosoId` and `idosoNome` via spread.

### dashboard.controller.ts
- `dashboard`: parses `req.params.idosoId` as Number, delegates to `getDashboard(req.user!.id, idosoId)`, forwards errors to `next`.
- `alertas`: delegates to `getAlertas(req.user!.id)`, forwards errors to `next`.

### cuidador.routes.ts
- Added import of `dashboard, alertas` from `dashboard.controller`.
- Added two routes while keeping existing `GET /idosos`:
  - `GET /dashboard/:idosoId` — authMiddleware + requireTipo('CUIDADOR') + dashboard
  - `GET /alertas` — authMiddleware + requireTipo('CUIDADOR') + alertas

## Concerns
None. All types align with the Prisma schema and existing utils. The `RegistroTomada.status` field is typed as `StatusTomada` enum; string comparison with `'TOMADO'` and `'PULADO'` is valid in TypeScript with Prisma's generated types. Line endings triggered a CRLF warning from Git (Windows repo default), which is harmless.

---

## Fase 4 — Task 2: Critical Bug Fixes

### Status: DONE

### Commit
- `9dc8746` fix: validate idosoId param and null-check idoso in dashboard

### Fixes Applied

#### Issue 1: NaN idosoId guard in dashboard.controller.ts
**Location:** `server/src/controllers/dashboard.controller.ts`, lines 5-6

Added validation guard after `Number(req.params.idosoId)` conversion:
```typescript
const idosoId = Number(req.params.idosoId)
if (!Number.isInteger(idosoId) || idosoId <= 0) {
  res.status(400).json({ error: 'BAD_REQUEST', message: 'idosoId inválido' })
  return
}
```

**Rationale:** Non-numeric input (e.g., `/cuidador/dashboard/abc`) would convert to NaN, then silently fail queries with database errors. Now returns explicit 400 BAD_REQUEST.

#### Issue 2: Null guard for idoso in dashboard.service.ts
**Location:** `server/src/services/dashboard.service.ts`, lines 9-17

Added null check after `prisma.usuario.findUnique`:
```typescript
const idoso = await prisma.usuario.findUnique({
  where: { id: idosoId },
  select: { id: true, nome: true, email: true }
})

if (!idoso) {
  throw new AppError(404, 'NOT_FOUND', 'Idoso não encontrado')
}
```

**Rationale:** Narrows TypeScript type from `Usuario | null` to `Usuario`, eliminates implicit `undefined` references, explicit 404 error handling.

**Additional change:** Added missing import `import { AppError } from '../lib/errors'` to support the fix.

### TypeScript Check
`npx tsc --noEmit` from `server/` — zero output, zero errors. ✓
