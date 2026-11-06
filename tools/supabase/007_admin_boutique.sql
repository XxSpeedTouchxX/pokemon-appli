-- 007 : mot de passe des admins et nouveau PK shop (2026-11-06, demandes du porteur). À lancer après 004, 005 et 006.
-- Rejouable : on peut le relancer sans rien casser.
--
-- A. Mot de passe des admins (remplace la double authentification de 006) :
--   - un seul mot de passe, connu des admins seulement ; la base n'en garde qu'une empreinte (bcrypt), jamais le mot de
--     passe lui-même ; il n'est écrit nulle part dans le dépôt ;
--   - il se choisit dans Studio › SQL Editor (compte technique « postgres » seulement) :
--       select public.admin_set_password('ton mot de passe');
--     puis effacer la requête de l'éditeur ;
--   - un compte « admin » qui le tape dans l'app (7 appuis sur « Version ») a ses droits d'admin pendant 24 h :
--     outils admin, et PK et PA illimités (rien n'est débité, aucun délai, aucun grade ni délai de 7 jours demandé) ;
--   - 5 essais faux en 15 minutes : bloqué 15 minutes ; chaque essai, bon ou faux, est inscrit au journal des admins ;
--   - un compte ordinaire qui connaîtrait le mot de passe n'obtient rien : il faut aussi le rôle « admin ».
--
-- B. PK shop :
--   - 3 tickets, chacun pour un tirage au sort toutes les 2 semaines (le dimanche à 20 h, heure de Paris, à partir
--     du 22 novembre 2026) : Bronze 500 PK (un booster Pokémon, 5 à 15 €), Argent 1 500 PK (un item rare, 20 à
--     60 €), Or 5 000 PK (l'ETB de la série du moment, 60 à 200 €) ;
--   - 3 achats directs : booster de la série du moment 7 500 PK, un item rare au choix 10 000 PK, ETB 30 ans 15 000 PK ;
--   - pas de grade demandé (le prix suffit) ; toujours 7 jours après la confirmation de l'adresse ; pièce d'identité
--     du gagnant ou de l'acheteur vérifiée avant tout envoi (hors de l'app) ;
--   - le tirage n'est pas fait par l'app : `admin_draw_entries()` donne la liste des participants d'un tirage.

-- A1. Empreinte du mot de passe (une seule ligne), illisible pour l'app.
create table if not exists public.admin_secret (
  id int primary key default 1 check (id = 1),
  hash text not null,
  set_at timestamptz not null default now()
);
alter table public.admin_secret enable row level security;
revoke all on public.admin_secret from anon, authenticated;

-- A2. Admins déverrouillés, et jusqu'à quand.
create table if not exists public.admin_unlocks (
  user_id uuid primary key references auth.users (id) on delete cascade,
  until timestamptz not null
);
alter table public.admin_unlocks enable row level security;
revoke all on public.admin_unlocks from anon, authenticated;

-- A3. Choisir ou changer le mot de passe : depuis Studio seulement (jamais depuis l'app).
create or replace function public.admin_set_password(pw text) returns text
language plpgsql security definer set search_path = '' as $$
begin
  if pw is null or char_length(pw) < 12 then raise exception 'Mot de passe trop court : 12 caractères au moins'; end if;
  insert into public.admin_secret (id, hash, set_at) values (1, extensions.crypt(pw, extensions.gen_salt('bf', 10)), now())
    on conflict (id) do update set hash = excluded.hash, set_at = now();
  delete from public.admin_unlocks; -- ancien mot de passe : tout le monde le retape
  return 'Mot de passe admin enregistré (seule son empreinte est gardée). Efface cette requête de l''éditeur.';
end; $$;
revoke all on function public.admin_set_password(text) from public, anon, authenticated;

-- A4. Droits d'admin : rôle « admin », compte actif, et mot de passe tapé il y a moins de 24 h
-- (remplace la version de 006, qui demandait la double authentification).
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles p join public.admin_unlocks u on u.user_id = p.id
    where p.id = auth.uid() and p.role = 'admin' and p.status = 'active' and u.until > now());
$$;
-- Même règle pour un compte donné (fonctions de jeu).
create or replace function public._game_free(uid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles p join public.admin_unlocks u on u.user_id = p.id
    where p.id = uid and p.role = 'admin' and p.status = 'active' and u.until > now());
$$;
revoke all on function public._game_free(uuid) from public, anon, authenticated;

-- A5. Taper le mot de passe (app). Réponse { ok, until } ou { ok: false, msg } : un essai faux n'est pas une erreur,
-- pour qu'il reste inscrit au journal.
create or replace function public.admin_unlock(pw text) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := auth.uid(); h text; fails int; t timestamptz := now() + interval '24 hours';
begin
  if uid is null then raise exception 'Connexion requise' using errcode = '28000'; end if;
  if not exists (select 1 from public.profiles where id = uid and role = 'admin' and status = 'active') then
    raise exception 'Réservé aux comptes admin' using errcode = '42501';
  end if;
  select count(*) into fails from public.admin_log where admin_id = uid and action = 'unlock_failed' and at > now() - interval '15 minutes';
  if fails >= 5 then return jsonb_build_object('ok', false, 'msg', 'Trop d’essais : attends 15 minutes.'); end if;
  select hash into h from public.admin_secret where id = 1;
  if h is null then return jsonb_build_object('ok', false, 'msg', 'Mot de passe admin pas encore choisi (Studio › SQL Editor).'); end if;
  if extensions.crypt(coalesce(pw, ''), h) <> h then
    insert into public.admin_log (admin_id, action, target_user, details, reason)
      values (uid, 'unlock_failed', uid, jsonb_build_object('essais', fails + 1), 'Mot de passe admin incorrect');
    return jsonb_build_object('ok', false, 'msg', 'Mot de passe incorrect.' || case when fails + 1 >= 3 then ' Encore ' || (5 - fails - 1) || ' essai(s) avant 15 minutes de blocage.' else '' end);
  end if;
  insert into public.admin_unlocks (user_id, until) values (uid, t) on conflict (user_id) do update set until = t;
  insert into public.admin_log (admin_id, action, target_user, details, reason)
    values (uid, 'unlock', uid, jsonb_build_object('jusqu_a', t), 'Mode Admin ouvert avec le mot de passe');
  return jsonb_build_object('ok', true, 'until', t);
end; $$;
-- Refermer le mode Admin (app : « Quitter le mode Admin »).
create or replace function public.admin_lock() returns void
language plpgsql volatile security definer set search_path = '' as $$
begin
  delete from public.admin_unlocks where user_id = auth.uid();
end; $$;
revoke all on function public.admin_unlock(text), public.admin_lock() from public, anon;
grant execute on function public.admin_unlock(text), public.admin_lock() to authenticated;

-- A6. Mouvement (remplace la version de 004) : un admin déverrouillé ne dépense rien (PK et PA illimités) ; le
-- journal garde la ligne, à 0, avec la mention « admin illimité ». Les outils admin (kind « admin ») ne changent pas.
create or replace function public._game_move(uid uuid, k text, dpk int, dpa int, r text, req uuid) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare w public.wallets%rowtype;
begin
  if k <> 'admin' and (dpk < 0 or dpa < 0) and public._game_free(uid) then
    dpk := greatest(dpk, 0); dpa := greatest(dpa, 0);
    r := left(coalesce(r || ' · ', '') || 'admin illimité', 120);
  end if;
  select * into w from public.wallets where user_id = uid;
  if w.pk + dpk < 0 then raise exception 'Pas assez de PK' using errcode = 'P0001'; end if;
  if w.pa + dpa < 0 then raise exception 'Pas assez de PA' using errcode = 'P0001'; end if;
  update public.wallets set pk = pk + dpk, pa = pa + dpa, pk_earned = pk_earned + greatest(dpk, 0), updated_at = now()
  where user_id = uid returning * into w;
  insert into public.ledger (user_id, kind, pk, pa, pk_after, pa_after, ref, request_id) values (uid, k, dpk, dpa, w.pk, w.pa, r, req);
  return jsonb_build_object('pk', w.pk, 'pa', w.pa, 'pk_earned', w.pk_earned);
end; $$;
revoke all on function public._game_move(uuid, text, int, int, text, uuid) from public, anon, authenticated;

-- A7. Booster PK et pile ou face (remplacent les versions de 004) : sans délai ni grade pour un admin déverrouillé.
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
  won := case when x < 0.50 then 30 when x < 0.70 then 50 when x < 0.85 then 100 when x < 0.95 then 200 else 500 end;
  return public._game_move(uid, 'booster', won, 0, null, req) || jsonb_build_object('won', won, 'next', now() + make_interval(hours => gr.booster_h));
end; $$;
create or replace function public.flip_coin(req uuid) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._game_begin(); gr public.game_grades%rowtype; last timestamptz; won int; r jsonb; free boolean := public._game_free(uid);
begin
  r := public._game_replay(uid, req); if r is not null then return r; end if;
  select * into gr from public.game_grades where i = public._game_grade(uid);
  if gr.coin_h = 0 and not free then raise exception 'Pièce réservée au grade Chasseur et plus' using errcode = 'P0001'; end if;
  select max(at) into last from public.ledger where user_id = uid and kind = 'coin';
  if not free and last is not null and last + make_interval(hours => gr.coin_h) > now() then raise exception 'Pièce pas encore prête' using errcode = 'P0001'; end if;
  won := case when public._game_rand() < 0.5 then 50 else 0 end;
  return public._game_move(uid, 'coin', won, 0, null, req) || jsonb_build_object('won', won, 'win', won > 0, 'next', now() + make_interval(hours => greatest(gr.coin_h, 4)));
end; $$;

-- B1. Articles du PK shop : libellé, valeur annoncée, choix possibles ; grade facultatif (aucun pour les nouveaux).
alter table public.game_items alter column perk drop not null;
alter table public.game_items add column if not exists label text;
alter table public.game_items add column if not exists value_text text;
alter table public.game_items add column if not exists choices text[];
update public.game_items set active = false where id in ('ticket-booster', 'lot-booster-30');
insert into public.game_items (id, kind, price_pk, perk, label, value_text, choices, active) values
  ('ticket-bronze', 'ticket', 500, null, 'Ticket Bronze · tirage d’un booster Pokémon (série du moment : 30 ans)', '5 à 15 €', null, true),
  ('ticket-argent', 'ticket', 1500, null, 'Ticket Argent · tirage d’un item rare', '20 à 60 €', null, true),
  ('ticket-or', 'ticket', 5000, null, 'Ticket Or · tirage de l’ETB de la série du moment', '60 à 200 €', null, true),
  ('achat-booster', 'lot', 7500, null, 'Booster de la série du moment (30 ans)', '5 à 15 €', null, true),
  ('achat-rare', 'lot', 10000, null, 'Item rare au choix', '20 à 60 €',
    array['Coffret classeur', 'Poster', 'Coffret thématique', 'Collection', 'Pokébox', 'Mini tin', 'Bundle'], true),
  ('achat-etb-30', 'lot', 15000, null, 'ETB 30 ans', '60 à 200 €', null, true)
on conflict (id) do update set kind = excluded.kind, price_pk = excluded.price_pk, perk = excluded.perk, label = excluded.label,
  value_text = excluded.value_text, choices = excluded.choices, active = excluded.active;

-- B2. Tickets : tirage visé et choix de l'item.
alter table public.tickets add column if not exists draw_at timestamptz;
alter table public.tickets add column if not exists choice text;
create index if not exists tickets_draw on public.tickets (draw_at, item) where draw_at is not null;

-- B3. Prochain tirage : un dimanche sur deux à 20 h (Paris), à partir du 22 novembre 2026.
create or replace function public._game_next_draw(t timestamptz default now()) returns timestamptz
language sql stable set search_path = '' as $$
  select (timestamp '2026-11-22 20:00:00' + make_interval(days => 14 * greatest(0,
    ceil(extract(epoch from (t - (timestamp '2026-11-22 20:00:00' at time zone 'Europe/Paris'))) / (14 * 86400.0))::int))) at time zone 'Europe/Paris';
$$;
revoke all on function public._game_next_draw(timestamptz) from public, anon, authenticated;

-- B4. Achat (remplace buy_item(text, uuid) de 004) : prix du serveur, 7 jours après la confirmation de l'adresse,
-- choix obligatoire pour l'item rare ; un ticket vise le prochain tirage.
drop function if exists public.buy_item(text, uuid);
create or replace function public.buy_item(item_id text, req uuid, choice text default null) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._game_begin(); it public.game_items%rowtype; gr public.game_grades%rowtype; conf timestamptz; r jsonb;
  free boolean := public._game_free(uid); d timestamptz; c text := nullif(btrim(coalesce(choice, '')), '');
begin
  r := public._game_replay(uid, req); if r is not null then return r; end if;
  select * into it from public.game_items where id = item_id and active;
  if not found then raise exception 'Article indisponible' using errcode = 'P0001'; end if;
  select * into gr from public.game_grades where i = public._game_grade(uid);
  if not free and ((it.perk = 'ticket' and not gr.ticket) or (it.perk = 'shop_booster' and not gr.shop_booster)) then
    raise exception 'Grade insuffisant pour cet article' using errcode = 'P0001';
  end if;
  if it.choices is not null and (c is null or not (c = any (it.choices))) then raise exception 'Choisis ton item' using errcode = 'P0001'; end if;
  if it.choices is null then c := null; end if;
  select email_confirmed_at into conf from auth.users where id = uid;
  if not free and conf > now() - interval '7 days' then raise exception 'Disponible 7 jours après la création de ton compte' using errcode = 'P0001'; end if;
  d := case when it.kind = 'ticket' then public._game_next_draw() end;
  insert into public.tickets (user_id, item, cost_pk, draw_at, choice) values (uid, it.id, case when free then 0 else it.price_pk end, d, c);
  return public._game_move(uid, 'shop', -it.price_pk, 0, it.id || coalesce(' · ' || c, ''), req) || jsonb_build_object('item', it.id,
    'count', (select count(*) from public.tickets where user_id = uid and item = it.id and draw_at is not distinct from d),
    'draw_at', d, 'choice', c);
end; $$;
revoke all on function public.buy_item(text, uuid, text) from public, anon;
grant execute on function public.buy_item(text, uuid, text) to authenticated;

-- B5. État du compte (remplace la version de 004) : en plus, mode admin illimité, prochain tirage, tickets du
-- prochain tirage, articles du shop.
create or replace function public.game_state() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid(); w public.wallets%rowtype; g int; gr public.game_grades%rowtype; today date := public._game_today();
  conf timestamptz; nb timestamptz; nc timestamptz; nxt jsonb; d timestamptz := public._game_next_draw(); free boolean;
begin
  if uid is null then raise exception 'Connexion requise' using errcode = '28000'; end if;
  free := public._game_free(uid);
  select * into w from public.wallets where user_id = uid;
  g := public._game_grade(uid);
  select * into gr from public.game_grades where i = g;
  select email_confirmed_at into conf from auth.users where id = uid;
  nb := case when not free then (select max(at) from public.ledger where user_id = uid and kind = 'booster') + make_interval(hours => gr.booster_h) end;
  nc := case when gr.coin_h > 0 and not free then (select max(at) from public.ledger where user_id = uid and kind = 'coin') + make_interval(hours => gr.coin_h) end;
  nxt := case when w.pa_day = today then null
    else to_jsonb(case when w.pa_day is null then 20 when w.pa_day = today - 1 then (array[20, 30, 40, 50, 70])[least(w.pa_streak + 1, 5)] else 30 end) end;
  return jsonb_build_object(
    'pk', w.pk, 'pa', w.pa, 'pk_earned', w.pk_earned, 'today', today, 'server_now', now(),
    'pa_day', w.pa_day, 'pa_streak', w.pa_streak, 'pa_gain', nxt,
    'grade', g, 'booster_next', nb, 'coin_open', gr.coin_h > 0 or free, 'coin_next', nc,
    'booster_last', case when not free then (select max(at) from public.ledger where user_id = uid and kind = 'booster') end,
    'coin_last', case when not free then (select max(at) from public.ledger where user_id = uid and kind = 'coin') end,
    'buddy', (select buddy from public.profiles where id = uid),
    'shared', exists (select 1 from public.ledger where user_id = uid and kind = 'share'),
    'unlocked', coalesce((select jsonb_agg(pokemon order by pokemon) from public.dex_unlocks where user_id = uid), '[]'::jsonb),
    'shop', coalesce((select jsonb_object_agg(item, n) from (select item, count(*) n from public.tickets where user_id = uid group by item) t), '{}'::jsonb),
    'shop_draw', coalesce((select jsonb_object_agg(item, n) from (select item, count(*) n from public.tickets where user_id = uid and draw_at = d group by item) t), '{}'::jsonb),
    'next_draw', d,
    'shop_open_at', conf + interval '7 days',
    'unlimited', free,
    'admin_until', (select until from public.admin_unlocks where user_id = uid and until > now()));
end; $$;
revoke all on function public.game_state() from public, anon;
grant execute on function public.game_state() to authenticated;

-- B6. Participants d'un tirage (admins) : un ticket = une chance. Par défaut, le prochain tirage.
create or replace function public.admin_draw_entries(draw timestamptz default null)
returns table (draw_at timestamptz, item text, user_id uuid, pseudo text, email text, tickets bigint)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Réservé aux admins'; end if;
  return query
    select t.draw_at, t.item, t.user_id, p.pseudo, u.email::text, count(*)
    from public.tickets t join auth.users u on u.id = t.user_id left join public.profiles p on p.id = t.user_id
    where t.draw_at = coalesce(draw, public._game_next_draw())
    group by t.draw_at, t.item, t.user_id, p.pseudo, u.email
    order by t.item, count(*) desc;
end; $$;
revoke all on function public.admin_draw_entries(timestamptz) from public, anon;
grant execute on function public.admin_draw_entries(timestamptz) to authenticated;
