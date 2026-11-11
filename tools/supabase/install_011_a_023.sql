-- INSTALLATION EN UNE FOIS des scripts 011 à 023 (2026-11-11, porteur : « la boîte mystère dit que la fonctionnalité
-- n'est pas encore en place »). La boîte mystère (019) a besoin de 016 et 018 avant elle ; ce fichier les met tous,
-- dans l'ordre. Rejouable : sans risque si certains sont déjà installés (il remet simplement leur dernière version).
-- Supabase Studio › SQL Editor › New query › colle TOUT ce fichier › Run. Puis colle 000_verifier.sql › Run : tout doit
-- être « oui ». Ce fichier est fabriqué à partir des scripts 011 à 023 (tools/supabase/make_install.sh) : ne pas le
-- modifier à la main.

-- ================= 011_grades_v4.sql =================
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

-- ================= 012_shop_notices.sql =================
-- 012 : e-mail à Dropicards pour chaque achat au PK shop (2026-11-07, demande du porteur). Après 011. Rejouable.
-- À chaque ticket (Bronze, Argent, Or) ou achat direct (booster, item rare, ETB), la fonction « notify » du serveur
-- (tools/supabase/functions/notify) envoie un e-mail à l'adresse de Dropicards (contact@dropicards.fr par défaut) avec
-- le joueur (pseudo, e-mail), l'article, le tirage visé et son nombre de tickets pour ce tirage. Cette table retient les
-- achats déjà signalés : chacun n'est envoyé qu'une fois, et un e-mail raté repart au prochain achat.
-- Seuls les achats faits après l'installation de 012 sont signalés (pas l'historique).
-- Lecture et écriture réservées au serveur (clé service_role) : un joueur n'y a pas accès.

create table if not exists public.shop_notices (
  ticket_id uuid primary key references public.tickets (id) on delete cascade,
  sent_at timestamptz not null default now()
);
alter table public.shop_notices enable row level security;
revoke all on public.shop_notices from anon, authenticated;

create table if not exists public.shop_notice_start (
  k int primary key default 1 check (k = 1),
  since timestamptz not null default now()
);
alter table public.shop_notice_start enable row level security;
revoke all on public.shop_notice_start from anon, authenticated;
insert into public.shop_notice_start (k) values (1) on conflict (k) do nothing;

-- Achats pas encore signalés, du plus ancien au plus récent (50 au plus par envoi).
create or replace function public.shop_pending(lim int default 20) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(x order by x->>'bought_at'), '[]'::jsonb) from (
    select jsonb_build_object('id', t.id, 'item', t.item, 'label', i.label, 'kind', i.kind, 'cost_pk', t.cost_pk,
      'bought_at', t.bought_at, 'draw_at', t.draw_at, 'choice', t.choice, 'user_id', t.user_id, 'email', u.email::text, 'pseudo', p.pseudo,
      'count', (select count(*) from public.tickets t2 where t2.user_id = t.user_id and t2.item = t.item and t2.draw_at is not distinct from t.draw_at)) as x
    from public.tickets t
    join auth.users u on u.id = t.user_id
    left join public.profiles p on p.id = t.user_id
    left join public.game_items i on i.id = t.item
    where not exists (select 1 from public.shop_notices n where n.ticket_id = t.id)
      and t.bought_at >= (select since from public.shop_notice_start where k = 1)
    order by t.bought_at
    limit greatest(1, least(coalesce(lim, 20), 50))
  ) s;
$$;
-- Achats signalés (après l'envoi réussi de l'e-mail).
create or replace function public.shop_mark_sent(ids uuid[]) returns int
language plpgsql volatile security definer set search_path = '' as $$
declare n int;
begin
  insert into public.shop_notices (ticket_id) select distinct x from unnest(coalesce(ids, '{}'::uuid[])) as x
    where exists (select 1 from public.tickets t where t.id = x)
  on conflict (ticket_id) do nothing;
  get diagnostics n = row_count;
  return n;
end; $$;
revoke all on function public.shop_pending(int), public.shop_mark_sent(uuid[]) from public, anon, authenticated;
grant execute on function public.shop_pending(int), public.shop_mark_sent(uuid[]) to service_role;

-- ================= 013_saisons.sql =================
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

