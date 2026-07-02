# Task 2 Report: Configurar TypeScript e Nodemon

## Status: DONE

## Commits Realizados
- Hash: `dd74aa3`
- Mensagem: `chore: configure typescript and nodemon`
- Arquivos: `server/tsconfig.json` (criado), `server/nodemon.json` (criado), `server/package.json` (modificado), `server/package-lock.json` (atualizado)

## npx tsc --version
```
Version 6.0.3
```

## @types/bcryptjs Removido
Confirmado. O pacote foi desinstalado via `npm uninstall @types/bcryptjs`. O package.json não lista mais `@types/bcryptjs`.

## Arquivos Criados

### server/tsconfig.json
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

### server/nodemon.json
```json
{
  "watch": ["src"],
  "ext": "ts",
  "exec": "ts-node src/server.ts"
}
```

## Concerns
- Nenhum. O npm reportou 3 vulnerabilidades moderadas (pré-existentes, não relacionadas a esta task).
- Avisos de LF→CRLF são normais em Windows com Git — não afetam funcionalidade.
