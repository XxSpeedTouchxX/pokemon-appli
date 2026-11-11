-- 022 : Mon avatar v3 (2026-11-10, porteur). Après 014 et 021. Rejouable.
--   - Pokémon de l'avatar à part du Pokédex : débloqués ici avec des PA (« poke:n »). 1re forme 25 PA, 2e forme 50 PA,
--     3e forme 100 PA ; légendaires 300 PA ; Kyogre, Groudon, Rayquaza 500 PA ; méga-évolutions 200 PA (proposé, à
--     confirmer). Version shiny (« shiny:n ») : le double, une fois le Pokémon débloqué. Premium ouvre TOUT le mode
--     avatar, Pokémon et shiny compris, quelle que soit la formule (porteur, 2026-11-11).
--   - Plus de « coup de cœur » (2ᵉ Pokémon) : la clé poke2 n'est plus gardée.
--   - Avatar sans Pokémon possible (poke = 0) : c'est l'avatar de départ.
--   - Accessoire sur le Pokémon ou sur le dresseur (aon : poke ou perso), taille sans limite pratique (asz de 5 à
--     5 000 %), décalage ax, ay de -400 à 400. Pokémon et accessoire tournent (prot, arot : 0 à 359°) ; taille du
--     Pokémon de 5 à 5 000 % (porteur, 2026-11-11).
--   - Cadres animés autour de l'avatar (frame) ; prix proposés, à confirmer.
--   - Un avatar déjà enregistré garde son Pokémon (et sa version shiny) : ils sont offerts une fois, à l'installation.
do $$
begin
  if to_regprocedure('public.avatar_state()') is null then raise exception 'Installe d''abord 014_avatar.sql, puis relance 022 (000_verifier.sql liste ce qui manque)'; end if;
  if to_regclass('public.game_pokemon') is null then raise exception 'Installe d''abord 004_jeu.sql, puis relance 022'; end if;
end $$;

-- 1. Cadres PRO.
insert into public.avatar_items (id, price_pa) values
  ('frame:arcenciel', 150), ('frame:tempete', 250), ('frame:vague', 250), ('frame:lave', 250), ('frame:galaxie', 150),
  ('frame:eclair', 150), ('frame:glace', 150), ('frame:neon', 150), ('frame:brume', 150), ('frame:sakura', 150), ('frame:holo', 200)
on conflict (id) do update set price_pa = excluded.price_pa;

-- 2. L'ancien « shiny » de la v2 (021 : « shiny:1 », 300 PA, valable pour n'importe quel Pokémon) devient la version
--    shiny du Pokémon de l'avatar enregistré ; ses acheteurs sont notés avant le changement de prix (rejouable : une
--    fois les prix v3 posés, « shiny:1 » ne vaut plus 300 PA et rien n'est refait).
drop table if exists avatar_old_shiny;
create temp table avatar_old_shiny as
  select u.user_id from public.avatar_unlocks u where u.item = 'shiny:1' and (select a.price_pa from public.avatar_items a where a.id = 'shiny:1') = 300;

-- 3. Pokémon de l'avatar et leurs shiny, calculés depuis la liste des Pokémon du jeu (004).
with recursive chain (n, root, k) as (
  select g.n, g.from_n, 1 from public.game_pokemon g
  union all
  select c.n, g.from_n, c.k + 1 from chain c join public.game_pokemon g on g.n = c.root where c.root <> 0 and c.k < 4
), stage as (select n, max(k) as k from chain group by n),
price as (
  select g.n, case when g.n in (382, 383, 384) then 500 when g.n in (144, 145, 146, 150, 151, 380, 381) then 300 when g.mega then 200
    when s.k >= 3 then 100 when s.k = 2 then 50 else 25 end as pa
  from public.game_pokemon g join stage s on s.n = g.n
)
insert into public.avatar_items (id, price_pa)
  select 'poke:' || n, pa from price union all select 'shiny:' || n, pa * 2 from price
on conflict (id) do update set price_pa = excluded.price_pa;

