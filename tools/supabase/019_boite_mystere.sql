-- 019 : boîte mystère au PK shop, scans bonus, un ticket par catégorie et par mois (2026-11-09, porteur).
-- Après 018. Rejouable (Studio › SQL Editor › Run).
--   - Les « 2XP PK » de 7, 14 et 30 jours ne s'achètent plus ; les 2XP se gagnent dans la boîte mystère.
--   - Boîte mystère : 300 PA (un admin déverrouillé ne paie rien). Lots et chances (porteur) :
--       2XP PK 3 jours 25 % · 2XP PK 7 jours 15 % · 2XP PK 10 jours 10 % · 300 PK 15 % · 20 scans bonus 20 %
--       Kyogre 5 % · Groudon 5 % · Rayquaza 5 % (aussi en vente dans le Pokédex à 1 000 PA chacun).
--     Un Pokémon déjà débloqué n'est jamais redonné : le tirage est refait parmi les autres lots (chances gardées en
--     proportion). Les 300 PK comptent dans les PK gagnés (grades, saison), comme tout gain.
--   - Scans bonus : gardés sur un compteur qui s'additionne ; quand les scans du jour sont finis, le joueur en prend 20.
--   - Tickets : un seul par catégorie (Bronze, Argent, Or) et par tirage, donc un par mois (« Ticket déjà acheté »).

-- 1. 2XP de 7, 14 et 30 jours retirés de la vente (la fonction reste, elle répond « Offre indisponible »).
update public.pk_boost_offers set active = false;

-- 2. Lots de la boîte mystère (chances modifiables ici seulement, en poids ; total 100).
create table if not exists public.mystery_lots (
  id text primary key,
  label text not null,
  weight int not null check (weight >= 0),
  xp_days int,
  pk int,
  scans int,
  pokemon int
);
insert into public.mystery_lots (id, label, weight, xp_days, pk, scans, pokemon) values
  ('xp-3', '2XP PK · 3 jours', 25, 3, null, null, null),
  ('xp-7', '2XP PK · 7 jours', 15, 7, null, null, null),
  ('xp-10', '2XP PK · 10 jours', 10, 10, null, null, null),
  ('pk-300', '300 PK', 15, null, 300, null, null),
  ('scans-20', '20 scans bonus', 20, null, null, 20, null),
  ('kyogre', 'Kyogre', 5, null, null, null, 382),
  ('groudon', 'Groudon', 5, null, null, null, 383),
  ('rayquaza', 'Rayquaza', 5, null, null, null, 384)
on conflict (id) do update set label = excluded.label, weight = excluded.weight, xp_days = excluded.xp_days, pk = excluded.pk,
  scans = excluded.scans, pokemon = excluded.pokemon;
alter table public.mystery_lots enable row level security;
drop policy if exists mystery_lots_read on public.mystery_lots;
create policy mystery_lots_read on public.mystery_lots for select to authenticated using (true);
revoke insert, update, delete on public.mystery_lots from public, anon, authenticated;
grant select on public.mystery_lots to authenticated;

-- Scans bonus de chaque joueur (écrits par le serveur seulement).
create table if not exists public.scan_bonus (
  user_id uuid primary key references auth.users (id) on delete cascade,
  scans int not null default 0 check (scans >= 0),
  updated_at timestamptz not null default now()
);
alter table public.scan_bonus enable row level security;
drop policy if exists scan_bonus_own on public.scan_bonus;
create policy scan_bonus_own on public.scan_bonus for select to authenticated using (user_id = auth.uid());
revoke insert, update, delete on public.scan_bonus from public, anon, authenticated;
grant select on public.scan_bonus to authenticated;

alter table public.ledger drop constraint if exists ledger_kind_check;
alter table public.ledger add constraint ledger_kind_check check (kind in ('welcome', 'reprise', 'share', 'pa_day', 'booster', 'coin',
  'unlock', 'shop', 'admin', 'purchase', 'avatar', 'boost', 'mystery', 'scan_bonus'));

