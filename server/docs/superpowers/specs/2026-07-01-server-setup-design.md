# Server Setup Design — MedLembra

**Date:** 2026-07-01  
**Scope:** Inicialização do ambiente backend em `server/`

---

## Stack

| Categoria | Tecnologia |
|---|---|
| Runtime | Node.js |
| Framework | Express |
| Linguagem | TypeScript |
| ORM | Prisma |
| Banco de dados | PostgreSQL |
| Dev runner | Nodemon + ts-node |
| Validação | Zod |
| Autenticação | jsonwebtoken |
| Hash de senha | bcryptjs |
| Variáveis de ambiente | dotenv |

---

## Estrutura de Pastas

```
server/
├── src/
│   ├── controllers/      # lógica de cada rota
│   ├── routes/           # definição das rotas Express
│   ├── middlewares/      # auth, validação, error handler
│   ├── services/         # regras de negócio, chamadas ao Prisma
│   └── server.ts         # entry point
├── prisma/
│   └── schema.prisma     # datasource + generator (sem models)
├── docs/
│   └── superpowers/specs/
├── .env                  # variáveis reais (no .gitignore)
├── .env.example          # template
├── .gitignore
├── nodemon.json
├── tsconfig.json
└── package.json
```

---

## Scripts

| Script | Comando | Descrição |
|---|---|---|
| `dev` | `nodemon` | Desenvolvimento com hot reload |
| `build` | `tsc` | Compila TypeScript para `dist/` |
| `start` | `node dist/server.js` | Produção |

---

## Configurações

### tsconfig.json
- `target`: ES2020
- `module`: CommonJS
- `rootDir`: `src`
- `outDir`: `dist`
- `strict`: true
- `esModuleInterop`: true

### nodemon.json
- Observa: `src/`
- Extensões: `.ts`
- Executa: `ts-node src/server.ts`

---

## Variáveis de Ambiente (.env)

```
PORT=3333
DATABASE_URL="postgresql://user:password@localhost:5432/medlembra"
JWT_SECRET="sua_chave_secreta"
JWT_EXPIRES_IN="7d"
```

---

## Prisma

Schema base sem models (serão adicionados pelo usuário):

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## Entry Point (src/server.ts)

Servidor Express mínimo funcional com:
- `express.json()` middleware
- Rota `/health` para verificação
- Leitura de `PORT` via `.env`

---

## Decisões

- **bcryptjs** (não `bcrypt`): evita dependências nativas C++, funciona sem fricção no Windows
- **ts-node + nodemon** (não `tsx` nem `tsc --watch`): abordagem mais documentada e comum em cursos
- **Schema Prisma vazio**: usuário adicionará models conforme o domínio se desenvolve
- **CommonJS** (não ESM): compatibilidade padrão com o ecossistema Node.js atual
