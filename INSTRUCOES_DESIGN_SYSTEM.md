# DESIGN SYSTEM — MedLembra

> **Revisão pós-review de mockups.** Este documento sobrescreve a **Seção 4 (Design System)** e ajusta partes das **Seções 8 (Contratos por tela)** do `INSTRUCOES_FRONTEND.md`. Todo o restante daquele arquivo (stack, autenticação, camada de dados com SWR, estrutura de pastas, deploy, ordem de implementação) permanece válido.
>
> **Contexto:** mockups de referência foram avaliados. Vamos adotar sua linguagem visual (gradientes contidos, radius generoso, layout split nas telas de auth, timeline vertical na `/hoje`), mas mantendo estritamente o escopo funcional do backend (nenhuma feature nova). Se algo já foi implementado nas fases iniciais divergindo destes tokens, refatorar antes de continuar.

---

## 1. O que muda em relação ao `INSTRUCOES_FRONTEND.md`

| Tema | Antes | Agora |
|---|---|---|
| Nome do produto | MedLembra | **MedLembra** (mantido) |
| Paleta | Stone + Teal amortecido | **Azul royal + Violeta + gradientes** |
| Border-radius | 4px em tudo | **12px (inputs/botões), 16px (cards), 24px (containers hero)** |
| Layout auth | Card centralizado simples | **Split 50/50: painel colorido à esquerda + formulário branco à direita** |
| Layout `/hoje` | Lista vertical de cards | **Timeline vertical + card de progresso + sidebar direita** |
| Nav do cuidador | Sidebar lateral | **Top nav horizontal (consistente com idoso)** |
| Emojis | Sem emojis | **Sem emojis** (mantido — usar `lucide-react`) |

---

## 2. Design tokens

Colocar em `client/app/globals.css` no bloco `:root`. Mapear no `tailwind.config.ts` para uso via classes utilitárias.

### 2.1 Cores

```css
:root {
  /* --- Base / Neutrais --- */
  --color-bg:            #F7F8FA;   /* fundo da aplicação */
  --color-surface:       #FFFFFF;   /* cards, inputs, header */
  --color-surface-alt:   #F9FAFB;   /* input backgrounds sutis */
  --color-border:        #E5E7EB;   /* bordas de card e input */
  --color-border-strong: #D1D5DB;   /* divisórias mais marcadas */

  /* --- Texto --- */
  --color-text:          #111827;   /* texto primário */
  --color-text-muted:    #6B7280;   /* subtítulos, descrições */
  --color-text-label:    #9CA3AF;   /* labels UPPERCASE de formulário */

  /* --- Marca --- */
  --color-primary:       #3B5DE7;   /* azul royal — CTAs, links, foco */
  --color-primary-hover: #2E4BC9;   /* hover de azul */
  --color-accent:        #8B5CF6;   /* violeta — destaques, badges */
  --color-accent-hover:  #7C3AED;

  /* --- Semânticos --- */
  --color-success:       #10B981;   /* verde — TOMADO */
  --color-success-bg:    #D1FAE5;   /* fundo tinted verde */
  --color-warning:       #F59E0B;   /* âmbar — alerta de estoque/validade */
  --color-warning-bg:    #FEF3C7;
  --color-muted-icon:    #9CA3AF;   /* cinza — PULADO, pendente futuro */

  /* --- Gradientes reutilizáveis --- */
  --gradient-primary:      linear-gradient(135deg, #3B5DE7 0%, #8B5CF6 100%);
  --gradient-hero-login:   linear-gradient(135deg, #3B5DE7 0%, #4C6FE7 60%, #6D5EE6 100%);
  --gradient-hero-register:linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%);
  --gradient-alert-card:   linear-gradient(135deg, #8B5CF6 0%, #6D5EE6 100%);
}
```

