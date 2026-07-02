# Fase 1 — Task 4 Report: Auth — Register + Login

## Status: DONE

## Commit Hash
`516718d`

## Files Created / Modified

| File | Action |
|------|--------|
| `server/src/services/auth.service.ts` | Created (verbatim from brief) |
| `server/src/controllers/auth.controller.ts` | Created (verbatim from brief) |
| `server/src/routes/auth.routes.ts` | Created (verbatim from brief) |
| `server/src/server.ts` | Already matched brief — no change needed |
| `server/src/lib/prisma.ts` | Fixed for Prisma v7 (see Concerns) |
| `server/package.json` / `package-lock.json` | Updated: added `@prisma/adapter-neon` + `@neondatabase/serverless` |

## tsc --noEmit Output

```
(no output — zero errors)
```

## curl Output — Register

```
POST /api/auth/register  →  201
{
  "token": "eyJhbGci...",
  "usuario": {
    "id": 1,
    "nome": "Maria Silva",
    "email": "mariatask4@teste.com",
    "tipo": "IDOSO"
  }
}
```

## curl Output — Login

```
POST /api/auth/login  →  200
{
  "token": "eyJhbGci...",
  "usuario": {
    "id": 1,
    "nome": "Maria Silva",
    "email": "mariatask4@teste.com",
    "tipo": "IDOSO"
  }
}
```

## Error Cases Verified

- Duplicate email → `409 { "error": "EMAIL_DUPLICADO", "message": "Email já cadastrado" }`
- Wrong password  → `401 { "error": "CREDENCIAIS_INVALIDAS", "message": "Credenciais inválidas" }`

## Concerns / Deviations from Brief

### Prisma v7 requires a driver adapter (not a plain `new PrismaClient()`)

Prisma v7.8.0 removed URL support from `schema.prisma` and requires all connection URLs to live in `prisma.config.ts`. At runtime, `new PrismaClient()` throws `PrismaClientInitializationError` unless an adapter or `accelerateUrl` is passed.

**Fix applied to `server/src/lib/prisma.ts`:**

```typescript
import 'dotenv/config'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
export const prisma = new PrismaClient({ adapter })
```

- Installed `@prisma/adapter-neon` and `@neondatabase/serverless` (4 packages, no major/breaking deps).
- `import 'dotenv/config'` is required at the top of `prisma.ts` because `PrismaNeon` reads `DATABASE_URL` at module-load time (before `dotenv.config()` in `server.ts` executes).

### Test port

The .env sets `PORT=7000`, but a WSL relay was bound to `127.0.0.1:7000`, intercepting `localhost` requests to a different app. Endpoints were tested on `PORT=4000` (free port) and all pass. The deployed app should configure a port not conflicting with WSL relay.
