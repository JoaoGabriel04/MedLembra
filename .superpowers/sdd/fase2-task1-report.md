# Fase 2 — Task 1: assertAccessToIdoso Utility — Report

**Date:** 2026-07-01  
**Status:** DONE

## Implementation Summary

### Task Completed
Created `server/src/utils/acesso.ts` with the `assertAccessToIdoso` utility function as specified in the phase 2 plan.

### Files Created
- **Path:** `server/src/utils/acesso.ts`
- **Lines:** 22
- **Exports:** `assertAccessToIdoso(userId, tipo, idosoId): Promise<void>`

### Validation Steps

#### 1. TypeScript Compilation
```bash
cd server/
npx tsc --noEmit
```
**Result:** ✅ PASSED — No errors or warnings.

#### 2. Git Commit
```bash
git add server/src/utils/acesso.ts
git commit -m "feat: add assertAccessToIdoso utility"
```
**Result:** ✅ PASSED  
**Commit SHA:** `1424d17`  
**Branch:** `main`

### Function Behavior

The `assertAccessToIdoso` utility validates access control for medication operations:

1. **For IDOSO (elderly user):** Verifies the requestor's userId matches the idosoId
   - ✅ Throws 403 FORBIDDEN if userId ≠ idosoId
   - ✅ Allows access if userId = idosoId

2. **For CUIDADOR (caregiver):** Verifies the caregiver is linked to the elderly user
   - ✅ Throws 404 NOT_FOUND if idoso doesn't exist
   - ✅ Throws 403 FORBIDDEN if caregiver is not linked (cuidadorId mismatch)
   - ✅ Allows access if caregiver is linked

### Dependencies Used
- `prisma` from `src/lib/prisma.ts` — Database queries
- `AppError` from `src/lib/errors.ts` — Standardized error handling

### Code Quality
- ✅ TypeScript strict mode compliant
- ✅ Imports properly pathed (relative)
- ✅ Function signatures match spec exactly
- ✅ Error codes and messages match spec exactly
- ✅ No console.log or debugging code

## Ready for Phase 2 — Task 2
This utility is now ready to be imported and used by the medicamentos service.

