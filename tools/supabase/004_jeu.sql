-- 004 : règles du jeu sur le serveur (2026-11-06, « go » du porteur : « aucune triche possible sur les PK et les PA »).
-- Fichier produit par `node tools/supabase/gen_game.mjs` à partir de 004_jeu.template.sql (prix des Pokémon tirés de
-- tools/web/pk.js et tools/sprites/dex.json) : ne pas modifier 004_jeu.sql à la main.
-- Principe : le téléphone ne décide de rien. Chaque gain et chaque dépense passe par une fonction ci-dessous, qui lit
-- l'heure du serveur (jour de Paris), tire elle-même les résultats au hasard, vérifie le délai et le grade, verrouille
-- le compte le temps de l'opération, écrit le mouvement dans un journal ineffaçable (ledger) et refuse un même numéro
-- de demande deux fois. Les soldes ne sont jamais écrits par l'app (droits retirés dans 001).
-- Décisions du porteur (2026-11-06) : tout le monde repart à 100 PK ; connexion obligatoire pour les jeux ; tickets et
-- lots seulement 7 jours après la confirmation de l'adresse, pièce d'identité du gagnant vérifiée ; adresses jetables
-- refusées (005). Rejouable.

-- 1. Pokémon et prix en PA (lecture seule pour les comptes).
create table if not exists public.game_pokemon (
  n int primary key,
  from_n int not null default 0,          -- forme précédente à posséder (0 : aucune)
  mega boolean not null default false,
  price_pa int not null check (price_pa >= 0)
);
alter table public.game_pokemon enable row level security;
revoke all on public.game_pokemon from anon, authenticated;
grant select on public.game_pokemon to authenticated;
drop policy if exists game_pokemon_read on public.game_pokemon;
create policy game_pokemon_read on public.game_pokemon for select to authenticated using (true);
insert into public.game_pokemon (n, from_n, mega, price_pa) values
  (1, 0, false, 0),
  (2, 1, false, 50),
  (3, 2, false, 200),
  (4, 0, false, 0),
  (5, 4, false, 50),
  (6, 5, false, 200),
  (7, 0, false, 0),
  (8, 7, false, 50),
  (9, 8, false, 200),
  (10, 0, false, 15),
  (11, 10, false, 30),
  (12, 11, false, 75),
  (13, 0, false, 15),
  (14, 13, false, 30),
  (15, 14, false, 75),
  (16, 0, false, 15),
  (17, 16, false, 30),
  (18, 17, false, 75),
  (19, 0, false, 15),
  (20, 19, false, 30),
  (21, 0, false, 15),
  (22, 21, false, 30),
  (23, 0, false, 15),
  (24, 23, false, 30),
  (25, 0, false, 0),
  (26, 25, false, 150),
  (27, 0, false, 15),
  (28, 27, false, 30),
  (29, 0, false, 15),
  (30, 29, false, 30),
  (31, 30, false, 75),
  (32, 0, false, 15),
  (33, 32, false, 30),
  (34, 33, false, 75),
  (35, 0, false, 15),
  (36, 35, false, 30),
  (37, 0, false, 15),
  (38, 37, false, 50),
  (39, 0, false, 15),
  (40, 39, false, 30),
  (41, 0, false, 15),
  (42, 41, false, 30),
  (43, 0, false, 15),
  (44, 43, false, 30),
  (45, 44, false, 75),
  (46, 0, false, 15),
  (47, 46, false, 30),
  (48, 0, false, 15),
  (49, 48, false, 30),
  (50, 0, false, 15),
  (51, 50, false, 30),
  (52, 0, false, 15),
  (53, 52, false, 50),
  (54, 0, false, 15),
  (55, 54, false, 30),
  (56, 0, false, 15),
  (57, 56, false, 30),
  (58, 0, false, 15),
  (59, 58, false, 50),
  (60, 0, false, 15),
  (61, 60, false, 30),
  (62, 61, false, 75),
  (63, 0, false, 15),
  (64, 63, false, 50),
  (65, 64, false, 100),
  (66, 0, false, 15),
  (67, 66, false, 30),
  (68, 67, false, 75),
  (69, 0, false, 15),
  (70, 69, false, 30),
  (71, 70, false, 75),
  (72, 0, false, 15),
  (73, 72, false, 30),
  (74, 0, false, 15),
  (75, 74, false, 30),
  (76, 75, false, 75),
  (77, 0, false, 15),
  (78, 77, false, 30),
  (79, 0, false, 15),
  (80, 79, false, 30),
  (81, 0, false, 15),
  (82, 81, false, 30),
  (83, 0, false, 15),
  (84, 0, false, 15),
  (85, 84, false, 30),
  (86, 0, false, 15),
  (87, 86, false, 30),
  (88, 0, false, 15),
  (89, 88, false, 30),
  (90, 0, false, 15),
  (91, 90, false, 30),
  (92, 0, false, 15),
  (93, 92, false, 50),
  (94, 93, false, 100),
  (95, 0, false, 30),
  (96, 0, false, 15),
  (97, 96, false, 30),
  (98, 0, false, 15),
  (99, 98, false, 30),
  (100, 0, false, 15),
  (101, 100, false, 30),
  (102, 0, false, 15),
  (103, 102, false, 30),
  (104, 0, false, 15),
  (105, 104, false, 30),
  (106, 0, false, 30),
  (107, 0, false, 30),
  (108, 0, false, 15),
  (109, 0, false, 15),
  (110, 109, false, 30),
  (111, 0, false, 15),
  (112, 111, false, 30),
  (113, 0, false, 30),
  (114, 0, false, 15),
  (115, 0, false, 50),
  (116, 0, false, 15),
  (117, 116, false, 30),
  (118, 0, false, 15),
  (119, 118, false, 30),
  (120, 0, false, 15),
  (121, 120, false, 30),
  (122, 0, false, 15),
  (123, 0, false, 15),
  (124, 0, false, 15),
  (125, 0, false, 15),
  (126, 0, false, 15),
  (127, 0, false, 15),
  (128, 0, false, 15),
  (129, 0, false, 50),
  (130, 129, false, 100),
  (131, 0, false, 30),
  (132, 0, false, 15),
  (133, 0, false, 30),
  (134, 133, false, 75),
  (135, 133, false, 75),
  (136, 133, false, 75),
  (137, 0, false, 15),
  (138, 0, false, 15),
  (139, 138, false, 30),
  (140, 0, false, 15),
  (141, 140, false, 30),
  (142, 0, false, 50),
  (143, 0, false, 50),
  (144, 0, false, 300),
  (145, 0, false, 300),
  (146, 0, false, 300),
  (147, 0, false, 50),
  (148, 147, false, 100),
  (149, 148, false, 200),
  (150, 0, false, 500),
  (151, 0, false, 500),
  (380, 0, false, 300),
  (381, 0, false, 300),
  (382, 0, false, 1000),
  (383, 0, false, 1000),
  (384, 0, false, 1000),
  (10033, 3, true, 500),
  (10034, 6, true, 500),
  (10035, 6, true, 500),
  (10036, 9, true, 500),
  (10090, 15, true, 150),
  (10073, 18, true, 150),
  (10037, 65, true, 200),
  (10071, 80, true, 100),
  (10038, 94, true, 200),
  (10039, 115, true, 150),
  (10040, 127, true, 50),
  (10041, 130, true, 250),
  (10042, 142, true, 100),
  (10043, 150, true, 500),
  (10044, 150, true, 500)
