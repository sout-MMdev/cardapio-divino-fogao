# Cardápio Digital Divino Fogão · Parte 1: cardápio do cliente

- **Data:** 2026-09-26
- **Status:** aguardando revisão
- **Autor:** Maxx (sout-MMdev), com Claude Code
- **Escopo deste documento:** parte 1 (cardápio que o cliente abre pelo QR code). O painel do dono (parte 2) terá especificação própria.

---

## 1. Objetivo

Criar o cardápio digital do **Divino Fogão, unidade São Leopoldo** (Bourbon Shopping, R. Primeiro de Março, 821, Centro). O cliente abre o cardápio **escaneando um QR code na mesa**, sem instalar nada. O cardápio é **só para consulta**: não tem pedido nem pagamento.

O cardápio será **usado de verdade pela unidade**. Por isso a arquitetura já nasce pronta para receber, na parte 2, um painel onde o dono edita pratos, preços, fotos e itens esgotados.

**Problema real que ele resolve:** hoje o cardápio impresso tem um QR code de "cardápio online", e uma avaliação no Google de um ano atrás diz que "nenhum QR code do cardápio funciona".

### 1.1 O que foi definido e o que foi suposto

| Definido pelo usuário | Suposto (validado no brainstorming) |
|---|---|
| Acesso por QR code na mesa | Só português e sem modo escuro na v1 |
| Sem pagamento e sem pedido | O cliente nunca faz login |
| Uso real por esta unidade (painel do dono na parte 2) | Hospedagem de custo baixo ou zero, decidida no lançamento |
| Stack: Next.js como PWA | Os dados iniciais vêm do cardápio impresso (fotos do Google Maps) |
| Direção visual **A · Fazenda Contemporânea** | As fotos definitivas serão enviadas pelo restaurante |
| Desenvolvimento acompanhado ao vivo no **Mobile Viewer** do VS Code | |
| **Não subir nada para nenhum Supabase**: deixar tudo pronto | |
| Commits pessoais (sout-MMdev), sem vínculo com a empresa | |

### 1.2 Critérios de sucesso

1. `npm run dev` + Mobile Viewer (`localhost:3000`, preset iPhone 12 Pro) mostram o **cardápio real completo** (cerca de 60 itens, apêndice A) no tema A.
2. As 11 funcionalidades da seção 3 funcionam no celular.
3. Toda a bateria de testes da seção 9 passa: unidade, componentes, ponta a ponta e acessibilidade.
4. No Lighthouse mobile, rodando `npm run build && npm start`: **Desempenho ≥ 90**, **Acessibilidade = 100**, app instalável (PWA).
5. O modo `MENU_SOURCE=supabase` **compila e passa nos testes de contrato com dados de exemplo**, mas **nunca é executado contra um Supabase remoto**.
6. Nada é publicado: nem deploy, nem migration aplicada, nem carga de dados no Supabase.

---

## 2. Stack

| Camada | Escolha | Versão (instalada pelo create-next-app 16.3.6 ou a mais recente, 2026-09) |
|---|---|---|
| Framework | Next.js (App Router, Turbopack) + React | 16.3 / 19.2 |
| Linguagem | TypeScript, modo `strict` | 5.x (a do template) |
| Estilo | Tailwind CSS, com tokens em CSS | 4.3 |
| Validação | Zod | 4.6 |
| Banco (preparado, sem uso na v1) | Supabase: Postgres + Storage + `@supabase/supabase-js` | 2.117 |
| PWA | Serwist (`@serwist/turbopack`, compatível com o Turbopack do Next 16) | 9.5 |
| Testes | Vitest + Testing Library, Playwright + `@axe-core/playwright` | 5.0 / 1.63 |
| Qualidade | ESLint (flat config, `eslint-config-next`) + Prettier | 9.x (a do template) |
| Gerenciador de pacotes | npm (já vem com o Node 24; o pnpm não está instalado na máquina) | 11 |

Não entram: biblioteca de animação (usamos CSS), gerenciador de estado global (o estado é local ou fica no endereço da página) e ORM (o acesso passa por um único repositório).

