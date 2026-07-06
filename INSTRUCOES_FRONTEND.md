# INSTRUÇÕES DO FRONTEND — Sistema MedLembra

> **Gate de aprovação obrigatório.** Este documento define o contrato do front-end do MedLembra. Nenhum componente, rota ou tela deve ser implementado sem que o contrato aqui esteja aprovado. Alterações devem ser refletidas primeiro neste arquivo, discutidas, e só depois codadas.

---

## 1. Contexto e escopo

Frontend web do MedLembra, atendendo duas experiências distintas no mesmo domínio:

- **Idoso:** tela única e simples com o checklist de medicamentos do dia.
- **Cuidador:** dashboard com visão consolidada, CRUD de medicamentos e alertas dos idosos vinculados.

O front consome a API descrita em `INSTRUCOES_API.md` e não implementa lógica de negócio própria — apenas orquestra estado remoto, autenticação e apresentação.

---

## 2. Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) |
| Linguagem | TypeScript |
| Estilização | Tailwind CSS + shadcn/ui |
| Estado remoto (GET) | SWR |
| Estado remoto (mutations) | Chamadas diretas + `mutate` do SWR |
| Estado local de auth | Zustand |
| Ícones | lucide-react |
| Gráficos | recharts |
| Datas | date-fns + `pt-BR` locale |
| Toasts | sonner (via shadcn) |
| Forms | React Hook Form + Zod |

Nenhuma outra dependência sem discussão prévia.

---

## 3. Convenções globais

### 3.1 Variáveis de ambiente

```
NEXT_PUBLIC_API_URL=http://localhost:3333/api    # dev
NEXT_PUBLIC_API_URL=https://medlembra-api.onrender.com/api   # produção
```

Nenhum outro `NEXT_PUBLIC_*` deve carregar segredo — o front é 100% público.

### 3.2 Idioma e localização

- Textos em `pt-BR`.
- Datas formatadas com `date-fns/locale/pt-BR`, timezone `America/Fortaleza`.
- Nunca exibir horário em UTC pro usuário.

### 3.3 Autenticação

- JWT retornado pelo backend é armazenado em `localStorage` sob a chave `medlembra.token`.
- Todo request autenticado passa `Authorization: Bearer <token>` via wrapper `api()`.
- Resposta 401 → limpa storage e redireciona para `/login`.
- Trade-off documentado: `localStorage` é vulnerável a XSS. Aceitável para MVP acadêmico; produção real usaria httpOnly cookie.

### 3.4 Copywriting

- Tom direto e sem infantilização.
- Nunca chamar o idoso de "vovô/vovó" ou similar.
- Sem emojis em nenhuma parte da UI (nem em toasts, nem em empty states) — usar ícones `lucide-react`.
- Erros mostrados ao usuário devem ser em português claro; usar `error.message` da API quando disponível, com fallback genérico ("Não foi possível concluir a ação").

---

## 4. Design system

### 4.1 Paleta

Cinco cores. Todas em tons "warm stone" mais um acento teal amortecido. Sem cores berrantes, sem sinalização por cor pura (sempre par com ícone).

| Token | Uso | Hex |
|---|---|---|
| `--color-bg` | Fundo geral | `#FAFAF9` (stone-50) |
| `--color-surface` | Cards, inputs | `#F5F5F4` (stone-100) |
| `--color-border` | Bordas, divisores | `#D6D3D1` (stone-300) |
| `--color-text` | Texto primário | `#292524` (stone-800) |
| `--color-accent` | CTAs, TOMADO, links | `#0F766E` (teal-700) |

Auxiliares derivados (permitido sem contar como cor nova):
- `--color-text-muted` → `#78716C` (stone-500) para labels e metadata.
- `--color-accent-hover` → `#134E4A` (teal-800) para hover de CTA.
- `--color-warning` → `#B45309` (amber-700), **exclusivo para badge de alerta** no cuidador. Nunca em botão nem em fundo grande.

Nenhuma outra cor pode ser introduzida sem revisão do design system.

### 4.2 Tipografia

