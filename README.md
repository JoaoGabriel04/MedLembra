# MedLembra

Sistema web de gestão de medicamentos de uso contínuo para idosos. Permite que cuidadores cadastrem medicamentos e acompanhem a adesão, enquanto o idoso vê uma tela simples com o checklist do dia.

---

## Visão geral

| Perfil | Experiência |
|---|---|
| **Idoso** | Checklist diário de medicamentos; marca cada horário como tomado ou pulado |
| **Cuidador** | Dashboard com adesão, estoque e alertas; CRUD de medicamentos; visão readonly do dia do idoso |

---

## Stack

### Backend (`server/`)

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | Express 5 |
| ORM | Prisma 7 (adapter Neon serverless) |
| Banco | PostgreSQL (Neon) |
| Auth | JWT + bcryptjs |
| Validação | Zod |
| Segurança | helmet + express-rate-limit + CORS |

### Frontend (`client/`)

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript |
| Estilização | Tailwind CSS 4 + shadcn/ui |
| Estado remoto | SWR |
| Estado de auth | Zustand |
| Formulários | React Hook Form + Zod |
| Gráficos | Recharts |
| Ícones | lucide-react |
| Toasts | Sonner |
| Datas | date-fns (locale pt-BR, timezone America/Fortaleza) |

---

## Estrutura do projeto

```
MedLembra/
├── server/           # API REST
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── src/
│       ├── controllers/
│       ├── services/
│       ├── repositories/
│       ├── routes/
│       ├── middlewares/
│       ├── lib/
│       └── utils/
└── client/           # Next.js app
    ├── app/
    │   ├── (auth)/         # /login  /registrar
    │   ├── (idoso)/        # /hoje
    │   ├── (cuidador)/     # /idosos  /idosos/[id]  /alertas
    │   └── perfil/
    ├── components/
    ├── hooks/
    ├── lib/
    └── types/
```

---

## Configuração e execução local

### Pré-requisitos

- Node.js 20+
- Banco PostgreSQL acessível (recomendado: [Neon](https://neon.tech))

### Backend

```bash
cd server
npm install
```

Crie o arquivo `.env`:

```env
PORT=7000
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
JWT_SECRET="chave_secreta_forte"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:3000"
```

Execute as migrações e suba o servidor:

```bash
npx prisma migrate deploy
npm run dev        # desenvolvimento (nodemon)
npm run build && npm start   # produção
```

O servidor ficará disponível em `http://localhost:7000`.

### Frontend

```bash
cd client
npm install
```

Crie o arquivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:7000/api
```

Suba o frontend:

```bash
npm run dev      # desenvolvimento — http://localhost:3000
npm run build && npm start   # produção
```

---

## Principais endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/auth/register` | Criar conta (IDOSO ou CUIDADOR) |
| `POST` | `/api/auth/login` | Autenticar e obter JWT |
| `GET` | `/api/usuarios/me` | Dados do usuário logado |
| `POST` | `/api/vinculos` | Vincular idoso ao cuidador (por e-mail) |
| `GET` | `/api/cuidador/idosos` | Listar idosos do cuidador |
| `GET` | `/api/cuidador/dashboard/:idosoId` | Dashboard consolidado do idoso |
| `GET` | `/api/cuidador/alertas` | Alertas de todos os idosos |
| `GET` | `/api/medicamentos?idosoId=` | Listar medicamentos de um idoso |
| `POST` | `/api/medicamentos` | Criar medicamento com horários |
| `PUT` | `/api/medicamentos/:id` | Atualizar medicamento |
| `DELETE` | `/api/medicamentos/:id` | Remover medicamento |
| `POST` | `/api/medicamentos/:id/registros` | Registrar tomada ou pulo |
| `GET` | `/api/idoso/hoje` | Checklist do dia (status por horário) |

Todas as rotas (exceto `/auth/*`) exigem `Authorization: Bearer <token>`.

---

## Telas implementadas

### Área do idoso

- **`/hoje`** — Checklist diário com estado por horário (PENDENTE / TOMADO / PULADO), optimistic update, confirmação antes de pular dose

### Área do cuidador

- **`/idosos`** — Lista de idosos vinculados com badge de alertas ativos
- **`/idosos/[id]`** — Dashboard: cards de resumo + gráfico de adesão 7 dias + alertas
- **`/idosos/[id]/hoje`** — Visão readonly do checklist do idoso
- **`/idosos/[id]/medicamentos`** — Tabela com editar / excluir
- **`/idosos/[id]/medicamentos/novo`** — Formulário de cadastro
- **`/idosos/[id]/medicamentos/[medId]/editar`** — Formulário de edição
- **`/alertas`** — Todos os alertas de todos os idosos

### Comuns

- **`/login`** e **`/registrar`** — Auth com validação Zod
- **`/perfil`** — Dados pessoais + vínculo com cuidador (idoso) ou listagem de idosos (cuidador)

---

## Deploy

| Serviço | Projeto |
|---|---|
| [Vercel](https://vercel.com) | Frontend — apontar root para `client/` |
| [Render](https://render.com) | Backend — Web Service Node, root `server/` |
| [Neon](https://neon.tech) | Banco PostgreSQL serverless |

Variáveis necessárias na Vercel: `NEXT_PUBLIC_API_URL` com a URL pública do Render.  
Variável necessária no Render: `CORS_ORIGIN` com a URL do deploy na Vercel.
