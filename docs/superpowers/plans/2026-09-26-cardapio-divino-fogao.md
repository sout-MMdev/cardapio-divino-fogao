# Cardápio Digital Divino Fogão (parte 1): plano de implementação

> **Para quem vai executar:** SUB-SKILL OBRIGATÓRIA: use superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans para executar este plano tarefa por tarefa. Os passos usam checkbox (`- [ ]`) para acompanhamento.

**Objetivo:** entregar o cardápio do cliente (PWA Next.js, tema A) com o cardápio real, rodando em `localhost:3000` no Mobile Viewer, com o Supabase preparado e sem nada aplicado.

**Arquitetura:**
- Um app Next.js 16 (App Router, Turbopack). A dependência vai sempre num sentido: `app → features → domain`. `ui/` e `lib/` são compartilhados.
- As telas recebem um `Menu` já validado do `MenuRepository`. A implementação padrão é `seed`; a versão `supabase` está pronta e é testada com dados de exemplo.
- Os painéis (prato, informações e busca) ficam no endereço da página, via `window.history`, que o Next sincroniza. Assim o "voltar" do celular fecha o painel.

**Stack:** Next.js 16.3 · React 19.2 · TypeScript 5 (strict) · Tailwind 4 · Zod 4 · @supabase/supabase-js 2 · Serwist 9 (`@serwist/turbopack`) · Vitest 5 + Testing Library · Playwright 1.63 + axe · npm 11.

**Especificação:** [`docs/superpowers/specs/2026-09-26-cardapio-divino-fogao-design.md`](../specs/2026-09-26-cardapio-divino-fogao-design.md)

## Restrições globais

- ⛔ **Nunca** executar `supabase link`, `supabase db push`, SQL remoto, carga de dados remota, MCP do Supabase nem deploy. Tudo do Supabase existe **só como arquivo**.
- Commits como `Maxx <216940663+sout-MMdev@users.noreply.github.com>` (config local do repo). Nunca usar a identidade da empresa. Não criar remoto no GitHub.
- Gerenciador de pacotes: **npm**. Rodar do diretório `C:\Users\maxue\OneDrive\Desktop\app_bar`.
- Textos da tela em pt-BR. Nomes de código e de banco em inglês, `snake_case` no banco.
- `MENU_SOURCE` tem `seed` como padrão. O app roda sem nenhuma variável de ambiente.
- Tema A, com os tokens exatos da seção 7.1 da especificação. Áreas de toque de pelo menos 44 px e contraste AA (sem `opacity` em texto).
- `next/image`: usar `preload` (o `priority` está obsoleto no Next 16).
- O `cacheComponents` **não** é ligado. A página usa `export const revalidate = 3600`.
- Fotos do Google Maps só em `public/menu-photos/`, pasta ignorada pelo git.
- Next 16 tem mudanças incompatíveis com versões anteriores. Em caso de dúvida, consultar `node_modules/next/dist/docs/`.

## Foco da revisão

1. **Link direto para um prato que não existe** (`/?prato=nao-existe`): nenhum painel abre e a página não quebra. O teste fica na Tarefa 10, passo 7.
2. **Fechar um painel aberto por link direto**: o usuário continua no site (troca o endereço, não volta o histórico). O teste fica na Tarefa 9, passo 1.
3. **Foto ausente ou quebrada**: o layout volta para a versão sem foto e não aparece o ícone de imagem quebrada. O teste fica na Tarefa 7, passo 1.
4. **Busca com acentos, maiúsculas, espaços extras e símbolos como `(`**: não quebra e encontra o que deve encontrar. O teste fica na Tarefa 3, passo 1.
5. **Tela estreita de 344 px (Galaxy Fold)**: não aparece rolagem horizontal. O teste fica na Tarefa 12, passo 2.

---

### Tarefa 1: base do projeto, ferramentas e `domain/money`

**Arquivos:**
- Criar: projeto Next (via create-next-app), `.gitattributes`, `.prettierrc.json`, `.prettierignore`, `.env.example`, `CLAUDE.md`, `vitest.config.mts`, `vitest.setup.ts`, `src/domain/money.ts`
- Modificar: `.gitignore`, `package.json`, `tsconfig.json`, `eslint.config.mjs`
- Teste: `src/domain/money.test.ts`

**Interfaces:**
- Produz: `centsSchema`, `type Cents`, `cents(n: number): Cents`, `toCents(v: number | string): Cents`, `formatBRL(c: Cents): string`, `formatAddon(c: Cents): string`

- [ ] **Passo 1: gerar a base num diretório temporário e copiar**

```bash
SCR="C:/Users/maxue/AppData/Local/Temp/claude/c--Users-maxue-OneDrive-Desktop-app-bar/16b5a2a4-3137-450b-bfc0-3c8805bb9c03/scratchpad"
rm -rf "$SCR/scaffold" && npx --yes create-next-app@16.3.6 "$SCR/scaffold" --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --skip-install --disable-git --yes
cd "$SCR/scaffold" && rm -f .gitignore README.md public/*.svg && cp -r . "C:/Users/maxue/OneDrive/Desktop/app_bar/"
cd "C:/Users/maxue/OneDrive/Desktop/app_bar" && npm install
```

- [ ] **Passo 2: instalar dependências**

```bash
npm install zod @supabase/supabase-js
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event @playwright/test @axe-core/playwright tsx prettier prettier-plugin-tailwindcss eslint-config-prettier
```

- [ ] **Passo 3: configurar**

`package.json` → `"scripts"`:
```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test",
  "format": "prettier --write .",
  "seed:sql": "tsx scripts/generate-seed-sql.ts",
  "icons": "powershell -ExecutionPolicy Bypass -File scripts/generate-icons.ps1"
}
```

`tsconfig.json`: `"target": "ES2022"` e acrescentar `"noUncheckedIndexedAccess": true`. Acrescentar em `"exclude"`: `"tests/e2e"`, `"playwright.config.ts"`.

`.gitattributes`:
```
* text=auto eol=lf
*.png binary
*.jpg binary
*.ico binary
```

`.gitignore`: acrescentar ao existente:
```
/build
*.pem
npm-debug.log*
```

`.prettierrc.json`:
```json
{ "printWidth": 100, "plugins": ["prettier-plugin-tailwindcss"] }
```

`.prettierignore`:
```
.next
node_modules
public/sw.js
supabase/seed.sql
playwright-report
test-results
```

`.env.example`:
```
# Fonte dos dados do cardápio: seed (padrão, dados locais) | supabase
MENU_SOURCE=seed
# Só quando MENU_SOURCE=supabase (NÃO configure sem autorização do dono do projeto)
SUPABASE_URL=
SUPABASE_ANON_KEY=
# URL pública do site (metadados/Open Graph). Opcional em desenvolvimento.
SITE_URL=http://localhost:3000
```

`CLAUDE.md` (substitui o do template):
```markdown
@AGENTS.md

# Cardápio Divino Fogão — regras do projeto

- ⛔ Nunca aplicar nada em Supabase (link, db push, SQL remoto, seed remoto, MCP) nem publicar deploy sem autorização explícita do dono.
- Commits pessoais: `Maxx <216940663+sout-MMdev@users.noreply.github.com>`. Nada da identidade da empresa. GitHub só na conta sout-MMdev.
- Camadas: `app → features → domain`; `ui/` e `lib/` compartilhados; `data/` só é usado por `app/`. O ESLint garante isso.
- Especificação: `docs/superpowers/specs/2026-09-26-cardapio-divino-fogao-design.md`. Plano: `docs/superpowers/plans/2026-09-26-cardapio-divino-fogao.md`.
- Rodar: `npm run dev` → Mobile Viewer em `localhost:3000` (preset iPhone 12 Pro).
```

`eslint.config.mjs`:
```js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const restrict = (patterns) => ({ "no-restricted-imports": ["error", { patterns }] });

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    files: ["src/domain/**/*.{ts,tsx}"],
    rules: restrict([
      { group: ["react", "react-dom", "next", "next/**", "@supabase/**"], message: "domain/ é puro: sem React, Next ou Supabase." },
      { group: ["@/app/**", "@/features/**", "@/data/**", "@/ui/**", "@/lib/**"], message: "domain/ não depende de outras camadas." },
    ]),
  },
  {
    files: ["src/ui/**/*.{ts,tsx}"],
    rules: restrict([{ group: ["@/app/**", "@/features/**", "@/data/**"], message: "ui/ só conhece domain/ e lib/." }]),
  },
  {
    files: ["src/features/**/*.{ts,tsx}"],
    rules: restrict([
      { group: ["@/data/**", "@/app/**"], message: "features/ recebe dados prontos; não acessa data/ nem app/." },
      { group: ["@/features/*/**"], message: "Importe outra feature só pelo index (ex.: @/features/menu)." },
    ]),
  },
  {
    files: ["src/data/**/*.{ts,tsx}"],
    rules: restrict([{ group: ["react", "react-dom", "@/app/**", "@/features/**", "@/ui/**"], message: "data/ não conhece UI." }]),
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "public/sw.js", "playwright-report/**", "test-results/**"]),
]);
```

`vitest.config.mts`:
```ts
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: false,
    restoreMocks: true,
  },
});
```

`vitest.setup.ts`:
```ts
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
  window.history.replaceState(null, "", "/");
});

// jsdom não implementa <dialog>.showModal/close
if (typeof HTMLDialogElement !== "undefined") {
  HTMLDialogElement.prototype.showModal ??= function showModal(this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close ??= function close(this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
}
Element.prototype.scrollIntoView ??= function scrollIntoView() {};
Element.prototype.scrollTo ??= function scrollTo() {};
```

- [ ] **Passo 4: escrever o teste que falha**, `src/domain/money.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { cents, formatAddon, formatBRL, toCents } from "./money";

describe("money", () => {
  it("formata centavos em reais no padrão brasileiro", () => {
    expect(formatBRL(cents(8990))).toBe("R$\u00a089,90");
    expect(formatBRL(cents(390))).toBe("R$\u00a03,90");
  });

  it("formata adicional com sinal de mais", () => {
    expect(formatAddon(cents(500))).toBe("+ R$\u00a05,00");
  });

  it("converte numeric do banco (número ou texto) para centavos sem erro de ponto flutuante", () => {
    expect(toCents("39.90")).toBe(3990);
    expect(toCents(29.9)).toBe(2990);
    expect(toCents(0.1 + 0.2)).toBe(30);
  });

  it("rejeita valores inválidos", () => {
    expect(() => cents(1.5)).toThrow();
    expect(() => toCents("abc")).toThrow();
  });
});
```

- [ ] **Passo 5: rodar e ver falhar**. Rodar `npx vitest run src/domain/money.test.ts`. Esperado: FALHA, "Failed to resolve import ./money".

- [ ] **Passo 6: implementar** `src/domain/money.ts`

```ts
import { z } from "zod";

/** Valor monetário em centavos inteiros (8990 = R$ 89,90). */
export const centsSchema = z.number().int().positive().brand<"Cents">();
export type Cents = z.infer<typeof centsSchema>;

export function cents(value: number): Cents {
  if (!Number.isInteger(value)) throw new Error(`Centavos precisam ser inteiros: ${value}`);
  return value as Cents;
}

/** Converte um valor em reais (numeric do Postgres chega como number ou string). */
export function toCents(value: number | string): Cents {
  const reais = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(reais)) throw new Error(`Valor monetário inválido: ${value}`);
  return Math.round(reais * 100) as Cents;
}

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatBRL(value: Cents): string {
  return brl.format(value / 100);
}

export function formatAddon(value: Cents): string {
  return `+ ${formatBRL(value)}`;
}
```

- [ ] **Passo 7: verificar tudo**. Rodar `npx vitest run src/domain/money.test.ts && npm run lint && npm run typecheck`. Esperado: 4 testes passando, lint e typecheck limpos.

- [ ] **Passo 8: commit**

```bash
git add -A && git commit -m "chore: base Next.js 16 + ferramentas (vitest, eslint de camadas, prettier) e domain/money"
```

---

### Tarefa 2: `domain/menu` (tipos, schema Zod e regras)

**Arquivos:**
- Criar: `src/domain/menu.ts`, `src/test/fixtures.ts`
- Teste: `src/domain/menu.test.ts`

**Interfaces:**
- Consome: `centsSchema`, `Cents`, `cents` (Tarefa 1)
- Produz: `menuSchema`, `dishSchema`, `TAGS`, os tipos `Tag`, `DisplayStyle`, `Photo`, `PriceLine`, `Dish`, `Category`, `Promotion`, `OpeningRange`, `Restaurant`, `Menu` e `PriceSummary`, e as funções `priceSummary(dish)`, `featuredDishes(categories): Dish[]`, `findDish(categories, slug): { dish; category } | undefined` e `countDishes(categories): number`. Em `src/test/fixtures.ts`: `makeDish(overrides?)`, `makeCategory(overrides?)`, `makeMenu(overrides?)`.

- [ ] **Passo 1: criar os fixtures de teste**, `src/test/fixtures.ts`

```ts
import { cents } from "@/domain/money";
import type { Category, Dish, Menu } from "@/domain/menu";

export function makeDish(overrides: Partial<Dish> = {}): Dish {
  return {
    slug: "batata-frita",
    name: "Batata frita",
    basePrice: cents(2990),
    variants: [],
    addons: [],
    tags: [],
    isAvailable: true,
    isFeatured: false,
    ...overrides,
  };
}

export function makeCategory(overrides: Partial<Category> = {}): Category {
  return { slug: "porcoes", name: "Porções", displayStyle: "rows", dishes: [makeDish()], ...overrides };
}

export function makeMenu(overrides: Partial<Menu> = {}): Menu {
  return {
    restaurant: {
      name: "Divino Fogão",
      tagline: "Comida da Fazenda · São Leopoldo",
      address: "R. Primeiro de Março, 821",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=Divino+Fog%C3%A3o",
      timezone: "America/Sao_Paulo",
      prepTimeMinutes: 20,
      paymentMethods: ["Pix"],
      paymentNotes: [],
      notes: [],
    },
    openingHours: [{ weekday: 6, opensAt: "11:00", closesAt: "22:00" }],
    categories: [makeCategory()],
    promotions: [],
    ...overrides,
  };
}
```

- [ ] **Passo 2: escrever o teste que falha**, `src/domain/menu.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { makeCategory, makeDish, makeMenu } from "@/test/fixtures";
import { cents } from "./money";
import { countDishes, featuredDishes, findDish, menuSchema, priceSummary } from "./menu";

describe("menuSchema", () => {
  it("aceita um cardápio válido", () => {
    expect(() => menuSchema.parse(makeMenu())).not.toThrow();
  });

  it("rejeita slug de prato repetido entre categorias", () => {
    const menu = makeMenu({
      categories: [makeCategory({ slug: "a" }), makeCategory({ slug: "b" })],
    });
    expect(() => menuSchema.parse(menu)).toThrow(/slug repetido: batata-frita/);
  });

  it("rejeita promoção apontando para prato inexistente", () => {
    const menu = makeMenu({ promotions: [{ slug: "promo", title: "Promo", dishSlug: "nao-existe" }] });
    expect(() => menuSchema.parse(menu)).toThrow(/prato inexistente/);
  });

  it("rejeita horário fora do formato HH:MM", () => {
    const menu = makeMenu({ openingHours: [{ weekday: 1, opensAt: "24:00", closesAt: "22:00" }] });
    expect(() => menuSchema.parse(menu)).toThrow();
  });

  it("rejeita preço zero e tag desconhecida", () => {
    const zero = makeMenu({ categories: [makeCategory({ dishes: [makeDish({ basePrice: 0 as never })] })] });
    expect(() => menuSchema.parse(zero)).toThrow();
    const tag = makeMenu({ categories: [makeCategory({ dishes: [makeDish({ tags: ["picante" as never] })] })] });
    expect(() => menuSchema.parse(tag)).toThrow();
  });

  it("rejeita categoria sem pratos", () => {
    expect(() => menuSchema.parse(makeMenu({ categories: [makeCategory({ dishes: [] })] }))).toThrow();
  });
});

describe("regras do cardápio", () => {
  it("priceSummary prioriza variações, depois preço único, senão 'sob consulta'", () => {
    const variants = [{ label: "Pequena", price: cents(2990) }];
    expect(priceSummary(makeDish({ variants }))).toEqual({ kind: "variants", variants });
    expect(priceSummary(makeDish())).toEqual({ kind: "single", price: 2990 });
    expect(priceSummary(makeDish({ basePrice: null }))).toEqual({ kind: "on-request" });
  });

  it("featuredDishes, findDish e countDishes percorrem todas as categorias", () => {
    const destaque = makeDish({ slug: "batatao", name: "Batatão", isFeatured: true });
    const categories = [makeCategory(), makeCategory({ slug: "familia", dishes: [destaque] })];
    expect(featuredDishes(categories).map((d) => d.slug)).toEqual(["batatao"]);
    expect(findDish(categories, "batatao")?.category.slug).toBe("familia");
    expect(findDish(categories, "nao-existe")).toBeUndefined();
    expect(countDishes(categories)).toBe(2);
  });
});
```

- [ ] **Passo 3: rodar e ver falhar**. Rodar `npx vitest run src/domain/menu.test.ts`. Esperado: FALHA, "Failed to resolve import ./menu".

- [ ] **Passo 4: implementar** `src/domain/menu.ts`

```ts
import { z } from "zod";
import { centsSchema, type Cents } from "./money";

export const TAGS = ["vegetariano", "mais_pedido"] as const;
export const tagSchema = z.enum(TAGS);
export const displayStyleSchema = z.enum(["rows", "compact"]);

const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug inválido");
const text = z.string().trim().min(1);
const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "horário deve ser HH:MM");

export const photoSchema = z.object({ src: text, alt: text });
export const priceLineSchema = z.object({ label: text, price: centsSchema });

export const dishSchema = z.object({
  slug: slugSchema,
  name: text,
  description: text.optional(),
  /** null ⇒ preço vem das variações; sem variações ⇒ "Consulte o preço" */
  basePrice: centsSchema.nullable(),
  variants: z.array(priceLineSchema),
  addons: z.array(priceLineSchema),
  photo: photoSchema.optional(),
  serves: z.number().int().positive().optional(),
  tags: z.array(tagSchema),
  isAvailable: z.boolean(),
  isFeatured: z.boolean(),
});

export const categorySchema = z.object({
  slug: slugSchema,
  name: text,
  displayStyle: displayStyleSchema,
  dishes: z.array(dishSchema).min(1),
});

export const promotionSchema = z.object({
  slug: slugSchema,
  title: text,
  description: text.optional(),
  highlight: text.optional(),
  photo: photoSchema.optional(),
  dishSlug: slugSchema.optional(),
});

export const openingRangeSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  opensAt: hhmm,
  closesAt: hhmm,
});

export const restaurantSchema = z.object({
  name: text,
  tagline: text,
  address: text,
  mapsUrl: z.url(),
  timezone: text,
  prepTimeMinutes: z.number().int().positive(),
  paymentMethods: z.array(text),
  paymentNotes: z.array(text),
  notes: z.array(text),
});

export const menuSchema = z
  .object({
    restaurant: restaurantSchema,
    openingHours: z.array(openingRangeSchema),
    categories: z.array(categorySchema).min(1),
    promotions: z.array(promotionSchema),
  })
  .superRefine((menu, ctx) => {
    const unique = (label: string, slugs: string[]) => {
      const seen = new Set<string>();
      for (const slug of slugs) {
        if (seen.has(slug)) ctx.addIssue({ code: "custom", message: `${label} com slug repetido: ${slug}` });
        seen.add(slug);
      }
    };
    const dishSlugs = menu.categories.flatMap((c) => c.dishes.map((d) => d.slug));
    unique("Categoria", menu.categories.map((c) => c.slug));
    unique("Prato", dishSlugs);
    unique("Promoção", menu.promotions.map((p) => p.slug));
    const known = new Set(dishSlugs);
    for (const promo of menu.promotions) {
      if (promo.dishSlug && !known.has(promo.dishSlug)) {
        ctx.addIssue({ code: "custom", message: `Promoção ${promo.slug} aponta para prato inexistente: ${promo.dishSlug}` });
      }
    }
  });

export type Tag = z.infer<typeof tagSchema>;
export type DisplayStyle = z.infer<typeof displayStyleSchema>;
export type Photo = z.infer<typeof photoSchema>;
export type PriceLine = z.infer<typeof priceLineSchema>;
export type Dish = z.infer<typeof dishSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Promotion = z.infer<typeof promotionSchema>;
export type OpeningRange = z.infer<typeof openingRangeSchema>;
export type Restaurant = z.infer<typeof restaurantSchema>;
export type Menu = z.infer<typeof menuSchema>;

export type PriceSummary =
  | { kind: "single"; price: Cents }
  | { kind: "variants"; variants: PriceLine[] }
  | { kind: "on-request" };

export function priceSummary(dish: Pick<Dish, "basePrice" | "variants">): PriceSummary {
  if (dish.variants.length > 0) return { kind: "variants", variants: dish.variants };
  if (dish.basePrice !== null) return { kind: "single", price: dish.basePrice };
  return { kind: "on-request" };
}

export function featuredDishes(categories: Category[]): Dish[] {
  return categories.flatMap((c) => c.dishes.filter((d) => d.isFeatured));
}

export function findDish(categories: Category[], slug: string): { dish: Dish; category: Category } | undefined {
  for (const category of categories) {
    const dish = category.dishes.find((d) => d.slug === slug);
    if (dish) return { dish, category };
  }
  return undefined;
}

export function countDishes(categories: Category[]): number {
  return categories.reduce((total, c) => total + c.dishes.length, 0);
}
```

