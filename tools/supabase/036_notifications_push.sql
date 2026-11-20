-- 036 : notifications envoyées par le serveur, même app fermée (Web Push ; 2026-11-20, porteur : « je veux que
-- l'utilisateur reçoive une notif sur son téléphone dès que les jeux (booster, pièce ou safari) sont de nouveau
-- disponibles », « une notif après 72 h sans avoir ouvert l'appli et une autre après 1 semaine »). Après 027 (Safari) et
-- 025 (temps passé dans l'app). Rejouable (Studio › SQL Editor › Run). Guide : docs/46.
--   - push_subs : l'« adresse d'envoi » que le navigateur donne quand le joueur autorise les notifications (une par
--     appareil, 5 au plus par compte), effacée avec le compte, ou dès que le service du navigateur la refuse.
--   - push_prefs : copie sur le serveur des cases de Mon profil › Notifications (PA du jour, Booster PK, pièce, Safari
--     éclair, sorties et boutiques). Les relances d'absence (3 jours, 1 semaine) ne sont pas réglables dans l'app
--     (porteur) : le réglage des notifications du téléphone les coupe, comme tout le reste.
--   - push_sent : chaque rappel envoyé (compte, sorte, cycle) ; un même rappel ne part jamais deux fois.
--   - push_keys : la paire de clés VAPID (Web Push), créée toute seule par la fonction « push » au premier passage.
--   - Règles (push_due) : rien entre 22 h et 9 h (heure de Paris), ce qui devient prêt la nuit part à 9 h ; jeu prêt =
--     dernière partie + délai du grade (game_grades), une fois par partie ; PA du jour à partir de 10 h, seulement pour
--     un joueur venu dans les 3 derniers jours ; relance après 72 h puis après 7 jours sans ouvrir l'app, une seule fois
--     par absence, entre 17 h et 20 h, plus rien après 30 jours ; au plus 6 notifications par jour et par compte.
--   - Passage automatique toutes les 5 minutes (pg_cron + pg_net, comme 029), qui appelle la fonction « push ».

-- 1. Adresses d'envoi (une par appareil).
create table if not exists public.push_subs (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null unique check (endpoint ~ '^https://' and length(endpoint) <= 1000),
  p256dh text not null check (p256dh ~ '^[A-Za-z0-9_-]{80,100}={0,2}$'),
  auth text not null check (auth ~ '^[A-Za-z0-9_-]{16,32}={0,2}$'),
  ua text check (ua is null or length(ua) <= 300),
  created_at timestamptz not null default now(),
  seen_at timestamptz not null default now(),
  last_ok_at timestamptz,
  fails int not null default 0 check (fails >= 0)
);
create index if not exists push_subs_user on public.push_subs (user_id);
alter table public.push_subs enable row level security;
revoke all on public.push_subs from anon, authenticated;

-- 2. Cases cochées (vrai par défaut, comme dans l'app).
create table if not exists public.push_prefs (
  user_id uuid primary key references auth.users (id) on delete cascade,
  pa boolean not null default true,
  booster boolean not null default true,
  coin boolean not null default true,
  safari boolean not null default true,
  alerts boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.push_prefs enable row level security;
revoke all on public.push_prefs from anon, authenticated;

-- 3. Rappels envoyés.
create table if not exists public.push_sent (
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('booster', 'coin', 'safari', 'pa', 'away3', 'away7', 'test')),
  cycle text not null check (length(cycle) <= 64),
  sent_at timestamptz not null default now(),
  primary key (user_id, kind, cycle)
);
create index if not exists push_sent_day on public.push_sent (user_id, sent_at desc);
alter table public.push_sent enable row level security;
revoke all on public.push_sent from anon, authenticated;

-- 4. Clés VAPID (une seule ligne), et passages de la fonction (écart minimal, diagnostic).
create table if not exists public.push_keys (
  id int primary key default 1 check (id = 1),
  pub text not null check (pub ~ '^[A-Za-z0-9_-]{86,88}$'),
  priv text not null check (length(priv) between 40 and 400),
  created_at timestamptz not null default now()
);
alter table public.push_keys enable row level security;
revoke all on public.push_keys from anon, authenticated;

create table if not exists public.push_runs (
  id bigint generated always as identity primary key,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  due int, ok int, gone int, failed int
);
alter table public.push_runs enable row level security;
revoke all on public.push_runs from anon, authenticated;

-- 5. App : enregistrer l'adresse d'envoi de cet appareil (et les cases cochées, si elles sont données).
create or replace function public.push_subscribe(endpoint text, p256dh text, auth text, ua text default null, prefs jsonb default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); n int;
begin
  if uid is null then raise exception 'Connexion requise' using errcode = '28000'; end if;
  if endpoint is null or endpoint !~ '^https://' or length(endpoint) > 1000 then raise exception 'Adresse d''envoi invalide' using errcode = '22023'; end if;
  insert into public.push_subs as s (user_id, endpoint, p256dh, auth, ua)
  values (uid, push_subscribe.endpoint, push_subscribe.p256dh, push_subscribe.auth, left(push_subscribe.ua, 300))
  on conflict on constraint push_subs_endpoint_key do update set user_id = uid, p256dh = excluded.p256dh, auth = excluded.auth, ua = excluded.ua,
    seen_at = now(), fails = 0;
  -- 5 appareils au plus : les plus anciens partent.
  delete from public.push_subs where id in (
    select id from public.push_subs where user_id = uid order by seen_at desc, id desc offset 5);
  if prefs is not null then perform public.push_prefs_set(prefs); end if;
  select count(*) into n from public.push_subs where user_id = uid;
  return jsonb_build_object('ok', true, 'devices', n);
end; $$;

-- 6. App : notifications coupées sur cet appareil (ou déconnexion).
create or replace function public.push_unsubscribe(endpoint text) returns void
language sql security definer set search_path = '' as $$
  delete from public.push_subs s where s.endpoint = push_unsubscribe.endpoint and s.user_id = auth.uid();
$$;

-- 7. App : cases de Mon profil › Notifications (clés inconnues ignorées).
create or replace function public.push_prefs_set(prefs jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Connexion requise' using errcode = '28000'; end if;
  if prefs is null or jsonb_typeof(prefs) <> 'object' then raise exception 'Réglages invalides' using errcode = '22023'; end if;
  insert into public.push_prefs (user_id) values (uid) on conflict do nothing;
  update public.push_prefs p set
    pa = case when jsonb_typeof(prefs -> 'pa') = 'boolean' then (prefs ->> 'pa')::boolean else p.pa end,
    booster = case when jsonb_typeof(prefs -> 'booster') = 'boolean' then (prefs ->> 'booster')::boolean else p.booster end,
    coin = case when jsonb_typeof(prefs -> 'coin') = 'boolean' then (prefs ->> 'coin')::boolean else p.coin end,
    safari = case when jsonb_typeof(prefs -> 'safari') = 'boolean' then (prefs ->> 'safari')::boolean else p.safari end,
    alerts = case when jsonb_typeof(prefs -> 'alerts') = 'boolean' then (prefs ->> 'alerts')::boolean else p.alerts end,
    updated_at = now()
  where p.user_id = uid;
  return (select to_jsonb(p) - 'user_id' - 'updated_at' from public.push_prefs p where p.user_id = uid);
end; $$;

-- 8. Serveur : rappels à envoyer maintenant. Chaque rappel est noté dans push_sent au moment où il est rendu (deux
--    passages en même temps ne l'enverraient donc pas deux fois) ; une ligne par appareil du compte.
create or replace function public.push_due(now_at timestamptz default now(), max_rows int default 2000)
returns table (sub_id bigint, endpoint text, p256dh text, auth text, user_id uuid, kind text, title text, body text, url text)
language plpgsql security definer set search_path = '' as $$
declare loc timestamp := now_at at time zone 'Europe/Paris'; h int := extract(hour from loc)::int; today date := loc::date;
begin
  if h < 9 or h >= 22 then return; end if;  -- heures calmes
  return query
  with users as (
    select distinct s.user_id as uid from public.push_subs s
    join public.profiles p on p.id = s.user_id and p.status = 'active'
  ), x as (
    select u.uid, coalesce(pp.pa, true) as pa_on, coalesce(pp.booster, true) as booster_on, coalesce(pp.coin, true) as coin_on,
      coalesce(pp.safari, true) as safari_on, gr.booster_h, gr.coin_h, gr.safari_h,
      public._game_free(u.uid) as free, public._safari_free(u.uid) as sfree,
      (select max(l.at) from public.ledger l where l.user_id = u.uid and l.kind = 'booster') as b_last,
      (select max(l.at) from public.ledger l where l.user_id = u.uid and l.kind = 'coin') as c_last,
      (select max(l.at) from public.ledger l where l.user_id = u.uid and l.kind = 'safari') as s_last,
      w.pa_day,
      coalesce((select max(a.last_at) from public.app_time a where a.user_id = u.uid), au.created_at, now_at) as seen
    from users u
    join auth.users au on au.id = u.uid
    left join public.push_prefs pp on pp.user_id = u.uid
    left join public.wallets w on w.user_id = u.uid
    left join public.game_grades gr on gr.i = public._game_grade(u.uid)
  ), cand as (
    select x.uid, 'booster'::text as k, x.b_last::text as cyc, 1 as prio from x
      where x.booster_on and not x.free and x.b_last is not null and coalesce(x.booster_h, 0) > 0
        and x.b_last + make_interval(hours => x.booster_h) <= now_at
    union all
    select x.uid, 'coin', x.c_last::text, 2 from x
      where x.coin_on and not x.free and x.c_last is not null and coalesce(x.coin_h, 0) > 0
        and x.c_last + make_interval(hours => x.coin_h) <= now_at
    union all
    select x.uid, 'safari', x.s_last::text, 3 from x
      where x.safari_on and not x.sfree and x.s_last is not null and coalesce(x.safari_h, 0) > 0
        and x.s_last + make_interval(hours => x.safari_h) <= now_at
    union all
    select x.uid, 'pa', today::text, 4 from x
      where x.pa_on and h >= 10 and x.pa_day is distinct from today and x.seen > now_at - interval '72 hours'
    union all
    select x.uid, 'away3', x.seen::text, 5 from x
      where h between 17 and 19 and x.seen <= now_at - interval '72 hours' and x.seen > now_at - interval '7 days'
    union all
    select x.uid, 'away7', x.seen::text, 6 from x
      where h between 17 and 19 and x.seen <= now_at - interval '7 days' and x.seen > now_at - interval '30 days'
  ), fresh as (
    select c.* from cand c
    where not exists (select 1 from public.push_sent ps where ps.user_id = c.uid and ps.kind = c.k and ps.cycle = c.cyc)
  ), capped as (
    select f.*, row_number() over (partition by f.uid order by f.prio) as rn,
      (select count(*) from public.push_sent ps where ps.user_id = f.uid and ps.kind <> 'test'
         and (ps.sent_at at time zone 'Europe/Paris')::date = today) as day_n
    from fresh f
  ), ins as (
    insert into public.push_sent (user_id, kind, cycle, sent_at)
    select c.uid, c.k, c.cyc, now_at from capped c where c.rn + c.day_n <= 6
    on conflict do nothing
    returning push_sent.user_id, push_sent.kind
  )
  select s.id, s.endpoint, s.p256dh, s.auth, i.user_id, i.kind,
    case i.kind when 'booster' then 'Booster PK prêt' when 'coin' then 'Pièce prête' when 'safari' then 'Safari éclair prêt'
      when 'pa' then 'PA dispo aujourd’hui' when 'away3' then 'Tes jeux t’attendent' else 'Ça fait une semaine !' end,
    case i.kind when 'booster' then 'Ton Booster PK gratuit peut être ouvert' when 'coin' then 'Tu peux relancer la pièce pour gagner des PK'
      when 'safari' then 'Tu peux rejouer au Safari éclair' when 'pa' then 'Tes points d’Aura t’attendent'
      when 'away3' then 'Booster PK, pièce et PA du jour sont prêts. Reviens les récupérer !'
      else 'Ta collection a peut-être pris de la valeur. Viens voir sur Dropicards.' end,
    case when i.kind in ('booster', 'coin', 'safari') then './#marche' else './' end
  from ins i join public.push_subs s on s.user_id = i.user_id
  limit greatest(1, max_rows);
end; $$;

-- 9. Serveur : notification de test demandée par un joueur depuis l'app (une toutes les 10 minutes au plus).
create or replace function public.push_test_claim(uid uuid, now_at timestamptz default now())
returns table (sub_id bigint, endpoint text, p256dh text, auth text)
language plpgsql security definer set search_path = '' as $$
declare cyc text := to_char(date_trunc('minute', now_at) - make_interval(mins => (extract(minute from now_at)::int % 10)), 'YYYY-MM-DD"T"HH24:MI');
begin
  if uid is null then raise exception 'Connexion requise' using errcode = '28000'; end if;
  if not exists (select 1 from public.push_subs s where s.user_id = uid) then return; end if;
  insert into public.push_sent (user_id, kind, cycle, sent_at) values (uid, 'test', cyc, now_at) on conflict do nothing;
  if not found then raise exception 'Une notification de test toutes les 10 minutes au plus' using errcode = 'P0001'; end if;
  return query select s.id, s.endpoint, s.p256dh, s.auth from public.push_subs s where s.user_id = uid;
end; $$;

-- 10. Serveur : résultat des envois [{ "sub": id, "ok": true }, { "sub": id, "gone": true }, { "sub": id }]. Adresse
--     refusée par le service du navigateur (404, 410) : effacée ; 5 échecs de suite : effacée aussi.
create or replace function public.push_report(results jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare r jsonb; ok int := 0; gone int := 0; failed int := 0; sid bigint;
begin
  for r in select * from jsonb_array_elements(coalesce(results, '[]'::jsonb)) loop
    sid := nullif(r ->> 'sub', '')::bigint;
    continue when sid is null;
    if coalesce((r ->> 'ok')::boolean, false) then
      update public.push_subs set last_ok_at = now(), fails = 0 where id = sid; ok := ok + 1;
    elsif coalesce((r ->> 'gone')::boolean, false) then
      delete from public.push_subs where id = sid; gone := gone + 1;
    else
      update public.push_subs set fails = fails + 1 where id = sid;
      delete from public.push_subs where id = sid and fails >= 5;
      failed := failed + 1;
    end if;
  end loop;
  return jsonb_build_object('ok', ok, 'gone', gone, 'failed', failed);
end; $$;

-- 11. Serveur : clés VAPID (créées par la fonction au premier passage), début et fin d'un passage.
create or replace function public.push_keys_get() returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('pub', k.pub, 'priv', k.priv) from public.push_keys k where k.id = 1;
$$;
create or replace function public.push_keys_init(pub text, priv text) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.push_keys (id, pub, priv) values (1, push_keys_init.pub, push_keys_init.priv) on conflict (id) do nothing;
  return public.push_keys_get();
end; $$;

create or replace function public.push_run_begin(gap_sec int default 240) returns bigint
language plpgsql security definer set search_path = '' as $$
declare last_at timestamptz; rid bigint;
begin
  perform pg_advisory_xact_lock(hashtext('push_run'));
  select started_at into last_at from public.push_runs order by started_at desc limit 1;
  if last_at is not null and last_at > now() - make_interval(secs => greatest(0, gap_sec)) then return null; end if;
  insert into public.push_runs default values returning id into rid;
  delete from public.push_runs where started_at < now() - interval '14 days';
  delete from public.push_sent where sent_at < now() - interval '60 days';
  return rid;
end; $$;
create or replace function public.push_run_end(rid bigint, due int, ok int, gone int, failed int) returns void
language sql security definer set search_path = '' as $$
  update public.push_runs set ended_at = now(), due = push_run_end.due, ok = push_run_end.ok, gone = push_run_end.gone,
    failed = push_run_end.failed where id = rid;
$$;

-- 12. Admins : état des envois (Studio : select public.push_status();).
create or replace function public.push_status() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  if coalesce(auth.uid()::text, '') <> '' and not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin' and status = 'active') then
    raise exception 'Réservé aux admins' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'appareils', (select count(*) from public.push_subs),
    'comptes', (select count(distinct user_id) from public.push_subs),
    'cles', exists (select 1 from public.push_keys),
    'envoyes_24h', (select coalesce(jsonb_object_agg(kind, n), '{}'::jsonb) from (select kind, count(*) n from public.push_sent where sent_at > now() - interval '24 hours' group by kind) t),
    'derniers_passages', (select coalesce(jsonb_agg(to_jsonb(r) order by r.started_at desc), '[]'::jsonb) from (select started_at, ended_at, due, ok, gone, failed from public.push_runs order by started_at desc limit 5) r));
end; $$;

revoke all on function public.push_subscribe(text, text, text, text, jsonb), public.push_unsubscribe(text), public.push_prefs_set(jsonb),
  public.push_due(timestamptz, int), public.push_test_claim(uuid, timestamptz), public.push_report(jsonb), public.push_keys_get(),
  public.push_keys_init(text, text), public.push_run_begin(int), public.push_run_end(bigint, int, int, int, int), public.push_status()
  from public, anon, authenticated;
grant execute on function public.push_subscribe(text, text, text, text, jsonb), public.push_unsubscribe(text), public.push_prefs_set(jsonb),
  public.push_status() to authenticated;
grant execute on function public.push_due(timestamptz, int), public.push_test_claim(uuid, timestamptz), public.push_report(jsonb),
  public.push_keys_get(), public.push_keys_init(text, text), public.push_run_begin(int), public.push_run_end(bigint, int, int, int, int),
  public.push_status() to service_role;

-- 13. Passage automatique toutes les 5 minutes (pg_cron + pg_net). La clé « anon » est publique (déjà dans l'app) ; la
--     fonction refuse de toute façon deux passages à moins de 4 minutes d'écart.
do $cron$
declare anon text := 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc5Mzk1OTI2MCwiZXhwIjo0OTQ5NjMyODYwLCJyb2xlIjoiYW5vbiJ9.MHlBLPLkoVqE9-SnparqMbxnkG7cQpRngeSHC5HmZss';
begin
  begin create extension if not exists pg_net; exception when others then raise notice 'pg_net indisponible : %', sqlerrm; end;
  begin create extension if not exists pg_cron; exception when others then raise notice 'pg_cron indisponible : %', sqlerrm; end;
  if to_regnamespace('cron') is null or to_regnamespace('net') is null then
    raise notice 'Envoi automatique NON programmé (pg_cron ou pg_net absent) : la fonction « push » reste appelable à la main.';
    return;
  end if;
  perform cron.schedule('push-envoi', '*/5 * * * *', format($job$select net.http_post(
      url := 'https://api.dropicards.fr/functions/v1/push/run',
      headers := jsonb_build_object('Content-Type', 'application/json', 'apikey', %L, 'Authorization', 'Bearer ' || %L),
      body := '{}'::jsonb, timeout_milliseconds := 120000)$job$, anon, anon));
  raise notice 'Envoi automatique programmé : toutes les 5 minutes (tâche « push-envoi »).';
end $cron$;

notify pgrst, 'reload schema';