**Regras de uso:**
- Botões primários usam `--gradient-primary` (não cor sólida).
- Links inline usam `--color-primary` sólido.
- Cor de acento violeta só em: badges de destaque, ring de foco decorativo, card de alerta, header logo.
- Verde `--color-success` só aparece em ícone/texto de "TOMADO". Nunca como cor de botão principal.
- Âmbar `--color-warning` só em cards/badges de alerta do cuidador. Nunca em CTA principal.

### 2.2 Border-radius

```css
:root {
  --radius-sm:   8px;    /* badges, chips, botões pequenos */
  --radius-md:   12px;   /* inputs, botões, cards pequenos */
  --radius-lg:   16px;   /* cards principais */
  --radius-xl:   24px;   /* containers hero (card auth split, alerta destaque) */
  --radius-full: 9999px; /* pills, avatares, botões circulares */
}
```

Aplicar como tokens no `tailwind.config.ts`:

```ts
borderRadius: {
  sm: 'var(--radius-sm)',
  md: 'var(--radius-md)',
  lg: 'var(--radius-lg)',
  xl: 'var(--radius-xl)',
  full: 'var(--radius-full)',
},
```

E no shadcn, ajustar `--radius` em `globals.css` para `12px` (será o default de `rounded` do shadcn).

### 2.3 Tipografia

Fonte única: **Inter** via `next/font/google`, com pesos 400, 500, 600, 700.

```css
:root {
  --font-sans: 'Inter', system-ui, sans-serif;
}
```

Escala:

| Token | Tamanho | Peso | Uso |
|---|---|---|---|
| `text-display` | 36px / 44px | 700 | "Olá, João!" na home do idoso |
| `text-h1` | 28px / 36px | 700 | Título de card hero ("Bem-vindo de volta") |
| `text-h2` | 22px / 30px | 600 | Títulos de seção ("Agenda de Hoje", "Meus idosos") |
| `text-h3` | 18px / 26px | 600 | Nome de medicamento no card |
| `text-body-lg` | 18px / 28px | 400 | Corpo do idoso |
| `text-body` | 15px / 22px | 400 | Corpo do cuidador |
| `text-sm` | 14px / 20px | 400 | Metadata, descrições |
| `text-label` | 11px / 16px | 600 | **UPPERCASE + `tracking: 0.08em`**, labels de form e datas ("QUINTA-FEIRA, 2 DE JULHO") |

Idoso continua com escala uma-linha-maior. Cuidador usa escala normal.

### 2.4 Espaçamento

Base Tailwind (4px grid). Densidades preferidas:

| Contexto | Padding | Gap |
|---|---|---|
| Card idoso | `p-6` (24px) | `gap-4` |
| Card cuidador | `p-5` (20px) | `gap-3` |
| Container hero (auth split) | `p-10` (40px) | — |
| Input | `px-4 py-3` (16/12px) | — |
| Botão | `px-6 py-3.5` (24/14px) | — |

### 2.5 Sombras

```css
:root {
  --shadow-card:     0 1px 3px rgba(17, 24, 39, 0.06), 0 1px 2px rgba(17, 24, 39, 0.04);
  --shadow-elevated: 0 8px 24px rgba(17, 24, 39, 0.08), 0 2px 6px rgba(17, 24, 39, 0.04);
}
```

- `--shadow-card`: default de todo card branco sobre fundo `--color-bg`.
- `--shadow-elevated`: card hero da auth, modais, popovers.
- Zero `shadow-2xl`, zero glow. Nada além dessas duas sombras.

### 2.6 Ícones

Mantida a regra: **exclusivamente `lucide-react`**, zero emojis em qualquer lugar da UI (nem em toast, nem em empty state, nem em header).

Tamanhos:
- Idoso: 24px (`className="size-6"`).
- Cuidador: 18px em cards, 16px em tabelas.
- Ícone em quadradinho "avatar de conceito" (ver 3.4): 22px dentro de container 44px.

Mapeamento canônico (um conceito = um ícone):

