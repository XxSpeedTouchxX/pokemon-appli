-- 023 : boîte mystère et légendaires (2026-11-11, porteur). Après 019. Rejouable.
--   - Un légendaire gagné dans la boîte (Kyogre, Groudon, Rayquaza) entre au Pokédex sans payer de PA (déjà le cas
--     depuis 019 : dex_unlocks).
--   - Un légendaire déjà au Pokédex (gagné ou acheté) n'est plus dans la boîte, et ses chances vont sur un 2XP PK :
--     1 légendaire possédé → +5 sur « 2XP PK 3 jours » (25 → 30 %) ; 2 → +10 sur « 2XP PK 7 jours » (15 → 25 %) ;
--     3 → +15 sur « 2XP PK 10 jours » (10 → 25 %).
--   - Premium : pas de « 2XP PA » (PA déjà doublés) ; les chances sont recalculées sur les autres lots (inchangé).
do $$
begin
  if to_regclass('public.mystery_lots') is null or to_regprocedure('public.open_gift_box(uuid)') is null then
    raise exception 'Installe d''abord 019_boite_mystere.sql (version du 9 novembre au soir), puis relance 023 (000_verifier.sql liste ce qui manque)';
  end if;
end $$;

-- Chances de chaque lot pour un joueur.
create or replace function public._mystery_weights(uid uuid, prem boolean) returns table (id text, weight int, owned boolean)
language sql stable security definer set search_path = '' as $$
  with own as (
    select count(*)::int as n from public.mystery_lots m
    where m.pokemon is not null and exists (select 1 from public.dex_unlocks d where d.user_id = uid and d.pokemon = m.pokemon)
  )
  select m.id,
    case when (m.pokemon is not null and exists (select 1 from public.dex_unlocks d where d.user_id = uid and d.pokemon = m.pokemon))
           or (prem and m.pa_days is not null) or m.weight <= 0 then 0
         else m.weight + case when own.n = 1 and m.id = 'xp-3' then 5 when own.n = 2 and m.id = 'xp-7' then 10 when own.n = 3 and m.id = 'xp-10' then 15 else 0 end
    end,
    m.pokemon is not null and exists (select 1 from public.dex_unlocks d where d.user_id = uid and d.pokemon = m.pokemon)
  from public.mystery_lots m, own;
$$;
revoke all on function public._mystery_weights(uuid, boolean) from public, anon, authenticated;

-- Ouvrir une boîte (même fonction que 019, avec les chances ci-dessus).
create or replace function public._mystery_open(req uuid, gift boolean) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._game_begin(); r jsonb; lot public.mystery_lots%rowtype; lid text; wt int; tot int; x double precision; acc int := 0;
  nu timestamptz; cur timestamptz; left_scans int; pu timestamptz; prem boolean := public._premium_on(uid); gb int;
begin
  r := public._game_replay(uid, req); if r is not null then return r; end if;
  if gift then
    select boxes into gb from public.mystery_gifts where user_id = uid for update;
    if coalesce(gb, 0) < 1 then raise exception 'Pas de boîte offerte' using errcode = 'P0001'; end if;
    update public.mystery_gifts set boxes = boxes - 1, updated_at = now() where user_id = uid;
  end if;
  -- Lots possibles et leurs chances (023) : sans les légendaires déjà débloqués (chances reportées sur un 2XP PK), ni le
  -- 2XP PA pour un abonné Premium.
  select coalesce(sum(w.weight), 0) into tot from public._mystery_weights(uid, prem) w;
  if tot <= 0 then raise exception 'Boîte mystère indisponible' using errcode = 'P0001'; end if;
  x := public._game_rand() * tot;
  for lid, wt in select m.id, w.weight from public.mystery_lots m join public._mystery_weights(uid, prem) w on w.id = m.id
      where w.weight > 0 order by w.weight desc, m.id loop
    acc := acc + wt;
    exit when x < acc;
  end loop;
  select * into lot from public.mystery_lots m where m.id = lid;
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

-- État : lots avec les chances du joueur (barré : légendaire déjà au Pokédex).
create or replace function public.mystery_state() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid(); prem boolean;
begin
  if uid is null then raise exception 'Connexion requise' using errcode = '28000'; end if;
  prem := public._premium_on(uid);
  return jsonb_build_object('scan_bonus', coalesce((select scans from public.scan_bonus where user_id = uid), 0), 'price_pa', 300,
    'pa_xp_until', (select until from public.pa_boosts where user_id = uid and until > now()),
    'free_boxes', coalesce((select boxes from public.mystery_gifts where user_id = uid), 0),
    'lots', coalesce((select jsonb_agg(jsonb_build_object('id', m.id, 'label', m.label, 'weight', w.weight, 'base', m.weight, 'owned', w.owned) order by m.weight desc, m.id)
      from public.mystery_lots m join public._mystery_weights(uid, prem) w on w.id = m.id), '[]'::jsonb));
end; $$;
revoke all on function public.mystery_state() from public, anon;
grant execute on function public.mystery_state() to authenticated;
