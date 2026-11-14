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
    raise exception 'Installe d''abord 025_suivi_joueurs.sql (le plus simple : tout le fichier install_024_a_028.sql)';
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
    g := public._pl_give(r.parrain, 'referral_premium', f::text, 400, public._pl_season(), 'Filleul Premium : ' || coalesce(ps, 'dresseur'));
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
         case when rk.r <= 3 and not (select ok from big) then '1 mois de Premium offert (moins de 50 joueurs classés)'
              when rk.r = 1 then 'ETB du moment'
              when rk.r = 2 then 'Coffret du moment'
              when rk.r = 3 then '2 boosters du moment'
              when rk.r <= 5 then '1 mois de Premium ou 1 ticket Or (au choix)'
              when rk.r <= 7 then '1 mois de Premium ou 1 ticket Argent (au choix)'
              else '1 mois de Premium ou 1 ticket Bronze (au choix)' end
  from rk join public.profiles p on p.id = rk.user_id join auth.users u on u.id = rk.user_id
  where rk.r <= 10 order by rk.r, p.pseudo;
$$;
revoke all on function public.season_winners(int) from public, anon, authenticated;
