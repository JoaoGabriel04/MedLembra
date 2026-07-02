# Task 3: Criar arquivos de ambiente e .gitignore

## Contexto

Setup do backend MedLembra. Tasks 1 e 2 já configuraram dependências e TypeScript/Nodemon.
- Raiz do monorepo: `C:\Projetos\Aulas Ericson\MedLembra\`
- Pasta do servidor: `C:\Projetos\Aulas Ericson\MedLembra\server\`
- Já existe um `.gitignore` na RAIZ do monorepo (não mexa nele)
- Os arquivos desta task devem ser criados em `server/`

## Restrições Globais

- `.env` nunca vai para o git (deve estar no .gitignore do server/)
- O `.gitignore` do server/ é específico para o servidor, não substitui o da raiz

## O que fazer

**Files:**
- Create: `server/.env`
- Create: `server/.env.example`
- Create: `server/.gitignore`

**Produces:** variáveis de ambiente disponíveis via `process.env`; `.env` excluído do git

### Step 1: Criar .env

Criar `server/.env` com exatamente este conteúdo:

```
PORT=3333
DATABASE_URL="postgresql://user:password@localhost:5432/medlembra"
JWT_SECRET="troque_por_uma_chave_forte_e_aleatoria"
JWT_EXPIRES_IN="7d"
```

### Step 2: Criar .env.example

Criar `server/.env.example` com exatamente este conteúdo:

```
PORT=3333
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE_NAME"
JWT_SECRET="sua_chave_secreta_aqui"
JWT_EXPIRES_IN="7d"
```

### Step 3: Criar .gitignore no server/

Criar `server/.gitignore` com exatamente este conteúdo:

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

### Step 4: Verificar que .env está ignorado pelo git

Da raiz do monorepo:

```bash
git status
```

Confirme que `server/.env` NÃO aparece como arquivo a ser rastreado.
`server/.env.example` deve aparecer como Untracked.

### Step 5: Commit (da raiz do monorepo)

```bash
# Da raiz: C:\Projetos\Aulas Ericson\MedLembra\
git add server/.env.example server/.gitignore
git commit -m "chore: add server environment files and gitignore"
```

**ATENÇÃO:** NÃO adicione `server/.env` ao commit — ele deve ficar fora do git.

## Report

Escreva seu relatório completo em:
`C:\Projetos\Aulas Ericson\MedLembra\.superpowers\sdd\task-3-report.md`

Inclua:
- Status: DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED
- Commits realizados (hash)
- Confirmação de que server/.env NÃO foi commitado
- Quaisquer concerns ou erros encontrados

Retorne apenas: status, hash do commit, resumo de 1 linha.