on conflict (n) do update set from_n = excluded.from_n, mega = excluded.mega, price_pa = excluded.price_pa;

-- 2. Grades et leurs avantages (mêmes valeurs que tools/web/profile.js, PF_GRADES).
create table if not exists public.game_grades (
  i int primary key,
  name text not null,
  pk_earned int not null, comp int not null, mega int not null,
  booster_h int not null, coin_h int not null,           -- coin_h = 0 : pièce fermée
  ticket boolean not null default false, shop_booster boolean not null default false
);
alter table public.game_grades enable row level security;
revoke all on public.game_grades from anon, authenticated;
grant select on public.game_grades to authenticated;
drop policy if exists game_grades_read on public.game_grades;
create policy game_grades_read on public.game_grades for select to authenticated using (true);
insert into public.game_grades (i, name, pk_earned, comp, mega, booster_h, coin_h, ticket, shop_booster) values
  (0, 'Recrue', 0, 0, 0, 24, 0, false, false),
  (1, 'Chasseur', 1500, 0, 0, 24, 24, false, false),
  (2, 'Collectionneur', 5000, 15, 0, 10, 10, true, false),
  (3, 'Dresseur Pokémon', 10000, 30, 0, 8, 8, true, true),
  (4, 'Maître Pokémon', 20000, 100, 1, 6, 6, true, true),
  (5, 'Grand maître Pokémon', 50000, 151, 5, 4, 4, true, true)
