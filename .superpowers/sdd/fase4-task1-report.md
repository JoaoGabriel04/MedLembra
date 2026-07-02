# Fase 4 — Task 1: Utils de Alertas — Report

## Status
**DONE**

## Commits Created
- `f7f7406` — feat: add alertas util — ESTOQUE_BAIXO e VALIDADE_PROXIMA

## TypeScript Verification
✓ `npx tsc --noEmit` from `server/` produced no output — all types correct.

## Implementation Details

### File Created
- `server/src/utils/alertas.ts`

### Interfaces & Types
- `MedParaAlerta`: Input medication data (id, nome, estoqueAtual, frequenciaDiaria, dataValidade)
- `AlertaEstoqueBaixo`: Alert when stock runs out within 7 days
- `AlertaValidadeProxima`: Alert when expiration date is within 30 days
- `Alerta`: Union type combining both alert types

### Function: calcularAlertas(medicamentos: MedParaAlerta[]): Alerta[]

**Logic:**
1. Calculate today's UTC milliseconds using single `new Date()` call: `Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())`
2. For each medication:
   - **ESTOQUE_BAIXO**: `diasRestantes = Math.floor(estoqueAtual / frequenciaDiaria)` → alert if `<= 7`
   - **VALIDADE_PROXIMA**: `diasParaVencer = Math.ceil((validadeMs - hojeMs) / (1000 * 60 * 60 * 24))` → alert if `<= 30`
   - Single medication can generate both alerts
3. Return collected alerts array

**Constraints Met:**
- ✓ No external dependencies — pure calculation
- ✓ `diasRestantes` uses `Math.floor` (round down)
- ✓ `diasParaVencer` uses `Math.ceil` (round up)
- ✓ `dataValidade` formatted as "YYYY-MM-DD" using `.toISOString().slice(0, 10)`
- ✓ TypeScript `strict: true` compatible
- ✓ Code matches specification exactly

## Self-Review
- All interfaces exported correctly
- Function logic matches requirements precisely
- Type safety verified by TypeScript compiler
- Ready for Task 2 (service/controller integration)

---

## Fix Applied: Optimize Date Instantiation

**Commit:** `fa1a010` — fix: use single new Date() call for hojeMs in alertas util

**Issue:** The original code called `new Date()` three times (for year, month, date extraction):
```typescript
const hojeMs = Date.UTC(
  new Date().getUTCFullYear(),
  new Date().getUTCMonth(),
  new Date().getUTCDate()
)
```

**Fix:** Created a single Date instance reused across all three method calls:
```typescript
const now = new Date()
const hojeMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
```

**Verification:** 
✓ `npx tsc --noEmit` from `server/` produced no output — TypeScript types verified