-- 3. Ouvrir une boîte mystère.
create or replace function public.open_mystery_box(req uuid) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._game_begin(); r jsonb; lot public.mystery_lots%rowtype; tot int; x double precision; acc int := 0;
  nu timestamptz; cur timestamptz; left_scans int;
begin
  r := public._game_replay(uid, req); if r is not null then return r; end if;
  -- Lots possibles : sans les Pokémon déjà débloqués.
  select coalesce(sum(weight), 0) into tot from public.mystery_lots m
    where m.weight > 0 and (m.pokemon is null or not exists (select 1 from public.dex_unlocks d where d.user_id = uid and d.pokemon = m.pokemon));
  if tot <= 0 then raise exception 'Boîte mystère indisponible' using errcode = 'P0001'; end if;
  x := public._game_rand() * tot;
  for lot in select * from public.mystery_lots m
      where m.weight > 0 and (m.pokemon is null or not exists (select 1 from public.dex_unlocks d where d.user_id = uid and d.pokemon = m.pokemon))
      order by m.weight desc, m.id loop
    acc := acc + lot.weight;
    exit when x < acc;
  end loop;
  -- 300 PA débités (journal « mystery »), plus les PK gagnés s'il y en a.
  r := public._game_move(uid, 'mystery', coalesce(lot.pk, 0), -300, lot.id, req);
  if lot.xp_days is not null then
    select until into cur from public.pk_boosts where user_id = uid for update;
    nu := greatest(coalesce(cur, now()), now()) + make_interval(days => lot.xp_days);
    insert into public.pk_boosts (user_id, until) values (uid, nu) on conflict (user_id) do update set until = excluded.until, updated_at = now();
  end if;
  if lot.scans is not null then
    insert into public.scan_bonus (user_id, scans) values (uid, lot.scans)
    on conflict (user_id) do update set scans = public.scan_bonus.scans + excluded.scans, updated_at = now();
  end if;
  if lot.pokemon is not null then
    insert into public.dex_unlocks (user_id, pokemon) values (uid, lot.pokemon) on conflict do nothing;
  end if;
  select scans into left_scans from public.scan_bonus where user_id = uid;
  return r || jsonb_build_object('lot', lot.id, 'label', lot.label, 'xp_days', lot.xp_days, 'until', nu, 'won_pk', lot.pk,
    'pokemon', lot.pokemon, 'scan_bonus', coalesce(left_scans, 0));
end; $$;
revoke all on function public.open_mystery_box(uuid) from public, anon;
grant execute on function public.open_mystery_box(uuid) to authenticated;

-- Prendre 20 scans bonus (quand les scans du jour sont finis ; l'app compte les scans du jour).
create or replace function public.use_scan_bonus(req uuid) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._game_begin(); r jsonb; n int;
begin
  r := public._game_replay(uid, req); if r is not null then return r; end if;
  select scans into n from public.scan_bonus where user_id = uid for update;
  if coalesce(n, 0) < 20 then raise exception 'Pas de scans bonus' using errcode = 'P0001'; end if;
  update public.scan_bonus set scans = scans - 20, updated_at = now() where user_id = uid returning scans into n;
  r := public._game_move(uid, 'scan_bonus', 0, 0, '20 scans', req);
  return r || jsonb_build_object('added', 20, 'scan_bonus', n);
end; $$;
revoke all on function public.use_scan_bonus(uuid) from public, anon;
grant execute on function public.use_scan_bonus(uuid) to authenticated;

-- État : scans bonus et lots (pour l'app).
create or replace function public.mystery_state() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Connexion requise' using errcode = '28000'; end if;
  return jsonb_build_object('scan_bonus', coalesce((select scans from public.scan_bonus where user_id = uid), 0), 'price_pa', 300,
    'lots', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'label', label, 'weight', weight) order by weight desc, id) from public.mystery_lots), '[]'::jsonb));
