# Fase 3 — Task 3: /idoso/hoje — Implementation Report

**Date:** 2026-07-01
**Status:** DONE

## Commit

`f0b91d3` feat: add GET /api/idoso/hoje — checklist diário com status por horário (Fase 3)

## Files Created / Modified

| File | Action |
|---|---|
| `server/src/services/idoso.service.ts` | Created |
| `server/src/controllers/idoso.controller.ts` | Created |
| `server/src/routes/idoso.routes.ts` | Created |
| `server/src/server.ts` | Modified — added idosoRoutes import + mount |

## TypeScript Verification

`npx tsc --noEmit` from `server/` produced no output (clean).

## Implementation Summary

### idoso.service.ts — getHoje()
- Resolves `idosoId`: if `tipo === 'IDOSO'` uses `userId`; if `CUIDADOR` uses `idosoIdQuery`; throws `AppError(400, 'IDOSO_ID_OBRIGATORIO', ...)` when CUIDADOR and no `idosoIdQuery`.
- Calls `assertAccessToIdoso(userId, tipo, idosoId)` to validate access.
- Calls `getHojeFortaleza()` to get `{ inicio, fim, dataStr }`.
- Queries `prisma.medicamento.findMany` with `include: { horarios: { include: { registros: { where: { dataHora: { gte, lt } }, orderBy: { dataHora: 'desc' }, take: 1 } } } }`.
- Maps result: `horarios[].registros[0]` → status (or `'PENDENTE'`), registroId (or `null`), registradoEm (or `null`).

### idoso.controller.ts — hoje()
- Reads `idosoId` from `req.query.idosoId` (coerced to number or `undefined`).
- Delegates to `getHoje(req.user!.id, req.user!.tipo, idosoId)`.
- Errors forwarded to `next(err)`.

### idoso.routes.ts
- `Router()` (no mergeParams needed).
- `GET /hoje` protected by `authMiddleware`.

### server.ts
- Added `import { idosoRoutes } from './routes/idoso.routes'`.
- Added `app.use('/api/idoso', idosoRoutes)` after registrosRoutes, before errorHandler.

## Concerns

None. Implementation is a direct translation of the spec with no deviations.
