-- Dropicards : base des comptes (étape 1 de docs/24 §8, 2026-11-06).
-- À coller une fois dans Supabase › SQL Editor › New query, puis « Run ». Rejouable sans risque : chaque objet
-- n'est créé que s'il manque (les règles d'accès et les fonctions sont remplacées par leur dernière version).
-- Principes :
--   - chaque utilisateur ne lit et n'écrit que ses propres lignes (Row Level Security) ;
--   - le rôle « admin » ne se donne qu'à la main (fin du fichier) ou par un admin, avec un motif enregistré ;
--   - PK, PA, Pokédex et tickets ne sont jamais écrits par l'app : seulement par des fonctions du serveur
--     (anti-triche ; les fonctions des gains arrivent à l'étape 3) ;
--   - le journal des admins ne peut être ni modifié ni effacé, même par l'administrateur technique.

-- 1. Profils : un par compte, créé automatiquement à l'inscription.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  pseudo text check (pseudo is null or char_length(pseudo) between 2 and 24),
  age_range text check (age_range is null or age_range in ('u15', '15-25', '25-35', '35+')),
  starter int,
  buddy int,
  role text not null default 'user' check (role in ('user', 'admin')),
  status text not null default 'active' check (status in ('active', 'suspended')),
  news_optin boolean not null default false,          -- accord pour les e-mails de nouveautés (RGPD)
  news_optin_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Collection : chaque carte ou produit scellé possédé.
create table if not exists public.collection_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null check (kind in ('card', 'sealed')),
  item_id text not null check (char_length(item_id) between 1 and 80),
  qty int not null default 1 check (qty between 1 and 9999),
  condition text check (condition is null or condition in ('M', 'NM', 'EX', 'GD', 'PL', 'PO')),
  lang text check (lang is null or char_length(lang) <= 8),
  grade_company text check (grade_company is null or grade_company in ('PCA', 'CCC', 'PSA')),
  grade_note text check (grade_note is null or char_length(grade_note) <= 16),
  price_paid numeric(10, 2) check (price_paid is null or price_paid >= 0),
  added_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists collection_items_user on public.collection_items (user_id);

-- 3. Porte-monnaie : PK, PA, série des PA du jour, derniers jeux.
create table if not exists public.wallets (
  user_id uuid primary key references auth.users (id) on delete cascade,
  pk int not null default 0 check (pk >= 0),
  pa int not null default 0 check (pa >= 0),
  pk_earned int not null default 0 check (pk_earned >= 0),   -- PK gagnés au total (grades)
  pa_streak int not null default 0,
  pa_day date,
  games jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 4. Pokédex : Pokémon débloqués.
create table if not exists public.dex_unlocks (
  user_id uuid not null references auth.users (id) on delete cascade,
  pokemon int not null check (pokemon between 1 and 20000),
  unlocked_at timestamptz not null default now(),
  primary key (user_id, pokemon)
);

-- 5. Tickets du tirage au sort.
create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  item text not null,
  cost_pk int not null check (cost_pk >= 0),
  bought_at timestamptz not null default now(),
  draw_id uuid
);
create index if not exists tickets_user on public.tickets (user_id);

-- 6. Journal des admins : ajout seulement.
create table if not exists public.admin_log (
  id bigint generated always as identity primary key,
  admin_id uuid references auth.users (id) on delete set null,
  action text not null,
  target_user uuid,
  details jsonb not null default '{}'::jsonb,
  reason text not null check (char_length(reason) between 3 and 500),
  at timestamptz not null default now()
);

-- Le journal ne se modifie ni ne s'efface (même par le compte technique de Supabase).
create or replace function public.admin_log_readonly() returns trigger language plpgsql set search_path = '' as $$
begin
  raise exception 'Le journal des admins ne peut être ni modifié ni effacé';
end; $$;
drop trigger if exists admin_log_no_change on public.admin_log;
create trigger admin_log_no_change before update or delete on public.admin_log
  for each row execute function public.admin_log_readonly();

-- Date de mise à jour automatique.
create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end; $$;
drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
drop trigger if exists collection_touch on public.collection_items;
create trigger collection_touch before update on public.collection_items for each row execute function public.touch_updated_at();

-- Accord pour les nouveautés : date enregistrée à chaque changement ; jamais pour les moins de 15 ans.
create or replace function public.profiles_news_rules() returns trigger language plpgsql set search_path = '' as $$
begin
  if new.age_range = 'u15' then
    new.news_optin := false;
  end if;
  if tg_op = 'INSERT' or new.news_optin is distinct from old.news_optin then
    new.news_optin_at := case when new.news_optin then now() else null end;
  end if;
  return new;
end; $$;
drop trigger if exists profiles_news on public.profiles;
create trigger profiles_news before insert or update on public.profiles for each row execute function public.profiles_news_rules();

-- À l'inscription : profil et porte-monnaie créés, 100 PK de bienvenue.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  insert into public.wallets (user_id, pk, pk_earned) values (new.id, 100, 100) on conflict (user_id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Est-ce un admin actif ?
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin' and status = 'active');
$$;

-- Règles d'accès ligne par ligne.
alter table public.profiles enable row level security;
alter table public.collection_items enable row level security;
alter table public.wallets enable row level security;
alter table public.dex_unlocks enable row level security;
alter table public.tickets enable row level security;
alter table public.admin_log enable row level security;

-- Droits de base : rien pour les visiteurs non connectés ; les colonnes sensibles hors de portée de l'app.
revoke all on public.profiles, public.collection_items, public.wallets, public.dex_unlocks, public.tickets, public.admin_log from anon, authenticated;
grant select on public.profiles, public.collection_items, public.wallets, public.dex_unlocks, public.tickets, public.admin_log to authenticated;
grant update (pseudo, age_range, starter, buddy, news_optin) on public.profiles to authenticated;
grant insert, update, delete on public.collection_items to authenticated;

drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists items_read on public.collection_items;
create policy items_read on public.collection_items for select to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists items_insert_own on public.collection_items;
create policy items_insert_own on public.collection_items for insert to authenticated with check (user_id = auth.uid());
drop policy if exists items_update_own on public.collection_items;
create policy items_update_own on public.collection_items for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists items_delete_own on public.collection_items;
create policy items_delete_own on public.collection_items for delete to authenticated using (user_id = auth.uid());

drop policy if exists wallets_read on public.wallets;
create policy wallets_read on public.wallets for select to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists dex_read on public.dex_unlocks;
create policy dex_read on public.dex_unlocks for select to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists tickets_read on public.tickets;
create policy tickets_read on public.tickets for select to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists admin_log_read on public.admin_log;
create policy admin_log_read on public.admin_log for select to authenticated using (public.is_admin());

-- Outils admin (étape 4 : branchés sur l'espace admin). Toujours un motif, toujours dans le journal.
create or replace function public.admin_adjust_wallet(target uuid, delta_pk int, delta_pa int, reason text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Réservé aux admins'; end if;
  if reason is null or char_length(trim(reason)) < 3 then raise exception 'Motif obligatoire'; end if;
  update public.wallets set pk = greatest(0, pk + coalesce(delta_pk, 0)), pa = greatest(0, pa + coalesce(delta_pa, 0)),
    pk_earned = pk_earned + greatest(0, coalesce(delta_pk, 0)), updated_at = now()
  where user_id = target;
  if not found then raise exception 'Compte introuvable'; end if;
  insert into public.admin_log (admin_id, action, target_user, details, reason)
  values (auth.uid(), 'wallet', target, jsonb_build_object('pk', delta_pk, 'pa', delta_pa), trim(reason));
end; $$;

create or replace function public.admin_set_status(target uuid, new_status text, reason text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Réservé aux admins'; end if;
  if reason is null or char_length(trim(reason)) < 3 then raise exception 'Motif obligatoire'; end if;
  if target = auth.uid() then raise exception 'Impossible sur son propre compte'; end if;
  update public.profiles set status = new_status where id = target;
  if not found then raise exception 'Compte introuvable'; end if;
  insert into public.admin_log (admin_id, action, target_user, details, reason)
  values (auth.uid(), 'status', target, jsonb_build_object('status', new_status), trim(reason));
end; $$;

create or replace function public.admin_set_role(target uuid, new_role text, reason text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Réservé aux admins'; end if;
  if reason is null or char_length(trim(reason)) < 3 then raise exception 'Motif obligatoire'; end if;
  if target = auth.uid() then raise exception 'Impossible sur son propre compte'; end if;
  update public.profiles set role = new_role where id = target;
  if not found then raise exception 'Compte introuvable'; end if;
  insert into public.admin_log (admin_id, action, target_user, details, reason)
  values (auth.uid(), 'role', target, jsonb_build_object('role', new_role), trim(reason));
end; $$;

-- Liste des comptes pour l'espace admin (e-mail compris), et export des adresses qui ont accepté les nouveautés.
create or replace function public.admin_list_users() returns table (
  id uuid, email text, email_confirmed boolean, pseudo text, age_range text, role text, status text,
  news_optin boolean, created_at timestamptz, last_sign_in_at timestamptz, pk int, pa int, items bigint)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Réservé aux admins'; end if;
  return query
    select u.id, u.email::text, u.email_confirmed_at is not null, p.pseudo, p.age_range, p.role, p.status, p.news_optin,
           u.created_at, u.last_sign_in_at, w.pk, w.pa,
           (select count(*) from public.collection_items c where c.user_id = u.id)
    from auth.users u
    left join public.profiles p on p.id = u.id
    left join public.wallets w on w.user_id = u.id
    order by u.created_at desc;
end; $$;

create or replace function public.admin_news_emails() returns table (email text, pseudo text, optin_at timestamptz)
language plpgsql volatile security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Réservé aux admins'; end if;
  insert into public.admin_log (admin_id, action, details, reason)
  values (auth.uid(), 'export_news', '{}'::jsonb, 'Export des adresses ayant accepté les nouveautés');
  return query
    select u.email::text, p.pseudo, p.news_optin_at
    from auth.users u join public.profiles p on p.id = u.id
    where p.news_optin and p.status = 'active' and u.email_confirmed_at is not null
    order by p.news_optin_at;
end; $$;

revoke all on function public.admin_adjust_wallet(uuid, int, int, text), public.admin_set_status(uuid, text, text),
  public.admin_set_role(uuid, text, text), public.admin_list_users(), public.admin_news_emails() from public, anon;
grant execute on function public.admin_adjust_wallet(uuid, int, int, text), public.admin_set_status(uuid, text, text),
  public.admin_set_role(uuid, text, text), public.admin_list_users(), public.admin_news_emails() to authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;

-- 7. Premier admin (une seule fois, après avoir créé ton compte dans Authentication › Users) :
--    remplace l'adresse ci-dessous par la tienne, puis lance uniquement ces deux lignes.
-- update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'TON-ADRESSE@exemple.fr');
-- insert into public.admin_log (admin_id, action, target_user, reason) select id, 'role', id, 'Premier admin, désigné à la main' from auth.users where email = 'TON-ADRESSE@exemple.fr';