-- 4. Un avatar déjà enregistré garde son Pokémon (et son shiny) sans payer.
insert into public.avatar_unlocks (user_id, item)
  select p.id, 'poke:' || (p.avatar->>'poke')::int from public.profiles p
  where p.avatar ? 'poke' and (p.avatar->>'poke') ~ '^[1-9][0-9]{0,4}$' and exists (select 1 from public.avatar_items a where a.id = 'poke:' || (p.avatar->>'poke')::int)
on conflict do nothing;
insert into public.avatar_unlocks (user_id, item)
  select p.id, 'shiny:' || (p.avatar->>'poke')::int from public.profiles p
  where (p.avatar->'shiny') = 'true'::jsonb and (p.avatar->>'poke') ~ '^[1-9][0-9]{0,4}$' and exists (select 1 from public.avatar_items a where a.id = 'shiny:' || (p.avatar->>'poke')::int)
on conflict do nothing;
insert into public.avatar_unlocks (user_id, item)
  select o.user_id, 'shiny:' || (p.avatar->>'poke')::int from avatar_old_shiny o join public.profiles p on p.id = o.user_id
  where (p.avatar->>'poke') ~ '^[1-9][0-9]{0,4}$' and exists (select 1 from public.avatar_items a where a.id = 'shiny:' || (p.avatar->>'poke')::int)
on conflict do nothing;
delete from public.avatar_unlocks u using avatar_old_shiny o join public.profiles p on p.id = o.user_id
  where u.user_id = o.user_id and u.item = 'shiny:1' and coalesce(p.avatar->>'poke', '') <> '1' and not exists (select 1 from public.avatar_unlocks v where v.user_id = o.user_id and v.item = 'poke:1');
drop table avatar_old_shiny;

-- 5. Achat : la version shiny demande d'avoir débloqué le Pokémon.
create or replace function public.avatar_buy(item text, req uuid) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._game_begin(); price int; r jsonb;
begin
  r := public._game_replay(uid, req); if r is not null then return r; end if;
  select a.price_pa into price from public.avatar_items a where a.id = item;
  if price is null then raise exception 'Style inconnu' using errcode = 'P0001'; end if;
  if exists (select 1 from public.avatar_unlocks u where u.user_id = uid and u.item = avatar_buy.item) then raise exception 'Style déjà débloqué' using errcode = 'P0001'; end if;
  if item like 'shiny:%' and not exists (select 1 from public.avatar_unlocks u where u.user_id = uid and u.item = 'poke:' || substr(avatar_buy.item, 7)) then
    raise exception 'Débloque d''abord ce Pokémon pour ton avatar' using errcode = 'P0001';
  end if;
  insert into public.avatar_unlocks (user_id, item) values (uid, item);
  r := public._game_move(uid, 'avatar', 0, -price, item, req);
  return r || jsonb_build_object('item', item, 'price', price);
end; $$;
revoke all on function public.avatar_buy(text, uuid) from public, anon;
grant execute on function public.avatar_buy(text, uuid) to authenticated;

