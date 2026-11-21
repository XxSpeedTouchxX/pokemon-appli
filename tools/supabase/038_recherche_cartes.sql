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