-- ================= 014_avatar.sql =================
-- 014 : « Mon avatar » (2026-11-08, demande du porteur). Après 013.
-- Rejouable (à coller dans Supabase Studio › SQL Editor, puis « Run »).
--   - Chaque joueur compose son avatar dans l'app ; il est gardé ici (profiles.avatar) et montré dans le classement.
--   - Styles PRO (badge couronne) : ouverts avec l'abonnement Premium, ou débloqués pour toujours avec des PA
--     (avatar_buy : PA débités par le serveur, journal « avatar »). Prix dans avatar_items (mêmes que l'app).
--   - avatar_save refuse un avatar qui utilise un style PRO ni acheté ni ouvert par Premium, ou un Pokémon non débloqué.

-- 1. Styles PRO et leur prix en PA.
create table if not exists public.avatar_items (id text primary key, price_pa int not null check (price_pa > 0));
alter table public.avatar_items enable row level security;
revoke all on public.avatar_items from anon, authenticated;
insert into public.avatar_items (id, price_pa) values
  ('skin:lavande', 150), ('skin:menthe', 150), ('skin:ciel', 150), ('skin:or', 150),
  ('eyes:etoiles', 150),
  ('hair:chignon', 200), ('hair:queue', 200), ('hair:couettes', 200), ('hair:crete', 200),
  ('hc:rose', 100), ('hc:bleu', 100), ('hc:vert', 100), ('hc:violet', 100),
  ('outfit:aventurier', 250), ('outfit:maillot', 250), ('outfit:cape', 250),
  ('bg:etoiles', 150), ('bg:holo', 150), ('bg:aurore', 150), ('bg:volcan', 150),
  ('slot:2', 300)
on conflict (id) do update set price_pa = excluded.price_pa;

-- 2. Styles achetés, avatar enregistré, journal.
create table if not exists public.avatar_unlocks (
  user_id uuid not null references auth.users (id) on delete cascade,
  item text not null references public.avatar_items (id),
  at timestamptz not null default now(),
  primary key (user_id, item)
);
alter table public.avatar_unlocks enable row level security;
revoke all on public.avatar_unlocks from anon, authenticated;
alter table public.profiles add column if not exists avatar jsonb;
alter table public.ledger drop constraint if exists ledger_kind_check;
alter table public.ledger add constraint ledger_kind_check check (kind in ('welcome', 'reprise', 'share', 'pa_day', 'booster', 'coin', 'unlock', 'shop', 'admin', 'purchase', 'avatar'));
-- Un joueur ne modifie pas lui-même la colonne avatar (seulement par avatar_save).
revoke update (avatar) on public.profiles from authenticated;

-- 3. Achat d'un style PRO avec des PA.
create or replace function public.avatar_buy(item text, req uuid) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._game_begin(); price int; r jsonb;
begin
  r := public._game_replay(uid, req); if r is not null then return r; end if;
  select a.price_pa into price from public.avatar_items a where a.id = item;
  if price is null then raise exception 'Style inconnu' using errcode = 'P0001'; end if;
  if exists (select 1 from public.avatar_unlocks u where u.user_id = uid and u.item = avatar_buy.item) then raise exception 'Style déjà débloqué' using errcode = 'P0001'; end if;
  insert into public.avatar_unlocks (user_id, item) values (uid, item);
  r := public._game_move(uid, 'avatar', 0, -price, item, req);
  return r || jsonb_build_object('item', item, 'price', price);
end; $$;
revoke all on function public.avatar_buy(text, uuid) from public, anon;
grant execute on function public.avatar_buy(text, uuid) to authenticated;

-- 4. Enregistrement de l'avatar (vérifié).
create or replace function public.avatar_save(cfg jsonb) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._game_begin(); k text; v text; prem boolean; clean jsonb := '{}'::jsonb; n int;
begin
  if cfg is null or jsonb_typeof(cfg) <> 'object' or length(cfg::text) > 600 then raise exception 'Avatar invalide' using errcode = 'P0001'; end if;
  prem := public._premium_on(uid);
  foreach k in array array['skin', 'face', 'eyes', 'hair', 'hc', 'outfit', 'bg', 'pos'] loop
    v := cfg->>k;
    if v is null or v !~ '^[a-z0-9]{1,16}$' then raise exception 'Avatar invalide (%)', k using errcode = 'P0001'; end if;
    if k <> 'pos' and exists (select 1 from public.avatar_items a where a.id = k || ':' || v)
       and not prem and not exists (select 1 from public.avatar_unlocks u where u.user_id = uid and u.item = k || ':' || v) then
      raise exception 'Style PRO à débloquer : %', k || ':' || v using errcode = 'P0001';
    end if;
    clean := clean || jsonb_build_object(k, v);
  end loop;
  if (cfg->>'pos') not in ('right', 'left', 'shoulder', 'above', 'front', 'behind') then raise exception 'Avatar invalide (pos)' using errcode = 'P0001'; end if;
  n := coalesce((cfg->>'size')::int, 100);
  clean := clean || jsonb_build_object('size', greatest(60, least(140, n)));
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

-- 5. Styles débloqués et avatar du joueur connecté.
create or replace function public.avatar_state() returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'owned', coalesce((select jsonb_agg(u.item order by u.item) from public.avatar_unlocks u where u.user_id = auth.uid()), '[]'::jsonb),
    'avatar', (select p.avatar from public.profiles p where p.id = auth.uid()),
    'premium', public._premium_on(auth.uid()))
  where auth.uid() is not null;
$$;
revoke all on function public.avatar_state() from public, anon;
grant execute on function public.avatar_state() to authenticated;

-- 6. Classement (013) : l'avatar de chaque joueur en plus.
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
    'top', coalesce((select jsonb_agg(jsonb_build_object('rank', rk.r, 'pseudo', p.pseudo, 'grade', public._game_grade(rk.user_id), 'pk', rk.pk, 'me', rk.user_id = uid, 'avatar', p.avatar) order by rk.rn)
                     from rk join public.profiles p on p.id = rk.user_id where rk.rn <= n), '[]'::jsonb),
    'me', (select jsonb_build_object('rank', rk.r, 'pk', rk.pk) from rk where rk.user_id = uid),
    'pk_total', coalesce((select w.pk_earned from public.wallets w where w.user_id = uid), 0),
    'grade', public._game_grade(uid)
  ) into res;
  return res;
end; $$;
revoke all on function public.season_board(int) from public, anon;
grant execute on function public.season_board(int) to authenticated;

-- ================= 015_sans_verification.sql =================
-- 015 : l'app s'utilise sans avoir vérifié son adresse (2026-11-08, porteur : « je ne veux pas que le fait de valider son
-- adresse mail soit obligatoire à l'utilisation de l'application »). Après 014. Rejouable (Studio › SQL Editor › Run).
--   - Jeux (PA du jour, Booster PK, pièce), Pokédex, avatar, classement : ouverts dès la création du compte.
--   - Seule exception, le PK shop (tickets des tirages et lots, de vrais objets envoyés par la poste) : adresse vérifiée
--     demandée, pour pouvoir joindre le gagnant ; toujours 7 jours après la vérification (comme avant).
--   - Les comptes « admin » (mot de passe des admins, 007) ne sont pas concernés.

-- 1. Compte appelant (remplace 004) : connecté et actif ; l'adresse n'est plus demandée ici.
create or replace function public._game_begin() returns uuid
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := auth.uid(); st text; t public.game_throttle%rowtype;
begin
  if uid is null then raise exception 'Connexion requise' using errcode = '28000'; end if;
  select p.status into st from public.profiles p where p.id = uid;
  if st is distinct from 'active' then raise exception 'Compte suspendu' using errcode = '42501'; end if;
  perform 1 from public.wallets where user_id = uid for update;
  if not found then raise exception 'Porte-monnaie introuvable'; end if;
  insert into public.game_throttle (user_id) values (uid) on conflict (user_id) do nothing;
  select * into t from public.game_throttle where user_id = uid for update;
  if t.window_start < now() - interval '1 minute' then
    update public.game_throttle set window_start = now(), n = 1 where user_id = uid;
  elsif t.n >= 30 then
    raise exception 'Trop d''actions : attends une minute' using errcode = '53400';
  else
    update public.game_throttle set n = n + 1 where user_id = uid;
  end if;
  return uid;
end; $$;
revoke all on function public._game_begin() from public, anon, authenticated;