| Conceito | Ícone |
|---|---|
| TOMADO | `CheckCircle2` (preenchido em `--color-success`) |
| AGORA / pendente do horário atual | `Clock` (em `--color-primary`) |
| PENDENTE / futuro | `Hourglass` (em `--color-muted-icon`) |
| PULADO | `MinusCircle` (em `--color-muted-icon`) |
| Progresso | `TrendingUp` |
| Alerta de estoque | `PackageOpen` |
| Alerta de validade | `CalendarClock` |
| Medicamento (genérico) | `Pill` |
| Idoso | `User` |
| Cuidador | `HeartPulse` (usa o mesmo peso visual do ícone de "identidade" do register mockup) |
| Vincular | `Link2` |
| Adicionar | `Plus` |
| Editar | `Pencil` |
| Excluir | `Trash2` |
| Voltar | `ChevronLeft` |
| Sair | `LogOut` |
| Login (identidade auth) | `Lock` |
| Cadastro (identidade auth) | `UserPlus` |
| Segurança (destaque no hero login) | `ShieldCheck` |

---

## 3. Componentes visuais chave

Especificação de padrões visuais reutilizáveis. Cada um deve virar componente em `src/components/ui/` ou `src/components/*/`.

### 3.1 Botão primário (`<Button variant="primary">`)

- Background: `--gradient-primary`.
- Texto: branco, `font-semibold`, `text-sm` cuidador / `text-body-lg font-semibold` idoso.
- Radius: `--radius-md`.
- Padding: `px-6 py-3.5` (cuidador), `px-8 py-4` (idoso — altura mínima 56px).
- Hover: filtro `brightness(0.95)` — sem mudar cor.
- Disabled: opacidade 0.5, cursor `not-allowed`, sem hover.
- Foco: `outline: 2px solid var(--color-primary); outline-offset: 2px`.

### 3.2 Botão secundário (`<Button variant="secondary">`)

- Background: `--color-surface`.
- Borda: `1px solid var(--color-border)`.
- Texto: `--color-text`, `font-medium`.
- Ícone opcional à esquerda.
- Usado para "Escanear" (SE existir uma ação secundária real), "Voltar", "Cancelar".

### 3.3 Input

- Background: `--color-surface-alt` (`#F9FAFB`, quase branco).
- Borda: `1px solid var(--color-border)`.
- Radius: `--radius-md` (12px).
- Padding: `pl-12 pr-4 py-3` quando com ícone à esquerda.
- Ícone à esquerda: `lucide` cinza claro (`--color-text-label`), 18px, absolute.
- Label acima: `text-label` (uppercase 11px).
- Foco: borda em `--color-primary`, sombra sutil `0 0 0 3px rgba(59,93,231,0.12)`.

### 3.4 Card padrão

- Background: `--color-surface`.
- Radius: `--radius-lg` (16px).
- Borda: `1px solid var(--color-border)`.
- Sombra: `--shadow-card`.
- Sem hover state por padrão (só em cards clicáveis, e nesses aumenta a sombra para `--shadow-elevated`).

### 3.5 Card hero split (auth)

Container único de largura máxima **`960px`**, altura mínima **`560px`**, radius `--radius-xl` (24px), sombra `--shadow-elevated`, dividido em duas colunas 50/50 no desktop, empilhado no mobile.

**Painel esquerdo (colorido):**
- Background: `--gradient-hero-login` (na tela `/login`) ou `--gradient-hero-register` (na tela `/registrar`).
- Padding: `p-10`.
- Layout vertical: logo topo → ícone quadrado tinted (44x44, radius `--radius-md`) → título display em branco → subtítulo em branco 80% opacity → *espaço flexível* → footer sutil branco 60% opacity.
- Texto todo branco.

