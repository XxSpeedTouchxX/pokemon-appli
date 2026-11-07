-- 011 : nouvelles conditions des grades et nouvelles chances du Booster PK (2026-11-07, demande du porteur). Après 010.
-- Rejouable (à coller dans Supabase Studio › SQL Editor, puis « Run »).
--   Recrue : dès l'inscription · Chasseur : 1 500 PK (inchangé)
--   Collectionneur : 7 500 PK + 30 compagnons débloqués
--   Dresseur Pokémon : 15 000 PK + 50 compagnons débloqués
--   Maître Pokémon : 30 000 PK + 100 compagnons débloqués + 5 méga-évolutions (ajouté le même jour par le porteur)
--   Grand maître Pokémon : 100 000 PK + tout le Pokédex débloqué (171 Pokémon, méga-évolutions comprises)
-- « Compagnons débloqués » compte désormais tout le Pokédex : les 156 Pokémon et les 15 méga-évolutions (171).
-- Condition de méga-évolutions à part : seulement Maître Pokémon (5).
-- Booster PK : 30 PK 40 %, 50 PK 30 %, 100 PK 15 %, 200 PK 10 %, 500 PK 5 % (avant : 30 PK 50 %, 50 PK 20 %).

update public.game_grades g set pk_earned = v.pk, comp = v.comp, mega = v.mega
from (values (0, 0, 0, 0), (1, 1500, 0, 0), (2, 7500, 30, 0), (3, 15000, 50, 0), (4, 30000, 100, 5),
             (5, 100000, (select count(*)::int from public.game_pokemon), 0)) as v(i, pk, comp, mega)
where g.i = v.i;

-- Grade : le plus haut dont les conditions sont remplies (PK gagnés au total, Pokémon débloqués dans tout le Pokédex).
create or replace function public._game_grade(uid uuid) returns int
language sql stable security definer set search_path = '' as $$
  with c as (
    select coalesce((select pk_earned from public.wallets where user_id = uid), 0) as pk,
           (select count(*) from public.game_pokemon g where public._game_owns(uid, g.n)) as comp,
           (select count(*) from public.dex_unlocks d join public.game_pokemon g on g.n = d.pokemon where d.user_id = uid and g.mega) as mega
  )
  select coalesce(max(gr.i), 0) from public.game_grades gr, c where c.pk >= gr.pk_earned and c.comp >= gr.comp and c.mega >= gr.mega;
$$;
revoke all on function public._game_grade(uuid) from public, anon, authenticated;

-- Booster PK : mêmes règles que 007 (délai du grade, admin déverrouillé sans délai), nouvelles chances.
create or replace function public.open_booster(req uuid) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._game_begin(); gr public.game_grades%rowtype; last timestamptz; x double precision; won int; r jsonb;
begin
  r := public._game_replay(uid, req); if r is not null then return r; end if;
  select * into gr from public.game_grades where i = public._game_grade(uid);
  select max(at) into last from public.ledger where user_id = uid and kind = 'booster';
  if not public._game_free(uid) and last is not null and last + make_interval(hours => gr.booster_h) > now() then
    raise exception 'Booster pas encore prêt' using errcode = 'P0001';
  end if;
  x := public._game_rand();
  won := case when x < 0.40 then 30 when x < 0.70 then 50 when x < 0.85 then 100 when x < 0.95 then 200 else 500 end;
  return public._game_move(uid, 'booster', won, 0, null, req) || jsonb_build_object('won', won, 'next', now() + make_interval(hours => gr.booster_h));
end; $$;
revoke all on function public.open_booster(uuid) from public, anon;
grant execute on function public.open_booster(uuid) to authenticated;
