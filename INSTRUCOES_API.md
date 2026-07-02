# INSTRUÇÕES DA API — Sistema Farol

> **Gate de aprovação obrigatório.** Este documento define o contrato da API do sistema Farol. Nenhum código deve ser gerado sem que o contrato descrito aqui esteja aprovado. Alterações no contrato devem ser refletidas primeiro neste arquivo, discutidas, e só depois implementadas.

---

## 1. Contexto do sistema

Farol é um sistema web para gestão de medicamentos de uso contínuo em idosos, com duas visões:

- **Idoso:** checklist diário simples com os medicamentos do dia e opção de marcar tomada.
- **Cuidador:** dashboard consolidado com estoque, adesão e alertas dos idosos vinculados.

**Stack:** Express + Prisma + PostgreSQL + TypeScript.

---

## 2. Convenções globais

### 2.1 Base URL

```
Desenvolvimento: http://localhost:3333/api
Produção:        (a definir)
```

### 2.2 Autenticação

- JWT no header `Authorization: Bearer <token>`.
- Token gerado no login/register, expiração de 7 dias.
- Payload do JWT contém: `{ sub: usuarioId, tipo: 'IDOSO' | 'CUIDADOR' }`.

### 2.3 Formato de dados

- Todas as requisições e respostas usam JSON.
- Datas/horas em ISO 8601 UTC (ex: `2026-07-01T11:30:00Z`).
- Datas puras (sem hora) em formato `YYYY-MM-DD`.
- Horários de tomada em formato `HH:mm` (24h).
- Enums em MAIÚSCULAS: `IDOSO`, `CUIDADOR`, `TOMADO`, `PULADO`, `PENDENTE`.

### 2.4 Timezone

- Backend sempre armazena e retorna em UTC.
- A conversão para America/Fortaleza (horário de Brasília) é responsabilidade do front.

### 2.5 Formato de erro

Todo erro retorna JSON no formato:

```json
{
  "error": "MENSAGEM_CURTA",
  "message": "Descrição legível para o usuário",
  "details": { }
}
```

O campo `details` é opcional e traz informação estruturada de validação quando aplicável.

### 2.6 Códigos de status

| Código | Uso |
|--------|-----|
| 200 | Sucesso em GET/PUT |
| 201 | Sucesso em POST que criou recurso |
| 204 | Sucesso em DELETE (sem body) |
| 400 | Erro de validação de payload |
| 401 | Token ausente, inválido ou expirado |
| 403 | Autenticado, mas sem permissão no recurso |
| 404 | Recurso não encontrado |
| 409 | Conflito (ex: email duplicado, vínculo já existe) |
| 500 | Erro inesperado |

---

## 3. Middlewares

- **`authMiddleware`** — valida JWT e injeta `req.user = { id, tipo }`.
- **`requireTipo(tipo)`** — bloqueia se `req.user.tipo` diferente do esperado.
- **`assertAccessToIdoso(idosoId)`** — helper de serviço que valida se o usuário logado é o próprio idoso OU o cuidador vinculado a ele. Lança 403 se não.
- **`errorHandler`** — middleware final que captura erros e responde no formato padrão.

---

## 4. Endpoints — Fase 1: Autenticação e usuários

### 4.1 `POST /auth/register`

Cria um novo usuário e retorna token.

**Auth:** não requer.

**Request:**
```json
{
  "nome": "Maria Silva",
  "email": "maria@exemplo.com",
  "senha": "senhaForte123",
  "tipo": "IDOSO"
}
```

**Regras:**
- `senha` mínimo 8 caracteres.
- `tipo` deve ser `IDOSO` ou `CUIDADOR`.
- `email` deve ser único.

**Response 201:**
```json
{
  "token": "eyJhbGciOi...",
  "usuario": {
    "id": 1,
    "nome": "Maria Silva",
    "email": "maria@exemplo.com",
    "tipo": "IDOSO"
  }
}
```

**Erros:** 400 (validação), 409 (email já existe).

---

### 4.2 `POST /auth/login`

**Auth:** não requer.

**Request:**
```json
{ "email": "maria@exemplo.com", "senha": "senhaForte123" }
```

**Response 200:** mesmo formato de register.

**Erros:** 401 (credenciais inválidas).

---

### 4.3 `GET /usuarios/me`

Retorna dados do usuário autenticado.

**Auth:** requer.

