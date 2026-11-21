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