end; $$;
revoke all on function public.mystery_state() from public, anon;
grant execute on function public.mystery_state() to authenticated;

-- 4. Achat (remplace 018) : en plus, un seul ticket par catégorie et par tirage (donc par mois).
create or replace function public.buy_item(item_id text, req uuid, choice text default null) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._game_begin(); it public.game_items%rowtype; conf timestamptz; r jsonb; st public.shop_stock%rowtype;
  free boolean := public._game_free(uid); d timestamptz; c text := nullif(btrim(coalesce(choice, '')), ''); gname text; used int;
begin
  r := public._game_replay(uid, req); if r is not null then return r; end if;
  select * into it from public.game_items where id = item_id and active;
  if not found then raise exception 'Article indisponible' using errcode = 'P0001'; end if;
  if not free and public._game_grade(uid) < it.min_grade then
    select name into gname from public.game_grades where i = it.min_grade;
    raise exception 'Tu dois d''abord déverrouiller le grade % pour avoir accès à cet article', gname using errcode = 'P0001';
  end if;
  select email_confirmed_at into conf from auth.users where id = uid;
  if not free and conf is null then raise exception 'Vérifie d''abord ton adresse e-mail pour participer aux tirages et recevoir tes lots' using errcode = 'P0001'; end if;
  if not free and conf > now() - interval '7 days' then raise exception 'Disponible 7 jours après la création de ton compte' using errcode = 'P0001'; end if;
  if it.kind = 'ticket' then
    d := public._game_next_draw(now());
    if not exists (select 1 from public.draw_prizes where draw_at = d and item = it.id) then
      raise exception 'Les cartes du prochain tirage ne sont pas encore annoncées : reviens bientôt' using errcode = 'P0001';
    end if;
    if c is null or not exists (select 1 from public.draw_prizes where draw_at = d and item = it.id and card = c) then
      raise exception 'Choisis la carte que tu veux gagner' using errcode = 'P0001';
    end if;
    if not free and exists (select 1 from public.tickets where user_id = uid and item = it.id and draw_at = d and cost_pk > 0) then
      raise exception 'Ticket déjà acheté : prochain ticket disponible %', public._shop_when(d) using errcode = 'P0001';
    end if;
  else
    if it.choices is not null and (c is null or not (c = any (it.choices))) then raise exception 'Choisis ton item' using errcode = 'P0001'; end if;
    if it.choices is null then c := null; end if;
    if not free then
      select * into st from public.shop_stock where item = it.id for update;
      if found then
        if exists (select 1 from public.tickets t join public.game_items i on i.id = t.item
            where t.user_id = uid and i.kind = 'lot' and t.cost_pk > 0 and t.bought_at >= public._shop_month_start(now())) then
          raise exception 'Tu as déjà fait ton achat du mois : prochain achat possible %', public._shop_when(public._shop_period_end(now(), 1)) using errcode = 'P0001';
        end if;
        select count(*) into used from public.tickets where item = it.id and cost_pk > 0 and bought_at >= public._shop_period(now(), st.months);
        if used >= st.qty then
          raise exception 'Épuisé : retour %', public._shop_when(public._shop_period_end(now(), st.months)) using errcode = 'P0001';
        end if;
      end if;
    end if;
  end if;
  insert into public.tickets (user_id, item, cost_pk, draw_at, choice) values (uid, it.id, case when free then 0 else it.price_pk end, d, c);
  return public._game_move(uid, 'shop', -it.price_pk, 0, it.id || coalesce(' · ' || c, ''), req) || jsonb_build_object('item', it.id,
    'count', (select count(*) from public.tickets where user_id = uid and item = it.id and draw_at is not distinct from d),
    'draw_at', d, 'choice', c);
end; $$;
revoke all on function public.buy_item(text, uuid, text) from public, anon;
grant execute on function public.buy_item(text, uuid, text) to authenticated;
