@AGENTS.md

# Cardápio Divino Fogão — regras do projeto

- ⛔ Nunca aplicar nada em Supabase (link, db push, SQL remoto, seed remoto, MCP) nem publicar deploy sem autorização explícita do dono.
- Commits pessoais: `Maxx <216940663+sout-MMdev@users.noreply.github.com>`. Nada da identidade da empresa. GitHub só na conta sout-MMdev.
- Camadas: `app → features → domain`; `ui/` e `lib/` compartilhados; `data/` só é usado por `app/`. O ESLint garante isso.
- Especificação: `docs/superpowers/specs/2026-09-26-cardapio-divino-fogao-design.md`. Plano: `docs/superpowers/plans/2026-09-26-cardapio-divino-fogao.md`.
- Rodar: `npm run dev` → Mobile Viewer em `localhost:3000` (preset iPhone 12 Pro).
