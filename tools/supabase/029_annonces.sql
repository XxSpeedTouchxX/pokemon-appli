-- 029 : annonces en cours reprises de Vinted (puis d'eBay) pour le fil « Annonces » de l'app (2026-11-14, « go » du
-- porteur pour Vinted ; proposition docs/41, guide docs/42). Indépendant des scripts de jeu : il faut seulement les rôles
-- de Supabase (anon, authenticated, service_role). Rejouable (Studio › SQL Editor › Run).
--   - public.listings : une ligne par annonce (source, identifiant chez la source, titre, prix demandé, photo, lien,
--     état, lot), écrite seulement par la fonction du serveur « annonces » (clé service_role) ; lue par tout le monde
--     (annonces publiques), seulement les annonces actives. Aucun nom ni avatar de vendeur n'est gardé (RGPD).
--   - public.listing_runs : un passage de la fonction par ligne (pour l'écart minimal entre deux passages et le
--     diagnostic) ; lu seulement par le serveur et par listings_status().
--   - Une annonce plus revue depuis 2 jours passe inactive (souvent vendue ou retirée) ; effacée après 14 jours.
--   - Passage automatique toutes les 30 minutes avec pg_cron et pg_net (déjà fournis par l'image de Supabase) ; si ces
--     extensions manquent, le reste s'installe quand même et un message le dit (la fonction peut aussi être appelée à
--     la main : https://api.dropicards.fr/functions/v1/annonces/vinted).
-- Le prix d'une annonce est un PRIX DEMANDÉ : il ne compte jamais dans la cote (principe 3, décision du 2026-10-18).

-- 1. Annonces
create table if not exists public.listings (
  id bigint generated always as identity primary key,
  source text not null check (source in ('vinted', 'ebay', 'dropicards')),
  ext_id text not null check (length(ext_id) between 1 and 64),
  title text not null check (length(title) between 1 and 200),
  price numeric(10, 2) not null check (price >= 0 and price < 1000000),
  total_price numeric(10, 2) check (total_price is null or (total_price >= 0 and total_price < 1000000)),
  currency text not null default 'EUR' check (currency ~ '^[A-Z]{3}$'),
  photo text check (photo is null or photo ~ '^https://'),
  url text not null check (url ~ '^https://'),
  brand text,
  cond text,
  is_lot boolean not null default false,
  lot_count int check (lot_count is null or lot_count between 2 and 100000),
  kind text not null default 'card' check (kind in ('card', 'lot', 'sealed', 'graded')),
  query text,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  active boolean not null default true,
  unique (source, ext_id)
);
create index if not exists listings_feed on public.listings (active, first_seen desc);
create index if not exists listings_price on public.listings (active, price);
create index if not exists listings_seen on public.listings (source, last_seen);

alter table public.listings enable row level security;
drop policy if exists listings_read on public.listings;
create policy listings_read on public.listings for select to anon, authenticated using (active);
revoke all on public.listings from anon, authenticated;
grant select (id, source, ext_id, title, price, total_price, currency, photo, url, brand, cond, is_lot, lot_count, kind, first_seen, last_seen)
  on public.listings to anon, authenticated;
grant all on public.listings to service_role;

-- 2. Passages de la fonction
create table if not exists public.listing_runs (
  id bigint generated always as identity primary key,
  source text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  ok boolean,
  fetched int not null default 0,
  saved int not null default 0,
  detail jsonb not null default '{}'::jsonb
);
create index if not exists listing_runs_last on public.listing_runs (source, started_at desc);
alter table public.listing_runs enable row level security;
revoke all on public.listing_runs from anon, authenticated;
grant all on public.listing_runs to service_role;

-- 3. Début d'un passage : refusé (null) si le précédent a commencé il y a moins de « gap_min » minutes (plusieurs appels
--    en même temps ne lancent qu'un passage). Serveur seulement.
create or replace function public.listings_run_begin(src text, gap_min int default 20)
returns bigint language plpgsql security definer set search_path = public, pg_temp as $$
declare last_at timestamptz; rid bigint;
begin
  if src not in ('vinted', 'ebay') then raise exception 'source inconnue'; end if;
  perform pg_advisory_xact_lock(hashtext('listings_run_' || src));
  select started_at into last_at from public.listing_runs where source = src order by started_at desc limit 1;
  if last_at is not null and last_at > now() - make_interval(mins => greatest(0, gap_min)) then return null; end if;
  insert into public.listing_runs (source) values (src) returning id into rid;
  delete from public.listing_runs where source = src and started_at < now() - interval '30 days';
  return rid;
end; $$;

-- 4. Enregistrement des annonces trouvées : ajout ou mise à jour (prix, photo, revue maintenant), puis annonces plus
--    revues depuis 2 jours passées inactives, et effacées après 14 jours. Renvoie le nombre d'annonces enregistrées.
--    Chaque champ est vérifié ici : une annonce mal formée est mise de côté sans bloquer les autres.
create or replace function public.listings_upsert(src text, items jsonb, q text default null)
returns int language plpgsql security definer set search_path = public, pg_temp as $$
declare it jsonb; n int := 0; t text; u text; ph text; pr numeric; tp numeric; lc int; k text;
begin
  if src not in ('vinted', 'ebay') then raise exception 'source inconnue'; end if;
  if jsonb_typeof(items) <> 'array' then raise exception 'liste attendue'; end if;
  for it in select * from jsonb_array_elements(items) loop
    begin
      t := left(btrim(regexp_replace(coalesce(it->>'title', ''), '\s+', ' ', 'g')), 200);
      u := it->>'url'; ph := nullif(it->>'photo', '');
      pr := round((it->>'price')::numeric, 2);
      tp := case when it ? 'total_price' and it->>'total_price' is not null then round((it->>'total_price')::numeric, 2) end;
      lc := case when it->>'lot_count' ~ '^\d{1,6}$' and (it->>'lot_count')::int between 2 and 100000 then (it->>'lot_count')::int end;
      k := coalesce(nullif(it->>'kind', ''), case when coalesce((it->>'is_lot')::boolean, false) then 'lot' else 'card' end);
      if t = '' or u !~ '^https://' or pr is null or pr < 0 or coalesce(it->>'id', '') !~ '^[A-Za-z0-9_-]{1,64}$' then continue; end if;
      if ph is not null and ph !~ '^https://' then ph := null; end if;
      if k not in ('card', 'lot', 'sealed', 'graded') then k := 'card'; end if;
      insert into public.listings as l (source, ext_id, title, price, total_price, currency, photo, url, brand, cond, is_lot, lot_count, kind, query)
      values (src, it->>'id', t, pr, tp, coalesce(nullif(upper(it->>'currency'), ''), 'EUR'), ph, u, left(it->>'brand', 80), left(it->>'cond', 60),
              coalesce((it->>'is_lot')::boolean, false), lc, k, left(q, 80))
      on conflict (source, ext_id) do update set title = excluded.title, price = excluded.price, total_price = excluded.total_price,
        currency = excluded.currency, photo = coalesce(excluded.photo, l.photo), url = excluded.url, brand = excluded.brand, cond = excluded.cond,
        is_lot = excluded.is_lot, lot_count = excluded.lot_count, kind = excluded.kind, last_seen = now(), active = true;
      n := n + 1;
    exception when others then
      raise notice 'annonce mise de côté (%): %', it->>'id', sqlerrm;
    end;
  end loop;
  update public.listings set active = false where source = src and active and last_seen < now() - interval '2 days';
  delete from public.listings where source = src and last_seen < now() - interval '14 days';
  return n;
end; $$;

-- 5. Fin d'un passage (résultat et diagnostic). Serveur seulement.
create or replace function public.listings_run_end(rid bigint, ok boolean, fetched int, saved int, detail jsonb default '{}'::jsonb)
returns void language sql security definer set search_path = public, pg_temp as $$
  update public.listing_runs set finished_at = now(), ok = listings_run_end.ok, fetched = greatest(0, listings_run_end.fetched),
    saved = greatest(0, listings_run_end.saved), detail = coalesce(listings_run_end.detail, '{}'::jsonb)
  where id = rid;
$$;

-- 6. État du fil pour l'app et le porteur (tout le monde) : par source, nombre d'annonces actives, dernier passage réussi,
--    dernier passage et son message. Aucune donnée personnelle.
create or replace function public.listings_status()
returns jsonb language sql stable security definer set search_path = public, pg_temp as $$
  select coalesce(jsonb_object_agg(s.source, jsonb_build_object(
    'active', (select count(*) from public.listings l where l.source = s.source and l.active),
    'last_ok', (select max(r.finished_at) from public.listing_runs r where r.source = s.source and r.ok),
    'last_run', (select jsonb_build_object('at', r.started_at, 'ok', r.ok, 'fetched', r.fetched, 'saved', r.saved, 'message', r.detail->>'message')
                 from public.listing_runs r where r.source = s.source order by r.started_at desc limit 1)
  )), '{}'::jsonb)
  from (values ('vinted'), ('ebay')) s(source);
$$;

revoke all on function public.listings_run_begin(text, int), public.listings_upsert(text, jsonb, text),
  public.listings_run_end(bigint, boolean, int, int, jsonb), public.listings_status() from public, anon, authenticated;
grant execute on function public.listings_run_begin(text, int), public.listings_upsert(text, jsonb, text),
  public.listings_run_end(bigint, boolean, int, int, jsonb) to service_role;
grant execute on function public.listings_status() to anon, authenticated, service_role;

-- 7. Passage automatique toutes les 30 minutes (pg_cron + pg_net de Supabase). La clé « anon » est publique (elle est
--    déjà dans l'app) ; la fonction refuse de toute façon deux passages à moins de 20 minutes d'écart.
do $cron$
declare anon text := 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc5Mzk1OTI2MCwiZXhwIjo0OTQ5NjMyODYwLCJyb2xlIjoiYW5vbiJ9.MHlBLPLkoVqE9-SnparqMbxnkG7cQpRngeSHC5HmZss';
begin
  begin create extension if not exists pg_net; exception when others then raise notice 'pg_net indisponible : %', sqlerrm; end;
  begin create extension if not exists pg_cron; exception when others then raise notice 'pg_cron indisponible : %', sqlerrm; end;
  if to_regnamespace('cron') is null or to_regnamespace('net') is null then
    raise notice 'Passage automatique NON programmé (pg_cron ou pg_net absent) : la fonction « annonces » reste appelable à la main.';
    return;
  end if;
  perform cron.schedule('annonces-vinted', '*/30 * * * *', format($job$select net.http_post(
      url := 'https://api.dropicards.fr/functions/v1/annonces/vinted',
      headers := jsonb_build_object('Content-Type', 'application/json', 'apikey', %L, 'Authorization', 'Bearer ' || %L),
      body := '{}'::jsonb, timeout_milliseconds := 90000)$job$, anon, anon));
  raise notice 'Passage automatique programmé : toutes les 30 minutes (tâche « annonces-vinted »).';
end $cron$;

notify pgrst, 'reload schema';