-- 2. Achat au PK shop (remplace 008) : adresse vérifiée demandée (le gagnant d'un lot doit pouvoir être joint).
create or replace function public.buy_item(item_id text, req uuid, choice text default null) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._game_begin(); it public.game_items%rowtype; conf timestamptz; r jsonb;
  free boolean := public._game_free(uid); d timestamptz; c text := nullif(btrim(coalesce(choice, '')), ''); gname text;
begin
  r := public._game_replay(uid, req); if r is not null then return r; end if;
  select * into it from public.game_items where id = item_id and active;
  if not found then raise exception 'Article indisponible' using errcode = 'P0001'; end if;
  if not free and public._game_grade(uid) < it.min_grade then
    select name into gname from public.game_grades where i = it.min_grade;
    raise exception 'Tu dois d''abord déverrouiller le grade % pour avoir accès à cet article', gname using errcode = 'P0001';
  end if;
  if it.choices is not null and (c is null or not (c = any (it.choices))) then raise exception 'Choisis ton item' using errcode = 'P0001'; end if;
  if it.choices is null then c := null; end if;
  select email_confirmed_at into conf from auth.users where id = uid;
  if not free and conf is null then raise exception 'Vérifie d''abord ton adresse e-mail pour participer aux tirages et recevoir tes lots' using errcode = 'P0001'; end if;
  if not free and conf > now() - interval '7 days' then raise exception 'Disponible 7 jours après la création de ton compte' using errcode = 'P0001'; end if;
  d := case when it.kind = 'ticket' then public._game_next_draw(it.cycle, now()) end;
  insert into public.tickets (user_id, item, cost_pk, draw_at, choice) values (uid, it.id, case when free then 0 else it.price_pk end, d, c);
  return public._game_move(uid, 'shop', -it.price_pk, 0, it.id || coalesce(' · ' || c, ''), req) || jsonb_build_object('item', it.id,
    'count', (select count(*) from public.tickets where user_id = uid and item = it.id and draw_at is not distinct from d),
    'draw_at', d, 'choice', c);
end; $$;
revoke all on function public.buy_item(text, uuid, text) from public, anon;
grant execute on function public.buy_item(text, uuid, text) to authenticated;

-- ================= 016_xp_pk.sql =================
-- 016 : « 2XP PK » achetables avec des PA au PK shop (2026-11-08, porteur : « dans le PK shop tu vas aussi proposer des
-- double XP de PK que l'on pourra acheter avec ses PA » ; 7 jours 400 PA, 14 jours 700 PA, 30 jours 1 000 PA).
-- Après 015. Rejouable (Studio › SQL Editor › Run).
--   - Pendant la durée achetée, les PK gagnés au Booster PK et à pile ou face sont doublés (heure du serveur).
--   - Un nouvel achat pendant un 2XP en cours prolonge la fin (les jours s'ajoutent, rien n'est perdu).
--   - PA débités par le serveur, journal « boost » ineffaçable ; un admin déverrouillé ne paie rien (007).
--   - Les PK doublés comptent pour les grades et le classement de la saison (PK gagnés), comme tout gain de jeu.

-- 1. Offres (prix modifiables ici seulement) et 2XP de chaque joueur (écrit par le serveur seulement).
create table if not exists public.pk_boost_offers (
  id text primary key,
  days int not null check (days between 1 and 365),
  price_pa int not null check (price_pa > 0),
  active boolean not null default true
);
insert into public.pk_boost_offers (id, days, price_pa, active) values
  ('xp-7', 7, 400, true), ('xp-14', 14, 700, true), ('xp-30', 30, 1000, true)
on conflict (id) do update set days = excluded.days, price_pa = excluded.price_pa, active = excluded.active;
alter table public.pk_boost_offers enable row level security;
drop policy if exists pk_boost_offers_read on public.pk_boost_offers;
create policy pk_boost_offers_read on public.pk_boost_offers for select to authenticated using (true);
revoke insert, update, delete on public.pk_boost_offers from public, anon, authenticated;

create table if not exists public.pk_boosts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  until timestamptz not null,
  updated_at timestamptz not null default now()
);
alter table public.pk_boosts enable row level security;
drop policy if exists pk_boosts_own on public.pk_boosts;
create policy pk_boosts_own on public.pk_boosts for select to authenticated using (user_id = auth.uid());
revoke insert, update, delete on public.pk_boosts from public, anon, authenticated;

alter table public.ledger drop constraint if exists ledger_kind_check;
alter table public.ledger add constraint ledger_kind_check check (kind in ('welcome', 'reprise', 'share', 'pa_day', 'booster', 'coin',
  'unlock', 'shop', 'admin', 'purchase', 'avatar', 'boost'));

-- 2. 2XP en cours ?
create or replace function public._pk_boost_on(uid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.pk_boosts where user_id = uid and until > now());
$$;
revoke all on function public._pk_boost_on(uuid) from public, anon, authenticated;

-- 3. Achat d'un 2XP avec des PA.
create or replace function public.buy_pk_boost(offer text, req uuid) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._game_begin(); o public.pk_boost_offers%rowtype; cur timestamptz; nu timestamptz; r jsonb;
begin
  r := public._game_replay(uid, req); if r is not null then return r; end if;
  select * into o from public.pk_boost_offers where id = offer and active;
  if not found then raise exception 'Offre indisponible' using errcode = 'P0001'; end if;
  select until into cur from public.pk_boosts where user_id = uid for update;
  nu := greatest(coalesce(cur, now()), now()) + make_interval(days => o.days);
  r := public._game_move(uid, 'boost', 0, -o.price_pa, o.id, req);
  insert into public.pk_boosts (user_id, until) values (uid, nu)
  on conflict (user_id) do update set until = excluded.until, updated_at = now();
  return r || jsonb_build_object('offer', o.id, 'days', o.days, 'until', nu);
end; $$;
revoke all on function public.buy_pk_boost(text, uuid) from public, anon;
grant execute on function public.buy_pk_boost(text, uuid) to authenticated;

-- 4. Booster PK (remplace 011) : mêmes délais et chances ; PK doublés pendant un 2XP.
create or replace function public.open_booster(req uuid) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._game_begin(); gr public.game_grades%rowtype; last timestamptz; x double precision; won int; m int; r jsonb;
begin
  r := public._game_replay(uid, req); if r is not null then return r; end if;
  select * into gr from public.game_grades where i = public._game_grade(uid);
  select max(at) into last from public.ledger where user_id = uid and kind = 'booster';
  if not public._game_free(uid) and last is not null and last + make_interval(hours => gr.booster_h) > now() then
    raise exception 'Booster pas encore prêt' using errcode = 'P0001';
  end if;
  x := public._game_rand();
  won := case when x < 0.40 then 30 when x < 0.70 then 50 when x < 0.85 then 100 when x < 0.95 then 200 else 500 end;
  m := case when public._pk_boost_on(uid) then 2 else 1 end;
  return public._game_move(uid, 'booster', won * m, 0, case when m = 2 then '2XP PK' end, req)
    || jsonb_build_object('won', won * m, 'base', won, 'boost', m = 2, 'next', now() + make_interval(hours => gr.booster_h));
end; $$;
revoke all on function public.open_booster(uuid) from public, anon;
grant execute on function public.open_booster(uuid) to authenticated;

-- 5. Pile ou face (remplace 007) : mêmes règles ; 50 PK deviennent 100 PK pendant un 2XP.
create or replace function public.flip_coin(req uuid) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._game_begin(); gr public.game_grades%rowtype; last timestamptz; won int; m int; r jsonb; free boolean := public._game_free(uid);
begin
  r := public._game_replay(uid, req); if r is not null then return r; end if;
  select * into gr from public.game_grades where i = public._game_grade(uid);
  if gr.coin_h = 0 and not free then raise exception 'Pièce réservée au grade Chasseur et plus' using errcode = 'P0001'; end if;
  select max(at) into last from public.ledger where user_id = uid and kind = 'coin';
  if not free and last is not null and last + make_interval(hours => gr.coin_h) > now() then raise exception 'Pièce pas encore prête' using errcode = 'P0001'; end if;
  won := case when public._game_rand() < 0.5 then 50 else 0 end;
  m := case when public._pk_boost_on(uid) then 2 else 1 end;
  return public._game_move(uid, 'coin', won * m, 0, case when m = 2 and won > 0 then '2XP PK' end, req)
    || jsonb_build_object('won', won * m, 'base', won, 'boost', m = 2, 'win', won > 0, 'next', now() + make_interval(hours => greatest(gr.coin_h, 4)));
end; $$;
revoke all on function public.flip_coin(uuid) from public, anon;
grant execute on function public.flip_coin(uuid) to authenticated;

-- 6. Fin du 2XP en cours, lue par l'app (game_state reste celui de 010).
create or replace function public.pk_boost_state() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid(); u timestamptz;
begin
  if uid is null then raise exception 'Connexion requise' using errcode = '28000'; end if;
  select until into u from public.pk_boosts where user_id = uid;
  return jsonb_build_object('on', u is not null and u > now(), 'until', case when u > now() then u end, 'server_now', now(),
    'offers', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'days', days, 'pa', price_pa) order by days) from public.pk_boost_offers where active), '[]'::jsonb));