on conflict (i) do update set name = excluded.name, pk_earned = excluded.pk_earned, comp = excluded.comp, mega = excluded.mega,
  booster_h = excluded.booster_h, coin_h = excluded.coin_h, ticket = excluded.ticket, shop_booster = excluded.shop_booster;

-- 3. Articles du PK shop.
create table if not exists public.game_items (
  id text primary key,
  kind text not null check (kind in ('ticket', 'lot')),
  price_pk int not null check (price_pk > 0),
  perk text not null check (perk in ('ticket', 'shop_booster')),
  active boolean not null default true
);
alter table public.game_items enable row level security;
revoke all on public.game_items from anon, authenticated;
grant select on public.game_items to authenticated;
drop policy if exists game_items_read on public.game_items;
create policy game_items_read on public.game_items for select to authenticated using (true);
insert into public.game_items (id, kind, price_pk, perk) values
  ('ticket-booster', 'ticket', 2000, 'ticket'),
  ('lot-booster-30', 'lot', 15000, 'shop_booster')
on conflict (id) do update set kind = excluded.kind, price_pk = excluded.price_pk, perk = excluded.perk;

-- 4. Journal de chaque mouvement de PK et de PA : ajout seulement, jamais modifié ni effacé.
create table if not exists public.ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('welcome', 'reprise', 'share', 'pa_day', 'booster', 'coin', 'unlock', 'shop', 'admin', 'purchase')),
  pk int not null default 0,
  pa int not null default 0,
  pk_after int not null,
  pa_after int not null,
  ref text,
  request_id uuid,
  at timestamptz not null default now()
);
create index if not exists ledger_user on public.ledger (user_id, at desc);
create unique index if not exists ledger_request on public.ledger (user_id, request_id) where request_id is not null;
alter table public.ledger enable row level security;
revoke all on public.ledger from anon, authenticated;
grant select on public.ledger to authenticated;
drop policy if exists ledger_read on public.ledger;
create policy ledger_read on public.ledger for select to authenticated using (user_id = auth.uid() or public.is_admin());
drop trigger if exists ledger_no_change on public.ledger;
create trigger ledger_no_change before update or delete on public.ledger
  for each row execute function public.admin_log_readonly();

-- 5. Garde-fou contre les rafales : 30 actions de jeu par minute et par compte au plus.
create table if not exists public.game_throttle (
  user_id uuid primary key references auth.users (id) on delete cascade,
  window_start timestamptz not null default now(),
  n int not null default 0
);
alter table public.game_throttle enable row level security;
revoke all on public.game_throttle from anon, authenticated;