- Fonte: **Inter** (via `next/font/google`).
- Idoso: base 20px, títulos 32px, labels 18px.
- Cuidador: base 15px, títulos 24px, labels 13px.
- Peso máximo em títulos: 600 (semibold). Sem 700/800.
- Line-height generoso na área do idoso (1.6 no corpo).

### 4.3 Border-radius

Único token, valor pequeno.

```css
:root { --radius: 0.25rem; } /* 4px */
```

Aplicado a botões, inputs, cards, badges. Circular só em avatar e radio.

### 4.4 Espaçamento

Grid de 4px (Tailwind default). Cards do idoso usam padding maior (`p-6`) e gap entre horários também (`gap-4`). Área do cuidador usa densidade padrão (`p-4`).

### 4.5 Sombras

Uso mínimo. Uma única sombra sutil (`shadow-sm` do Tailwind) em cards elevados; nada além. Sem `shadow-lg`, sem `shadow-2xl`.

### 4.6 Ícones

Todos vindos de `lucide-react`. Tamanhos fixos por contexto:

- Área do idoso: 24px (`className="size-6"`).
- Área do cuidador: 16px em tabelas/inputs, 20px em cards.
- Sidebar: 18px.

Mapeamento de conceitos:

| Conceito | Ícone |
|---|---|
| TOMADO | `CheckCircle2` (preenchido) |
| PENDENTE | `Circle` (outline) |
| PULADO | `MinusCircle` |
| Adicionar | `Plus` |
| Editar | `Pencil` |
| Excluir | `Trash2` |
| Voltar | `ChevronLeft` |
| Confirmar | `Check` |
| Alerta de estoque | `PackageOpen` |
| Alerta de validade | `CalendarClock` |
| Sair | `LogOut` |
| Idoso | `User` |
| Cuidador | `UserCog` |
| Medicamento | `Pill` |
| Vincular | `Link2` |

Um conceito = um ícone. Sem misturar `Check` e `CheckCircle2` para a mesma coisa.

---

## 5. Estrutura de pastas

```
client/
├── app/
│   ├── layout.tsx                    # providers + fonte
│   ├── page.tsx                      # redirect por tipo
│   ├── globals.css                   # tokens + Tailwind
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   └── registrar/page.tsx
│   ├── (idoso)/
│   │   ├── layout.tsx                # shell do idoso
│   │   ├── hoje/page.tsx
│   │   └── perfil/page.tsx
│   └── (cuidador)/
│       ├── layout.tsx                # sidebar
│       ├── idosos/
│       │   ├── page.tsx
│       │   └── [id]/
│       │       ├── page.tsx          # dashboard
│       │       ├── hoje/page.tsx
│       │       └── medicamentos/
│       │           ├── page.tsx
│       │           ├── novo/page.tsx
│       │           └── [medId]/editar/page.tsx
│       ├── alertas/page.tsx
│       └── perfil/page.tsx
├── src/
│   ├── lib/
│   │   ├── api.ts                    # wrapper de fetch
│   │   ├── auth-store.ts             # Zustand com token/usuario
│   │   ├── swr-keys.ts               # factory de chaves
│   │   ├── swr-config.tsx            # SWRConfig provider
│   │   └── utils.ts                  # cn(), formatters
│   ├── hooks/
│   │   ├── use-me.ts
│   │   ├── use-hoje.ts
│   │   ├── use-medicamentos.ts
│   │   ├── use-dashboard.ts
│   │   ├── use-alertas.ts
│   │   └── use-vinculos.ts
│   ├── components/
│   │   ├── ui/                       # shadcn (button, card, input, etc.)
│   │   ├── auth-guard.tsx
│   │   ├── idoso/
│   │   │   ├── card-medicamento.tsx
│   │   │   └── botao-tomar.tsx
│   │   └── cuidador/
│   │       ├── sidebar.tsx
│   │       ├── card-alerta.tsx
│   │       ├── grafico-adesao.tsx
│   │       └── formulario-medicamento.tsx
│   └── types/
│       └── api.ts                    # types do contrato
└── package.json
```

---

## 6. Camada de dados

### 6.1 Wrapper `api()`