end; $$;
revoke all on function public.pk_boost_state() from public, anon;
grant execute on function public.pk_boost_state() to authenticated;

-- ================= 017_suppression_compte.sql =================
-- 017 : « Supprimer mon compte » (2026-11-09, demande du porteur pour la publication sur Google Play ; docs/23 §2).
-- Après 016. Rejouable.
-- Google Play et l'App Store exigent qu'une app où l'on crée un compte permette de le supprimer depuis l'app.
-- Le joueur connecté efface lui-même son compte, en une fois et pour de bon :
--   - sa connexion (auth.users : adresse, mot de passe, Face ID / empreinte) ;
--   - en cascade : profil, porte-monnaie (PK, PA), Pokédex, tickets, avatar et styles achetés, 2XP PK, Premium,
--     et son journal des PK et des PA (ledger), qui ne s'efface jamais autrement ;
--   - les paiements Premium déjà reçus restent pour la comptabilité (obligation de 10 ans), sans lien avec le compte.
-- Refusé, avec un message clair :
--   - un compte admin (retirer d'abord le rôle dans Studio : le journal des admins garde ses actions) ;
--   - un abonnement Premium en cours dont l'arrêt n'est pas demandé (sinon Stripe continuerait de prélever).

-- 1. Le journal des PK et des PA reste intouchable, sauf pendant la suppression du compte de son propriétaire,
--    faite par delete_my_account() ci-dessous (un joueur n'a aucun droit d'effacer une ligne lui-même).
create or replace function public.ledger_readonly() returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'DELETE' and coalesce(current_setting('dropicards.erase_user', true), '') = old.user_id::text then
    return old;
  end if;
  raise exception 'Le journal des PK et des PA ne peut être ni modifié ni effacé';
end; $$;
drop trigger if exists ledger_no_change on public.ledger;
create trigger ledger_no_change before update or delete on public.ledger
  for each row execute function public.ledger_readonly();

-- 2. Suppression du compte connecté.
create or replace function public.delete_my_account() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  p record;
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards pour le supprimer.'; end if;
  if exists (select 1 from public.profiles where id = uid and role = 'admin')
     or exists (select 1 from public.admin_log where admin_id = uid) then
    raise exception 'Ce compte est un compte admin : il ne peut pas être supprimé depuis l’app. Écris-nous à contact@dropicards.fr.';
  end if;
  select * into p from public.premium where user_id = uid;
  if found and p.status in ('active', 'trialing', 'past_due', 'unpaid', 'paused') and not p.cancel_at_period_end
     and coalesce(p.period_end, now()) > now() then
    raise exception 'Ton abonnement Premium est encore actif : arrête-le d’abord (sur dropicards.fr, ou en écrivant à contact@dropicards.fr), puis supprime ton compte.';
  end if;
  perform set_config('dropicards.erase_user', uid::text, true);
  update public.premium_payments set user_id = null where user_id = uid;
  delete from auth.users where id = uid;
  perform set_config('dropicards.erase_user', '', true);
  return jsonb_build_object('ok', true);
end; $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- ================= 018_lots_limites.sql =================
-- 018 : lots en quantité limitée, un achat direct par compte et par mois, tirage mensuel d'une carte choisie,
-- 2XP PK offert le premier mois du Premium (2026-11-09, porteur). Après 017. Rejouable (Studio › SQL Editor › Run).
--   - Achats directs plafonnés, réassort le 1er du mois à 20 h (heure de Paris) : booster 10 par mois, item rare 3 par
--     mois, ETB 30 ans 1 tous les 2 mois (périodes de 2 mois qui commencent en novembre, janvier, mars, mai, juillet,
--     septembre). « Épuisé » jusqu'au réassort.
--   - Un seul achat direct par compte et par mois (tous lots confondus), « pour donner la chance à tout le monde ».
--   - Tickets toujours en vente ; un tirage par mois pour chaque ticket, le 1er à 20 h, avec 1 lot par tirage :
--     Bronze = une carte ultra rare (double étoile argentée), Argent = une carte AR (une étoile dorée), Or = une carte
--     ALT (deux étoiles dorées). Le porteur charge chaque mois une ou plusieurs cartes par ticket (panneau Admin de
--     l'app, ou Studio › Table Editor › draw_prizes) ; le joueur choisit sa carte à l'achat du ticket. Le gagnant
--     reçoit la carte qu'il a choisie.
--   - Premium : 30 jours de 2XP PK offerts au premier abonnement, une seule fois par compte.
--   - Un admin déverrouillé (007) n'est ni plafonné ni compté dans les stocks.

-- 1. Mois du PK shop : du 1er à 20 h au 1er suivant à 20 h (heure de Paris).
create or replace function public._shop_month_start(t timestamptz) returns timestamptz
language sql stable set search_path = '' as $$
  select (case when x >= date_trunc('month', x) + interval '20 hours' then date_trunc('month', x) + interval '20 hours'
    else date_trunc('month', x) - interval '1 month' + interval '20 hours' end) at time zone 'Europe/Paris'
  from (select t at time zone 'Europe/Paris' as x) s;
$$;
-- Période d'un stock (1 ou 2 mois ; les périodes de 2 mois commencent en novembre 2026, puis tous les 2 mois).
create or replace function public._shop_period(t timestamptz, months int) returns timestamptz
language plpgsql stable set search_path = '' as $$
declare s timestamp := public._shop_month_start(t) at time zone 'Europe/Paris'; k int; n int := greatest(coalesce(months, 1), 1);
begin
  if n > 1 then
    k := (extract(year from s)::int * 12 + extract(month from s)::int) - (2026 * 12 + 11);
    s := s - make_interval(months => ((k % n) + n) % n);
  end if;
  return s at time zone 'Europe/Paris';
end; $$;
-- Fin de cette période (= prochain réassort).
create or replace function public._shop_period_end(t timestamptz, months int) returns timestamptz
language sql stable set search_path = '' as $$
  select ((public._shop_period(t, months) at time zone 'Europe/Paris') + make_interval(months => greatest(coalesce(months, 1), 1))) at time zone 'Europe/Paris';
$$;
-- « le 1er décembre à 20 h »
create or replace function public._shop_when(t timestamptz) returns text
language sql stable set search_path = '' as $$
  select 'le ' || case when extract(day from x)::int = 1 then '1er' else extract(day from x)::int::text end || ' '
    || (array['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'])[extract(month from x)::int]
    || ' à ' || extract(hour from x)::int || ' h'
  from (select t at time zone 'Europe/Paris' as x) s;
$$;
-- Tirages : le 1er de chaque mois à 20 h pour les 3 tickets (remplace 007 et 008).
create or replace function public._game_next_draw(t timestamptz default now()) returns timestamptz
language sql stable set search_path = '' as $$ select public._shop_period_end(t, 1); $$;
create or replace function public._game_next_draw(cyc text, t timestamptz) returns timestamptz
language sql stable set search_path = '' as $$ select public._shop_period_end(t, 1); $$;
revoke all on function public._shop_month_start(timestamptz), public._shop_period(timestamptz, int), public._shop_period_end(timestamptz, int),
  public._shop_when(timestamptz), public._game_next_draw(timestamptz), public._game_next_draw(text, timestamptz) from public, anon, authenticated;

-- 2. Articles : tirages mensuels, lot d'une carte par ticket.
update public.game_items set cycle = '1m', label = 'Ticket Bronze · tirage d’une carte ultra rare, chaque mois', value_text = 'Carte ultra rare' where id = 'ticket-bronze';
update public.game_items set cycle = '1m', label = 'Ticket Argent · tirage d’une carte AR, chaque mois', value_text = 'Carte AR' where id = 'ticket-argent';
update public.game_items set cycle = '1m', label = 'Ticket Or · tirage d’une carte ALT, chaque mois', value_text = 'Carte ALT' where id = 'ticket-or';

-- 3. Stock des achats directs (modifiable ici ou dans Studio ; lu par tous les joueurs).
create table if not exists public.shop_stock (
  item text primary key references public.game_items (id) on delete cascade,
  qty int not null check (qty >= 0),
  months int not null default 1 check (months between 1 and 12)
);
insert into public.shop_stock (item, qty, months) values ('achat-booster', 10, 1), ('achat-rare', 3, 1), ('achat-etb-30', 1, 2)
on conflict (item) do update set qty = excluded.qty, months = excluded.months;
alter table public.shop_stock enable row level security;
drop policy if exists shop_stock_read on public.shop_stock;
create policy shop_stock_read on public.shop_stock for select to authenticated using (true);
revoke insert, update, delete on public.shop_stock from public, anon, authenticated;
grant select on public.shop_stock to authenticated;
create index if not exists tickets_item_at on public.tickets (item, bought_at);

-- 4. Cartes à gagner : une ou plusieurs par tirage et par ticket, chargées par le porteur.
create table if not exists public.draw_prizes (
  id bigint generated always as identity primary key,
  draw_at timestamptz not null,
  item text not null references public.game_items (id) on delete cascade,
  card text not null check (card ~ '^[A-Za-z0-9._-]{1,60}$'),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  info text check (info is null or char_length(info) <= 160),
  img text check (img is null or (img ~ '^[A-Za-z0-9._/-]{1,200}$' and img !~ '\.\.')),
  created_at timestamptz not null default now(),
  unique (draw_at, item, card)
);
alter table public.draw_prizes enable row level security;
drop policy if exists draw_prizes_read on public.draw_prizes;
create policy draw_prizes_read on public.draw_prizes for select to authenticated using (true);
revoke insert, update, delete on public.draw_prizes from public, anon, authenticated;
grant select on public.draw_prizes to authenticated;

-- Ajouter une carte à un tirage (admins) : un tirage = le 1er d'un mois à 20 h, à venir ; tickets seulement.
create or replace function public.admin_prize_add(draw timestamptz, item_id text, card_id text, card_name text,
  card_info text default null, card_img text default null) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare d timestamptz := coalesce(draw, public._game_next_draw(now())); nid bigint;
begin
  if not public.is_admin() then raise exception 'Réservé aux admins' using errcode = '42501'; end if;
  if d <= now() or d <> public._shop_month_start(d) then raise exception 'Tirage invalide (le 1er d''un mois à 20 h, à venir)' using errcode = 'P0001'; end if;
  if not exists (select 1 from public.game_items where id = item_id and kind = 'ticket') then raise exception 'Ticket inconnu' using errcode = 'P0001'; end if;
  insert into public.draw_prizes (draw_at, item, card, name, info, img)
  values (d, item_id, btrim(card_id), btrim(card_name), nullif(btrim(coalesce(card_info, '')), ''), nullif(btrim(coalesce(card_img, '')), ''))
  on conflict (draw_at, item, card) do update set name = excluded.name, info = excluded.info, img = excluded.img
  returning id into nid;
  insert into public.admin_log (admin_id, action, details, reason)
  values (auth.uid(), 'prize_add', jsonb_build_object('item', item_id, 'card', card_id, 'draw_at', d), 'Carte ajoutée au tirage');
  return jsonb_build_object('ok', true, 'id', nid, 'draw_at', d);
end; $$;
-- Retirer une carte (admins) : impossible si un joueur l'a déjà choisie.
create or replace function public.admin_prize_remove(prize_id bigint) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare p public.draw_prizes%rowtype;
begin
  if not public.is_admin() then raise exception 'Réservé aux admins' using errcode = '42501'; end if;
  select * into p from public.draw_prizes where id = prize_id;
  if not found then return jsonb_build_object('ok', false, 'msg', 'Carte introuvable'); end if;
  if exists (select 1 from public.tickets where item = p.item and draw_at = p.draw_at and choice = p.card) then
    raise exception 'Des joueurs ont déjà choisi cette carte : elle reste au tirage' using errcode = 'P0001';
  end if;
  delete from public.draw_prizes where id = prize_id;
  insert into public.admin_log (admin_id, action, details, reason)
  values (auth.uid(), 'prize_remove', jsonb_build_object('item', p.item, 'card', p.card, 'draw_at', p.draw_at), 'Carte retirée du tirage');
  return jsonb_build_object('ok', true);
end; $$;
-- Cartes des tirages à venir, avec le nombre de tickets de chacune (admins).
create or replace function public.admin_prizes() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Réservé aux admins' using errcode = '42501'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('id', p.id, 'draw_at', p.draw_at, 'item', p.item, 'card', p.card, 'name', p.name,
      'info', p.info, 'img', p.img, 'tickets', (select count(*) from public.tickets t where t.item = p.item and t.draw_at = p.draw_at and t.choice = p.card))
    order by p.draw_at, p.item, p.id) from public.draw_prizes p where p.draw_at > now()), '[]'::jsonb);
