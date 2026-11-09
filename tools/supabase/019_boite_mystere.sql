-- 019 : boîte mystère au PK shop, scans bonus, un ticket par catégorie et par mois, 2XP PA (2026-11-09, porteur).
-- Après 018. Rejouable (Studio › SQL Editor › Run).
--   - Les « 2XP PK » de 7, 14 et 30 jours ne s'achètent plus ; les 2XP se gagnent dans la boîte mystère.
--   - Boîte mystère : 300 PA (un admin déverrouillé ne paie rien). Lots et chances (porteur) :
--       2XP PK 3 jours 25 % · 2XP PK 7 jours 15 % · 2XP PK 10 jours 10 % · 2XP PA 7 jours 15 % · 20 scans bonus 20 %
--       Kyogre 5 % · Groudon 5 % · Rayquaza 5 % (aussi en vente dans le Pokédex à 1 000 PA chacun).
--     Un Pokémon déjà débloqué n'est jamais redonné : le tirage est refait parmi les autres lots (chances gardées en
--     proportion). Pareil pour le « 2XP PA » d'un abonné Premium (ses PA du jour sont déjà doublés).
--   - 2XP PA (2026-11-09, porteur, à la place du lot « 300 PK ») : PA du jour doublés pendant 7 jours ; non cumulable
--     avec Premium (×2 au plus) ; les jours s'ajoutent à un 2XP PA en cours. Si tu avais déjà lancé une 1re version de
--     019, relance celle-ci : elle retire le lot « 300 PK ».
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
  ('xppa-7', '2XP PA · 7 jours', 15, null, null, null, null),
  ('scans-20', '20 scans bonus', 20, null, null, 20, null),
  ('kyogre', 'Kyogre', 5, null, null, null, 382),
  ('groudon', 'Groudon', 5, null, null, null, 383),
  ('rayquaza', 'Rayquaza', 5, null, null, null, 384)
on conflict (id) do update set label = excluded.label, weight = excluded.weight, xp_days = excluded.xp_days, pk = excluded.pk,
  scans = excluded.scans, pokemon = excluded.pokemon;
delete from public.mystery_lots where id = 'pk-300';
alter table public.mystery_lots add column if not exists pa_days int;
update public.mystery_lots set pa_days = 7 where id = 'xppa-7';
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

-- 2XP PA de chaque joueur (écrit par le serveur seulement).
create table if not exists public.pa_boosts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  until timestamptz not null,
  updated_at timestamptz not null default now()
);
alter table public.pa_boosts enable row level security;
drop policy if exists pa_boosts_own on public.pa_boosts;
create policy pa_boosts_own on public.pa_boosts for select to authenticated using (user_id = auth.uid());
revoke insert, update, delete on public.pa_boosts from public, anon, authenticated;
grant select on public.pa_boosts to authenticated;
create or replace function public._pa_boost_on(uid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.pa_boosts where user_id = uid and until > now());
$$;
revoke all on function public._pa_boost_on(uuid) from public, anon, authenticated;

-- PA du jour (remplace 010 ; paliers du 2026-11-09, porteur) :
--   - +20, +30, +40, +50, +60, +70, puis +80 PA chaque jour d'affilée (le maximum) ; doublés pour un abonné Premium ou
--     pendant un 2XP PA (×2 au plus) ;
--   - une boîte mystère offerte à chaque série de 7 jours d'affilée (7e, 14e, 21e… jour), à ouvrir au PK shop ;
--   - un jour sans les récupérer : retour au palier J3 (+40 PA, jamais plus haut qu'avant) et la série de 7 jours
--     recommence ; deux jours ou plus : retour au palier J1 (+20 PA).
alter table public.wallets add column if not exists pa_run int not null default 0;
create table if not exists public.mystery_gifts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  boxes int not null default 0 check (boxes >= 0),
  updated_at timestamptz not null default now()
);
alter table public.mystery_gifts enable row level security;
drop policy if exists mystery_gifts_own on public.mystery_gifts;
create policy mystery_gifts_own on public.mystery_gifts for select to authenticated using (user_id = auth.uid());
revoke insert, update, delete on public.mystery_gifts from public, anon, authenticated;
grant select on public.mystery_gifts to authenticated;
create or replace function public.claim_daily_pa(req uuid) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._game_begin(); w public.wallets%rowtype; today date := public._game_today(); s int; run int; gain int; r jsonb;
  prem boolean; xp boolean; gift boolean;