- [ ] **Passo 5: rodar e ver passar**. Rodar `npx vitest run src/domain`. Esperado: PASSA.

- [ ] **Passo 6: commit.** `git add -A && git commit -m "feat(domain): modelo do cardápio com validação Zod"`

---

### Tarefa 3: `domain/opening-hours` e `domain/search`

**Arquivos:**
- Criar: `src/domain/opening-hours.ts`, `src/domain/search.ts`
- Teste: `src/domain/opening-hours.test.ts`, `src/domain/search.test.ts`

**Interfaces:**
- Consome: `OpeningRange`, `Category`, `Dish` (Tarefa 2)
- Produz:
  - Tipos: `type Weekday = 0|1|2|3|4|5|6`, `ZonedMoment { weekday; minutes }`, `NextOpening { inDays; weekday; opensAt }`, `OpenStatus`, `DaySchedule { weekday; name; ranges: string[] }`, `SearchHit { dish; categorySlug; categoryName }`
  - Funções de horário: `zonedMoment(date, timeZone)`, `openStatus(hours, date, timeZone)`, `openStatusAt(hours, at)`, `nextOpening(hours, at)`, `formatOpenStatus(status)`, `formatHour("22:30")`, `weeklySchedule(hours)`
  - Constante: `WEEKDAY_NAMES`
  - Busca: `normalize(text)`, `searchDishes(categories, query)`, `MIN_QUERY_LENGTH = 2`

- [ ] **Passo 1: escrever os testes que falham**

`src/domain/search.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { makeCategory, makeDish } from "@/test/fixtures";
import { normalize, searchDishes } from "./search";

const categories = [
  makeCategory({
    slug: "porcoes",
    name: "Porções",
    dishes: [makeDish({ slug: "pao-de-alho", name: "Pão de alho" }), makeDish({ slug: "polenta", name: "Polenta frita" })],
  }),
  makeCategory({
    slug: "parmegianas",
    name: "Parmegianas",
    dishes: [
      makeDish({ slug: "parm-frango", name: "Parmegiana de frango", description: "Acompanha arroz branco ou integral." }),
      makeDish({ slug: "parm-berinjela", name: "Parmegiana de berinjela" }),
    ],
  }),
  makeCategory({ slug: "frango", name: "Frango", dishes: [makeDish({ slug: "file", name: "Filé de frango grelhado" })] }),
];
const slugs = (q: string) => searchDishes(categories, q).map((h) => h.dish.slug);

describe("normalize", () => {
  it("remove acentos, caixa e espaços extras", () => {
    expect(normalize("  Pão   de ALHO ")).toBe("pao de alho");
    expect(normalize("Açaí")).toBe("acai");
  });
});

describe("searchDishes", () => {
  it("ignora acentos e maiúsculas", () => {
    expect(slugs("pao")).toEqual(["pao-de-alho"]);
    expect(slugs("PARMEGIANA")).toEqual(["parm-frango", "parm-berinjela"]);
  });

  it("exige todas as palavras, em qualquer ordem, com espaços extras", () => {
    expect(slugs("  frango   parme ")).toEqual(["parm-frango"]);
  });

  it("encontra pela descrição, mas depois dos que batem no nome", () => {
    expect(slugs("arroz")).toEqual(["parm-frango"]);
    expect(slugs("frango")).toEqual(["parm-frango", "file"]);
  });

  it("devolve a categoria de cada resultado", () => {
    expect(searchDishes(categories, "file")[0]).toMatchObject({ categorySlug: "frango", categoryName: "Frango" });
  });

  it("não busca com menos de 2 caracteres e não quebra com símbolos", () => {
    expect(slugs("a")).toEqual([]);
    expect(slugs("xyz")).toEqual([]);
    expect(() => slugs("(frango[")).not.toThrow();
    expect(slugs("(frango[")).toEqual([]);
  });
});
```

`src/domain/opening-hours.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import type { OpeningRange } from "./menu";
import { formatHour, formatOpenStatus, openStatus, weeklySchedule, zonedMoment } from "./opening-hours";

const SP = "America/Sao_Paulo";
const semana: OpeningRange[] = [
  ...[1, 2, 3, 4, 5, 6].map((weekday) => ({ weekday, opensAt: "11:00", closesAt: "22:00" })),
  { weekday: 0, opensAt: "11:00", closesAt: "21:00" },
];
// 2026-09-26 é sábado
const at = (iso: string, hours = semana) => formatOpenStatus(openStatus(hours, new Date(iso), SP));

describe("zonedMoment", () => {
  it("usa o fuso do restaurante, não o do aparelho", () => {
    expect(zonedMoment(new Date("2026-09-26T15:30:00-03:00"), SP)).toEqual({ weekday: 6, minutes: 930 });
    // 02:30 UTC de sábado = 23:30 de sexta em São Paulo
    expect(zonedMoment(new Date("2026-09-26T02:30:00Z"), SP)).toEqual({ weekday: 5, minutes: 1410 });
  });
});

describe("openStatus", () => {
  it("aberto dentro da faixa", () => {
    expect(at("2026-09-26T15:30:00-03:00")).toBe("Aberto agora · fecha às 22h");
  });

  it("fechado exatamente no horário de fechar, abre amanhã", () => {
    expect(at("2026-09-26T22:00:00-03:00")).toBe("Fechado · abre amanhã às 11h");
  });

  it("antes de abrir no mesmo dia", () => {
    expect(at("2026-09-26T09:00:00-03:00")).toBe("Fechado · abre hoje às 11h");
  });

  it("faixa que passa da meia-noite", () => {
    const madrugada: OpeningRange[] = [{ weekday: 5, opensAt: "18:00", closesAt: "02:00" }];
    expect(at("2026-09-26T01:30:00-03:00", madrugada)).toBe("Aberto agora · fecha às 2h");
    expect(at("2026-09-26T02:00:00-03:00", madrugada)).toBe("Fechado · abre sex. às 18h");
    expect(at("2026-09-25T17:59:00-03:00", madrugada)).toBe("Fechado · abre hoje às 18h");
  });

  it("duas faixas no mesmo dia", () => {
    const partido: OpeningRange[] = [
      { weekday: 6, opensAt: "11:00", closesAt: "15:00" },
      { weekday: 6, opensAt: "18:00", closesAt: "23:30" },
    ];
    expect(at("2026-09-26T16:00:00-03:00", partido)).toBe("Fechado · abre hoje às 18h");
    expect(at("2026-09-26T19:00:00-03:00", partido)).toBe("Aberto agora · fecha às 23h30");
  });

  it("próxima abertura em outro dia da semana e sem horários", () => {
    expect(at("2026-09-26T12:00:00-03:00", [{ weekday: 3, opensAt: "11:00", closesAt: "22:00" }])).toBe(
      "Fechado · abre qua. às 11h",
    );
    expect(at("2026-09-26T12:00:00-03:00", [])).toBe("Fechado");
  });
});

describe("formatação", () => {
  it("formatHour", () => {
    expect(formatHour("22:00")).toBe("22h");
    expect(formatHour("22:30")).toBe("22h30");
    expect(formatHour("09:00")).toBe("9h");
  });

  it("weeklySchedule começa na segunda e termina no domingo", () => {
    const dias = weeklySchedule(semana);
    expect(dias.map((d) => d.name)).toEqual(["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]);
    expect(dias[6]).toEqual({ weekday: 0, name: "Domingo", ranges: ["11:00 – 21:00"] });
    expect(weeklySchedule([]).every((d) => d.ranges.length === 0)).toBe(true);
  });
});
```

- [ ] **Passo 2: rodar e ver falhar**. Rodar `npx vitest run src/domain/search.test.ts src/domain/opening-hours.test.ts`. Esperado: FALHA, módulos não encontrados.

- [ ] **Passo 3: implementar** `src/domain/search.ts`

```ts
import type { Category, Dish } from "./menu";

export const MIN_QUERY_LENGTH = 2;

export interface SearchHit {
  dish: Dish;
  categorySlug: string;
  categoryName: string;
}

export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Busca por palavras (todas precisam aparecer); resultados pelo nome vêm antes dos pela descrição. */
export function searchDishes(categories: Category[], query: string): SearchHit[] {
  const q = normalize(query);
  if (q.length < MIN_QUERY_LENGTH) return [];
  const tokens = q.split(" ");
  const byName: SearchHit[] = [];
  const byDescription: SearchHit[] = [];
  for (const category of categories) {
    for (const dish of category.dishes) {
      const name = normalize(dish.name);
      const haystack = `${name} ${normalize(dish.description ?? "")}`;
      if (!tokens.every((t) => haystack.includes(t))) continue;
      const hit = { dish, categorySlug: category.slug, categoryName: category.name };
      (tokens.every((t) => name.includes(t)) ? byName : byDescription).push(hit);
    }
  }
  return [...byName, ...byDescription];
}
```

- [ ] **Passo 4: implementar** `src/domain/opening-hours.ts`

```ts
import type { OpeningRange } from "./menu";

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export interface ZonedMoment {
  weekday: Weekday;
  /** minutos desde 00:00 no fuso do restaurante */
  minutes: number;
}
export interface NextOpening {
  inDays: number;
  weekday: Weekday;
  opensAt: string;
}
export type OpenStatus = { kind: "open"; closesAt: string } | { kind: "closed"; next: NextOpening | null };
export interface DaySchedule {
  weekday: Weekday;
  name: string;
  ranges: string[];
}

export const WEEKDAY_NAMES = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"] as const;
const SHORT_DAYS = ["dom.", "seg.", "ter.", "qua.", "qui.", "sex.", "sáb."] as const;
const WEEKDAY_INDEX: Record<string, Weekday> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

const formatters = new Map<string, Intl.DateTimeFormat>();
function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let f = formatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
    formatters.set(timeZone, f);
  }
  return f;
}

export function zonedMoment(date: Date, timeZone: string): ZonedMoment {
  const parts = formatterFor(timeZone).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  const weekday = WEEKDAY_INDEX[get("weekday")];
  if (weekday === undefined) throw new Error(`Dia da semana inesperado para ${timeZone}`);
  return { weekday, minutes: (Number(get("hour")) % 24) * 60 + Number(get("minute")) };
}

function toMinutes(hhmm: string): number {
  const [h = 0, m = 0] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function currentRange(hours: OpeningRange[], at: ZonedMoment): OpeningRange | undefined {
  return hours.find((r) => {
    const opens = toMinutes(r.opensAt);
    const closes = toMinutes(r.closesAt);
    if (closes > opens) return r.weekday === at.weekday && at.minutes >= opens && at.minutes < closes;
    // passa da meia-noite
    return (r.weekday === at.weekday && at.minutes >= opens) || ((r.weekday + 1) % 7 === at.weekday && at.minutes < closes);
  });
}

export function nextOpening(hours: OpeningRange[], at: ZonedMoment): NextOpening | null {
  for (let inDays = 0; inDays <= 7; inDays++) {
    const weekday = ((at.weekday + inDays) % 7) as Weekday;
    const opensAt = hours
      .filter((r) => r.weekday === weekday)
      .map((r) => r.opensAt)
      .sort()
      .find((o) => inDays > 0 || toMinutes(o) > at.minutes);
    if (opensAt) return { inDays, weekday, opensAt };
  }
  return null;
}

export function openStatusAt(hours: OpeningRange[], at: ZonedMoment): OpenStatus {
  const range = currentRange(hours, at);
  if (range) return { kind: "open", closesAt: range.closesAt };
  return { kind: "closed", next: nextOpening(hours, at) };
}

export function openStatus(hours: OpeningRange[], date: Date, timeZone: string): OpenStatus {
  return openStatusAt(hours, zonedMoment(date, timeZone));
}

export function formatHour(hhmm: string): string {
  const [h = "0", m = "00"] = hhmm.split(":");
  return m === "00" ? `${Number(h)}h` : `${Number(h)}h${m}`;
}

export function formatOpenStatus(status: OpenStatus): string {
  if (status.kind === "open") return `Aberto agora · fecha às ${formatHour(status.closesAt)}`;
  if (!status.next) return "Fechado";
  const { inDays, weekday, opensAt } = status.next;
  const when = inDays === 0 ? "hoje" : inDays === 1 ? "amanhã" : SHORT_DAYS[weekday];
  return `Fechado · abre ${when} às ${formatHour(opensAt)}`;
}

export function weeklySchedule(hours: OpeningRange[]): DaySchedule[] {
  const order: Weekday[] = [1, 2, 3, 4, 5, 6, 0];
  return order.map((weekday) => ({
    weekday,
    name: WEEKDAY_NAMES[weekday],
    ranges: hours
      .filter((r) => r.weekday === weekday)
      .sort((a, b) => toMinutes(a.opensAt) - toMinutes(b.opensAt))
      .map((r) => `${r.opensAt} – ${r.closesAt}`),
  }));
}
```

- [ ] **Passo 5: rodar e ver passar**. Rodar `npx vitest run src/domain`. Esperado: PASSA.

- [ ] **Passo 6: commit.** `git add -A && git commit -m "feat(domain): horário de funcionamento com fuso e busca sem acentos"`

---

### Tarefa 4: dados iniciais (cardápio real) e fotos de desenvolvimento

**Arquivos:**
- Criar: `src/data/seed/menu.ts`, `public/menu-photos/.gitkeep`
- Copiar (não versionado): `public/menu-photos/batatao.jpg`, `public/menu-photos/batata-com-calabresa.jpg`
- Teste: `src/data/seed/menu.test.ts`

**Interfaces:**
- Consome: `Menu`, `Dish`, `menuSchema`, `cents`
- Produz: `seedMenu: Menu`, `PENDING_PRICE_SLUGS`, `OPENING_HOURS_ARE_PROVISIONAL`

- [ ] **Passo 1: escrever o teste que falha**, `src/data/seed/menu.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { countDishes, featuredDishes, findDish, menuSchema, priceSummary } from "@/domain/menu";
import { PENDING_PRICE_SLUGS, seedMenu } from "./menu";

describe("seedMenu (cardápio impresso transcrito)", () => {
  it("passa na validação do domínio", () => {
    expect(() => menuSchema.parse(seedMenu)).not.toThrow();
  });

  it("tem as 9 categorias, 56 itens e 4 promoções do impresso", () => {
    expect(seedMenu.categories.map((c) => c.slug)).toEqual([
      "porcoes-divinas", "para-compartilhar", "parmegianas", "pratos-com-frango", "carnes-e-peixe",
      "extras", "sobremesas", "bebidas", "cervejas-e-drinks",
    ]);
    expect(countDishes(seedMenu.categories)).toBe(56);
    expect(seedMenu.promotions).toHaveLength(4);
  });

  it("só os pratos com preço coberto no impresso ficam 'sob consulta'", () => {
    const semPreco = seedMenu.categories
      .flatMap((c) => c.dishes)
      .filter((d) => priceSummary(d).kind === "on-request")
      .map((d) => d.slug);
    expect(semPreco).toEqual([...PENDING_PRICE_SLUGS]);
  });

  it("destaques, selos e fotos de desenvolvimento", () => {
    expect(featuredDishes(seedMenu.categories).map((d) => d.slug)).toEqual([
      "batata-frita-com-calabresa", "divina-porcao", "batatao-divino", "parmegiana-de-frango",
    ]);
    expect(findDish(seedMenu.categories, "parmegiana-de-berinjela")?.dish.tags).toEqual(["vegetariano"]);
    expect(findDish(seedMenu.categories, "batatao-divino")?.dish.serves).toBe(3);
    const fotos = seedMenu.categories.flatMap((c) => c.dishes).flatMap((d) => (d.photo ? [d.photo.src] : []));
    expect(fotos.every((src) => src.startsWith("/menu-photos/"))).toBe(true);
  });

  it("restaurante no fuso de São Paulo e aviso do Banrisul", () => {
    expect(seedMenu.restaurant.timezone).toBe("America/Sao_Paulo");
    expect(seedMenu.restaurant.paymentNotes).toContain("Não aceitamos Banrisul.");
  });
});
```

- [ ] **Passo 2: rodar e ver falhar**. Rodar `npx vitest run src/data/seed`. Esperado: FALHA, "./menu" não encontrado.

- [ ] **Passo 3: implementar** `src/data/seed/menu.ts`