end; $$;
revoke all on function public.admin_prize_add(timestamptz, text, text, text, text, text), public.admin_prize_remove(bigint), public.admin_prizes() from public, anon;
grant execute on function public.admin_prize_add(timestamptz, text, text, text, text, text), public.admin_prize_remove(bigint), public.admin_prizes() to authenticated;

-- 5. Achat (remplace 015) : cartes au choix pour les tickets, stock et un achat par mois pour les achats directs.
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

-- 6. État du PK shop, lu par l'app : stocks, achat du mois, cartes du prochain tirage et tickets du joueur.
create or replace function public.shop_state() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid(); m timestamptz := public._shop_month_start(now()); nd timestamptz := public._game_next_draw(now());
  mb jsonb; stock jsonb; prizes jsonb; mine jsonb;
begin
  if uid is null then raise exception 'Connexion requise' using errcode = '28000'; end if;
  select jsonb_build_object('item', t.item, 'at', t.bought_at) into mb from public.tickets t join public.game_items i on i.id = t.item
    where t.user_id = uid and i.kind = 'lot' and t.cost_pk > 0 and t.bought_at >= m order by t.bought_at desc limit 1;
  select jsonb_object_agg(s.item, jsonb_build_object('total', s.qty, 'months', s.months, 'restock', public._shop_period_end(now(), s.months),
      'left', greatest(0, s.qty - (select count(*)::int from public.tickets t where t.item = s.item and t.cost_pk > 0 and t.bought_at >= public._shop_period(now(), s.months)))))
    into stock from public.shop_stock s;
  select jsonb_object_agg(x.item, x.cards) into prizes from (
    select p.item, jsonb_agg(jsonb_build_object('id', p.card, 'name', p.name, 'info', p.info, 'img', p.img) order by p.id) as cards
    from public.draw_prizes p where p.draw_at = nd group by p.item) x;
  select jsonb_object_agg(y.item, y.picks) into mine from (
    select t.item, jsonb_object_agg(t.choice, t.n) as picks
    from (select item, choice, count(*) as n from public.tickets where user_id = uid and draw_at = nd and choice is not null group by item, choice) t
    group by t.item) y;
  return jsonb_build_object('server_now', now(), 'month_start', m, 'next_month', public._shop_period_end(now(), 1), 'draw_at', nd, 'draw_lots', 1,
    'stock', coalesce(stock, '{}'::jsonb), 'month_buy', mb, 'prizes', coalesce(prizes, '{}'::jsonb), 'mine', coalesce(mine, '{}'::jsonb));
