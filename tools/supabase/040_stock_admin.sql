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
