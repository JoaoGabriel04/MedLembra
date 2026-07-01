# Server Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configurar o ambiente backend do MedLembra com Express, Prisma, TypeScript, Nodemon, Dotenv, JWT, Zod e bcryptjs, com estrutura de pastas em camadas (MVC-like).

**Architecture:** Servidor Express com TypeScript executado em desenvolvimento via ts-node + nodemon (hot reload). A estrutura de pastas separa controllers, routes, middlewares e services. O Prisma gerencia a conexão com PostgreSQL, com schema base pronto para receber models.

**Tech Stack:** Express 5, Prisma 6+, TypeScript 5, ts-node, Nodemon, jsonwebtoken, Zod, bcryptjs, dotenv, PostgreSQL.

## Global Constraints

- Todas as dependências devem ser instaladas com `@latest` para garantir versões mais recentes
- `"type": "commonjs"` no package.json (não ESM)
- TypeScript em modo `strict: true`
- Nodemon deve observar `src/` e executar via `ts-node`
- `.env` nunca vai para o git (coberto pelo .gitignore)
- Prisma schema sem models (só datasource + generator)

---

### Task 1: Configurar package.json e instalar todas as dependências

**Files:**
- Modify: `package.json`

**Interfaces:**
- Produces: `node_modules/` com todas as libs; `package.json` com scripts `dev`, `build`, `start`

- [ ] **Step 1: Atualizar package.json com scripts e metadados**

Substituir o conteúdo de `server/package.json` por:

```json
{
  "name": "server",
  "version": "1.0.0",
  "description": "MedLembra backend API",
  "main": "dist/server.js",
  "scripts": {
    "dev": "nodemon",
    "build": "tsc",
    "start": "node dist/server.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "commonjs"
}
```

- [ ] **Step 2: Instalar dependências de produção**

No terminal, dentro de `server/`:

```bash
npm install express@latest @prisma/client@latest dotenv@latest jsonwebtoken@latest zod@latest bcryptjs@latest
```

- [ ] **Step 3: Instalar dependências de desenvolvimento**

```bash
npm install -D typescript@latest ts-node@latest nodemon@latest prisma@latest @types/express@latest @types/node@latest @types/jsonwebtoken@latest @types/bcryptjs@latest
```

- [ ] **Step 4: Verificar instalação**

```bash
npm list --depth=0
```

Esperado: lista mostrando todas as libs sem erros `UNMET DEPENDENCY` ou `npm ERR!`.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: initialize server dependencies"
```

---

### Task 2: Configurar TypeScript e Nodemon

**Files:**
- Create: `tsconfig.json`
- Create: `nodemon.json`

**Interfaces:**
- Consumes: `package.json` com `typescript` e `ts-node` instalados (Task 1)
- Produces: compilador TypeScript configurado; nodemon pronto para executar `.ts`

- [ ] **Step 1: Criar tsconfig.json**

Criar `server/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 2: Criar nodemon.json**

Criar `server/nodemon.json`:

```json
{
  "watch": ["src"],
  "ext": "ts",
  "exec": "ts-node src/server.ts"
}
```

- [ ] **Step 3: Verificar configuração do TypeScript**

```bash
npx tsc --version
```

Esperado: `Version 5.x.x` (sem erros).

- [ ] **Step 4: Commit**

```bash
git add tsconfig.json nodemon.json
git commit -m "chore: configure typescript and nodemon"
```

---

### Task 3: Criar arquivos de ambiente e .gitignore

**Files:**
- Create: `.env`
- Create: `.env.example`
- Create: `.gitignore`

**Interfaces:**
- Produces: variáveis de ambiente disponíveis via `process.env`; `.env` excluído do git

- [ ] **Step 1: Criar .env**

Criar `server/.env`:

```
PORT=3333
DATABASE_URL="postgresql://user:password@localhost:5432/medlembra"
JWT_SECRET="troque_por_uma_chave_forte_e_aleatoria"
JWT_EXPIRES_IN="7d"
```

- [ ] **Step 2: Criar .env.example**

Criar `server/.env.example`:

```
PORT=3333
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE_NAME"
JWT_SECRET="sua_chave_secreta_aqui"
JWT_EXPIRES_IN="7d"
```