**Painel direito (branco):**
- Background: `--color-surface`.
- Padding: `p-10`.
- Ícone circular colorido no topo (44x44, `--color-primary` como bg, ícone branco).
- Título `text-h1` em `--color-text`.
- Subtítulo `text-body` em `--color-text-muted`.
- Formulário (react-hook-form + zod).
- Botão CTA primário full-width.
- Link secundário centralizado no rodapé ("Não possui uma conta? Criar conta") — texto muted, com o CTA em `--color-primary` bold.

### 3.6 Card de progresso circular

Reutilizável no `/hoje` do idoso e nos dashboards do cuidador.

- Container: card padrão.
- Layout horizontal: ring circular à esquerda + texto à direita.
- Ring: SVG 80x80px, stroke-width 8, cor do fill em `--color-primary`, track em `--color-border`. Centro exibe a fração ("2/3").
- Texto direito: título `text-h3` ("Progresso Diário") + descrição `text-sm` em `--color-text-muted` ("Você já tomou 2 de 3 medicamentos agendados para hoje.").

### 3.7 Timeline vertical (agenda do dia)

**Este é o componente central da tela `/hoje`.**

Estrutura:
```
┌───────┬──────────────────────────────┐
│  ○    │  card do medicamento          │
│  │    │                               │
│  ●    │  card do medicamento (agora)  │
│  │    │                               │
│  ○    │  card do medicamento          │
└───────┴──────────────────────────────┘
```

- **Trilho vertical** (coluna esquerda, 48px de largura): linha vertical em `--color-border`, com bolinhas de status posicionadas nos horários.
- **Bolinha de status** (32x32px, radius `--radius-full`):
  - TOMADO: bg `--color-success-bg`, ícone `CheckCircle2` em `--color-success`.
  - AGORA (horário atual, ainda pendente): bg branco com borda 2px em `--color-primary`, ícone `Clock` em `--color-primary`.
  - PENDENTE (futuro): bg `--color-bg`, ícone `Hourglass` em `--color-muted-icon`.
  - PULADO: bg `--color-bg`, ícone `MinusCircle` em `--color-muted-icon`.
- **Card do medicamento** (à direita da bolinha, ocupa restante):
  - Radius `--radius-lg`, sombra `--shadow-card`.
  - Topo esquerdo: horário grande (`text-h3`, `--color-text`).
  - Topo direito: badge de status (uppercase, cor conforme status).
  - Corpo: nome do medicamento (`text-h3` bold) + dosagem (`text-sm muted`).
  - **Se AGORA**: adiciona borda de 2px `--color-primary`, badge "AGORA" em `--color-primary`, e botão CTA "Confirmar que Tomei" (largura total, `--gradient-primary`, altura 56px). Link discreto abaixo "Pulei essa dose" que abre confirmação.
  - Se TOMADO: badge "Tomado às HH:mm" em `--color-success`, sem botão.
  - Se PULADO: badge "Pulado" em `--color-muted-icon`, sem botão.
  - Se PENDENTE futuro: badge "Aguardando" em `--color-muted-icon`, sem botão.

### 3.8 Card de alerta destaque (sidebar do idoso)

- Container: radius `--radius-xl`, background `--gradient-alert-card`, texto branco, padding `p-6`.
- Topo: ícone tinted 40x40 + título `text-h3` branco ("Alerta").
- Corpo: descrição em branco 90% opacity. Ex: "O estoque de **Losartana** acabará em **5 dias**."
- CTA branco sólido no rodapé: "Ver estoque completo" com texto em `--color-accent`. Radius `--radius-md`.
- Só renderiza quando `useAlertas()` (ou o equivalente do idoso) retorna pelo menos um alerta ativo. **Sem alertas → card não aparece** (não renderizar placeholder).

### 3.9 Card de vínculo (sidebar do idoso)

