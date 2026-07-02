# Fase 1 — Task 2: Core Lib + Types

## Contexto

Backend MedLembra. Task 1 criou o schema Prisma e rodou a migration. Agora criaremos os arquivos de infraestrutura base.
- Pasta do servidor: `C:\Projetos\Aulas Ericson\MedLembra\server\`
- Commits da raiz: `C:\Projetos\Aulas Ericson\MedLembra\`
- TypeScript 6, strict: true, CommonJS
- `@prisma/client` já gerado (v7.8.0)

## Restrições Globais

- TypeScript strict: true, module: CommonJS
- JWT payload: `{ sub: number; tipo: 'IDOSO' | 'CUIDADOR' }`
- bcryptjs com 10 rounds
- Commits da raiz do monorepo

## O que fazer

**Files a criar (todos em `server/src/`):**
- `lib/prisma.ts` — singleton PrismaClient
- `lib/errors.ts` — classe AppError
- `lib/jwt.ts` — signToken, verifyToken, JwtPayload
- `lib/bcrypt.ts` — hashSenha, compareSenha
- `types/express.d.ts` — augment req.user

**Produces:**
- `prisma` (PrismaClient) exportado de `src/lib/prisma.ts`
- `AppError(status, code, message, details?)` de `src/lib/errors.ts`
- `JwtPayload = { sub: number; tipo: 'IDOSO' | 'CUIDADOR' }` de `src/lib/jwt.ts`
- `signToken(payload: JwtPayload): string` de `src/lib/jwt.ts`
- `verifyToken(token: string): JwtPayload` de `src/lib/jwt.ts`
- `hashSenha(senha: string): Promise<string>` de `src/lib/bcrypt.ts`
- `compareSenha(senha: string, hash: string): Promise<boolean>` de `src/lib/bcrypt.ts`
- `req.user?: { id: number; tipo: 'IDOSO' | 'CUIDADOR' }` disponível globalmente

### Step 1: Criar src/lib/prisma.ts

```typescript
import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()
```

### Step 2: Criar src/lib/errors.ts

```typescript
export class AppError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
  }
}
```

### Step 3: Criar src/lib/jwt.ts

```typescript
import jwt from 'jsonwebtoken'

export type JwtPayload = {
  sub: number
  tipo: 'IDOSO' | 'CUIDADOR'
}

const SECRET = process.env.JWT_SECRET!
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN as jwt.SignOptions['expiresIn'] })
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload
}
```

### Step 4: Criar src/lib/bcrypt.ts

```typescript
import bcrypt from 'bcryptjs'

const ROUNDS = 10

export function hashSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, ROUNDS)
}

export function compareSenha(senha: string, hash: string): Promise<boolean> {
  return bcrypt.compare(senha, hash)
}
```

### Step 5: Criar src/types/express.d.ts

```typescript
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number
        tipo: 'IDOSO' | 'CUIDADOR'
      }
    }
  }
}

export {}
```

### Step 6: Verificar TypeScript

Execute dentro de `server/`:

```bash
npx tsc --noEmit
```

Esperado: nenhum output (sem erros). Se aparecer erro sobre `@prisma/client`, rode `npx prisma generate` primeiro.

### Step 7: Commit (da raiz do monorepo)

```bash
git add server/src/lib/ server/src/types/
git commit -m "feat: add core lib (prisma singleton, jwt, bcrypt, AppError) and express type augmentation"
```

## Report

Escreva em: `C:\Projetos\Aulas Ericson\MedLembra\.superpowers\sdd\fase1-task-2-report.md`

Inclua: status, hash do commit, output do `tsc --noEmit`, concerns.

Retorne: STATUS, hash do commit, resumo de 1 linha.
