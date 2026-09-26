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