```ts
import type { Dish, Menu } from "@/domain/menu";
import { cents, type Cents } from "@/domain/money";

const brl = (reais: number): Cents => cents(Math.round(reais * 100));

/** Horários PROVISÓRIOS: o Google só confirma "abre sáb. às 11:00". Confirmar com a loja antes do lançamento. */
export const OPENING_HOURS_ARE_PROVISIONAL = true;

/** Preços cobertos por adesivo no cardápio impresso — aparecem como "Consulte o preço" até o dono informar. */
export const PENDING_PRICE_SLUGS = ["parmegiana-de-tilapia", "parmegiana-de-berinjela"] as const;

type DishInput = Pick<Dish, "slug" | "name"> & Partial<Dish>;
const dish = (d: DishInput): Dish => ({
  basePrice: null,
  variants: [],
  addons: [],
  tags: [],
  isAvailable: true,
  isFeatured: false,
  ...d,
});
const line = (label: string, reais: number) => ({ label, price: brl(reais) });

const ACOMP_PARM = "Acompanha arroz branco ou integral e batata frita, batata palha ou legumes.";
const ACOMP_FEIJAO = "Acompanha feijão carioca, preto ou lentilha; arroz branco ou integral; e batata frita ou palha.";

export const seedMenu: Menu = {
  restaurant: {
    name: "Divino Fogão",
    tagline: "Comida da Fazenda · São Leopoldo",
    address: "Bourbon Shopping São Leopoldo · R. Primeiro de Março, 821 · Centro, São Leopoldo/RS",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Divino+Fog%C3%A3o+Bourbon+Shopping+S%C3%A3o+Leopoldo",
    timezone: "America/Sao_Paulo",
    prepTimeMinutes: 20,
    paymentMethods: ["Pix", "Visa", "Mastercard", "Elo", "Hipercard", "American Express", "VR", "Alelo", "Sodexo", "Pluxee", "Ticket", "GreenCard", "Aproximação"],
    paymentNotes: ["Não aceitamos Banrisul."],
    notes: ["Todos os pratos acompanham salada de tomate, alface e cenoura."],
  },
  openingHours: [
    ...[1, 2, 3, 4, 5, 6].map((weekday) => ({ weekday, opensAt: "11:00", closesAt: "22:00" })),
    { weekday: 0, opensAt: "11:00", closesAt: "21:00" },
  ],
  categories: [
    {
      slug: "porcoes-divinas",
      name: "Porções Divinas",
      displayStyle: "rows",
      dishes: [
        dish({ slug: "pao-de-alho", name: "Pão de alho", variants: [line("3 unidades", 18.9), line("1 unidade", 6.9)] }),
        dish({ slug: "batata-frita", name: "Batata frita", variants: [line("Pequena", 29.9), line("Grande", 42.9)] }),
        dish({ slug: "polenta-frita", name: "Polenta frita", basePrice: brl(27.9) }),
        dish({ slug: "ovo-de-codorna-com-oregano", name: "Ovo de codorna com orégano", basePrice: brl(35.9) }),
        dish({ slug: "tomatinho-cereja", name: "Tomatinho cereja", description: "Temperado com sal, azeite de oliva e orégano.", basePrice: brl(35.9) }),
        dish({ slug: "pepino-em-conserva", name: "Pepino em conserva", basePrice: brl(35.9) }),
        dish({ slug: "aneis-de-cebola", name: "Anéis de cebola", basePrice: brl(35.9) }),
        dish({ slug: "calabresa-grelhada", name: "Calabresa grelhada", description: "Acebolada.", basePrice: brl(35.9) }),
        dish({ slug: "tiras-de-file-de-frango", name: "Tiras de filé de frango grelhado", description: "Aceboladas.", basePrice: brl(35.9) }),
        dish({ slug: "tiras-de-alcatra", name: "Tiras de alcatra grelhada", description: "Aceboladas.", basePrice: brl(51.9) }),
      ],
    },
    {
      slug: "para-compartilhar",
      name: "Para Compartilhar",
      displayStyle: "rows",
      dishes: [
        dish({
          slug: "porcao-dupla",
          name: "Porção dupla",
          description:
            "Escolha 2 opções diferentes: batata frita, polenta frita, pão de alho, ovo de codorna, pepino em conserva, calabresa acebolada, iscas de frango aceboladas, iscas de alcatra aceboladas, tomatinho cereja ou anéis de cebola.",
          basePrice: brl(39.9),
          addons: [line("Opção com alcatra", 5)],
        }),
        dish({
          slug: "batata-frita-com-calabresa",
          name: "Batata frita com calabresa",
          basePrice: brl(39),
          addons: [line("Opção com alcatra", 5), line("Farofinha", 5), line("Cebolado extra", 5)],
          photo: { src: "/menu-photos/batata-com-calabresa.jpg", alt: "Porção de batata frita com calabresa" },
          isFeatured: true,
        }),
        dish({
          slug: "divina-porcao",
          name: "Divina Porção",
          description:
            "Batata frita, pão de alho, iscas de alcatra, iscas de frango, calabresa acebolada, tomatinho cereja, ovinho de codorna com orégano, pepino e queijo coalho.",
          basePrice: brl(89.9),
          serves: 3,
          isFeatured: true,
        }),
        dish({
          slug: "batatao-divino",
          name: "Batatão Divino",
          description:
            "Escolha os recheios: cheddar, barbecue, calabresa ou muçarela; estrogonofe de frango com batata palha; ou estrogonofe de carne com batata palha. Ganhe 1 chopp 400 ml.",
          basePrice: brl(89.9),
          serves: 3,
          photo: { src: "/menu-photos/batatao.jpg", alt: "Batatão Divino coberto de cheddar, servido com chopp" },
          isFeatured: true,
        }),
      ],
    },
    {
      slug: "parmegianas",
      name: "Parmegianas",
      displayStyle: "rows",
      dishes: [
        dish({ slug: "parmegiana-de-frango", name: "Parmegiana de frango", description: `Molho artesanal. ${ACOMP_PARM}`, basePrice: brl(45.9), isFeatured: true }),
        dish({ slug: "parmegiana-de-tilapia", name: "Parmegiana de tilápia", description: `Molho artesanal. ${ACOMP_PARM}` }),
        dish({ slug: "parmegiana-de-alcatra", name: "Parmegiana de alcatra", description: `Molho artesanal. ${ACOMP_PARM}`, basePrice: brl(47.9) }),
        dish({ slug: "parmegiana-de-berinjela", name: "Parmegiana de berinjela", description: `Molho artesanal. ${ACOMP_PARM}`, tags: ["vegetariano"] }),
      ],
    },
    {
      slug: "pratos-com-frango",
      name: "Frango",
      displayStyle: "rows",
      dishes: [
        dish({ slug: "file-de-frango-grelhado", name: "Filé de frango grelhado", description: ACOMP_FEIJAO, basePrice: brl(39.9), addons: [line("À milanesa", 3)] }),
        dish({ slug: "estrogonofe-de-frango", name: "Estrogonofe de frango", description: ACOMP_PARM, basePrice: brl(41.9) }),
        dish({ slug: "file-de-frango-com-legumes", name: "Filé de frango com legumes", description: "Acompanha feijão carioca, preto ou lentilha e arroz branco ou integral.", basePrice: brl(39.9) }),
      ],
    },
    {
      slug: "carnes-e-peixe",
      name: "Carnes e Peixe",
      displayStyle: "rows",
      dishes: [
        dish({ slug: "alcatra-a-cavalo", name: "Alcatra à cavalo à la minuta", description: `Com ovo frito. ${ACOMP_FEIJAO}`, basePrice: brl(45.9) }),
        dish({ slug: "alcatra-grelhada", name: "Alcatra grelhada", description: ACOMP_FEIJAO, basePrice: brl(43.9) }),
        dish({ slug: "tilapia-grelhada", name: "Tilápia grelhada", description: ACOMP_PARM, basePrice: brl(47.9), addons: [line("À milanesa", 3)] }),
      ],
    },
    {
      slug: "extras",
      name: "Extras",
      displayStyle: "compact",
      dishes: [
        dish({ slug: "arroz-branco", name: "Arroz branco", basePrice: brl(9.9) }),
        dish({ slug: "arroz-integral", name: "Arroz integral", basePrice: brl(11.9) }),
        dish({ slug: "batata-frita-na-caixinha", name: "Batata frita na caixinha", basePrice: brl(11.9) }),
        dish({ slug: "alcatra-extra", name: "Alcatra (100–120 g)", basePrice: brl(15.9) }),
        dish({ slug: "ovo-frito", name: "Ovo frito (1 unidade)", basePrice: brl(3.9) }),
        dish({ slug: "polenta-frita-pequena", name: "Polenta frita (pequena)", basePrice: brl(11.9) }),
        dish({ slug: "legumes", name: "Legumes", basePrice: brl(11.9) }),
        dish({ slug: "feijao-carioca", name: "Feijão carioca", basePrice: brl(11.9) }),
        dish({ slug: "feijao-preto", name: "Feijão preto", basePrice: brl(11.9) }),
        dish({ slug: "lentilha", name: "Lentilha", basePrice: brl(13.9) }),
        dish({ slug: "file-de-frango-extra", name: "Filé de frango (100–120 g)", basePrice: brl(13.9) }),
        dish({ slug: "pure-de-batata", name: "Purê de batata", basePrice: brl(11.9) }),
        dish({ slug: "tilapia-extra", name: "Tilápia grelhada (100–120 g)", basePrice: brl(17.9) }),
        dish({ slug: "maionese", name: "Maionese (300 g)", basePrice: brl(13.9) }),
      ],
    },
    {
      slug: "sobremesas",
      name: "Sobremesas",
      displayStyle: "compact",
      dishes: [
        dish({ slug: "mousse-de-maracuja", name: "Mousse de maracujá", basePrice: brl(9.9) }),
        dish({ slug: "mousse-de-limao", name: "Mousse de limão", basePrice: brl(9.9) }),
        dish({ slug: "fatia-de-pudim", name: "Fatia de pudim", basePrice: brl(9.9) }),
      ],
    },
    {
      slug: "bebidas",
      name: "Bebidas",
      displayStyle: "compact",
      dishes: [
        dish({ slug: "refrigerante", name: "Refrigerante", variants: [line("Lata", 9.5), line("600 ml", 13.5)] }),
        dish({ slug: "suco-del-valle", name: "Suco Del Valle (lata)", basePrice: brl(9.5) }),
        dish({ slug: "agua-tonica", name: "Água tônica", basePrice: brl(9.5) }),
        dish({ slug: "schweppes-citrus", name: "Schweppes Citrus", basePrice: brl(9.5) }),
        dish({ slug: "cha-gelado", name: "Chá gelado (copo)", basePrice: brl(9.9) }),
        dish({ slug: "agua-mineral", name: "Água mineral 500 ml", basePrice: brl(7.5) }),
        dish({ slug: "suco-de-laranja", name: "Suco de laranja natural", variants: [line("200 ml", 9), line("300 ml", 11), line("500 ml", 13)] }),
      ],
    },
    {
      slug: "cervejas-e-drinks",
      name: "Cervejas e Drinks",
      displayStyle: "compact",
      dishes: [
        dish({ slug: "chopp", name: "Chopp", variants: [line("400 ml", 19), line("770 ml", 29)] }),
        dish({ slug: "cerveja-long-neck", name: "Cerveja long neck", basePrice: brl(15) }),
        dish({ slug: "cerveja-lata", name: "Cerveja lata", basePrice: brl(11) }),
        dish({ slug: "cerveja-latao", name: "Cerveja latão 473 ml", basePrice: brl(16) }),
        dish({ slug: "caipirinha-de-cachaca", name: "Caipirinha de cachaça", basePrice: brl(25) }),
        dish({ slug: "caipirinha-de-vodka", name: "Caipirinha de vodka", basePrice: brl(29) }),
        dish({ slug: "cachaca-mineira", name: "Cachaça mineira (dose)", basePrice: brl(11) }),
        dish({ slug: "whisky-importado", name: "Whisky importado (dose)", basePrice: brl(19) }),
      ],
    },
  ],
  promotions: [
    { slug: "prato-mais-bebida", title: "Prato + bebida", description: "Na compra de qualquer prato, leve um refrigerante lata ou uma água mineral 500 ml.", highlight: "+ R$ 5,90" },
    { slug: "tres-chopps-com-fritas", title: "3 chopps + fritas", description: "Na compra de 3 chopps 400 ml, acrescente R$ 2,00 e ganhe uma mini porção de batata frita.", highlight: "+ R$ 2,00" },
    { slug: "caipirinha-com-long-neck", title: "Caipirinha + long neck", description: "Na compra de uma caipirinha, ganhe 1 cerveja long neck (Stella Artois ou Budweiser).", highlight: "Long neck grátis" },
    { slug: "sobremesa-terceira-gratis", title: "Sobremesas", description: "Na compra de duas sobremesas, a terceira é grátis.", highlight: "3ª grátis" },
  ],
};
```

- [ ] **Passo 4: copiar as fotos de desenvolvimento, que ficam fora do git**

```bash
SCR="C:/Users/maxue/AppData/Local/Temp/claude/c--Users-maxue-OneDrive-Desktop-app-bar/16b5a2a4-3137-450b-bfc0-3c8805bb9c03/scratchpad/maps"
mkdir -p public/menu-photos && touch public/menu-photos/.gitkeep
cp "$SCR/p04.jpg" public/menu-photos/batatao.jpg && cp "$SCR/p03.jpg" public/menu-photos/batata-com-calabresa.jpg
git check-ignore public/menu-photos/batatao.jpg   # deve imprimir o caminho (ignorado)
```

- [ ] **Passo 5: rodar e ver passar**. Rodar `npx vitest run src/data/seed`. Esperado: PASSA.

- [ ] **Passo 6: commit.** `git add -A && git commit -m "feat(data): cardápio real transcrito do impresso como seed"`

---

### Tarefa 5: `lib/env`, contrato do repositório e `SeedMenuRepository`

**Arquivos:**
- Criar: `src/lib/env.ts`, `src/data/menu-repository.ts`, `src/data/menu-repository.contract.ts`, `src/data/seed/seed-menu-repository.ts`
- Teste: `src/lib/env.test.ts`, `src/data/seed/seed-menu-repository.test.ts`

**Interfaces:**
- Produz:
  - `type Env = { MENU_SOURCE: "seed" } | { MENU_SOURCE: "supabase"; SUPABASE_URL: string; SUPABASE_ANON_KEY: string }`
  - `readEnv(source?: Record<string, string | undefined>): Env`
  - `interface MenuRepository { getMenu(): Promise<Menu> }`
  - `describeMenuRepositoryContract(name, make)`
  - `class SeedMenuRepository`

- [ ] **Passo 1: escrever os testes que falham**

`src/lib/env.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { readEnv } from "./env";

describe("readEnv", () => {
  it("usa seed quando nada está configurado", () => {
    expect(readEnv({})).toEqual({ MENU_SOURCE: "seed" });
  });

  it("exige URL e chave quando a fonte é supabase", () => {
    expect(() => readEnv({ MENU_SOURCE: "supabase" })).toThrow();
    expect(readEnv({ MENU_SOURCE: "supabase", SUPABASE_URL: "https://abc.supabase.co", SUPABASE_ANON_KEY: "chave" })).toEqual({
      MENU_SOURCE: "supabase",
      SUPABASE_URL: "https://abc.supabase.co",
      SUPABASE_ANON_KEY: "chave",
    });
  });

  it("rejeita fonte desconhecida", () => {
    expect(() => readEnv({ MENU_SOURCE: "planilha" })).toThrow();
  });
});
```

`src/data/seed/seed-menu-repository.test.ts`:
```ts
import { describeMenuRepositoryContract } from "../menu-repository.contract";
import { SeedMenuRepository } from "./seed-menu-repository";

describeMenuRepositoryContract("SeedMenuRepository", () => new SeedMenuRepository());
```

- [ ] **Passo 2: rodar e ver falhar**. Rodar `npx vitest run src/lib src/data`. Esperado: FALHA, módulos não encontrados.

- [ ] **Passo 3: implementar**

`src/lib/env.ts`:
```ts
import { z } from "zod";

const envSchema = z.discriminatedUnion("MENU_SOURCE", [
  z.object({ MENU_SOURCE: z.literal("seed") }),
  z.object({ MENU_SOURCE: z.literal("supabase"), SUPABASE_URL: z.url(), SUPABASE_ANON_KEY: z.string().min(1) }),
]);
export type Env = z.infer<typeof envSchema>;

export function readEnv(source: Record<string, string | undefined> = process.env): Env {
  return envSchema.parse({ ...source, MENU_SOURCE: source.MENU_SOURCE || "seed" });
}
```

`src/data/menu-repository.ts`:
```ts
import type { Menu } from "@/domain/menu";

/** Contrato que as telas usam. Implementações: seed (padrão) e supabase (preparada). */
export interface MenuRepository {
  getMenu(): Promise<Menu>;
}
```

`src/data/menu-repository.contract.ts`:
```ts
import { describe, expect, it } from "vitest";
import { menuSchema } from "@/domain/menu";
import type { MenuRepository } from "./menu-repository";

/** Bateria compartilhada: toda implementação de MenuRepository precisa passar. */
export function describeMenuRepositoryContract(name: string, make: () => MenuRepository) {
  describe(`${name} — contrato MenuRepository`, () => {
    it("devolve um Menu válido pelo schema do domínio", async () => {
      const menu = await make().getMenu();
      expect(() => menuSchema.parse(menu)).not.toThrow();
    });

    it("toda categoria tem pelo menos um prato", async () => {
      const menu = await make().getMenu();
      expect(menu.categories.length).toBeGreaterThan(0);
      for (const category of menu.categories) expect(category.dishes.length).toBeGreaterThan(0);
    });

    it("todos os preços estão em centavos inteiros e positivos", async () => {
      const menu = await make().getMenu();
      const prices = menu.categories.flatMap((c) =>
        c.dishes.flatMap((d) => [d.basePrice, ...d.variants.map((v) => v.price), ...d.addons.map((a) => a.price)]),
      );
      for (const price of prices) {
        if (price === null) continue;
        expect(Number.isInteger(price)).toBe(true);
        expect(price).toBeGreaterThan(0);
      }
    });

    it("é estável entre chamadas", async () => {
      const repo = make();
      expect(await repo.getMenu()).toEqual(await repo.getMenu());
    });
  });
}
```

`src/data/seed/seed-menu-repository.ts`:
```ts
import { menuSchema, type Menu } from "@/domain/menu";
import type { MenuRepository } from "../menu-repository";
import { seedMenu } from "./menu";

export class SeedMenuRepository implements MenuRepository {
  async getMenu(): Promise<Menu> {
    return menuSchema.parse(seedMenu);
  }
}
```

- [ ] **Passo 4: rodar e ver passar**. Rodar `npx vitest run src/lib src/data && npm run lint`. Esperado: PASSA.

- [ ] **Passo 5: commit.** `git add -A && git commit -m "feat(data): contrato MenuRepository, SeedMenuRepository e env validado"`

---

### Tarefa 6: Supabase preparado (migration, repositório, seed.sql e fábrica), sem aplicar nada

**Arquivos:**
- Criar:
  - `supabase/migrations/20260926120000_menu_schema.sql`
  - `src/data/supabase/rows.ts`, `src/data/supabase/map-menu-rows.ts`, `src/data/supabase/supabase-menu-repository.ts`, `src/data/supabase/__fixtures__/menu-rows.ts`
  - `src/data/supabase/seed-sql.ts`, `scripts/generate-seed-sql.ts`, `supabase/seed.sql` (gerado)
  - `src/data/get-menu-repository.ts`
- Teste: `src/data/supabase/supabase-menu-repository.test.ts`, `src/data/supabase/seed-sql.test.ts`, `src/data/get-menu-repository.test.ts`

**Interfaces:**
- Consome: `Menu`, `menuSchema`, `toCents`, `MenuRepository`, `Env`, `seedMenu`, `SeedMenuRepository`
- Produz:
  - `type PhotoUrl = (path: string) => string`
  - `mapMenuRows(input: unknown, photoUrl: PhotoUrl): Menu`
  - `interface MenuRowsSource { fetchRows(): Promise<unknown> }`
  - `class SupabaseMenuRowsSource`, `class SupabaseMenuRepository(source, photoUrl)`
  - `supabasePhotoUrl(baseUrl): PhotoUrl`
  - `createSupabaseMenuRepository({ url, anonKey })`
  - `buildSeedSql(menu): string`
  - `getMenuRepository(env?): MenuRepository`

- [ ] **Passo 1: escrever a migration**, `supabase/migrations/20260926120000_menu_schema.sql` (⛔ só arquivo, nunca aplicar)

```sql
-- Cardápio Divino Fogão — schema da parte 1 (leitura pública).
-- ⚠️ NÃO APLICAR em nenhum projeto remoto sem autorização explícita do dono do projeto.

create extension if not exists moddatetime schema extensions;

create table public.restaurant (
  id boolean primary key default true check (id),
  name text not null,
  tagline text not null,
  address text not null,
  maps_url text not null,
  timezone text not null default 'America/Sao_Paulo',
  prep_time_minutes smallint not null check (prep_time_minutes > 0),
  payment_methods text[] not null default '{}',
  payment_notes text[] not null default '{}',
  notes text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table public.opening_hours (
  id bigint generated always as identity primary key,
  weekday smallint not null check (weekday between 0 and 6),
  opens_at time not null,
  closes_at time not null
);

create table public.categories (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null,
  display_style text not null default 'rows' check (display_style in ('rows', 'compact')),
  position int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.dishes (
  id bigint generated always as identity primary key,
  category_id bigint not null references public.categories (id) on delete restrict,
  slug text not null unique,
  name text not null,
  description text,
  base_price numeric(10, 2) check (base_price > 0),
  photo_path text,
  serves smallint check (serves > 0),
  tags text[] not null default '{}' check (tags <@ array['vegetariano', 'mais_pedido']::text[]),
  is_available boolean not null default true,
  is_featured boolean not null default false,
  is_visible boolean not null default true,
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index dishes_category_id_idx on public.dishes (category_id);

create table public.dish_variants (
  id bigint generated always as identity primary key,
  dish_id bigint not null references public.dishes (id) on delete cascade,
  label text not null,
  price numeric(10, 2) not null check (price > 0),
  position int not null default 0
);
create index dish_variants_dish_id_idx on public.dish_variants (dish_id);

create table public.dish_addons (
  id bigint generated always as identity primary key,
  dish_id bigint not null references public.dishes (id) on delete cascade,
  label text not null,
  price numeric(10, 2) not null check (price > 0),
  position int not null default 0
);
create index dish_addons_dish_id_idx on public.dish_addons (dish_id);

create table public.promotions (
  id bigint generated always as identity primary key,
  slug text not null unique,
  title text not null,
  description text,
  highlight text,
  photo_path text,
  dish_id bigint references public.dishes (id) on delete set null,
  is_active boolean not null default true,
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index promotions_dish_id_idx on public.promotions (dish_id);

create trigger restaurant_updated_at before update on public.restaurant
  for each row execute procedure extensions.moddatetime (updated_at);
create trigger categories_updated_at before update on public.categories
  for each row execute procedure extensions.moddatetime (updated_at);
create trigger dishes_updated_at before update on public.dishes
  for each row execute procedure extensions.moddatetime (updated_at);
create trigger promotions_updated_at before update on public.promotions
  for each row execute procedure extensions.moddatetime (updated_at);

-- Privilégio mínimo: o público só lê. Escritas chegam na parte 2 (painel do dono).
revoke all on public.restaurant, public.opening_hours, public.categories, public.dishes,
  public.dish_variants, public.dish_addons, public.promotions from anon, authenticated;
grant select on public.restaurant, public.opening_hours, public.categories, public.dishes,
  public.dish_variants, public.dish_addons, public.promotions to anon, authenticated;

alter table public.restaurant enable row level security;
alter table public.opening_hours enable row level security;
alter table public.categories enable row level security;
alter table public.dishes enable row level security;
alter table public.dish_variants enable row level security;
alter table public.dish_addons enable row level security;
alter table public.promotions enable row level security;

create policy "restaurant: leitura pública" on public.restaurant
  for select to anon, authenticated using (true);
create policy "opening_hours: leitura pública" on public.opening_hours
  for select to anon, authenticated using (true);
create policy "categories: leitura pública das visíveis" on public.categories
  for select to anon, authenticated using (is_visible);
create policy "dishes: leitura pública dos visíveis" on public.dishes
  for select to anon, authenticated using (is_visible);
create policy "dish_variants: leitura pública de pratos visíveis" on public.dish_variants
  for select to anon, authenticated
  using (exists (select 1 from public.dishes d where d.id = dish_id and d.is_visible));
create policy "dish_addons: leitura pública de pratos visíveis" on public.dish_addons
  for select to anon, authenticated
  using (exists (select 1 from public.dishes d where d.id = dish_id and d.is_visible));
create policy "promotions: leitura pública das ativas" on public.promotions
  for select to anon, authenticated using (is_active);

-- Fotos: bucket público para leitura; sem política de escrita nesta parte.
insert into storage.buckets (id, name, public)
values ('menu-photos', 'menu-photos', true)
on conflict (id) do nothing;
```

