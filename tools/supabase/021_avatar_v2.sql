-- 021 : Mon avatar v2 (2026-11-10, porteur). Après 014 (et 010 pour Premium). Rejouable.
--   - Le Pokémon se place n'importe où sur l'avatar (px, py : centre en % de l'avatar, de -10 à 110), devant ou derrière.
--   - Accessoire du Pokémon (acc) avec son décalage (ax, ay, de -80 à 80) et sa taille (asz, de 50 à 180 %).
--   - Version shiny du Pokémon (shiny).
--   Prix PRO proposés (à confirmer par le porteur) : shiny 300 PA ; couronne 150 PA ; nœud, chapeau de fête, écharpe
--   100 PA ; lunettes de soleil et casquette de dresseur gratuites. Ouverts avec Premium, comme les autres styles PRO.
do $$
begin
  if to_regprocedure('public.avatar_state()') is null then raise exception 'Installe d''abord 014_avatar.sql, puis relance 021 (000_verifier.sql liste ce qui manque)'; end if;
end $$;

insert into public.avatar_items (id, price_pa) values
  ('acc:couronne', 150), ('acc:noeud', 100), ('acc:fete', 100), ('acc:echarpe', 100), ('shiny:1', 300)
on conflict (id) do update set price_pa = excluded.price_pa;

create or replace function public.avatar_save(cfg jsonb) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._game_begin(); k text; v text; prem boolean; clean jsonb := '{}'::jsonb; n int;
  own_pro boolean;
begin
  if cfg is null or jsonb_typeof(cfg) <> 'object' or length(cfg::text) > 900 then raise exception 'Avatar invalide' using errcode = 'P0001'; end if;
  prem := public._premium_on(uid);
  foreach k in array array['skin', 'face', 'eyes', 'hair', 'hc', 'outfit', 'bg', 'pos', 'acc'] loop
    v := cfg->>k;
    if k = 'acc' and v is null then v := 'aucun'; end if;
    if v is null or v !~ '^[a-z0-9]{1,16}$' then raise exception 'Avatar invalide (%)', k using errcode = 'P0001'; end if;
    if k <> 'pos' and exists (select 1 from public.avatar_items a where a.id = k || ':' || v)
       and not prem and not exists (select 1 from public.avatar_unlocks u where u.user_id = uid and u.item = k || ':' || v) then
      raise exception 'Style PRO à débloquer : %', k || ':' || v using errcode = 'P0001';
    end if;
    clean := clean || jsonb_build_object(k, v);
  end loop;
  if (cfg->>'acc') is not null and (cfg->>'acc') not in ('aucun', 'lunettes', 'casquette', 'couronne', 'noeud', 'fete', 'echarpe') then raise exception 'Avatar invalide (acc)' using errcode = 'P0001'; end if;
  if (cfg->>'pos') not in ('right', 'left', 'shoulder', 'above', 'front', 'behind') then raise exception 'Avatar invalide (pos)' using errcode = 'P0001'; end if;
  n := coalesce((cfg->>'size')::int, 100);
  clean := clean || jsonb_build_object('size', greatest(60, least(140, n)));
  -- Place libre du Pokémon (les deux, ou aucune).
  if jsonb_typeof(cfg->'px') = 'number' and jsonb_typeof(cfg->'py') = 'number' then
    clean := clean || jsonb_build_object('px', greatest(-10, least(110, round((cfg->>'px')::numeric)::int)), 'py', greatest(-10, least(110, round((cfg->>'py')::numeric)::int)));
  end if;
  clean := clean || jsonb_build_object(
    'ax', case when jsonb_typeof(cfg->'ax') = 'number' then greatest(-80, least(80, round((cfg->>'ax')::numeric)::int)) else 0 end,
    'ay', case when jsonb_typeof(cfg->'ay') = 'number' then greatest(-80, least(80, round((cfg->>'ay')::numeric)::int)) else 0 end,
    'asz', case when jsonb_typeof(cfg->'asz') = 'number' then greatest(50, least(180, round((cfg->>'asz')::numeric)::int)) else 100 end);
  -- Shiny : style PRO.
  if (cfg->'shiny') = 'true'::jsonb then
    own_pro := prem or exists (select 1 from public.avatar_unlocks u where u.user_id = uid and u.item = 'shiny:1');
    if not own_pro then raise exception 'Style PRO à débloquer : shiny:1' using errcode = 'P0001'; end if;
    clean := clean || jsonb_build_object('shiny', true);
  else
    clean := clean || jsonb_build_object('shiny', false);
  end if;
  n := (cfg->>'poke')::int;
  if n is null or not public._game_owns(uid, n) then raise exception 'Pokémon non débloqué' using errcode = 'P0001'; end if;
  clean := clean || jsonb_build_object('poke', n);
  n := coalesce((cfg->>'poke2')::int, 0);
  if n <> 0 then
    if not prem and not exists (select 1 from public.avatar_unlocks u where u.user_id = uid and u.item = 'slot:2') then raise exception 'Style PRO à débloquer : slot:2' using errcode = 'P0001'; end if;
    if not public._game_owns(uid, n) then raise exception 'Pokémon non débloqué' using errcode = 'P0001'; end if;
  end if;
  clean := clean || jsonb_build_object('poke2', n);
  update public.profiles set avatar = clean, updated_at = now() where id = uid;
  return clean;
end; $$;
revoke all on function public.avatar_save(jsonb) from public, anon;
grant execute on function public.avatar_save(jsonb) to authenticated;
