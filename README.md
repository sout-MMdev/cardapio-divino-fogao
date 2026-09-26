# Cardápio Digital · Divino Fogão São Leopoldo

Cardápio digital (PWA) do **Divino Fogão – Comida da Fazenda**, unidade Bourbon Shopping São Leopoldo. O cliente abre pelo **QR code da mesa**, sem instalar nada. É **só consulta** (sem pedido e sem pagamento).

- Especificação: [`docs/superpowers/specs/2026-09-26-cardapio-divino-fogao-design.md`](docs/superpowers/specs/2026-09-26-cardapio-divino-fogao-design.md)
- Plano de implementação: [`docs/superpowers/plans/2026-09-26-cardapio-divino-fogao.md`](docs/superpowers/plans/2026-09-26-cardapio-divino-fogao.md)

## Como rodar

```bash
npm install
npm run dev
```

Abra o **Mobile Viewer** no VS Code (`Mobile Viewer: Open Preview`), digite `localhost:3000` e escolha o preset **iPhone 12 Pro**. As alterações aparecem ao vivo.

> Sem nenhuma configuração, o app usa os **dados locais** (`MENU_SOURCE=seed`). Não precisa de banco nem de `.env`.

Para testar como PWA (instalável, funciona offline):

```bash
npm run build && npm start
```

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento (service worker desligado) |
| `npm run build` / `npm start` | build de produção / servidor de produção |
| `npm test` | testes de unidade e de componentes (Vitest) |
| `npm run test:e2e` | testes ponta a ponta em iPhone 12 e Pixel 7 + acessibilidade (Playwright + axe) |
| `npm run lint` | ESLint, incluindo as regras de camadas |
| `npm run typecheck` | gera os tipos de rota do Next e roda o `tsc` |
| `npm run seed:sql` | gera `supabase/seed.sql` a partir de `src/data/seed/menu.ts` |
| `npm run icons` | gera os ícones do PWA (PowerShell) |

## Arquitetura

```
src/
├─ app/         rotas (camada fina): página, layout, PWA, painéis por URL
├─ features/    menu · restaurant · promotions (cada uma com index.ts público)
├─ domain/      tipos e regras puras: preço, horário (fuso SP), busca; schema.ts = Zod (só servidor)
├─ data/        MenuRepository → seed (padrão) | supabase (preparado)
├─ ui/          peças do tema A: Sheet (<dialog> nativo), Chip, DishPhoto, DottedPriceRow…
├─ lib/         env, painéis na URL (?prato, ?info, ?busca), relógio
└─ styles/      tokens do tema A (cores, fontes, raios)
```

- **O fluxo vai sempre num sentido:** `app → features → domain`. `ui/` e `lib/` são compartilhados, e só `app/` usa `data/`. O **ESLint** impede atalhos: `domain` não importa React ou Supabase, e código de interface não importa o Zod.
- **As telas só conhecem o `MenuRepository`.** Para trocar os dados locais pelo Supabase, basta configurar a variável `MENU_SOURCE=supabase`, sem mexer em nenhuma tela. A mesma bateria de testes de contrato roda nas duas versões.
- **Os painéis têm endereço próprio:** `/?prato=batatao-divino`, `/?info` e `/?busca=chopp`. O "voltar" do celular fecha o painel, e quem chega por link direto fecha sem sair do site.

## Dados

- O cardápio foi transcrito do impresso e está em [`src/data/seed/menu.ts`](src/data/seed/menu.ts): 56 itens, 9 categorias e 4 promoções.
- O Supabase está **preparado, mas não aplicado**:
  - [`supabase/migrations/…_menu_schema.sql`](supabase/migrations): tabelas, RLS com leitura pública e bucket `menu-photos`.
  - [`supabase/seed.sql`](supabase/seed.sql): gerado pelo `npm run seed:sql`.

> ⛔ **Não aplique** as migrations nem o seed em nenhum projeto Supabase (e nunca no da empresa) sem autorização do dono do projeto. Nada foi publicado ainda.

**Fotos:** as de desenvolvimento, tiradas do Google Maps, ficam em `public/menu-photos/`. Essa pasta é **ignorada pelo git**, porque as fotos são de terceiros. Sem elas, o layout sem foto assume sozinho. As fotos oficiais devem vir do restaurante.

## Qualidade (medida em 26/09/2026)

- **96 testes** de unidade e de componentes, e **24 testes ponta a ponta** (12 cenários × 2 aparelhos), incluindo offline e axe.
- **Lighthouse mobile** (build de produção):
  - Desempenho **92–93**
  - Acessibilidade **100**
  - Boas práticas **100**
  - SEO **100**

## Antes do lançamento

1. **Confirmar o horário de funcionamento.** O seed usa horários **provisórios**, marcados com `OPENING_HOURS_ARE_PROVISIONAL`.
2. **Preços da Parmegiana de tilápia e da de berinjela**, que estão cobertos por adesivo no impresso. Hoje aparecem como "Consulte o preço".
3. **Oferta "ganhe 1 chopp 400 ml":** confirmar se vale só para o Batatão Divino.
4. **Fotos oficiais e descrições** dos pratos, e quais pratos marcar como "mais pedido".
5. **Com autorização:** projeto Supabase, hospedagem (Vercel Pro ou Cloudflare), domínio e QR codes.

## Git

Os commits usam a identidade pessoal `Maxx <216940663+sout-MMdev@users.noreply.github.com>`. Um repositório remoto, se for criado, deve ficar só na conta **sout-MMdev**.