end; $$;
revoke all on function public.shop_state() from public, anon;
grant execute on function public.shop_state() to authenticated;

-- 7. Participants (remplace 008) : avec la carte choisie.
drop function if exists public.admin_draw_entries(timestamptz);
create or replace function public.admin_draw_entries(draw timestamptz default null)
returns table (draw_at timestamptz, item text, card text, user_id uuid, pseudo text, email text, tickets bigint)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Réservé aux admins'; end if;
  return query
    select t.draw_at, t.item, coalesce(p.name || coalesce(' (' || p.info || ')', ''), t.choice), t.user_id, pr.pseudo, u.email::text, count(*)
    from public.tickets t join auth.users u on u.id = t.user_id left join public.profiles pr on pr.id = t.user_id
      left join public.draw_prizes p on p.draw_at = t.draw_at and p.item = t.item and p.card = t.choice
    where t.draw_at is not null and (case when draw is null then t.draw_at > now() else t.draw_at = draw end)
    group by t.draw_at, t.item, p.name, p.info, t.choice, t.user_id, pr.pseudo, u.email
    order by t.draw_at, t.item, count(*) desc;
end; $$;
revoke all on function public.admin_draw_entries(timestamptz) from public, anon;
grant execute on function public.admin_draw_entries(timestamptz) to authenticated;

