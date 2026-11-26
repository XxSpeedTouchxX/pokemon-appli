-- INSTALLATION EN UNE FOIS des scripts 024 à 028 et 030 à 034 (2026-11-13 au 18, porteur : « ouvre le Safari à tous », « suivre tous
-- les joueurs en mode admin », « 3 niveaux de difficulté pour le safari », « Safari illimité pour les admins et mon ami »,
-- « Points de loyauté »). 024 : le jeu Safari éclair (le serveur
-- tire les Pokémon, compte et donne les PK). 025 : Admin › Joueurs (PK, PA, régularité) et temps passé dans l'app.
-- 026 : les 3 niveaux du Safari (Facile, Normal, Difficile ; perte de PK possible en Normal et Difficile).
-- 027 : Safari sans délai pour les comptes admin et ceux de la liste safari_free (requetes_safari.sql).
-- 028 : Points de loyauté (PL) : défis, parrainage, captures de partage à valider, classement de la saison en PL.
-- 030 : cartes des tirages du PK shop modifiables même déjà choisies (tickets gardés, carte à rechoisir).
-- 031 : carte de visite des joueurs du classement de « Ma ligue ».
-- 032 : messages rapides entre joueurs de « Ma ligue » (8 messages tout faits, « Mes messages »).
-- 033 : vitrine, « Pour trade », « À vendre » et « Je cherche » (échanges entre joueurs, étage 1).
-- 034 : « Le coin des dresseurs » : rechercher un dresseur par son pseudo et voir les vitrines des dresseurs.
-- 037 (2026-11-21) : parrainage fiabilisé : code du lien envoyé avec l'inscription (50 PL tout de suite), invitation
-- avec le pseudo du parrain, 200 PL du parrain enfin montrés, avancement de chaque filleul.
-- 038 (2026-11-21) : « Ma vitrine » : chercher une carte proposée Pour trade ou à vendre (quel dresseur la propose) ;
-- messages rapides retirés (les propositions d'échange restent dans « Mes messages »).
-- 039 (2026-11-23) : chaque jeu s'ouvre au grade prévu pour tout le monde (Safari dès Collectionneur, pièce dès
-- Chasseur) ; les comptes « sans délai » (admins, liste du Safari) gardent seulement l'absence d'attente.
-- 040 (2026-11-25) : chaque achat direct du PK shop (booster, item rare, ETB) retire un article du stock, achats faits
-- en mode Admin compris.
-- 041 (2026-11-25) : « Mes messages » : messages envoyés, modifier ou supprimer un message (proposition sans réponse
-- modifiable ou retirée pour les deux, réponse modifiable ou retirée, message reçu retiré de sa liste).
-- 042 (2026-11-25) : PK shop : booster à 10 000 PK, item rare au choix et ETB 30 ans « Bientôt disponible » (fermés).
-- 043 (2026-11-25) : e-mail de félicitations au joueur après un achat direct (booster, item rare, ETB), avec une fiche
-- à renvoyer à contact@dropicards.fr ; il faut aussi la nouvelle fonction « notify » (docs/30 § 9).
-- 044 (2026-11-26) : Safari éclair au délai du grade pour tous (plus de « sans délai » pour les admins, le mode Admin
-- ni la liste safari_free).
-- 029 (annonces Vinted) n'y est pas : il a sa propre installation (docs/42).
-- Il faut 001 à 023 déjà installés (fait le 2026-11-12). Rejouable : sans risque si l'un d'eux est déjà installé.
-- Supabase Studio › SQL Editor › New query › colle TOUT ce fichier › Run. Puis colle 000_verifier.sql › Run : les lignes
-- 024 à 028, 030 à 034 et 037 à 044 doivent être « oui ». Ce fichier est fabriqué à partir de ces scripts
-- (tools/supabase/make_install_024.sh) : ne pas le modifier à la main.

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

-- ================= 026_safari_niveaux.sql =================
-- 026 : « Safari éclair », 3 niveaux de difficulté (2026-11-13, porteur : « lorsque l'utilisateur appuiera sur "go",
-- il devra choisir 3 niveaux de difficulté »). Après 024 (et 025). Rejouable (Studio › SQL Editor › Run).
--   - Facile (1) : vitesse d'origine, +2 PK par bon Pokémon, −1 PK par erreur, jamais moins de 0 (règle de 024).
--   - Normal (2) : vitesse ×2 (chaque Pokémon traverse deux fois plus vite), +4 PK par bon Pokémon, −4 PK par erreur.
--   - Difficile (3) : vitesse ×3, +8 PK par bon Pokémon, −8 PK par erreur.
--   - Normal et Difficile peuvent finir en négatif : les PK perdus sont retirés du solde (jamais sous 0 : la perte
--     s'arrête au solde). Facile ne fait jamais perdre de PK (validé par le porteur le 2026-11-14).
--   - 2XP PK : double les gains seulement, jamais les pertes (validé par le porteur le 2026-11-14).
--   - Une perte retire des PK du solde, comme un achat ; elle ne retire rien aux « PK gagnés au total » (grades) ni aux
--     PK de la saison (comme les dépenses ; validé par le porteur le 2026-11-14).
--   - Gain maximal : 36 PK (Facile), 72 PK (Normal), 144 PK (Difficile) ; perte maximale : 0, 72 et 144 PK.
--   - Les 36 Pokémon (18 bons) passent toujours en 20 s ; seule leur vitesse change. Le serveur garde le niveau de la
--     partie : il compte lui-même les points à la fin.
--   - safari_start(req) de 024 reste (niveau Facile) : une app pas encore à jour continue de marcher.

-- 1. Niveau de chaque partie.
alter table public.safari_rounds add column if not exists lvl int not null default 1;
alter table public.safari_rounds drop constraint if exists safari_rounds_lvl_check;
alter table public.safari_rounds add constraint safari_rounds_lvl_check check (lvl between 1 and 3);

-- 2. Points de chaque niveau : (bon, erreur, vitesse).
create or replace function public._safari_pts(lvl int) returns int[]
language sql immutable set search_path = '' as $$
  select case lvl when 2 then array[4, 4, 2] when 3 then array[8, 8, 3] else array[2, 1, 1] end;
$$;
revoke all on function public._safari_pts(int) from public, anon, authenticated;

-- 3. Départ d'une partie au niveau choisi (1, 2 ou 3) : type et Pokémon tirés par le serveur, vitesse du niveau.
create or replace function public.safari_start(req uuid, lvl int) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._game_begin(); gr public.game_grades%rowtype; last timestamptz; ty public.safari_types%rowtype;
  decoys int[]; sp jsonb; rid uuid; old public.safari_rounds%rowtype; pts int[];
begin
  if lvl is null or lvl not between 1 and 3 then raise exception 'Niveau inconnu' using errcode = 'P0001'; end if;
  select * into old from public.safari_rounds sr where sr.user_id = uid and sr.req = safari_start.req;
  if found then
    pts := public._safari_pts(old.lvl);
    return jsonb_build_object('round', old.id, 'kind', old.kind, 'spawns', old.spawns, 'lvl', old.lvl, 'plus', pts[1], 'minus', pts[2], 'server_now', now());
  end if;
  pts := public._safari_pts(lvl);
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
    -- Vitesse ×2 ou ×3 : la traversée dure 2 ou 3 fois moins longtemps.
    'dur', ((3400 - idx * 38 + floor(public._game_rand() * 300)::int) / pts[3])::int) order by idx)
  into sp from o;
  delete from public.safari_rounds where user_id = uid and finished_at is null;
  insert into public.safari_rounds (user_id, req, kind, spawns, lvl) values (uid, safari_start.req, ty.t, sp, safari_start.lvl) returning id into rid;
  return jsonb_build_object('round', rid, 'kind', ty.t, 'spawns', sp, 'lvl', safari_start.lvl, 'plus', pts[1], 'minus', pts[2], 'server_now', now());
end; $$;
revoke all on function public.safari_start(uuid, int) from public, anon;
grant execute on function public.safari_start(uuid, int) to authenticated;

-- Ancien départ (024, app pas encore à jour) : niveau Facile.
create or replace function public.safari_start(req uuid) returns jsonb
language sql volatile security definer set search_path = '' as $$
  select public.safari_start(req, 1);
$$;
revoke all on function public.safari_start(uuid) from public, anon;
grant execute on function public.safari_start(uuid) to authenticated;

-- 4. Fin de la partie : le serveur compte les points du niveau ; gain (doublé en 2XP PK) ou perte (jamais sous 0).
create or replace function public.safari_finish(round uuid, hits int[], req uuid) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._game_begin(); r jsonb; rd public.safari_rounds%rowtype; g int; b int; w int; m int; pk int;
  pts int[]; gr public.game_grades%rowtype;
begin
  r := public._game_replay(uid, req); if r is not null then return r; end if;
  select * into rd from public.safari_rounds sr where sr.id = round and sr.user_id = uid for update;
  if not found or rd.finished_at is not null then raise exception 'Partie introuvable ou déjà finie' using errcode = 'P0001'; end if;
  if now() < rd.started_at + interval '18 seconds' then raise exception 'Partie pas encore finie' using errcode = 'P0001'; end if;
  if now() > rd.started_at + interval '10 minutes' then raise exception 'Partie expirée : relance-la' using errcode = 'P0001'; end if;
  select count(*) filter (where (e->>'ok')::boolean), count(*) filter (where not (e->>'ok')::boolean) into g, b
  from jsonb_array_elements(rd.spawns) e
  where (e->>'i')::int in (select distinct h from unnest(coalesce(hits, '{}'::int[])) h where h between 0 and 35);
  pts := public._safari_pts(rd.lvl);
  w := pts[1] * g - pts[2] * b;
  if rd.lvl = 1 then w := greatest(0, w); end if;
  m := case when w > 0 and public._pk_boost_on(uid) then 2 else 1 end;
  w := w * m;
  -- Perte : jamais plus que le solde (le solde ne descend pas sous 0).
  if w < 0 then
    select wl.pk into pk from public.wallets wl where wl.user_id = uid for update;
    w := greatest(w, -coalesce(pk, 0));
  end if;
  update public.safari_rounds sr set finished_at = now(), good = g, bad = b, won = w where sr.id = rd.id;
  select * into gr from public.game_grades where i = public._game_grade(uid);
  return public._game_move(uid, 'safari', w, 0, rd.kind || ' ' || g || '/' || b || ' · niveau ' || rd.lvl || case when m = 2 then ' · 2XP PK' else '' end, req)
    || jsonb_build_object('won', w, 'base', w / m, 'boost', m = 2, 'good', g, 'bad', b, 'kind', rd.kind, 'lvl', rd.lvl,
                          'raw', pts[1] * g - pts[2] * b, 'next', now() + make_interval(hours => gr.safari_h));
end; $$;
revoke all on function public.safari_finish(uuid, int[], uuid) from public, anon;
grant execute on function public.safari_finish(uuid, int[], uuid) to authenticated;

notify pgrst, 'reload schema';

-- ================= 027_safari_libre.sql =================
-- 027 : Safari éclair sans délai pour les admins et des comptes choisis (2026-11-13, porteur : « puis-je refaire le jeu
-- Safari éclair illimité pour l'instant pour les admins et le compte de mon ami »). Après 026. Rejouable.
--   - Sans délai entre deux parties, et ouvert quel que soit le grade : les comptes admin (rôle « admin », actifs, même
--     sans le mot de passe des admins) et les comptes de la liste safari_free (ajoutés dans Studio, requetes_safari.sql).
--   - Les points restent ceux du niveau choisi (gains et pertes), comptés par le serveur ; les autres jeux (Booster PK,
--     pièce) gardent leurs délais.
--   - Pour arrêter : vider la liste (requetes_safari.sql), et/ou relancer 026 pour retirer aussi l'exception des admins.

-- 1. Comptes sans délai au Safari (écrits dans Studio seulement).
create table if not exists public.safari_free (
  user_id uuid primary key references auth.users (id) on delete cascade,
  note text,
  added_at timestamptz not null default now()
);
alter table public.safari_free enable row level security;
revoke all on public.safari_free from public, anon, authenticated;

-- 2. Safari sans délai : admin déverrouillé (007), compte admin, ou compte de la liste.
create or replace function public._safari_free(uid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select public._game_free(uid)
      or exists (select 1 from public.profiles p where p.id = uid and p.role = 'admin' and p.status = 'active')
      or exists (select 1 from public.safari_free f where f.user_id = uid);
$$;
revoke all on function public._safari_free(uuid) from public, anon, authenticated;

-- 3. État lu par l'app : « free » = sans délai.
create or replace function public.safari_state() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid(); last timestamptz; h int; fr boolean;
begin
  if uid is null then raise exception 'Connexion requise' using errcode = '28000'; end if;
  select max(at) into last from public.ledger where user_id = uid and kind = 'safari';
  select safari_h into h from public.game_grades where i = public._game_grade(uid);
  fr := public._safari_free(uid);
  return jsonb_build_object('last', last, 'hours', h, 'free', fr, 'locked', coalesce(h, 0) = 0 and not fr,
    'next', case when last is null or fr or coalesce(h, 0) = 0 then now() else last + make_interval(hours => h) end, 'server_now', now());
end; $$;
revoke all on function public.safari_state() from public, anon;
grant execute on function public.safari_state() to authenticated;

-- 4. Départ et fin : mêmes règles que 026, sans délai pour ces comptes.
create or replace function public.safari_start(req uuid, lvl int) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._game_begin(); gr public.game_grades%rowtype; last timestamptz; ty public.safari_types%rowtype;
  decoys int[]; sp jsonb; rid uuid; old public.safari_rounds%rowtype; pts int[];
begin
  if lvl is null or lvl not between 1 and 3 then raise exception 'Niveau inconnu' using errcode = 'P0001'; end if;
  select * into old from public.safari_rounds sr where sr.user_id = uid and sr.req = safari_start.req;
  if found then
    pts := public._safari_pts(old.lvl);
    return jsonb_build_object('round', old.id, 'kind', old.kind, 'spawns', old.spawns, 'lvl', old.lvl, 'plus', pts[1], 'minus', pts[2], 'server_now', now());
  end if;
  pts := public._safari_pts(lvl);
  select * into gr from public.game_grades where i = public._game_grade(uid);
  select max(at) into last from public.ledger where user_id = uid and kind = 'safari';
  if not public._safari_free(uid) and coalesce(gr.safari_h, 0) = 0 then
    raise exception 'Le Safari éclair s’ouvre au grade Collectionneur' using errcode = 'P0001';
  end if;
  if not public._safari_free(uid) and last is not null and last + make_interval(hours => gr.safari_h) > now() then
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
    -- Vitesse ×2 ou ×3 : la traversée dure 2 ou 3 fois moins longtemps.
    'dur', ((3400 - idx * 38 + floor(public._game_rand() * 300)::int) / pts[3])::int) order by idx)
  into sp from o;
  delete from public.safari_rounds where user_id = uid and finished_at is null;
  insert into public.safari_rounds (user_id, req, kind, spawns, lvl) values (uid, safari_start.req, ty.t, sp, safari_start.lvl) returning id into rid;
  return jsonb_build_object('round', rid, 'kind', ty.t, 'spawns', sp, 'lvl', safari_start.lvl, 'plus', pts[1], 'minus', pts[2], 'server_now', now());
end; $$;
revoke all on function public.safari_start(uuid, int) from public, anon;
grant execute on function public.safari_start(uuid, int) to authenticated;

create or replace function public.safari_finish(round uuid, hits int[], req uuid) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._game_begin(); r jsonb; rd public.safari_rounds%rowtype; g int; b int; w int; m int; pk int;
  pts int[]; gr public.game_grades%rowtype;
begin
  r := public._game_replay(uid, req); if r is not null then return r; end if;
  select * into rd from public.safari_rounds sr where sr.id = round and sr.user_id = uid for update;
  if not found or rd.finished_at is not null then raise exception 'Partie introuvable ou déjà finie' using errcode = 'P0001'; end if;
  if now() < rd.started_at + interval '18 seconds' then raise exception 'Partie pas encore finie' using errcode = 'P0001'; end if;
  if now() > rd.started_at + interval '10 minutes' then raise exception 'Partie expirée : relance-la' using errcode = 'P0001'; end if;
  select count(*) filter (where (e->>'ok')::boolean), count(*) filter (where not (e->>'ok')::boolean) into g, b
  from jsonb_array_elements(rd.spawns) e
  where (e->>'i')::int in (select distinct h from unnest(coalesce(hits, '{}'::int[])) h where h between 0 and 35);
  pts := public._safari_pts(rd.lvl);
  w := pts[1] * g - pts[2] * b;
  if rd.lvl = 1 then w := greatest(0, w); end if;
  m := case when w > 0 and public._pk_boost_on(uid) then 2 else 1 end;
  w := w * m;
  -- Perte : jamais plus que le solde (le solde ne descend pas sous 0).
  if w < 0 then
    select wl.pk into pk from public.wallets wl where wl.user_id = uid for update;
    w := greatest(w, -coalesce(pk, 0));
  end if;
  update public.safari_rounds sr set finished_at = now(), good = g, bad = b, won = w where sr.id = rd.id;
  select * into gr from public.game_grades where i = public._game_grade(uid);
  return public._game_move(uid, 'safari', w, 0, rd.kind || ' ' || g || '/' || b || ' · niveau ' || rd.lvl || case when m = 2 then ' · 2XP PK' else '' end, req)
    || jsonb_build_object('won', w, 'base', w / m, 'boost', m = 2, 'good', g, 'bad', b, 'kind', rd.kind, 'lvl', rd.lvl,
                          'raw', pts[1] * g - pts[2] * b, 'next', case when public._safari_free(uid) then now() else now() + make_interval(hours => gr.safari_h) end);
end; $$;
revoke all on function public.safari_finish(uuid, int[], uuid) from public, anon;
grant execute on function public.safari_finish(uuid, int[], uuid) to authenticated;


notify pgrst, 'reload schema';

-- ================= 028_points_loyaute.sql =================
-- 028 : Points de loyauté (PL) et classement de la saison en PL (2026-11-14, « go » du porteur ; proposition docs/38,
-- choix par défaut L1 à L8). Après 027 ; il faut 025 (jours où l'app est ouverte). Rejouable (Studio › SQL Editor › Run).
-- Les PL ne sont pas une monnaie : ils ne s'achètent pas, ne se dépensent pas et ne s'échangent contre rien. Ils servent
-- seulement à classer la saison (« Ma progression »). Le serveur seul les donne ; l'app ne peut que les demander.
--   Défis (docs/38 §2) :
--     - parrainage : 200 PL au parrain quand son filleul a vérifié son adresse et ouvert l'app 3 jours différents dans
--       ses 14 premiers jours ; au plus 20 filleuls comptés par saison ; pas un alias d'un compte plus ancien
--       (nom+1@gmail.com, n.om@gmail.com) ; 400 PL quand le filleul a payé le Premium depuis
--       14 jours (délai de rétractation passé) ; 50 PL de bienvenue au filleul ; jamais soi-même ni en boucle (A ↔ B) ;
--     - TikTok, Instagram, Discord : 100 PL une seule fois par réseau, sur l'honneur (aucun moyen public de vérifier) ;
--     - séries de jours d'affilée dans la saison (app ouverte, ou une action de jeu, ce jour-là) : 5 jours 30 PL,
--       15 jours 100 PL, 30 jours 150 PL, une fois par saison chacune ;
--     - partage sur les réseaux avec une capture comme preuve : 100 PL une fois par saison, après validation d'un admin
--       (Admin › « Défis à valider ») ; la capture est effacée dès la décision ; 3 envois au plus par saison.
--   Pas de PL contre un clic sur une pub ni contre un avis sur les stores (interdit par Google et Apple, docs/38, L1 et L2).
--   Classement (season_board, remplace 013/014) : PL gagnés pendant la saison ; égalité départagée par l'heure du dernier
--   gain (le premier arrivé à ce score passe devant) ; comptes admin non classés ; total à vie affiché en petit (L5).
--   La saison 1 en cours passe aux PL dès l'installation : tout le monde part de 0 PL (L6).
--   Lots (season_winners, Studio seulement, L8) : 1ʳᵉ ETB, 2ᵉ coffret, 3ᵉ 2 boosters (seulement avec au moins 50 joueurs
--   classés avec des PL, sinon 1 mois de Premium), 4ᵉ-5ᵉ Premium ou ticket Or, 6ᵉ-7ᵉ Premium ou ticket Argent, 8ᵉ-10ᵉ
--   Premium ou ticket Bronze.

do $$ begin
  if to_regclass('public.app_time') is null then
    raise exception 'Installe d''abord 025_suivi_joueurs.sql (le plus simple : tout le fichier install_024_a_034.sql)';
  end if;
end $$;

-- 1. Journal des PL : une ligne par gain, jamais modifiée ni effacée (sauf avec le compte de son propriétaire, 017).
create table if not exists public.pl_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  season int not null check (season >= 1),
  kind text not null check (kind in ('referral', 'referral_premium', 'welcome_ref', 'social', 'streak', 'share', 'admin')),
  ref text not null default '',
  pl int not null check (pl between -100000 and 100000),
  note text,
  at timestamptz not null default now()
);
create index if not exists pl_ledger_season on public.pl_ledger (season, user_id);
create index if not exists pl_ledger_user on public.pl_ledger (user_id, at);
-- Une fois pour toujours : chaque réseau social, chaque filleul (inscription, Premium), la bienvenue du filleul.
create unique index if not exists pl_once_ever on public.pl_ledger (user_id, kind, ref)
  where kind in ('social', 'referral', 'referral_premium', 'welcome_ref');
