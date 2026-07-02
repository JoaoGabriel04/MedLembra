# MedLembra — Documentação da API

**Base URL:** `http://localhost:7000`

---

## Autenticação

Todas as rotas protegidas exigem o header:

```
Authorization: Bearer <token>
```

O token é obtido via `POST /api/auth/login` e expira conforme `JWT_EXPIRES_IN` (padrão: `7d`).

---

## Formato de erros

Todas as respostas de erro seguem o padrão:

```json
{
  "error": "CÓDIGO_DO_ERRO",
  "message": "Descrição legível",
  "campos": {
    "nomeDoCampo": ["mensagem de erro"]
  }
}
```

| Código | HTTP | Quando ocorre |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Dados inválidos no body, params ou query |
| `UNAUTHORIZED` | 401 | Token ausente, malformado ou expirado |
| `FORBIDDEN` | 403 | Usuário não tem permissão para a operação |
| `NOT_FOUND` | 404 | Recurso não encontrado |
| `CONFLICT` | 409 | Recurso já existe (ex: e-mail duplicado) |
| `RATE_LIMIT_EXCEEDED` | 429 | Muitas requisições |
| `INTERNAL_ERROR` | 500 | Erro interno do servidor |

---

## Rate Limiting

| Escopo | Limite |
|---|---|
| Global (todos os endpoints) | 100 req / 15 min por IP |
| Autenticação (`/api/auth/*`) | 10 req / 15 min por IP |

---

## Rotas

### Auth — `/api/auth`

> Sem autenticação. Rate limit estrito (10 req/15 min).

---

#### `POST /api/auth/register`

Cadastra um novo usuário.

**Body:**
```json
{
  "nome": "string (obrigatório)",
  "email": "string email (obrigatório)",
  "senha": "string, mín. 8 caracteres (obrigatório)",
  "tipo": "IDOSO | CUIDADOR (obrigatório)"
}
```

**Resposta `201`:**
```json
{
  "token": "jwt_token",
  "usuario": {
    "id": 1,
    "nome": "João",
    "email": "joao@email.com",
    "tipo": "IDOSO"
  }
}
```

---

#### `POST /api/auth/login`

Autentica um usuário existente.

**Body:**
```json
{
  "email": "string email (obrigatório)",
  "senha": "string (obrigatório)"
}
```

**Resposta `200`:**
```json
{
  "token": "jwt_token",
  "usuario": {
    "id": 1,
    "nome": "João",
    "email": "joao@email.com",
    "tipo": "IDOSO"
  }
}
```

---

### Usuários — `/api/usuarios`

> Requer autenticação.

---

#### `GET /api/usuarios/me`

Retorna o perfil do usuário autenticado.

**Resposta `200`:**
```json
{
  "id": 1,
  "nome": "João",
  "email": "joao@email.com",
  "tipo": "IDOSO",
  "criadoEm": "2024-01-01T00:00:00.000Z"
}
```

---

### Vínculos — `/api/vinculos`

> Requer autenticação. Cuidadores vinculam-se a idosos pelo e-mail.

---

#### `POST /api/vinculos`

Cria um vínculo entre o cuidador autenticado e um idoso.

**Body:**
```json
{
  "email": "string email do idoso (obrigatório)"
}
```

**Resposta `200`:**
```json
{
  "id": 1,
  "cuidadorId": 2,
  "idosoId": 1,
  "criadoEm": "2024-01-01T00:00:00.000Z"
}
```

---

### Medicamentos — `/api/medicamentos`

> Requer autenticação.

---

#### `POST /api/medicamentos`

Cadastra um novo medicamento.

**Body:**
```json
{
  "idosoId": "number inteiro positivo (obrigatório)",
  "nome": "string (obrigatório)",
  "dosagem": "string, ex: '500mg' (obrigatório)",
  "frequenciaDiaria": "number inteiro positivo (obrigatório)",
  "estoqueAtual": "number inteiro >= 0 (obrigatório)",
  "dataValidade": "string YYYY-MM-DD (obrigatório)",
  "horarios": ["HH:mm", "..."] 
}
```

> `horarios.length` deve ser igual a `frequenciaDiaria`. Sem duplicatas.

**Resposta `201`:**
```json
{
  "id": 1,
  "nome": "Paracetamol",
  "dosagem": "500mg",
  "frequenciaDiaria": 2,
  "estoqueAtual": 30,
  "dataValidade": "2025-12-31",
  "horarios": [
    { "id": 1, "hora": "08:00" },
    { "id": 2, "hora": "20:00" }
  ]
}
```

---

#### `GET /api/medicamentos`

Lista medicamentos acessíveis ao usuário autenticado.

