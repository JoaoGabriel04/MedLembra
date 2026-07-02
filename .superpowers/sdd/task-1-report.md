# Task 1 Report: Configurar package.json e instalar todas as dependências

## Status: DONE_WITH_CONCERNS

## Commits Realizados

- Hash: `82028fa`
- Mensagem: `chore: initialize server dependencies`
- Arquivos: `server/package.json`, `server/package-lock.json` (criado)

## Output do `npm list --depth=0`

```
server@1.0.0 C:\Projetos\Aulas Ericson\MedLembra\server
+-- @prisma/client@7.8.0
+-- @types/bcryptjs@3.0.0
+-- @types/express@5.0.6
+-- @types/jsonwebtoken@9.0.10
+-- @types/node@26.1.0
+-- bcryptjs@3.0.3
+-- dotenv@17.4.2
+-- express@5.2.1
+-- jsonwebtoken@9.0.3
+-- nodemon@3.1.14
+-- prisma@7.8.0
+-- ts-node@10.9.2
+-- typescript@6.0.3
`-- zod@4.4.3
```

Todas as 14 dependências instaladas corretamente. Sem `UNMET DEPENDENCY` ou `npm ERR!`.

## Concerns

### Vulnerabilidades moderadas (3)

O `npm audit` reportou 3 vulnerabilidades de severidade **moderate**:

- **Pacote afetado:** `@hono/node-server <1.19.13` (dependência transitiva de `prisma@7.8.0`)
- **Advisory:** GHSA-92pp-h63x-v22m — Middleware bypass via repeated slashes in `serveStatic`
- **Impacto:** Apenas no Prisma Studio e ferramentas de dev do Prisma, não em código runtime da aplicação
- **Fix disponível:** `npm audit fix --force` (requer downgrade para `prisma@6.19.3`, que é breaking change)
- **Decisão:** Não corrigido — o brief exige `@latest` e a vulnerabilidade não afeta o runtime da API

### Deprecation warning

- `@types/bcryptjs@3.0.0` foi marcado como deprecated (bcryptjs já inclui seus próprios tipos), mas foi instalado conforme especificado no brief

## Verificações

- [x] `package.json` atualizado com scripts `dev`, `build`, `start`
- [x] `"type": "commonjs"` presente
- [x] `"main": "dist/server.js"` configurado
- [x] Dependências de produção instaladas
- [x] Dependências de desenvolvimento instaladas
- [x] `npm list --depth=0` sem erros críticos
- [x] Commit realizado da raiz do monorepo
