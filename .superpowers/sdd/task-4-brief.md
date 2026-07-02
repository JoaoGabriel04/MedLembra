# Task 4: Inicializar Prisma

## Contexto

Setup do backend MedLembra. Tasks 1-3 já instalaram dependências, configuraram TypeScript/Nodemon e criaram os arquivos de ambiente.
- Raiz do monorepo: `C:\Projetos\Aulas Ericson\MedLembra\`
- Pasta do servidor: `C:\Projetos\Aulas Ericson\MedLembra\server\`
- `prisma` CLI já está instalado em `server/node_modules/.bin/prisma`
- `server/.env` já existe com `DATABASE_URL`
- Trabalhe DENTRO de `server/` para os comandos npx

## Restrições Globais

- Prisma schema sem models (só datasource + generator)
- Provider: postgresql
- DATABASE_URL lida de env("DATABASE_URL")

## O que fazer

**Files:**
- Create: `server/prisma/schema.prisma`

**Produces:** `prisma/schema.prisma` com datasource PostgreSQL + generator client configurados e válidos

### Step 1: Inicializar Prisma

Execute dentro de `server/`:

```bash
npx prisma init --datasource-provider postgresql
```

Este comando cria `prisma/schema.prisma`. Pode também tentar modificar o `.env` — isso é OK, o arquivo já existe.

### Step 2: Verificar e limpar schema.prisma

O conteúdo final de `server/prisma/schema.prisma` deve ser EXATAMENTE:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Se o `npx prisma init` adicionou campos extras no generator (como `output`, `previewFeatures`, etc.), remova-os para manter o schema limpo.

### Step 3: Verificar que o Prisma valida o schema

Execute dentro de `server/`:

```bash
npx prisma validate
```

Esperado: `The schema at prisma/schema.prisma is valid` (ou mensagem equivalente de sucesso).

NOTA: pode aparecer um aviso sobre DATABASE_URL não conectar ao banco — isso é esperado porque não há um PostgreSQL rodando localmente. O importante é que o SCHEMA seja válido, não a conexão.

### Step 4: Commit (da raiz do monorepo)

```bash
# Da raiz: C:\Projetos\Aulas Ericson\MedLembra\
git add server/prisma/schema.prisma
git commit -m "chore: initialize prisma with postgresql datasource"
```

## Report

Escreva seu relatório completo em:
`C:\Projetos\Aulas Ericson\MedLembra\.superpowers\sdd\task-4-report.md`

Inclua:
- Status: DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED
- Commits realizados (hash)
- Conteúdo final do schema.prisma
- Output do `npx prisma validate`
- Quaisquer concerns ou erros encontrados

Retorne apenas: status, hash do commit, resumo de 1 linha.
