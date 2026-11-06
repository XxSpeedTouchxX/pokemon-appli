-- 008 : PK shop par grades, rythme de chaque tirage, nouveaux prix (2026-11-06, demandes du porteur). Après 007.
-- Rejouable.
--   - Grade demandé : Recrue et plus → ticket Bronze et booster ; Collectionneur et plus → ticket Argent et item rare
--     (coffrets, classeurs…) ; Maître Pokémon et plus → ticket Or et ETB. Un admin déverrouillé (007) passe toujours.
--   - Tirages, le dimanche à 20 h (heure de Paris) : Bronze toutes les 2 semaines (dès le 22 novembre 2026) ; Argent
--     chaque mois (le dernier dimanche du mois, dès le 29 novembre 2026) ; Or tous les 2 mois (le dernier dimanche de
--     novembre, janvier, mars, mai, juillet et septembre).
--   - Prix : item rare au choix 25 000 PK, ETB 30 ans 50 000 PK (booster 7 500 PK et tickets inchangés).
--   - Le 6ᵉ grade s'appelle « Grand maître Pokémon ».

update public.game_grades set name = 'Grand maître Pokémon' where i = 5;

alter table public.game_items add column if not exists min_grade int not null default 0 check (min_grade between 0 and 5);
alter table public.game_items add column if not exists cycle text check (cycle is null or cycle in ('2w', '1m', '2m'));
update public.game_items set min_grade = 0, cycle = '2w' where id = 'ticket-bronze';
update public.game_items set min_grade = 2, cycle = '1m' where id = 'ticket-argent';
update public.game_items set min_grade = 4, cycle = '2m' where id = 'ticket-or';
update public.game_items set min_grade = 0, cycle = null where id = 'achat-booster';
update public.game_items set min_grade = 2, cycle = null, price_pk = 25000 where id = 'achat-rare';
update public.game_items set min_grade = 4, cycle = null, price_pk = 50000 where id = 'achat-etb-30';
update public.game_items set label = 'Ticket Argent · tirage d’un item rare, chaque mois' where id = 'ticket-argent';
update public.game_items set label = 'Ticket Or · tirage de l’ETB de la série du moment, tous les 2 mois' where id = 'ticket-or';

-- Dernier dimanche d'un mois, à 20 h (heure de Paris).
create or replace function public._game_last_sunday(y int, m int) returns timestamptz
language sql stable set search_path = '' as $$
  select ((d - ((extract(dow from d))::int) * interval '1 day')::date + time '20:00') at time zone 'Europe/Paris'
  from (select (make_date(y, m, 1) + interval '1 month' - interval '1 day')::date as d) x;
$$;
-- Prochain tirage d'un rythme donné, à partir de l'instant t.
create or replace function public._game_next_draw(cyc text, t timestamptz) returns timestamptz
language plpgsql stable set search_path = '' as $$
declare loc timestamp := t at time zone 'Europe/Paris'; y int := extract(year from loc); m int := extract(month from loc); c timestamptz; k int := 0;
begin
  if cyc is null or cyc = '2w' then return public._game_next_draw(t); end if;
  if (y * 12 + m) < (2026 * 12 + 11) then y := 2026; m := 11; end if;
  loop
    -- Or : un mois sur deux, en comptant depuis novembre 2026.
    if cyc = '1m' or ((y * 12 + m) - (2026 * 12 + 11)) % 2 = 0 then
      c := public._game_last_sunday(y, m);
      if c >= t then return c; end if;
    end if;
    m := m + 1; if m > 12 then m := 1; y := y + 1; end if;
    k := k + 1; if k > 30 then raise exception 'Tirage introuvable'; end if;
  end loop;
end; $$;
revoke all on function public._game_last_sunday(int, int), public._game_next_draw(text, timestamptz) from public, anon, authenticated;