---

## 3. Escopo da v1

| # | Funcionalidade |
|---|---|
| 1 | Topo do restaurante: nome, se está **aberto ou fechado agora**, horário e tempo de preparo |
| 2 | Carrossel de **promoções** (as 4 do cardápio impresso) |
| 3 | **Abas de categoria fixas no topo**, que acompanham a rolagem; tocar numa aba rola até a seção |
| 4 | Linhas de prato: nome, descrição, preço e foto quando houver |
| 5 | **Variações** (pequena/grande, 1 ou 3 unidades) e **adicionais** (+ alcatra, à milanesa) |
| 6 | **Detalhe do prato** num painel que sobe da parte de baixo da tela, com endereço próprio (`/?prato=<slug>`) |
| 7 | **Busca** por nome, ignorando acentos e maiúsculas |
| 8 | **Selos:** "serve até N pessoas", "vegetariano", "mais pedido" |
| 9 | **Item esgotado:** acinzentado, com o selo "Esgotado hoje" |
| 10 | **Informações:** endereço + botão para o mapa, horários com o dia de hoje destacado, formas de pagamento (e o aviso "não aceitamos Banrisul"), tempo de preparo e salada inclusa |
| 11 | **PWA:** instalável e com o último cardápio disponível offline |

**Fica para depois:** outros idiomas, alergênicos, botão "chamar garçom", QR code por mesa, estatísticas, feriados e horários especiais, histórico de preços, nota do Google.

**Parte 2 (outra especificação):** login do dono, cadastro e edição de categorias, pratos, variações, adicionais e promoções, envio de fotos, marcação de esgotado, reordenação e revalidação imediata do cardápio publicado.

---

## 4. Arquitetura

### 4.1 Estrutura de pastas

```
app_bar/
├─ src/
│  ├─ app/                        # rotas: camada fina, só monta features
│  │  ├─ layout.tsx               # fontes, tokens, metadados, lang="pt-BR"
│  │  ├─ page.tsx                 # o cardápio ("/"), gerado de forma estática
│  │  ├─ error.tsx, not-found.tsx
│  │  ├─ manifest.ts              # manifest do PWA
│  │  ├─ sw.ts                    # service worker (Serwist)
│  │  ├─ serwist/[path]/route.ts  # entrega o /serwist/sw.js (Serwist Turbopack)
│  │  └─ ~offline/page.tsx        # página de reserva quando não há rede nem cache
│  ├─ features/
│  │  ├─ menu/                    # CategoryNav, CategorySection, DishRow, CompactRow,
│  │  │  │                        # DishSheet, MenuSearch
│  │  │  └─ index.ts              # API pública da feature
│  │  ├─ restaurant/              # RestaurantHeader, OpenStatus, InfoSheet
│  │  └─ promotions/              # PromoCarousel
│  ├─ domain/                     # tipos e regras puras, sem React e sem I/O
│  │  ├─ menu.ts                  # Menu, Category, Dish, Variant, Addon, Promotion, Tag
│  │  ├─ money.ts                 # Cents, formatBRL()
│  │  ├─ opening-hours.ts         # isOpenNow(), nextOpening(), todayRanges()
│  │  └─ search.ts                # normalize(), searchDishes()
│  ├─ data/
│  │  ├─ menu-repository.ts       # interface MenuRepository
│  │  ├─ get-menu-repository.ts   # escolhe a implementação por MENU_SOURCE
│  │  ├─ seed/                    # SeedMenuRepository + menu.ts (fonte única dos dados)
│  │  └─ supabase/                # SupabaseMenuRepository + schemas Zod + mapeamento
│  ├─ ui/                         # peças visuais do tema A: Sheet, Chip, Badge, PriceTag,
│  │                              # DottedPriceRow, DishPhoto, IconButton
│  ├─ lib/env.ts                  # variáveis de ambiente validadas com Zod
│  └─ styles/tokens.css           # tokens do tema A (seção 7)
├─ supabase/
│  ├─ migrations/<timestamp>_menu_schema.sql   # escrito, nunca aplicado
│  └─ seed.sql                    # gerado a partir de src/data/seed/menu.ts
├─ scripts/generate-seed-sql.ts   # menu.ts → supabase/seed.sql
├─ public/
│  ├─ icons/                      # ícones do PWA (monograma "DF")
│  └─ menu-photos/                # fotos de desenvolvimento, IGNORADAS pelo git
├─ tests/e2e/                     # Playwright
└─ .github/workflows/ci.yml       # pronto; só roda quando existir um repositório remoto
```