**Query (opcional):**
| Param | Tipo | Descrição |
|---|---|---|
| `idosoId` | number | Filtrar por idoso específico (cuidadores) |

**Resposta `200`:** array de medicamentos (mesmo formato do POST).

---

#### `GET /api/medicamentos/:id`

Retorna um medicamento pelo ID.

**Params:** `:id` — inteiro positivo.

**Resposta `200`:** objeto medicamento.

---

#### `PUT /api/medicamentos/:id`

Atualiza um medicamento. Todos os campos são opcionais, mas se `frequenciaDiaria` for alterado, `horarios` deve ser fornecido junto.

**Params:** `:id` — inteiro positivo.

**Body (todos opcionais):**
```json
{
  "nome": "string",
  "dosagem": "string",
  "frequenciaDiaria": "number",
  "estoqueAtual": "number",
  "dataValidade": "YYYY-MM-DD",
  "horarios": ["HH:mm"]
}
```

**Resposta `200`:** objeto medicamento atualizado.

---

#### `DELETE /api/medicamentos/:id`

Remove um medicamento e seus registros.

**Params:** `:id` — inteiro positivo.

**Resposta `204`:** sem corpo.

---

### Registros — `/api/medicamentos/:id/registros`

> Requer autenticação. `:id` é o ID do medicamento.

---

#### `POST /api/medicamentos/:id/registros`

Registra a tomada ou pulo de um medicamento.

**Params:** `:id` — ID do medicamento (inteiro positivo).

**Body:**
```json
{
  "status": "TOMADO | PULADO (obrigatório)",
  "horarioId": "number inteiro positivo (opcional)",
  "dataHora": "string ISO 8601 (opcional, default: agora)"
}
```

**Resposta `201`:**
```json
{
  "id": 1,
  "medicamentoId": 1,
  "status": "TOMADO",
  "dataHora": "2024-01-01T08:00:00.000Z"
}
```

---

#### `GET /api/medicamentos/:id/registros`

Lista o histórico de registros de um medicamento.

**Params:** `:id` — ID do medicamento (inteiro positivo).

**Query:**
| Param | Tipo | Default | Descrição |
|---|---|---|---|
| `limit` | number (1–100) | 30 | Quantidade de registros |
| `offset` | number >= 0 | 0 | Offset para paginação |
| `desde` | string ISO 8601 | — | Data inicial do filtro |
| `ate` | string ISO 8601 | — | Data final do filtro |

**Resposta `200`:**
```json
{
  "total": 42,
  "registros": [
    {
      "id": 1,
      "status": "TOMADO",
      "dataHora": "2024-01-01T08:00:00.000Z"
    }
  ]
}
```

---

### Cuidador — `/api/cuidador`

> Requer autenticação com `tipo: CUIDADOR`.

---

#### `GET /api/cuidador/idosos`

Lista todos os idosos vinculados ao cuidador autenticado.

**Resposta `200`:**
```json
[
  {
    "id": 1,
    "nome": "Maria",
    "email": "maria@email.com"
  }
]
```

---

#### `GET /api/cuidador/dashboard/:idosoId`

Retorna o painel de um idoso específico com medicamentos e adesão.

**Params:** `:idosoId` — inteiro positivo.

**Resposta `200`:**
```json
{
  "idoso": { "id": 1, "nome": "Maria" },
  "medicamentos": [...],
  "adesaoHoje": 0.75
}
```

---

#### `GET /api/cuidador/alertas`

Lista alertas de medicamentos em atraso ou estoque baixo dos idosos vinculados.

**Resposta `200`:**
```json
[
  {
    "tipo": "ATRASO | ESTOQUE_BAIXO",
    "medicamento": { "id": 1, "nome": "Paracetamol" },
    "idoso": { "id": 1, "nome": "Maria" },
    "mensagem": "Medicamento não tomado às 08:00"
  }
]
```

---

### Idoso — `/api/idoso`

> Requer autenticação.

---

#### `GET /api/idoso/hoje`

Retorna os medicamentos e horários do dia atual para o idoso autenticado. Cuidadores podem passar `idosoId` para consultar um idoso específico.

**Query (opcional):**
| Param | Tipo | Descrição |
|---|---|---|
| `idosoId` | number inteiro positivo | Consultar idoso específico (apenas cuidadores) |

**Resposta `200`:**
```json
{
  "data": "2024-01-01",
  "medicamentos": [
    {
      "id": 1,
      "nome": "Paracetamol",
      "dosagem": "500mg",
      "horarios": [
        {
          "id": 1,
          "hora": "08:00",
          "registro": null
        },
        {
          "id": 2,
          "hora": "20:00",
          "registro": { "status": "TOMADO", "dataHora": "2024-01-01T20:05:00.000Z" }
        }
      ]
    }
  ]
}
```