-- Achat (remplace la version de 007) : grade demandé par l'article ; un ticket vise le prochain tirage de son rythme.
create or replace function public.buy_item(item_id text, req uuid, choice text default null) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := public._game_begin(); it public.game_items%rowtype; conf timestamptz; r jsonb;
  free boolean := public._game_free(uid); d timestamptz; c text := nullif(btrim(coalesce(choice, '')), ''); gname text;
begin
  r := public._game_replay(uid, req); if r is not null then return r; end if;
  select * into it from public.game_items where id = item_id and active;
  if not found then raise exception 'Article indisponible' using errcode = 'P0001'; end if;
  if not free and public._game_grade(uid) < it.min_grade then
    select name into gname from public.game_grades where i = it.min_grade;
    raise exception 'Tu dois d''abord déverrouiller le grade % pour avoir accès à cet article', gname using errcode = 'P0001';
  end if;
  if it.choices is not null and (c is null or not (c = any (it.choices))) then raise exception 'Choisis ton item' using errcode = 'P0001'; end if;
  if it.choices is null then c := null; end if;
  select email_confirmed_at into conf from auth.users where id = uid;
  if not free and conf > now() - interval '7 days' then raise exception 'Disponible 7 jours après la création de ton compte' using errcode = 'P0001'; end if;
  d := case when it.kind = 'ticket' then public._game_next_draw(it.cycle, now()) end;
  insert into public.tickets (user_id, item, cost_pk, draw_at, choice) values (uid, it.id, case when free then 0 else it.price_pk end, d, c);
  return public._game_move(uid, 'shop', -it.price_pk, 0, it.id || coalesce(' · ' || c, ''), req) || jsonb_build_object('item', it.id,
    'count', (select count(*) from public.tickets where user_id = uid and item = it.id and draw_at is not distinct from d),
    'draw_at', d, 'choice', c);
end; $$;
revoke all on function public.buy_item(text, uuid, text) from public, anon;
grant execute on function public.buy_item(text, uuid, text) to authenticated;

-- État du compte (remplace la version de 007) : prochain tirage de chaque ticket et tickets pour ce tirage.
create or replace function public.game_state() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid(); w public.wallets%rowtype; g int; gr public.game_grades%rowtype; today date := public._game_today();
  conf timestamptz; nb timestamptz; nc timestamptz; nxt jsonb; free boolean; draws jsonb;
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
  select coalesce(jsonb_object_agg(id, public._game_next_draw(cycle, now())), '{}'::jsonb) into draws from public.game_items where kind = 'ticket' and active;
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
    'shop_draw', coalesce((select jsonb_object_agg(t.item, t.n) from (select item, count(*) n from public.tickets tk
      where tk.user_id = uid and tk.draw_at = (draws->>tk.item)::timestamptz group by item) t), '{}'::jsonb),
    'draws', draws,
    'next_draw', draws->>'ticket-bronze',
    'shop_open_at', conf + interval '7 days',
    'unlimited', free,
    'admin_until', (select until from public.admin_unlocks where user_id = uid and until > now()));
end; $$;
revoke all on function public.game_state() from public, anon;
grant execute on function public.game_state() to authenticated;

-- Participants (admins) : par défaut, tous les tirages à venir ; sinon le tirage donné.
create or replace function public.admin_draw_entries(draw timestamptz default null)
returns table (draw_at timestamptz, item text, user_id uuid, pseudo text, email text, tickets bigint)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Réservé aux admins'; end if;
  return query
    select t.draw_at, t.item, t.user_id, p.pseudo, u.email::text, count(*)
    from public.tickets t join auth.users u on u.id = t.user_id left join public.profiles p on p.id = t.user_id
    where t.draw_at is not null and (case when draw is null then t.draw_at > now() else t.draw_at = draw end)
    group by t.draw_at, t.item, t.user_id, p.pseudo, u.email
    order by t.draw_at, t.item, count(*) desc;
end; $$;
revoke all on function public.admin_draw_entries(timestamptz) from public, anon;
grant execute on function public.admin_draw_entries(timestamptz) to authenticated;