-- Une fois par saison : chaque série de jours (5, 15, 30) et le partage.
create unique index if not exists pl_once_season on public.pl_ledger (user_id, kind, ref, season) where kind in ('streak', 'share');

create or replace function public.pl_ledger_readonly() returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'DELETE' and coalesce(current_setting('dropicards.erase_user', true), '') = old.user_id::text then
    return old;
  end if;
  raise exception 'Le journal des PL ne peut être ni modifié ni effacé';
end; $$;
drop trigger if exists pl_ledger_no_change on public.pl_ledger;
create trigger pl_ledger_no_change before update or delete on public.pl_ledger
  for each row execute function public.pl_ledger_readonly();

-- 2. Codes de parrainage (un par compte, créé à la première demande) et filleuls.
create table if not exists public.pl_codes (
  user_id uuid primary key references auth.users (id) on delete cascade,
  code text not null unique check (code ~ '^[A-Z0-9]{4,12}$'),
  created_at timestamptz not null default now()
);
create table if not exists public.pl_referrals (
  filleul uuid primary key references auth.users (id) on delete cascade,
  parrain uuid not null references auth.users (id) on delete cascade,
  season int not null,
  created_at timestamptz not null default now(),
  qualified_at timestamptz,                -- adresse vérifiée et 3 jours différents dans les 14 premiers jours
  counted boolean not null default false,  -- 200 PL versés (non si le parrain avait déjà 20 filleuls comptés)
  premium_at timestamptz,                  -- 400 PL versés pour le Premium du filleul
  check (filleul <> parrain)
);
create index if not exists pl_referrals_parrain on public.pl_referrals (parrain);

-- 3. Preuves de partage (capture réduite par l'app, effacée dès la décision de l'admin).
create table if not exists public.pl_proofs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  season int not null,
  net text not null check (net in ('tiktok', 'instagram', 'facebook', 'x', 'snapchat', 'whatsapp', 'discord', 'autre')),
  image text check (image is null or (char_length(image) <= 700000 and image ~ '^data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$')),
  status text not null default 'pending' check (status in ('pending', 'ok', 'no')),
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid references auth.users (id) on delete set null
);
create unique index if not exists pl_proofs_one_pending on public.pl_proofs (user_id) where status = 'pending';
create index if not exists pl_proofs_pending on public.pl_proofs (created_at) where status = 'pending';

alter table public.pl_ledger enable row level security;
alter table public.pl_codes enable row level security;
alter table public.pl_referrals enable row level security;
alter table public.pl_proofs enable row level security;
-- Aucune politique : ni lecture ni écriture directes ; seulement par les fonctions ci-dessous.
revoke all on public.pl_ledger, public.pl_codes, public.pl_referrals, public.pl_proofs from public, anon, authenticated;

-- 4. Outils internes.
-- Numéro de la saison en cours.
create or replace function public._pl_season() returns int
language sql stable security definer set search_path = '' as $$ select (public._season_at(now())->>'n')::int $$;
revoke all on function public._pl_season() from public, anon, authenticated;

-- Jour de Paris d'un instant.
create or replace function public._pl_day(t timestamptz) returns date
language sql immutable set search_path = '' as $$ select (t at time zone 'Europe/Paris')::date $$;
revoke all on function public._pl_day(timestamptz) from public, anon, authenticated;

-- Nombre de jours différents où le joueur a ouvert l'app (025) ou joué (journal des PK et PA) entre deux dates de Paris ;
-- « today » compte aussi quand le joueur lui-même est en train d'utiliser l'app.
create or replace function public._pl_days(uid uuid, a date, b date, inc_today boolean) returns table (day date)
language sql stable security definer set search_path = '' as $$
  select distinct x.d from (
    select t.day as d from public.app_time t where t.user_id = uid and t.day between a and b
    union all
    select public._pl_day(l.at) from public.ledger l
      where l.user_id = uid and l.at >= (a::timestamp at time zone 'Europe/Paris') and l.at < ((b + 1)::timestamp at time zone 'Europe/Paris')
    union all
    select public._pl_day(now()) where inc_today
  ) x where x.d between a and b;
$$;
revoke all on function public._pl_days(uuid, date, date, boolean) from public, anon, authenticated;

-- Séries de jours d'affilée dans la saison : la plus longue, et celle en cours (aujourd'hui ou hier compris).
create or replace function public._pl_streak(uid uuid, inc_today boolean, out best int, out cur int)
language plpgsql stable security definer set search_path = '' as $$
declare se jsonb := public._season_at(now()); a date; t date := public._pl_day(now());
begin
  a := public._pl_day((se->>'start')::timestamptz);
  with d as (select x.day from public._pl_days(uid, a, t, inc_today) x),
       g as (select d.day, d.day - (row_number() over (order by d.day))::int as grp from d),
       r as (select count(*)::int as n, max(g.day) as last from g group by g.grp)
  select coalesce(max(r.n), 0), coalesce(max(r.n) filter (where r.last >= t - 1), 0) into best, cur from r;
end; $$;
revoke all on function public._pl_streak(uuid, boolean) from public, anon, authenticated;

-- Gain de PL (une ligne du journal) ; rien si ce gain unique a déjà été donné. Renvoie le gain, ou null.
create or replace function public._pl_give(uid uuid, k text, r text, n int, s int, why text) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare got bigint;
begin
  if k in ('streak', 'share') then
    insert into public.pl_ledger (user_id, season, kind, ref, pl, note) values (uid, s, k, r, n, why)
      on conflict (user_id, kind, ref, season) where kind in ('streak', 'share') do nothing returning id into got;
  elsif k in ('social', 'referral', 'referral_premium', 'welcome_ref') then
    insert into public.pl_ledger (user_id, season, kind, ref, pl, note) values (uid, s, k, r, n, why)
      on conflict (user_id, kind, ref) where kind in ('social', 'referral', 'referral_premium', 'welcome_ref') do nothing returning id into got;
  else
    insert into public.pl_ledger (user_id, season, kind, ref, pl, note) values (uid, s, k, r, n, why) returning id into got;
  end if;
  if got is null then return null; end if;
  return jsonb_build_object('kind', k, 'ref', r, 'pl', n, 'note', why);
end; $$;
revoke all on function public._pl_give(uuid, text, text, int, int, text) from public, anon, authenticated;