-- Outils internes (jamais appelables depuis l'app).
create or replace function public._game_today() returns date language sql stable set search_path = '' as $$
  select (now() at time zone 'Europe/Paris')::date;
$$;
create or replace function public._game_rand() returns double precision language sql volatile set search_path = '' as $$
  select (('x' || encode(extensions.gen_random_bytes(4), 'hex'))::bit(32)::bigint)::double precision / 4294967296.0;
$$;
-- Compte appelant : connecté, actif, adresse confirmée ; verrou du porte-monnaie jusqu'à la fin de l'opération ;
-- limite des rafales.
create or replace function public._game_begin() returns uuid
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := auth.uid(); st text; conf timestamptz; t public.game_throttle%rowtype;
begin
  if uid is null then raise exception 'Connexion requise' using errcode = '28000'; end if;
  select p.status, u.email_confirmed_at into st, conf from public.profiles p join auth.users u on u.id = p.id where p.id = uid;
  if st is distinct from 'active' then raise exception 'Compte suspendu' using errcode = '42501'; end if;
  if conf is null then raise exception 'Adresse e-mail à confirmer' using errcode = '42501'; end if;
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
-- Demande déjà traitée (même numéro) : on renvoie le résultat déjà donné, sans rien refaire.
create or replace function public._game_replay(uid uuid, req uuid) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('replay', true, 'kind', l.kind, 'pk', l.pk, 'pa', l.pa, 'pk_after', l.pk_after, 'pa_after', l.pa_after, 'ref', l.ref)
  from public.ledger l where l.user_id = uid and l.request_id = req;
$$;
-- Mouvement : porte-monnaie et journal ensemble (jamais l'un sans l'autre).
create or replace function public._game_move(uid uuid, k text, dpk int, dpa int, r text, req uuid) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare w public.wallets%rowtype;
begin
  select * into w from public.wallets where user_id = uid;
  if w.pk + dpk < 0 then raise exception 'Pas assez de PK' using errcode = 'P0001'; end if;
  if w.pa + dpa < 0 then raise exception 'Pas assez de PA' using errcode = 'P0001'; end if;
  update public.wallets set pk = pk + dpk, pa = pa + dpa, pk_earned = pk_earned + greatest(dpk, 0), updated_at = now()
  where user_id = uid returning * into w;
  insert into public.ledger (user_id, kind, pk, pa, pk_after, pa_after, ref, request_id) values (uid, k, dpk, dpa, w.pk, w.pa, r, req);
  return jsonb_build_object('pk', w.pk, 'pa', w.pa, 'pk_earned', w.pk_earned);
end; $$;
-- Possède-t-il ce Pokémon ? (offerts : prix 0 et aucune forme précédente)
create or replace function public._game_owns(uid uuid, num int) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.game_pokemon g where g.n = num and g.price_pa = 0 and not g.mega and g.from_n = 0)
      or exists (select 1 from public.dex_unlocks d where d.user_id = uid and d.pokemon = num);
$$;
-- Grade : le plus haut dont les trois conditions sont remplies (PK gagnés, compagnons, méga-évolutions).
create or replace function public._game_grade(uid uuid) returns int
language sql stable security definer set search_path = '' as $$
  with c as (
    select coalesce((select pk_earned from public.wallets where user_id = uid), 0) as pk,
           (select count(*) from public.game_pokemon g where not g.mega and public._game_owns(uid, g.n)) as comp,
           (select count(*) from public.dex_unlocks d join public.game_pokemon g on g.n = d.pokemon where d.user_id = uid and g.mega) as mega
  )
  select coalesce(max(gr.i), 0) from public.game_grades gr, c where c.pk >= gr.pk_earned and c.comp >= gr.comp and c.mega >= gr.mega;
$$;
revoke all on function public._game_today(), public._game_rand(), public._game_begin(), public._game_replay(uuid, uuid),
  public._game_move(uuid, text, int, int, text, uuid), public._game_owns(uuid, int), public._game_grade(uuid) from public, anon, authenticated;

-- 6. État complet du compte, pour l'app (soldes, grade, délais, Pokémon débloqués, achats).
create or replace function public.game_state() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid(); w public.wallets%rowtype; g int; gr public.game_grades%rowtype; today date := public._game_today();
  conf timestamptz; nb timestamptz; nc timestamptz; nxt jsonb;