-- 8. E-mail de chaque achat (remplace 012) : nom de la carte choisie à la place de son identifiant.
create or replace function public.shop_pending(lim int default 20) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(x order by x->>'bought_at'), '[]'::jsonb) from (
    select jsonb_build_object('id', t.id, 'item', t.item, 'label', i.label, 'kind', i.kind, 'cost_pk', t.cost_pk,
      'bought_at', t.bought_at, 'draw_at', t.draw_at, 'choice', coalesce(dp.name || coalesce(' · ' || dp.info, ''), t.choice), 'user_id', t.user_id,
      'email', u.email::text, 'pseudo', p.pseudo,
      'count', (select count(*) from public.tickets t2 where t2.user_id = t.user_id and t2.item = t.item and t2.draw_at is not distinct from t.draw_at)) as x
    from public.tickets t
    join auth.users u on u.id = t.user_id
    left join public.profiles p on p.id = t.user_id
    left join public.game_items i on i.id = t.item
    left join public.draw_prizes dp on dp.draw_at = t.draw_at and dp.item = t.item and dp.card = t.choice
    where not exists (select 1 from public.shop_notices n where n.ticket_id = t.id)
      and t.bought_at >= (select since from public.shop_notice_start where k = 1)
    order by t.bought_at
    limit greatest(1, least(coalesce(lim, 20), 50))
  ) s;
$$;
revoke all on function public.shop_pending(int) from public, anon, authenticated;
grant execute on function public.shop_pending(int) to service_role;

-- 9. Premium : 30 jours de 2XP PK offerts au premier abonnement (une fois par compte). Remplace premium_apply de 010.
alter table public.premium add column if not exists xp_gift_at timestamptz;
create or replace function public.premium_apply(uid uuid, cust text, sub text, plan_id text, sub_status text,
  ends_at timestamptz, cancel boolean, live boolean) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare u uuid := uid; gift boolean := false;
begin
  if u is null then select user_id into u from public.premium where stripe_customer = cust or stripe_subscription = sub limit 1; end if;
  if u is null or not exists (select 1 from auth.users where id = u) then return jsonb_build_object('ok', false, 'msg', 'compte introuvable'); end if;
  if sub is null or sub !~ '^sub_[A-Za-z0-9]+$' then raise exception 'Abonnement Stripe invalide'; end if;
  if exists (select 1 from public.premium where stripe_customer = cust and user_id <> u) then raise exception 'Client Stripe déjà lié à un autre compte'; end if;
  insert into public.premium as p (user_id, stripe_customer, stripe_subscription, plan, status, period_end, cancel_at_period_end, livemode, started_at)
  values (u, cust, sub, plan_id, sub_status, ends_at, coalesce(cancel, false), coalesce(live, false), case when sub_status in ('active', 'trialing') then now() end)
  on conflict (user_id) do update set
    stripe_customer = coalesce(excluded.stripe_customer, p.stripe_customer),
    stripe_subscription = excluded.stripe_subscription,
    plan = coalesce(excluded.plan, p.plan),
    status = excluded.status,
    period_end = excluded.period_end,
    cancel_at_period_end = excluded.cancel_at_period_end,
    livemode = excluded.livemode,
    started_at = coalesce(p.started_at, excluded.started_at),
    updated_at = now();
  if sub_status in ('active', 'trialing') then
    update public.premium set xp_gift_at = now() where user_id = u and xp_gift_at is null;
    gift := found;
    if gift then
      insert into public.pk_boosts (user_id, until) values (u, now() + interval '30 days')
      on conflict (user_id) do update set until = greatest(public.pk_boosts.until, now()) + interval '30 days', updated_at = now();
    end if;
  end if;
  return jsonb_build_object('ok', true, 'user_id', u, 'premium', public._premium_on(u), 'xp_gift', gift);
end; $$;
revoke all on function public.premium_apply(uuid, text, text, text, text, timestamptz, boolean, boolean) from public, anon, authenticated;
grant execute on function public.premium_apply(uuid, text, text, text, text, timestamptz, boolean, boolean) to service_role;

-- 2XP en cours (remplace 016) : en plus, la date du 2XP offert par le Premium.
create or replace function public.pk_boost_state() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid(); u timestamptz;
begin
  if uid is null then raise exception 'Connexion requise' using errcode = '28000'; end if;
  select until into u from public.pk_boosts where user_id = uid;
  return jsonb_build_object('on', u is not null and u > now(), 'until', case when u > now() then u end, 'server_now', now(),
    'gift_at', (select xp_gift_at from public.premium where user_id = uid),
    'offers', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'days', days, 'pa', price_pa) order by days) from public.pk_boost_offers where active), '[]'::jsonb));
end; $$;
revoke all on function public.pk_boost_state() from public, anon;
grant execute on function public.pk_boost_state() to authenticated;

-- ================= 019_boite_mystere.sql =================
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

-- 0. Scripts demandés avant celui-ci (2026-11-10) : sans eux, ce script s'arrêtait à sa 1re ligne, rien n'était
--    installé et l'app affichait « Une erreur est survenue » à l'ouverture de la boîte. Message clair à la place.
do $$
begin
  if to_regclass('public.pk_boost_offers') is null then raise exception 'Installe d''abord 016_xp_pk.sql, puis relance 019 (000_verifier.sql liste ce qui manque)'; end if;
  if to_regclass('public.shop_stock') is null then raise exception 'Installe d''abord 018_lots_limites.sql, puis relance 019 (000_verifier.sql liste ce qui manque)'; end if;
end $$;

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