**Response 200 (idoso):**
```json
{
  "id": 1,
  "nome": "Maria Silva",
  "email": "maria@exemplo.com",
  "tipo": "IDOSO",
  "cuidadorId": 5,
  "cuidador": {
    "id": 5,
    "nome": "João Silva",
    "email": "joao@exemplo.com"
  }
}
```

**Response 200 (cuidador):**
```json
{
  "id": 5,
  "nome": "João Silva",
  "email": "joao@exemplo.com",
  "tipo": "CUIDADOR",
  "idosos": [
    { "id": 1, "nome": "Maria Silva", "email": "maria@exemplo.com" }
  ]
}
```

---

### 4.4 `POST /vinculos`

Cria vínculo entre um idoso e um cuidador. Aceita a operação vindo de qualquer um dos lados: o cuidador vincula um idoso pelo email dele, ou o idoso vincula seu cuidador pelo email dele.

**Auth:** requer.

**Request:**
```json
{ "email": "outro@exemplo.com" }
```

**Regras:**
- Se logado é `CUIDADOR`, o email deve pertencer a um `IDOSO`.
- Se logado é `IDOSO`, o email deve pertencer a um `CUIDADOR`.
- Um idoso só pode ter um cuidador ativo por vez — vincular novamente sobrescreve.

**Response 200:**
```json
{
  "vinculo": { "idosoId": 1, "cuidadorId": 5 }
}
```

**Erros:** 400 (tipos incompatíveis), 404 (email não cadastrado), 409 (auto-vínculo).

---

### 4.5 `GET /cuidador/idosos`

Lista todos os idosos vinculados ao cuidador logado.

**Auth:** requer, apenas `CUIDADOR`.

**Response 200:**
```json
{
  "idosos": [
    { "id": 1, "nome": "Maria Silva", "email": "maria@exemplo.com" }
  ]
}
```

---

## 5. Endpoints — Fase 2: Medicamentos

### 5.1 `POST /medicamentos`

Cria medicamento com todos os horários no mesmo payload (atômico).

**Auth:** requer. Usuário logado deve ter acesso ao `idosoId` informado.

**Request:**
```json
{
  "idosoId": 1,
  "nome": "Losartana",
  "dosagem": "50mg",
  "frequenciaDiaria": 2,
  "estoqueAtual": 60,
  "dataValidade": "2026-12-31",
  "horarios": ["08:00", "20:00"]
}
```

**Regras:**
- `horarios.length` deve ser igual a `frequenciaDiaria`.
- Horários no formato `HH:mm`, sem duplicatas.
- `estoqueAtual` inteiro >= 0.

**Response 201:**
```json
{
  "id": 1,
  "idosoId": 1,
  "nome": "Losartana",
  "dosagem": "50mg",
  "frequenciaDiaria": 2,
  "estoqueAtual": 60,
  "dataValidade": "2026-12-31",
  "horarios": [
    { "id": 1, "hora": "08:00" },
    { "id": 2, "hora": "20:00" }
  ],
  "criadoEm": "2026-07-01T12:00:00Z",
  "atualizadoEm": "2026-07-01T12:00:00Z"
}
```

---

### 5.2 `GET /medicamentos`

Lista medicamentos de um idoso.

**Auth:** requer.
- Se logado é `IDOSO`, retorna os próprios (ignora query).
- Se logado é `CUIDADOR`, `?idosoId=` é obrigatório e deve estar vinculado.

**Query:** `?idosoId=1`

**Response 200:**
```json
{
  "medicamentos": [
    {
      "id": 1,
      "nome": "Losartana",
      "dosagem": "50mg",
      "frequenciaDiaria": 2,
      "estoqueAtual": 55,
      "dataValidade": "2026-12-31",
      "horarios": [
        { "id": 1, "hora": "08:00" },
        { "id": 2, "hora": "20:00" }
      ]
    }
  ]
}
```

---

### 5.3 `GET /medicamentos/:id`

Retorna um medicamento específico com horários.

**Auth:** requer acesso ao idoso dono do medicamento.

**Response 200:** mesmo formato de um item de `GET /medicamentos`.

**Erros:** 404 (não existe), 403 (existe mas usuário não tem acesso).

---

### 5.4 `PUT /medicamentos/:id`

Atualização parcial. Se `horarios` for enviado, substitui a lista inteira em transação.

**Auth:** requer acesso ao idoso.

**Request (qualquer combinação dos campos):**
```json
{
  "nome": "Losartana Potássica",
  "estoqueAtual": 90,
  "horarios": ["07:00", "19:00"]
}
```