### 4.2 Regras de dependência

Essas regras são garantidas pelo ESLint com `no-restricted-imports` ou `eslint-plugin-boundaries`:

1. `app` → `features` → `domain`. `ui` pode ser usado por `features` e `app`.
2. `domain` não importa React, Next, Supabase nem nada de `data`, `features` ou `ui`.
3. `features` acessa os dados **somente** pela interface `MenuRepository`, nunca por `data/supabase` ou `data/seed` diretamente.
4. Uma feature importa outra **somente pelo `index.ts`** dela.

### 4.3 Renderização e dados

- `page.tsx` é um Server Component. Ele chama `getMenuRepository().getMenu()` e entrega o `Menu` já validado às features.
- **Modo `seed` (padrão da v1):** a página é gerada de forma totalmente estática no build.
- **Modo `supabase` (preparado):** a página usa `export const revalidate = 3600`, ou seja, é gerada de novo a cada hora no máximo. Na parte 2, salvar no painel chama `revalidatePath('/')` e a página se atualiza na hora. O `cacheComponents` não é ligado na v1.
- **O "aberto ou fechado agora" é calculado no cliente.** Enquanto isso não acontece, aparece um espaço reservado neutro, para não haver diferença entre o que veio do servidor e o que o navegador renderiza. O cálculo usa `restaurant.timezone` (`America/Sao_Paulo`), nunca o fuso do aparelho.
- **Painéis com endereço próprio:** `?prato=<slug>` abre o detalhe e `?info` abre as informações. **O parâmetro é lido no cliente** (`useSearchParams` dentro de `Suspense`), para a página continuar estática. Abrir um painel acrescenta uma entrada ao histórico, então o "voltar" do celular o fecha. Um slug que não existe é ignorado.
- A busca acontece no cliente, sobre os itens já carregados, e seu estado é local. Ela se fecha pelo ✕ ou pela tecla Esc.

### 4.4 Contrato do repositório

```ts
export interface MenuRepository {
  getMenu(): Promise<Menu>; // restaurante, horários, categorias→pratos→variações/adicionais, promoções
}
```

Um único método, porque a tela do cliente precisa de tudo de uma vez. A parte 2 vai acrescentar os métodos de escrita num repositório do painel, separado deste.

`getMenuRepository()` lê `MENU_SOURCE` de `lib/env.ts`, que aceita `seed` ou `supabase` e usa **`seed` como padrão**:
- **`seed`:** devolve os dados de `data/seed/menu.ts`.
- **`supabase`:** exige `SUPABASE_URL` e `SUPABASE_ANON_KEY`, faz **uma única consulta** com os relacionamentos embutidos, valida o resultado com Zod e converte para os tipos do `domain`.

---

## 5. Modelo de domínio (TypeScript)

```ts
type Cents = number & { readonly __brand: 'Cents' };   // 8990 = R$ 89,90
type Tag = 'vegetariano' | 'mais_pedido';
type DisplayStyle = 'rows' | 'compact';

interface Variant   { label: string; price: Cents }
interface Addon     { label: string; price: Cents }            // preço que se soma
interface Photo     { src: string; alt: string }

interface Dish {
  slug: string; name: string; description?: string;
  basePrice: Cents | null;                                     // null ⇒ o preço vem das variações
  variants: Variant[]; addons: Addon[];
  photo?: Photo; serves?: number; tags: Tag[];
  isAvailable: boolean; isFeatured: boolean;
}
interface Category  { slug: string; name: string; displayStyle: DisplayStyle; dishes: Dish[] }
interface Promotion { slug: string; title: string; description?: string; highlight?: string;
                      photo?: Photo; dishSlug?: string }
interface OpeningRange { weekday: 0|1|2|3|4|5|6; opensAt: string; closesAt: string } // "HH:MM"
interface Restaurant {
  name: string; tagline: string; address: string; mapsUrl: string; timezone: string;
  prepTimeMinutes: number; paymentMethods: string[]; paymentNotes: string[]; notes: string[];
}
interface Menu {
  restaurant: Restaurant; openingHours: OpeningRange[];
  categories: Category[]; promotions: Promotion[];
}
```