-- Adresse e-mail ramenée à sa boîte réelle : sans « +étiquette », et sans les points pour Gmail (alias d'une même boîte).
create or replace function public._pl_mailkey(e text) returns text
language sql immutable set search_path = '' as $$
  select case when x.d in ('gmail.com', 'googlemail.com') then replace(x.l, '.', '') || '@gmail.com' else x.l || '@' || x.d end
  from (select split_part(split_part(lower(btrim(coalesce(e, ''))), '@', 1), '+', 1) as l, split_part(lower(btrim(coalesce(e, ''))), '@', 2) as d) x;
$$;
revoke all on function public._pl_mailkey(text) from public, anon, authenticated;

-- Filleul : 200 PL au parrain quand il a vérifié son adresse et ouvert l'app 3 jours différents dans ses 14 premiers
-- jours (au plus 20 filleuls comptés par saison et par parrain). Pas compté (sans PL) quand son adresse est un alias
-- d'un compte plus ancien (parrain compris) : nom+1@gmail.com, n.om@gmail.com…
create or replace function public._pl_qualify(f uuid, inc_today boolean) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare r public.pl_referrals%rowtype; conf timestamptz; born timestamptz; st text; pst text; a date; days int; s int := public._pl_season();
  cnt int; ok boolean; ps text; g jsonb; fm text; dup boolean;
begin
  select * into r from public.pl_referrals where filleul = f and qualified_at is null for update;
  if not found then return null; end if;
  select u.email_confirmed_at, u.created_at, u.email into conf, born, fm from auth.users u where u.id = f;
  select p.status, p.pseudo into st, ps from public.profiles p where p.id = f;
  if conf is null or st is distinct from 'active' then return null; end if;
  a := public._pl_day(born);
  select count(*) into days from public._pl_days(f, a, a + 13, inc_today and public._pl_day(now()) <= a + 13);
  if days < 3 then return null; end if;
  select p.status into pst from public.profiles p where p.id = r.parrain;
  select count(*) into cnt from public.pl_ledger l where l.user_id = r.parrain and l.kind = 'referral' and l.season = s;
  dup := exists (select 1 from auth.users u where u.id <> f and u.created_at <= born and public._pl_mailkey(u.email) = public._pl_mailkey(fm));
  ok := cnt < 20 and pst = 'active' and not dup;
  update public.pl_referrals set qualified_at = now(), counted = ok where filleul = f;
  if ok then g := public._pl_give(r.parrain, 'referral', f::text, 200, s, 'Filleul : ' || coalesce(ps, 'nouveau dresseur')); end if;
  return g;
end; $$;
revoke all on function public._pl_qualify(uuid, boolean) from public, anon, authenticated;

-- Filleul Premium : 400 PL au parrain quand le filleul a payé le Premium (paiement réel) il y a au moins 14 jours et
-- que l'abonnement a tenu ces 14 jours (pas remboursé dans le délai de rétractation).
create or replace function public._pl_premium(f uuid) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare r public.pl_referrals%rowtype; paid timestamptz; pe timestamptz; ps text; g jsonb;
begin
  select * into r from public.pl_referrals where filleul = f and premium_at is null for update;
  if not found then return null; end if;
  select min(x.paid_at) into paid from public.premium_payments x
    where x.user_id = f and x.livemode and x.amount_cents > 0 and x.paid_at <= now() - interval '14 days';
  if paid is null then return null; end if;
  select p.period_end into pe from public.premium p where p.user_id = f;
  if not (public._premium_on(f) or coalesce(pe, paid) >= paid + interval '14 days') then return null; end if;
  if exists (select 1 from public.profiles p where p.id = r.parrain and p.status = 'active') then
    select p.pseudo into ps from public.profiles p where p.id = f;
    g := public._pl_give(r.parrain, 'referral_premium', f::text, 400, public._pl_season(), 'Filleul DropiPass : ' || coalesce(ps, 'dresseur'));
  end if;
  update public.pl_referrals set premium_at = now() where filleul = f;
  return g;
end; $$;
revoke all on function public._pl_premium(uuid) from public, anon, authenticated;

-- Mise à jour des gains en attente du joueur connecté : séries de jours, ses filleuls (et son propre parrainage).
-- Renvoie la liste de SES nouveaux gains (pour l'animation de l'app).
create or replace function public._pl_sync(uid uuid) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare s int := public._pl_season(); k record; g jsonb; res jsonb := '[]'::jsonb; f uuid;
begin
  select * into k from public._pl_streak(uid, true);
  if k.best >= 5 then g := public._pl_give(uid, 'streak', '5', 30, s, '5 jours d''affilée'); if g is not null then res := res || g; end if; end if;
  if k.best >= 15 then g := public._pl_give(uid, 'streak', '15', 100, s, '15 jours d''affilée'); if g is not null then res := res || g; end if; end if;
  if k.best >= 30 then g := public._pl_give(uid, 'streak', '30', 150, s, '30 jours d''affilée'); if g is not null then res := res || g; end if; end if;
  -- Son propre parrainage (il est le filleul) : les PL vont au parrain, pas dans sa liste.
  perform public._pl_qualify(uid, true);
  perform public._pl_premium(uid);
  -- Ses filleuls (des 60 derniers jours pour l'inscription ; tous pour le Premium).
  for f in select r.filleul from public.pl_referrals r where r.parrain = uid and r.qualified_at is null and r.created_at > now() - interval '60 days' loop
    g := public._pl_qualify(f, false); if g is not null then res := res || g; end if;
  end loop;
  for f in select r.filleul from public.pl_referrals r where r.parrain = uid and r.premium_at is null loop
    g := public._pl_premium(f); if g is not null then res := res || g; end if;
  end loop;
  return res;
end; $$;
revoke all on function public._pl_sync(uuid) from public, anon, authenticated;

-- Code de parrainage du joueur (créé à la première demande) : début du pseudo sans accents, puis 2 caractères au hasard.
create or replace function public._pl_code(uid uuid) returns text
language plpgsql volatile security definer set search_path = '' as $$
declare c text; base text; ps text; i int := 0;
  al text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
begin
  select x.code into c from public.pl_codes x where x.user_id = uid;
  if c is not null then return c; end if;
  select p.pseudo into ps from public.profiles p where p.id = uid;
  base := regexp_replace(upper(translate(coalesce(ps, ''), 'àâäáãåçéèêëíìîïñóòôöõúùûüýÿÀÂÄÁÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝ',
    'aaaaaaceeeeiiiinooooouuuuyyAAAAAACEEEEIIIINOOOOOUUUUY')), '[^A-Z0-9]', '', 'g');
  base := left(base, 6);
  if char_length(base) < 3 then base := 'DROPI'; end if;
  loop
    i := i + 1;
    c := case when i <= 20 then base else '' end
      || substr(al, 1 + floor(random() * 31)::int, 1) || substr(al, 1 + floor(random() * 31)::int, 1)
      || case when i > 20 then substr(al, 1 + floor(random() * 31)::int, 1) || substr(al, 1 + floor(random() * 31)::int, 1)
              || substr(al, 1 + floor(random() * 31)::int, 1) || substr(al, 1 + floor(random() * 31)::int, 1) else '' end;
    begin
      insert into public.pl_codes (user_id, code) values (uid, c);
      return c;
    exception when unique_violation then
      select x.code into c from public.pl_codes x where x.user_id = uid;
      if c is not null then return c; end if;
      if i > 60 then raise exception 'Code de parrainage indisponible, réessaie'; end if;
    end;
  end loop;
end; $$;
revoke all on function public._pl_code(uuid) from public, anon, authenticated;

-- Compte appelant : connecté et actif ; garde-fou de 30 demandes par minute (celui des jeux, 004/015).
create or replace function public._pl_begin() returns uuid
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := auth.uid(); st text; t public.game_throttle%rowtype;
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '28000'; end if;
  select p.status into st from public.profiles p where p.id = uid;
  if st is distinct from 'active' then raise exception 'Compte suspendu' using errcode = '42501'; end if;
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
revoke all on function public._pl_begin() from public, anon, authenticated;

-- 5. Ce que l'app appelle.
-- État des PL du joueur (page « Gagner des PL ») ; donne d'abord les gains en attente (liste « new »).
create or replace function public.pl_state() returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._pl_begin(); s int := public._pl_season(); nw jsonb; k record; born timestamptz; ref public.pl_referrals%rowtype;
  pp text; sh text; tries int;
begin
  nw := public._pl_sync(uid);
  select * into k from public._pl_streak(uid, true);
  select u.created_at into born from auth.users u where u.id = uid;
  select * into ref from public.pl_referrals where filleul = uid;
  if found then select p.pseudo into pp from public.profiles p where p.id = ref.parrain; end if;
  select x.status into sh from public.pl_proofs x where x.user_id = uid and x.season = s order by (x.status = 'ok') desc, x.created_at desc limit 1;
  select count(*) into tries from public.pl_proofs x where x.user_id = uid and x.season = s;
  return jsonb_build_object(
    'season', public._season_at(now()),
    'pl_season', coalesce((select sum(l.pl) from public.pl_ledger l where l.user_id = uid and l.season = s), 0),
    'pl_total', coalesce((select sum(l.pl) from public.pl_ledger l where l.user_id = uid), 0),
    'code', public._pl_code(uid),
    'referrals', jsonb_build_object(
      'season', (select count(*) from public.pl_ledger l where l.user_id = uid and l.kind = 'referral' and l.season = s),
      'cap', 20,
      'pending', (select count(*) from public.pl_referrals r where r.parrain = uid and r.qualified_at is null and r.created_at > now() - interval '14 days'),
      'total', (select count(*) from public.pl_referrals r where r.parrain = uid and r.counted),
      'premium', (select count(*) from public.pl_ledger l where l.user_id = uid and l.kind = 'referral_premium')),
    'parrain', case when ref.filleul is not null then pp end,
    'can_set_parrain', ref.filleul is null and born > now() - interval '14 days',
    'social', jsonb_build_object(
      'tiktok', exists (select 1 from public.pl_ledger l where l.user_id = uid and l.kind = 'social' and l.ref = 'tiktok'),
      'instagram', exists (select 1 from public.pl_ledger l where l.user_id = uid and l.kind = 'social' and l.ref = 'instagram'),
      'discord', exists (select 1 from public.pl_ledger l where l.user_id = uid and l.kind = 'social' and l.ref = 'discord')),
    'streak', jsonb_build_object('cur', k.cur, 'best', k.best,
      'done', coalesce((select jsonb_agg(l.ref::int order by l.ref::int) from public.pl_ledger l where l.user_id = uid and l.kind = 'streak' and l.season = s), '[]'::jsonb)),
    'share', jsonb_build_object('status', coalesce(sh, 'todo'), 'tries', tries, 'max', 3),
    'new', nw);
end; $$;
revoke all on function public.pl_state() from public, anon;
grant execute on function public.pl_state() to authenticated;

-- Code de parrainage saisi par un nouveau joueur (lien dropicards.fr/?parrain=CODE) : 50 PL de bienvenue.
create or replace function public.pl_set_parrain(code text) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._pl_begin(); c text := upper(btrim(coalesce(code, ''))); par uuid; born timestamptz; ps text; s int := public._pl_season(); g jsonb;
begin
  if exists (select 1 from public.pl_referrals where filleul = uid) then raise exception 'Tu as déjà un parrain' using errcode = 'P0001'; end if;
  select u.created_at into born from auth.users u where u.id = uid;
  if born <= now() - interval '14 days' then raise exception 'Le parrainage se fait dans les 14 jours qui suivent la création du compte' using errcode = 'P0001'; end if;
  select x.user_id into par from public.pl_codes x where x.code = c;
  if par is null then raise exception 'Code de parrainage inconnu' using errcode = 'P0001'; end if;
  if par = uid then raise exception 'Tu ne peux pas être ton propre parrain' using errcode = 'P0001'; end if;
  if not exists (select 1 from public.profiles p where p.id = par and p.status = 'active') then raise exception 'Code de parrainage inconnu' using errcode = 'P0001'; end if;
  if exists (select 1 from public.pl_referrals r where r.filleul = par and r.parrain = uid) then
    raise exception 'Ce dresseur est déjà ton filleul' using errcode = 'P0001';
  end if;
  insert into public.pl_referrals (filleul, parrain, season) values (uid, par, s);
  select p.pseudo into ps from public.profiles p where p.id = par;
  g := public._pl_give(uid, 'welcome_ref', par::text, 50, s, 'Bienvenue, parrainé par ' || coalesce(ps, 'un dresseur'));
  return jsonb_build_object('ok', true, 'parrain', ps, 'pl', coalesce((g->>'pl')::int, 0));
end; $$;
revoke all on function public.pl_set_parrain(text) from public, anon;
grant execute on function public.pl_set_parrain(text) to authenticated;

-- Abonnement à un réseau de Dropicards (sur l'honneur) : 100 PL une seule fois par réseau.
create or replace function public.pl_claim_social(net text) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._pl_begin(); g jsonb; n text := lower(btrim(coalesce(net, '')));
begin
  if n not in ('tiktok', 'instagram', 'discord') then raise exception 'Réseau inconnu' using errcode = 'P0001'; end if;
  g := public._pl_give(uid, 'social', n, 100, public._pl_season(),
    case n when 'tiktok' then 'Abonné au TikTok Dropicards' when 'instagram' then 'Abonné à l''Instagram Dropicards' else 'Membre du Discord Dropicards' end);
  if g is null then raise exception 'Déjà fait : 100 PL déjà reçus pour ce réseau' using errcode = 'P0001'; end if;
  return g;
end; $$;
revoke all on function public.pl_claim_social(text) from public, anon;
grant execute on function public.pl_claim_social(text) to authenticated;

-- Capture d'écran d'un partage (preuve) : à valider par un admin ; 100 PL une fois par saison.
create or replace function public.pl_submit_proof(net text, img text) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._pl_begin(); s int := public._pl_season(); n text := lower(btrim(coalesce(net, ''))); pid uuid;
begin
  if n not in ('tiktok', 'instagram', 'facebook', 'x', 'snapchat', 'whatsapp', 'discord', 'autre') then raise exception 'Réseau inconnu' using errcode = 'P0001'; end if;
  if img is null or char_length(img) > 700000 or img !~ '^data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$' then
    raise exception 'Image trop lourde ou illisible : choisis une capture d''écran' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.pl_proofs x where x.user_id = uid and x.season = s and x.status = 'ok') then
    raise exception 'Déjà fait cette saison : reviens la saison prochaine' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.pl_proofs x where x.user_id = uid and x.status = 'pending') then
    raise exception 'Ta capture est en attente de validation' using errcode = 'P0001';
  end if;
  if (select count(*) from public.pl_proofs x where x.user_id = uid and x.season = s) >= 3 then
    raise exception 'Plus d''envoi possible cette saison (3 au plus)' using errcode = 'P0001';
  end if;
  insert into public.pl_proofs (user_id, season, net, image) values (uid, s, n, img) returning pl_proofs.id into pid;
  return jsonb_build_object('ok', true, 'status', 'pending');
end; $$;
revoke all on function public.pl_submit_proof(text, text) from public, anon;
grant execute on function public.pl_submit_proof(text, text) to authenticated;

-- 6. Admin › « Défis à valider » (admins déverrouillés seulement, 007).
create or replace function public.admin_pl_proofs() returns table (id uuid, pseudo text, net text, image text, created_at timestamptz, season int)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Réservé aux admins'; end if;
  return query select x.id, p.pseudo, x.net, x.image, x.created_at, x.season
    from public.pl_proofs x left join public.profiles p on p.id = x.user_id
    where x.status = 'pending' order by x.created_at limit 50;
end; $$;
revoke all on function public.admin_pl_proofs() from public, anon;
grant execute on function public.admin_pl_proofs() to authenticated;

create or replace function public.admin_pl_decide(proof uuid, ok boolean) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare x public.pl_proofs%rowtype; g jsonb;
begin
  if not public.is_admin() then raise exception 'Réservé aux admins'; end if;
  select * into x from public.pl_proofs where id = proof for update;
  if not found or x.status <> 'pending' then raise exception 'Capture déjà traitée' using errcode = 'P0001'; end if;
  update public.pl_proofs set status = case when ok then 'ok' else 'no' end, image = null, decided_at = now(), decided_by = auth.uid()
    where id = proof;
  if ok then g := public._pl_give(x.user_id, 'share', 'saison', 100, x.season, 'Partage sur ' || x.net); end if;
  insert into public.admin_log (admin_id, action, target_user, details, reason)
    values (auth.uid(), 'pl_proof', x.user_id, jsonb_build_object('proof', proof, 'ok', ok, 'net', x.net, 'season', x.season),
            case when ok then 'Partage validé (100 PL)' else 'Partage refusé' end);
  return jsonb_build_object('ok', true, 'status', case when ok then 'ok' else 'no' end, 'pl', case when g is null then 0 else 100 end);
end; $$;
revoke all on function public.admin_pl_decide(uuid, boolean) from public, anon;
grant execute on function public.admin_pl_decide(uuid, boolean) to authenticated;

-- Correction à la main dans Studio (triche, erreur) : PL ajoutés ou retirés, avec un motif ; jamais depuis l'app.
--   select public.pl_admin_adjust('<identifiant du compte>', -200, 'Faux filleuls');
create or replace function public.pl_admin_adjust(uid uuid, n int, why text) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
begin
  if why is null or char_length(btrim(why)) < 3 then raise exception 'Indique un motif'; end if;
  insert into public.admin_log (admin_id, action, target_user, details, reason)
    values (null, 'pl_adjust', uid, jsonb_build_object('pl', n), why);
  return public._pl_give(uid, 'admin', '', n, public._pl_season(), why);
end; $$;
revoke all on function public.pl_admin_adjust(uuid, int, text) from public, anon, authenticated;

-- 7. Classement de la saison en PL (remplace 013 et 014).
-- PL de chaque joueur classé pendant une saison, et l'heure de son dernier gain (départage).
create or replace function public._pl_scores(n int) returns table (user_id uuid, pl bigint, last_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select p.id, coalesce(sum(l.pl), 0)::bigint, max(l.at)
  from public.profiles p
  left join public.pl_ledger l on l.user_id = p.id and l.season = n
  where p.role = 'user' and p.status = 'active' and p.pseudo is not null
  group by p.id;
$$;
revoke all on function public._pl_scores(int) from public, anon, authenticated;

create or replace function public.season_board(lim int default 50) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid(); se jsonb; s int; res jsonb; n int := least(greatest(coalesce(lim, 50), 3), 100);
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  se := public._season_at(now()); s := (se->>'n')::int;
  with sc as (select * from public._pl_scores(s)),
       rk as (select sc.user_id, sc.pl, (rank() over (order by sc.pl desc, sc.last_at asc nulls last))::int as r,
                     row_number() over (order by sc.pl desc, sc.last_at asc nulls last, sc.user_id) as rn from sc)
  select jsonb_build_object(
    'unit', 'pl', 'season', se, 'now', now(), 'players', (select count(*) from rk),
    'ranked', (select count(*) from rk where rk.pl > 0),
    'top', coalesce((select jsonb_agg(jsonb_build_object('rank', rk.r, 'pseudo', p.pseudo, 'grade', public._game_grade(rk.user_id), 'pl', rk.pl,
                       'me', rk.user_id = uid, 'avatar', p.avatar) order by rk.rn)
                     from rk join public.profiles p on p.id = rk.user_id where rk.rn <= n), '[]'::jsonb),
    'me', (select jsonb_build_object('rank', rk.r, 'pl', rk.pl) from rk where rk.user_id = uid),
    'pl_season', coalesce((select sum(l.pl) from public.pl_ledger l where l.user_id = uid and l.season = s), 0),
    'pl_total', coalesce((select sum(l.pl) from public.pl_ledger l where l.user_id = uid), 0),
    'pk_total', coalesce((select w.pk_earned from public.wallets w where w.user_id = uid), 0),
    'grade', public._game_grade(uid)
  ) into res;
  return res;
end; $$;
revoke all on function public.season_board(int) from public, anon;
grant execute on function public.season_board(int) to authenticated;

-- Gagnants d'une saison (Studio seulement) : rang, pseudo, e-mail, PL de la saison et lot (grille du porteur, L8).
--   select * from public.season_winners(1);
drop function if exists public.season_winners(int);
create or replace function public.season_winners(season int) returns table (rang int, pseudo text, email text, pl bigint, lot text)
language sql stable security definer set search_path = '' as $$
  with sc as (select * from public._pl_scores(greatest(season, 1)) where pl > 0),
       big as (select count(*) >= 50 as ok from sc),
       rk as (select sc.user_id, sc.pl, (rank() over (order by sc.pl desc, sc.last_at asc nulls last))::int as r from sc)
  select rk.r, p.pseudo, u.email::text, rk.pl,
         case when rk.r <= 3 and not (select ok from big) then '1 mois de DropiPass offert (moins de 50 joueurs classés)'
              when rk.r = 1 then 'ETB du moment'
              when rk.r = 2 then 'Coffret du moment'
              when rk.r = 3 then '2 boosters du moment'
              when rk.r <= 5 then '1 mois de DropiPass ou 1 ticket Or (au choix)'
              when rk.r <= 7 then '1 mois de DropiPass ou 1 ticket Argent (au choix)'
              else '1 mois de DropiPass ou 1 ticket Bronze (au choix)' end
  from rk join public.profiles p on p.id = rk.user_id join auth.users u on u.id = rk.user_id
  where rk.r <= 10 order by rk.r, p.pseudo;
$$;
revoke all on function public.season_winners(int) from public, anon, authenticated;

-- ================= 030_tirages_cartes.sql =================
-- 030_tirages_cartes.sql — Cartes des tirages modifiables même déjà choisies (2026-11-15, porteur).
--
-- Demande du porteur : « laisse-moi changer les cartes proposées même si des joueurs ont choisi des tickets ».
-- Avant (018) : une carte déjà choisie par un joueur ne pouvait plus être retirée (« Des joueurs ont déjà choisi cette
-- carte : elle reste au tirage »).
-- Maintenant :
--   - un admin retire n'importe quelle carte d'un tirage à venir, même choisie ;
--   - les tickets qui l'avaient choisie restent valables (rien n'est remboursé ni perdu) : leur carte est simplement
--     effacée, et le joueur doit en choisir une autre parmi les cartes du tirage (ticket_choose) ;
--   - tant qu'il n'a pas rechoisi, l'app lui affiche « Carte à rechoisir » sur son ticket ; au tirage, un ticket sans
--     carte participe quand même (défaut à confirmer : s'il gagne, l'admin lui fait choisir une carte du tirage) ;
--   - chaque retrait est inscrit au journal des admins, avec le nombre de tickets à rechoisir.
-- À installer après 018 et 019 (déjà en place sur le serveur). Rejouable. Tests : tests/test_030.sql.

do $$ begin
  if to_regclass('public.draw_prizes') is null or to_regprocedure('public._game_next_draw(timestamptz)') is null then
    raise exception 'Installe d''abord 018_lots_limites.sql (cartes des tirages)';
  end if;
end $$;

-- 1. Retirer une carte (admins) : possible même si des joueurs l'ont choisie ; leurs tickets sont à rechoisir.
create or replace function public.admin_prize_remove(prize_id bigint) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare p public.draw_prizes%rowtype; n int := 0;
begin
  if not public.is_admin() then raise exception 'Réservé aux admins' using errcode = '42501'; end if;
  select * into p from public.draw_prizes where id = prize_id for update;
  if not found then return jsonb_build_object('ok', false, 'msg', 'Carte introuvable'); end if;
  if p.draw_at <= now() then raise exception 'Ce tirage a déjà eu lieu : ses cartes ne changent plus' using errcode = 'P0001'; end if;
  update public.tickets set choice = null where item = p.item and draw_at = p.draw_at and choice = p.card;
  get diagnostics n = row_count;
  delete from public.draw_prizes where id = prize_id;
  insert into public.admin_log (admin_id, action, details, reason)
  values (auth.uid(), 'prize_remove', jsonb_build_object('item', p.item, 'card', p.card, 'draw_at', p.draw_at, 'tickets_to_rechoose', n),
    case when n > 0 then 'Carte retirée du tirage : ' || n || ' ticket(s) à rechoisir' else 'Carte retirée du tirage' end);
  return jsonb_build_object('ok', true, 'rechoose', n);
end; $$;
revoke all on function public.admin_prize_remove(bigint) from public, anon;
grant execute on function public.admin_prize_remove(bigint) to authenticated;

-- 2. Rechoisir sa carte (joueur) : seulement pour son ticket du prochain tirage dont la carte a été retirée, et
-- seulement une carte de ce tirage.
create or replace function public.ticket_choose(item_id text, card text) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := auth.uid(); d timestamptz := public._game_next_draw(now()); c text := nullif(btrim(coalesce(card, '')), ''); n int := 0;
begin
  if uid is null then raise exception 'Connexion requise' using errcode = '28000'; end if;
  if c is null or not exists (select 1 from public.draw_prizes where draw_at = d and item = item_id and draw_prizes.card = c) then
    raise exception 'Choisis une carte de ce tirage' using errcode = 'P0001';
  end if;
  update public.tickets set choice = c where user_id = uid and item = item_id and draw_at = d and choice is null;
  get diagnostics n = row_count;
  if n = 0 then raise exception 'Aucun ticket à rechoisir pour ce tirage' using errcode = 'P0001'; end if;
  return jsonb_build_object('ok', true, 'item', item_id, 'choice', c, 'draw_at', d);
end; $$;
revoke all on function public.ticket_choose(text, text) from public, anon;
grant execute on function public.ticket_choose(text, text) to authenticated;

-- 3. État du PK shop (remplace 018) : en plus, « redo » = mes tickets du prochain tirage dont la carte est à rechoisir.
create or replace function public.shop_state() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid(); m timestamptz := public._shop_month_start(now()); nd timestamptz := public._game_next_draw(now());
  mb jsonb; stock jsonb; prizes jsonb; mine jsonb; redo jsonb;
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
  select jsonb_agg(distinct t.item) into redo from public.tickets t where t.user_id = uid and t.draw_at = nd and t.choice is null;
  return jsonb_build_object('server_now', now(), 'month_start', m, 'next_month', public._shop_period_end(now(), 1), 'draw_at', nd, 'draw_lots', 1,
    'stock', coalesce(stock, '{}'::jsonb), 'month_buy', mb, 'prizes', coalesce(prizes, '{}'::jsonb), 'mine', coalesce(mine, '{}'::jsonb),
    'redo', coalesce(redo, '[]'::jsonb));
end; $$;
revoke all on function public.shop_state() from public, anon;
grant execute on function public.shop_state() to authenticated;

-- 4. Participants (remplace 018) : un ticket dont la carte a été retirée apparaît « Carte à rechoisir ».
create or replace function public.admin_draw_entries(draw timestamptz default null)
returns table (draw_at timestamptz, item text, card text, user_id uuid, pseudo text, email text, tickets bigint)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Réservé aux admins'; end if;
  return query
    select t.draw_at, t.item, coalesce(p.name || coalesce(' (' || p.info || ')', ''), t.choice, 'Carte à rechoisir (carte retirée)'), t.user_id, pr.pseudo, u.email::text, count(*)
    from public.tickets t join auth.users u on u.id = t.user_id left join public.profiles pr on pr.id = t.user_id
      left join public.draw_prizes p on p.draw_at = t.draw_at and p.item = t.item and p.card = t.choice
    where t.draw_at is not null and (case when draw is null then t.draw_at > now() else t.draw_at = draw end)
    group by t.draw_at, t.item, p.name, p.info, t.choice, t.user_id, pr.pseudo, u.email
    order by t.draw_at, t.item, count(*) desc;
end; $$;
revoke all on function public.admin_draw_entries(timestamptz) from public, anon;
grant execute on function public.admin_draw_entries(timestamptz) to authenticated;

-- Fin : l'API de Supabase relit la liste des fonctions (sinon l'app ne les voit qu'au redémarrage).
notify pgrst, 'reload schema';

-- ================= 031_carte_joueur.sql =================
-- 031_carte_joueur.sql — Carte de visite d'un joueur du classement de « Ma ligue » (2026-11-15, porteur).
--
-- Demande du porteur : « lorsqu'un utilisateur clique sur le profil d'un joueur du classement, il peut voir sa carte de
-- visite : son avatar, son pseudo, depuis quand il est sur l'appli, les PL remportés et son classement des anciennes
-- saisons et de sa saison actuelle ».
--   - season_board (remplace celle de 028) : chaque joueur du classement (et ma ligne « me ») porte son identifiant
--     (« id »), pour ouvrir sa carte ; rien d'autre ne change.
--   - player_card(target) : la carte d'un joueur, pour tout compte connecté. Seulement ce que le classement montre déjà
--     (pseudo, avatar, grade, PL et place) plus le mois d'arrivée sur Dropicards (« membre depuis », au mois près) et
--     ses saisons passées (PL et place). Jamais l'adresse e-mail, l'âge ni la collection.
--   - Comptes admin ou suspendus : pas classés (comme au classement) ; carte d'un compte suspendu ou supprimé refusée.
-- À installer après 028 (install_024_a_034.sql). Rejouable. Tests : tests/test_031.sql.

do $$ begin
  if to_regprocedure('public._pl_scores(integer)') is null or to_regclass('public.pl_ledger') is null then
    raise exception 'Installe d''abord 028_points_loyaute.sql (fichier install_024_a_034.sql)';
  end if;
end $$;

-- 1. Classement de la saison (même règle que 028), avec l'identifiant de chaque joueur.
create or replace function public.season_board(lim int default 50) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid(); se jsonb; s int; res jsonb; n int := least(greatest(coalesce(lim, 50), 3), 100);
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  se := public._season_at(now()); s := (se->>'n')::int;
  with sc as (select * from public._pl_scores(s)),
       rk as (select sc.user_id, sc.pl, (rank() over (order by sc.pl desc, sc.last_at asc nulls last))::int as r,
                     row_number() over (order by sc.pl desc, sc.last_at asc nulls last, sc.user_id) as rn from sc)
  select jsonb_build_object(
    'unit', 'pl', 'season', se, 'now', now(), 'players', (select count(*) from rk),
    'ranked', (select count(*) from rk where rk.pl > 0),
    'top', coalesce((select jsonb_agg(jsonb_build_object('id', rk.user_id, 'rank', rk.r, 'pseudo', p.pseudo, 'grade', public._game_grade(rk.user_id), 'pl', rk.pl,
                       'me', rk.user_id = uid, 'avatar', p.avatar) order by rk.rn)
                     from rk join public.profiles p on p.id = rk.user_id where rk.rn <= n), '[]'::jsonb),
    'me', (select jsonb_build_object('id', rk.user_id, 'rank', rk.r, 'pl', rk.pl) from rk where rk.user_id = uid),
    'pl_season', coalesce((select sum(l.pl) from public.pl_ledger l where l.user_id = uid and l.season = s), 0),
    'pl_total', coalesce((select sum(l.pl) from public.pl_ledger l where l.user_id = uid), 0),
    'pk_total', coalesce((select w.pk_earned from public.wallets w where w.user_id = uid), 0),
    'grade', public._game_grade(uid)
  ) into res;
  return res;
end; $$;
revoke all on function public.season_board(int) from public, anon;
grant execute on function public.season_board(int) to authenticated;

-- 2. Place et PL d'un joueur dans une saison (même règle que le classement : PL décroissants, égalité départagée par
-- l'heure du dernier gain). Aucune ligne si le joueur n'est pas classé (admin, compte suspendu, pas de pseudo).
create or replace function public._pl_rank(target uuid, n int) returns table (rank int, pl bigint, players bigint)
language sql stable security definer set search_path = '' as $$
  with sc as (select * from public._pl_scores(n)),
       rk as (select sc.user_id, sc.pl, (rank() over (order by sc.pl desc, sc.last_at asc nulls last))::int as r from sc)
  select rk.r, rk.pl, (select count(*) from rk) from rk where rk.user_id = target;
$$;
revoke all on function public._pl_rank(uuid, int) from public, anon, authenticated;

-- 3. Carte de visite d'un joueur.
create or replace function public.player_card(target uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid(); p public.profiles%rowtype; s int; cur jsonb; past jsonb;
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  select * into p from public.profiles where id = target and status = 'active' and pseudo is not null;
  if not found then raise exception 'Ce joueur n''est plus dans la ligue.' using errcode = 'P0001'; end if;
  s := (public._season_at(now())->>'n')::int;
  select jsonb_build_object('n', s, 'rank', r.rank, 'pl', r.pl, 'players', r.players) into cur from public._pl_rank(target, s) r;
  -- Saisons passées où le joueur a gagné des PL, de la plus récente à la plus ancienne.
  select coalesce(jsonb_agg(y.x order by y.k desc), '[]'::jsonb) into past from (
    select k, jsonb_build_object('n', k, 'rank', r.rank, 'pl', r.pl, 'players', r.players) as x
    from generate_series(1, greatest(s - 1, 0)) k cross join lateral public._pl_rank(target, k) r where r.pl > 0) y;
  return jsonb_build_object(
    'id', p.id, 'pseudo', p.pseudo, 'avatar', p.avatar, 'grade', public._game_grade(target), 'me', target = uid,
    'since', to_char(date_trunc('month', p.created_at at time zone 'Europe/Paris'), 'YYYY-MM'),
    'season', coalesce(cur, jsonb_build_object('n', s, 'rank', null, 'pl', 0, 'players', null)),
    'past', past);
end; $$;
revoke all on function public.player_card(uuid) from public, anon;
grant execute on function public.player_card(uuid) to authenticated;

-- Fin : l'API de Supabase relit la liste des fonctions (sinon l'app ne les voit qu'au redémarrage).
notify pgrst, 'reload schema';

-- ================= 032_messages_rapides.sql =================
-- 032_messages_rapides.sql — Messages rapides entre joueurs de « Ma ligue » (2026-11-16, choix du porteur : option B
-- de docs/43-proposition-messagerie-joueurs.md, maquette docs/43-maquette-messagerie/).
--
--   - Depuis la carte de dresseur d'un joueur, on lui envoie un des 8 messages tout faits de Dropicards (quick_msg_catalog).
--     Jamais de texte libre : rien à modérer, sans risque pour les joueurs de moins de 15 ans.
--   - 10 messages envoyés par jour au plus (jour de Paris), 3 au plus au même joueur par jour ; pas à soi-même ; pas à un
--     compte suspendu ou sans pseudo ; pas à un joueur qui a coupé ses messages.
--   - « Mes messages » : messages reçus (pseudo, avatar et grade de l'expéditeur), réponse en un appui par un autre message
--     tout fait (une seule réponse par message), réglage « Recevoir les messages rapides ».
--   - Messages effacés après 90 jours, et avec le compte (suppression du compte : effacement en cascade).
--   - Tables lues et écrites seulement par ces fonctions (aucun accès direct).
-- À installer après 028 et 031 (fichier install_024_a_034.sql). Rejouable. Tests : tests/test_032.sql.

do $$ begin
  if to_regprocedure('public._game_grade(uuid)') is null or to_regprocedure('public._game_today()') is null or to_regclass('public.profiles') is null then
    raise exception 'Installe d''abord 001 à 031 (fichier install_024_a_034.sql)';
  end if;
end $$;

-- 1. Les 8 messages tout faits (codes lus par l'app, qui affiche le texte et l'émoji).
create table if not exists public.quick_msg_catalog (code text primary key, label text not null, pos int not null);
insert into public.quick_msg_catalog (code, label, pos) values
  ('salut', '👋 Salut !', 1), ('bravo', '👏 Bien joué !', 2), ('collection', '🔥 Belle collection !', 3),
  ('top10', '🏆 Rendez-vous au top 10 !', 4), ('gg', '💪 GG !', 5), ('tirage', '🎁 Bonne chance au tirage !', 6),
  ('safari', '⚡ Prêt pour le Safari ?', 7), ('merci', '😄 Merci !', 8)
on conflict (code) do update set label = excluded.label, pos = excluded.pos;
alter table public.quick_msg_catalog enable row level security;
revoke all on public.quick_msg_catalog from anon, authenticated;

-- 2. Messages envoyés.
create table if not exists public.quick_messages (
  id bigint generated always as identity primary key,
  from_id uuid not null references auth.users (id) on delete cascade,
  to_id uuid not null references auth.users (id) on delete cascade,
  code text not null references public.quick_msg_catalog (code),
  reply_to bigint references public.quick_messages (id) on delete set null,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  check (from_id <> to_id)
);
create index if not exists quick_messages_to on public.quick_messages (to_id, created_at desc);
create index if not exists quick_messages_from on public.quick_messages (from_id, created_at desc);
create unique index if not exists quick_messages_one_reply on public.quick_messages (reply_to) where reply_to is not null;
alter table public.quick_messages enable row level security;
revoke all on public.quick_messages from anon, authenticated;

-- 3. Joueurs qui ont coupé leurs messages (une ligne = messages coupés).
create table if not exists public.quick_msg_off (user_id uuid primary key references auth.users (id) on delete cascade, at timestamptz not null default now());
alter table public.quick_msg_off enable row level security;
revoke all on public.quick_msg_off from anon, authenticated;

-- 4. Envoi (outil interne, partagé par l'envoi et la réponse).
create or replace function public._quick_msg_put(uid uuid, target uuid, c text, reply bigint) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare d timestamptz := (public._game_today()::timestamp) at time zone 'Europe/Paris'; n_day int; n_to int; id_new bigint;
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  if target is null or target = uid then raise exception 'Tu ne peux pas t''envoyer un message à toi-même.' using errcode = 'P0001'; end if;
  if not exists (select 1 from public.quick_msg_catalog where code = c) then raise exception 'Choisis un des messages proposés.' using errcode = 'P0001'; end if;
  if not exists (select 1 from public.profiles where id = target and status = 'active' and pseudo is not null) then
    raise exception 'Ce joueur n''est plus dans la ligue.' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.quick_msg_off where user_id = target) then
    raise exception 'Ce joueur ne reçoit pas de messages rapides.' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.profiles where id = uid and status <> 'active') then raise exception 'Compte suspendu.' using errcode = '42501'; end if;
  perform pg_advisory_xact_lock(hashtext('quick_msg:' || uid::text));
  select count(*), count(*) filter (where to_id = target) into n_day, n_to from public.quick_messages where from_id = uid and created_at >= d;
  if n_day >= 10 then raise exception 'Tu as déjà envoyé tes 10 messages rapides aujourd''hui. Reviens demain !' using errcode = 'P0001'; end if;
  if n_to >= 3 then raise exception 'Tu as déjà envoyé 3 messages à ce joueur aujourd''hui.' using errcode = 'P0001'; end if;
  insert into public.quick_messages (from_id, to_id, code, reply_to) values (uid, target, c, reply) returning id into id_new;
  -- Ménage : messages de plus de 90 jours.
  delete from public.quick_messages where created_at < now() - interval '90 days';
  return jsonb_build_object('ok', true, 'id', id_new, 'left', 9 - n_day);
end; $$;
revoke all on function public._quick_msg_put(uuid, uuid, text, bigint) from public, anon, authenticated;

-- 5. Envoyer un message tout fait à un joueur (depuis sa carte de dresseur).
create or replace function public.quick_msg_send(target uuid, code text) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
begin
  return public._quick_msg_put(auth.uid(), target, code, null);
end; $$;
revoke all on function public.quick_msg_send(uuid, text) from public, anon;
grant execute on function public.quick_msg_send(uuid, text) to authenticated;

-- 6. Répondre à un message reçu (une seule réponse par message).
create or replace function public.quick_msg_reply(msg_id bigint, code text) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := auth.uid(); m public.quick_messages%rowtype;
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  select * into m from public.quick_messages where id = msg_id and to_id = uid;
  if not found then raise exception 'Message introuvable.' using errcode = 'P0001'; end if;
  if exists (select 1 from public.quick_messages where reply_to = msg_id) then raise exception 'Tu as déjà répondu à ce message.' using errcode = 'P0001'; end if;
  return public._quick_msg_put(uid, m.from_id, code, msg_id);
end; $$;
revoke all on function public.quick_msg_reply(bigint, text) from public, anon;
grant execute on function public.quick_msg_reply(bigint, text) to authenticated;

-- 7. Mes messages reçus (30 derniers par défaut), avec l'expéditeur et ma réponse éventuelle.
create or replace function public.quick_msg_inbox(lim int default 30) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid(); n int := least(greatest(coalesce(lim, 30), 1), 100);
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  return jsonb_build_object(
    'off', exists (select 1 from public.quick_msg_off where user_id = uid),
    'unread', (select count(*) from public.quick_messages where to_id = uid and read_at is null),
    'left', greatest(0, 10 - (select count(*) from public.quick_messages where from_id = uid and created_at >= (public._game_today()::timestamp) at time zone 'Europe/Paris')),
    'items', coalesce((select jsonb_agg(x.j order by x.at desc) from (
      select q.created_at as at, jsonb_build_object('id', q.id, 'code', q.code, 'at', q.created_at, 'read', q.read_at is not null,
        'from', q.from_id, 'pseudo', p.pseudo, 'avatar', p.avatar, 'grade', public._game_grade(q.from_id),
        'replied', (select r.code from public.quick_messages r where r.reply_to = q.id)) as j
      from public.quick_messages q join public.profiles p on p.id = q.from_id
      where q.to_id = uid and p.status = 'active'
      order by q.created_at desc limit n) x), '[]'::jsonb));
end; $$;
revoke all on function public.quick_msg_inbox(int) from public, anon;
grant execute on function public.quick_msg_inbox(int) to authenticated;

-- 8. Nombre de messages non lus (pastille) et messages restants aujourd'hui.
create or replace function public.quick_msg_state() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  return jsonb_build_object(
    'unread', (select count(*) from public.quick_messages q join public.profiles p on p.id = q.from_id where q.to_id = uid and q.read_at is null and p.status = 'active'),
    'left', greatest(0, 10 - (select count(*) from public.quick_messages where from_id = uid and created_at >= (public._game_today()::timestamp) at time zone 'Europe/Paris')),
    'off', exists (select 1 from public.quick_msg_off where user_id = uid));
end; $$;
revoke all on function public.quick_msg_state() from public, anon;
grant execute on function public.quick_msg_state() to authenticated;

-- 9. Tout marquer comme lu (à l'ouverture de « Mes messages »).
create or replace function public.quick_msg_read() returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := auth.uid(); n int;
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  update public.quick_messages set read_at = now() where to_id = uid and read_at is null;
  get diagnostics n = row_count;
  return jsonb_build_object('ok', true, 'read', n);
end; $$;
revoke all on function public.quick_msg_read() from public, anon;
grant execute on function public.quick_msg_read() to authenticated;

-- 10. Recevoir ou non les messages rapides.
create or replace function public.quick_msg_set(receive boolean) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  if coalesce(receive, true) then delete from public.quick_msg_off where user_id = uid;
  else insert into public.quick_msg_off (user_id) values (uid) on conflict (user_id) do nothing; end if;
  return jsonb_build_object('ok', true, 'off', not coalesce(receive, true));
end; $$;
revoke all on function public.quick_msg_set(boolean) from public, anon;
grant execute on function public.quick_msg_set(boolean) to authenticated;

-- Fin : l'API de Supabase relit la liste des fonctions (sinon l'app ne les voit qu'au redémarrage).
notify pgrst, 'reload schema';

-- ================= 033_vitrine.sql =================
-- 033_vitrine.sql — Vitrine, « Pour trade », « À vendre » et « Je cherche » : étage 1 des échanges entre joueurs
-- (2026-11-16, « go » du porteur, docs/45-proposition-vitrine-pour-trade.md, décisions V1 à V6 par défaut ; le porteur
-- ajoute : « laisse le choix à l'utilisateur de mettre son prix de vente : soit il vend au prix qu'il indique, soit il
-- propose un trade »).
--
--   - Vitrine : jusqu'à 30 exemplaires de son classeur (carte, langue, état, note), montrés sur sa carte de dresseur.
--     Chaque exemplaire peut être « Pour trade » et/ou « À vendre » avec le prix demandé par le joueur (1 € à 100 000 €).
--   - « Je cherche » : jusqu'à 50 cartes. Les « échanges possibles » croisent les vitrines et les listes.
--   - Propositions sans texte libre : « Je suis intéressé » (carte Pour trade ou à vendre) et « Je te propose un
--     échange » (sa carte contre une de mes cartes Pour trade), dans « Mes messages » (messages rapides de 032, avec les
--     cartes jointes). Réponses : « Ça m'intéresse » (accord : les cartes passent « d'accord »), « Non merci »,
--     « Plus disponible ». Mêmes limites que les messages rapides (10 par jour, 3 au même joueur).
--   - Dropicards ne vend rien, ne prend rien, ne fait passer aucun argent : la vente et l'échange se concluent entre
--     joueurs, hors de l'app (pour s'écrire : étage 2, plus tard).
--   - Âge : vitrine visible par tous les joueurs connectés ; Pour trade, propositions et réponses dès 15 ans ; « À
--     vendre » seulement après « J'ai 18 ans ou plus » (déclaré par le joueur, trade_adult_confirm).
--   - Tables fermées aux joueurs : seules ces fonctions les lisent et les écrivent. Tout s'efface avec le compte.
-- À installer après 032 (fichier install_024_a_034.sql). Rejouable. Tests : tests/test_033.sql.

do $$ begin
  if to_regprocedure('public.quick_msg_send(uuid,text)') is null or to_regclass('public.quick_messages') is null then
    raise exception 'Installe d''abord 032_messages_rapides.sql (fichier install_024_a_034.sql)';
  end if;
end $$;

-- 1. Vitrine (un exemplaire par ligne ; « ref » = clé de l'exemplaire sur l'appareil : carte|langue|état|note).
create table if not exists public.showcase (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  ref text not null,
  card_id text not null,
  lang text not null default 'FR',
  cond text not null default 'NM',
  grade text,
  for_trade boolean not null default false,
  for_sale boolean not null default false,
  price_cents int,
  deal boolean not null default false,
  pos int not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, ref),
  check (char_length(ref) <= 120),
  check (card_id ~ '^[A-Za-z0-9._-]{1,60}$'),
  check (lang ~ '^[A-Z]{2}$'),
  check (cond in ('MT', 'NM', 'EX', 'GD', 'PL', 'PO')),
  check (grade is null or grade ~ '^[A-Z]{2,4}-[0-9.]{1,4}(BL|GL)?$'),
  check ((for_sale and price_cents between 100 and 10000000) or (not for_sale and price_cents is null))
);
create index if not exists showcase_card on public.showcase (card_id) where for_trade or for_sale;
alter table public.showcase enable row level security;
revoke all on public.showcase from anon, authenticated;

