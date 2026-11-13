-- INSTALLATION EN UNE FOIS des scripts 024 et 025 (2026-11-13, porteur : « ouvre le Safari à tous » et « suivre tous
-- les joueurs en mode admin »). 024 : le jeu Safari éclair (le serveur tire les Pokémon, compte et donne les PK).
-- 025 : Admin › Joueurs (PK, PA, régularité) et temps passé dans l'app. Il faut 001 à 023 déjà installés (fait le
-- 2026-11-12). Rejouable : sans risque si l'un des deux est déjà installé.
-- Supabase Studio › SQL Editor › New query › colle TOUT ce fichier › Run. Puis colle 000_verifier.sql › Run : les lignes
-- 024 et 025 doivent être « oui ». Ce fichier est fabriqué à partir de 024 et 025 (tools/supabase/make_install_024.sh) :
-- ne pas le modifier à la main.

-- ================= 024_safari.sql =================
-- 024 : « Safari éclair », 3ᵉ jeu à PK (2026-11-12, « go » du porteur : « go pour la safari éclair à intégrer dans les
-- jeux pour gagner les PK »). Après 023. Rejouable (Studio › SQL Editor › Run).
--   - Une partie de 20 s : des Pokémon traversent l'écran ; le joueur touche ceux du type demandé (« Attrape les Pokémon
--     Eau ! ») : +2 PK par bon Pokémon, −1 PK par erreur, jamais moins de 0 (docs/37, défauts proposés et retenus).
--   - Le serveur tire tout : le type, les 36 Pokémon, leur ordre et leur passage (18 du bon type). Il compte lui-même les
--     bons et les mauvais à partir des Pokémon touchés, avec son heure : partie finie au plus tôt 18 s après le départ.
--     Gain maximal : 36 PK (72 PK pendant un 2XP PK).
--   - Ouvert à partir du grade Collectionneur (2026-11-13, porteur) : une partie toutes les 24 h (Collectionneur), 12 h
--     (Dresseur Pokémon), 6 h (Maître Pokémon), 4 h (Grand maître Pokémon) ; fermé aux grades Recrue et Chasseur ;
--     sans délai ni grade demandé pour un admin déverrouillé (007).
--   - Les PK gagnés comptent pour les grades et le classement de la saison, comme le Booster PK et la pièce.

-- 1. Délai de chaque grade.
-- 0 = fermé (Recrue, Chasseur).
alter table public.game_grades add column if not exists safari_h int not null default 0;
update public.game_grades g set safari_h = v.h from (values (0, 0), (1, 0), (2, 24), (3, 12), (4, 6), (5, 4)) as v(i, h) where g.i = v.i;

-- 2. Types proposés et leurs Pokémon (les 156 du Pokédex, sans les méga-évolutions ; tools/sprites/dex.json).
create table if not exists public.safari_types (t text primary key, nums int[] not null);
insert into public.safari_types (t, nums) values
  ('Eau', array[7, 8, 9, 54, 55, 60, 61, 62, 72, 73, 79, 80, 86, 87, 90, 91, 98, 99, 116, 117, 118, 119, 120, 121, 129, 130, 131, 134, 138, 139, 140, 141, 382]::int[]),
  ('Feu', array[4, 5, 6, 37, 38, 58, 59, 77, 78, 126, 136, 146]::int[]),
  ('Plante', array[1, 2, 3, 43, 44, 45, 46, 47, 69, 70, 71, 102, 103, 114]::int[]),
  ('Électrik', array[25, 26, 81, 82, 100, 101, 125, 135, 145]::int[]),
  ('Psy', array[63, 64, 65, 79, 80, 96, 97, 102, 103, 121, 122, 124, 150, 151, 380, 381]::int[]),
  ('Insecte', array[10, 11, 12, 13, 14, 15, 46, 47, 48, 49, 123, 127]::int[]),
  ('Roche', array[74, 75, 76, 95, 111, 112, 138, 139, 140, 141, 142]::int[]),
  ('Normal', array[16, 17, 18, 19, 20, 21, 22, 39, 40, 52, 53, 83, 84, 85, 108, 113, 115, 128, 132, 133, 137, 143]::int[]),
  ('Vol', array[6, 12, 16, 17, 18, 21, 22, 41, 42, 83, 84, 85, 123, 130, 142, 144, 145, 146, 149, 384]::int[]),
  ('Sol', array[27, 28, 31, 34, 50, 51, 74, 75, 76, 95, 104, 105, 111, 112, 383]::int[]),
  ('Poison', array[1, 2, 3, 13, 14, 15, 23, 24, 29, 30, 31, 32, 33, 34, 41, 42, 43, 44, 45, 48, 49, 69, 70, 71, 72, 73, 88, 89, 92, 93, 94, 109, 110]::int[])
