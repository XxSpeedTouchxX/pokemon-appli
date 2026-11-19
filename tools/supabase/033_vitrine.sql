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