begin
  if uid is null then raise exception 'Connexion requise' using errcode = '28000'; end if;
  select * into w from public.wallets where user_id = uid;
  g := public._game_grade(uid);
  select * into gr from public.game_grades where i = g;
  select email_confirmed_at into conf from auth.users where id = uid;
  nb := (select max(at) from public.ledger where user_id = uid and kind = 'booster') + make_interval(hours => gr.booster_h);
  nc := case when gr.coin_h > 0 then (select max(at) from public.ledger where user_id = uid and kind = 'coin') + make_interval(hours => gr.coin_h) end;
  nxt := case when w.pa_day = today then null
    else to_jsonb(case when w.pa_day is null then 20 when w.pa_day = today - 1 then (array[20, 30, 40, 50, 70])[least(w.pa_streak + 1, 5)] else 30 end) end;
  return jsonb_build_object(
    'pk', w.pk, 'pa', w.pa, 'pk_earned', w.pk_earned, 'today', today, 'server_now', now(),
    'pa_day', w.pa_day, 'pa_streak', w.pa_streak, 'pa_gain', nxt,
    'grade', g, 'booster_next', nb, 'coin_open', gr.coin_h > 0, 'coin_next', nc,
    'booster_last', (select max(at) from public.ledger where user_id = uid and kind = 'booster'),
    'coin_last', (select max(at) from public.ledger where user_id = uid and kind = 'coin'),
    'buddy', (select buddy from public.profiles where id = uid),
    'shared', exists (select 1 from public.ledger where user_id = uid and kind = 'share'),
    'unlocked', coalesce((select jsonb_agg(pokemon order by pokemon) from public.dex_unlocks where user_id = uid), '[]'::jsonb),
    'shop', coalesce((select jsonb_object_agg(item, n) from (select item, count(*) n from public.tickets where user_id = uid group by item) t), '{}'::jsonb),
    'shop_open_at', conf + interval '7 days');
end; $$;

-- 7. PA du jour : chaque jour dès minuit (heure de Paris) ; série +20, +30, +40, +50, puis +70 ; un jour manqué : +30.
create or replace function public.claim_daily_pa(req uuid) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._game_begin(); w public.wallets%rowtype; today date := public._game_today(); s int; gain int; r jsonb;
begin
  r := public._game_replay(uid, req); if r is not null then return r; end if;
  select * into w from public.wallets where user_id = uid;
  if w.pa_day = today then raise exception 'PA du jour déjà récupérés' using errcode = 'P0001'; end if;
  s := case when w.pa_day is null then 1 when w.pa_day = today - 1 then greatest(w.pa_streak, 0) + 1 else 2 end;
  gain := (array[20, 30, 40, 50, 70])[least(s, 5)];
  update public.wallets set pa_day = today, pa_streak = s where user_id = uid;
  return public._game_move(uid, 'pa_day', 0, gain, 'J' || s, req) || jsonb_build_object('gain', gain, 'streak', s);
end; $$;

-- 8. Booster PK : 30 PK (50 %), 50 (20 %), 100 (15 %), 200 (10 %), 500 (5 %) ; délai selon le grade.
create or replace function public.open_booster(req uuid) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._game_begin(); gr public.game_grades%rowtype; last timestamptz; x double precision; won int; r jsonb;
begin
  r := public._game_replay(uid, req); if r is not null then return r; end if;
  select * into gr from public.game_grades where i = public._game_grade(uid);
  select max(at) into last from public.ledger where user_id = uid and kind = 'booster';
  if last is not null and last + make_interval(hours => gr.booster_h) > now() then raise exception 'Booster pas encore prêt' using errcode = 'P0001'; end if;
  x := public._game_rand();
  won := case when x < 0.50 then 30 when x < 0.70 then 50 when x < 0.85 then 100 when x < 0.95 then 200 else 500 end;
  return public._game_move(uid, 'booster', won, 0, null, req) || jsonb_build_object('won', won, 'next', now() + make_interval(hours => gr.booster_h));
end; $$;

-- 9. Pile ou face : 0 ou 50 PK, une chance sur deux ; fermée à la Recrue ; délai selon le grade.
create or replace function public.flip_coin(req uuid) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._game_begin(); gr public.game_grades%rowtype; last timestamptz; won int; r jsonb;
begin
  r := public._game_replay(uid, req); if r is not null then return r; end if;
  select * into gr from public.game_grades where i = public._game_grade(uid);
  if gr.coin_h = 0 then raise exception 'Pièce réservée au grade Chasseur et plus' using errcode = 'P0001'; end if;
  select max(at) into last from public.ledger where user_id = uid and kind = 'coin';
  if last is not null and last + make_interval(hours => gr.coin_h) > now() then raise exception 'Pièce pas encore prête' using errcode = 'P0001'; end if;
  won := case when public._game_rand() < 0.5 then 50 else 0 end;
  return public._game_move(uid, 'coin', won, 0, null, req) || jsonb_build_object('won', won, 'win', won > 0, 'next', now() + make_interval(hours => gr.coin_h));