- Card padrão.
- Título `text-label` em muted: "MEU CUIDADOR".
- Body: avatar circular (iniciais) + nome + email pequeno.
- Sem CTA (o vínculo é gerenciado em `/perfil`).
- Se o idoso ainda não tem cuidador vinculado: mostra estado vazio com texto "Nenhum cuidador vinculado" + link "Vincular agora" que navega para `/perfil`.

### 3.10 Header topo (navegação global)

- Altura 72px, background `--color-surface`, borda inferior `--color-border`.
- Container horizontal, padding lateral `px-8`.
- Esquerda: logo (ícone quadrado com `--gradient-primary` + texto "MedLembra" em `text-h3` bold).
- Centro: links de navegação (`text-body`, `font-medium`). Link ativo em `--color-primary` com underline de 2px `--color-primary`. Links inativos em `--color-text-muted`.
- Direita: card compacto do usuário (avatar circular com iniciais + nome + tipo em `text-label` muted).

Nav por tipo:
- Idoso: `Hoje` (default) | `Perfil`
- Cuidador: `Idosos` (default) | `Alertas` | `Perfil`

---

## 4. Revisões de contratos de tela

Ajustes em relação à Seção 8 do `INSTRUCOES_FRONTEND.md`. Não listadas = permanecem como estavam.

### 4.1 `/login` — REVISADA

Substituir layout anterior pelo **card hero split** (3.5).

- **Painel esquerdo (azul):**
  - Logo topo esquerda.
  - Ícone `ShieldCheck` em container tinted.
  - Título: **"Segurança e Conexão em tempo real."**
  - Subtítulo: **"Acesse o painel para monitorar as rotinas medicamentosas de seus familiares."** (nota: usar exatamente essa frase, sem "criptografia ponta a ponta" — nossa segurança é bcrypt + HTTPS, não E2EE).
  - Footer sutil: **"Feito para cuidar de quem cuida."**
- **Painel direito:** ícone circular `Lock`, título "Bem-vindo de volta", subtítulo "Insira suas credenciais para acessar a plataforma.", form (email + senha), botão "Entrar", link "Não possui uma conta? Criar conta".
- **Removido:** checkbox "Lembrar-me" e link "Esqueci minha senha" (backend não implementa nem reset de senha nem refresh token).

### 4.2 `/registrar` — REVISADA

Mesmo layout split, painel esquerdo violeta.

- **Painel esquerdo (violeta):**
  - Ícone `HeartPulse`.
  - Título: **"Cadastre-se para começar."**
  - Subtítulo: **"Conecte idosos e cuidadores num só lugar. Cadastros diários simples e alertas para quem cuida."** (evitar termos como "inteligência preditiva" — não existe IA aqui).
  - Footer sutil: **"MedLembra — feito para cuidar de quem cuida."**
- **Painel direito:** ícone `UserPlus`, título "Criar Conta", subtítulo "Cadastre-se para começar a gerenciar seus medicamentos.", form:
  - Nome completo
  - E-mail
  - Senha + Confirmar Senha (lado a lado no desktop, empilhado no mobile)
  - **Radio group obrigatório: "Sou um..."** com opções `Idoso / Paciente` e `Cuidador / Familiar` — dois cards clicáveis, cada um com ícone (`User` e `HeartPulse`), label e descrição curta. **Este campo é essencial — o backend exige `tipo` no register.**
- **Removido:** checkbox de "Termos de Uso e Políticas" (não temos página de termos), e link "Fazer login" fica como link no rodapé "Já possui uma conta? Fazer login".

### 4.3 `/hoje` (idoso) — REVISADA

Layout 2 colunas: main (2/3) + sidebar (1/3). Empilha no mobile.

- **Header topo** (componente 3.10).
- **Main:**
  - Data uppercase (`text-label` muted): "QUINTA-FEIRA, 2 DE JULHO DE 2026".
  - Título display: **"Olá, {primeiroNome}!"** (sem emoji — apenas o texto).
  - Subtítulo `text-body-lg muted`: "Aqui está seu planejamento de hoje."
  - Card de progresso (3.6) com fração `X/Y` (tomados / total do dia).
  - Título `text-h2`: "Agenda de Hoje".
  - Timeline vertical (3.7).