**Regras garantidas pela validação Zod e pelos testes dos dados iniciais:**
- Todo prato tem `basePrice` ou pelo menos uma variação.
- Os slugs são únicos dentro de cada tipo de entidade.
- Todo preço é maior que zero.
- `closesAt` pode ser menor que `opensAt`, e nesse caso a faixa passa da meia-noite.
- `dishSlug` de uma promoção, quando existir, aponta para um prato que existe.

Só ficam no `Menu` itens com `is_visible = true` e promoções com `is_active = true`. **Esse filtro acontece no repositório**, nunca na tela.

A seção "Destaques", no topo, **é montada a partir dos pratos com `isFeatured`**. Ela não é uma categoria no banco.

---

## 6. Banco de dados (Supabase, preparado e não aplicado)

Convenções: nomes em inglês e `snake_case`; chave primária `bigint generated always as identity`; datas em `timestamptz`; dinheiro em `numeric(10,2)`, convertido para `Cents` na entrada do código; índice em toda chave estrangeira.

```
restaurant (1 linha, garantida por: id boolean primary key default true check (id))
  name, tagline, address, maps_url, timezone default 'America/Sao_Paulo',
  prep_time_minutes smallint, payment_methods text[], payment_notes text[], notes text[], updated_at

opening_hours
  id, weekday smallint check (weekday between 0 and 6), opens_at time, closes_at time

categories
  id, slug text unique, name, display_style text check (display_style in ('rows','compact')),
  position int, is_visible boolean default true, created_at, updated_at

dishes
  id, category_id → categories (index), slug text unique, name, description,
  base_price numeric(10,2) check (base_price > 0), photo_path text,
  serves smallint check (serves > 0),
  tags text[] default '{}' check (tags <@ array['vegetariano','mais_pedido']),
  is_available boolean default true, is_featured boolean default false,
  is_visible boolean default true, position int, created_at, updated_at

dish_variants  id, dish_id → dishes on delete cascade (index), label, price numeric(10,2) check (> 0), position
dish_addons    id, dish_id → dishes on delete cascade (index), label, price numeric(10,2) check (> 0), position

promotions
  id, slug text unique, title, description, highlight, photo_path,
  dish_id → dishes on delete set null (index), is_active boolean default true, position
```

- **`updated_at`** é atualizado por trigger, com a extensão `moddatetime`.
- **RLS ligada em todas as tabelas.** Políticas de `select` para `anon, authenticated`, restritas a `is_visible` ou `is_active` onde a coluna existir. **Não há política de escrita na parte 1.**
- **Storage:** o bucket `menu-photos` fica declarado na migration, com leitura pública e sem política de escrita. As escritas chegam na parte 2.
- **`supabase/seed.sql`** é **gerado** a partir de `src/data/seed/menu.ts` por `scripts/generate-seed-sql.ts`. Um teste confere se o arquivo está em dia com `menu.ts`.
- ⛔ **Proibido nesta parte:** `supabase link`, `supabase db push`, aplicar SQL remotamente, criar o projeto ou carregar dados. Tudo fica só em arquivos.

---

## 7. Design: tema A · Fazenda Contemporânea

### 7.1 Tokens (`styles/tokens.css`, expostos ao Tailwind via `@theme`)

