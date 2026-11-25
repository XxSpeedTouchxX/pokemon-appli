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
