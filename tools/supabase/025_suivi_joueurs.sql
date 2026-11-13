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