Arquivo único em `src/lib/api.ts`. Responsabilidades:

1. Prefixar `NEXT_PUBLIC_API_URL`.
2. Injetar `Authorization: Bearer` se houver token.
3. Serializar/desserializar JSON.
4. Se resposta for 401: limpar token, redirecionar para `/login`.
5. Se resposta não-OK: lançar `ApiError` com `{ status, code, message, campos? }` do body da API.
6. Se resposta for 204: retornar `undefined`.

Assinatura:

```ts
export async function api<T>(path: string, init?: RequestInit): Promise<T>
```

### 6.2 SWR

- Provider `<SWRConfig>` no root layout com fetcher global (que só chama `api`).
- Config global: `revalidateOnFocus: false`, `revalidateOnReconnect: true`, `dedupingInterval: 2000`.
- Chaves de cache = path da API. Factory em `swr-keys.ts`:

```ts
export const swrKeys = {
  me: () => '/usuarios/me',
  cuidadorIdosos: () => '/cuidador/idosos',
  hoje: (idosoId?: number) => idosoId ? `/idoso/hoje?idosoId=${idosoId}` : '/idoso/hoje',
  medicamentos: (idosoId: number) => `/medicamentos?idosoId=${idosoId}`,
  medicamento: (id: number) => `/medicamentos/${id}`,
  dashboard: (idosoId: number) => `/cuidador/dashboard/${idosoId}`,
  alertas: () => '/cuidador/alertas',
}
```

### 6.3 Padrão de hook

Um arquivo por recurso em `src/hooks/`. Cada arquivo exporta:

- `useX()` — o SWR de leitura.
- Funções de mutation nomeadas (`criarMedicamento`, `marcarTomada`) que chamam `api()` e depois disparam `mutate(key)` das chaves afetadas.

Exemplo (`use-hoje.ts`):

```ts
import useSWR, { mutate } from 'swr'
import { api } from '@/lib/api'
import { swrKeys } from '@/lib/swr-keys'
import type { HojeResponse, StatusTomada } from '@/types/api'

export function useHoje(idosoId?: number) {
  return useSWR<HojeResponse>(swrKeys.hoje(idosoId))
}

export async function marcarTomada(
  medicamentoId: number,
  horarioId: number,
  status: Exclude<StatusTomada, 'PENDENTE'>,
  idosoId?: number
) {
  await mutate(
    swrKeys.hoje(idosoId),
    async () => {
      await api(`/medicamentos/${medicamentoId}/registros`, {
        method: 'POST',
        body: JSON.stringify({ status, horarioId }),
      })
      return undefined // força revalidação
    },
    {
      optimisticData: (atual: HojeResponse | undefined) =>
        atual ? aplicarStatusOtimista(atual, medicamentoId, horarioId, status) : atual!,
      rollbackOnError: true,
      revalidate: true,
    }
  )
  // dashboard usa estoque atualizado — invalida também
  if (idosoId) await mutate(swrKeys.dashboard(idosoId))
}
```

### 6.4 Regras de invalidação

Após cada mutation, invalidar toda chave que pode ter mudado:

| Mutation | Invalidar |
|---|---|
| `criarMedicamento(idosoId)` | `medicamentos(idosoId)`, `hoje(idosoId)`, `dashboard(idosoId)` |
| `atualizarMedicamento(id, idosoId)` | `medicamento(id)`, `medicamentos(idosoId)`, `hoje(idosoId)`, `dashboard(idosoId)` |
| `deletarMedicamento(id, idosoId)` | mesmo do atualizar |
| `marcarTomada(medId, ..., idosoId)` | `hoje(idosoId)`, `dashboard(idosoId)` |
| `criarVinculo()` | `me()`, `cuidadorIdosos()` |

---

## 7. Autenticação e proteção de rotas

### 7.1 Store

Zustand em `src/lib/auth-store.ts`:

```ts
interface AuthState {
  token: string | null
  usuario: { id: number; nome: string; email: string; tipo: 'IDOSO' | 'CUIDADOR' } | null
  hidratado: boolean            // true depois de ler localStorage no mount
  login(token: string, usuario: Usuario): void
  logout(): void
}
```

