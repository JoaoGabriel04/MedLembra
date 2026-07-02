# Fase 2 — Task 2: Medicamentos Service — Implementation Report

**Date:** 2026-07-01
**Status:** DONE
**Commit:** 7f7a00c — feat: add medicamentos service — CRUD with horarios

---

## What Was Done

Created `server/src/services/medicamentos.service.ts` implementing the full CRUD for Medicamentos with Horarios, exactly as specified in the plan at `server/docs/superpowers/plans/2026-07-01-fase2-medicamentos.md` (Task 2).

### Exports

| Function | Signature |
|---|---|
| `criarMedicamento` | `(userId, tipo, input: CriarMedicamentoInput) => Promise<MedicamentoFormatado>` |
| `listarMedicamentos` | `(userId, tipo, idosoIdQuery?) => Promise<{ medicamentos: MedicamentoFormatado[] }>` |
| `getMedicamento` | `(userId, tipo, id) => Promise<MedicamentoFormatado>` |
| `atualizarMedicamento` | `(userId, tipo, id, input: AtualizarMedicamentoInput) => Promise<MedicamentoFormatado>` |
| `deletarMedicamento` | `(userId, tipo, id) => Promise<void>` |

### Key Behaviours Verified by Code Review

1. **Access control**: every function calls `assertAccessToIdoso(userId, tipo, idosoId)` before any mutation or data return. `getMedicamento` and the update/delete functions first fetch the resource to get `idosoId`, then call the guard — correct order.

2. **`dataValidade` formatting**: `med.dataValidade.toISOString().slice(0, 10)` — returns `"YYYY-MM-DD"` as required, strips the time/UTC suffix.

3. **PUT transaction**: `atualizarMedicamento` uses `prisma.$transaction`. When `horarios` is provided, it first calls `tx.horario.deleteMany({ where: { medicamentoId: id } })`, then `tx.medicamento.update` with `horarios: { create: [...] }` — atomic delete-and-recreate, no orphans possible.

4. **CUIDADOR guard for list**: `listarMedicamentos` throws `AppError(400, 'IDOSO_ID_OBRIGATORIO', ...)` before calling `assertAccessToIdoso` when `tipo === 'CUIDADOR'` and `idosoIdQuery` is undefined — prevents the guard receiving `undefined` as `idosoId`.

5. **`novaFrequencia` logic in PUT**: `input.frequenciaDiaria ?? input.horarios.length` — if horarios are replaced but `frequenciaDiaria` is not explicitly sent, it derives it from the new horarios array length. Consistent with plan.

6. **`formatMedicamento` is not exported** — internal helper only, as specified.

7. **No `Prisma.MedicamentoUpdateInput` type leak** — spread conditional pattern keeps strict TypeScript happy.

---

## TypeScript Check

```
npx tsc --noEmit  →  (no output — zero errors)
```

---

## Concerns

None. Implementation matches the spec exactly, TypeScript passes clean.

---

## Files

- Created: `server/src/services/medicamentos.service.ts`
- Dependencies confirmed present: `server/src/lib/prisma.ts`, `server/src/lib/errors.ts`, `server/src/utils/acesso.ts`
