-- 013 : « Ma progression » : classement des joueurs par saison de 60 jours (2026-11-08, demande du porteur). Après 012.
-- Rejouable (à coller dans Supabase Studio › SQL Editor, puis « Run »).
--   - Saison 1 : du 8 novembre 2026 (minuit, heure de Paris) au 7 janvier 2027 ; chaque saison dure 60 jours, la suivante
--     commence aussitôt (table game_season : date de départ et durée, une seule ligne, modifiable dans Studio).
--   - Classement d'une saison : PK gagnés pendant la saison (Booster PK, pièce, bienvenue, partage), achats non déduits.
--     Les dons d'un admin, la reprise des anciens PK et les achats ne comptent pas. Égalité : même rang.
--   - Joueurs classés : comptes actifs avec un pseudo, sans les comptes admin (PK illimités).
--   - Ce que voit un joueur (season_board) : la saison, le nombre de joueurs, les premiers du classement (pseudo, grade,
--     PK de la saison) et sa propre place. Jamais l'adresse e-mail ni l'identifiant d'un autre joueur.
--   - Lots (décision du porteur) : top 10, lots à définir ; de la 11ᵉ à la 30ᵉ place, Premium offert. Remis à la fin de
--     la saison, à la main : la liste des gagnants d'une saison (avec leur e-mail) se lit dans Studio :
--       select * from public.season_winners(1);

create table if not exists public.game_season (
  id int primary key default 1 check (id = 1),
  start_at timestamptz not null,
  days int not null default 60 check (days between 7 and 366)
);
alter table public.game_season enable row level security; -- aucune règle : lue seulement par les fonctions ci-dessous
revoke all on public.game_season from anon, authenticated;
insert into public.game_season (id, start_at, days) values (1, '2026-11-08 00:00:00 Europe/Paris', 60) on conflict (id) do nothing;
create index if not exists ledger_at on public.ledger (at);

-- Saison à une date : numéro (1, 2…), début et fin.
create or replace function public._season_at(t timestamptz) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('n', x.n, 'days', s.days,
    'start', s.start_at + make_interval(days => (x.n - 1) * s.days), 'end', s.start_at + make_interval(days => x.n * s.days))
  from public.game_season s,
       lateral (select greatest(1, floor(extract(epoch from (t - s.start_at)) / (s.days * 86400.0))::int + 1) as n) x
  where s.id = 1;
$$;
revoke all on function public._season_at(timestamptz) from public, anon, authenticated;

-- PK gagnés par chaque joueur classé entre a et b.
create or replace function public._season_scores(a timestamptz, b timestamptz) returns table (user_id uuid, pk bigint)
language sql stable security definer set search_path = '' as $$
  select p.id, coalesce(sum(l.pk) filter (where l.pk > 0 and l.kind in ('welcome', 'share', 'booster', 'coin')), 0)::bigint
  from public.profiles p
  left join public.ledger l on l.user_id = p.id and l.at >= a and l.at < b
  where p.role = 'user' and p.status = 'active' and p.pseudo is not null
  group by p.id;
$$;
revoke all on function public._season_scores(timestamptz, timestamptz) from public, anon, authenticated;

-- Classement de la saison en cours, pour l'écran « Ma progression » (joueur connecté).
create or replace function public.season_board(lim int default 50) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid(); se jsonb; a timestamptz; b timestamptz; res jsonb; n int := least(greatest(coalesce(lim, 50), 3), 100);
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  se := public._season_at(now());
  a := (se->>'start')::timestamptz; b := (se->>'end')::timestamptz;
  with sc as (select * from public._season_scores(a, b)),
       rk as (select sc.user_id, sc.pk, (rank() over (order by sc.pk desc))::int as r, row_number() over (order by sc.pk desc, sc.user_id) as rn from sc)
  select jsonb_build_object(
    'season', se, 'now', now(), 'players', (select count(*) from rk),
    'top', coalesce((select jsonb_agg(jsonb_build_object('rank', rk.r, 'pseudo', p.pseudo, 'grade', public._game_grade(rk.user_id), 'pk', rk.pk, 'me', rk.user_id = uid) order by rk.rn)
                     from rk join public.profiles p on p.id = rk.user_id where rk.rn <= n), '[]'::jsonb),
    'me', (select jsonb_build_object('rank', rk.r, 'pk', rk.pk) from rk where rk.user_id = uid),
    'pk_total', coalesce((select w.pk_earned from public.wallets w where w.user_id = uid), 0),
    'grade', public._game_grade(uid)
  ) into res;
  return res;
end; $$;
revoke all on function public.season_board(int) from public, anon;
grant execute on function public.season_board(int) to authenticated;

-- Gagnants d'une saison (Studio seulement) : rang, pseudo, e-mail, PK de la saison et lot.
create or replace function public.season_winners(season int) returns table (rang int, pseudo text, email text, pk bigint, lot text)
language sql stable security definer set search_path = '' as $$
  with s as (select (x->>'start')::timestamptz as a, (x->>'end')::timestamptz as b
             from (select public._season_at(g.start_at + make_interval(days => (greatest(season, 1) - 1) * g.days)) as x from public.game_season g where g.id = 1) y),
       sc as (select t.* from s, lateral public._season_scores(s.a, s.b) t),
       rk as (select sc.user_id, sc.pk, (rank() over (order by sc.pk desc))::int as r from sc where sc.pk > 0)
  select rk.r, p.pseudo, u.email::text, rk.pk,
         case when rk.r <= 10 then 'Top 10 : lot à définir' else 'Premium offert' end
  from rk join public.profiles p on p.id = rk.user_id join auth.users u on u.id = rk.user_id
  where rk.r <= 30 order by rk.r, p.pseudo;
$$;
revoke all on function public.season_winners(int) from public, anon, authenticated;