-- 2. « Je cherche ».
create table if not exists public.wants (
  user_id uuid not null references auth.users (id) on delete cascade,
  card_id text not null check (card_id ~ '^[A-Za-z0-9._-]{1,60}$'),
  created_at timestamptz not null default now(),
  primary key (user_id, card_id)
);
create index if not exists wants_card on public.wants (card_id);
alter table public.wants enable row level security;
revoke all on public.wants from anon, authenticated;

-- 3. « J'ai 18 ans ou plus » (déclaré pour vendre).
create table if not exists public.trade_adult (user_id uuid primary key references auth.users (id) on delete cascade, at timestamptz not null default now());
alter table public.trade_adult enable row level security;
revoke all on public.trade_adult from anon, authenticated;

-- 4. Messages rapides : cartes jointes et accord.
alter table public.quick_messages add column if not exists kind text not null default 'quick';
alter table public.quick_messages add column if not exists card jsonb;
alter table public.quick_messages add column if not exists offer jsonb;
alter table public.quick_messages add column if not exists deal boolean not null default false;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'quick_messages_kind_check') then
    alter table public.quick_messages add constraint quick_messages_kind_check check (kind in ('quick', 'interest', 'offer', 'answer'));
  end if;
end $$;
insert into public.quick_msg_catalog (code, label, pos) values
  ('interest', '👋 Je suis intéressé par ta carte', 20), ('offer', '⇄ Je te propose un échange', 21),
  ('deal_yes', '👍 Ça m''intéresse', 22), ('deal_no', '🙅 Non merci', 23), ('gone', 'Plus disponible', 24)
on conflict (code) do update set label = excluded.label, pos = excluded.pos;

-- 5. Outils internes.
-- 15 ans et plus (tranche d'âge de l'inscription ; un compte sans tranche est accepté).
create or replace function public._trade_age_ok(uid uuid) returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((select age_range is distinct from 'u15' from public.profiles where id = uid), false);
$$;
revoke all on function public._trade_age_ok(uuid) from public, anon, authenticated;
-- Joueur visible dans la ligue : compte actif avec un pseudo.
create or replace function public._trade_visible(uid uuid) returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = uid and status = 'active' and pseudo is not null);
$$;
revoke all on function public._trade_visible(uuid) from public, anon, authenticated;
-- Carte d'une vitrine figée dans un message (si l'exemplaire change ou disparaît, le message reste lisible).
create or replace function public._trade_snap(s public.showcase) returns jsonb language sql immutable set search_path = '' as $$
  select jsonb_build_object('sid', s.id, 'card_id', s.card_id, 'lang', s.lang, 'cond', s.cond, 'grade', s.grade,
    'trade', s.for_trade, 'sale', s.for_sale, 'price_cents', s.price_cents);
$$;
revoke all on function public._trade_snap(public.showcase) from public, anon, authenticated;

-- Envoi d'un message (032 + type et cartes jointes). Mêmes règles : pas à soi-même, joueur actif, messages coupés,
-- 10 par jour, 3 au même joueur, ménage à 90 jours.
create or replace function public._quick_msg_put2(uid uuid, target uuid, c text, reply bigint, k text, crd jsonb, ofr jsonb) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare d timestamptz := (public._game_today()::timestamp) at time zone 'Europe/Paris'; n_day int; n_to int; id_new bigint;
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  if target is null or target = uid then raise exception 'Tu ne peux pas t''envoyer un message à toi-même.' using errcode = 'P0001'; end if;
  if not exists (select 1 from public.quick_msg_catalog where code = c) then raise exception 'Choisis un des messages proposés.' using errcode = 'P0001'; end if;
  if not public._trade_visible(target) then raise exception 'Ce joueur n''est plus dans la ligue.' using errcode = 'P0001'; end if;
  if exists (select 1 from public.quick_msg_off where user_id = target) then
    raise exception 'Ce joueur ne reçoit pas de messages rapides.' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.profiles where id = uid and status <> 'active') then raise exception 'Compte suspendu.' using errcode = '42501'; end if;
  perform pg_advisory_xact_lock(hashtext('quick_msg:' || uid::text));
  select count(*), count(*) filter (where to_id = target) into n_day, n_to from public.quick_messages where from_id = uid and created_at >= d;
  if n_day >= 10 then raise exception 'Tu as déjà envoyé tes 10 messages rapides aujourd''hui. Reviens demain !' using errcode = 'P0001'; end if;
  if n_to >= 3 then raise exception 'Tu as déjà envoyé 3 messages à ce joueur aujourd''hui.' using errcode = 'P0001'; end if;
  insert into public.quick_messages (from_id, to_id, code, reply_to, kind, card, offer) values (uid, target, c, reply, k, crd, ofr) returning id into id_new;
  delete from public.quick_messages where created_at < now() - interval '90 days';
  return jsonb_build_object('ok', true, 'id', id_new, 'left', 9 - n_day);
end; $$;
revoke all on function public._quick_msg_put2(uuid, uuid, text, bigint, text, jsonb, jsonb) from public, anon, authenticated;
-- L'outil de 032 passe par le nouveau.
create or replace function public._quick_msg_put(uid uuid, target uuid, c text, reply bigint) returns jsonb
language sql volatile security definer set search_path = '' as $$ select public._quick_msg_put2(uid, target, c, reply, 'quick', null, null); $$;
revoke all on function public._quick_msg_put(uuid, uuid, text, bigint) from public, anon, authenticated;

-- 6. Messages rapides ordinaires : jamais avec les codes des échanges ; pas de réponse ordinaire à une proposition.
create or replace function public.quick_msg_send(target uuid, code text) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
begin
  if code in ('interest', 'offer', 'deal_yes', 'deal_no', 'gone') then raise exception 'Choisis un des messages proposés.' using errcode = 'P0001'; end if;
  return public._quick_msg_put(auth.uid(), target, code, null);
end; $$;
revoke all on function public.quick_msg_send(uuid, text) from public, anon;
grant execute on function public.quick_msg_send(uuid, text) to authenticated;

