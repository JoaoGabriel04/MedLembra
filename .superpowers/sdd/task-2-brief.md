# Task 2: Configurar TypeScript e Nodemon

## Contexto

Setup do backend MedLembra. A Task 1 instalou todas as dependências.
- Raiz do monorepo: `C:\Projetos\Aulas Ericson\MedLembra\`
- Pasta do servidor: `C:\Projetos\Aulas Ericson\MedLembra\server\`
- Os arquivos devem ser criados em `server/`

## Restrições Globais

- `"type": "commonjs"` no package.json (já definido)
- TypeScript em modo `strict: true`
- Nodemon deve observar `src/` e executar via `ts-node src/server.ts`
- Dependências já instaladas: typescript@^6.0.3, ts-node@^10.9.2, nodemon@^3.1.14

## Correção Minor da Task 1

O pacote `@types/bcryptjs` está deprecated porque `bcryptjs@3+` já inclui seus próprios tipos.
Remova-o das devDependencies:

```bash
# Na pasta server/
npm uninstall @types/bcryptjs
```

Depois confirme que o package.json não lista mais `@types/bcryptjs`.

## O que fazer

**Files:**
- Create: `server/tsconfig.json`
- Create: `server/nodemon.json`
- Modify: `server/package.json` (remover @types/bcryptjs)

**Produces:** compilador TypeScript configurado com strict; nodemon pronto para executar `.ts` via ts-node

### Step 1: Remover @types/bcryptjs (deprecated)

```bash
# Na pasta server/
npm uninstall @types/bcryptjs
```

### Step 2: Criar tsconfig.json

Criar `server/tsconfig.json` com exatamente este conteúdo:

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

### Step 3: Criar nodemon.json

Criar `server/nodemon.json` com exatamente este conteúdo:

```json
{
  "watch": ["src"],
  "ext": "ts",
  "exec": "ts-node src/server.ts"
}
```

### Step 4: Verificar versão do TypeScript

```bash
# Na pasta server/
npx tsc --version
```

Esperado: `Version 6.x.x` (sem erros).

### Step 5: Commit (da raiz do monorepo)

```bash
# Da raiz: C:\Projetos\Aulas Ericson\MedLembra\
git add server/tsconfig.json server/nodemon.json server/package.json server/package-lock.json
git commit -m "chore: configure typescript and nodemon"
```

## Report

Escreva seu relatório completo em:
`C:\Projetos\Aulas Ericson\MedLembra\.superpowers\sdd\task-2-report.md`

Inclua:
- Status: DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED
- Commits realizados (hash)
- Output do `npx tsc --version`
- Confirmação de que @types/bcryptjs foi removido
- Quaisquer concerns ou erros encontrados

Retorne apenas: status, hash do commit, resumo de 1 linha.
