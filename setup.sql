-- À coller dans Supabase > SQL Editor > Run (une seule fois)

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position int not null default 0,
  created_at timestamptz default now()
);

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete cascade,
  title text not null,
  description text,
  image_url text,
  available boolean not null default true,
  created_at timestamptz default now()
);

create table if not exists settings (
  id int primary key default 1 check (id = 1),
  site_name text default 'THE312RP',
  banner_url text,
  discord_url text
);
insert into settings (id) values (1) on conflict do nothing;

alter table categories enable row level security;
alter table items enable row level security;
alter table settings enable row level security;

-- Tout le monde peut lire
drop policy if exists "lecture publique categories" on categories;
create policy "lecture publique categories" on categories for select using (true);
drop policy if exists "lecture publique items" on items;
create policy "lecture publique items" on items for select using (true);
drop policy if exists "lecture publique settings" on settings;
create policy "lecture publique settings" on settings for select using (true);

-- Seul l'admin connecté peut modifier
drop policy if exists "admin categories" on categories;
create policy "admin categories" on categories for all to authenticated using (true) with check (true);
drop policy if exists "admin items" on items;
create policy "admin items" on items for all to authenticated using (true) with check (true);
drop policy if exists "admin settings" on settings;
create policy "admin settings" on settings for all to authenticated using (true) with check (true);

-- Stockage des images
insert into storage.buckets (id, name, public) values ('images', 'images', true) on conflict do nothing;

drop policy if exists "images lecture publique" on storage.objects;
create policy "images lecture publique" on storage.objects for select using (bucket_id = 'images');
drop policy if exists "images admin ajout" on storage.objects;
create policy "images admin ajout" on storage.objects for insert to authenticated with check (bucket_id = 'images');
drop policy if exists "images admin modif" on storage.objects;
create policy "images admin modif" on storage.objects for update to authenticated using (bucket_id = 'images');
drop policy if exists "images admin suppression" on storage.objects;
create policy "images admin suppression" on storage.objects for delete to authenticated using (bucket_id = 'images');
alter table settings add column if not exists background_url text;
alter table items add column if not exists images text[] not null default '{}';
notify pgrst, 'reload schema';