- [ ] **Passo 2: criar os dados de exemplo no formato do PostgREST**, `src/data/supabase/__fixtures__/menu-rows.ts`

```ts
/** Linhas como o PostgREST devolve: numeric pode vir como string, time com segundos, ordem embaralhada. */
export const menuRowsFixture = {
  restaurant: {
    name: "Divino Fogão",
    tagline: "Comida da Fazenda · São Leopoldo",
    address: "R. Primeiro de Março, 821",
    maps_url: "https://www.google.com/maps/search/?api=1&query=Divino",
    timezone: "America/Sao_Paulo",
    prep_time_minutes: 20,
    payment_methods: ["Pix"],
    payment_notes: ["Não aceitamos Banrisul."],
    notes: [],
  },
  openingHours: [{ weekday: 6, opens_at: "11:00:00", closes_at: "22:00:00" }],
  categories: [
    {
      slug: "parmegianas",
      name: "Parmegianas",
      display_style: "rows",
      position: 2,
      is_visible: true,
      dishes: [
        {
          slug: "parmegiana-de-frango",
          name: "Parmegiana de frango",
          description: null,
          base_price: 45.9,
          photo_path: "parmegiana frango.jpg",
          serves: null,
          tags: [],
          is_available: true,
          is_featured: true,
          is_visible: true,
          position: 0,
          dish_variants: [],
          dish_addons: [],
        },
      ],
    },
    {
      slug: "porcoes",
      name: "Porções",
      display_style: "rows",
      position: 1,
      is_visible: true,
      dishes: [
        {
          slug: "batata-frita",
          name: "Batata frita",
          description: "Crocante.",
          base_price: null,
          photo_path: null,
          serves: 2,
          tags: ["mais_pedido"],
          is_available: false,
          is_featured: false,
          is_visible: true,
          position: 1,
          dish_variants: [
            { label: "Grande", price: "42.90", position: 1 },
            { label: "Pequena", price: "29.90", position: 0 },
          ],
          dish_addons: [{ label: "Cheddar", price: "5.00", position: 0 }],
        },
        {
          slug: "prato-oculto",
          name: "Prato oculto",
          description: null,
          base_price: "10.00",
          photo_path: null,
          serves: null,
          tags: [],
          is_available: true,
          is_featured: false,
          is_visible: false,
          position: 0,
          dish_variants: [],
          dish_addons: [],
        },
      ],
    },
    { slug: "vazia", name: "Vazia", display_style: "compact", position: 3, is_visible: true, dishes: [] },
    { slug: "oculta", name: "Oculta", display_style: "rows", position: 0, is_visible: false, dishes: [] },
  ],
  promotions: [
    { slug: "inativa", title: "Inativa", description: null, highlight: null, photo_path: null, is_active: false, position: 0, dish: null },
    { slug: "aponta-oculto", title: "Promo do oculto", description: null, highlight: "Grátis", photo_path: null, is_active: true, position: 2, dish: { slug: "prato-oculto" } },
    { slug: "batata", title: "Batata", description: "Leve 2", highlight: null, photo_path: "promo.jpg", is_active: true, position: 1, dish: { slug: "batata-frita" } },
  ],
};
```

- [ ] **Passo 3: escrever os testes que falham**

`src/data/supabase/supabase-menu-repository.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { describeMenuRepositoryContract } from "../menu-repository.contract";
import { menuRowsFixture } from "./__fixtures__/menu-rows";
import { mapMenuRows } from "./map-menu-rows";
import { SupabaseMenuRepository, supabasePhotoUrl, type MenuRowsSource } from "./supabase-menu-repository";

const photoUrl = supabasePhotoUrl("https://abc.supabase.co/");
const fakeSource = (rows: unknown = menuRowsFixture): MenuRowsSource => ({ fetchRows: async () => structuredClone(rows) });

describeMenuRepositoryContract("SupabaseMenuRepository (dados de exemplo)", () => new SupabaseMenuRepository(fakeSource(), photoUrl));

describe("mapMenuRows", () => {
  const menu = mapMenuRows(structuredClone(menuRowsFixture), photoUrl);

  it("esconde categorias e pratos ocultos e remove categorias que ficaram vazias", () => {
    expect(menu.categories.map((c) => c.slug)).toEqual(["porcoes", "parmegianas"]);
    expect(menu.categories[0]?.dishes.map((d) => d.slug)).toEqual(["batata-frita"]);
  });

  it("ordena variações por posição e converte numeric em centavos", () => {
    const batata = menu.categories[0]?.dishes[0];
    expect(batata?.variants).toEqual([{ label: "Pequena", price: 2990 }, { label: "Grande", price: 4290 }]);
    expect(batata?.addons).toEqual([{ label: "Cheddar", price: 500 }]);
    expect(menu.categories[1]?.dishes[0]?.basePrice).toBe(4590);
  });

  it("monta a URL pública da foto e troca null por ausência", () => {
    expect(menu.categories[1]?.dishes[0]?.photo).toEqual({
      src: "https://abc.supabase.co/storage/v1/object/public/menu-photos/parmegiana%20frango.jpg",
      alt: "Parmegiana de frango",
    });
    expect(menu.categories[0]?.dishes[0]?.photo).toBeUndefined();
    expect(menu.categories[0]?.dishes[0]?.isAvailable).toBe(false);
  });

  it("corta os segundos do horário", () => {
    expect(menu.openingHours).toEqual([{ weekday: 6, opensAt: "11:00", closesAt: "22:00" }]);
  });

  it("omite promoções inativas e desliga o vínculo com prato oculto", () => {
    expect(menu.promotions.map((p) => p.slug)).toEqual(["batata", "aponta-oculto"]);
    expect(menu.promotions[0]?.dishSlug).toBe("batata-frita");
    expect(menu.promotions[1]?.dishSlug).toBeUndefined();
  });

  it("falha alto com dados inválidos (nunca renderiza cardápio pela metade)", () => {
    const quebrado = structuredClone(menuRowsFixture);
    quebrado.categories[0]!.display_style = "grade";
    expect(() => mapMenuRows(quebrado, photoUrl)).toThrow();
  });
});
```

`src/data/supabase/seed-sql.test.ts`:
```ts
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { makeCategory, makeDish, makeMenu } from "@/test/fixtures";
import { cents } from "@/domain/money";
import { seedMenu } from "../seed/menu";
import { buildSeedSql } from "./seed-sql";

describe("buildSeedSql", () => {
  it("gera inserts com aspas escapadas, numeric em reais e arrays vazios", () => {
    const sql = buildSeedSql(
      makeMenu({
        categories: [
          makeCategory({
            dishes: [makeDish({ name: "Pão d'água", variants: [{ label: "Grande", price: cents(4290) }], photo: { src: "/menu-photos/x.jpg", alt: "x" } })],
          }),
        ],
      }),
    );
    expect(sql).toContain("truncate table public.promotions");
    expect(sql).toContain("'Pão d''água'");
    expect(sql).toContain("29.90");
    expect(sql).toContain("'Grande', 42.90");
    expect(sql).toContain("'x.jpg'");
    expect(sql).toContain("'{}'::text[]");
    expect(sql.trimEnd().endsWith("commit;")).toBe(true);
  });

  it("supabase/seed.sql está em dia com src/data/seed/menu.ts (rode npm run seed:sql)", () => {
    const onDisk = readFileSync(resolve(process.cwd(), "supabase/seed.sql"), "utf8").replace(/\r\n/g, "\n");
    expect(onDisk).toBe(buildSeedSql(seedMenu));
  });
});
```

`src/data/get-menu-repository.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { getMenuRepository } from "./get-menu-repository";
import { SeedMenuRepository } from "./seed/seed-menu-repository";
import { SupabaseMenuRepository } from "./supabase/supabase-menu-repository";

describe("getMenuRepository", () => {
  it("usa o seed por padrão", () => {
    expect(getMenuRepository({ MENU_SOURCE: "seed" })).toBeInstanceOf(SeedMenuRepository);
  });

  it("monta o repositório Supabase quando configurado (sem acessar a rede)", () => {
    const repo = getMenuRepository({ MENU_SOURCE: "supabase", SUPABASE_URL: "https://abc.supabase.co", SUPABASE_ANON_KEY: "chave" });
    expect(repo).toBeInstanceOf(SupabaseMenuRepository);
  });
});
```

- [ ] **Passo 4: rodar e ver falhar**. Rodar `npx vitest run src/data`. Esperado: FALHA, módulos não encontrados.

- [ ] **Passo 5: implementar**

`src/data/supabase/rows.ts`:
```ts
import { z } from "zod";
import { toCents } from "@/domain/money";

const money = z.union([z.number(), z.string()]).transform((v) => toCents(v));
const time = z
  .string()
  .regex(/^\d{2}:\d{2}(:\d{2})?$/)
  .transform((v) => v.slice(0, 5));

const lineRow = z.object({ label: z.string(), price: money, position: z.number() });

const dishRow = z.object({
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  base_price: money.nullable(),
  photo_path: z.string().nullable(),
  serves: z.number().nullable(),
  tags: z.array(z.string()),
  is_available: z.boolean(),
  is_featured: z.boolean(),
  is_visible: z.boolean(),
  position: z.number(),
  dish_variants: z.array(lineRow),
  dish_addons: z.array(lineRow),
});

export const menuRowsSchema = z.object({
  restaurant: z.object({
    name: z.string(),
    tagline: z.string(),
    address: z.string(),
    maps_url: z.string(),
    timezone: z.string(),
    prep_time_minutes: z.number(),
    payment_methods: z.array(z.string()),
    payment_notes: z.array(z.string()),
    notes: z.array(z.string()),
  }),
  openingHours: z.array(z.object({ weekday: z.number(), opens_at: time, closes_at: time })),
  categories: z.array(
    z.object({
      slug: z.string(),
      name: z.string(),
      display_style: z.string(),
      position: z.number(),
      is_visible: z.boolean(),
      dishes: z.array(dishRow),
    }),
  ),
  promotions: z.array(
    z.object({
      slug: z.string(),
      title: z.string(),
      description: z.string().nullable(),
      highlight: z.string().nullable(),
      photo_path: z.string().nullable(),
      is_active: z.boolean(),
      position: z.number(),
      dish: z.object({ slug: z.string() }).nullable(),
    }),
  ),
});
export type MenuRows = z.output<typeof menuRowsSchema>;
```

`src/data/supabase/map-menu-rows.ts`:
```ts
import { menuSchema, type Menu } from "@/domain/menu";
import { menuRowsSchema } from "./rows";

export type PhotoUrl = (path: string) => string;

const byPosition = <T extends { position: number }>(a: T, b: T) => a.position - b.position;
const lines = (rows: { label: string; price: number; position: number }[]) =>
  [...rows].sort(byPosition).map(({ label, price }) => ({ label, price }));

/** Converte as linhas do banco no Menu do domínio. Filtra ocultos/inativos, ordena e valida. */
export function mapMenuRows(input: unknown, photoUrl: PhotoUrl): Menu {
  const rows = menuRowsSchema.parse(input);

  const categories = rows.categories
    .filter((c) => c.is_visible)
    .sort(byPosition)
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      displayStyle: c.display_style,
      dishes: c.dishes
        .filter((d) => d.is_visible)
        .sort(byPosition)
        .map((d) => ({
          slug: d.slug,
          name: d.name,
          description: d.description ?? undefined,
          basePrice: d.base_price,
          variants: lines(d.dish_variants),
          addons: lines(d.dish_addons),
          photo: d.photo_path ? { src: photoUrl(d.photo_path), alt: d.name } : undefined,
          serves: d.serves ?? undefined,
          tags: d.tags,
          isAvailable: d.is_available,
          isFeatured: d.is_featured,
        })),
    }))
    .filter((c) => c.dishes.length > 0);

  const visibleDishes = new Set(categories.flatMap((c) => c.dishes.map((d) => d.slug)));

  return menuSchema.parse({
    restaurant: {
      name: rows.restaurant.name,
      tagline: rows.restaurant.tagline,
      address: rows.restaurant.address,
      mapsUrl: rows.restaurant.maps_url,
      timezone: rows.restaurant.timezone,
      prepTimeMinutes: rows.restaurant.prep_time_minutes,
      paymentMethods: rows.restaurant.payment_methods,
      paymentNotes: rows.restaurant.payment_notes,
      notes: rows.restaurant.notes,
    },
    openingHours: rows.openingHours.map((h) => ({ weekday: h.weekday, opensAt: h.opens_at, closesAt: h.closes_at })),
    categories,
    promotions: rows.promotions
      .filter((p) => p.is_active)
      .sort(byPosition)
      .map((p) => ({
        slug: p.slug,
        title: p.title,
        description: p.description ?? undefined,
        highlight: p.highlight ?? undefined,
        photo: p.photo_path ? { src: photoUrl(p.photo_path), alt: p.title } : undefined,
        dishSlug: p.dish && visibleDishes.has(p.dish.slug) ? p.dish.slug : undefined,
      })),
  });
}
```

`src/data/supabase/supabase-menu-repository.ts`:
```ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Menu } from "@/domain/menu";
import type { MenuRepository } from "../menu-repository";
import { mapMenuRows, type PhotoUrl } from "./map-menu-rows";

/** Porta de leitura das linhas cruas — permite testar o mapeamento sem rede. */
export interface MenuRowsSource {
  fetchRows(): Promise<unknown>;
}

const CATEGORY_SELECT =
  "slug, name, display_style, position, is_visible, dishes ( slug, name, description, base_price, photo_path, serves, tags, is_available, is_featured, is_visible, position, dish_variants ( label, price, position ), dish_addons ( label, price, position ) )";

export class SupabaseMenuRowsSource implements MenuRowsSource {
  constructor(private readonly client: SupabaseClient) {}

  async fetchRows(): Promise<unknown> {
    const [restaurant, openingHours, categories, promotions] = await Promise.all([
      this.client
        .from("restaurant")
        .select("name, tagline, address, maps_url, timezone, prep_time_minutes, payment_methods, payment_notes, notes")
        .single(),
      this.client.from("opening_hours").select("weekday, opens_at, closes_at"),
      this.client.from("categories").select(CATEGORY_SELECT),
      this.client.from("promotions").select("slug, title, description, highlight, photo_path, is_active, position, dish:dishes ( slug )"),
    ]);
    for (const result of [restaurant, openingHours, categories, promotions]) {
      if (result.error) throw new Error(`Supabase: ${result.error.message}`);
    }
    return {
      restaurant: restaurant.data,
      openingHours: openingHours.data,
      categories: categories.data,
      promotions: promotions.data,
    };
  }
}

export class SupabaseMenuRepository implements MenuRepository {
  constructor(
    private readonly source: MenuRowsSource,
    private readonly photoUrl: PhotoUrl,
  ) {}

  async getMenu(): Promise<Menu> {
    return mapMenuRows(await this.source.fetchRows(), this.photoUrl);
  }
}

export function supabasePhotoUrl(baseUrl: string): PhotoUrl {
  const base = baseUrl.replace(/\/+$/, "");
  return (path) => `${base}/storage/v1/object/public/menu-photos/${path.split("/").map(encodeURIComponent).join("/")}`;
}

export function createSupabaseMenuRepository(config: { url: string; anonKey: string }): SupabaseMenuRepository {
  const client = createClient(config.url, config.anonKey, { auth: { persistSession: false } });
  return new SupabaseMenuRepository(new SupabaseMenuRowsSource(client), supabasePhotoUrl(config.url));
}
```

`src/data/supabase/seed-sql.ts`:
```ts
import type { Menu } from "@/domain/menu";

const q = (value: string | null | undefined) => (value == null ? "null" : `'${value.replace(/'/g, "''")}'`);
const money = (value: number | null) => (value === null ? "null" : (value / 100).toFixed(2));
const textArray = (values: string[]) => (values.length ? `array[${values.map(q).join(", ")}]::text[]` : "'{}'::text[]");
const photoPath = (src: string | undefined) => (src ? src.replace(/^\/menu-photos\//, "") : null);

/** Gera supabase/seed.sql a partir do seed do domínio (fonte única dos dados). */
export function buildSeedSql(menu: Menu): string {
  const r = menu.restaurant;
  const out: string[] = [
    "-- GERADO por scripts/generate-seed-sql.ts a partir de src/data/seed/menu.ts. Não edite à mão.",
    "-- ⚠️ Não aplicar em nenhum projeto remoto sem autorização explícita do dono do projeto.",
    "begin;",
    "truncate table public.promotions, public.dish_addons, public.dish_variants, public.dishes, public.categories, public.opening_hours, public.restaurant restart identity cascade;",
    "",
    `insert into public.restaurant (name, tagline, address, maps_url, timezone, prep_time_minutes, payment_methods, payment_notes, notes) values (${[
      q(r.name), q(r.tagline), q(r.address), q(r.mapsUrl), q(r.timezone), String(r.prepTimeMinutes),
      textArray(r.paymentMethods), textArray(r.paymentNotes), textArray(r.notes),
    ].join(", ")});`,
    "",
  ];
  for (const h of menu.openingHours) {
    out.push(`insert into public.opening_hours (weekday, opens_at, closes_at) values (${h.weekday}, ${q(h.opensAt)}, ${q(h.closesAt)});`);
  }
  menu.categories.forEach((category, categoryIndex) => {
    out.push("");
    out.push(
      `insert into public.categories (slug, name, display_style, position) values (${q(category.slug)}, ${q(category.name)}, ${q(category.displayStyle)}, ${categoryIndex});`,
    );
    category.dishes.forEach((dish, dishIndex) => {
      out.push(
        `insert into public.dishes (category_id, slug, name, description, base_price, photo_path, serves, tags, is_available, is_featured, position) select id, ${[
          q(dish.slug), q(dish.name), q(dish.description), money(dish.basePrice), q(photoPath(dish.photo?.src)),
          dish.serves === undefined ? "null" : String(dish.serves), textArray(dish.tags), String(dish.isAvailable),
          String(dish.isFeatured), String(dishIndex),
        ].join(", ")} from public.categories where slug = ${q(category.slug)};`,
      );
      dish.variants.forEach((v, i) =>
        out.push(`insert into public.dish_variants (dish_id, label, price, position) select id, ${q(v.label)}, ${money(v.price)}, ${i} from public.dishes where slug = ${q(dish.slug)};`),
      );
      dish.addons.forEach((a, i) =>
        out.push(`insert into public.dish_addons (dish_id, label, price, position) select id, ${q(a.label)}, ${money(a.price)}, ${i} from public.dishes where slug = ${q(dish.slug)};`),
      );
    });
  });
  out.push("");
  menu.promotions.forEach((p, i) => {
    const dishId = p.dishSlug ? `(select id from public.dishes where slug = ${q(p.dishSlug)})` : "null";
    out.push(
      `insert into public.promotions (slug, title, description, highlight, photo_path, dish_id, position) values (${[
        q(p.slug), q(p.title), q(p.description), q(p.highlight), q(photoPath(p.photo?.src)), dishId, String(i),
      ].join(", ")});`,
    );
  });
  out.push("commit;");
  return `${out.join("\n")}\n`;
}
```

`scripts/generate-seed-sql.ts`:
```ts
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { seedMenu } from "../src/data/seed/menu";
import { buildSeedSql } from "../src/data/supabase/seed-sql";

const target = resolve(process.cwd(), "supabase/seed.sql");
writeFileSync(target, buildSeedSql(seedMenu), "utf8");
console.log(`seed.sql gerado em ${target} (não aplique em projeto remoto sem autorização)`);
```

`src/data/get-menu-repository.ts`:
```ts
import { readEnv, type Env } from "@/lib/env";
import type { MenuRepository } from "./menu-repository";
import { SeedMenuRepository } from "./seed/seed-menu-repository";
import { createSupabaseMenuRepository } from "./supabase/supabase-menu-repository";

export function getMenuRepository(env: Env = readEnv()): MenuRepository {
  switch (env.MENU_SOURCE) {
    case "supabase":
      return createSupabaseMenuRepository({ url: env.SUPABASE_URL, anonKey: env.SUPABASE_ANON_KEY });
    case "seed":
      return new SeedMenuRepository();
  }
}
```

- [ ] **Passo 6: gerar o seed.sql e rodar os testes**. Rodar `npm run seed:sql && npx vitest run src/data`. Esperado: PASSA, incluindo o teste de sincronia.

- [ ] **Passo 7: conferir que nada remoto foi tocado**. Rodar `git status --short supabase/`. Esperado: só `migrations/…sql` e `seed.sql` novos. Nenhum comando `supabase` foi executado.

- [ ] **Passo 8: commit.** `git add -A && git commit -m "feat(data): repositório Supabase preparado (migration, RLS, seed.sql) — nada aplicado"`

---

### Tarefa 7: tokens do tema A, layout e peças de `ui/`

**Arquivos:**
- Criar:
  - `src/styles/tokens.css`
  - `src/ui/chip.tsx`, `src/ui/dotted-price-row.tsx`, `src/ui/icon-button.tsx`, `src/ui/icons.tsx`, `src/ui/dish-photo.tsx`, `src/ui/sheet.tsx`, `src/ui/index.ts`
- Modificar: `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx` (vitrine provisória)
- Teste: `src/ui/dish-photo.test.tsx`, `src/ui/sheet.test.tsx`, `src/ui/dotted-price-row.test.tsx`

**Interfaces:**
- Produz:
  - `Chip({ children, tone?: "accent" | "success" | "neutral" | "brand" })`
  - `DottedPriceRow({ label, price, muted? })`
  - `IconButton({ label, children, ...buttonProps })`
  - Ícones `SearchIcon`, `InfoIcon`, `CloseIcon`, `ClockIcon`, `MapPinIcon`, `LeafIcon`, `UsersIcon`, `WifiOffIcon` (props `{ className? }`)
  - `DishPhoto({ photo?, sizes, className?, preload? })`
  - `Sheet({ open, onClose, labelledBy, children })`

- [ ] **Passo 1: escrever os testes que falham**

`src/ui/dish-photo.test.tsx`:
```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DishPhoto } from "./dish-photo";

describe("DishPhoto", () => {
  it("mostra a foto com texto alternativo", () => {
    render(<DishPhoto photo={{ src: "/menu-photos/x.jpg", alt: "Batatão" }} sizes="80px" />);
    expect(screen.getByAltText("Batatão")).toBeInTheDocument();
  });

  it("some sem deixar ícone quebrado quando a imagem falha", () => {
    const { container } = render(<DishPhoto photo={{ src: "/menu-photos/nao-existe.jpg", alt: "X" }} sizes="80px" />);
    fireEvent.error(screen.getByAltText("X"));
    expect(container).toBeEmptyDOMElement();
  });

  it("não renderiza nada sem foto", () => {
    const { container } = render(<DishPhoto sizes="80px" />);
    expect(container).toBeEmptyDOMElement();
  });
});
```

`src/ui/sheet.test.tsx`:
```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Sheet } from "./sheet";

