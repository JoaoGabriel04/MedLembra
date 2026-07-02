# Fase 1 — Task 3: Middlewares

## Contexto

Backend MedLembra. Tasks 1-2 criaram schema e libs. Agora criamos os middlewares Express.
- Pasta do servidor: `C:\Projetos\Aulas Ericson\MedLembra\server\`
- Commits da raiz: `C:\Projetos\Aulas Ericson\MedLembra\`
- `src/lib/jwt.ts` já existe com `verifyToken(token): JwtPayload`
- `src/lib/errors.ts` já existe com classe `AppError`

## O que fazer

**Files a criar:**
- `server/src/middlewares/auth.middleware.ts`
- `server/src/middlewares/error.middleware.ts`

**Produces:**
- `authMiddleware` — valida Bearer token, injeta `req.user = { id, tipo }`; 401 se ausente/inválido
- `requireTipo(tipo)` — factory que retorna middleware que bloqueia se `req.user.tipo !== tipo`; 403 se diferente
- `errorHandler` — middleware de 4 parâmetros; se `AppError` → responde com `{ error: code, message }` + status; senão → 500

### Step 1: Criar src/middlewares/auth.middleware.ts

```typescript
import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../lib/jwt'

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'Token ausente ou malformado' })
    return
  }

  const token = authHeader.slice(7)
  try {
    const payload = verifyToken(token)
    req.user = { id: payload.sub, tipo: payload.tipo }
    next()
  } catch {
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'Token inválido ou expirado' })
  }
}

export function requireTipo(tipo: 'IDOSO' | 'CUIDADOR') {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.tipo !== tipo) {
      res.status(403).json({
        error: 'FORBIDDEN',
        message: `Acesso restrito a ${tipo}`
      })
      return
    }
    next()
  }
}
```

### Step 2: Criar src/middlewares/error.middleware.ts

```typescript
import { Request, Response, NextFunction } from 'express'
import { AppError } from '../lib/errors'

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    const body: Record<string, unknown> = {
      error: err.code,
      message: err.message
    }
    if (err.details !== undefined) body.details = err.details
    res.status(err.status).json(body)
    return
  }

  console.error(err)
  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: 'Erro inesperado'
  })
}
```

### Step 3: Verificar TypeScript

Execute dentro de `server/`:

```bash
npx tsc --noEmit
```

Esperado: nenhum output.

### Step 4: Commit (da raiz)

```bash
git add server/src/middlewares/
git commit -m "feat: add auth and error middlewares"
```

## Report

Escreva em: `C:\Projetos\Aulas Ericson\MedLembra\.superpowers\sdd\fase1-task-3-report.md`

Retorne: STATUS, hash do commit, resumo de 1 linha.