create or replace function public.quick_msg_reply(msg_id bigint, code text) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := auth.uid(); m public.quick_messages%rowtype;
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  if code in ('interest', 'offer', 'deal_yes', 'deal_no', 'gone') then raise exception 'Choisis un des messages proposés.' using errcode = 'P0001'; end if;
  select * into m from public.quick_messages where id = msg_id and to_id = uid;
  if not found then raise exception 'Message introuvable.' using errcode = 'P0001'; end if;
  if m.kind in ('interest', 'offer') then raise exception 'Réponds avec les boutons de la proposition.' using errcode = 'P0001'; end if;
  if exists (select 1 from public.quick_messages where reply_to = msg_id) then raise exception 'Tu as déjà répondu à ce message.' using errcode = 'P0001'; end if;
  return public._quick_msg_put(uid, m.from_id, code, msg_id);
end; $$;
revoke all on function public.quick_msg_reply(bigint, text) from public, anon;
grant execute on function public.quick_msg_reply(bigint, text) to authenticated;

-- 7. « J'ai 18 ans ou plus » (pour mettre une carte « À vendre »).
create or replace function public.trade_adult_confirm() returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  if not public._trade_age_ok(uid) then raise exception 'La vente est réservée aux 18 ans et plus.' using errcode = 'P0001'; end if;
  insert into public.trade_adult (user_id) values (uid) on conflict (user_id) do nothing;
  return jsonb_build_object('ok', true, 'adult', true);
end; $$;
revoke all on function public.trade_adult_confirm() from public, anon;
grant execute on function public.trade_adult_confirm() to authenticated;

-- 8. Ma vitrine : remplacée en entier par la liste envoyée par l'app (30 exemplaires au plus).
-- items : [{ ref, card_id, lang, cond, grade, trade, sale, price (euros), deal_off }]. L'accord (« deal ») est gardé
-- pour un exemplaire qui reste, sauf deal_off.
create or replace function public.showcase_set(items jsonb) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := auth.uid(); n int; it jsonb; i int := 0; refs text[] := '{}'; tr boolean; sl boolean; pc int;
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  if not public._trade_visible(uid) then raise exception 'Compte suspendu ou sans pseudo.' using errcode = '42501'; end if;
  if items is null or jsonb_typeof(items) <> 'array' then raise exception 'Vitrine illisible.' using errcode = 'P0001'; end if;
  n := jsonb_array_length(items);
  if n > 30 then raise exception 'Ta vitrine peut montrer 30 cartes au plus.' using errcode = 'P0001'; end if;
  perform pg_advisory_xact_lock(hashtext('showcase:' || uid::text));
  for it in select value from jsonb_array_elements(items) loop
    i := i + 1;
    tr := coalesce((it->>'trade')::boolean, false); sl := coalesce((it->>'sale')::boolean, false);
    if (tr or sl) and not public._trade_age_ok(uid) then raise exception 'Les échanges sont ouverts à partir de 15 ans.' using errcode = 'P0001'; end if;
    if sl and not exists (select 1 from public.trade_adult where user_id = uid) then
      raise exception 'Confirme d''abord avoir 18 ans ou plus pour vendre une carte.' using errcode = 'P0001';
    end if;
    pc := case when sl then round(coalesce((it->>'price')::numeric, 0) * 100)::int else null end;
    if sl and (pc is null or pc < 100 or pc > 10000000) then raise exception 'Prix de vente : de 1 € à 100 000 €.' using errcode = 'P0001'; end if;
    if coalesce(it->>'ref', '') = '' or (it->>'ref') = any (refs) then raise exception 'Vitrine illisible.' using errcode = 'P0001'; end if;
    refs := refs || (it->>'ref');
    insert into public.showcase (user_id, ref, card_id, lang, cond, grade, for_trade, for_sale, price_cents, pos, updated_at)
    values (uid, it->>'ref', it->>'card_id', upper(coalesce(nullif(it->>'lang', ''), 'FR')), coalesce(nullif(it->>'cond', ''), 'NM'),
            nullif(it->>'grade', ''), tr, sl, pc, i, now())
    on conflict (user_id, ref) do update set card_id = excluded.card_id, lang = excluded.lang, cond = excluded.cond, grade = excluded.grade,
      for_trade = excluded.for_trade, for_sale = excluded.for_sale, price_cents = excluded.price_cents, pos = excluded.pos, updated_at = now(),
      deal = case when coalesce((it->>'deal_off')::boolean, false) then false else public.showcase.deal end;
  end loop;
  delete from public.showcase where user_id = uid and not (ref = any (refs));
  return jsonb_build_object('ok', true, 'n', n);
exception when check_violation then
  raise exception 'Une carte de la vitrine est illisible.' using errcode = 'P0001';
end; $$;
revoke all on function public.showcase_set(jsonb) from public, anon;
grant execute on function public.showcase_set(jsonb) to authenticated;

-- 9. Ma liste « Je cherche » : remplacée en entier (50 cartes au plus).
create or replace function public.wants_set(ids text[]) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := auth.uid(); u text[] := array(select distinct x from unnest(coalesce(ids, '{}')) x where x is not null);
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  if not public._trade_visible(uid) then raise exception 'Compte suspendu ou sans pseudo.' using errcode = '42501'; end if;
  if cardinality(u) > 50 then raise exception 'Ta liste « Je cherche » peut contenir 50 cartes au plus.' using errcode = 'P0001'; end if;
  if exists (select 1 from unnest(u) x where x !~ '^[A-Za-z0-9._-]{1,60}$') then raise exception 'Carte illisible.' using errcode = 'P0001'; end if;
  perform pg_advisory_xact_lock(hashtext('wants:' || uid::text));
  delete from public.wants where user_id = uid and not (card_id = any (u));
  insert into public.wants (user_id, card_id) select uid, x from unnest(u) x on conflict do nothing;
  return jsonb_build_object('ok', true, 'n', cardinality(u));
end; $$;
revoke all on function public.wants_set(text[]) from public, anon;
grant execute on function public.wants_set(text[]) to authenticated;

-- 10. Mon état : majeur déclaré, âge, mes cartes en vitrine (clé, numéro, accord), et pour mes cartes : combien de joueurs les cherchent ; pour mes « Je cherche » :
-- combien de joueurs les ont pour trade ou à vendre.
create or replace function public.trade_state() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  return jsonb_build_object(
    'adult', exists (select 1 from public.trade_adult where user_id = uid),
    'age_ok', public._trade_age_ok(uid),
    'mine', coalesce((select jsonb_agg(jsonb_build_object('ref', s.ref, 'sid', s.id, 'deal', s.deal) order by s.pos) from public.showcase s where s.user_id = uid), '[]'::jsonb),
    'demand', coalesce((select jsonb_object_agg(x.card_id, x.n) from (
      select w.card_id, count(*) as n from public.wants w
      where w.card_id in (select card_id from public.showcase where user_id = uid) and w.user_id <> uid and public._trade_visible(w.user_id)
      group by w.card_id) x), '{}'::jsonb),
    'supply', coalesce((select jsonb_object_agg(x.card_id, x.n) from (
      select s.card_id, count(distinct s.user_id) as n from public.showcase s
      where s.card_id in (select card_id from public.wants where user_id = uid) and s.user_id <> uid and (s.for_trade or s.for_sale) and not s.deal
        and public._trade_visible(s.user_id)
      group by s.card_id) x), '{}'::jsonb));
end; $$;
revoke all on function public.trade_state() from public, anon;
grant execute on function public.trade_state() to authenticated;