on conflict (t) do update set nums = excluded.nums;
alter table public.safari_types enable row level security;
revoke all on public.safari_types from public, anon, authenticated;

-- 3. Parties (écrites par le serveur seulement ; le joueur ne lit que les siennes).
create table if not exists public.safari_rounds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  req uuid,
  kind text not null,
  spawns jsonb not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  good int, bad int, won int
);
create index if not exists safari_rounds_user on public.safari_rounds (user_id, started_at desc);
alter table public.safari_rounds enable row level security;
drop policy if exists safari_rounds_own on public.safari_rounds;
create policy safari_rounds_own on public.safari_rounds for select to authenticated using (user_id = auth.uid());
revoke insert, update, delete on public.safari_rounds from public, anon, authenticated;

alter table public.ledger drop constraint if exists ledger_kind_check;
alter table public.ledger add constraint ledger_kind_check check (kind in ('welcome', 'reprise', 'share', 'pa_day', 'booster', 'coin',
  'unlock', 'shop', 'admin', 'purchase', 'avatar', 'boost', 'mystery', 'scan_bonus', 'safari'));

-- 4. Saison : les PK du safari comptent aussi (remplace 013).
create or replace function public._season_scores(a timestamptz, b timestamptz) returns table (user_id uuid, pk bigint)
language sql stable security definer set search_path = '' as $$
  select p.id, coalesce(sum(l.pk) filter (where l.pk > 0 and l.kind in ('welcome', 'share', 'booster', 'coin', 'safari')), 0)::bigint
  from public.profiles p
  left join public.ledger l on l.user_id = p.id and l.at >= a and l.at < b
  where p.role = 'user' and p.status = 'active' and p.pseudo is not null
  group by p.id;
$$;
revoke all on function public._season_scores(timestamptz, timestamptz) from public, anon, authenticated;

