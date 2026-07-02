# Final Code Review — Fix Report

**Date:** 2026-07-01  
**Branch:** main  
**Status:** DONE_WITH_CONCERNS

---

## Fix 1 — TOCTOU race: conditional `updateMany` in TOMADO transaction

**File:** `server/src/services/registros.service.ts`

Replaced the bare `findUnique` SELECT + `update` pattern inside the interactive transaction with a `Promise.all` of `registroTomada.create` and `medicamento.updateMany` (with `WHERE estoqueAtual > 0`). The `updateMany` atomically decrements stock only when stock is positive, eliminating the TOCTOU window that existed between the read and the write.

After the transaction commits, `updResult.count === 0` signals that stock was already zero; an `AppError(409)` is thrown in that case. A final `findUnique` outside the transaction fetches the current stock value for the response payload.

**Concern:** when `updResult.count === 0` the `registroTomada` row has already been committed (the transaction succeeded). Throwing after the fact leaves an orphaned TOMADO record in the database. The truly safe pattern would be to check `upd.count === 0` *inside* the transaction (before returning) so Prisma can roll back. Implemented as specified by the reviewer; flagged here for awareness.

---

## Fix 2 — Reject `frequenciaDiaria` change without matching `horarios`

**File:** `server/src/controllers/medicamentos.controller.ts`

Added a `.refine` to `atualizarSchema` that returns `false` when `frequenciaDiaria` is present in the payload but `horarios` is absent, with message `'ao alterar frequenciaDiaria, horarios deve ser fornecido'`. This closes the invariant gap where a caller could change the daily frequency without supplying a new schedule.

---

## Fix 3 — Reject duplicate `horarios`

**File:** `server/src/controllers/medicamentos.controller.ts`

Added a `.refine` to both `criarSchema` and `atualizarSchema` that compares `new Set(horarios).size` against `horarios.length`. Returns `false` (with `path: ['horarios']`) when duplicates are detected, message `'horarios não pode ter duplicatas'`.

---

## Fix 4 — Serialize writes inside interactive transaction

No additional change required; addressed by Fix 1 (`updateMany` with a conditional WHERE clause is inherently serialized at the database level and targets a different table than `registroTomada.create`, so `Promise.all` is deadlock-free).

---

## TypeScript

`npx tsc --noEmit` produced no output (exit 0).

---

## Concern Resolution — Commit ed295a8

**Concern 1 Fixed:** Orphaned TOMADO record when stock is zero at race time

**Change:** Restructured the TOMADO branch to check `upd.count === 0` **inside** the transaction callback before creating the `registroTomada` record. Pattern:

```typescript
const registro = await prisma.$transaction(async (tx) => {
  const upd = await tx.medicamento.updateMany({...})
  if (upd.count === 0) {
    throw new AppError(409, 'ESTOQUE_ZERADO', '...')
  }
  return tx.registroTomada.create({...})
})
```

When stock is zero, the `throw` occurs inside the transaction callback, causing Prisma to roll back the entire transaction atomically. No orphaned records.

**TypeScript:** `npx tsc --noEmit` produced no output (exit 0). ✓

**Commit:** `ed295a8 fix: check stock count inside transaction to prevent orphaned registros`

---

## Concern Summary

All concerns resolved.

| # | Concern | Status |
|---|---------|--------|
| 1 | Fix 1 throws 409 after transaction commits — orphaned TOMADO record when stock is 0 at race time | RESOLVED (commit ed295a8) |