**Response 200:** medicamento atualizado (mesmo formato do GET).

---

### 5.5 `DELETE /medicamentos/:id`

Remove medicamento e cascateia horários e registros.

**Auth:** requer acesso ao idoso.

**Response 204** (sem body).

---

## 6. Endpoints — Fase 3: Registros de tomada

> **Nota sobre schema:** para essa fase funcionar de forma limpa, recomenda-se adicionar um campo opcional `horarioId Int?` na tabela `RegistroTomada`, com FK para `Horario`. Isso permite ligar a tomada ao horário agendado específico. Alternativa: matching por proximidade (dia + hora mais próxima), mais frágil. Recomendação: aplicar a migração antes de começar a fase 3.

### 6.1 `POST /medicamentos/:id/registros`

Registra uma tomada (ou pulo) de dose.

**Auth:** requer acesso ao idoso dono do medicamento.

**Request:**
```json
{
  "status": "TOMADO",
  "horarioId": 1,
  "dataHora": "2026-07-01T11:00:00Z"
}
```

**Regras:**
- `dataHora` opcional — default é `now()` do servidor.
- `horarioId` opcional, mas recomendado (identifica qual slot do dia foi cumprido).
- Se `status = TOMADO`, decrementa `estoqueAtual` do medicamento em transação. Não permite estoque negativo (retorna 409).
- Se `status = PULADO`, apenas registra o evento.

**Response 201:**
```json
{
  "registro": {
    "id": 42,
    "medicamentoId": 1,
    "horarioId": 1,
    "dataHora": "2026-07-01T11:00:00Z",
    "status": "TOMADO"
  },
  "medicamento": {
    "id": 1,
    "estoqueAtual": 59
  }
}
```

**Erros:** 409 (estoque zerado ao tentar TOMADO).

---

### 6.2 `GET /medicamentos/:id/registros`

Histórico de registros do medicamento.

**Auth:** requer acesso ao idoso.

**Query:**
- `?limit=` (default 30, max 100)
- `?offset=` (default 0)
- `?desde=` (ISO date, opcional)
- `?ate=` (ISO date, opcional)

**Response 200:**
```json
{
  "registros": [
    {
      "id": 42,
      "horarioId": 1,
      "dataHora": "2026-07-01T11:00:00Z",
      "status": "TOMADO"
    }
  ],
  "total": 128
}
```

---

### 6.3 `GET /idoso/hoje`

**Endpoint agregador principal da tela do idoso.** Retorna todos os medicamentos do dia com o status de cada horário resolvido.

**Auth:** requer.
- `IDOSO`: retorna os próprios (ignora query).
- `CUIDADOR`: `?idosoId=` obrigatório.

**Response 200:**
```json
{
  "data": "2026-07-01",
  "medicamentos": [
    {
      "id": 1,
      "nome": "Losartana",
      "dosagem": "50mg",
      "estoqueAtual": 55,
      "horarios": [
        {
          "horarioId": 1,
          "hora": "08:00",
          "status": "TOMADO",
          "registroId": 42,
          "registradoEm": "2026-07-01T11:00:00Z"
        },
        {
          "horarioId": 2,
          "hora": "20:00",
          "status": "PENDENTE",
          "registroId": null,
          "registradoEm": null
        }
      ]
    }
  ]
}
```

**Regra de resolução do status por horário:**
- Para cada `horario` do medicamento, procura `RegistroTomada` com `horarioId` correspondente e `dataHora` dentro do dia local (America/Fortaleza).
- Se encontrar `TOMADO` → status = `TOMADO`.
- Se encontrar `PULADO` → status = `PULADO`.
- Se nada encontrado → status = `PENDENTE`.

---

## 7. Endpoints — Fase 4: Dashboard e alertas

### 7.1 `GET /cuidador/dashboard/:idosoId`

Visão consolidada de um idoso para o cuidador.

**Auth:** requer, apenas `CUIDADOR`, e `idosoId` deve estar vinculado.