| Token | Valor | Uso |
|---|---|---|
| `--color-bg` | `#F4EEE4` | fundo creme |
| `--color-surface` | `#FBF7F1` | painéis |
| `--color-surface-muted` | `#EFE6D8` | chips e botões de ícone |
| `--color-line` | `#E3D8CA` | divisórias |
| `--color-ink` | `#2B1B17` | texto principal |
| `--color-ink-muted` | `#6F5F55` | texto secundário (contraste AA sobre o creme) |
| `--color-brand` | `#6B1D22` | bordô: marca, preços, aba ativa, botões |
| `--color-accent` | `#855A2E` | ouro queimado: rótulos em maiúsculas (contraste AA) |
| `--color-success` | `#2F6B45` | "aberto agora" |
| `--radius-card` / `--radius-sheet` | `16px` / `26px` | |

- **Fontes:** **Fraunces** (títulos e nomes de prato; itálico nos destaques) e **Manrope** (textos), carregadas com `next/font/google`, que as serve pelo próprio app sem pulo de layout.
- **Marca:** o nome "Divino Fogão" é escrito em Fraunces bordô. A v1 não usa a imagem do logo.
- **Mockups aprovados:** `.superpowers/brainstorm/…/content/visual-style.html` (opção A) e `telas-v1.html`. São arquivos locais e não vão para o git.

### 7.2 Componentes e telas

- **Cardápio (tela 1):**
  - Topo completo, que ao rolar se condensa numa barra com o nome, 🔍 e ⓘ.
  - `CategoryNav` gruda no topo; o indicador da aba ativa acompanha a rolagem.
  - Cada seção tem título em Fraunces e a contagem de itens.
  - `DishRow` (categorias `rows`): texto à esquerda e foto quadrada de 70 px à direita, quando houver.
  - `CompactRow` (categorias `compact`): nome, pontilhado e preço.
- **Detalhe (tela 2):**
  - `Sheet` que sobe da parte de baixo e ocupa a altura menos 70 px.
  - Contém foto de 210 px (quando houver), selos, nome, descrição, preço (ou a lista de variações), adicionais em `DottedPriceRow` e uma observação de tempo de preparo.
  - Fecha arrastando para baixo, no ✕, com Esc ou com o "voltar".
- **Informações (tela 3):** um `Sheet` com o status, os horários da semana (hoje em negrito bordô), o endereço + botão "Abrir no Google Maps", os chips de pagamento com os avisos e o bloco "Bom saber".
- **Busca:** a barra se transforma num campo de busca e os resultados aparecem em `DishRow`. Se nada for encontrado: "Nada encontrado para "x"" e atalhos para as categorias.
- **`DishPhoto`:** usa `next/image`, com a cor `surface-muted` enquanto carrega e um fade-in quando termina. **Se a foto faltar ou der erro, o layout sem foto é usado.**

### 7.3 Estados

| Estado | Comportamento |
|---|---|
| Loja fechada | "Fechado · abre <dia> às <hora>". O cardápio continua navegável |
| Offline | O cardápio salvo no celular, com o aviso discreto "Você está offline, mostrando o cardápio salvo" |
| Esgotado | Linha em escala de cinza com 45% de opacidade e o selo "Esgotado hoje". O detalhe abre, e o preço fica acinzentado |
| Sem foto | Layout só com texto, sem espaço vazio |
| Erro de renderização | `error.tsx`: "Não foi possível carregar o cardápio" + "Tentar novamente" |
| Rota inexistente | `not-found.tsx` com um link de volta ao cardápio |

### 7.4 Acessibilidade, movimento e desempenho

- Áreas de toque de pelo menos 44×44 px, contraste AA, `lang="pt-BR"`, hierarquia `h1`→`h2`→`h3`, `Sheet` com `role="dialog"`, foco preso dentro dele e devolução do foco ao fechar.
- As animações são só em CSS (painel subindo em cerca de 250 ms, indicador da aba deslizando e imagens aparecendo aos poucos). Com `prefers-reduced-motion`, as animações se desligam.
- Metas de desempenho: o conteúdo principal aparece em menos de 2 s no 4G, o JavaScript da página inicial fica abaixo de 100 KB compactado, as imagens são servidas em AVIF ou WebP com `sizes` corretos e fora da tela carregam só quando necessário (lazy).

