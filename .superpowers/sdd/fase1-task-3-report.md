# Fase 1 — Task 3: Middlewares — Report

## Status
✅ COMPLETED

## Commit Hash
`9c9a1c6bef03de5b5f64eee97b912712804834c7`

## Summary
Implementados middlewares Express: `authMiddleware` (valida Bearer token, injeta `req.user`), `requireTipo` (factory para controle de acesso por tipo de usuário) e `errorHandler` (tratador de erros com suporte a `AppError`). TypeScript compilado sem erros.

## Details

### Files Created
- `server/src/middlewares/auth.middleware.ts`
  - `authMiddleware()`: Valida Bearer token via `verifyToken`, injeta `{ id, tipo }` em `req.user`, retorna 401 se ausente/inválido
  - `requireTipo(tipo)`: Factory que retorna middleware bloqueando acesso se tipo diferente, retorna 403

- `server/src/middlewares/error.middleware.ts`
  - `errorHandler()`: Middleware 4-parâmetros que diferencia `AppError` (responde com `code`, `message`, `status`) de outros erros (responde 500)

### Verification
- TypeScript check (`npx tsc --noEmit` em `server/`): ✓ Sucesso (sem output)
- Git commit: ✓ Sucesso
