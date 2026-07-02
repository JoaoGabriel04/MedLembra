# Fase 1 — Task 1: Prisma Schema + Migration

## Contexto

Você está implementando a Fase 1 do backend MedLembra, um sistema de gestão de medicamentos para idosos.
- Raiz do monorepo: `C:\Projetos\Aulas Ericson\MedLembra\`
- Pasta do servidor: `C:\Projetos\Aulas Ericson\MedLembra\server\`
- Prisma 7 já está instalado e configurado em `server/prisma.config.ts` com DATABASE_URL e DIRECT_URL
- O schema atual (`server/prisma/schema.prisma`) tem só datasource + generator, sem models
- Commits da RAIZ do monorepo

## Restrições Globais

- Enums em MAIÚSCULAS: IDOSO, CUIDADOR, TOMADO, PULADO, PENDENTE
- Commits da raiz do monorepo
- Comandos npx executados em `server/`

## O que fazer

**Files:**
- Modify: `server/prisma/schema.prisma`

**Produces:** modelos `Usuario`, `Medicamento`, `Horario`, `RegistroTomada` + enums `TipoUsuario`, `StatusTomada` disponíveis via `@prisma/client`

### Step 1: Substituir prisma/schema.prisma

O arquivo `server/prisma/schema.prisma` deve ficar exatamente assim:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

enum TipoUsuario {
  IDOSO
  CUIDADOR
}

enum StatusTomada {
  TOMADO
  PULADO
  PENDENTE
}

model Usuario {
  id           Int         @id @default(autoincrement())
  nome         String
  email        String      @unique
  senha        String
  tipo         TipoUsuario

  cuidadorId   Int?
  cuidador     Usuario?    @relation("CuidadorIdosos", fields: [cuidadorId], references: [id])
  idosos       Usuario[]   @relation("CuidadorIdosos")

  medicamentos Medicamento[]

  criadoEm    DateTime    @default(now())
  atualizadoEm DateTime   @updatedAt
}

model Medicamento {
  id               Int      @id @default(autoincrement())
  idosoId          Int
  idoso            Usuario  @relation(fields: [idosoId], references: [id], onDelete: Cascade)
  nome             String
  dosagem          String
  frequenciaDiaria Int
  estoqueAtual     Int
  dataValidade     DateTime @db.Date

  horarios         Horario[]
  registros        RegistroTomada[]

  criadoEm        DateTime @default(now())
  atualizadoEm    DateTime @updatedAt
}

model Horario {
  id            Int         @id @default(autoincrement())
  medicamentoId Int
  medicamento   Medicamento @relation(fields: [medicamentoId], references: [id], onDelete: Cascade)
  hora          String

  registros     RegistroTomada[]
}

model RegistroTomada {
  id            Int          @id @default(autoincrement())
  medicamentoId Int
  medicamento   Medicamento  @relation(fields: [medicamentoId], references: [id], onDelete: Cascade)
  horarioId     Int?
  horario       Horario?     @relation(fields: [horarioId], references: [id])
  dataHora      DateTime     @default(now())
  status        StatusTomada
}
```

### Step 2: Validar o schema

Execute dentro de `server/`:

```bash
npx prisma validate
```

Esperado: schema válido.

### Step 3: Rodar a migration

Execute dentro de `server/`:

```bash
npx prisma migrate dev --name init
```

Esperado: migration aplicada com sucesso. Se der erro de conexão, verifique se DATABASE_URL no .env está correto.

### Step 4: Verificar Prisma Client gerado

```bash
npx prisma generate
```

Esperado: `Generated Prisma Client` sem erros.

### Step 5: Commit (da raiz do monorepo)

```bash
git add server/prisma/schema.prisma server/prisma/migrations/
git commit -m "feat: add full prisma schema — Usuario, Medicamento, Horario, RegistroTomada"
```

## Report

Escreva relatório em: `C:\Projetos\Aulas Ericson\MedLembra\.superpowers\sdd\fase1-task-1-report.md`

Inclua: status, hash do commit, output do `prisma validate`, output do `prisma migrate dev`, concerns.

Retorne apenas: STATUS, hash do commit, resumo de 1 linha.