---

## 8. PWA, SEO e metadados

- **Manifest:**
  - `name` "Divino Fogão · Cardápio", `short_name` "Divino Fogão"
  - `theme_color` `#6B1D22`, `background_color` `#F4EEE4`, `display` `standalone`
  - Ícones de 192 e 512 px, mais a versão *maskable*, com o monograma "DF" em creme sobre bordô
- **Service worker (Serwist Turbopack):**
  - Usa o `defaultCache` do Serwist: a navegação tenta a rede primeiro e, sem rede, usa a cópia salva; imagens e arquivos estáticos ficam em cache com limites.
  - Tem a página de reserva `/~offline`.
  - A página visitada fica salva (`cacheOnNavigation`).
  - **Desligado em `npm run dev`** (`SerwistProvider disable`).
- **SEO:**
  - `title` "Cardápio · Divino Fogão São Leopoldo", `description`, imagem Open Graph.
  - **JSON-LD** `Restaurant` com `hasMenu` → `Menu`/`MenuSection`/`MenuItem`/`Offer`, gerado a partir do `Menu`, para o Google conseguir ler o cardápio.

---

## 9. Testes e qualidade

**Os testes são escritos antes do código (TDD).** Testes de unidade e de componente ficam ao lado do arquivo testado (`*.test.ts(x)`), e os de ponta a ponta ficam em `tests/e2e`.

| Camada | Ferramenta | Casos mínimos |
|---|---|---|
| Domínio | Vitest | `isOpenNow`: dentro e fora da faixa, mais de uma faixa no dia, faixa que passa da meia-noite, fuso de SP com o aparelho em outro fuso. `nextOpening`. `formatBRL(8990) === "R$ 89,90"`. `searchDishes`: acentos, maiúsculas, busca parcial, sem resultado |
| Dados iniciais | Vitest + Zod | `menu.ts` passa no schema; slugs únicos; preços > 0; todo prato tem preço; `seed.sql` está em dia com `menu.ts` |
| Contrato | Vitest | **A mesma bateria roda em `SeedMenuRepository` e em `SupabaseMenuRepository`.** O cliente Supabase é substituído por um dublê que devolve dados de exemplo no formato do PostgREST. Os testes cobrem o filtro de visíveis e ativos, a ordenação por `position` e a conversão de `numeric` para `Cents`. Não acessam a rede |
| Componentes | Vitest + Testing Library | `DishRow` com e sem foto, esgotado, com variações; `CompactRow`; `DishSheet` abrindo por `?prato=`; `OpenStatus` aberto e fechado |
| Ponta a ponta | Playwright (iPhone 12 e Pixel 7) | Carregar o cardápio; tocar numa aba rola até a seção; abrir e fechar um prato (✕ e "voltar"); buscar "parmegiana" e "xyz"; abrir as informações; offline, contra o build de produção |
| Acessibilidade | `@axe-core/playwright` | Nenhuma violação `serious` ou `critical` nas três telas |

**Qualidade:**
- TypeScript `strict` com `noUncheckedIndexedAccess`.
- ESLint com as regras da seção 4.2, e Prettier.
- Scripts `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`, `npm run build`.
- `.github/workflows/ci.yml` roda todos eles.
- Mensagens de commit no padrão Conventional Commits.

---

## 10. Ambiente e fluxo de trabalho

- **Variáveis:**
  - `MENU_SOURCE` (padrão `seed`).
  - `SUPABASE_URL` e `SUPABASE_ANON_KEY`, exigidas só quando `MENU_SOURCE=supabase`.
  - Existe um `.env.example` com essas variáveis. O `.env*.local` fica fora do git.