begin
  r := public._game_replay(uid, req); if r is not null then return r; end if;
  select * into w from public.wallets where user_id = uid;
  if w.pa_day = today then raise exception 'PA du jour déjà récupérés' using errcode = 'P0001'; end if;
  s := case when w.pa_day = today - 1 then least(greatest(w.pa_streak, 0) + 1, 7)
    when w.pa_day = today - 2 then greatest(1, least(w.pa_streak, 3)) else 1 end;
  run := case when w.pa_day = today - 1 then greatest(w.pa_run, 1) + 1 else 1 end;
  gift := run % 7 = 0;
  prem := public._premium_on(uid);
  xp := public._pa_boost_on(uid);
  gain := (array[20, 30, 40, 50, 60, 70, 80])[s] * case when prem or xp then 2 else 1 end;
  update public.wallets set pa_day = today, pa_streak = s, pa_run = run where user_id = uid;
  if gift then
    insert into public.mystery_gifts (user_id, boxes) values (uid, 1)
    on conflict (user_id) do update set boxes = public.mystery_gifts.boxes + 1, updated_at = now();
  end if;
  return public._game_move(uid, 'pa_day', 0, gain, 'J' || s || case when prem then ' · Premium ×2' when xp then ' · 2XP PA' else '' end
      || case when gift then ' · boîte offerte' else '' end, req)
    || jsonb_build_object('gain', gain, 'streak', s, 'run', run, 'gift', gift, 'premium', prem, 'xp_pa', xp);
end; $$;
revoke all on function public.claim_daily_pa(uuid) from public, anon;
grant execute on function public.claim_daily_pa(uuid) to authenticated;

-- État du compte (remplace 010) : prochain gain de PA selon les nouveaux paliers, série de jours d'affilée.
create or replace function public.game_state() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid(); w public.wallets%rowtype; g int; gr public.game_grades%rowtype; today date := public._game_today();
  conf timestamptz; nb timestamptz; nc timestamptz; nxt jsonb; free boolean; draws jsonb; p public.premium%rowtype; prem boolean;
begin
  if uid is null then raise exception 'Connexion requise' using errcode = '28000'; end if;
  free := public._game_free(uid);
  prem := public._premium_on(uid);
  select * into p from public.premium where user_id = uid;
  select * into w from public.wallets where user_id = uid;
  g := public._game_grade(uid);
  select * into gr from public.game_grades where i = g;
  select email_confirmed_at into conf from auth.users where id = uid;
  nb := case when not free then (select max(at) from public.ledger where user_id = uid and kind = 'booster') + make_interval(hours => gr.booster_h) end;
  nc := case when gr.coin_h > 0 and not free then (select max(at) from public.ledger where user_id = uid and kind = 'coin') + make_interval(hours => gr.coin_h) end;
  nxt := case when w.pa_day = today then null
    else to_jsonb(case when w.pa_day is null then 20 when w.pa_day = today - 1 then (array[20, 30, 40, 50, 60, 70, 80])[least(w.pa_streak + 1, 7)]
      when w.pa_day = today - 2 then (array[20, 30, 40])[greatest(1, least(w.pa_streak, 3))] else 20 end
      * case when prem or public._pa_boost_on(uid) then 2 else 1 end) end;
  select coalesce(jsonb_object_agg(id, public._game_next_draw(cycle, now())), '{}'::jsonb) into draws from public.game_items where kind = 'ticket' and active;
  return jsonb_build_object(
    'pk', w.pk, 'pa', w.pa, 'pk_earned', w.pk_earned, 'today', today, 'server_now', now(),
    'pa_day', w.pa_day, 'pa_streak', w.pa_streak, 'pa_run', w.pa_run, 'pa_gain', nxt,
    'grade', g, 'booster_next', nb, 'coin_open', gr.coin_h > 0 or free, 'coin_next', nc,
    'booster_last', case when not free then (select max(at) from public.ledger where user_id = uid and kind = 'booster') end,
    'coin_last', case when not free then (select max(at) from public.ledger where user_id = uid and kind = 'coin') end,
    'buddy', (select buddy from public.profiles where id = uid),
    'shared', exists (select 1 from public.ledger where user_id = uid and kind = 'share'),
    'unlocked', coalesce((select jsonb_agg(pokemon order by pokemon) from public.dex_unlocks where user_id = uid), '[]'::jsonb),
    'shop', coalesce((select jsonb_object_agg(item, n) from (select item, count(*) n from public.tickets where user_id = uid group by item) t), '{}'::jsonb),
    'shop_draw', coalesce((select jsonb_object_agg(t.item, t.n) from (select item, count(*) n from public.tickets tk
      where tk.user_id = uid and tk.draw_at = (draws->>tk.item)::timestamptz group by item) t), '{}'::jsonb),
    'draws', draws,
    'next_draw', draws->>'ticket-bronze',
    'shop_open_at', conf + interval '7 days',
    'unlimited', free,
    'admin_until', (select until from public.admin_unlocks where user_id = uid and until > now()),
    'premium', jsonb_build_object('on', prem, 'plan', p.plan, 'status', coalesce(p.status, 'none'), 'until', p.period_end,
      'cancel', coalesce(p.cancel_at_period_end, false), 'customer', p.stripe_customer is not null));
end; $$;
revoke all on function public.game_state() from public, anon;
grant execute on function public.game_state() to authenticated;