end; $$;

-- 10. Partage de l'app : +300 PK, une seule fois par compte.
create or replace function public.claim_share(req uuid, via text) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._game_begin(); r jsonb;
begin
  r := public._game_replay(uid, req); if r is not null then return r; end if;
  if exists (select 1 from public.ledger where user_id = uid and kind = 'share') then raise exception 'Partage déjà récompensé' using errcode = 'P0001'; end if;
  return public._game_move(uid, 'share', 300, 0, left(coalesce(via, ''), 20), req) || jsonb_build_object('won', 300);
end; $$;

-- 11. Débloquer un Pokémon avec des PA : prix du serveur, forme précédente possédée, PA suffisants.
create or replace function public.unlock_pokemon(num int, req uuid) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._game_begin(); p public.game_pokemon%rowtype; r jsonb;
begin
  r := public._game_replay(uid, req); if r is not null then return r; end if;
  select * into p from public.game_pokemon where n = num;
  if not found then raise exception 'Pokémon inconnu' using errcode = 'P0001'; end if;
  if public._game_owns(uid, num) then raise exception 'Déjà débloqué' using errcode = 'P0001'; end if;
  if p.from_n > 0 and not public._game_owns(uid, p.from_n) then raise exception 'Débloque d''abord sa forme précédente' using errcode = 'P0001'; end if;
  insert into public.dex_unlocks (user_id, pokemon) values (uid, num);
  r := public._game_move(uid, 'unlock', 0, -p.price_pa, num::text, req);
  update public.profiles set buddy = num where id = uid;
  return r || jsonb_build_object('n', num, 'price', p.price_pa, 'grade', public._game_grade(uid));
end; $$;

-- 12. PK shop : ticket du tirage (grade Collectionneur et plus) ou lot (grade Dresseur Pokémon et plus), 7 jours
-- après la confirmation de l'adresse (porteur, 2026-11-06).
create or replace function public.buy_item(item_id text, req uuid) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._game_begin(); it public.game_items%rowtype; gr public.game_grades%rowtype; conf timestamptz; r jsonb;
begin
  r := public._game_replay(uid, req); if r is not null then return r; end if;
  select * into it from public.game_items where id = item_id and active;
  if not found then raise exception 'Article indisponible' using errcode = 'P0001'; end if;
  select * into gr from public.game_grades where i = public._game_grade(uid);
  if (it.perk = 'ticket' and not gr.ticket) or (it.perk = 'shop_booster' and not gr.shop_booster) then raise exception 'Grade insuffisant pour cet article' using errcode = 'P0001'; end if;
  select email_confirmed_at into conf from auth.users where id = uid;
  if conf > now() - interval '7 days' then raise exception 'Disponible 7 jours après la création de ton compte' using errcode = 'P0001'; end if;
  insert into public.tickets (user_id, item, cost_pk) values (uid, it.id, it.price_pk);
  return public._game_move(uid, 'shop', -it.price_pk, 0, it.id, req) || jsonb_build_object('item', it.id,
    'count', (select count(*) from public.tickets where user_id = uid and item = it.id));
end; $$;

-- 13. Compagnon choisi : seulement un Pokémon possédé.
create or replace function public.profiles_buddy_rule() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.buddy is not null and new.buddy is distinct from old.buddy and not public._game_owns(new.id, new.buddy) then
    raise exception 'Compagnon non débloqué' using errcode = 'P0001';
  end if;
  return new;
end; $$;
drop trigger if exists profiles_buddy on public.profiles;
create trigger profiles_buddy before update on public.profiles for each row execute function public.profiles_buddy_rule();