- Persistência via middleware `persist` do Zustand (chave `medlembra-auth`).
- `hidratado` inicia `false`; guardas de rota esperam ficar `true` antes de decidir.

### 7.2 AuthGuard

Componente `<AuthGuard requireTipo?>` usado dentro dos layouts protegidos:

- Enquanto `!hidratado`: renderiza skeleton.
- Se `!token`: redireciona para `/login`.
- Se `requireTipo` definido e `usuario.tipo` diferente: redireciona para a home do tipo correto.

O layout `(idoso)/layout.tsx` envolve os filhos com `<AuthGuard requireTipo="IDOSO">`. O `(cuidador)/layout.tsx` idem para `CUIDADOR`.

### 7.3 Redirect pós-login

`app/page.tsx`:
- Se `!token` → `/login`.
- Se `tipo === 'IDOSO'` → `/hoje`.
- Se `tipo === 'CUIDADOR'` → `/idosos`.

---

## 8. Contratos por tela

Cada tela lista: **objetivo**, **dados que consome**, **ações que dispara**, **estados visuais** (loading, erro, empty, sucesso).

### 8.1 `/login`

- **Objetivo:** autenticar usuário existente.
- **Consome:** nenhum GET.
- **Ações:** `POST /auth/login`.
- **Formulário:** email, senha. Zod validando ambos.
- **Estados:** botão desabilitado enquanto submetendo; erro exibido acima do formulário (não em toast); redirect via `router.replace('/')` no sucesso.

### 8.2 `/registrar`

- **Objetivo:** criar conta.
- **Ações:** `POST /auth/register`.
- **Formulário:** nome, email, senha, tipo (radio: IDOSO / CUIDADOR).
- **Após sucesso:** já vem token — armazena e redireciona igual login.

### 8.3 `/hoje` (idoso)

**Tela mais importante do produto. Padrão UX rigoroso.**

- **Objetivo:** mostrar checklist do dia e permitir marcar tomada.
- **Consome:** `useHoje()` sem argumento.
- **Layout:**
  - Header simples: `Olá, {primeiroNome}` (texto grande, 32px) + data por extenso (`Terça, 2 de julho`).
  - Lista vertical de cards, um por medicamento.
  - Cada card contém: nome + dosagem no topo; abaixo, um bloco por horário.
  - Cada bloco de horário exibe: hora (grande), ícone de estado, e — se PENDENTE — botão "Marcar como tomado".
  - Rodapé fixo pequeno com link "Perfil" (`User`) e "Sair" (`LogOut`).
- **Estados por horário:**
  - `PENDENTE`: ícone `Circle`, botão CTA teal com texto "Marcar como tomado" (altura 56px), link secundário menor "Pulei essa dose".
  - `TOMADO`: ícone `CheckCircle2` teal, texto "Tomado às HH:mm", sem botões.
  - `PULADO`: ícone `MinusCircle` cinza, texto "Pulado", sem botões.
- **Ação primária:** `marcarTomada(medId, horarioId, 'TOMADO')` com optimistic update.
- **Ação secundária:** `marcarTomada(medId, horarioId, 'PULADO')` com confirmação (`AlertDialog` do shadcn) — pra evitar clique acidental.
- **Loading inicial:** skeleton com 2 cards fake.
- **Empty (nenhum medicamento):** ilustração simples com ícone `Pill` grande e texto "Nenhum medicamento cadastrado. Peça para seu cuidador adicionar." Sem CTA (o idoso não cadastra).
- **Erro de rede:** banner amber no topo do conteúdo com "Não foi possível atualizar. Tentando novamente..." + retry automático do SWR.

### 8.4 `/perfil` (idoso)

- **Objetivo:** ver dados, vincular cuidador, sair.
- **Consome:** `useMe()`.
- **Blocos:**
  - Dados pessoais (nome, email) — apenas leitura no MVP.
  - Se já tem cuidador: mostra nome e email do cuidador + botão "Remover vínculo" (fora do MVP — deixar visualmente presente mas desabilitado com tooltip "Em breve").
  - Se não tem cuidador: input de email + botão "Vincular". Após sucesso, revalida `me()` e mostra toast.
  - Botão "Sair" no final, destrutivo mas discreto.