-- 5. Dernière partie, délai et prochaine partie (lus par l'app).
create or replace function public.safari_state() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid(); last timestamptz; h int;
begin
  if uid is null then raise exception 'Connexion requise' using errcode = '28000'; end if;
  select max(at) into last from public.ledger where user_id = uid and kind = 'safari';
  select safari_h into h from public.game_grades where i = public._game_grade(uid);
  return jsonb_build_object('last', last, 'hours', h, 'locked', coalesce(h, 0) = 0 and not public._game_free(uid),
    'next', case when last is null or public._game_free(uid) or coalesce(h, 0) = 0 then now() else last + make_interval(hours => h) end, 'server_now', now());
end; $$;
revoke all on function public.safari_state() from public, anon;
grant execute on function public.safari_state() to authenticated;

-- 6. Départ d'une partie : type et Pokémon tirés par le serveur. Une partie commencée et pas finie est remplacée.
create or replace function public.safari_start(req uuid) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._game_begin(); gr public.game_grades%rowtype; last timestamptz; ty public.safari_types%rowtype;
  decoys int[]; sp jsonb; rid uuid; old public.safari_rounds%rowtype;
begin
  select * into old from public.safari_rounds sr where sr.user_id = uid and sr.req = safari_start.req;
  if found then return jsonb_build_object('round', old.id, 'kind', old.kind, 'spawns', old.spawns, 'server_now', now()); end if;
  select * into gr from public.game_grades where i = public._game_grade(uid);
  select max(at) into last from public.ledger where user_id = uid and kind = 'safari';
  if not public._game_free(uid) and coalesce(gr.safari_h, 0) = 0 then
    raise exception 'Le Safari éclair s’ouvre au grade Collectionneur' using errcode = 'P0001';
  end if;
  if not public._game_free(uid) and last is not null and last + make_interval(hours => gr.safari_h) > now() then
    raise exception 'Safari pas encore prêt' using errcode = 'P0001';
  end if;
  select * into ty from public.safari_types order by public._game_rand() limit 1;
  select array_agg(n) into decoys from (select distinct unnest(nums) as n from public.safari_types) x where not (n = any (ty.nums));
  with s as (select g, (g <= 18) as tgt, public._game_rand() as k from generate_series(1, 36) g),
       o as (select (row_number() over (order by k) - 1)::int as idx, tgt from s)
  select jsonb_agg(jsonb_build_object(
    'i', idx,
    'n', case when tgt then ty.nums[1 + floor(public._game_rand() * array_length(ty.nums, 1))::int]
              else decoys[1 + floor(public._game_rand() * array_length(decoys, 1))::int] end,
    'ok', tgt,
    't', idx * 520 + floor(public._game_rand() * 250)::int,
    'lane', floor(public._game_rand() * 5)::int,
    'dir', case when public._game_rand() < 0.5 then 1 else -1 end,
    'dur', 3400 - idx * 38 + floor(public._game_rand() * 300)::int) order by idx)
  into sp from o;
  delete from public.safari_rounds where user_id = uid and finished_at is null;
  insert into public.safari_rounds (user_id, req, kind, spawns) values (uid, safari_start.req, ty.t, sp) returning id into rid;
  return jsonb_build_object('round', rid, 'kind', ty.t, 'spawns', sp, 'server_now', now());
end; $$;
revoke all on function public.safari_start(uuid) from public, anon;
grant execute on function public.safari_start(uuid) to authenticated;

-- 7. Fin de la partie : le serveur compte les Pokémon touchés et crédite les PK (doublés pendant un 2XP PK).
create or replace function public.safari_finish(round uuid, hits int[], req uuid) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._game_begin(); r jsonb; rd public.safari_rounds%rowtype; g int; b int; w int; m int; gr public.game_grades%rowtype;
begin
  r := public._game_replay(uid, req); if r is not null then return r; end if;
  select * into rd from public.safari_rounds sr where sr.id = round and sr.user_id = uid for update;
  if not found or rd.finished_at is not null then raise exception 'Partie introuvable ou déjà finie' using errcode = 'P0001'; end if;
  if now() < rd.started_at + interval '18 seconds' then raise exception 'Partie pas encore finie' using errcode = 'P0001'; end if;
  if now() > rd.started_at + interval '10 minutes' then raise exception 'Partie expirée : relance-la' using errcode = 'P0001'; end if;
  select count(*) filter (where (e->>'ok')::boolean), count(*) filter (where not (e->>'ok')::boolean) into g, b
  from jsonb_array_elements(rd.spawns) e
  where (e->>'i')::int in (select distinct h from unnest(coalesce(hits, '{}'::int[])) h where h between 0 and 35);
  w := greatest(0, 2 * g - b);
  m := case when public._pk_boost_on(uid) then 2 else 1 end;
  update public.safari_rounds sr set finished_at = now(), good = g, bad = b, won = w * m where sr.id = rd.id;
  select * into gr from public.game_grades where i = public._game_grade(uid);
  return public._game_move(uid, 'safari', w * m, 0, rd.kind || ' ' || g || '/' || b || case when m = 2 then ' · 2XP PK' else '' end, req)
    || jsonb_build_object('won', w * m, 'base', w, 'boost', m = 2, 'good', g, 'bad', b, 'kind', rd.kind,
                          'next', now() + make_interval(hours => gr.safari_h));
end; $$;
revoke all on function public.safari_finish(uuid, int[], uuid) from public, anon;
grant execute on function public.safari_finish(uuid, int[], uuid) to authenticated;

notify pgrst, 'reload schema';

-- ================= 025_suivi_joueurs.sql =================
-- 025 : suivi des joueurs pour les admins (2026-11-13, porteur : « une interface qui permet de suivre absolument toutes
-- les personnes qui ont un compte Dropicards et qui jouent régulièrement, avec leurs PK et PA actuels, visible
-- uniquement en mode admin par les admins ; et le temps que chaque utilisateur passe sur l'appli, de l'ouverture à la
-- fermeture »). Après 024 (ou 023 : ce script ne dépend pas du Safari). Rejouable (Studio › SQL Editor › Run).
--   - Temps passé : l'app, ouverte et visible à l'écran, envoie chaque minute le temps écoulé (et au moment où elle passe
--     en arrière-plan ou se ferme). Le serveur l'additionne par jour (heure de Paris), sans jamais compter plus que le
--     temps réellement écoulé entre deux envois, au plus 2 minutes par envoi et 24 h par jour.
--   - Rien d'autre n'est enregistré : ni écran consulté, ni position, ni appareil. Le joueur ne peut ni lire ni modifier
--     ces lignes ; elles disparaissent avec son compte (suppression du compte, 017).
--   - Liste des joueurs (admin_players) : réservée aux admins déverrouillés (mot de passe des admins, 007) ; pseudo,
--     adresse, grade, PK, PA, PK gagnés au total, Premium, dernière activité, jours actifs et parties sur 7 et 30 jours,
--     temps passé aujourd'hui, sur 7 jours, sur 30 jours et au total.

-- 1. Temps passé dans l'app, par joueur et par jour.
create table if not exists public.app_time (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  seconds int not null default 0 check (seconds between 0 and 86400),
  sessions int not null default 0 check (sessions >= 0),
  first_at timestamptz not null default now(),
  last_at timestamptz not null default now(),
  primary key (user_id, day)
);
create index if not exists app_time_day on public.app_time (day);
alter table public.app_time enable row level security;
-- Aucune politique : ni lecture ni écriture directes ; seulement par les fonctions ci-dessous.
revoke all on public.app_time from public, anon, authenticated;

-- 2. Envoi de l'app : « secs » secondes passées depuis le dernier envoi ; « fresh » = l'app vient de s'ouvrir.
create or replace function public.track_time(secs int, fresh boolean default false) returns void
language plpgsql volatile security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  d date := (now() at time zone 'Europe/Paris')::date;
  prev timestamptz;
  add int;
begin
  if uid is null then raise exception 'Connexion requise'; end if;
  if secs is null or secs < 0 then secs := 0; end if;
  -- Dernier envoi de ce joueur (tous jours confondus) : on ne compte jamais plus que le temps écoulé depuis (+ 1 s).
  select max(t.last_at) into prev from public.app_time t where t.user_id = uid;
  add := least(secs, 120, case when prev is null then 120 else greatest(0, floor(extract(epoch from now() - prev))::int + 1) end);
  insert into public.app_time as t (user_id, day, seconds, sessions, first_at, last_at)
    values (uid, d, add, case when fresh then 1 else 0 end, now(), now())
  on conflict (user_id, day) do update
    set seconds = least(86400, t.seconds + add),
        sessions = t.sessions + case when fresh then 1 else 0 end,
        last_at = now();
end; $$;
revoke all on function public.track_time(int, boolean) from public, anon;
grant execute on function public.track_time(int, boolean) to authenticated;

-- 3. Liste des joueurs, pour les admins déverrouillés seulement.
create or replace function public.admin_players() returns table (
  id uuid, pseudo text, email text, role text, status text, created_at timestamptz,
  grade int, pk int, pa int, pk_earned int, premium boolean,
  last_seen timestamptz, days_7 int, days_30 int, games_7 int, games_30 int,
  secs_today int, secs_7 int, secs_30 int, secs_total bigint, sessions_7 int)
language plpgsql stable security definer set search_path = '' as $$
declare today date := (now() at time zone 'Europe/Paris')::date;
begin
  if not public.is_admin() then raise exception 'Réservé aux admins'; end if;
  return query
  with tm as (
    select t.user_id,
      coalesce(sum(t.seconds) filter (where t.day = today), 0)::int as s_today,
      coalesce(sum(t.seconds) filter (where t.day > today - 7), 0)::int as s_7,
      coalesce(sum(t.seconds) filter (where t.day > today - 30), 0)::int as s_30,
      coalesce(sum(t.seconds), 0)::bigint as s_all,
      coalesce(sum(t.sessions) filter (where t.day > today - 7), 0)::int as n_7,
      max(t.last_at) as last_at
    from public.app_time t group by t.user_id
  ), lg as (
    select l.user_id,
      count(*) filter (where l.at > now() - interval '7 days' and l.kind not in ('welcome', 'reprise', 'admin', 'purchase'))::int as g_7,
      count(*) filter (where l.at > now() - interval '30 days' and l.kind not in ('welcome', 'reprise', 'admin', 'purchase'))::int as g_30,
      max(l.at) as last_at
    from public.ledger l group by l.user_id
  ), dd as (
    -- Jours actifs : app ouverte (temps envoyé) ou action de jeu ce jour-là (heure de Paris).
    select x.user_id,
      count(distinct x.d) filter (where x.d > today - 7)::int as d_7,
      count(distinct x.d) filter (where x.d > today - 30)::int as d_30
    from (
      select t.user_id, t.day as d from public.app_time t where t.day > today - 30
      union all
      select l.user_id, (l.at at time zone 'Europe/Paris')::date from public.ledger l
        where l.at > now() - interval '31 days' and l.kind not in ('welcome', 'reprise', 'admin', 'purchase')
    ) x group by x.user_id
  )
  select u.id, p.pseudo, u.email::text, p.role, p.status, u.created_at,
    public._game_grade(u.id), coalesce(w.pk, 0), coalesce(w.pa, 0), coalesce(w.pk_earned, 0), public._premium_on(u.id),
    nullif(greatest(coalesce(u.last_sign_in_at, '-infinity'), coalesce(tm.last_at, '-infinity'), coalesce(lg.last_at, '-infinity')), '-infinity'::timestamptz),
    coalesce(dd.d_7, 0), coalesce(dd.d_30, 0), coalesce(lg.g_7, 0), coalesce(lg.g_30, 0),
    coalesce(tm.s_today, 0), coalesce(tm.s_7, 0), coalesce(tm.s_30, 0), coalesce(tm.s_all, 0), coalesce(tm.n_7, 0)
  from auth.users u
  left join public.profiles p on p.id = u.id
  left join public.wallets w on w.user_id = u.id
  left join tm on tm.user_id = u.id
  left join lg on lg.user_id = u.id
  left join dd on dd.user_id = u.id
  order by 12 desc nulls last, u.created_at desc;
end; $$;
revoke all on function public.admin_players() from public, anon;
grant execute on function public.admin_players() to authenticated;

-- Fin : l'API de Supabase relit la liste des fonctions (sinon l'app ne les voit qu'au redémarrage).
notify pgrst, 'reload schema';