- **Sidebar direita** (ordem):
  1. Card de alerta destaque (3.8) — só se houver alertas.
  2. Card "Meu Cuidador" (3.9).
- **Removido do mockup original:** botão "Escanear Receita AI" (não existe OCR), card "Minhas Bulas" (não existe bulário), card "Estatísticas" (não existe), lista "Rede de Cuidado" com médicos (não existe entidade profissional de saúde), sino de notificações no header (não existe endpoint de notificações).

### 4.4 `/idosos` (cuidador) — REVISADA MINIMAMENTE

- Header topo horizontal (3.10) em vez de sidebar lateral.
- Data + saudação: "Olá, {primeiroNome}." (sem exclamação, tom mais neutro pro cuidador).
- Grid de cards de idosos vinculados (2 colunas desktop, 1 mobile). Cada card:
  - Avatar circular com iniciais.
  - Nome (`text-h3`).
  - Email pequeno muted.
  - Badge à direita: `X alertas` se houver, `Tudo em ordem` (verde) se não. Cor: `--color-warning` se >0, `--color-success` se =0.
  - Radius `--radius-lg`, hover eleva sombra.
- Botão "Vincular novo idoso" em `<Button variant="primary">` no topo direito.

### 4.5 `/idosos/[id]` (cuidador — dashboard) — REVISADA

Mesmo header. Substruturas visuais:

- Título com nome do idoso (`text-h1`) + `text-body muted` "Painel de acompanhamento".
- Tabs de sub-rota (visual apenas — cada tab é `<Link>` para uma URL diferente): `Dashboard | Hoje | Medicamentos`. Tab ativa com underline `--color-primary`.
- **Dashboard tab (padrão):**
  - Grid de 3 cards de resumo em linha:
    1. Progresso circular reutilizando 3.6 — "Adesão 7 dias" (%).
    2. Card simples: total de medicamentos ativos.
    3. Card simples: alertas ativos.
  - Card com gráfico Recharts (barra) — "Adesão dos últimos 7 dias", cor única `--color-primary`, sem legendas coloridas exuberantes.
  - Lista vertical de alertas ativos (cada um usando o padrão de item de lista, não o card destaque violeta — reservar aquele estilo pra sidebar do idoso).

### 4.6 `/idosos/[id]/hoje` (cuidador — readonly) — REVISADA

Reutiliza componente da timeline (3.7) com prop `readonly`. Sem botões de CTA, sem link "Pulei essa dose". Se um horário está PENDENTE e o `agora` já passou, badge muda de "Aguardando" para "Atrasado" (texto em `--color-warning`).

### 4.7 `/idosos/[id]/medicamentos` — SEM MUDANÇAS

Tabela padrão de shadcn com radius `--radius-lg` no container. Header row com background `--color-surface-alt`. Ações em ícones (`Pencil`, `Trash2`).

### 4.8 `/perfil` (idoso e cuidador) — SEM MUDANÇAS SIGNIFICATIVAS

Card padrão com dados, botão "Sair" destrutivo mas discreto (`<Button variant="secondary">` com texto `--color-warning`).

---

## 5. Features do mockup NÃO adotadas

Documentado pra ficar claro pro futuro e pra defesa do trabalho.