-- 6. Enregistrement de l'avatar (v3).
create or replace function public.avatar_save(cfg jsonb) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._game_begin(); k text; v text; prem boolean; clean jsonb := '{}'::jsonb; n int;
begin
  if cfg is null or jsonb_typeof(cfg) <> 'object' or length(cfg::text) > 1100 then raise exception 'Avatar invalide' using errcode = 'P0001'; end if;
  prem := public._premium_on(uid);
  foreach k in array array['skin', 'face', 'eyes', 'hair', 'hc', 'outfit', 'bg', 'pos', 'acc', 'frame', 'aon'] loop
    v := cfg->>k;
    if v is null then v := case k when 'acc' then 'aucun' when 'frame' then 'aucun' when 'aon' then 'poke' else null end; end if;
    if v is null or v !~ '^[a-z0-9]{1,16}$' then raise exception 'Avatar invalide (%)', k using errcode = 'P0001'; end if;
    if k not in ('pos', 'aon') and exists (select 1 from public.avatar_items a where a.id = k || ':' || v)
       and not prem and not exists (select 1 from public.avatar_unlocks u where u.user_id = uid and u.item = k || ':' || v) then
      raise exception 'Style PRO à débloquer : %', k || ':' || v using errcode = 'P0001';
    end if;
    clean := clean || jsonb_build_object(k, v);
  end loop;
  if clean->>'acc' not in ('aucun', 'lunettes', 'casquette', 'couronne', 'noeud', 'fete', 'echarpe') then raise exception 'Avatar invalide (acc)' using errcode = 'P0001'; end if;
  if clean->>'frame' not in ('aucun', 'dore', 'arcenciel', 'tempete', 'vague', 'lave', 'galaxie', 'eclair', 'glace', 'neon', 'brume', 'sakura', 'holo') then raise exception 'Avatar invalide (frame)' using errcode = 'P0001'; end if;
  if clean->>'aon' not in ('poke', 'perso') then raise exception 'Avatar invalide (aon)' using errcode = 'P0001'; end if;
  if clean->>'pos' not in ('right', 'left', 'shoulder', 'above', 'front', 'behind') then raise exception 'Avatar invalide (pos)' using errcode = 'P0001'; end if;
  n := coalesce(round((cfg->>'size')::numeric)::int, 100);
  clean := clean || jsonb_build_object('size', greatest(5, least(5000, n)),
    'prot', case when jsonb_typeof(cfg->'prot') = 'number' then ((round((cfg->>'prot')::numeric)::int % 360) + 360) % 360 else 0 end,
    'arot', case when jsonb_typeof(cfg->'arot') = 'number' then ((round((cfg->>'arot')::numeric)::int % 360) + 360) % 360 else 0 end);
  if jsonb_typeof(cfg->'px') = 'number' and jsonb_typeof(cfg->'py') = 'number' then
    clean := clean || jsonb_build_object('px', greatest(-10, least(110, round((cfg->>'px')::numeric)::int)), 'py', greatest(-10, least(110, round((cfg->>'py')::numeric)::int)));
  end if;
  clean := clean || jsonb_build_object(
    'ax', case when jsonb_typeof(cfg->'ax') = 'number' then greatest(-400, least(400, round((cfg->>'ax')::numeric)::int)) else 0 end,
    'ay', case when jsonb_typeof(cfg->'ay') = 'number' then greatest(-400, least(400, round((cfg->>'ay')::numeric)::int)) else 0 end,
    'asz', case when jsonb_typeof(cfg->'asz') = 'number' then greatest(5, least(5000, round((cfg->>'asz')::numeric)::int)) else 100 end);
  -- Pokémon de l'avatar : aucun (0), débloqué ici, ou ouvert par Premium.
  n := coalesce((cfg->>'poke')::int, 0);
  if n <> 0 and not exists (select 1 from public.avatar_items a where a.id = 'poke:' || n) then raise exception 'Avatar invalide (poke)' using errcode = 'P0001'; end if;
  if n <> 0 and not prem and not exists (select 1 from public.avatar_unlocks u where u.user_id = uid and u.item = 'poke:' || n) then
    raise exception 'Pokémon d''avatar à débloquer : %', 'poke:' || n using errcode = 'P0001';
  end if;
  clean := clean || jsonb_build_object('poke', n);
  if (cfg->'shiny') = 'true'::jsonb then
    if n = 0 or (not prem and not exists (select 1 from public.avatar_unlocks u where u.user_id = uid and u.item = 'shiny:' || n)) then
      raise exception 'Version shiny à débloquer : %', 'shiny:' || n using errcode = 'P0001';
    end if;
    clean := clean || jsonb_build_object('shiny', true);
  else
    clean := clean || jsonb_build_object('shiny', false);
  end if;
  update public.profiles set avatar = clean, updated_at = now() where id = uid;
  return clean;
end; $$;
revoke all on function public.avatar_save(jsonb) from public, anon;
grant execute on function public.avatar_save(jsonb) to authenticated;
