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
