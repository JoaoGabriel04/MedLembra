# Task 5: Criar estrutura de pastas e entry point

## Contexto

Setup final do backend MedLembra. Todas as dependências, configs e Prisma já estão prontos.
- Raiz do monorepo: `C:\Projetos\Aulas Ericson\MedLembra\`
- Pasta do servidor: `C:\Projetos\Aulas Ericson\MedLembra\server\`
- Versões instaladas relevantes: express@5.2.1, typescript@6.0.3, ts-node@10.9.2, dotenv@17.4.2

## Restrições Globais

- TypeScript strict mode já configurado no tsconfig.json
- CommonJS (module: CommonJS)
- Entry point: `src/server.ts` (executado via `ts-node src/server.ts` pelo nodemon)

## O que fazer

**Files:**
- Create: `server/src/server.ts`
- Create: `server/src/controllers/.gitkeep`
- Create: `server/src/routes/.gitkeep`
- Create: `server/src/middlewares/.gitkeep`
- Create: `server/src/services/.gitkeep`

**Produces:** servidor Express funcional em `http://localhost:3333`; rota `/health` retorna `{"status":"ok"}`

### Step 1: Criar pastas com .gitkeep

Crie as pastas e arquivos .gitkeep. No Windows, via PowerShell ou Write tool:

```powershell
New-Item -ItemType Directory -Force "server\src\controllers"
New-Item -ItemType Directory -Force "server\src\routes"
New-Item -ItemType Directory -Force "server\src\middlewares"
New-Item -ItemType Directory -Force "server\src\services"
New-Item -ItemType File "server\src\controllers\.gitkeep" -Force
New-Item -ItemType File "server\src\routes\.gitkeep" -Force
New-Item -ItemType File "server\src\middlewares\.gitkeep" -Force
New-Item -ItemType File "server\src\services\.gitkeep" -Force
```

### Step 2: Criar src/server.ts

Criar `server/src/server.ts` com EXATAMENTE este conteúdo:

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

### Step 3: Verificar que o TypeScript compila sem erros

Execute dentro de `server/`:

```bash
npx tsc --noEmit
```

Esperado: nenhum output (sem erros de tipo).

NOTA: Se houver erros de tipo relacionados ao Express 5 ou TypeScript 6, resolva-os. Erros comuns:
- O tipo do `res` em Express 5 pode precisar de anotação explícita
- `_req` com underscore indica parâmetro não usado (prática correta)

### Step 4: Testar que o servidor sobe

Execute dentro de `server/`:

```bash
npx ts-node src/server.ts
```

Esperado:
```
Server running on port 3333
```

Se subiu sem erros, pare com Ctrl+C.

### Step 5: Testar a rota /health (em outro terminal enquanto o servidor está rodando)

```bash
curl http://localhost:3333/health
```

Esperado:
```json
{"status":"ok"}
```

### Step 6: Commit (da raiz do monorepo)

```bash
# Da raiz: C:\Projetos\Aulas Ericson\MedLembra\
git add server/src/
git commit -m "feat: add express server entry point with health check route"
```

## Report

Escreva seu relatório completo em:
`C:\Projetos\Aulas Ericson\MedLembra\.superpowers\sdd\task-5-report.md`

Inclua:
- Status: DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED
- Commits realizados (hash)
- Output do `npx tsc --noEmit`
- Confirmação de que o servidor subiu e /health respondeu
- Quaisquer ajustes necessários para compatibilidade com TypeScript 6 / Express 5
- Quaisquer concerns ou erros encontrados

Retorne apenas: status, hash do commit, e uma linha de resumo.