-- ================= 020_premium_formules.sql =================
-- 020 : formules Premium trimestrielle et semestrielle (2026-11-10, porteur). Après 010. Rejouable.
--   Prix (porteur) : 9,90 € par mois, 24,90 € pour 3 mois, 39,90 € pour 6 mois, 69,90 € par an. Les prix eux-mêmes
--   sont dans Stripe (docs/28 § 8 ter) ; ici, la base accepte seulement les deux nouvelles formules.
do $$
begin
  if to_regclass('public.premium') is null then raise exception 'Installe d''abord 010_premium.sql, puis relance 020 (000_verifier.sql liste ce qui manque)'; end if;
end $$;
alter table public.premium drop constraint if exists premium_plan_check;
alter table public.premium add constraint premium_plan_check check (plan is null or plan in ('month', 'quarter', 'semester', 'year'));

-- ================= 021_avatar_v2.sql =================
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

-- ================= 022_avatar_v3.sql =================
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

-- 1 bis. Styles de la v5 (2026-11-11, soir, porteur) : nouvel ordre, nouvelles coiffures, teints, formes de visage, yeux,
--   couleur des yeux, habits, décors animés, cadres et accessoires ; prix proposés, à confirmer (mêmes que l'app).
insert into public.avatar_items (id, price_pa) values
  ('skin:citrouille', 150),
  ('skin:menthe', 150),
  ('skin:bonbon', 150),
  ('skin:ciel', 150),
  ('skin:lavande', 150),
  ('skin:glace', 150),
  ('skin:or', 150),
  ('skin:ombre', 200),
  ('skin:emeraude', 200),
  ('face:coeur', 100),
  ('eyes:manga', 150),
  ('eyes:etoiles', 150),
  ('eyes:coeurs', 150),
  ('eyes:spirale', 150),
  ('ec:violet', 100),
  ('ec:rouge', 100),
  ('ec:or', 100),
  ('hair:banane', 200),
  ('hair:afro', 200),
  ('hair:mulet', 200),
  ('hair:chignon', 200),
  ('hair:queue', 200),
  ('hair:couettes', 200),
  ('hair:crete', 200),
  ('hair:antennes', 250),
  ('hair:ananas', 250),
  ('hair:nuage', 250),
  ('hair:flamme', 300),
  ('hc:bleu', 100),
  ('hc:rose', 100),
  ('hc:orange', 100),
  ('hc:vert', 100),
  ('hc:turquoise', 100),
  ('hc:violet', 100),
  ('outfit:hawai', 200),
  ('outfit:maillot', 250),
  ('outfit:aventurier', 250),
  ('outfit:pirate', 250),
  ('outfit:kimono', 250),
  ('outfit:smoking', 250),
  ('outfit:cape', 250),
  ('outfit:heros', 300),
  ('outfit:astronaute', 350),
  ('outfit:chevalier', 350),
  ('outfit:royal', 400),
  ('bg:coucher', 150),
  ('bg:foret', 150),
  ('bg:plage', 150),
  ('bg:etoiles', 150),
  ('bg:holo', 150),
  ('bg:aurore', 150),
  ('bg:volcan', 150),
  ('bg:neige', 200),
  ('bg:galaxie', 200),
  ('bg:tempete', 300),
  ('bg:lave', 300),
  ('bg:tsunami', 300),
  ('acc:couronne', 150),
  ('acc:noeud', 100),
  ('acc:fete', 100),
  ('acc:echarpe', 100),
  ('acc:papillon', 50),
  ('acc:moustache', 50),
  ('acc:bulle', 50),
  ('acc:chat', 100),
  ('acc:masque', 100),
  ('acc:monocle', 100),
  ('acc:medaille', 100),
  ('acc:aureole', 150),
  ('acc:cornes', 150),
  ('acc:casque', 150),
  ('acc:pirate', 150),
  ('acc:fleurs', 150),
  ('acc:coeurs', 150),
  ('frame:arcenciel', 150),
  ('frame:tempete', 250),
  ('frame:vague', 250),
  ('frame:lave', 250),
  ('frame:galaxie', 150),
  ('frame:eclair', 150),
  ('frame:glace', 150),
  ('frame:neon', 150),
  ('frame:brume', 150),
  ('frame:sakura', 150),
  ('frame:holo', 200),
  ('frame:bulles', 150),
  ('frame:electrique', 200),
  ('frame:pixel', 200),
  ('frame:ombre', 200),
  ('frame:feu', 250),
  ('frame:cosmique', 250),
  ('frame:cristal', 250),
  ('frame:diamant', 300)
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
  foreach k in array array['skin', 'face', 'eyes', 'ec', 'hair', 'hc', 'outfit', 'bg', 'pos', 'acc', 'frame', 'aon'] loop
    v := cfg->>k;
    if v is null then v := case k when 'acc' then 'aucun' when 'frame' then 'aucun' when 'aon' then 'poke' when 'ec' then 'noir' else null end; end if;
    if v is null or v !~ '^[a-z0-9]{1,16}$' then raise exception 'Avatar invalide (%)', k using errcode = 'P0001'; end if;
    if k not in ('pos', 'aon') and exists (select 1 from public.avatar_items a where a.id = k || ':' || v)
       and not prem and not exists (select 1 from public.avatar_unlocks u where u.user_id = uid and u.item = k || ':' || v) then
      raise exception 'Style PRO à débloquer : %', k || ':' || v using errcode = 'P0001';
    end if;
    clean := clean || jsonb_build_object(k, v);
  end loop;
  if clean->>'acc' not in ('aucun', 'lunettes', 'casquette', 'couronne', 'noeud', 'fete', 'echarpe', 'bandeau', 'papillon', 'moustache', 'bulle', 'chat', 'masque', 'monocle', 'medaille', 'aureole', 'cornes', 'casque', 'pirate', 'fleurs', 'coeurs') then raise exception 'Avatar invalide (acc)' using errcode = 'P0001'; end if;
  if clean->>'frame' not in ('aucun', 'dore', 'arcenciel', 'tempete', 'vague', 'lave', 'galaxie', 'eclair', 'glace', 'neon', 'brume', 'sakura', 'holo', 'bulles', 'electrique', 'pixel', 'ombre', 'feu', 'cosmique', 'cristal', 'diamant') then raise exception 'Avatar invalide (frame)' using errcode = 'P0001'; end if;
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

-- ================= 023_boite_legendaires.sql =================
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

-- Fin : l'API de Supabase relit la liste des fonctions (sinon l'app ne les voit qu'au redémarrage).
notify pgrst, 'reload schema';