- **Mobile Viewer:** `npm run dev` → `localhost:3000`, preset iPhone 12 Pro (390×844). Para testar o PWA: `npm run build && npm start`.
- **Git:**
  - Repositório próprio em `app_bar/`, branch `main`, identidade local `Maxx <216940663+sout-MMdev@users.noreply.github.com>`.
  - `.gitignore` inclui `.superpowers/`, `node_modules/`, `.next/`, `.env*.local` e `public/menu-photos/*`, mantendo o `.gitkeep`.
  - **As fotos do Google Maps não vão para o git**, porque são de terceiros. No desenvolvimento, elas ficam em `public/menu-photos/`, e o seed aponta para esses arquivos.
- **Hospedagem:** **nada é publicado nesta parte.** No lançamento, a escolha é entre a Vercel (o plano grátis é só para uso não comercial; para o restaurante seria o plano Pro) e a Cloudflare (grátis, com mais configuração). O código não depende de nenhuma das duas.

---

## 11. Pendências antes do lançamento

Nenhuma delas bloqueia o desenvolvimento.

1. **Horário de funcionamento:** só se sabe que abre sábado às 11:00. O seed usa horários **provisórios**, marcados como tal no próprio `menu.ts`.
2. **Dois preços cobertos por adesivo:** Parmegiana de Tilápia e Parmegiana de Berinjela.
3. **"Grátis 1 chopp 400 ml":** confirmar se a oferta vale só para o Batatão Divino ou para toda a linha "Tamanho Família".
4. **Fotos oficiais** dos pratos e **textos de descrição**, fornecidos pelo restaurante.
5. **Quais pratos marcar como "mais pedido"** e quais entram nos destaques. A proposta inicial está no apêndice A.
6. Criação do projeto Supabase, hospedagem, domínio e impressão dos QR codes. Tudo isso só com autorização do usuário.

---

## Apêndice A: cardápio inicial (transcrito do cardápio impresso)

Legenda: ★ = destaque proposto · 🌱 = vegetariano (ícone no cardápio impresso) · (a confirmar) = ilegível no impresso.

**Porções Divinas** (`rows`)
| Item | Preço |
|---|---|
| Pão de alho | 3 unidades R$ 18,90 · 1 unidade R$ 6,90 |
| Batata frita | pequena R$ 29,90 · grande R$ 42,90 |
| Polenta frita | R$ 27,90 |
| Ovo de codorna com orégano | R$ 35,90 |
| Tomatinho cereja (temperado com sal, azeite de oliva e orégano) | R$ 35,90 |
| Pepino em conserva | R$ 35,90 |
| Anéis de cebola | R$ 35,90 |
| Calabresa grelhada (acebolada) | R$ 35,90 |
| Tiras de filé de frango grelhado (acebolado) | R$ 35,90 |
| Tiras de alcatra grelhada (acebolada) | R$ 51,90 |

**Para Compartilhar** (`rows`)
| Item | Preço |
|---|---|
| Porção Dupla: 2 opções à escolha entre batata frita, polenta frita, pão de alho, ovo de codorna, pepino em conserva, calabresa acebolada, iscas de frango aceboladas, iscas de alcatra aceboladas, tomatinho cereja e anéis de cebola | R$ 39,90 · adicional: opção com alcatra + R$ 5,00 |
| Batata Frita com Calabresa | R$ 39,00 · adicionais: opção com alcatra + R$ 5,00; farofinha + R$ 5,00; cebolado extra + R$ 5,00 |
| ★ Divina Porção (serve até 3): batata frita, pão de alho, iscas de alcatra, iscas de frango, calabresa acebolada, tomatinho cereja, ovinho de codorna com orégano, pepino e queijo coalho | R$ 89,90 |
| ★ Batatão Divino (serve até 3): recheios à escolha, entre cheddar, barbecue, calabresa ou muçarela; estrogonofe de frango com batata palha; estrogonofe de carne com batata palha. Ganhe 1 chopp 400 ml | R$ 89,90 |

**Parmegianas** (`rows`, molho artesanal). Acompanham arroz branco ou integral e batata frita, batata palha ou legumes.
| Item | Preço |
|---|---|
| ★ Parmegiana de frango | R$ 45,90 |
| Parmegiana de tilápia | (a confirmar) |
| Parmegiana de alcatra | R$ 47,90 |
| Parmegiana de berinjela 🌱 | (a confirmar) |

