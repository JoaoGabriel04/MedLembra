# Fase 2 — Task 3: Medicamentos Controller, Routes, server.ts

**Status:** DONE
**Date:** 2026-07-01

## Files Created / Modified

| File | Action |
|------|--------|
| `server/src/controllers/medicamentos.controller.ts` | Created |
| `server/src/routes/medicamentos.routes.ts` | Created |
| `server/src/server.ts` | Modified — added medicamentosRoutes import and mount at `/api/medicamentos` |

## What Was Implemented

### Controller (`medicamentos.controller.ts`)
- `criar` — validates via `criarSchema` (Zod), calls `criarMedicamento`, returns 201
- `listar` — reads optional `?idosoId` query param, calls `listarMedicamentos`, returns 200
- `getUm` — parses `req.params.id`, calls `getMedicamento`, returns 200
- `atualizar` — validates via `atualizarSchema` (Zod), calls `atualizarMedicamento`, returns 200
- `deletar` — parses `req.params.id`, calls `deletarMedicamento`, returns 204
- Both schemas enforce `horarios.length === frequenciaDiaria` via `.refine()`
- All handlers forward errors to `next(err)` for the global error middleware

### Routes (`medicamentos.routes.ts`)
- `POST /` → authMiddleware + criar
- `GET /` → authMiddleware + listar
- `GET /:id` → authMiddleware + getUm
- `PUT /:id` → authMiddleware + atualizar
- `DELETE /:id` → authMiddleware + deletar

### server.ts
- Added import of `medicamentosRoutes`
- Mounted at `app.use('/api/medicamentos', medicamentosRoutes)`

## TypeScript Verification

```
npx tsc --noEmit
```

Result: no output (zero errors/warnings).

## Commit

```
b04b064 feat: add medicamentos endpoints — CRUD completo (Fase 2)
```

3 files changed, 99 insertions(+)

## Self-Review

- All 5 CRUD endpoints wired correctly per the plan spec
- HTTP status codes match plan: 201 POST, 200 GET/PUT, 204 DELETE
- Zod validation guards both `criar` and `atualizar` before hitting service layer
- `req.user!.id` and `req.user!.tipo` injected by `authMiddleware` — typed via `express.d.ts`
- No extra files created, no gold-plating
- CRLF line-ending warnings from Git are cosmetic (Windows repo config) — no functional impact

## Concerns

None.