-- 14. Inscription : 100 PK de bienvenue, écrits aussi dans le journal (remplace la version de 003).
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  p text := nullif(btrim(regexp_replace(coalesce(m->>'pseudo', ''), '\s+', ' ', 'g')), '');
  a text := m->>'age_range';
  st int := case when coalesce(m->>'starter', '') in ('1', '4', '7', '25') then (m->>'starter')::int end;
begin
  if p is not null and char_length(p) not between 2 and 24 then p := null; end if;
  if a is null or a not in ('u15', '15-25', '25-35', '35+') then a := null; end if;
  insert into public.profiles (id, pseudo, age_range, starter, buddy, news_optin)
    values (new.id, p, a, st, st, coalesce(m->>'news_optin', '') = 'true')
    on conflict (id) do nothing;
  insert into public.wallets (user_id, pk, pk_earned) values (new.id, 100, 100) on conflict (user_id) do nothing;
  insert into public.ledger (user_id, kind, pk, pa, pk_after, pa_after) values (new.id, 'welcome', 100, 0, 100, 0);
  return new;
end; $$;

-- 15. Outils admin : chaque ajustement passe aussi par le journal (remplace la version de 001).
create or replace function public.admin_adjust_wallet(target uuid, delta_pk int, delta_pa int, reason text) returns void
language plpgsql security definer set search_path = '' as $$
declare w public.wallets%rowtype; dpk int; dpa int;
begin
  if not public.is_admin() then raise exception 'Réservé aux admins'; end if;
  if reason is null or char_length(trim(reason)) < 3 then raise exception 'Motif obligatoire'; end if;
  select * into w from public.wallets where user_id = target for update;
  if not found then raise exception 'Compte introuvable'; end if;
  dpk := greatest(coalesce(delta_pk, 0), -w.pk); dpa := greatest(coalesce(delta_pa, 0), -w.pa);
  perform public._game_move(target, 'admin', dpk, dpa, left(trim(reason), 120), null);
  insert into public.admin_log (admin_id, action, target_user, details, reason)
  values (auth.uid(), 'wallet', target, jsonb_build_object('pk', dpk, 'pa', dpa), trim(reason));
end; $$;

-- 16. Vérification des comptes (admins) : soldes comparés au journal ; une ligne par écart.
create or replace function public.admin_check_ledger() returns table (user_id uuid, pk int, pk_ledger bigint, pa int, pa_ledger bigint)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Réservé aux admins'; end if;
  return query
    select w.user_id, w.pk, coalesce(sum(l.pk), 0), w.pa, coalesce(sum(l.pa), 0)
    from public.wallets w left join public.ledger l on l.user_id = w.user_id
    group by w.user_id, w.pk, w.pa
    having w.pk <> coalesce(sum(l.pk), 0) or w.pa <> coalesce(sum(l.pa), 0);
end; $$;

-- Droits : les fonctions de jeu pour les comptes connectés seulement.
revoke all on function public.game_state(), public.claim_daily_pa(uuid), public.open_booster(uuid), public.flip_coin(uuid),
  public.claim_share(uuid, text), public.unlock_pokemon(int, uuid), public.buy_item(text, uuid), public.admin_check_ledger() from public, anon;
grant execute on function public.game_state(), public.claim_daily_pa(uuid), public.open_booster(uuid), public.flip_coin(uuid),
  public.claim_share(uuid, text), public.unlock_pokemon(int, uuid), public.buy_item(text, uuid), public.admin_check_ledger() to authenticated;

-- 17. Reprise (porteur, 2026-11-06 : « tout le monde repart à 100 PK ») : comptes déjà créés remis à 100 PK et 0 PA,
-- une seule fois (comptes sans journal).
update public.wallets w set pk = 100, pa = 0, pk_earned = 100, pa_streak = 0, pa_day = null, games = '{}'::jsonb, updated_at = now()
where not exists (select 1 from public.ledger l where l.user_id = w.user_id);
insert into public.ledger (user_id, kind, pk, pa, pk_after, pa_after)
select w.user_id, 'reprise', 100, 0, 100, 0 from public.wallets w
where not exists (select 1 from public.ledger l where l.user_id = w.user_id);