**Pratos com Frango** (`rows`)
| Item | Preço |
|---|---|
| Filé de frango grelhado: feijão carioca, preto ou lentilha; arroz branco ou integral; batata | R$ 39,90 · adicional: à milanesa + R$ 3,00 |
| Estrogonofe de frango: arroz branco ou integral; batata frita, batata palha ou legumes | R$ 41,90 |
| Filé de frango com legumes: feijão carioca, preto ou lentilha; arroz branco ou integral | R$ 39,90 |

**Carnes e Peixe** (`rows`)
| Item | Preço |
|---|---|
| Alcatra à cavalo à la minuta: feijão carioca, preto ou lentilha; arroz branco ou integral; batata frita ou palha | R$ 45,90 |
| Alcatra grelhada: mesmos acompanhamentos | R$ 43,90 |
| Tilápia grelhada: arroz branco ou integral; batata frita, batata palha ou legumes | R$ 47,90 · adicional: à milanesa + R$ 3,00 |

**Extras e Porções Pequenas** (`compact`)
Arroz branco R$ 9,90 · Arroz integral R$ 11,90 · Batata frita na caixinha R$ 11,90 · Alcatra 100–120 g R$ 15,90 · Ovo frito (1) R$ 3,90 · Polenta frita R$ 11,90 · Legumes R$ 11,90 · Feijão carioca R$ 11,90 · Feijão preto R$ 11,90 · Lentilha R$ 13,90 · Filé de frango 100–120 g R$ 13,90 · Purê de batata R$ 11,90 · Tilápia grelhada 100–120 g R$ 17,90 · Maionese 300 g R$ 13,90

**Sobremesas** (`compact`)
Mousse de maracujá R$ 9,90 · Mousse de limão R$ 9,90 · Fatia de pudim R$ 9,90

**Bebidas** (`compact`)
Refrigerante 600 ml R$ 13,50 · Refrigerante lata R$ 9,50 · Suco Del Valle lata R$ 9,50 · Água tônica R$ 9,50 · Schweppes Citrus R$ 9,50 · Chá gelado (copo) R$ 9,90 · Água mineral 500 ml R$ 7,50 · Suco de laranja natural: 500 ml R$ 13,00, 300 ml R$ 11,00, 200 ml R$ 9,00

**Cervejas e Drinks** (`compact`)
Cerveja long neck R$ 15,00 · Cerveja lata R$ 11,00 · Cerveja latão 473 ml R$ 16,00 · Cachaça mineira (dose) R$ 11,00 · Chopp: 400 ml R$ 19,00, 770 ml R$ 29,00 · Caipirinha de cachaça R$ 25,00 · Caipirinha de vodka R$ 29,00 · Whisky importado (dose) R$ 19,00

**Promoções**
1. Na compra de qualquer prato, leve um refrigerante lata ou uma água mineral 500 ml por **+ R$ 5,90**.
2. Na compra de 3 chopps 400 ml, **+ R$ 2,00** e você ganha uma mini porção de batata frita.
3. Na compra de uma caipirinha, ganhe **1 cerveja long neck** (Stella Artois ou Budweiser).
4. Na compra de duas sobremesas, **a terceira é grátis**.

**Restaurante**
- **Nome e assinatura:** Divino Fogão · Comida da Fazenda
- **Endereço:** Bourbon Shopping São Leopoldo, R. Primeiro de Março, 821, Centro, São Leopoldo/RS, 93010-210
- **Tempo de preparo:** cerca de 20 min
- **Observação:** todos os pratos acompanham salada de tomate, alface e cenoura
- **Pagamento:** Pix, Visa, Mastercard, Elo, Hipercard, American Express, VR, Alelo, Sodexo/Pluxee, Ticket Restaurante, GreenCard e aproximação
- **Aviso de pagamento:** não aceitamos Banrisul, conforme resposta do proprietário no Google
