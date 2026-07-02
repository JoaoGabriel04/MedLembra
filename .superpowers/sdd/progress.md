# SDD Progress — Server Setup + Fase 1

Base commit (pré-execução): d008f84

## Tasks

- [x] Task 1: Configurar package.json e instalar dependências (commits d008f84..82028fa, review clean — Minor: @types/bcryptjs deprecated, remover na Task 2)
- [x] Task 2: Configurar TypeScript e Nodemon (commits 82028fa..dd74aa3, review clean)
- [x] Task 3: Criar arquivos de ambiente e .gitignore (commits dd74aa3..cbf687d, review clean)
- [x] Task 4: Inicializar Prisma (commits cbf687d..fae12d3, review clean — Prisma 7 breaking change: url movido para prisma.config.ts, schema valida OK)
- [x] Task 5: Criar estrutura de pastas e server.ts (commits fae12d3..9ae9458, review clean)

## Fase 1 — Auth, Usuários, Vínculos (BASE: 532f6ef)

- [x] Task 1: Prisma Schema + Migration (commits 532f6ef..7e10b79, review clean)
- [x] Task 2: Core Lib + Types (commits 7e10b79..0052380, review clean)
- [x] Task 3: Middlewares (commits 0052380..9c9a1c6, review clean — Minor: falta return após 401 no catch do authMiddleware)
- [x] Task 4: Auth (register + login) (commits 9c9a1c6..516718d, implementado e testado manualmente)
- [x] Task 5: Usuários (/me) (commits 516718d..ced18ca, implementado e testado manualmente)
- [x] Task 6: Vínculos + Cuidador/Idosos (commits ced18ca..e2b88f7, implementado e testado manualmente)
- [x] Fix: ts-node files:true em tsconfig (commit fa45a62)

## Fases 2-4 (BASE: fa45a62)

- [x] Fase 2 Task 1: assertAccessToIdoso utility (fa45a62..1424d17, review clean)
- [x] Fase 2 Task 2: Medicamentos Service (1424d17..7f7a00c, review clean)
- [x] Fase 2 Task 3: Controller + Routes + server.ts (7f7a00c..b04b064, review clean — Minor: regex msg inconsistency, implicit 200)
- [x] Fase 3 Task 1: Utils datas (b04b064..a11a8f5, review clean)
- [x] Fase 3 Task 2: Registros POST+GET (a11a8f5..7f69521, review+fix: TOCTOU corrigido com interactive transaction)
- [x] Fase 3 Task 3: /idoso/hoje (7f69521..f0b91d3, review clean)
- [x] Fase 4 Task 1: Utils alertas (f0b91d3..fa1a010, review+fix: single Date() call)
- [x] Fase 4 Task 2: Dashboard + Alertas (fa1a010..9dc8746, review+fix: NaN guard + null check)

## Revisão Final Setup (d008f84..9ae9458)

Aprovado com ressalvas. Findings:
- [Important - aceito] ts-node 10 + TS6: testado e funcionando no Task 5. Se der problema no futuro: substituir ts-node por tsx e atualizar nodemon.json.
- [Important - aceito] schema.prisma sem url: correto para Prisma 7, prisma validate passou.
- [Minor] Sem CORS — adicionar na primeira feature que conectar ao client
- [Minor] Sem error handler centralizado — adicionar na primeira feature
- [Minor] nodemon sem --transpile-only — performance, baixo risco agora
