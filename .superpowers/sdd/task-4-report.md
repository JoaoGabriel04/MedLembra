# Task 4 Report: Inicializar Prisma

## Status

DONE_WITH_CONCERNS

## Commits Realizados

- Hash: `fae12d3`
- Mensagem: `chore: initialize prisma with postgresql datasource`
- Arquivos committed:
  - `server/prisma/schema.prisma` (criado)
  - `server/prisma.config.ts` (criado - veja concerns)
  - `server/.gitignore` (modificado - Prisma adicionou `/src/generated/prisma`)

## Conteúdo Final do schema.prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}
```

**NOTA:** O campo `url = env("DATABASE_URL")` foi REMOVIDO do schema — veja concerns abaixo.

## Output do `npx prisma validate`

```
Loaded Prisma config from prisma.config.ts.
Prisma schema loaded from prisma\schema.prisma.
The schema at prisma\schema.prisma is valid 🚀
```

## Concerns

### Prisma 7.x Breaking Changes (versão instalada: 7.8.0)

O brief foi escrito para Prisma 5.x/6.x, mas a versão instalada é **Prisma 7.8.0**, que tem breaking changes relevantes:

1. **`url` removido do schema.prisma**: O campo `url = env("DATABASE_URL")` no bloco `datasource db` não é mais suportado no Prisma 7. A URL de conexão agora deve ser configurada em `prisma.config.ts`. Tentar incluir o campo causa erro `P1012`.

2. **`prisma.config.ts` gerado**: O `npx prisma init` criou um novo arquivo `server/prisma.config.ts` que é **necessário** para o funcionamento do Prisma 7. Ele contém a configuração do `DATABASE_URL` via `process.env["DATABASE_URL"]`. Este arquivo foi committed junto com o schema (não estava no brief, mas é obrigatório).

3. **Provider `prisma-client-js` ainda aceito**: O provider `prisma-client-js` (especificado no brief) ainda é aceito pelo Prisma 7 (o schema valida com sucesso). O padrão gerado é `prisma-client`, mas ambos funcionam.

### Conteúdo do prisma.config.ts

```typescript
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
```

### Alteração no .gitignore

O Prisma adicionou `/src/generated/prisma` ao `server/.gitignore` (path de output gerado pelo Prisma client). Esta linha foi committed junto.