alter table public.ledger drop constraint if exists ledger_kind_check;
alter table public.ledger add constraint ledger_kind_check check (kind in ('welcome', 'reprise', 'share', 'pa_day', 'booster', 'coin',
  'unlock', 'shop', 'admin', 'purchase', 'avatar', 'boost', 'mystery', 'scan_bonus'));

-- 3. Ouvrir une boîte mystère.
create or replace function public._mystery_open(req uuid, gift boolean) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._game_begin(); r jsonb; lot public.mystery_lots%rowtype; tot int; x double precision; acc int := 0;
  nu timestamptz; cur timestamptz; left_scans int; pu timestamptz; prem boolean := public._premium_on(uid); gb int;
begin
  r := public._game_replay(uid, req); if r is not null then return r; end if;
  if gift then
    select boxes into gb from public.mystery_gifts where user_id = uid for update;
    if coalesce(gb, 0) < 1 then raise exception 'Pas de boîte offerte' using errcode = 'P0001'; end if;
    update public.mystery_gifts set boxes = boxes - 1, updated_at = now() where user_id = uid;
  end if;
  -- Lots possibles : sans les Pokémon déjà débloqués, ni le 2XP PA pour un abonné Premium.
  select coalesce(sum(weight), 0) into tot from public.mystery_lots m
    where m.weight > 0 and (m.pokemon is null or not exists (select 1 from public.dex_unlocks d where d.user_id = uid and d.pokemon = m.pokemon))
      and not (prem and m.pa_days is not null);
  if tot <= 0 then raise exception 'Boîte mystère indisponible' using errcode = 'P0001'; end if;
  x := public._game_rand() * tot;
  for lot in select * from public.mystery_lots m
      where m.weight > 0 and (m.pokemon is null or not exists (select 1 from public.dex_unlocks d where d.user_id = uid and d.pokemon = m.pokemon))
        and not (prem and m.pa_days is not null)
      order by m.weight desc, m.id loop
    acc := acc + lot.weight;
    exit when x < acc;
  end loop;
  -- 300 PA débités (journal « mystery »), plus les PK gagnés s'il y en a.
  r := public._game_move(uid, 'mystery', coalesce(lot.pk, 0), case when gift then 0 else -300 end, lot.id || case when gift then ' · offerte' else '' end, req);
  if lot.xp_days is not null then
    select until into cur from public.pk_boosts where user_id = uid for update;
    nu := greatest(coalesce(cur, now()), now()) + make_interval(days => lot.xp_days);
    insert into public.pk_boosts (user_id, until) values (uid, nu) on conflict (user_id) do update set until = excluded.until, updated_at = now();
  end if;
  if lot.pa_days is not null then
    select until into cur from public.pa_boosts where user_id = uid for update;
    pu := greatest(coalesce(cur, now()), now()) + make_interval(days => lot.pa_days);
    insert into public.pa_boosts (user_id, until) values (uid, pu) on conflict (user_id) do update set until = excluded.until, updated_at = now();
  end if;
  if lot.scans is not null then
    insert into public.scan_bonus (user_id, scans) values (uid, lot.scans)
    on conflict (user_id) do update set scans = public.scan_bonus.scans + excluded.scans, updated_at = now();
  end if;
  if lot.pokemon is not null then
    insert into public.dex_unlocks (user_id, pokemon) values (uid, lot.pokemon) on conflict do nothing;
  end if;
  select scans into left_scans from public.scan_bonus where user_id = uid;
  return r || jsonb_build_object('lot', lot.id, 'label', lot.label, 'xp_days', lot.xp_days, 'until', nu, 'won_pk', lot.pk, 'pa_until', pu,
    'pokemon', lot.pokemon, 'scan_bonus', coalesce(left_scans, 0), 'gift', gift,
    'free_boxes', coalesce((select boxes from public.mystery_gifts where user_id = uid), 0));
end; $$;
-- Boîte payée (300 PA) ou boîte offerte (série de 7 jours d'affilée : même tirage, sans payer de PA).
drop function if exists public.open_mystery_box(uuid);
create or replace function public.open_mystery_box(req uuid) returns jsonb
language sql volatile security definer set search_path = '' as $$ select public._mystery_open(req, false); $$;
create or replace function public.open_gift_box(req uuid) returns jsonb
language sql volatile security definer set search_path = '' as $$ select public._mystery_open(req, true); $$;
revoke all on function public._mystery_open(uuid, boolean) from public, anon, authenticated;
revoke all on function public.open_mystery_box(uuid), public.open_gift_box(uuid) from public, anon;
grant execute on function public.open_mystery_box(uuid), public.open_gift_box(uuid) to authenticated;

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
    'pa_xp_until', (select until from public.pa_boosts where user_id = uid and until > now()),
    'free_boxes', coalesce((select boxes from public.mystery_gifts where user_id = uid), 0),
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