**Response 200:**
```json
{
  "idoso": {
    "id": 1,
    "nome": "Maria Silva",
    "email": "maria@exemplo.com"
  },
  "resumo": {
    "totalMedicamentos": 5,
    "adesao7dias": 0.85,
    "totalDosesAgendadas7dias": 34,
    "totalTomadas7dias": 29,
    "totalPuladas7dias": 3,
    "totalPendentes7dias": 2
  },
  "alertas": [
    {
      "tipo": "ESTOQUE_BAIXO",
      "medicamentoId": 1,
      "medicamentoNome": "Losartana",
      "diasRestantes": 5
    },
    {
      "tipo": "VALIDADE_PROXIMA",
      "medicamentoId": 2,
      "medicamentoNome": "AAS",
      "diasParaVencer": 20,
      "dataValidade": "2026-07-21"
    }
  ]
}
```

**Regras de alerta (calculadas on-the-fly em `utils/alertas.ts`):**
- `ESTOQUE_BAIXO`: quando `estoqueAtual / frequenciaDiaria <= 7` (dias restantes).
- `VALIDADE_PROXIMA`: quando `dataValidade - hoje <= 30` dias.
- `adesao7dias`: `totalTomadas7dias / totalDosesAgendadas7dias`, arredondado a 2 casas.

---

### 7.2 `GET /cuidador/alertas`

Lista alertas de todos os idosos vinculados.

**Auth:** requer, apenas `CUIDADOR`.

**Response 200:**
```json
{
  "alertas": [
    {
      "idosoId": 1,
      "idosoNome": "Maria Silva",
      "tipo": "ESTOQUE_BAIXO",
      "medicamentoId": 1,
      "medicamentoNome": "Losartana",
      "diasRestantes": 5
    }
  ]
}
```

---

## 8. Regras de negócio importantes

1. **Consistência de horários:** ao criar/editar medicamento, `horarios.length` deve casar com `frequenciaDiaria`. O backend rejeita se não bater.
2. **Estoque não negativo:** `POST /registros` com `status=TOMADO` roda em transação — decrementa estoque e insere registro atomicamente. Se estoque já for 0, retorna 409.
3. **Acesso a idosos:** toda rota que envolve dados de um idoso passa por `assertAccessToIdoso(idosoId)`. Cuidador só vê seus idosos vinculados; idoso só vê os próprios dados.
4. **Um cuidador por idoso (MVP):** vincular um novo cuidador sobrescreve o anterior. Um cuidador pode ter N idosos.
5. **Datas do dia:** o cálculo de "hoje" e "últimos 7 dias" usa o fuso `America/Fortaleza`, não UTC — importante para não pular ou duplicar dias na virada de meia-noite.

---

## 9. Estrutura de pastas sugerida

```
src/
├── routes/
│   ├── auth.routes.ts
│   ├── usuarios.routes.ts
│   ├── vinculos.routes.ts
│   ├── medicamentos.routes.ts
│   ├── registros.routes.ts
│   ├── idoso.routes.ts
│   └── cuidador.routes.ts
├── controllers/     # um por recurso, thin (só HTTP)
├── services/        # regras de negócio, tudo que toca no Prisma
├── middlewares/
│   ├── auth.middleware.ts
│   └── error.middleware.ts
├── lib/
│   ├── prisma.ts    # singleton do PrismaClient
│   ├── jwt.ts
│   └── bcrypt.ts
├── utils/
│   ├── alertas.ts   # cálculo de estoque baixo e validade
│   └── datas.ts     # helpers de fuso e "hoje"
├── types/
│   └── express.d.ts # augment de Request para req.user
└── server.ts
```

---

## 10. Ordem de implementação

1. Setup (Express, Prisma, dotenv, middlewares base, error handler).
2. Fase 1 completa (auth + usuários + vínculos) com testes manuais via REST client.
3. Fase 2 completa (medicamentos + horários).
4. Migração de schema para adicionar `horarioId` em `RegistroTomada`.
5. Fase 3 completa (registros + `/idoso/hoje`).
6. Fase 4 completa (dashboard + alertas).

Cada fase termina com um teste manual do fluxo completo antes de partir para a próxima. Nenhuma otimização prematura (cache, refresh tokens, rate limiting) antes de todas as fases estarem funcionais.

---

## 11. Fora de escopo do MVP

Explicitamente **não** entram nesta versão:
- OCR / Visão computacional para leitura de receitas.
- App mobile nativo.
- Notificações push.
- Refresh tokens.
- Multi-cuidador por idoso.
- Auditoria/log de alterações.
- Envio de e-mail via Resend (candidato a extensão se sobrar tempo).
- Registro no INPI, aprovação em CEP, TCLE.

Esses itens estavam no projeto original de pesquisa e foram removidos por não caberem no escopo de trabalho final de disciplina.