### 8.5 `/idosos` (cuidador — home)

- **Objetivo:** listar idosos vinculados e permitir vincular novo.
- **Consome:** `useCuidadorIdosos()`.
- **Layout:**
  - Título "Meus idosos".
  - Grid de cards (1 coluna mobile, 2 desktop). Cada card: nome, email, link "Abrir painel" apontando para `/idosos/[id]`.
  - Botão "Vincular novo idoso" abre `Dialog` com input de email.
- **Empty:** card único com ícone `Link2` e texto "Você ainda não tem idosos vinculados" + CTA de vincular.

### 8.6 `/idosos/[id]` (cuidador — dashboard do idoso)

- **Objetivo:** visão consolidada.
- **Consome:** `useDashboard(id)`.
- **Layout:**
  - Header com nome do idoso + tabs de navegação secundária: `Dashboard | Hoje | Medicamentos` (visual apenas — cada tab é um link pra sub-rota, não estado local).
  - Três cards de resumo em linha: total de medicamentos, adesão 7 dias (%), alertas ativos (count).
  - Gráfico Recharts (barra) mostrando dose agendada vs tomada nos últimos 7 dias. Cor única (`--color-accent`).
  - Lista de alertas ativos abaixo do gráfico. Cada alerta em card com ícone (`PackageOpen` ou `CalendarClock`), tipo, medicamento, e detalhe (`dias restantes` ou `dias para vencer`).

### 8.7 `/idosos/[id]/hoje` (cuidador — visão readonly do idoso)

- **Objetivo:** ver o que o idoso está fazendo hoje.
- **Consome:** `useHoje(id)`.
- **Layout:** mesmo componente de `/hoje` do idoso, mas com prop `readonly={true}`. Sem botões de marcar/pular. Se um horário estiver PENDENTE e já passou da hora, badge sutil "Atrasado".

### 8.8 `/idosos/[id]/medicamentos` (cuidador — lista)

- **Objetivo:** CRUD.
- **Consome:** `useMedicamentos(id)`.
- **Layout:**
  - Tabela: nome, dosagem, frequência/dia, estoque, validade, ações.
  - Ações por linha: `Pencil` (edit) e `Trash2` (delete com confirmação).
  - Botão superior "Novo medicamento" → `/idosos/[id]/medicamentos/novo`.
- **Empty:** texto centralizado "Nenhum medicamento cadastrado" + CTA.

### 8.9 `/idosos/[id]/medicamentos/novo` e `/[medId]/editar`

- **Objetivo:** formulário compartilhado.
- **Componente:** `<FormularioMedicamento modo="criar" | "editar" />`.
- **Campos:**
  - Nome (input)
  - Dosagem (input; exemplo "50mg")
  - Frequência diária (input numérico, 1-6)
  - Estoque atual (input numérico >= 0)
  - Data de validade (date input)
  - Horários (lista dinâmica de inputs `time`, quantidade = frequência)
- **Validação:** Zod refletindo as regras da API (horarios.length === frequenciaDiaria, sem duplicatas).
- **Ação:** `POST` ou `PUT` conforme modo. Sucesso → redirect pra `/idosos/[id]/medicamentos` + toast.

### 8.10 `/alertas` (cuidador — global)

- **Objetivo:** ver alertas de todos idosos num só lugar.
- **Consome:** `useAlertas()`.
- **Layout:** lista/tabela agrupada por idoso. Cada linha tem ícone, tipo, medicamento, contexto.
- **Empty:** texto "Nenhum alerta ativo. Tudo em ordem."

### 8.11 `/perfil` (cuidador)

Simétrico ao do idoso. Sem input de vincular (esse fluxo é feito em `/idosos`). Mostra dados + botão sair.

---

## 9. Acessibilidade (idoso)

Requisitos que se traduzem em critérios de aceitação, não sugestões:

- **Contraste WCAG AAA** em todo texto do idoso. Testar com Lighthouse.
- **Áreas de toque mínimas 56x56px** em botões primários (o CTA "Marcar como tomado" chega a 64px de altura).
- **Zero animação supérflua.** Transições limitadas a `transition-colors` em hover; sem fade-in de cards, sem parallax, sem carrossel.
- **Foco visível** em todos os interativos com outline `2px solid var(--color-accent)`.
- **Semântica correta:** `<button>` para ações, `<a>` para navegação. `aria-label` em botões que só têm ícone.
- **Confirmação em ação destrutiva** (pular dose): `AlertDialog` com botões grandes e mensagem clara.
- **Nunca esconder informação atrás de hover** — todo estado importante visível o tempo todo.

Acessibilidade do cuidador segue Tailwind + shadcn defaults (WCAG AA). Sem exigências extras.

---

## 10. Deploy

- **Frontend:** Vercel, projeto separado apontando para a pasta `client/`.
- **Backend:** Render.com (Web Service Node), apontando para `server/`.
- **CORS:** backend precisa aceitar `https://<slug>.vercel.app` no `CORS_ORIGIN`.
- **Env vars na Vercel:**
  - `NEXT_PUBLIC_API_URL` = URL pública do Render.
- **Sem preview deploys autenticados** — cada preview vai bater no mesmo backend de produção (aceitável pro MVP).
- **Smoke test pré-defesa:** roteiro simples de 8 passos (registrar, logar, vincular, cadastrar medicamento, marcar tomada, ver dashboard, disparar alerta reduzindo estoque, sair). Fazer no deploy antes da apresentação.

---

## 11. Ordem de implementação

Vertical slices. Cada fase entrega valor visível.

### Fase A — Fundação
1. Setup do Next 15 com App Router, Tailwind, shadcn init (com `--radius=0.25rem`).
2. Configurar Inter via `next/font/google`.
3. Definir tokens de cor em `globals.css`.
4. Instalar SWR, Zustand, lucide-react, sonner, recharts, react-hook-form, zod, date-fns.
5. Implementar `lib/api.ts`, `lib/auth-store.ts`, `lib/swr-keys.ts`, `lib/swr-config.tsx`.
6. `<AuthGuard>` funcional.

### Fase B — Auth e vínculo
7. Telas `/login` e `/registrar`.
8. Redirect pós-login por tipo.
9. `/perfil` do idoso com fluxo de vincular cuidador.
10. `/idosos` do cuidador com lista + dialog de vincular.

### Fase C — Idoso (crítico pra defesa)
11. `/hoje` com layout, estados por horário, `useHoje`.
12. Optimistic update em `marcarTomada`.
13. Confirmação em pular dose.
14. Empty state, loading skeleton, erro de rede.

### Fase D — Cuidador
15. `/idosos/[id]` com dashboard, cards e Recharts.
16. `/idosos/[id]/medicamentos` com tabela.
17. `<FormularioMedicamento>` compartilhado + rotas de novo/editar.
18. `/idosos/[id]/hoje` (readonly reutilizando componente).
19. `/alertas` global.

### Fase E — Polimento e deploy
20. Toasts padronizados (sonner) em todas as mutations.
21. Skeletons decentes em todas as telas com fetch.
22. Ajuste fino de tipografia e espaçamento.
23. Deploy Vercel + Render.
24. Smoke test do roteiro completo.

Cada fase termina com verificação manual antes de partir pra próxima.

---

## 12. Fora de escopo do MVP

Explicitamente **não** entram nesta versão do front:

- Dark mode.
- PWA / notificações push.
- i18n (só `pt-BR`).
- Refresh token / renovação silenciosa.
- Server Components para páginas autenticadas (todas client components por conta do JWT em localStorage).
- Testes automatizados (E2E Playwright, unit Vitest) — candidato a extensão se sobrar tempo.
- Upload de foto do idoso.
- Remoção de vínculo cuidador ↔ idoso.
- Múltiplos cuidadores por idoso (limitação já vinda do backend MVP).

Esses itens estão explicitamente removidos porque não cabem no escopo de trabalho final de disciplina e não são requisitos da defesa.