- [ ] **Step 3: Criar .gitignore**

Criar `server/.gitignore`:

```
# Dependências
node_modules/

# Build
dist/

# Ambiente
.env

# Prisma
prisma/*.db
prisma/*.db-journal

# Sistema
.DS_Store
Thumbs.db
```

- [ ] **Step 4: Verificar que .env está ignorado**

```bash
git status
```

Esperado: `.env` NÃO aparece como arquivo a ser rastreado. `.env.example` aparece como `Untracked`.

- [ ] **Step 5: Commit**

```bash
git add .env.example .gitignore
git commit -m "chore: add environment files and gitignore"
```

---

### Task 4: Inicializar Prisma

**Files:**
- Create: `prisma/schema.prisma`

**Interfaces:**
- Consumes: `DATABASE_URL` do `.env` (Task 3); `prisma` instalado (Task 1)
- Produces: `prisma/schema.prisma` com datasource PostgreSQL + generator client configurados

- [ ] **Step 1: Inicializar Prisma**

```bash
npx prisma init --datasource-provider postgresql
```

Esperado: cria `prisma/schema.prisma` e adiciona `DATABASE_URL` ao `.env` (se não existir).

- [ ] **Step 2: Verificar e ajustar schema.prisma**

O conteúdo de `prisma/schema.prisma` deve ser exatamente:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Se o `npx prisma init` adicionou `output` ou outros campos extras no generator, remova para manter o schema limpo.

- [ ] **Step 3: Verificar que o Prisma lê o schema sem erros**

```bash
npx prisma validate
```

Esperado: `The schema at prisma/schema.prisma is valid`.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma
git commit -m "chore: initialize prisma with postgresql datasource"
```

---

### Task 5: Criar estrutura de pastas e entry point

**Files:**
- Create: `src/server.ts`
- Create: `src/controllers/.gitkeep`
- Create: `src/routes/.gitkeep`
- Create: `src/middlewares/.gitkeep`
- Create: `src/services/.gitkeep`

**Interfaces:**
- Consumes: todas as dependências instaladas (Tasks 1–4); `.env` configurado (Task 3)
- Produces: servidor Express funcional acessível em `http://localhost:3333`; rota `/health` retorna `{ "status": "ok" }`

- [ ] **Step 1: Criar pastas com .gitkeep**

```bash
mkdir -p src/controllers src/routes src/middlewares src/services
type nul > src/controllers/.gitkeep
type nul > src/routes/.gitkeep
type nul > src/middlewares/.gitkeep
type nul > src/services/.gitkeep
```

- [ ] **Step 2: Criar src/server.ts**

Criar `server/src/server.ts`:

```typescript
import express from 'express'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3333

app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

- [ ] **Step 3: Verificar que o TypeScript aceita o server.ts sem erros**

```bash
npx tsc --noEmit
```

Esperado: nenhum output (sem erros de tipo).

- [ ] **Step 4: Subir o servidor em modo dev**

```bash
npm run dev
```

Esperado no terminal:

```
[nodemon] starting `ts-node src/server.ts`
Server running on port 3333
```

- [ ] **Step 5: Testar a rota /health**

Em outro terminal ou no navegador:

```bash
curl http://localhost:3333/health
```

Esperado:

```json
{"status":"ok"}
```

- [ ] **Step 6: Parar o servidor (Ctrl+C) e fazer commit**

```bash
git add src/
git commit -m "feat: add express server entry point with health check route"
```

---

## Verificação Final

Após completar todas as tasks, a estrutura do projeto deve ser:

```
server/
├── src/
│   ├── controllers/.gitkeep
│   ├── routes/.gitkeep
│   ├── middlewares/.gitkeep
│   ├── services/.gitkeep
│   └── server.ts
├── prisma/
│   └── schema.prisma
├── docs/
│   └── superpowers/
│       ├── specs/2026-07-01-server-setup-design.md
│       └── plans/2026-07-01-server-setup.md
├── node_modules/
├── .env              ← não commitado
├── .env.example
├── .gitignore
├── nodemon.json
├── package.json
├── package-lock.json
└── tsconfig.json
```

Confirmar que `npm run dev` sobe o servidor e `GET /health` retorna `{"status":"ok"}`.