const renderSheet = (open: boolean, onClose = vi.fn()) =>
  render(
    <Sheet open={open} onClose={onClose} labelledBy="titulo">
      <h2 id="titulo">Batatão Divino</h2>
    </Sheet>,
  );

describe("Sheet", () => {
  it("abre como diálogo nomeado pelo título", () => {
    renderSheet(true);
    expect(screen.getByRole("dialog", { name: "Batatão Divino" })).toHaveAttribute("open");
  });

  it("fica fechado quando open=false", () => {
    renderSheet(false);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("fecha pelo botão, pela tecla Esc (cancel) e pelo fundo", async () => {
    const onClose = vi.fn();
    renderSheet(true, onClose);
    await userEvent.click(screen.getByRole("button", { name: "Fechar" }));
    const dialog = screen.getByRole("dialog");
    fireEvent(dialog, new Event("cancel", { cancelable: true }));
    fireEvent.click(dialog);
    expect(onClose).toHaveBeenCalledTimes(3);
  });
});
```

`src/ui/dotted-price-row.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { DottedPriceRow } from "./dotted-price-row";

it("lê rótulo e preço sem anunciar o pontilhado", () => {
  const { container } = render(<DottedPriceRow label="Chopp 400 ml" price="R$ 19,00" />);
  expect(screen.getByText("Chopp 400 ml")).toBeInTheDocument();
  expect(screen.getByText("R$ 19,00")).toBeInTheDocument();
  expect(container.querySelector("[aria-hidden='true']")).not.toBeNull();
});
```

- [ ] **Passo 2: rodar e ver falhar**. Rodar `npx vitest run src/ui`. Esperado: FALHA, módulos não encontrados.

- [ ] **Passo 3: implementar os tokens e o CSS global**

`src/styles/tokens.css`:
```css
/* Tema A · Fazenda Contemporânea — tokens (contraste AA conferido sobre o creme) */
@theme {
  --color-bg: #f4eee4;
  --color-surface: #fbf7f1;
  --color-surface-muted: #efe6d8;
  --color-line: #e3d8ca;
  --color-line-strong: #c7b9aa;
  --color-ink: #2b1b17;
  --color-ink-muted: #6f5f55;
  --color-brand: #6b1d22;
  --color-brand-ink: #fbf7f1;
  --color-accent: #855a2e;
  --color-success: #2f6b45;
  --color-success-soft: #e1eedf;
  --radius-card: 16px;
  --radius-sheet: 26px;
}

@theme inline {
  --font-display: var(--font-fraunces), Georgia, "Times New Roman", serif;
  --font-sans: var(--font-manrope), system-ui, -apple-system, "Segoe UI", sans-serif;
}
```

`src/app/globals.css`:
```css
@import "tailwindcss";
@import "../styles/tokens.css";

:root {
  --sticky-offset: 112px;
  color-scheme: light;
}

html {
  scroll-behavior: smooth;
  -webkit-tap-highlight-color: transparent;
}

html:has(dialog[open]) {
  overflow: hidden;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}

.no-scrollbar {
  scrollbar-width: none;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

/* Painel inferior (<dialog> nativo) */
.sheet {
  position: fixed;
  inset: auto 0 0 0;
  margin: 0 auto;
  width: 100%;
  max-width: 36rem;
  height: calc(100dvh - 4.5rem);
  max-height: none;
  padding: 0;
  border: 0;
  border-radius: var(--radius-sheet) var(--radius-sheet) 0 0;
  background: var(--color-surface);
  color: var(--color-ink);
  overflow: hidden;
  box-shadow: 0 -10px 30px rgb(0 0 0 / 0.2);
}
.sheet[open] {
  animation: sheet-in 260ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
.sheet::backdrop {
  background: rgb(30 12 10 / 0.45);
  animation: fade-in 200ms ease-out;
}
@keyframes sheet-in {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@media (prefers-reduced-motion: reduce) {
  .sheet[open],
  .sheet::backdrop {
    animation: none;
  }
}
```

- [ ] **Passo 4: implementar as peças de `ui/`**

`src/ui/icons.tsx`:
```tsx
import type { ReactNode } from "react";

type IconProps = { className?: string };
const Svg = ({ className = "size-5", children }: IconProps & { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
    {children}
  </svg>
);

export const SearchIcon = (p: IconProps) => (
  <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Svg>
);
export const InfoIcon = (p: IconProps) => (
  <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" /></Svg>
);
export const CloseIcon = (p: IconProps) => (
  <Svg {...p}><path d="M6 6l12 12" /><path d="M18 6 6 18" /></Svg>
);
export const ClockIcon = (p: IconProps) => (
  <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>
);
export const MapPinIcon = (p: IconProps) => (
  <Svg {...p}><path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11Z" /><circle cx="12" cy="10" r="2.5" /></Svg>
);
export const LeafIcon = (p: IconProps) => (
  <Svg {...p}><path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14Z" /><path d="M5 19 13 11" /></Svg>
);
export const UsersIcon = (p: IconProps) => (
  <Svg {...p}><circle cx="9" cy="8" r="3" /><path d="M3 19c0-3.3 2.7-6 6-6s6 2.7 6 6" /><path d="M16 5.5a3 3 0 0 1 0 5.8" /><path d="M21 19c0-2.6-1.6-4.8-4-5.6" /></Svg>
);
export const WifiOffIcon = (p: IconProps) => (
  <Svg {...p}><path d="M3 3l18 18" /><path d="M8.5 16.5a5 5 0 0 1 7 0" /><path d="M5 12.5a10 10 0 0 1 5-2.7" /><path d="M14 9.8a10 10 0 0 1 5 2.7" /><path d="M12 20h.01" /></Svg>
);
```

`src/ui/chip.tsx`:
```tsx
import type { ReactNode } from "react";

export type ChipTone = "accent" | "success" | "neutral" | "brand";
const TONES: Record<ChipTone, string> = {
  accent: "bg-surface-muted text-accent",
  success: "bg-success-soft text-success",
  neutral: "border border-line-strong text-ink-muted",
  brand: "bg-brand text-brand-ink",
};

export function Chip({ children, tone = "accent" }: { children: ReactNode; tone?: ChipTone }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] leading-5 font-bold tracking-wide ${TONES[tone]}`}>
      {children}
    </span>
  );
}
```

`src/ui/dotted-price-row.tsx`:
```tsx
import type { ReactNode } from "react";

export function DottedPriceRow({ label, price, muted = false }: { label: ReactNode; price: string; muted?: boolean }) {
  return (
    <div className="flex items-baseline gap-2 py-1.5 text-[14px]">
      <span className={`min-w-0 ${muted ? "text-ink-muted" : "text-ink"}`}>{label}</span>
      <span aria-hidden="true" className="mb-1 min-w-4 flex-1 border-b border-dotted border-line-strong" />
      <span className={`shrink-0 font-bold tabular-nums ${muted ? "text-ink-muted line-through" : "text-brand"}`}>{price}</span>
    </div>
  );
}
```

`src/ui/icon-button.tsx`:
```tsx
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> & { label: string; children: ReactNode };

export function IconButton({ label, children, className = "", ...props }: Props) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-muted text-brand transition-colors hover:bg-line focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

`src/ui/dish-photo.tsx`:
```tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import type { Photo } from "@/domain/menu";

type Props = { photo?: Photo; sizes: string; className?: string; preload?: boolean };

/** Foto opcional: sem foto ou com erro, some e o layout sem foto assume. */
export function DishPhoto({ photo, sizes, className = "", preload = false }: Props) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  if (!photo || failed) return null;
  return (
    <div className={`relative overflow-hidden bg-surface-muted ${className}`}>
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes={sizes}
        preload={preload}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`object-cover transition-opacity duration-500 motion-reduce:transition-none ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
```

`src/ui/sheet.tsx`:
```tsx
"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { CloseIcon } from "./icons";

type Props = { open: boolean; onClose: () => void; labelledBy: string; children: ReactNode };
const DRAG_TO_CLOSE_PX = 96;

/** Painel inferior sobre <dialog> nativo: foco preso, Esc, fundo inerte e retorno de foco de graça. */
export function Sheet({ open, onClose, labelledBy, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const dragStart = useRef<number | null>(null);
  const [dragY, setDragY] = useState(0);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    dragStart.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragStart.current !== null) setDragY(Math.max(0, e.clientY - dragStart.current));
  };
  const onPointerUp = () => {
    if (dragY > DRAG_TO_CLOSE_PX) onClose();
    dragStart.current = null;
    setDragY(0);
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      className="sheet"
      style={dragY ? { transform: `translateY(${dragY}px)` } : undefined}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex h-full flex-col">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 z-20 flex h-7 cursor-grab touch-none justify-center pt-2"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <span className="h-1.5 w-10 rounded-full bg-line-strong/90" />
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-3 right-3 z-20 inline-flex size-11 items-center justify-center rounded-full bg-surface/90 text-brand shadow-sm backdrop-blur focus-visible:outline-2 focus-visible:outline-brand"
        >
          <CloseIcon />
        </button>
        <div className="h-full overflow-y-auto overscroll-contain">{open ? children : null}</div>
      </div>
    </dialog>
  );
}
```

`src/ui/index.ts`:
```ts
export { Chip, type ChipTone } from "./chip";
export { DishPhoto } from "./dish-photo";
export { DottedPriceRow } from "./dotted-price-row";
export { IconButton } from "./icon-button";
export { ClockIcon, CloseIcon, InfoIcon, LeafIcon, MapPinIcon, SearchIcon, UsersIcon, WifiOffIcon } from "./icons";
export { Sheet } from "./sheet";
```

- [ ] **Passo 5: layout com fontes e metadados, e vitrine provisória**

`src/app/layout.tsx`:
```tsx
import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", style: ["normal", "italic"], axes: ["opsz"], display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

const TITLE = "Cardápio · Divino Fogão São Leopoldo";
const DESCRIPTION =
  "Cardápio digital do Divino Fogão – Comida da Fazenda, no Bourbon Shopping São Leopoldo: porções, parmegianas, pratos, bebidas e promoções.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "Divino Fogão",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Divino Fogão" },
  formatDetection: { telephone: false },
  openGraph: { type: "website", locale: "pt_BR", siteName: "Divino Fogão · Cardápio", title: TITLE, description: DESCRIPTION },
};

export const viewport: Viewport = { themeColor: "#6b1d22", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${manrope.variable}`}>
      <body className="min-h-dvh bg-bg font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
```

`src/app/page.tsx` (vitrine provisória, substituída na Tarefa 11):
```tsx
import { getMenuRepository } from "@/data/get-menu-repository";

export default async function MenuPage() {
  const menu = await getMenuRepository().getMenu();
  return (
    <main className="mx-auto max-w-xl px-5 py-8">
      <p className="text-[11px] font-bold tracking-[0.22em] text-accent uppercase">{menu.restaurant.tagline}</p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-brand">{menu.restaurant.name}</h1>
      <ul className="mt-6 space-y-2">
        {menu.categories.map((c) => (
          <li key={c.slug} className="font-display text-xl">{c.name}</li>
        ))}
      </ul>
    </main>
  );
}
```

- [ ] **Passo 6: rodar os testes e verificar a página**. Rodar `npx vitest run src/ui && npm run lint && npm run typecheck && npm run build`. Esperado: tudo PASSA. Depois, `npm run dev` e `curl -s localhost:3000 | grep -c "Divino Fogão"`, que deve dar ≥ 1.

- [ ] **Passo 7: commit.** `git add -A && git commit -m "feat(ui): tokens do tema A, fontes, Sheet nativo e peças base"`

---

### Tarefa 8: feature `restaurant` (topo, status aberto/fechado e informações)

**Arquivos:**
- Criar: `src/lib/use-now.ts`, `src/features/restaurant/open-status.tsx`, `src/features/restaurant/restaurant-header.tsx`, `src/features/restaurant/info-sheet.tsx`, `src/features/restaurant/json-ld.ts`, `src/features/restaurant/index.ts`
- Teste: `src/features/restaurant/open-status.test.tsx`, `src/features/restaurant/info-sheet.test.tsx`, `src/features/restaurant/json-ld.test.ts`

**Interfaces:**
- Consome: `openStatus`, `formatOpenStatus`, `weeklySchedule`, `zonedMoment`, `Menu`, `Restaurant`, `OpeningRange`, `priceSummary`, `Sheet`, `Chip`, os ícones
- Produz: `useNow(): Date | null`; `OpenStatus({ hours, timeZone })`; `RestaurantHeader({ restaurant, openingHours })`; `InfoSheet({ open, onClose, restaurant, openingHours })`; `buildRestaurantJsonLd(menu, url?)`; `serializeJsonLd(value): string`

- [ ] **Passo 1: escrever os testes que falham**

`src/features/restaurant/open-status.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { seedMenu } from "@/data/seed/menu";
import { OpenStatus } from "./open-status";

const renderAt = (iso: string) => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(iso));
  render(<OpenStatus hours={seedMenu.openingHours} timeZone="America/Sao_Paulo" />);
};

describe("OpenStatus", () => {
  afterEach(() => vi.useRealTimers());

  it("mostra aberto com horário de fechamento", () => {
    renderAt("2026-09-26T15:30:00-03:00");
    expect(screen.getByText("Aberto agora · fecha às 22h")).toBeInTheDocument();
  });

  it("mostra quando abre se estiver fechado", () => {
    renderAt("2026-09-26T23:10:00-03:00");
    expect(screen.getByText("Fechado · abre amanhã às 11h")).toBeInTheDocument();
  });
});
```
(O teste importa `@/data/seed/menu` só como dado de apoio. Arquivos de teste não passam pela regra de camadas do ESLint: ver o passo 4.)

`src/features/restaurant/info-sheet.test.tsx`:
```tsx
import { render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { seedMenu } from "@/data/seed/menu";
import { InfoSheet } from "./info-sheet";

describe("InfoSheet", () => {
  afterEach(() => vi.useRealTimers());

  it("lista horários com o dia de hoje destacado, endereço, mapa e pagamento", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-26T15:30:00-03:00")); // sábado
    render(<InfoSheet open onClose={() => {}} restaurant={seedMenu.restaurant} openingHours={seedMenu.openingHours} />);
    const dialog = screen.getByRole("dialog", { name: "Informações" });
    const hoje = within(dialog).getByText(/Sábado/).closest("[aria-current]");
    expect(hoje).toHaveAttribute("aria-current", "date");
    expect(within(dialog).getByRole("link", { name: /Abrir no Google Maps/ })).toHaveAttribute("href", seedMenu.restaurant.mapsUrl);
    expect(within(dialog).getByText("Não aceitamos Banrisul.")).toBeInTheDocument();
    expect(within(dialog).getByText("Pix")).toBeInTheDocument();
    expect(within(dialog).getByText(/salada de tomate/)).toBeInTheDocument();
  });
});
```

`src/features/restaurant/json-ld.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { seedMenu } from "@/data/seed/menu";
import { buildRestaurantJsonLd, serializeJsonLd } from "./json-ld";

describe("JSON-LD do restaurante", () => {
  const ld = buildRestaurantJsonLd(seedMenu, "https://exemplo.com.br");

  it("descreve o restaurante com cardápio, seções e ofertas em BRL", () => {
    expect(ld["@type"]).toBe("Restaurant");
    expect(ld.hasMenu.hasMenuSection).toHaveLength(9);
    const batatao = ld.hasMenu.hasMenuSection[1]?.hasMenuItem.find((i) => i.name === "Batatão Divino");
    expect(batatao?.offers).toEqual([{ "@type": "Offer", price: "89.90", priceCurrency: "BRL" }]);
  });

  it("omite ofertas de pratos sem preço e escapa '<' ao serializar", () => {
    const parmTilapia = ld.hasMenu.hasMenuSection[2]?.hasMenuItem.find((i) => i.name === "Parmegiana de tilápia");
    expect(parmTilapia?.offers).toEqual([]);
    expect(serializeJsonLd({ a: "</script>" })).not.toContain("</script>");
  });
});
```

- [ ] **Passo 2: rodar e ver falhar**. Rodar `npx vitest run src/features/restaurant`. Esperado: FALHA, módulos não encontrados.

- [ ] **Passo 3: implementar**

`src/lib/use-now.ts`:
```ts
"use client";

import { useSyncExternalStore } from "react";

const MINUTE = 60_000;
const subscribe = (onChange: () => void) => {
  const id = window.setInterval(onChange, MINUTE / 4);
  return () => window.clearInterval(id);
};
const getSnapshot = () => Math.floor(Date.now() / MINUTE);
const getServerSnapshot = () => null;

/** Hora atual com precisão de minuto; null durante a renderização no servidor (evita divergência na hidratação). */
export function useNow(): Date | null {
  const minute = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return minute === null ? null : new Date(minute * MINUTE);
}
```

`src/features/restaurant/open-status.tsx`:
```tsx
"use client";

import { formatOpenStatus, openStatus } from "@/domain/opening-hours";
import type { OpeningRange } from "@/domain/menu";
import { useNow } from "@/lib/use-now";

export function OpenStatus({ hours, timeZone }: { hours: OpeningRange[]; timeZone: string }) {
  const now = useNow();
  if (!now) return <span aria-hidden="true" className="inline-block h-4 w-44 animate-pulse rounded-full bg-surface-muted" />;
  const status = openStatus(hours, now, timeZone);
  const open = status.kind === "open";
  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold ${open ? "text-success" : "text-ink-muted"}`}>
      <span aria-hidden="true" className={`size-2 rounded-full ${open ? "bg-success" : "bg-ink-muted"}`} />
      {formatOpenStatus(status)}
    </span>
  );
}
```

`src/features/restaurant/restaurant-header.tsx`:
```tsx
import type { OpeningRange, Restaurant } from "@/domain/menu";
import { ClockIcon } from "@/ui";
import { OpenStatus } from "./open-status";

export function RestaurantHeader({ restaurant, openingHours }: { restaurant: Restaurant; openingHours: OpeningRange[] }) {
  return (
    <header className="px-5 pt-1 pb-5">
      <p className="text-[11px] font-bold tracking-[0.22em] text-accent uppercase">{restaurant.tagline}</p>
      <h1 id="restaurant-name" className="mt-1.5 font-display text-[36px] leading-[1.05] font-semibold tracking-tight text-brand">
        {restaurant.name}
      </h1>
      <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] text-ink-muted">
        <OpenStatus hours={openingHours} timeZone={restaurant.timezone} />
        <span aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-1">
          <ClockIcon className="size-3.5" />
          Preparo em ~{restaurant.prepTimeMinutes} min
        </span>
      </div>
    </header>
  );
}
```

`src/features/restaurant/info-sheet.tsx`:
```tsx
"use client";

import type { OpeningRange, Restaurant } from "@/domain/menu";
import { weeklySchedule, zonedMoment } from "@/domain/opening-hours";
import { useNow } from "@/lib/use-now";
import { MapPinIcon, Sheet } from "@/ui";
import { OpenStatus } from "./open-status";

type Props = { open: boolean; onClose: () => void; restaurant: Restaurant; openingHours: OpeningRange[] };

const Block = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="border-t border-line py-4">
    <h3 className="mb-2 text-[11px] font-bold tracking-[0.18em] text-accent uppercase">{title}</h3>
    {children}
  </section>
);

export function InfoSheet({ open, onClose, restaurant, openingHours }: Props) {
  const now = useNow();
  const today = now ? zonedMoment(now, restaurant.timezone).weekday : null;
  return (
    <Sheet open={open} onClose={onClose} labelledBy="info-title">
      <div className="px-5 pt-10 pb-10">
        <OpenStatus hours={openingHours} timeZone={restaurant.timezone} />
        <h2 id="info-title" className="mt-1 mb-4 font-display text-[28px] font-semibold text-brand">Informações</h2>

        <Block title="Horário">
          <ul className="space-y-1 text-[14px]">
            {weeklySchedule(openingHours).map((day) => {
              const isToday = day.weekday === today;
              return (
                <li key={day.weekday} aria-current={isToday ? "date" : undefined} className={`flex justify-between ${isToday ? "font-bold text-brand" : "text-ink"}`}>
                  <span>{day.name}{isToday ? " (hoje)" : ""}</span>
                  <span className="tabular-nums">{day.ranges.length ? day.ranges.join(" · ") : "Fechado"}</span>
                </li>
              );
            })}
          </ul>
        </Block>

        <Block title="Endereço">
          <p className="text-[14px] leading-relaxed">{restaurant.address}</p>
          <a
            href={restaurant.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-5 text-[14px] font-bold text-brand-ink"
          >
            <MapPinIcon className="size-4" /> Abrir no Google Maps
          </a>
        </Block>

        <Block title="Pagamento">
          <ul className="flex flex-wrap gap-1.5">
            {restaurant.paymentMethods.map((m) => (
              <li key={m} className="rounded-lg bg-surface-muted px-2.5 py-1 text-[12px] font-semibold text-ink">{m}</li>
            ))}
          </ul>
          {restaurant.paymentNotes.map((note) => (
            <p key={note} className="mt-2 text-[13px] font-semibold text-brand">{note}</p>
          ))}
        </Block>

        <Block title="Bom saber">
          <ul className="space-y-1 text-[14px] leading-relaxed">
            {restaurant.notes.map((n) => <li key={n}>{n}</li>)}
            <li>Preparo em cerca de {restaurant.prepTimeMinutes} minutos.</li>
          </ul>
        </Block>
      </div>
    </Sheet>
  );
}
```

`src/features/restaurant/json-ld.ts`:
```ts
import { priceSummary, type Menu } from "@/domain/menu";
import { WEEKDAY_NAMES } from "@/domain/opening-hours";

const SCHEMA_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
const reais = (cents: number) => (cents / 100).toFixed(2);

type Offer = { "@type": "Offer"; price: string; priceCurrency: "BRL"; name?: string };

export function buildRestaurantJsonLd(menu: Menu, url?: string) {
  const { restaurant } = menu;
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant" as const,
    name: restaurant.name,
    ...(url ? { url } : {}),
    servesCuisine: "Brasileira (comida mineira)",
    address: { "@type": "PostalAddress", streetAddress: restaurant.address, addressLocality: "São Leopoldo", addressRegion: "RS", addressCountry: "BR" },
    openingHoursSpecification: menu.openingHours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: SCHEMA_DAYS[h.weekday],
      name: WEEKDAY_NAMES[h.weekday],
      opens: h.opensAt,
      closes: h.closesAt,
    })),
    hasMenu: {
      "@type": "Menu" as const,
      inLanguage: "pt-BR",
      hasMenuSection: menu.categories.map((category) => ({
        "@type": "MenuSection" as const,
        name: category.name,
        hasMenuItem: category.dishes.map((dish) => {
          const summary = priceSummary(dish);
          const offers: Offer[] =
            summary.kind === "single"
              ? [{ "@type": "Offer", price: reais(summary.price), priceCurrency: "BRL" }]
              : summary.kind === "variants"
                ? summary.variants.map((v) => ({ "@type": "Offer", name: v.label, price: reais(v.price), priceCurrency: "BRL" }))
                : [];
          return { "@type": "MenuItem" as const, name: dish.name, ...(dish.description ? { description: dish.description } : {}), offers };
        }),
      })),
    },
  };
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
```

`src/features/restaurant/index.ts`:
```ts
export { InfoSheet } from "./info-sheet";
export { buildRestaurantJsonLd, serializeJsonLd } from "./json-ld";
export { OpenStatus } from "./open-status";
export { RestaurantHeader } from "./restaurant-header";
```

- [ ] **Passo 4: liberar os arquivos de teste da regra de camadas.** Os testes podem importar dados do seed. Acrescentar no `eslint.config.mjs`, **depois** dos blocos de camadas e antes do `globalIgnores`:

```js
  { files: ["src/**/*.test.{ts,tsx}", "src/test/**"], rules: { "no-restricted-imports": "off" } },
```

- [ ] **Passo 5: rodar e ver passar**. Rodar `npx vitest run src/features/restaurant && npm run lint && npm run typecheck`. Esperado: PASSA.

- [ ] **Passo 6: commit.** `git add -A && git commit -m "feat(restaurant): topo, status aberto/fechado, informações e JSON-LD"`

---

### Tarefa 9: painéis no endereço da página (`lib/url-sheet`)

**Arquivos:**
- Criar: `src/lib/url-sheet.ts`
- Teste: `src/lib/url-sheet.test.ts`

**Interfaces:**
- Produz:
  - `type UrlSheet = { kind: "none" } | { kind: "prato"; slug: string } | { kind: "info" } | { kind: "busca"; query: string }`
  - `parseUrlSheet(search: string): UrlSheet`
  - `useUrlSheet(): UrlSheet`
  - `openSheet(key: "prato" | "info" | "busca", value?: string): void`
  - `updateSheetValue(key: "busca", value: string): void`
  - `closeSheet(): Promise<void>`

- [ ] **Passo 1: escrever o teste que falha**, `src/lib/url-sheet.test.ts`

```ts
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { closeSheet, openSheet, parseUrlSheet, updateSheetValue, useUrlSheet } from "./url-sheet";

describe("parseUrlSheet", () => {
  it("interpreta prato, busca e info (prato tem prioridade)", () => {
    expect(parseUrlSheet("")).toEqual({ kind: "none" });
    expect(parseUrlSheet("?prato=batatao-divino")).toEqual({ kind: "prato", slug: "batatao-divino" });
    expect(parseUrlSheet("?busca=parm")).toEqual({ kind: "busca", query: "parm" });
    expect(parseUrlSheet("?info")).toEqual({ kind: "info" });
    expect(parseUrlSheet("?busca=x&prato=y")).toEqual({ kind: "prato", slug: "y" });
  });
});

describe("abrir e fechar painéis", () => {
  it("abrir empilha no histórico e fechar volta (o 'voltar' do celular funciona)", async () => {
    const { result } = renderHook(() => useUrlSheet());
    act(() => openSheet("prato", "batatao-divino"));
    expect(result.current).toEqual({ kind: "prato", slug: "batatao-divino" });
    expect(window.location.search).toBe("?prato=batatao-divino");
    await act(() => closeSheet());
    expect(result.current).toEqual({ kind: "none" });
    expect(window.location.search).toBe("");
  });

  it("fechar um painel aberto por link direto troca o endereço sem sair do site", async () => {
    window.history.replaceState(null, "", "/?prato=batatao-divino");
    const before = window.history.length;
    const { result } = renderHook(() => useUrlSheet());
    expect(result.current.kind).toBe("prato");
    await act(() => closeSheet());
    expect(window.location.pathname).toBe("/");
    expect(window.location.search).toBe("");
    expect(window.history.length).toBe(before);
  });

  it("atualizar a busca não cria entradas novas no histórico", () => {
    act(() => openSheet("busca"));
    const before = window.history.length;
    act(() => updateSheetValue("busca", "parmegiana"));
    expect(window.location.search).toBe("?busca=parmegiana");
    expect(window.history.length).toBe(before);
  });
});
```

- [ ] **Passo 2: rodar e ver falhar**. Rodar `npx vitest run src/lib/url-sheet.test.ts`. Esperado: FALHA, módulo não encontrado.

- [ ] **Passo 3: implementar** `src/lib/url-sheet.ts`

```ts
"use client";

import { useMemo, useSyncExternalStore } from "react";

export type SheetKey = "prato" | "info" | "busca";
export type UrlSheet = { kind: "none" } | { kind: "prato"; slug: string } | { kind: "info" } | { kind: "busca"; query: string };

/** Quantos painéis este app empilhou no histórico. Com 0, fechar troca o endereço em vez de voltar (link direto). */
let depth = 0;
let listening = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function ensureListening() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener("popstate", () => {
    depth = Math.max(0, depth - 1);
    emit();
  });
}

function subscribe(listener: () => void) {
  ensureListening();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => window.location.search;
const getServerSnapshot = () => "";

export function parseUrlSheet(search: string): UrlSheet {
  const params = new URLSearchParams(search);
  const prato = params.get("prato");
  if (prato !== null) return { kind: "prato", slug: prato };
  const busca = params.get("busca");
  if (busca !== null) return { kind: "busca", query: busca };
  if (params.has("info")) return { kind: "info" };
  return { kind: "none" };
}

export function useUrlSheet(): UrlSheet {
  const search = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => parseUrlSheet(search), [search]);
}

function urlFor(key: SheetKey, value: string): string {
  const params = new URLSearchParams();
  params.set(key, value);
  return `${window.location.pathname}?${params.toString().replace(/=$/, "")}`;
}

export function openSheet(key: SheetKey, value = ""): void {
  ensureListening();
  window.history.pushState(null, "", urlFor(key, value));
  depth += 1;
  emit();
}

export function updateSheetValue(key: "busca", value: string): void {
  window.history.replaceState(null, "", urlFor(key, value));
  emit();
}

export function closeSheet(): Promise<void> {
  ensureListening();
  if (depth > 0) {
    return new Promise((resolve) => {
      window.addEventListener("popstate", () => resolve(), { once: true });
      window.history.back();
    });
  }
  window.history.replaceState(null, "", window.location.pathname);
  emit();
  return Promise.resolve();
}
```

- [ ] **Passo 4: rodar e ver passar**. Rodar `npx vitest run src/lib`. Esperado: PASSA. (O jsdom dispara o `popstate` de forma assíncrona depois de `history.back()`, e o `await act` espera por isso.)

- [ ] **Passo 5: commit.** `git add -A && git commit -m "feat(lib): painéis no endereço da página com voltar do celular"`

---

### Tarefa 10: feature `menu` (linhas, seções, abas, detalhe e busca)

**Arquivos:**
- Criar:
  - `src/features/menu/lib/presentation.ts`
  - `src/features/menu/dish-row.tsx`, `src/features/menu/compact-row.tsx`, `src/features/menu/featured-section.tsx`, `src/features/menu/category-section.tsx`, `src/features/menu/category-nav.tsx`, `src/features/menu/menu-browser.tsx`, `src/features/menu/dish-sheet.tsx`, `src/features/menu/menu-search.tsx`
  - `src/features/menu/index.ts`
- Teste: `src/features/menu/lib/presentation.test.ts`, `src/features/menu/dish-row.test.tsx`, `src/features/menu/dish-sheet.test.tsx`, `src/features/menu/menu-search.test.tsx`, `src/features/menu/menu-browser.test.tsx`

**Interfaces:**
- Consome: `Dish`, `Category`, `priceSummary`, `featuredDishes`, `searchDishes`, `MIN_QUERY_LENGTH`, `formatBRL`, `formatAddon`, `openSheet`, as peças de `ui`
- Produz:
  - `sectionId(slug): string`
  - `inlinePrice(dish): string`
  - `dishBadges(dish): { key; label; tone }[]`
  - `MenuBrowser({ categories })`
  - `DishSheet({ dish?, open, onClose, prepTimeMinutes })`
  - `MenuSearch({ open, categories, query, onQueryChange, onPickDish, onPickCategory, onClose })`
  - `FEATURED_SECTION = { slug: "destaques", name: "Destaques" }`

- [ ] **Passo 1: escrever os testes que falham**

`src/features/menu/lib/presentation.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { cents } from "@/domain/money";
import { makeDish } from "@/test/fixtures";
import { dishBadges, inlinePrice, sectionId } from "./presentation";

describe("apresentação do prato", () => {
  it("inlinePrice cobre preço único, até 2 variações, várias variações e sob consulta", () => {
    expect(inlinePrice(makeDish())).toBe("R$\u00a029,90");
    expect(inlinePrice(makeDish({ variants: [{ label: "Pequena", price: cents(2990) }, { label: "Grande", price: cents(4290) }] }))).toBe(
      "Pequena R$\u00a029,90 · Grande R$\u00a042,90",
    );
    expect(
      inlinePrice(makeDish({ variants: [{ label: "200 ml", price: cents(900) }, { label: "300 ml", price: cents(1100) }, { label: "500 ml", price: cents(1300) }] })),
    ).toBe("a partir de R$\u00a09,00");
    expect(inlinePrice(makeDish({ basePrice: null }))).toBe("Consulte o preço");
  });

  it("dishBadges traduz 'serve N', vegetariano e mais pedido", () => {
    expect(dishBadges(makeDish({ serves: 3, tags: ["vegetariano", "mais_pedido"] })).map((b) => b.label)).toEqual([
      "Mais pedido", "Serve até 3 pessoas", "Vegetariano",
    ]);
  });

  it("sectionId é estável", () => {
    expect(sectionId("parmegianas")).toBe("secao-parmegianas");
  });
});
```

`src/features/menu/dish-row.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { makeDish } from "@/test/fixtures";
import { CompactRow } from "./compact-row";
import { DishRow } from "./dish-row";
import { cents } from "@/domain/money";

describe("DishRow", () => {
  it("mostra nome, preço e abre o detalhe ao tocar", async () => {
    const onOpen = vi.fn();
    render(<DishRow dish={makeDish({ description: "Crocante." })} onOpen={onOpen} />);
    await userEvent.click(screen.getByRole("button", { name: /Batata frita/ }));
    expect(onOpen).toHaveBeenCalledWith("batata-frita");
    expect(screen.getByText("R$\u00a029,90")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("marca esgotado sem esconder o prato", () => {
    render(<DishRow dish={makeDish({ isAvailable: false })} onOpen={() => {}} />);
    expect(screen.getByText("Esgotado hoje")).toBeInTheDocument();
  });
});

describe("CompactRow", () => {
  it("lista cada variação com o seu preço", () => {
    render(<CompactRow dish={makeDish({ name: "Chopp", variants: [{ label: "400 ml", price: cents(1900) }, { label: "770 ml", price: cents(2900) }] })} onOpen={() => {}} />);
    expect(screen.getByText("400 ml")).toBeInTheDocument();
    expect(screen.getByText("R$\u00a029,00")).toBeInTheDocument();
  });
});
```

`src/features/menu/dish-sheet.test.tsx`:
```tsx
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { cents } from "@/domain/money";
import { makeDish } from "@/test/fixtures";
import { DishSheet } from "./dish-sheet";

describe("DishSheet", () => {
  it("mostra variações, adicionais e tempo de preparo", () => {
    const dish = makeDish({
      name: "Batata frita",
      variants: [{ label: "Pequena", price: cents(2990) }, { label: "Grande", price: cents(4290) }],
      addons: [{ label: "Cheddar", price: cents(500) }],
    });
    render(<DishSheet dish={dish} open onClose={() => {}} prepTimeMinutes={20} />);
    const dialog = screen.getByRole("dialog", { name: "Batata frita" });
    expect(within(dialog).getByText("Grande")).toBeInTheDocument();
    expect(within(dialog).getByText("+ R$\u00a05,00")).toBeInTheDocument();
    expect(within(dialog).getByText(/20 minutos/)).toBeInTheDocument();
  });

  it("prato sem preço e esgotado", () => {
    render(<DishSheet dish={makeDish({ basePrice: null, isAvailable: false })} open onClose={() => {}} prepTimeMinutes={20} />);
    expect(screen.getByText("Consulte o preço no balcão")).toBeInTheDocument();
    expect(screen.getByText("Esgotado hoje")).toBeInTheDocument();
  });

  it("sem prato, nada aparece", () => {
    render(<DishSheet dish={undefined} open={false} onClose={() => {}} prepTimeMinutes={20} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
```

`src/features/menu/menu-search.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { seedMenu } from "@/data/seed/menu";
import { MenuSearch } from "./menu-search";

const setup = (query: string) => {
  const handlers = { onQueryChange: vi.fn(), onPickDish: vi.fn(), onPickCategory: vi.fn(), onClose: vi.fn() };
  render(<MenuSearch open categories={seedMenu.categories} query={query} {...handlers} />);
  return handlers;
};

describe("MenuSearch", () => {
  it("digitar atualiza a busca", async () => {
    const { onQueryChange } = setup("");
    await userEvent.type(screen.getByRole("searchbox", { name: "Buscar no cardápio" }), "p");
    expect(onQueryChange).toHaveBeenCalledWith("p");
  });

  it("mostra os resultados e abre o prato escolhido", async () => {
    const { onPickDish } = setup("parmegiana");
    const results = screen.getAllByRole("button", { name: /Parmegiana/ });
    expect(results).toHaveLength(4);
    await userEvent.click(results[0]!);
    expect(onPickDish).toHaveBeenCalledWith("parmegiana-de-frango");
  });

  it("sem resultado, oferece atalhos para as categorias", async () => {
    const { onPickCategory } = setup("xyz");
    expect(screen.getByText("Nada encontrado para “xyz”")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Parmegianas" }));
    expect(onPickCategory).toHaveBeenCalledWith("parmegianas");
  });
});
```

`src/features/menu/menu-browser.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { seedMenu } from "@/data/seed/menu";
import { MenuBrowser } from "./menu-browser";

describe("MenuBrowser", () => {
  it("mostra abas, destaques e todas as seções", () => {
    render(<MenuBrowser categories={seedMenu.categories} />);
    const nav = screen.getByRole("navigation", { name: "Categorias do cardápio" });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Destaques" })).toBeInTheDocument();
    for (const c of seedMenu.categories) expect(screen.getByRole("heading", { level: 2, name: c.name })).toBeInTheDocument();
  });

  it("tocar num prato abre o detalhe pelo endereço", async () => {
    render(<MenuBrowser categories={seedMenu.categories} />);
    await userEvent.click(screen.getAllByRole("button", { name: /Divina Porção/ })[0]!);
    expect(window.location.search).toBe("?prato=divina-porcao");
  });

  it("tocar numa aba marca a aba como atual", async () => {
    render(<MenuBrowser categories={seedMenu.categories} />);
    const aba = screen.getByRole("button", { name: "Parmegianas" });
    await userEvent.click(aba);
    expect(aba).toHaveAttribute("aria-current", "true");
  });
});
```

- [ ] **Passo 2: rodar e ver falhar**. Rodar `npx vitest run src/features/menu`. Esperado: FALHA, módulos não encontrados.

- [ ] **Passo 3: implementar a apresentação**, `src/features/menu/lib/presentation.ts`

```ts
import { priceSummary, type Dish } from "@/domain/menu";
import { formatBRL } from "@/domain/money";
import type { ChipTone } from "@/ui";

export const FEATURED_SECTION = { slug: "destaques", name: "Destaques" } as const;
export const sectionId = (slug: string) => `secao-${slug}`;

export function inlinePrice(dish: Pick<Dish, "basePrice" | "variants">): string {
  const summary = priceSummary(dish);
  if (summary.kind === "single") return formatBRL(summary.price);
  if (summary.kind === "on-request") return "Consulte o preço";
  if (summary.variants.length <= 2) return summary.variants.map((v) => `${v.label} ${formatBRL(v.price)}`).join(" · ");
  const lowest = summary.variants.reduce((min, v) => (v.price < min.price ? v : min));
  return `a partir de ${formatBRL(lowest.price)}`;
}

export type DishBadge = { key: string; label: string; tone: ChipTone };
export function dishBadges(dish: Pick<Dish, "serves" | "tags">): DishBadge[] {
  const badges: DishBadge[] = [];
  if (dish.tags.includes("mais_pedido")) badges.push({ key: "mais_pedido", label: "Mais pedido", tone: "accent" });
  if (dish.serves) badges.push({ key: "serves", label: `Serve até ${dish.serves} pessoas`, tone: "accent" });
  if (dish.tags.includes("vegetariano")) badges.push({ key: "vegetariano", label: "Vegetariano", tone: "success" });
  return badges;
}
```

- [ ] **Passo 4: implementar as linhas e as seções**

`src/features/menu/dish-row.tsx`:
```tsx
"use client";

import type { Dish } from "@/domain/menu";
import { Chip, DishPhoto } from "@/ui";
import { dishBadges, inlinePrice } from "./lib/presentation";

export function DishRow({ dish, onOpen }: { dish: Dish; onOpen: (slug: string) => void }) {
  const badges = dishBadges(dish);
  return (
    <button type="button" onClick={() => onOpen(dish.slug)} className="flex w-full items-center gap-3.5 border-b border-line py-4 text-left">
      <span className="min-w-0 flex-1">
        <span className={`block font-display text-[17px] leading-snug font-semibold ${dish.isAvailable ? "text-ink" : "text-ink-muted"}`}>
          {dish.name}
        </span>
        {dish.description ? <span className="mt-0.5 line-clamp-2 block text-[13px] leading-snug text-ink-muted">{dish.description}</span> : null}
        {badges.length > 0 ? (
          <span className="mt-1.5 flex flex-wrap gap-1">
            {badges.map((b) => <Chip key={b.key} tone={b.tone}>{b.label}</Chip>)}
          </span>
        ) : null}
        <span className="mt-1.5 flex flex-wrap items-center gap-2">
          {!dish.isAvailable ? <Chip tone="neutral">Esgotado hoje</Chip> : null}
          <span className={`text-[14px] font-bold tabular-nums ${dish.isAvailable ? "text-brand" : "text-ink-muted line-through"}`}>{inlinePrice(dish)}</span>
        </span>
      </span>
      <DishPhoto photo={dish.photo} sizes="80px" className={`size-[76px] shrink-0 rounded-card ${dish.isAvailable ? "" : "grayscale"}`} />
    </button>
  );
}
```

`src/features/menu/compact-row.tsx`:
```tsx
"use client";

import { priceSummary, type Dish } from "@/domain/menu";
import { formatBRL } from "@/domain/money";
import { DottedPriceRow } from "@/ui";

export function CompactRow({ dish, onOpen }: { dish: Dish; onOpen: (slug: string) => void }) {
  const summary = priceSummary(dish);
  const muted = !dish.isAvailable;
  const name = (
    <span className={muted ? "text-ink-muted" : "text-ink"}>
      {dish.name}
      {muted ? <span className="ml-1.5 text-[12px] font-semibold text-ink-muted">(esgotado)</span> : null}
    </span>
  );
  return (
    <button type="button" onClick={() => onOpen(dish.slug)} className="block w-full border-b border-line/70 py-1 text-left">
      {summary.kind === "variants" ? (
        <>
          <span className="block pt-1.5 text-[14px] font-semibold">{name}</span>
          {summary.variants.map((v) => (
            <span key={v.label} className="block pl-3">
              <DottedPriceRow label={v.label} price={formatBRL(v.price)} muted={muted} />
            </span>
          ))}
        </>
      ) : (
        <DottedPriceRow label={name} price={summary.kind === "single" ? formatBRL(summary.price) : "Consulte"} muted={muted} />
      )}
    </button>
  );
}
```

`src/features/menu/featured-section.tsx`:
```tsx
"use client";

import type { Dish } from "@/domain/menu";
import { Chip, DishPhoto } from "@/ui";
import { FEATURED_SECTION, dishBadges, inlinePrice, sectionId } from "./lib/presentation";

export function FeaturedSection({ dishes, onOpen }: { dishes: Dish[]; onOpen: (slug: string) => void }) {
  if (dishes.length === 0) return null;
  return (
    <section id={sectionId(FEATURED_SECTION.slug)} data-menu-section={FEATURED_SECTION.slug} aria-labelledby="titulo-destaques" className="scroll-mt-(--sticky-offset) pt-6">
      <h2 id="titulo-destaques" className="px-5 font-display text-[24px] font-semibold">{FEATURED_SECTION.name}</h2>
      <ul className="no-scrollbar mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2">
        {dishes.map((dish, index) => (
          <li key={dish.slug} className="w-[78%] max-w-[300px] shrink-0 snap-start">
            <button type="button" onClick={() => onOpen(dish.slug)} className="relative block h-[220px] w-full overflow-hidden rounded-[22px] bg-brand text-left">
              <DishPhoto photo={dish.photo} sizes="(max-width: 480px) 80vw, 300px" preload={index === 0} className="absolute inset-0" />
              <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-transparent from-30% to-[rgb(40_10_8/0.85)]" />
              <span className="absolute inset-x-4 bottom-4 block text-brand-ink">
                {dishBadges(dish).slice(0, 1).map((b) => (
                  <span key={b.key} className="mb-1.5 inline-block rounded-full bg-surface px-2 py-0.5 text-[10.5px] font-bold tracking-[0.12em] text-brand uppercase">{b.label}</span>
                ))}
                <span className="block font-display text-[24px] leading-tight italic">{dish.name}</span>
                <span className="mt-0.5 block text-[13px] font-semibold">{inlinePrice(dish)}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
```
(O `Chip` não entra aqui: o selo sobre a foto tem um estilo próprio. Tirar a importação do `Chip` se o lint reclamar de import sem uso.)

`src/features/menu/category-section.tsx`:
```tsx
"use client";

import type { Category } from "@/domain/menu";
import { CompactRow } from "./compact-row";
import { DishRow } from "./dish-row";
import { sectionId } from "./lib/presentation";

export function CategorySection({ category, onOpen }: { category: Category; onOpen: (slug: string) => void }) {
  const id = sectionId(category.slug);
  const count = category.dishes.length;
  return (
    <section id={id} data-menu-section={category.slug} aria-labelledby={`${id}-titulo`} className="scroll-mt-(--sticky-offset) px-5 pt-8">
      <div className="flex items-baseline justify-between gap-3 border-b border-line pb-2">
        <h2 id={`${id}-titulo`} className="font-display text-[24px] font-semibold">{category.name}</h2>
        <span className="text-[12px] text-ink-muted">{count} {count === 1 ? "item" : "itens"}</span>
      </div>
      <ul className={category.displayStyle === "compact" ? "mt-1" : ""}>
        {category.dishes.map((dish) => (
          <li key={dish.slug}>
            {category.displayStyle === "compact" ? <CompactRow dish={dish} onOpen={onOpen} /> : <DishRow dish={dish} onOpen={onOpen} />}
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Passo 5: implementar as abas e o navegador do cardápio**

`src/features/menu/category-nav.tsx`:
```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { sectionId } from "./lib/presentation";

type Item = { slug: string; name: string };
const OFFSET_PX = 120;

function prefersReducedMotion() {
  return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function CategoryNav({ items }: { items: Item[] }) {
  const [active, setActive] = useState(items[0]?.slug ?? "");
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        let current = items[0]?.slug ?? "";
        for (const item of items) {
          const el = document.getElementById(sectionId(item.slug));
          if (el && el.getBoundingClientRect().top - OFFSET_PX <= 0) current = item.slug;
        }
        setActive(current);
      });
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
    };
  }, [items]);

  useEffect(() => {
    const list = listRef.current;
    const tab = list?.querySelector<HTMLElement>(`[data-tab="${active}"]`);
    if (!list || !tab) return;
    list.scrollTo({ left: tab.offsetLeft - list.clientWidth / 2 + tab.clientWidth / 2, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, [active]);

  const go = (slug: string) => {
    setActive(slug);
    document.getElementById(sectionId(slug))?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  };

  return (
    <nav aria-label="Categorias do cardápio" className="sticky top-14 z-30 border-b border-line bg-bg/95 backdrop-blur">
      <ul ref={listRef} className="no-scrollbar mx-auto flex max-w-xl gap-1 overflow-x-auto px-3">
        {items.map((item) => {
          const isActive = item.slug === active;
          return (
            <li key={item.slug} className="shrink-0">
              <button
                type="button"
                data-tab={item.slug}
                aria-current={isActive ? "true" : undefined}
                onClick={() => go(item.slug)}
                className={`min-h-11 px-2.5 text-[14px] font-semibold whitespace-nowrap transition-colors ${isActive ? "text-brand shadow-[inset_0_-2px_0_var(--color-brand)]" : "text-ink-muted"}`}
              >
                {item.name}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
```

`src/features/menu/menu-browser.tsx`:
```tsx
"use client";

import { useMemo } from "react";
import { featuredDishes, type Category } from "@/domain/menu";
import { openSheet } from "@/lib/url-sheet";
import { CategoryNav } from "./category-nav";
import { CategorySection } from "./category-section";
import { FeaturedSection } from "./featured-section";
import { FEATURED_SECTION } from "./lib/presentation";

export function MenuBrowser({ categories }: { categories: Category[] }) {
  const featured = useMemo(() => featuredDishes(categories), [categories]);
  const tabs = useMemo(
    () => [...(featured.length ? [FEATURED_SECTION] : []), ...categories.map((c) => ({ slug: c.slug, name: c.name }))],
    [categories, featured.length],
  );
  const openDish = (slug: string) => openSheet("prato", slug);
  return (
    <>
      <CategoryNav items={tabs} />
      <FeaturedSection dishes={featured} onOpen={openDish} />
      {categories.map((category) => (
        <CategorySection key={category.slug} category={category} onOpen={openDish} />
      ))}
    </>
  );
}
```

- [ ] **Passo 6: implementar o detalhe e a busca**

`src/features/menu/dish-sheet.tsx`:
```tsx
"use client";

import { priceSummary, type Dish } from "@/domain/menu";
import { formatAddon, formatBRL } from "@/domain/money";
import { Chip, DishPhoto, DottedPriceRow, Sheet } from "@/ui";
import { dishBadges } from "./lib/presentation";

type Props = { dish: Dish | undefined; open: boolean; onClose: () => void; prepTimeMinutes: number };

export function DishSheet({ dish, open, onClose, prepTimeMinutes }: Props) {
  if (!dish) return null;
  const summary = priceSummary(dish);
  const muted = !dish.isAvailable;
  return (
    <Sheet open={open} onClose={onClose} labelledBy="prato-titulo">
      <DishPhoto photo={dish.photo} sizes="(max-width: 576px) 100vw, 576px" preload className="h-[230px] w-full" />
      <div className={`px-5 pb-10 ${dish.photo ? "pt-5" : "pt-12"}`}>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {!dish.isAvailable ? <Chip tone="neutral">Esgotado hoje</Chip> : null}
          {dishBadges(dish).map((b) => <Chip key={b.key} tone={b.tone}>{b.label}</Chip>)}
        </div>
        <h2 id="prato-titulo" className="font-display text-[28px] leading-tight font-semibold">{dish.name}</h2>
        {dish.description ? <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">{dish.description}</p> : null}

        {summary.kind === "single" ? (
          <p className={`mt-4 font-display text-[28px] tabular-nums ${muted ? "text-ink-muted line-through" : "text-brand"}`}>{formatBRL(summary.price)}</p>
        ) : null}
        {summary.kind === "on-request" ? <p className="mt-4 text-[15px] font-semibold text-brand">Consulte o preço no balcão</p> : null}
        {summary.kind === "variants" ? (
          <div className="mt-4">
            <h3 className="text-[11px] font-bold tracking-[0.18em] text-accent uppercase">Opções</h3>
            {summary.variants.map((v) => <DottedPriceRow key={v.label} label={v.label} price={formatBRL(v.price)} muted={muted} />)}
          </div>
        ) : null}

        {dish.addons.length > 0 ? (
          <div className="mt-5">
            <h3 className="text-[11px] font-bold tracking-[0.18em] text-accent uppercase">Adicionais</h3>
            {dish.addons.map((a) => <DottedPriceRow key={a.label} label={a.label} price={formatAddon(a.price)} />)}
          </div>
        ) : null}

        <p className="mt-6 rounded-2xl bg-surface-muted px-4 py-3 text-[13px] text-ink-muted">
          Tempo de preparo de aproximadamente {prepTimeMinutes} minutos.
        </p>
      </div>
    </Sheet>
  );
}
```

`src/features/menu/menu-search.tsx`:
```tsx
"use client";

import { useMemo } from "react";
import type { Category } from "@/domain/menu";
import { MIN_QUERY_LENGTH, searchDishes } from "@/domain/search";
import { SearchIcon, Sheet } from "@/ui";
import { inlinePrice } from "./lib/presentation";

type Props = {
  open: boolean;
  categories: Category[];
  query: string;
  onQueryChange: (query: string) => void;
  onPickDish: (slug: string) => void;
  onPickCategory: (slug: string) => void;
  onClose: () => void;
};

export function MenuSearch({ open, categories, query, onQueryChange, onPickDish, onPickCategory, onClose }: Props) {
  const hits = useMemo(() => searchDishes(categories, query), [categories, query]);
  const searching = query.trim().length >= MIN_QUERY_LENGTH;
  return (
    <Sheet open={open} onClose={onClose} labelledBy="busca-titulo">
      <div className="px-5 pt-10 pb-10">
        <h2 id="busca-titulo" className="font-display text-[26px] font-semibold text-brand">Buscar</h2>
        <label className="mt-3 flex min-h-12 items-center gap-2 rounded-full border border-line bg-bg px-4 focus-within:border-brand">
          <SearchIcon className="size-5 text-ink-muted" />
          <input
            type="search"
            aria-label="Buscar no cardápio"
            placeholder="Ex.: parmegiana, chopp, batata…"
            autoFocus
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="h-12 w-full bg-transparent text-[16px] outline-none placeholder:text-ink-muted"
          />
        </label>

        {searching && hits.length > 0 ? (
          <ul className="mt-4" aria-live="polite">
            {hits.map((hit) => (
              <li key={hit.dish.slug}>
                <button type="button" onClick={() => onPickDish(hit.dish.slug)} className="flex w-full items-baseline justify-between gap-3 border-b border-line py-3 text-left">
                  <span className="min-w-0">
                    <span className="block font-display text-[16px] font-semibold">{hit.dish.name}</span>
                    <span className="block text-[12px] text-ink-muted">{hit.categoryName}</span>
                  </span>
                  <span className="shrink-0 text-[13px] font-bold text-brand">{inlinePrice(hit.dish)}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {searching && hits.length === 0 ? <p className="mt-6 text-[15px] text-ink">Nada encontrado para “{query.trim()}”</p> : null}

        {!searching || hits.length === 0 ? (
          <div className="mt-6">
            <h3 className="text-[11px] font-bold tracking-[0.18em] text-accent uppercase">Categorias</h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {categories.map((c) => (
                <li key={c.slug}>
                  <button type="button" onClick={() => onPickCategory(c.slug)} className="min-h-11 rounded-full bg-surface-muted px-4 text-[14px] font-semibold text-ink">
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </Sheet>
  );
}
```

`src/features/menu/index.ts`:
```ts
export { DishSheet } from "./dish-sheet";
export { FEATURED_SECTION, sectionId } from "./lib/presentation";
export { MenuBrowser } from "./menu-browser";
export { MenuSearch } from "./menu-search";
```

- [ ] **Passo 7: teste do Foco da revisão nº 1 (slug inexistente)**, acrescentado em `src/features/menu/dish-sheet.test.tsx` dentro do `describe`:

```tsx
  it("slug desconhecido (dish undefined) com open=true não abre nada", () => {
    render(<DishSheet dish={undefined} open onClose={() => {}} prepTimeMinutes={20} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
```

- [ ] **Passo 8: rodar e ver passar**. Rodar `npx vitest run src/features/menu && npm run lint && npm run typecheck`. Esperado: PASSA.

- [ ] **Passo 9: commit.** `git add -A && git commit -m "feat(menu): linhas, destaques, abas com scrollspy, detalhe e busca"`

---

### Tarefa 11: montagem da página (barra superior, promoções, painéis, rodapé e erros)

**Arquivos:**
- Criar:
  - `src/features/promotions/promo-carousel.tsx`, `src/features/promotions/index.ts`
  - `src/app/_components/top-bar.tsx`, `src/app/_components/url-sheets.tsx`, `src/app/_components/site-footer.tsx`
  - `src/app/error.tsx`, `src/app/not-found.tsx`, `src/app/opengraph-image.tsx`
- Modificar: `src/app/page.tsx`
- Teste: `src/features/promotions/promo-carousel.test.tsx`, `src/app/_components/url-sheets.test.tsx`

**Interfaces:**
- Consome: `MenuBrowser`, `DishSheet`, `MenuSearch`, `sectionId`, `RestaurantHeader`, `InfoSheet`, `buildRestaurantJsonLd`, `serializeJsonLd`, `useUrlSheet`, `openSheet`, `closeSheet`, `updateSheetValue`, `findDish`, `getMenuRepository`
- Produz: `PromoCarousel({ promotions })`, `TopBar({ restaurantName })`, `UrlSheets({ menu })`, `SiteFooter({ restaurant })`

- [ ] **Passo 1: escrever os testes que falham**

`src/features/promotions/promo-carousel.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { seedMenu } from "@/data/seed/menu";
import { PromoCarousel } from "./promo-carousel";

it("lista as promoções com título, descrição e destaque", () => {
  render(<PromoCarousel promotions={seedMenu.promotions} />);
  expect(screen.getByRole("region", { name: "Promoções" })).toBeInTheDocument();
  expect(screen.getAllByRole("listitem")).toHaveLength(4);
  expect(screen.getByText("3ª grátis")).toBeInTheDocument();
});

it("não renderiza nada sem promoções", () => {
  const { container } = render(<PromoCarousel promotions={[]} />);
  expect(container).toBeEmptyDOMElement();
});
```

`src/app/_components/url-sheets.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { seedMenu } from "@/data/seed/menu";
import { UrlSheets } from "./url-sheets";

const renderAt = (url: string) => {
  window.history.replaceState(null, "", url);
  render(<UrlSheets menu={seedMenu} />);
};

describe("UrlSheets", () => {
  it("?prato= abre o detalhe do prato", () => {
    renderAt("/?prato=batatao-divino");
    expect(screen.getByRole("dialog", { name: "Batatão Divino" })).toBeInTheDocument();
  });

  it("?prato= com slug inexistente não abre nada", () => {
    renderAt("/?prato=nao-existe");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("?info abre as informações e ?busca abre a busca com o texto", () => {
    renderAt("/?info");
    expect(screen.getByRole("dialog", { name: "Informações" })).toBeInTheDocument();
  });

  it("?busca=chopp mostra o resultado", () => {
    renderAt("/?busca=chopp");
    expect(screen.getByRole("searchbox")).toHaveValue("chopp");
    expect(screen.getByRole("button", { name: /Chopp/ })).toBeInTheDocument();
  });
});
```

- [ ] **Passo 2: rodar e ver falhar**. Rodar `npx vitest run src/features/promotions src/app`. Esperado: FALHA, módulos não encontrados.

- [ ] **Passo 3: implementar as promoções**

`src/features/promotions/promo-carousel.tsx`:
```tsx
import type { Promotion } from "@/domain/menu";

export function PromoCarousel({ promotions }: { promotions: Promotion[] }) {
  if (promotions.length === 0) return null;
  return (
    <section aria-label="Promoções" className="pb-2">
      <ul className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1">
        {promotions.map((promo) => (
          <li key={promo.slug} className="flex min-h-[132px] w-[72%] max-w-[270px] shrink-0 snap-start flex-col justify-between rounded-[20px] bg-brand px-4 py-3.5 text-brand-ink">
            <div>
              <p className="text-[10.5px] font-bold tracking-[0.18em] uppercase opacity-90">Promoção</p>
              <p className="mt-1 font-display text-[19px] leading-tight italic">{promo.title}</p>
              {promo.description ? <p className="mt-1 text-[12.5px] leading-snug opacity-95">{promo.description}</p> : null}
            </div>
            {promo.highlight ? <p className="mt-2 font-display text-[20px] font-semibold">{promo.highlight}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
```
Contraste: `opacity-90` sobre o bordô ainda passa folgado, porque o creme sobre o bordô dá cerca de 11:1.

`src/features/promotions/index.ts`:
```ts
export { PromoCarousel } from "./promo-carousel";
```

- [ ] **Passo 4: implementar os componentes de montagem do app**

`src/app/_components/top-bar.tsx`:
```tsx
"use client";

import { useEffect, useState } from "react";
import { openSheet } from "@/lib/url-sheet";
import { IconButton, InfoIcon, SearchIcon } from "@/ui";

/** Barra fixa: ícones sempre visíveis; o nome aparece quando o título grande sai da tela. */
export function TopBar({ restaurantName }: { restaurantName: string }) {
  const [showName, setShowName] = useState(false);
  useEffect(() => {
    const title = document.getElementById("restaurant-name");
    if (!title || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setShowName(!entry?.isIntersecting), { rootMargin: "-56px 0px 0px 0px" });
    observer.observe(title);
    return () => observer.disconnect();
  }, []);
  return (
    <div className="sticky top-0 z-40 bg-bg/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-xl items-center justify-between gap-3 px-4">
        <p aria-hidden={!showName} className={`truncate font-display text-[20px] font-semibold text-brand transition-opacity duration-300 ${showName ? "opacity-100" : "opacity-0"}`}>
          {restaurantName}
        </p>
        <div className="flex gap-2">
          <IconButton label="Buscar no cardápio" onClick={() => openSheet("busca")}><SearchIcon /></IconButton>
          <IconButton label="Informações da loja" onClick={() => openSheet("info")}><InfoIcon /></IconButton>
        </div>
      </div>
    </div>
  );
}
```

`src/app/_components/url-sheets.tsx`:
```tsx
"use client";

import { findDish, type Menu } from "@/domain/menu";
import { closeSheet, openSheet, updateSheetValue, useUrlSheet } from "@/lib/url-sheet";
import { DishSheet, MenuSearch, sectionId } from "@/features/menu";
import { InfoSheet } from "@/features/restaurant";

/** Compõe os painéis das features a partir do endereço (?prato, ?info, ?busca). */
export function UrlSheets({ menu }: { menu: Menu }) {
  const sheet = useUrlSheet();
  const dish = sheet.kind === "prato" ? findDish(menu.categories, sheet.slug)?.dish : undefined;
  const close = () => void closeSheet();
  return (
    <>
      <DishSheet dish={dish} open={Boolean(dish)} onClose={close} prepTimeMinutes={menu.restaurant.prepTimeMinutes} />
      <InfoSheet open={sheet.kind === "info"} onClose={close} restaurant={menu.restaurant} openingHours={menu.openingHours} />
      <MenuSearch
        open={sheet.kind === "busca"}
        categories={menu.categories}
        query={sheet.kind === "busca" ? sheet.query : ""}
        onQueryChange={(q) => updateSheetValue("busca", q)}
        onPickDish={(slug) => openSheet("prato", slug)}
        onPickCategory={async (slug) => {
          await closeSheet();
          document.getElementById(sectionId(slug))?.scrollIntoView({ block: "start" });
        }}
        onClose={close}
      />
    </>
  );
}
```

`src/app/_components/site-footer.tsx`:
```tsx
import type { Restaurant } from "@/domain/menu";

export function SiteFooter({ restaurant }: { restaurant: Restaurant }) {
  return (
    <footer className="mt-10 px-5 pb-10 text-center text-[12px] leading-relaxed text-ink-muted">
      <p className="font-display text-[16px] text-brand">{restaurant.name}</p>
      <p>{restaurant.address}</p>
      <p className="mt-2">Preços em reais. Imagens ilustrativas. Sujeito a alteração sem aviso.</p>
    </footer>
  );
}
```

`src/app/error.tsx`:
```tsx
"use client";

export default function MenuError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-[28px] font-semibold text-brand">Não foi possível carregar o cardápio</h1>
      <p className="mt-2 text-[15px] text-ink-muted">Verifique sua conexão e tente de novo.</p>
      <button type="button" onClick={reset} className="mt-6 min-h-11 rounded-full bg-brand px-6 text-[15px] font-bold text-brand-ink">Tentar novamente</button>
    </main>
  );
}
```

`src/app/not-found.tsx`:
```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-[28px] font-semibold text-brand">Página não encontrada</h1>
      <Link href="/" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-brand px-6 text-[15px] font-bold text-brand-ink">Ver o cardápio</Link>
    </main>
  );
}
```

`src/app/opengraph-image.tsx`:
```tsx
import { ImageResponse } from "next/og";

export const alt = "Cardápio · Divino Fogão São Leopoldo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#f4eee4", color: "#6b1d22" }}>
        <div style={{ fontSize: 30, letterSpacing: 8, color: "#855a2e" }}>COMIDA DA FAZENDA · SÃO LEOPOLDO</div>
        <div style={{ fontSize: 120, fontWeight: 700, marginTop: 16 }}>Divino Fogão</div>
        <div style={{ fontSize: 44, marginTop: 12, color: "#2b1b17" }}>Cardápio digital</div>
      </div>
    ),
    size,
  );
}
```

`src/app/page.tsx` (versão final):
```tsx
import { getMenuRepository } from "@/data/get-menu-repository";
import { MenuBrowser } from "@/features/menu";
import { PromoCarousel } from "@/features/promotions";
import { RestaurantHeader, buildRestaurantJsonLd, serializeJsonLd } from "@/features/restaurant";
import { SiteFooter } from "./_components/site-footer";
import { TopBar } from "./_components/top-bar";
import { UrlSheets } from "./_components/url-sheets";

/** Modo seed: estático. Modo supabase: regenera no máximo a cada hora (parte 2 revalida ao salvar). */
export const revalidate = 3600;

export default async function MenuPage() {
  const menu = await getMenuRepository().getMenu();
  return (
    <>
      <TopBar restaurantName={menu.restaurant.name} />
      <main className="mx-auto max-w-xl pb-6">
        <RestaurantHeader restaurant={menu.restaurant} openingHours={menu.openingHours} />
        <PromoCarousel promotions={menu.promotions} />
        <MenuBrowser categories={menu.categories} />
        <SiteFooter restaurant={menu.restaurant} />
      </main>
      <UrlSheets menu={menu} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildRestaurantJsonLd(menu, process.env.SITE_URL)) }} />
    </>
  );
}
```

- [ ] **Passo 5: rodar todos os testes, o lint, os tipos e o build**. Rodar `npm test && npm run lint && npm run typecheck && npm run build`. Esperado: tudo PASSA, e o build lista `○ /` como página estática (ou ISR com revalidate de 1h).

- [ ] **Passo 6: conferir no navegador.** Rodar `npm run dev` e abrir `localhost:3000` no tamanho 390×844 (Playwright ou Chrome). Conferir o topo, as promoções, as abas fixas, o detalhe (`?prato=batatao-divino`), a busca e as informações. Ajustar espaçamentos se algo destoar do mockup A.

- [ ] **Passo 7: commit.** `git add -A && git commit -m "feat(app): página do cardápio completa com painéis, promoções e JSON-LD"`

---

### Tarefa 12: PWA (Serwist, manifest, ícones e offline) e testes de ponta a ponta

**Arquivos:**
- Criar:
  - PWA: `src/app/sw.ts`, `src/app/serwist/[path]/route.ts`, `src/app/~offline/page.tsx`, `src/app/manifest.ts`, `src/app/_components/offline-banner.tsx`
  - Ícones: `scripts/generate-icons.ps1`, `public/icons/*.png`, `src/app/icon.png`, `src/app/apple-icon.png`
  - E2E: `playwright.config.ts`, `tests/e2e/menu.spec.ts`, `tests/e2e/a11y.spec.ts`, `tests/e2e/offline.spec.ts`
- Modificar: `next.config.ts`, `src/app/layout.tsx`, `tsconfig.json`
- Remover: `src/app/favicon.ico`
- Teste: `src/app/manifest.test.ts`, `src/app/_components/offline-banner.test.tsx`, E2E

**Interfaces:**
- Produz: `manifest(): MetadataRoute.Manifest` e `OfflineBanner()`

- [ ] **Passo 1: instalar e escrever os testes de unidade que falham**

```bash
npm install -D @serwist/turbopack@9.5.12 serwist@9.5.12 esbuild
npx playwright install chromium
```

`src/app/manifest.test.ts`:
```ts
import { expect, it } from "vitest";
import manifest from "./manifest";

it("manifest do PWA com as cores do tema A e ícones", () => {
  const m = manifest();
  expect(m).toMatchObject({ name: "Divino Fogão · Cardápio", short_name: "Divino Fogão", start_url: "/", display: "standalone", theme_color: "#6b1d22", background_color: "#f4eee4", lang: "pt-BR" });
  expect(m.icons?.map((i) => i.sizes)).toEqual(["192x192", "512x512", "512x512"]);
});
```

`src/app/_components/offline-banner.test.tsx`:
```tsx
import { act, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { OfflineBanner } from "./offline-banner";

afterEach(() => vi.restoreAllMocks());

it("aparece quando a conexão cai e some quando volta", () => {
  const onLine = vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
  render(<OfflineBanner />);
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  onLine.mockReturnValue(false);
  act(() => void window.dispatchEvent(new Event("offline")));
  expect(screen.getByRole("status")).toHaveTextContent("Você está offline");
  onLine.mockReturnValue(true);
  act(() => void window.dispatchEvent(new Event("online")));
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
});
```

Rodar `npx vitest run src/app`. Esperado: FALHA, módulos não encontrados.

- [ ] **Passo 2: escrever os testes de ponta a ponta**, que falham até a Tarefa 12 terminar

`playwright.config.ts`:
```ts
import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"]],
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure" },
  projects: [
    { name: "iphone-12", use: { ...devices["iPhone 12"], browserName: "chromium" } },
    { name: "pixel-7", use: { ...devices["Pixel 7"] } },
  ],
  webServer: { command: `npm run build && npm run start -- -p ${PORT}`, url: `http://localhost:${PORT}`, reuseExistingServer: !process.env.CI, timeout: 240_000 },
});
```

`tests/e2e/menu.spec.ts`:
```ts
import { expect, test } from "@playwright/test";

test("carrega o cardápio com topo, promoções e abas", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Divino Fogão" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Promoções" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Categorias do cardápio" })).toBeVisible();
});

test("tocar numa aba rola até a seção", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Parmegianas" }).click();
  await expect(page.getByRole("heading", { level: 2, name: "Parmegianas" })).toBeInViewport();
});

test("abre o prato e fecha com o voltar e com o botão", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Divina Porção/ }).first().click();
  await expect(page.getByRole("dialog", { name: "Divina Porção" })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page).toHaveURL(/\/$/);
  await page.getByRole("button", { name: /Divina Porção/ }).first().click();
  await page.getByRole("button", { name: "Fechar" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
});

test("link direto para o prato abre e fechar continua no site", async ({ page }) => {
  await page.goto("/?prato=batatao-divino");
  await expect(page.getByRole("dialog", { name: "Batatão Divino" })).toBeVisible();
  await page.getByRole("button", { name: "Fechar" }).click();
  await expect(page).toHaveURL(/localhost:3100\/$/);
  await expect(page.getByRole("heading", { level: 1, name: "Divino Fogão" })).toBeVisible();
});

test("busca encontra parmegianas e trata o vazio", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Buscar no cardápio" }).click();
  const box = page.getByRole("searchbox", { name: "Buscar no cardápio" });
  await box.fill("parmegiana");
  await expect(page.getByRole("dialog").getByRole("button", { name: /Parmegiana de/ })).toHaveCount(4);
  await box.fill("xyz");
  await expect(page.getByText("Nada encontrado para “xyz”")).toBeVisible();
});

test("informações da loja", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Informações da loja" }).click();
  const dialog = page.getByRole("dialog", { name: "Informações" });
  await expect(dialog.getByText("Não aceitamos Banrisul.")).toBeVisible();
});

test("tela de 344 px (Galaxy Fold) não tem rolagem horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 344, height: 882 });
  await page.goto("/");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
```

`tests/e2e/a11y.spec.ts`:
```ts
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const seriousViolations = async (page: import("@playwright/test").Page) => {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  return results.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
};

test("cardápio sem violações graves", async ({ page }) => {
  await page.goto("/");
  expect(await seriousViolations(page)).toEqual([]);
});

test("detalhe do prato sem violações graves", async ({ page }) => {
  await page.goto("/?prato=batatao-divino");
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(await seriousViolations(page)).toEqual([]);
});

test("informações sem violações graves", async ({ page }) => {
  await page.goto("/?info");
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(await seriousViolations(page)).toEqual([]);
});
```

`tests/e2e/offline.spec.ts`:
```ts
import { expect, test } from "@playwright/test";

test("sem internet, mostra o cardápio salvo e o aviso", async ({ page, context }) => {
  await page.goto("/");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload(); // página visitada fica em cache (cacheOnNavigation)
  await page.waitForTimeout(500);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "Divino Fogão" })).toBeVisible();
  await expect(page.getByRole("status")).toContainText("Você está offline");
  await context.setOffline(false);
});
```

- [ ] **Passo 3: implementar o PWA**

`next.config.ts`:
```ts
import { withSerwist } from "@serwist/turbopack";
import type { NextConfig } from "next";

const supabaseHost = process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).hostname : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHost ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }] : [],
  },
};

export default withSerwist(nextConfig);
```

`src/app/sw.ts`:
```ts
/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { defaultCache } from "@serwist/turbopack/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [{ url: "/~offline", matcher: ({ request }) => request.destination === "document" }],
  },
});

serwist.addEventListeners();
```

`src/app/serwist/[path]/route.ts`:
```ts
import { spawnSync } from "node:child_process";
import { createSerwistRoute } from "@serwist/turbopack";

const revision = spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout?.trim() || crypto.randomUUID();

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } = createSerwistRoute({
  additionalPrecacheEntries: [{ url: "/~offline", revision }],
  swSrc: "src/app/sw.ts",
  useNativeEsbuild: true,
});
```

`src/app/~offline/page.tsx`:
```tsx
export default function Offline() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-[28px] font-semibold text-brand">Você está offline</h1>
      <p className="mt-2 text-[15px] text-ink-muted">Conecte-se à internet para ver o cardápio atualizado.</p>
    </main>
  );
}
```

`src/app/manifest.ts`:
```ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Divino Fogão · Cardápio",
    short_name: "Divino Fogão",
    description: "Cardápio digital do Divino Fogão – São Leopoldo",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    theme_color: "#6b1d22",
    background_color: "#f4eee4",
    lang: "pt-BR",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
```

`src/app/_components/offline-banner.tsx`:
```tsx
"use client";

import { useSyncExternalStore } from "react";
import { WifiOffIcon } from "@/ui";

const subscribe = (cb: () => void) => {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
};

export function OfflineBanner() {
  const online = useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
  if (online) return null;
  return (
    <div role="status" className="fixed inset-x-0 bottom-4 z-50 mx-auto flex w-fit max-w-[92%] items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-[13px] font-semibold text-surface shadow-lg">
      <WifiOffIcon className="size-4" /> Você está offline — mostrando o cardápio salvo
    </div>
  );
}
```

`src/app/layout.tsx`: envolver o `body` com o provider e o aviso:
```tsx
import { SerwistProvider } from "@serwist/turbopack/react";
import { OfflineBanner } from "./_components/offline-banner";
// …
      <body className="min-h-dvh bg-bg font-sans text-ink antialiased">
        <SerwistProvider swUrl="/serwist/sw.js" disable={process.env.NODE_ENV === "development"} cacheOnNavigation reloadOnOnline={false}>
          {children}
          <OfflineBanner />
        </SerwistProvider>
      </body>
```

`tsconfig.json`: acrescentar `"webworker"` em `"lib"` (`["dom", "dom.iterable", "esnext", "webworker"]`). Se o `tsc` acusar conflito entre as libs DOM e WebWorker, tirar `webworker` do `lib`, excluir `src/app/sw.ts` do `tsconfig.json` e criar um `tsconfig.sw.json` só para ele (`"lib": ["esnext", "webworker"]`), com `typecheck` rodando `tsc --noEmit && tsc --noEmit -p tsconfig.sw.json`.

- [ ] **Passo 4: gerar os ícones**, `scripts/generate-icons.ps1`

```powershell
# Gera ícones do PWA: monograma "DF" em creme sobre bordô (tema A).
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
$bordo = [System.Drawing.ColorTranslator]::FromHtml("#6B1D22")
$creme = [System.Drawing.ColorTranslator]::FromHtml("#F4EEE4")
New-Item -ItemType Directory -Force -Path "$root\public\icons" | Out-Null

function New-Icon([int]$size, [string]$path, [double]$scale) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = "AntiAlias"; $g.TextRenderingHint = "AntiAliasGridFit"
  $g.Clear($bordo)
  $font = New-Object System.Drawing.Font "Georgia", ([float]($size * 0.42 * $scale)), ([System.Drawing.FontStyle]::Bold)
  $fmt = New-Object System.Drawing.StringFormat
  $fmt.Alignment = "Center"; $fmt.LineAlignment = "Center"
  $brush = New-Object System.Drawing.SolidBrush $creme
  $g.DrawString("DF", $font, $brush, (New-Object System.Drawing.RectangleF 0, ($size * 0.03), $size, $size), $fmt)
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
}

New-Icon 192 "$root\public\icons\icon-192.png" 1.0
New-Icon 512 "$root\public\icons\icon-512.png" 1.0
New-Icon 512 "$root\public\icons\maskable-512.png" 0.72
New-Icon 180 "$root\src\app\apple-icon.png" 1.0
New-Icon 64 "$root\src\app\icon.png" 1.0
Write-Output "ícones gerados"
```

Rodar `npm run icons && rm -f src/app/favicon.ico`.

- [ ] **Passo 5: rodar a bateria inteira**. Rodar:
```bash
npm test && npm run lint && npm run typecheck && npm run build && npm run test:e2e
```
Esperado: tudo PASSA, nos 2 projetos do Playwright (iPhone 12 e Pixel 7).

- [ ] **Passo 6: commit.** `git add -A && git commit -m "feat(pwa): Serwist, manifest, ícones, aviso offline e testes E2E + axe"`

---

### Tarefa 13: CI, README e verificação final

**Arquivos:**
- Criar: `.github/workflows/ci.yml`, `README.md`
- Modificar: a especificação (ajustes menores que surgirem na implementação)

- [ ] **Passo 1: criar o CI**, `.github/workflows/ci.yml`

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
jobs:
  qualidade:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
```

- [ ] **Passo 2: escrever o README.md em português**, com estas seções: o que é o projeto; como rodar (`npm install`, `npm run dev` → Mobile Viewer em `localhost:3000`, preset iPhone 12 Pro); scripts; arquitetura (camadas e o contrato do repositório); dados (seed, `npm run seed:sql` e o aviso ⛔ de nunca aplicar no Supabase sem autorização); fotos de desenvolvimento ignoradas pelo git; PWA (`npm run build && npm start`); pendências antes do lançamento (a seção 11 da especificação).

- [ ] **Passo 3: verificação final**
```bash
npm test && npm run lint && npm run typecheck && npm run build && npm run test:e2e
git status --short   # limpo
git log --format='%an <%ae> %s' | sort -u | head   # só Maxx <…sout-MMdev…>
```
Opcional: Lighthouse mobile com `npm run start -- -p 3200` e `npx lighthouse http://localhost:3200 --form-factor=mobile --only-categories=performance,accessibility --chrome-flags="--headless=new" --quiet --output=json --output-path=./lighthouse.json`. Registrar as notas no README e apagar o JSON.

- [ ] **Passo 4: commit.** `git add -A && git commit -m "docs: README, CI e verificação final"`