-- 11. Une carte (fiche d'une carte) : joueurs qui la cherchent, joueurs qui l'ont pour trade ou à vendre.
create or replace function public.trade_card(card_id text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid(); c text := card_id;
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  return jsonb_build_object(
    'wanted', (select count(*) from public.wants w where w.card_id = c and w.user_id <> uid and public._trade_visible(w.user_id)),
    'offered', (select count(distinct s.user_id) from public.showcase s where s.card_id = c and s.user_id <> uid and (s.for_trade or s.for_sale) and not s.deal
                and public._trade_visible(s.user_id)));
end; $$;
revoke all on function public.trade_card(text) from public, anon;
grant execute on function public.trade_card(text) to authenticated;

-- 12. Échanges possibles : joueurs qui ont des cartes que je cherche (pour trade ou à vendre) et/ou qui cherchent mes
-- cartes Pour trade ou à vendre. Classés par nombre de correspondances.
create or replace function public.trade_matches(lim int default 30) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid(); n int := least(greatest(coalesce(lim, 30), 1), 50);
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  return coalesce((select jsonb_agg(x.j order by x.score desc, x.has desc, x.pseudo) from (
    with mine as (select distinct card_id from public.showcase where user_id = uid and (for_trade or for_sale) and not deal),
         my_wants as (select card_id from public.wants where user_id = uid),
         has as (select s.user_id, array_agg(distinct s.card_id) as ids from public.showcase s join my_wants w on w.card_id = s.card_id
                 where s.user_id <> uid and (s.for_trade or s.for_sale) and not s.deal group by s.user_id),
         wnt as (select w.user_id, array_agg(distinct w.card_id) as ids from public.wants w join mine m on m.card_id = w.card_id
                 where w.user_id <> uid group by w.user_id),
         pl as (select coalesce(h.user_id, t.user_id) as user_id, coalesce(h.ids, '{}') as hids, coalesce(t.ids, '{}') as wids
                from has h full join wnt t on t.user_id = h.user_id)
    select p.pseudo, cardinality(pl.hids) + cardinality(pl.wids) as score, cardinality(pl.hids) as has,
      jsonb_build_object('id', pl.user_id, 'pseudo', p.pseudo, 'avatar', p.avatar, 'grade', public._game_grade(pl.user_id),
        'has', cardinality(pl.hids), 'wants', cardinality(pl.wids), 'has_ids', to_jsonb(pl.hids[1:3]), 'want_ids', to_jsonb(pl.wids[1:3])) as j
    from pl join public.profiles p on p.id = pl.user_id
    where p.status = 'active' and p.pseudo is not null
    order by 2 desc, 3 desc, 1 limit n) x), '[]'::jsonb);
end; $$;
revoke all on function public.trade_matches(int) from public, anon;
grant execute on function public.trade_matches(int) to authenticated;

-- 13. Vitrine d'un joueur (et la mienne) : ses cartes, sa liste « Je cherche », ce qui colle avec moi.
create or replace function public.player_showcase(target uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  if not public._trade_visible(target) then raise exception 'Ce joueur n''est plus dans la ligue.' using errcode = 'P0001'; end if;
  return jsonb_build_object(
    'me', target = uid,
    'items', coalesce((select jsonb_agg(public._trade_snap(s) || jsonb_build_object('deal', s.deal) order by s.pos, s.id)
                       from public.showcase s where s.user_id = target), '[]'::jsonb),
    'wants', coalesce((select jsonb_agg(w.card_id order by w.created_at desc) from public.wants w where w.user_id = target), '[]'::jsonb),
    'has_for_me', (select count(distinct s.card_id) from public.showcase s join public.wants w on w.card_id = s.card_id and w.user_id = uid
                   where s.user_id = target and target <> uid and (s.for_trade or s.for_sale) and not s.deal),
    'wants_mine', (select count(distinct w.card_id) from public.wants w join public.showcase s on s.card_id = w.card_id and s.user_id = uid
                   where w.user_id = target and target <> uid and (s.for_trade or s.for_sale) and not s.deal));
end; $$;
revoke all on function public.player_showcase(uuid) from public, anon;
grant execute on function public.player_showcase(uuid) to authenticated;

-- 14. « Je suis intéressé » ou « Je te propose un échange » (sa carte contre une de mes cartes Pour trade).
create or replace function public.trade_send(target uuid, kind text, card_sid bigint, offer_sid bigint default null) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := auth.uid(); c public.showcase%rowtype; o public.showcase%rowtype; k text := kind;
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  if k not in ('interest', 'offer') then raise exception 'Choisis un des messages proposés.' using errcode = 'P0001'; end if;
  if not public._trade_age_ok(uid) then raise exception 'Les échanges sont ouverts à partir de 15 ans.' using errcode = 'P0001'; end if;
  select * into c from public.showcase where id = card_sid and user_id = target;
  if not found or c.deal or not (c.for_trade or c.for_sale) then raise exception 'Cette carte n''est plus disponible.' using errcode = 'P0001'; end if;
  if k = 'offer' then
    if not c.for_trade then raise exception 'Cette carte n''est pas proposée à l''échange.' using errcode = 'P0001'; end if;
    select * into o from public.showcase where id = offer_sid and user_id = uid;
    if not found or o.deal or not o.for_trade then raise exception 'Choisis une de tes cartes Pour trade.' using errcode = 'P0001'; end if;
  end if;
  if exists (select 1 from public.quick_messages q where q.from_id = uid and q.to_id = target and q.kind in ('interest', 'offer')
             and (q.card->>'sid')::bigint = card_sid and not exists (select 1 from public.quick_messages r where r.reply_to = q.id)) then
    raise exception 'Tu as déjà fait une proposition pour cette carte : attends sa réponse.' using errcode = 'P0001';
  end if;
  return public._quick_msg_put2(uid, target, k, null, k, public._trade_snap(c), case when k = 'offer' then public._trade_snap(o) end);
end; $$;
revoke all on function public.trade_send(uuid, text, bigint, bigint) from public, anon;
grant execute on function public.trade_send(uuid, text, bigint, bigint) to authenticated;

-- 15. Répondre à une proposition reçue : « Ça m'intéresse » (accord : les cartes passent « d'accord »), « Non merci »,
-- « Plus disponible ». Une seule réponse par proposition.
create or replace function public.trade_answer(msg_id bigint, code text) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := auth.uid(); m public.quick_messages%rowtype; r jsonb; sids bigint[];
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  if code not in ('deal_yes', 'deal_no', 'gone') then raise exception 'Choisis un des messages proposés.' using errcode = 'P0001'; end if;
  if not public._trade_age_ok(uid) then raise exception 'Les échanges sont ouverts à partir de 15 ans.' using errcode = 'P0001'; end if;
  select * into m from public.quick_messages where id = msg_id and to_id = uid and kind in ('interest', 'offer');
  if not found then raise exception 'Proposition introuvable.' using errcode = 'P0001'; end if;
  if exists (select 1 from public.quick_messages where reply_to = msg_id) then raise exception 'Tu as déjà répondu à cette proposition.' using errcode = 'P0001'; end if;
  if code = 'deal_yes' then
    sids := array_remove(array[(m.card->>'sid')::bigint, (m.offer->>'sid')::bigint], null);
    if not exists (select 1 from public.showcase where id = (m.card->>'sid')::bigint and user_id = uid and not deal and (for_trade or for_sale))
       or (m.offer is not null and not exists (select 1 from public.showcase where id = (m.offer->>'sid')::bigint and user_id = m.from_id and not deal and for_trade)) then
      raise exception 'Une des cartes n''est plus disponible.' using errcode = 'P0001';
    end if;
  end if;
  r := public._quick_msg_put2(uid, m.from_id, code, msg_id, 'answer', m.card, m.offer);
  if code = 'deal_yes' then
    update public.showcase set deal = true, updated_at = now() where id = any (sids);
    update public.quick_messages set deal = true where id in (msg_id, (r->>'id')::bigint);
  end if;
  return r || jsonb_build_object('deal', code = 'deal_yes');
end; $$;
revoke all on function public.trade_answer(bigint, text) from public, anon;
grant execute on function public.trade_answer(bigint, text) to authenticated;

-- 16. « Mes messages » : comme 032, avec le type, les cartes jointes et l'accord.
create or replace function public.quick_msg_inbox(lim int default 30) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid(); n int := least(greatest(coalesce(lim, 30), 1), 100);
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  return jsonb_build_object(
    'off', exists (select 1 from public.quick_msg_off where user_id = uid),
    'unread', (select count(*) from public.quick_messages where to_id = uid and read_at is null),
    'left', greatest(0, 10 - (select count(*) from public.quick_messages where from_id = uid and created_at >= (public._game_today()::timestamp) at time zone 'Europe/Paris')),
    'trade', true,
    'items', coalesce((select jsonb_agg(x.j order by x.at desc) from (
      select q.created_at as at, jsonb_build_object('id', q.id, 'code', q.code, 'at', q.created_at, 'read', q.read_at is not null,
        'from', q.from_id, 'pseudo', p.pseudo, 'avatar', p.avatar, 'grade', public._game_grade(q.from_id),
        'kind', q.kind, 'card', q.card, 'offer', q.offer, 'deal', q.deal,
        'replied', (select r.code from public.quick_messages r where r.reply_to = q.id)) as j
      from public.quick_messages q join public.profiles p on p.id = q.from_id
      where q.to_id = uid and p.status = 'active'
      order by q.created_at desc limit n) x), '[]'::jsonb));
end; $$;
revoke all on function public.quick_msg_inbox(int) from public, anon;
grant execute on function public.quick_msg_inbox(int) to authenticated;

-- Fin : l'API de Supabase relit la liste des fonctions (sinon l'app ne les voit qu'au redémarrage).
notify pgrst, 'reload schema';

-- ================= 034_recherche_dresseurs.sql =================
-- 034_recherche_dresseurs.sql — « Le coin des dresseurs » › « Ma vitrine » : rechercher un dresseur et voir sa vitrine
-- (2026-11-18, porteur : « il pourrait également rechercher tous les utilisateurs de l'appli et, en cliquant sur un
-- utilisateur, tomber sur la vitrine que celui-ci aura partagée, pour engager une discussion si une carte l'intéresse »).
--
--   - player_search(q, lim) : pour tout compte connecté.
--       · q vide : les dresseurs qui ont au moins une carte dans leur vitrine, la vitrine la plus récemment changée en
--         premier (« Vitrines des dresseurs »).
--       · q rempli (pseudo, 1 à 24 caractères, majuscules et accents comme tapés) : les dresseurs dont le pseudo contient
--         ce texte ; pseudo identique d'abord, puis qui commence par lui, puis le reste.
--     Pour chacun : identifiant, pseudo, avatar, grade et le nombre de cartes de sa vitrine (dont Pour trade et à vendre,
--     hors cartes déjà « d'accord »). Jamais l'adresse e-mail, l'âge, le rôle ni la collection.
--   - Comptes cachés : suspendus, sans pseudo, moi-même, et les moins de 15 ans (protection des mineurs : les échanges
--     commencent à 15 ans ; défaut à confirmer par le porteur). Les comptes admin sont trouvables comme les autres.
--   - Au plus 50 résultats par recherche. La vitrine elle-même s'ouvre avec player_showcase (033) et la carte de
--     dresseur avec player_card (031) ; les propositions passent par trade_send (033) : rien ne change pour elles.
-- À installer après 033 (fichier install_024_a_034.sql). Rejouable. Tests : tests/test_034.sql.

do $$ begin
  if to_regprocedure('public.player_showcase(uuid)') is null or to_regclass('public.showcase') is null then
    raise exception 'Installe d''abord 033_vitrine.sql (fichier install_024_a_034.sql)';
  end if;
end $$;

-- Recherche plus rapide sur le pseudo quand il y aura beaucoup de comptes.
create index if not exists profiles_pseudo_lower on public.profiles (lower(pseudo)) where pseudo is not null;
create index if not exists showcase_user on public.showcase (user_id);

create or replace function public.player_search(q text default '', lim int default 30) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  top_n int := least(greatest(coalesce(lim, 30), 1), 50);
  t text := lower(left(btrim(coalesce(q, '')), 24));
  pat text;
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  -- Les caractères spéciaux de LIKE (%, _ et \) sont cherchés tels quels.
  pat := '%' || replace(replace(replace(t, '\', '\\'), '%', '\%'), '_', '\_') || '%';
  return coalesce((select jsonb_agg(x.j order by x.rk, x.last_at desc nulls last, x.pseudo) from (
    select p.pseudo, v.last_at,
      case when t = '' then 0 when lower(p.pseudo) = t then 0 when left(lower(p.pseudo), char_length(t)) = t then 1 else 2 end as rk,
      jsonb_build_object('id', p.id, 'pseudo', p.pseudo, 'avatar', p.avatar, 'grade', public._game_grade(p.id),
        'cards', coalesce(v.n, 0), 'trade', coalesce(v.nt, 0), 'sale', coalesce(v.ns, 0)) as j
    from public.profiles p
    left join lateral (
      select count(*)::int as n, (count(*) filter (where s.for_trade and not s.deal))::int as nt,
             (count(*) filter (where s.for_sale and not s.deal))::int as ns, max(s.updated_at) as last_at
      from public.showcase s where s.user_id = p.id
    ) v on true
    where p.status = 'active' and p.pseudo is not null and p.id <> uid
      and p.age_range is distinct from 'u15'
      and ((t = '' and coalesce(v.n, 0) > 0) or (t <> '' and lower(p.pseudo) like pat escape '\'))
    order by 3, v.last_at desc nulls last, p.pseudo
    limit top_n) x), '[]'::jsonb);
end; $$;
revoke all on function public.player_search(text, int) from public, anon;
grant execute on function public.player_search(text, int) to authenticated;

-- ================= 037_parrainage.sql =================
-- 037 : parrainage fiabilisé (2026-11-21, porteur : « que tous les liens de parrainage soient fonctionnels, que les
-- redirections se fassent correctement, que les personnes reçoivent bien le gain après le parrainage »).
-- Après 028 (Points de loyauté). Rejouable (Studio › SQL Editor › Run). Inclus à la fin de install_024_a_034.sql.
-- Ce qui change :
--   1. Le code du lien part avec l'inscription (raw_user_meta_data.parrain, envoyé par l'app) : le filleul est relié à
--      son parrain dès la création du compte et reçoit tout de suite ses 50 PL de bienvenue, même si le lien a été
--      ouvert ailleurs (navigateur de TikTok ou d'Instagram, app ajoutée à l'écran d'accueil de l'iPhone, qui ne partage
--      pas la mémoire de Safari) : le code est aussi recopiable à la main dans la page d'inscription. Un parrainage
--      refusé (code inconnu, parrain suspendu) n'empêche jamais l'inscription.
--   2. pl_invite(code) : pseudo du propriétaire d'un code, pour l'invitation montrée avant l'inscription (visiteur non
--      connecté) ; rien d'autre (ni e-mail, ni identifiant).
--   3. pl_set_parrain : le même code une 2ᵉ fois répond « déjà fait » au lieu d'une erreur (lien rouvert, ou code déjà
--      envoyé avec l'inscription).
--   4. Gains vus (pl_seen) : pl_state renvoie dans « new » tous les PL arrivés depuis sa dernière lecture, y compris ceux
--      donnés pendant que le joueur n'était pas là (200 PL quand le filleul remplit les conditions en ouvrant l'app de son
--      côté, partage validé par un admin) : avant, le parrain ne voyait jamais l'animation de ses 200 PL.
--   5. pl_state renvoie aussi « me_ref » (le filleul : où il en est des conditions qui donnent 200 PL à son parrain) et
--      « filleuls » (le parrain : ses 30 derniers filleuls avec pseudo, date d'inscription, adresse validée ou non, jours
--      d'ouverture comptés, PL reçus) ; jamais d'e-mail.
--   Conditions inchangées (docs/38, L3) : 200 PL au parrain quand le filleul a validé son adresse et ouvert l'app 3 jours
--   différents dans ses 14 premiers jours (adresse validable plus tard) ; 50 PL au filleul ; 400 PL après 14 jours de
--   DropiPass payé ; 20 filleuls comptés par saison ; rien pour un alias d'un compte plus ancien.

do $$ begin
  if to_regprocedure('public.pl_state()') is null then
    raise exception 'Installe d''abord 028_points_loyaute.sql (le plus simple : tout le fichier install_024_a_034.sql)';
  end if;
end $$;

-- 1. Gains déjà montrés : identifiant du dernier gain du journal des PL vu par le joueur (animation de l'app).
create table if not exists public.pl_seen (
  user_id uuid primary key references auth.users (id) on delete cascade,
  last_id bigint not null default 0,
  at timestamptz not null default now()
);
alter table public.pl_seen enable row level security;
revoke all on public.pl_seen from public, anon, authenticated;
-- À l'installation : les gains d'avant sont déjà vus (pas de pluie d'anciens gains).
insert into public.pl_seen (user_id, last_id)
  select l.user_id, max(l.id) from public.pl_ledger l group by l.user_id
  on conflict (user_id) do nothing;

-- 2. Code de parrainage reçu avec l'inscription (après on_auth_user_created, qui crée le profil : ordre alphabétique).
create or replace function public.pl_signup_parrain() returns trigger
language plpgsql security definer set search_path = '' as $$
declare c text := upper(btrim(coalesce(new.raw_user_meta_data->>'parrain', ''))); par uuid; ps text; s int; n int;
begin
  if c !~ '^[A-Z0-9]{4,12}$' then return new; end if;
  begin
    select x.user_id into par from public.pl_codes x where x.code = c;
    if par is null or par = new.id then return new; end if;
    if not exists (select 1 from public.profiles p where p.id = par and p.status = 'active') then return new; end if;
    s := public._pl_season();
    insert into public.pl_referrals (filleul, parrain, season) values (new.id, par, s) on conflict (filleul) do nothing;
    get diagnostics n = row_count;
    if n = 1 then
      select p.pseudo into ps from public.profiles p where p.id = par;
      perform public._pl_give(new.id, 'welcome_ref', par::text, 50, s, 'Bienvenue, parrainé par ' || coalesce(ps, 'un dresseur'));
    end if;
  exception when others then
    -- L'inscription passe toujours : le code pourra être saisi plus tard (14 premiers jours, « Parrainer un ami »).
    return new;
  end;
  return new;
end; $$;
revoke all on function public.pl_signup_parrain() from public, anon, authenticated;
drop trigger if exists pl_parrain_signup on auth.users;
create trigger pl_parrain_signup after insert on auth.users for each row execute function public.pl_signup_parrain();

-- 3. Invitation (visiteur non connecté) : pseudo du propriétaire d'un code ; null si le code est inconnu.
create or replace function public.pl_invite(code text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('pseudo', p.pseudo)
  from public.pl_codes x join public.profiles p on p.id = x.user_id
  where x.code = upper(btrim(coalesce(pl_invite.code, ''))) and p.status = 'active' and p.pseudo is not null
  limit 1
$$;
revoke all on function public.pl_invite(text) from public;
grant execute on function public.pl_invite(text) to anon, authenticated;

-- 4. Code saisi ou lien ouvert par un joueur connecté : le même parrain une 2ᵉ fois = déjà fait (sans erreur).
create or replace function public.pl_set_parrain(code text) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._pl_begin(); c text := upper(btrim(coalesce(code, ''))); par uuid; cur uuid; born timestamptz; ps text;
  s int := public._pl_season(); g jsonb;
begin
  select x.user_id into par from public.pl_codes x where x.code = c;
  select r.parrain into cur from public.pl_referrals r where r.filleul = uid;
  if cur is not null then
    if cur = par then
      select p.pseudo into ps from public.profiles p where p.id = par;
      return jsonb_build_object('ok', true, 'already', true, 'parrain', ps, 'pl', 0);
    end if;
    raise exception 'Tu as déjà un parrain' using errcode = 'P0001';
  end if;
  select u.created_at into born from auth.users u where u.id = uid;
  if born <= now() - interval '14 days' then raise exception 'Le parrainage se fait dans les 14 jours qui suivent la création du compte' using errcode = 'P0001'; end if;
  if par is null then raise exception 'Code de parrainage inconnu' using errcode = 'P0001'; end if;
  if par = uid then raise exception 'Tu ne peux pas être ton propre parrain' using errcode = 'P0001'; end if;
  if not exists (select 1 from public.profiles p where p.id = par and p.status = 'active') then raise exception 'Code de parrainage inconnu' using errcode = 'P0001'; end if;
  if exists (select 1 from public.pl_referrals r where r.filleul = par and r.parrain = uid) then
    raise exception 'Ce dresseur est déjà ton filleul' using errcode = 'P0001';
  end if;
  insert into public.pl_referrals (filleul, parrain, season) values (uid, par, s);
  select p.pseudo into ps from public.profiles p where p.id = par;
  g := public._pl_give(uid, 'welcome_ref', par::text, 50, s, 'Bienvenue, parrainé par ' || coalesce(ps, 'un dresseur'));
  return jsonb_build_object('ok', true, 'parrain', ps, 'pl', coalesce((g->>'pl')::int, 0));
end; $$;
revoke all on function public.pl_set_parrain(text) from public, anon;
grant execute on function public.pl_set_parrain(text) to authenticated;

-- 5. Où en est un filleul des conditions (adresse validée, jours d'ouverture dans ses 14 premiers jours).
create or replace function public._pl_ref_progress(f uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare conf timestamptz; born timestamptz; a date; t date := public._pl_day(now()); d int;
begin
  select u.email_confirmed_at, u.created_at into conf, born from auth.users u where u.id = f;
  if born is null then return null; end if;
  a := public._pl_day(born);
  select count(*) into d from public._pl_days(f, a, a + 13, t <= a + 13 and f = auth.uid());
  return jsonb_build_object('verified', conf is not null, 'days', least(d, 3), 'need', 3, 'since', a, 'until', a + 13, 'open', t <= a + 13);
end; $$;
revoke all on function public._pl_ref_progress(uuid) from public, anon, authenticated;

-- 6. État des PL (page « Parrainer un ami » et « Mes missions ») : gains en attente d'abord, puis l'état ; « new » =
-- tous les gains pas encore montrés.
create or replace function public.pl_state() returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._pl_begin(); s int := public._pl_season(); k record; born timestamptz; ref public.pl_referrals%rowtype;
  pp text; sh text; tries int; seen bigint; top bigint; nw jsonb; me jsonb; fl jsonb;
begin
  perform public._pl_sync(uid);
  select * into k from public._pl_streak(uid, true);
  select u.created_at into born from auth.users u where u.id = uid;
  select * into ref from public.pl_referrals where filleul = uid;
  if found then
    select p.pseudo into pp from public.profiles p where p.id = ref.parrain;
    me := public._pl_ref_progress(uid) || jsonb_build_object('parrain', pp, 'done', ref.qualified_at is not null,
      'counted', ref.counted, 'missed', ref.qualified_at is null and public._pl_day(now()) > public._pl_day(born) + 13
        and coalesce((public._pl_ref_progress(uid)->>'days')::int, 0) < 3);
  end if;
  -- Gains pas encore montrés (positifs) ; tout le journal lu est marqué vu.
  select x.last_id into seen from public.pl_seen x where x.user_id = uid;
  select coalesce(jsonb_agg(jsonb_build_object('kind', l.kind, 'ref', l.ref, 'pl', l.pl, 'note', l.note) order by l.id) filter (where l.pl > 0), '[]'::jsonb), max(l.id)
    into nw, top from public.pl_ledger l where l.user_id = uid and l.id > coalesce(seen, 0);
  if top is not null then
    insert into public.pl_seen (user_id, last_id) values (uid, top)
      on conflict (user_id) do update set last_id = greatest(public.pl_seen.last_id, excluded.last_id), at = now();
  end if;
  -- Mes filleuls (les 30 derniers) : pseudo et avancement, jamais d'e-mail.
  select coalesce(jsonb_agg(x.j order by x.at desc), '[]'::jsonb) into fl from (
    select r.created_at as at, jsonb_build_object(
      'pseudo', coalesce(p.pseudo, 'Nouveau dresseur'), 'at', public._pl_day(r.created_at),
      'state', case when r.counted then 'ok' when r.qualified_at is not null then 'nocount'
                    when public._pl_day(now()) > public._pl_day(u.created_at) + 13 and coalesce((pr.j->>'days')::int, 0) < 3 then 'missed'
                    else 'wait' end,
      'premium', r.premium_at is not null and exists (select 1 from public.pl_ledger l where l.user_id = uid and l.kind = 'referral_premium' and l.ref = r.filleul::text)
    ) || coalesce(pr.j, '{}'::jsonb) as j
    from public.pl_referrals r
    join auth.users u on u.id = r.filleul
    left join public.profiles p on p.id = r.filleul
    cross join lateral (select public._pl_ref_progress(r.filleul) as j) pr
    where r.parrain = uid
    order by r.created_at desc limit 30) x;
  select x.status into sh from public.pl_proofs x where x.user_id = uid and x.season = s order by (x.status = 'ok') desc, x.created_at desc limit 1;
  select count(*) into tries from public.pl_proofs x where x.user_id = uid and x.season = s;
  return jsonb_build_object(
    'season', public._season_at(now()),
    'pl_season', coalesce((select sum(l.pl) from public.pl_ledger l where l.user_id = uid and l.season = s), 0),
    'pl_total', coalesce((select sum(l.pl) from public.pl_ledger l where l.user_id = uid), 0),
    'code', public._pl_code(uid),
    'referrals', jsonb_build_object(
      'season', (select count(*) from public.pl_ledger l where l.user_id = uid and l.kind = 'referral' and l.season = s),
      'cap', 20,
      'pending', (select count(*) from public.pl_referrals r join auth.users u on u.id = r.filleul
                   where r.parrain = uid and r.qualified_at is null and public._pl_day(now()) <= public._pl_day(u.created_at) + 13),
      'total', (select count(*) from public.pl_referrals r where r.parrain = uid and r.counted),
      'all', (select count(*) from public.pl_referrals r where r.parrain = uid),
      'premium', (select count(*) from public.pl_ledger l where l.user_id = uid and l.kind = 'referral_premium')),
    'filleuls', fl,
    'parrain', case when ref.filleul is not null then pp end,
    'me_ref', me,
    'can_set_parrain', ref.filleul is null and born > now() - interval '14 days',
    'social', jsonb_build_object(
      'tiktok', exists (select 1 from public.pl_ledger l where l.user_id = uid and l.kind = 'social' and l.ref = 'tiktok'),
      'instagram', exists (select 1 from public.pl_ledger l where l.user_id = uid and l.kind = 'social' and l.ref = 'instagram'),
      'discord', exists (select 1 from public.pl_ledger l where l.user_id = uid and l.kind = 'social' and l.ref = 'discord')),
    'streak', jsonb_build_object('cur', k.cur, 'best', k.best,
      'done', coalesce((select jsonb_agg(l.ref::int order by l.ref::int) from public.pl_ledger l where l.user_id = uid and l.kind = 'streak' and l.season = s), '[]'::jsonb)),
    'share', jsonb_build_object('status', coalesce(sh, 'todo'), 'tries', tries, 'max', 3),
    'v', 37,
    'new', nw);
end; $$;
revoke all on function public.pl_state() from public, anon;
grant execute on function public.pl_state() to authenticated;

notify pgrst, 'reload schema';

-- ================= 038_recherche_cartes.sql =================
-- 038_recherche_cartes.sql — « Ma vitrine » : chercher une carte ou un dresseur, messages rapides retirés (2026-11-21,
-- porteur).
--
-- Demandes du porteur :
--   « dans ma vitrine, on puisse rechercher par le nom d'une carte ou d'un dresseur directement dans la barre ; si
--     l'utilisateur cherche par exemple un Groudon Star, celui-ci sort et indique quel dresseur propose cette carte à la
--     vente ou par trade ; ensuite on peut mettre en relation les deux joueurs et leur donner rendez-vous sur notre
--     Discord pour réaliser l'échange » ;
--   « tu me supprimes tous les messages rapides ».
--
--   - showcase_offers(ids, lim) : pour tout compte connecté. L'app trouve dans son catalogue les cartes dont le nom
--     correspond à la recherche (le serveur n'a pas les noms) et envoie leurs identifiants (400 au plus) ; le serveur
--     renvoie les exemplaires de vitrine de ces cartes proposés « Pour trade » ou « À vendre » (hors cartes déjà
--     « d'accord »), avec leur dresseur : pseudo, avatar, grade. Jamais l'adresse e-mail, l'âge ni la collection.
--     Mêmes comptes cachés que la recherche des dresseurs (034) : suspendus, sans pseudo, moi-même, moins de 15 ans.
--     Un exemplaire trouvé se demande avec trade_send (033), comme depuis une vitrine : « Je suis intéressé » ou « Je te
--     propose une de mes cartes » ; l'accord (« Ça m'intéresse ») donne rendez-vous aux deux joueurs sur le Discord de
--     Dropicards (dans l'app).
--   - Messages rapides retirés : quick_msg_send et quick_msg_reply refusent (« Les messages rapides ont été retirés ») ;
--     les messages rapides déjà envoyés sont effacés ; « Mes messages » (quick_msg_inbox, quick_msg_state) ne garde que
--     les propositions d'échange et leurs réponses (types interest, offer, answer de 033), qui restent possibles.
-- À installer après 034 (fichier install_024_a_034.sql, qui le contient). Rejouable. Tests : tests/test_038.sql.

do $$ begin
  if to_regprocedure('public.player_search(text,integer)') is null or to_regclass('public.showcase') is null then
    raise exception 'Installe d''abord 033_vitrine.sql et 034_recherche_dresseurs.sql (fichier install_024_a_034.sql)';
  end if;
end $$;

-- 1. Exemplaires proposés d'une liste de cartes.
create or replace function public.showcase_offers(ids text[], lim int default 40) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  top_n int := least(greatest(coalesce(lim, 40), 1), 60);
  want text[];
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  want := (select array_agg(x.c order by x.o) from (
    select c, min(o) as o from unnest(coalesce(ids, '{}'::text[])) with ordinality as u(c, o)
    where c ~ '^[A-Za-z0-9._-]{1,60}$' group by c order by min(o) limit 400) x);
  if want is null then return '[]'::jsonb; end if;
  return coalesce((select jsonb_agg(x.j order by x.ord, x.upd desc, x.sid) from (
    select array_position(want, s.card_id) as ord, s.updated_at as upd, s.id as sid,
      public._trade_snap(s) || jsonb_build_object('deal', s.deal,
        'owner', jsonb_build_object('id', p.id, 'pseudo', p.pseudo, 'avatar', p.avatar, 'grade', public._game_grade(p.id))) as j
    from public.showcase s join public.profiles p on p.id = s.user_id
    where s.card_id = any (want) and (s.for_trade or s.for_sale) and not s.deal and s.user_id <> uid
      and p.status = 'active' and p.pseudo is not null and p.age_range is distinct from 'u15'
    order by 1, 2 desc, 3
    limit top_n) x), '[]'::jsonb);
end; $$;
revoke all on function public.showcase_offers(text[], int) from public, anon;
grant execute on function public.showcase_offers(text[], int) to authenticated;

-- 2. Messages rapides retirés (les propositions d'échange de 033 passent par trade_send et trade_answer).
create or replace function public.quick_msg_send(target uuid, code text) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  raise exception 'Les messages rapides ont été retirés : propose plutôt un échange depuis une vitrine.' using errcode = 'P0001';
end; $$;
revoke all on function public.quick_msg_send(uuid, text) from public, anon;
grant execute on function public.quick_msg_send(uuid, text) to authenticated;

create or replace function public.quick_msg_reply(msg_id bigint, code text) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  raise exception 'Les messages rapides ont été retirés : réponds à une proposition avec ses boutons.' using errcode = 'P0001';
end; $$;
revoke all on function public.quick_msg_reply(bigint, text) from public, anon;
grant execute on function public.quick_msg_reply(bigint, text) to authenticated;

-- Messages rapides déjà envoyés : effacés (les propositions d'échange et leurs réponses restent).
delete from public.quick_messages where kind = 'quick';

-- 3. « Mes messages » : propositions d'échange et réponses seulement.
create or replace function public.quick_msg_state() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  return jsonb_build_object(
    'unread', (select count(*) from public.quick_messages q join public.profiles p on p.id = q.from_id
               where q.to_id = uid and q.read_at is null and q.kind <> 'quick' and p.status = 'active'),
    'left', greatest(0, 10 - (select count(*) from public.quick_messages where from_id = uid and created_at >= (public._game_today()::timestamp) at time zone 'Europe/Paris')),
    'off', exists (select 1 from public.quick_msg_off where user_id = uid),
    'v', 38);
end; $$;
revoke all on function public.quick_msg_state() from public, anon;
grant execute on function public.quick_msg_state() to authenticated;

create or replace function public.quick_msg_inbox(lim int default 30) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid(); n int := least(greatest(coalesce(lim, 30), 1), 100);
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  return jsonb_build_object(
    'off', exists (select 1 from public.quick_msg_off where user_id = uid),
    'unread', (select count(*) from public.quick_messages where to_id = uid and read_at is null and kind <> 'quick'),
    'left', greatest(0, 10 - (select count(*) from public.quick_messages where from_id = uid and created_at >= (public._game_today()::timestamp) at time zone 'Europe/Paris')),
    'trade', true, 'v', 38,
    'items', coalesce((select jsonb_agg(x.j order by x.at desc) from (
      select q.created_at as at, jsonb_build_object('id', q.id, 'code', q.code, 'at', q.created_at, 'read', q.read_at is not null,
        'from', q.from_id, 'pseudo', p.pseudo, 'avatar', p.avatar, 'grade', public._game_grade(q.from_id),
        'kind', q.kind, 'card', q.card, 'offer', q.offer, 'deal', q.deal,
        'replied', (select r.code from public.quick_messages r where r.reply_to = q.id)) as j
      from public.quick_messages q join public.profiles p on p.id = q.from_id
      where q.to_id = uid and q.kind <> 'quick' and p.status = 'active'
      order by q.created_at desc limit n) x), '[]'::jsonb));
end; $$;
revoke all on function public.quick_msg_inbox(int) from public, anon;
grant execute on function public.quick_msg_inbox(int) to authenticated;

-- Fin : l'API de Supabase relit la liste des fonctions (sinon l'app ne les voit qu'au redémarrage).
notify pgrst, 'reload schema';

-- ================= 039_jeux_grades.sql =================
-- 039 : chaque jeu s'ouvre au grade prévu, pour tout le monde (2026-11-23, porteur : « je suis grade Chasseur et j'ai
-- accès à Safari éclair qui n'est dispo qu'à partir du grade Collectionneur, rectifie-moi ça et fais une vérification
-- pour le déblocage de chaque jeu en fonction des grades »). Après 027 (et 016 pour la pièce). Rejouable.
--   - Avant : les comptes « sans délai » (admins, mot de passe des admins, liste safari_free de 027) ouvraient aussi le
--     Safari éclair et la pièce sous leur grade.
--   - Maintenant : « sans délai » retire seulement l'attente entre deux parties. Le grade décide toujours :
--       Booster PK   : tous les grades (24, 20, 12, 8, 6, 4 h) ;
--       Pile ou face : dès Chasseur (24, 12, 8, 6, 4 h) ;
--       Safari éclair : dès Collectionneur (24, 12, 6, 4 h).
--   - Les délais de chaque grade sont remis aux valeurs de l'app (profile.js, PF_GRADES), au cas où ils auraient bougé.
-- Pour essayer le Safari avec un compte admin de grade plus bas : lui offrir le grade dans Studio (requetes_grade.sql).

-- 1. Délais de chaque grade (heures ; 0 = jeu fermé à ce grade).
update public.game_grades g set booster_h = v.b, coin_h = v.c, safari_h = v.s
from (values (0, 24, 0, 0), (1, 20, 24, 0), (2, 12, 12, 24), (3, 8, 8, 12), (4, 6, 6, 6), (5, 4, 4, 4)) as v(i, b, c, s)
where g.i = v.i;

-- 2. État du Safari lu par l'app : « locked » suit le grade seul ; « free » = sans délai.
create or replace function public.safari_state() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid(); last timestamptz; h int; fr boolean;
begin
  if uid is null then raise exception 'Connexion requise' using errcode = '28000'; end if;
  select max(at) into last from public.ledger where user_id = uid and kind = 'safari';
  select safari_h into h from public.game_grades where i = public._game_grade(uid);
  fr := public._safari_free(uid);
  return jsonb_build_object('last', last, 'hours', coalesce(h, 0), 'free', fr, 'locked', coalesce(h, 0) = 0,
    'next', case when last is null or fr or coalesce(h, 0) = 0 then now() else last + make_interval(hours => h) end, 'server_now', now());
end; $$;
revoke all on function public.safari_state() from public, anon;
grant execute on function public.safari_state() to authenticated;
comment on function public.safari_state() is '039 : Safari fermé sous le grade Collectionneur pour tout le monde';

-- 3. Départ d'une partie : même règle que 027, mais le grade passe avant « sans délai ».
create or replace function public.safari_start(req uuid, lvl int) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._game_begin(); gr public.game_grades%rowtype; last timestamptz; ty public.safari_types%rowtype;
  decoys int[]; sp jsonb; rid uuid; old public.safari_rounds%rowtype; pts int[];
begin
  if lvl is null or lvl not between 1 and 3 then raise exception 'Niveau inconnu' using errcode = 'P0001'; end if;
  select * into old from public.safari_rounds sr where sr.user_id = uid and sr.req = safari_start.req;
  if found then
    pts := public._safari_pts(old.lvl);
    return jsonb_build_object('round', old.id, 'kind', old.kind, 'spawns', old.spawns, 'lvl', old.lvl, 'plus', pts[1], 'minus', pts[2], 'server_now', now());
  end if;
  pts := public._safari_pts(lvl);
  select * into gr from public.game_grades where i = public._game_grade(uid);
  select max(at) into last from public.ledger where user_id = uid and kind = 'safari';
  if coalesce(gr.safari_h, 0) = 0 then
    raise exception 'Le Safari éclair s’ouvre au grade Collectionneur' using errcode = 'P0001';
  end if;
  if not public._safari_free(uid) and last is not null and last + make_interval(hours => gr.safari_h) > now() then
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
    -- Vitesse ×2 ou ×3 : la traversée dure 2 ou 3 fois moins longtemps.
    'dur', ((3400 - idx * 38 + floor(public._game_rand() * 300)::int) / pts[3])::int) order by idx)
  into sp from o;
  delete from public.safari_rounds where user_id = uid and finished_at is null;
  insert into public.safari_rounds (user_id, req, kind, spawns, lvl) values (uid, safari_start.req, ty.t, sp, safari_start.lvl) returning id into rid;
  return jsonb_build_object('round', rid, 'kind', ty.t, 'spawns', sp, 'lvl', safari_start.lvl, 'plus', pts[1], 'minus', pts[2], 'server_now', now());
end; $$;
revoke all on function public.safari_start(uuid, int) from public, anon;
grant execute on function public.safari_start(uuid, int) to authenticated;
comment on function public.safari_start(uuid, int) is '039 : Safari fermé sous le grade Collectionneur pour tout le monde';

-- 4. Pile ou face (remplace 016) : fermée à la Recrue pour tout le monde ; « sans délai » (mot de passe des admins)
-- retire seulement l'attente. Gains inchangés : 50 PK une fois sur deux, 100 PK pendant un 2XP PK.
create or replace function public.flip_coin(req uuid) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._game_begin(); gr public.game_grades%rowtype; last timestamptz; won int; m int; r jsonb; free boolean := public._game_free(uid);
begin
  r := public._game_replay(uid, req); if r is not null then return r; end if;
  select * into gr from public.game_grades where i = public._game_grade(uid);
  if coalesce(gr.coin_h, 0) = 0 then raise exception 'Pièce réservée au grade Chasseur et plus' using errcode = 'P0001'; end if;
  select max(at) into last from public.ledger where user_id = uid and kind = 'coin';
  if not free and last is not null and last + make_interval(hours => gr.coin_h) > now() then raise exception 'Pièce pas encore prête' using errcode = 'P0001'; end if;
  won := case when public._game_rand() < 0.5 then 50 else 0 end;
  m := case when public._pk_boost_on(uid) then 2 else 1 end;
  return public._game_move(uid, 'coin', won * m, 0, case when m = 2 and won > 0 then '2XP PK' end, req)
    || jsonb_build_object('won', won * m, 'base', won, 'boost', m = 2, 'win', won > 0, 'next', now() + make_interval(hours => greatest(gr.coin_h, 4)));
end; $$;
revoke all on function public.flip_coin(uuid) from public, anon;
grant execute on function public.flip_coin(uuid) to authenticated;
comment on function public.flip_coin(uuid) is '039 : pièce fermée à la Recrue pour tout le monde';

notify pgrst, 'reload schema';

-- ================= 040_stock_admin.sql =================
-- 040 : les achats directs faits en mode Admin comptent dans le stock (2026-11-25, porteur : « je veux que lorsqu'on
-- achète un booster au PK shop, celui-ci se retire automatiquement du nombre de boosters en stock ; j'en ai acheté un
-- avec mon compte admin et le nombre de boosters dispo est toujours de 10 »). Après 030. Rejouable.
--   - Avant (018, 019, 030) : un achat d'un admin déverrouillé était enregistré à 0 PK et n'était pas compté dans le
--     stock (« achat d'essai »). Maintenant, chaque achat direct (booster, item rare, ETB) retire un article du stock,
--     admin compris, et les achats d'admin déjà faits ce mois-ci comptent dès l'installation.
--   - Stock épuisé : « Épuisé » pour tout le monde, admin compris (choix par défaut, à confirmer par le porteur).
--   - Inchangé pour l'admin : ni PK débités, ni grade demandé, ni limite d'un achat direct par mois.
--   - Rendre au stock des achats d'essai : requetes_boutique.sql (requête 3).
-- Supabase Studio › SQL Editor › New query › colle ce fichier › Run (ou install_024_a_034.sql, qui le contient).

-- 1. Achat (remplace 019) : le stock compte tous les achats directs de la période, admin compris.
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
    -- Le stock verrouillé le temps de l'achat : deux joueurs ne peuvent pas prendre le dernier article en même temps.
    select * into st from public.shop_stock where item = it.id for update;
    if found then
      if not free and exists (select 1 from public.tickets t join public.game_items i on i.id = t.item
          where t.user_id = uid and i.kind = 'lot' and t.cost_pk > 0 and t.bought_at >= public._shop_month_start(now())) then
        raise exception 'Tu as déjà fait ton achat du mois : prochain achat possible %', public._shop_when(public._shop_period_end(now(), 1)) using errcode = 'P0001';
      end if;
      select count(*) into used from public.tickets where item = it.id and bought_at >= public._shop_period(now(), st.months);
      if used >= st.qty then
        raise exception 'Épuisé : retour %', public._shop_when(public._shop_period_end(now(), st.months)) using errcode = 'P0001';
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

-- 2. État du PK shop (remplace 030) : stock restant = stock moins tous les achats directs de la période, admin compris.
create or replace function public.shop_state() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid(); m timestamptz := public._shop_month_start(now()); nd timestamptz := public._game_next_draw(now());
  mb jsonb; stock jsonb; prizes jsonb; mine jsonb; redo jsonb;
begin
  if uid is null then raise exception 'Connexion requise' using errcode = '28000'; end if;
  select jsonb_build_object('item', t.item, 'at', t.bought_at) into mb from public.tickets t join public.game_items i on i.id = t.item
    where t.user_id = uid and i.kind = 'lot' and t.cost_pk > 0 and t.bought_at >= m order by t.bought_at desc limit 1;
  select jsonb_object_agg(s.item, jsonb_build_object('total', s.qty, 'months', s.months, 'restock', public._shop_period_end(now(), s.months),
      'left', greatest(0, s.qty - (select count(*)::int from public.tickets t where t.item = s.item and t.bought_at >= public._shop_period(now(), s.months)))))
    into stock from public.shop_stock s;
  select jsonb_object_agg(x.item, x.cards) into prizes from (
    select p.item, jsonb_agg(jsonb_build_object('id', p.card, 'name', p.name, 'info', p.info, 'img', p.img) order by p.id) as cards
    from public.draw_prizes p where p.draw_at = nd group by p.item) x;
  select jsonb_object_agg(y.item, y.picks) into mine from (
    select t.item, jsonb_object_agg(t.choice, t.n) as picks
    from (select item, choice, count(*) as n from public.tickets where user_id = uid and draw_at = nd and choice is not null group by item, choice) t
    group by t.item) y;
  select jsonb_agg(distinct t.item) into redo from public.tickets t where t.user_id = uid and t.draw_at = nd and t.choice is null;
  return jsonb_build_object('server_now', now(), 'month_start', m, 'next_month', public._shop_period_end(now(), 1), 'draw_at', nd, 'draw_lots', 1,
    'stock', coalesce(stock, '{}'::jsonb), 'month_buy', mb, 'prizes', coalesce(prizes, '{}'::jsonb), 'mine', coalesce(mine, '{}'::jsonb),
    'redo', coalesce(redo, '[]'::jsonb));
end; $$;
revoke all on function public.shop_state() from public, anon;
grant execute on function public.shop_state() to authenticated;
-- Repère lu par 000_verifier.sql.
comment on function public.shop_state() is '040 : stock du PK shop, achats des admins compris';

notify pgrst, 'reload schema';

-- ================= 041_messages_modifier.sql =================
-- 041_messages_modifier.sql — « Mes messages » : messages envoyés, modifier ou supprimer un message (2026-11-25,
-- porteur : « dans l'endroit où on envoie les messages, on ait la possibilité de supprimer un message ou bien de le
-- modifier »).
--
-- Jusqu'ici, « Mes messages » ne montrait que les messages reçus : celui qui envoyait une proposition d'échange ne la
-- retrouvait nulle part. Ce script ajoute :
--   - quick_msg_sent(lim) : mes messages envoyés (propositions « Je suis intéressé » ou « Je te propose une de mes
--     cartes », et mes réponses), avec le dresseur qui les reçoit, s'il les a vus, sa réponse et « Modifié » ;
--   - trade_edit(msg_id, kind, offer_sid) : modifier une proposition tant que l'autre joueur n'a pas répondu (passer de
--     « Je suis intéressé » à « Je te propose une de mes cartes », ou changer la carte proposée) ; 5 fois au plus par
--     message ; le message redevient « non lu » chez l'autre joueur, avec la mention « Modifié » ;
--   - trade_answer_edit(msg_id, code) : changer ma réponse à une proposition reçue (« Ça m'intéresse », « Non merci »,
--     « Plus disponible ») ; passer à « Ça m'intéresse » réserve les cartes (comme trade_answer de 033), quitter
--     « Ça m'intéresse » les libère ; 5 fois au plus ;
--   - trade_delete(msg_id) : supprimer un message.
--       · Ma proposition sans réponse : retirée pour les deux joueurs (elle compte toujours dans mes 10 messages du
--         jour, pour qu'on ne puisse pas envoyer, supprimer et renvoyer sans fin).
--       · Ma proposition qui a déjà une réponse : retirée de ma liste seulement (l'autre joueur garde la sienne).
--       · Ma réponse : retirée pour les deux ; la proposition redevient « sans réponse » ; un accord est annulé et les
--         cartes réservées sont libérées.
--       · Un message reçu : retiré de ma liste seulement.
--   - quick_msg_inbox et quick_msg_state : sans les messages retirés ; « edited » sur chaque message modifié ;
--     trade_send et trade_answer de 033 : une proposition retirée ne bloque plus une nouvelle proposition et ne peut
--     plus recevoir de réponse.
-- Toujours aucun texte libre : seulement les messages tout faits et les cartes de vitrine (comme 033).
-- À installer après 038 (fichier install_024_a_034.sql, qui le contient). Rejouable. Tests : tests/test_041.sql.

do $$ begin
  if to_regprocedure('public.showcase_offers(text[],integer)') is null or to_regprocedure('public.trade_answer(bigint,text)') is null then
    raise exception 'Installe d''abord 033_vitrine.sql et 038_recherche_cartes.sql (fichier install_024_a_034.sql)';
  end if;
end $$;

-- 1. Colonnes : modifié (date, nombre), retiré pour les deux, caché chez l'expéditeur, caché chez le destinataire.
alter table public.quick_messages add column if not exists edited_at timestamptz;
alter table public.quick_messages add column if not exists edits int not null default 0;
alter table public.quick_messages add column if not exists withdrawn_at timestamptz;
alter table public.quick_messages add column if not exists hidden_from boolean not null default false;
alter table public.quick_messages add column if not exists hidden_to boolean not null default false;

-- 2. Libérer les cartes d'un accord annulé (proposition msg et sa réponse ans) : seulement celles qu'aucun autre accord
-- ne réserve.
create or replace function public._trade_unreserve(msg bigint, ans bigint) returns void
language plpgsql volatile security definer set search_path = '' as $$
declare m public.quick_messages%rowtype; sids bigint[];
begin
  select * into m from public.quick_messages where id = msg;
  if not found then return; end if;
  sids := array_remove(array[(m.card->>'sid')::bigint, (m.offer->>'sid')::bigint], null);
  update public.showcase s set deal = false, updated_at = now()
  where s.id = any (sids) and s.deal
    and not exists (select 1 from public.quick_messages q where q.deal and q.kind in ('interest', 'offer') and q.id <> msg and q.withdrawn_at is null
                    and ((q.card->>'sid')::bigint = s.id or (q.offer->>'sid')::bigint = s.id));
  update public.quick_messages set deal = false where id in (msg, ans);
end; $$;
revoke all on function public._trade_unreserve(bigint, bigint) from public, anon, authenticated;

-- 3. trade_send (033) : une proposition retirée ne compte plus comme « en attente de réponse ».
create or replace function public.trade_send(target uuid, kind text, card_sid bigint, offer_sid bigint default null) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := auth.uid(); c public.showcase%rowtype; o public.showcase%rowtype; k text := kind;
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  if k not in ('interest', 'offer') then raise exception 'Choisis un des messages proposés.' using errcode = 'P0001'; end if;
  if not public._trade_age_ok(uid) then raise exception 'Les échanges sont ouverts à partir de 15 ans.' using errcode = 'P0001'; end if;
  select * into c from public.showcase where id = card_sid and user_id = target;
  if not found or c.deal or not (c.for_trade or c.for_sale) then raise exception 'Cette carte n''est plus disponible.' using errcode = 'P0001'; end if;
  if k = 'offer' then
    if not c.for_trade then raise exception 'Cette carte n''est pas proposée à l''échange.' using errcode = 'P0001'; end if;
    select * into o from public.showcase where id = offer_sid and user_id = uid;
    if not found or o.deal or not o.for_trade then raise exception 'Choisis une de tes cartes Pour trade.' using errcode = 'P0001'; end if;
  end if;
  if exists (select 1 from public.quick_messages q where q.from_id = uid and q.to_id = target and q.kind in ('interest', 'offer') and q.withdrawn_at is null
             and (q.card->>'sid')::bigint = card_sid and not exists (select 1 from public.quick_messages r where r.reply_to = q.id)) then
    raise exception 'Tu as déjà fait une proposition pour cette carte : attends sa réponse, ou modifie-la dans « Mes messages ».' using errcode = 'P0001';
  end if;
  return public._quick_msg_put2(uid, target, k, null, k, public._trade_snap(c), case when k = 'offer' then public._trade_snap(o) end);
end; $$;
revoke all on function public.trade_send(uuid, text, bigint, bigint) from public, anon;
grant execute on function public.trade_send(uuid, text, bigint, bigint) to authenticated;

-- 4. trade_answer (033) : jamais de réponse à une proposition retirée.
create or replace function public.trade_answer(msg_id bigint, code text) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := auth.uid(); m public.quick_messages%rowtype; r jsonb; sids bigint[];
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  if code not in ('deal_yes', 'deal_no', 'gone') then raise exception 'Choisis un des messages proposés.' using errcode = 'P0001'; end if;
  if not public._trade_age_ok(uid) then raise exception 'Les échanges sont ouverts à partir de 15 ans.' using errcode = 'P0001'; end if;
  select * into m from public.quick_messages where id = msg_id and to_id = uid and kind in ('interest', 'offer') and withdrawn_at is null;
  if not found then raise exception 'Proposition introuvable : elle a peut-être été retirée.' using errcode = 'P0001'; end if;
  perform pg_advisory_xact_lock(hashtext('trade_msg:' || msg_id::text));
  if exists (select 1 from public.quick_messages where reply_to = msg_id) then raise exception 'Tu as déjà répondu à cette proposition.' using errcode = 'P0001'; end if;
  if code = 'deal_yes' then
    sids := array_remove(array[(m.card->>'sid')::bigint, (m.offer->>'sid')::bigint], null);
    if not exists (select 1 from public.showcase where id = (m.card->>'sid')::bigint and user_id = uid and not deal and (for_trade or for_sale))
       or (m.offer is not null and not exists (select 1 from public.showcase where id = (m.offer->>'sid')::bigint and user_id = m.from_id and not deal and for_trade)) then
      raise exception 'Une des cartes n''est plus disponible.' using errcode = 'P0001';
    end if;
  end if;
  r := public._quick_msg_put2(uid, m.from_id, code, msg_id, 'answer', m.card, m.offer);
  if code = 'deal_yes' then
    update public.showcase set deal = true, updated_at = now() where id = any (sids);
    update public.quick_messages set deal = true where id in (msg_id, (r->>'id')::bigint);
  end if;
  return r || jsonb_build_object('deal', code = 'deal_yes');
end; $$;
revoke all on function public.trade_answer(bigint, text) from public, anon;
grant execute on function public.trade_answer(bigint, text) to authenticated;

-- 5. Modifier ma proposition (sans réponse) : type et carte proposée ; la carte demandée reste la même.
create or replace function public.trade_edit(msg_id bigint, kind text, offer_sid bigint default null) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := auth.uid(); m public.quick_messages%rowtype; c public.showcase%rowtype; o public.showcase%rowtype; k text := kind;
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  if k not in ('interest', 'offer') then raise exception 'Choisis un des messages proposés.' using errcode = 'P0001'; end if;
  if not public._trade_age_ok(uid) then raise exception 'Les échanges sont ouverts à partir de 15 ans.' using errcode = 'P0001'; end if;
  if exists (select 1 from public.profiles where id = uid and status <> 'active') then raise exception 'Compte suspendu.' using errcode = '42501'; end if;
  perform pg_advisory_xact_lock(hashtext('trade_msg:' || msg_id::text));
  select * into m from public.quick_messages q where q.id = msg_id and q.from_id = uid and q.kind in ('interest', 'offer') and q.withdrawn_at is null and not q.hidden_from;
  if not found then raise exception 'Message introuvable.' using errcode = 'P0001'; end if;
  if exists (select 1 from public.quick_messages r where r.reply_to = msg_id) then
    raise exception 'Il a déjà répondu : ce message ne peut plus être modifié.' using errcode = 'P0001';
  end if;
  if m.edits >= 5 then raise exception 'Tu as déjà modifié ce message 5 fois.' using errcode = 'P0001'; end if;
  select * into c from public.showcase where id = (m.card->>'sid')::bigint and user_id = m.to_id;
  if not found or c.deal or not (c.for_trade or c.for_sale) then raise exception 'Cette carte n''est plus disponible.' using errcode = 'P0001'; end if;
  if k = 'offer' then
    if not c.for_trade then raise exception 'Cette carte n''est pas proposée à l''échange.' using errcode = 'P0001'; end if;
    select * into o from public.showcase where id = offer_sid and user_id = uid;
    if not found or o.deal or not o.for_trade then raise exception 'Choisis une de tes cartes Pour trade.' using errcode = 'P0001'; end if;
  end if;
  if k = m.kind and coalesce((m.offer->>'sid')::bigint, 0) = coalesce(case when k = 'offer' then o.id end, 0) then
    return jsonb_build_object('ok', true, 'id', m.id, 'same', true, 'edits', m.edits);
  end if;
  update public.quick_messages q set kind = k, code = k, card = public._trade_snap(c), offer = case when k = 'offer' then public._trade_snap(o) end,
    edited_at = now(), edits = q.edits + 1, read_at = null
  where q.id = msg_id;
  return jsonb_build_object('ok', true, 'id', m.id, 'edits', m.edits + 1);
end; $$;
revoke all on function public.trade_edit(bigint, text, bigint) from public, anon;
grant execute on function public.trade_edit(bigint, text, bigint) to authenticated;

-- 6. Changer ma réponse à une proposition reçue.
create or replace function public.trade_answer_edit(msg_id bigint, code text) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := auth.uid(); m public.quick_messages%rowtype; a public.quick_messages%rowtype; sids bigint[]; c text := code;
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  if c not in ('deal_yes', 'deal_no', 'gone') then raise exception 'Choisis un des messages proposés.' using errcode = 'P0001'; end if;
  if not public._trade_age_ok(uid) then raise exception 'Les échanges sont ouverts à partir de 15 ans.' using errcode = 'P0001'; end if;
  perform pg_advisory_xact_lock(hashtext('trade_msg:' || msg_id::text));
  select * into m from public.quick_messages q where q.id = msg_id and q.to_id = uid and q.kind in ('interest', 'offer') and q.withdrawn_at is null;
  if not found then raise exception 'Proposition introuvable : elle a peut-être été retirée.' using errcode = 'P0001'; end if;
  select * into a from public.quick_messages q where q.reply_to = msg_id and q.from_id = uid;
  if not found then raise exception 'Tu n''as pas encore répondu à cette proposition.' using errcode = 'P0001'; end if;
  if a.code = c then return jsonb_build_object('ok', true, 'id', a.id, 'same', true, 'deal', c = 'deal_yes'); end if;
  if a.edits >= 5 then raise exception 'Tu as déjà modifié ta réponse 5 fois.' using errcode = 'P0001'; end if;
  if a.code = 'deal_yes' then perform public._trade_unreserve(msg_id, a.id); end if;
  if c = 'deal_yes' then
    sids := array_remove(array[(m.card->>'sid')::bigint, (m.offer->>'sid')::bigint], null);
    if not exists (select 1 from public.showcase where id = (m.card->>'sid')::bigint and user_id = uid and not deal and (for_trade or for_sale))
       or (m.offer is not null and not exists (select 1 from public.showcase where id = (m.offer->>'sid')::bigint and user_id = m.from_id and not deal and for_trade)) then
      raise exception 'Une des cartes n''est plus disponible.' using errcode = 'P0001';
    end if;
    update public.showcase set deal = true, updated_at = now() where id = any (sids);
  end if;
  update public.quick_messages q set code = c, deal = (c = 'deal_yes'), edited_at = now(), edits = q.edits + 1, read_at = null, hidden_to = false where q.id = a.id;
  update public.quick_messages q set deal = (c = 'deal_yes') where q.id = msg_id;
  return jsonb_build_object('ok', true, 'id', a.id, 'deal', c = 'deal_yes', 'edits', a.edits + 1);
end; $$;
revoke all on function public.trade_answer_edit(bigint, text) from public, anon;
grant execute on function public.trade_answer_edit(bigint, text) to authenticated;

-- 7. Supprimer un message (voir l'en-tête).
create or replace function public.trade_delete(msg_id bigint) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := auth.uid(); m public.quick_messages%rowtype;
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  perform pg_advisory_xact_lock(hashtext('trade_msg:' || msg_id::text));
  select * into m from public.quick_messages where id = msg_id and (from_id = uid or to_id = uid) and kind <> 'quick' and withdrawn_at is null;
  if not found then raise exception 'Message introuvable.' using errcode = 'P0001'; end if;
  if m.from_id = uid and m.kind in ('interest', 'offer') then
    if exists (select 1 from public.quick_messages where reply_to = msg_id) then
      update public.quick_messages set hidden_from = true where id = msg_id;
      return jsonb_build_object('ok', true, 'removed', 'me');
    end if;
    update public.quick_messages set withdrawn_at = now(), deal = false where id = msg_id;
    return jsonb_build_object('ok', true, 'removed', 'both');
  end if;
  if m.from_id = uid and m.kind = 'answer' then
    if m.code = 'deal_yes' and m.reply_to is not null then perform public._trade_unreserve(m.reply_to, m.id); end if;
    delete from public.quick_messages where id = msg_id;
    return jsonb_build_object('ok', true, 'removed', 'both', 'answer', true);
  end if;
  update public.quick_messages set hidden_to = true, read_at = coalesce(read_at, now()) where id = msg_id;
  return jsonb_build_object('ok', true, 'removed', 'me');
end; $$;
revoke all on function public.trade_delete(bigint) from public, anon;
grant execute on function public.trade_delete(bigint) to authenticated;

-- 8. Mes messages envoyés.
create or replace function public.quick_msg_sent(lim int default 30) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid(); n int := least(greatest(coalesce(lim, 30), 1), 100);
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  return jsonb_build_object('v', 41,
    'items', coalesce((select jsonb_agg(x.j order by x.at desc) from (
      select q.created_at as at, jsonb_build_object('id', q.id, 'code', q.code, 'at', q.created_at, 'kind', q.kind,
        'to', q.to_id, 'pseudo', p.pseudo, 'avatar', p.avatar, 'grade', public._game_grade(q.to_id),
        'card', q.card, 'offer', q.offer, 'deal', q.deal, 'seen', q.read_at is not null and not q.hidden_to,
        'edited', q.edited_at is not null, 'edits_left', greatest(0, 5 - q.edits), 'reply_to', q.reply_to,
        'answer', (select r.code from public.quick_messages r where r.reply_to = q.id),
        'answer_edited', (select r.edited_at is not null from public.quick_messages r where r.reply_to = q.id)) as j
      from public.quick_messages q join public.profiles p on p.id = q.to_id
      where q.from_id = uid and q.kind in ('interest', 'offer', 'answer') and q.withdrawn_at is null and not q.hidden_from
      order by q.created_at desc limit n) x), '[]'::jsonb));
end; $$;
revoke all on function public.quick_msg_sent(int) from public, anon;
grant execute on function public.quick_msg_sent(int) to authenticated;

-- 9. « Mes messages » (038) : sans les messages retirés ou supprimés de ma liste ; « edited » et « replied_edited ».
create or replace function public.quick_msg_state() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  return jsonb_build_object(
    'unread', (select count(*) from public.quick_messages q join public.profiles p on p.id = q.from_id
               where q.to_id = uid and q.read_at is null and q.kind <> 'quick' and q.withdrawn_at is null and not q.hidden_to and p.status = 'active'),
    'left', greatest(0, 10 - (select count(*) from public.quick_messages where from_id = uid and created_at >= (public._game_today()::timestamp) at time zone 'Europe/Paris')),
    'off', exists (select 1 from public.quick_msg_off where user_id = uid),
    'v', 41);
end; $$;
revoke all on function public.quick_msg_state() from public, anon;
grant execute on function public.quick_msg_state() to authenticated;

create or replace function public.quick_msg_inbox(lim int default 30) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid(); n int := least(greatest(coalesce(lim, 30), 1), 100);
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  return jsonb_build_object(
    'off', exists (select 1 from public.quick_msg_off where user_id = uid),
    'unread', (select count(*) from public.quick_messages where to_id = uid and read_at is null and kind <> 'quick' and withdrawn_at is null and not hidden_to),
    'left', greatest(0, 10 - (select count(*) from public.quick_messages where from_id = uid and created_at >= (public._game_today()::timestamp) at time zone 'Europe/Paris')),
    'trade', true, 'v', 41,
    'items', coalesce((select jsonb_agg(x.j order by x.at desc) from (
      select q.created_at as at, jsonb_build_object('id', q.id, 'code', q.code, 'at', q.created_at, 'read', q.read_at is not null,
        'from', q.from_id, 'pseudo', p.pseudo, 'avatar', p.avatar, 'grade', public._game_grade(q.from_id),
        'kind', q.kind, 'card', q.card, 'offer', q.offer, 'deal', q.deal, 'edited', q.edited_at is not null,
        'replied', (select r.code from public.quick_messages r where r.reply_to = q.id),
        'replied_edits_left', (select greatest(0, 5 - r.edits) from public.quick_messages r where r.reply_to = q.id)) as j
      from public.quick_messages q join public.profiles p on p.id = q.from_id
      where q.to_id = uid and q.kind <> 'quick' and q.withdrawn_at is null and not q.hidden_to and p.status = 'active'
      order by q.created_at desc limit n) x), '[]'::jsonb));
end; $$;
revoke all on function public.quick_msg_inbox(int) from public, anon;
grant execute on function public.quick_msg_inbox(int) to authenticated;

-- Repère pour 000_verifier.sql.
comment on function public.quick_msg_sent(int) is '041 : messages envoyés, modifier ou supprimer un message';

-- Fin : l'API de Supabase relit la liste des fonctions (sinon l'app ne les voit qu'au redémarrage).
notify pgrst, 'reload schema';

-- ================= 042_shop_bientot.sql =================
-- 042_shop_bientot.sql — PK shop : booster à 10 000 PK, item rare et ETB « Bientôt disponible » (2026-11-25, porteur :
-- « pour les boosters, remets à 10 le nombre de dispos et monte le prix à 10 000 PK ; remplace "Épuisé" sur l'item rare
-- au choix et l'ETB 30 ans par "Bientôt disponible" »).
--
--   - Booster de la série du moment : 10 000 PK (7 500 avant). buy_item prend toujours le prix de cette table.
--   - Item rare au choix et ETB 30 ans fermés (active = false) : buy_item les refuse (« Article indisponible ») ; l'app
--     affiche « Bientôt disponible » à la place du stock et de « Épuisé ».
--   - Stock du booster remis à 10 : voir requetes_boutique.sql, requête 4 (achats d'essai faits en mode Admin rendus au
--     stock). Ce script ne touche à aucun achat.
-- Rouvrir l'item rare ou l'ETB plus tard : requetes_boutique.sql, requête 5 (et retirer « soon » dans l'app).
-- À installer après 040 (fichier install_024_a_034.sql, qui le contient). Rejouable. Tests : tests/test_042.sql.

do $$ begin
  if to_regclass('public.shop_stock') is null or to_regclass('public.game_items') is null then
    raise exception 'Installe d''abord 018_lots_limites.sql et 040_stock_admin.sql';
  end if;
end $$;

update public.game_items set price_pk = 10000 where id = 'achat-booster';
update public.game_items set active = false where id in ('achat-rare', 'achat-etb-30');

-- Repère lu par 000_verifier.sql.
comment on table public.game_items is '042 : booster 10 000 PK, item rare et ETB bientôt disponibles';

notify pgrst, 'reload schema';

-- ================= 043_mail_joueur_lot.sql =================
-- 043_mail_joueur_lot.sql — e-mail de félicitations au JOUEUR après un achat direct au PK shop (2026-11-25, porteur :
-- « lorsque l'utilisateur arrive à acheter un booster direct à 10 000 PK ou un autre item du PK shop comme l'item rare
-- ou l'ETB, qu'il reçoive automatiquement un mail de félicitations sur sa boîte mail, en remontrant le lot acheté et en
-- lui demandant son nom, prénom, adresse, code postal, adresse mail et numéro de téléphone, à renvoyer à l'adresse mail
-- de Dropicards pour qu'on puisse lui envoyer »).
--
--   - Achats directs seulement (articles de type « lot » : booster, item rare, ETB) ; jamais les tickets des tirages.
--   - La fonction « notify » du serveur (tools/supabase/functions/notify) lit la liste (shop_player_pending), envoie
--     l'e-mail à l'adresse du compte du joueur avec Brevo, puis marque l'achat (shop_player_mark_sent) : un e-mail par
--     achat, jamais deux ; un envoi raté repart au prochain achat (de n'importe quel joueur).
--   - Seuls les achats faits après l'installation de 043 reçoivent l'e-mail (pas l'historique).
--   - Achats faits en mode Admin compris : l'admin reçoit le même e-mail (pratique pour voir à quoi il ressemble).
--   - Lecture et écriture réservées au serveur (clé service_role) : un joueur n'y a pas accès.
-- À installer après 012 (Supabase Studio › SQL Editor › New query › colle ce fichier › Run). Rejouable.
-- Tests : tests/test_043.sql. Guide : docs/30 § 9.

do $$ begin
  if to_regclass('public.shop_notices') is null then
    raise exception 'Installe d''abord 012_shop_notices.sql';
  end if;
end $$;

create table if not exists public.shop_player_mails (
  ticket_id uuid primary key references public.tickets (id) on delete cascade,
  sent_at timestamptz not null default now()
);
alter table public.shop_player_mails enable row level security;
revoke all on public.shop_player_mails from anon, authenticated;

create table if not exists public.shop_player_mail_start (
  k int primary key default 1 check (k = 1),
  since timestamptz not null default now()
);
alter table public.shop_player_mail_start enable row level security;
revoke all on public.shop_player_mail_start from anon, authenticated;
insert into public.shop_player_mail_start (k) values (1) on conflict (k) do nothing;

-- Achats directs dont le joueur n'a pas encore reçu l'e-mail, du plus ancien au plus récent (50 au plus par envoi).
-- price_pk : prix de l'article (pour un achat fait en mode Admin, enregistré à 0 PK, l'e-mail montre le vrai prix).
create or replace function public.shop_player_pending(lim int default 20) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(x order by x->>'bought_at'), '[]'::jsonb) from (
    select jsonb_build_object('id', t.id, 'item', t.item, 'label', i.label, 'cost_pk', t.cost_pk, 'price_pk', i.price_pk,
      'choice', t.choice, 'bought_at', t.bought_at, 'user_id', t.user_id, 'email', u.email::text, 'pseudo', p.pseudo) as x
    from public.tickets t
    join auth.users u on u.id = t.user_id
    join public.game_items i on i.id = t.item
    left join public.profiles p on p.id = t.user_id
    where i.kind = 'lot'
      and coalesce(u.email, '') <> ''
      and not exists (select 1 from public.shop_player_mails m where m.ticket_id = t.id)
      and t.bought_at >= (select since from public.shop_player_mail_start where k = 1)
    order by t.bought_at
    limit greatest(1, least(coalesce(lim, 20), 50))
  ) s;
$$;

-- Achats dont l'e-mail est parti (après l'envoi réussi).
create or replace function public.shop_player_mark_sent(ids uuid[]) returns int
language plpgsql volatile security definer set search_path = '' as $$
declare n int;
begin
  insert into public.shop_player_mails (ticket_id) select distinct x from unnest(coalesce(ids, '{}'::uuid[])) as x
    where exists (select 1 from public.tickets t where t.id = x)
  on conflict (ticket_id) do nothing;
  get diagnostics n = row_count;
  return n;
end; $$;

revoke all on function public.shop_player_pending(int), public.shop_player_mark_sent(uuid[]) from public, anon, authenticated;
grant execute on function public.shop_player_pending(int), public.shop_player_mark_sent(uuid[]) to service_role;

-- Repère lu par 000_verifier.sql.
comment on table public.shop_player_mails is '043 : e-mail de félicitations au joueur après un achat direct';

notify pgrst, 'reload schema';

-- ================= 044_safari_delai.sql =================
-- 044_safari_delai.sql — Safari éclair : une partie toutes les X heures selon le grade, pour TOUS les comptes
-- (2026-11-26, porteur : « pour le Safari éclair, mets bien le délai en rapport avec les grades ; actuellement je suis
-- Collectionneur et j'ai joué autant de fois que je voulais ; mets la limite à 1 fois toutes les X heures en fonction du
-- grade actuel »).
--
--   - Cause : depuis 027 (2026-11-13), les comptes admin, le mode Admin (mot de passe des admins) et les comptes de la
--     liste safari_free jouaient au Safari sans délai.
--   - Désormais, plus aucune exception : Collectionneur 1 partie toutes les 24 h, Dresseur Pokémon 12 h, Maître Pokémon
--     6 h, Grand maître Pokémon 4 h ; fermé à la Recrue et au Chasseur (inchangé, 039). Admins et liste safari_free
--     compris. La table safari_free est gardée (rien d'effacé) mais n'est plus lue.
--   - safari_state, safari_start et safari_finish (027, 039) demandent tous « _safari_free » : il répond toujours
--     « non », donc le délai du grade s'applique partout, et les rappels « Safari éclair prêt » (036) partent aussi.
--   - Booster PK et pièce : inchangés (le mode Admin garde leurs parties sans délai).
-- À installer après 039 (Supabase Studio › SQL Editor › New query › colle ce fichier › Run). Rejouable.
-- Revenir en arrière (sans délai pour les admins et la liste) : relancer 027_safari_libre.sql puis 039_jeux_grades.sql.
-- Tests : tests/test_044.sql.

do $$ begin
  if to_regprocedure('public._safari_free(uuid)') is null or to_regprocedure('public.safari_start(uuid,integer)') is null then
    raise exception 'Installe d''abord 027_safari_libre.sql et 039_jeux_grades.sql';
  end if;
end $$;

create or replace function public._safari_free(uid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select false;
$$;
revoke all on function public._safari_free(uuid) from public, anon, authenticated;

-- Repère lu par 000_verifier.sql.
comment on function public._safari_free(uuid) is '044 : Safari éclair au délai du grade pour tous, sans exception';

notify pgrst, 'reload schema';

-- Fin : l'API de Supabase relit la liste des fonctions (sinon l'app ne les voit qu'au redémarrage).
notify pgrst, 'reload schema';
