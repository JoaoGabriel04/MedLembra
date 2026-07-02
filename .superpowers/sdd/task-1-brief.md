# Task 1: Configurar package.json e instalar todas as dependências

## Contexto

Você está configurando o backend de um monorepo chamado MedLembra.
- Raiz do monorepo: `C:\Projetos\Aulas Ericson\MedLembra\`
- Pasta do servidor: `C:\Projetos\Aulas Ericson\MedLembra\server\`
- O `server/package.json` já existe mas está vazio (sem dependências, sem scripts)
- Trabalhe SEMPRE dentro da pasta `server/` (cd server antes dos npm install)

## Restrições Globais

- Todas as dependências devem ser instaladas com `@latest`
- `"type": "commonjs"` no package.json (não ESM)
- TypeScript em modo `strict: true`
- Nodemon deve observar `src/` e executar via `ts-node`
- `.env` nunca vai para o git
- Prisma schema sem models (só datasource + generator)

## O que fazer

**Files:**
- Modify: `server/package.json`

**Produces:** `node_modules/` com todas as libs; `package.json` com scripts `dev`, `build`, `start`

### Step 1: Atualizar package.json com scripts e metadados

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

### Step 2: Instalar dependências de produção

No terminal, dentro de `server/`:

```bash
npm install express@latest @prisma/client@latest dotenv@latest jsonwebtoken@latest zod@latest bcryptjs@latest
```

### Step 3: Instalar dependências de desenvolvimento

```bash
npm install -D typescript@latest ts-node@latest nodemon@latest prisma@latest @types/express@latest @types/node@latest @types/jsonwebtoken@latest @types/bcryptjs@latest
```

### Step 4: Verificar instalação

```bash
npm list --depth=0
```

Esperado: lista mostrando todas as libs sem erros `UNMET DEPENDENCY` ou `npm ERR!`.

### Step 5: Commit (a partir da raiz do monorepo)

```bash
# Da raiz: C:\Projetos\Aulas Ericson\MedLembra\
git add server/package.json server/package-lock.json
git commit -m "chore: initialize server dependencies"
```

## Report

Escreva seu relatório completo em:
`C:\Projetos\Aulas Ericson\MedLembra\.superpowers\sdd\task-1-report.md`

Inclua:
- Status: DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED
- Commits realizados (hash)
- Output do `npm list --depth=0`
- Quaisquer concerns ou erros encontrados

Retorne apenas: status, hash do commit, resumo de 1 linha do resultado.