| Feature no mockup | Motivo |
|---|---|
| "Escanear Receita AI" | OCR não faz parte do escopo (cortado do projeto original). |
| Nome "MediSmart AI" | Nome do produto é MedLembra. |
| "Alerta Inteligente" (com carinha de IA) | Alertas são cálculo aritmético simples (`estoque / freq <= 7 dias`). Sem IA. |
| Dr. Carlos Mendes na Rede de Cuidado | Backend não modela profissional de saúde. |
| "Minhas Bulas" | Backend não tem entidade bula/documento. |
| Tab "Relatórios" separada | Não implementado. Métricas cabem no dashboard. |
| Tab "Estatísticas" separada | Idem — cabe no dashboard do cuidador. |
| Tab "Dependentes" | Do lado idoso, backend só suporta 1 cuidador vinculado. |
| Sino de notificações | Sem endpoint de notificações; alertas aparecem na sidebar. |
| Login: "criptografia ponta a ponta" | Não temos E2EE. Só HTTPS + bcrypt. Prometer isso é enganoso. |
| "Sr./Sra." e tag "Paciente" | Backend não guarda pronome de tratamento. Tipo é IDOSO/CUIDADOR. |
| Checkbox "Lembrar-me" e "Esqueci minha senha" | Sem refresh token, sem fluxo de reset. Token de 7 dias já resolve o "lembrar-me" naturalmente. |
| Checkbox "Aceito Termos de Uso" | Não temos página de termos. |

**Regra geral aplicável ao Claude Code:** ao encontrar padrão visual no mockup que sugira feature, verificar em `INSTRUCOES_API.md` se o endpoint existe. Se não existir, não implementar mesmo que o mockup mostre.

---

## 6. Ordem de ajuste (dado que Fase A já começou)

Se o Claude Code já implementou parte do frontend com os tokens antigos (`--radius=4px`, paleta stone+teal), aplicar na seguinte ordem sem quebrar o que está funcionando:

1. **Substituir tokens em `globals.css`** — cores, radius, tipografia. Isto sozinho já muda visualmente 60% do que estiver pronto.
2. **Adicionar `--font-sans: Inter`** e importar via `next/font/google`.
3. **Atualizar `tailwind.config.ts`** mapeando todos os novos tokens.
4. **Refatorar `<Button>`, `<Input>`, `<Card>`** para os specs de 3.1, 3.3 e 3.4.
5. **Reescrever `/login` e `/registrar`** para o layout split (3.5) — priorizar isto porque são as primeiras telas que qualquer avaliador vê.
6. **Construir componentes novos** exigidos pelo `/hoje`: `<ProgressoDiario>` (3.6), `<Timeline>` (3.7), `<CardAlertaDestaque>` (3.8), `<CardVinculo>` (3.9), `<HeaderTopo>` (3.10).
7. **Ajustar `/hoje`** para o novo layout 2 colunas.
8. **Ajustar `/idosos` e `/idosos/[id]`** substituindo sidebar por top nav e adicionando o padrão de card do idoso.

Se algum arquivo já existir divergindo destes tokens, refazer o arquivo — não vale ficar remendando por cima.

---

## 7. Restrições absolutas

Estas regras não têm exceção. Se o Claude Code encontrar caso não previsto, deve pedir aprovação antes de decidir.

1. **Nenhum emoji na UI.** Nem em toast, nem em placeholder, nem em texto de card. Substituir por ícone `lucide-react`.
2. **Nenhuma feature além do escopo do backend** (`INSTRUCOES_API.md`). Se algo do mockup sugere uma feature, verificar o contrato de API antes de implementar.
3. **Nenhuma dependência nova** além das listadas em `INSTRUCOES_FRONTEND.md` Seção 2 sem discussão prévia.
4. **Todo estado remoto (GET) usa SWR.** Nada de `useEffect + fetch`.
5. **Nenhuma cor fora da paleta declarada em 2.1.** Se precisar de tom novo, deve ser derivado (opacidade ou mistura) de um dos existentes.
6. **Radius sempre via token.** Nunca `border-radius: 8px` inline; sempre `rounded-md`, `rounded-lg`, etc.
7. **Sombras só as duas declaradas em 2.5.** Nada de `shadow-lg` do Tailwind default.
8. **Textos em `pt-BR` naturais.** Sem tradução robótica ("polifarmácia gerenciada com sucesso" — não).