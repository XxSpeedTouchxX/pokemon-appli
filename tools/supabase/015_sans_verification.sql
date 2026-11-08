-- 015 : l'app s'utilise sans avoir vérifié son adresse (2026-11-08, porteur : « je ne veux pas que le fait de valider son
-- adresse mail soit obligatoire à l'utilisation de l'application »). Après 014. Rejouable (Studio › SQL Editor › Run).
--   - Jeux (PA du jour, Booster PK, pièce), Pokédex, avatar, classement : ouverts dès la création du compte.
--   - Seule exception, le PK shop (tickets des tirages et lots, de vrais objets envoyés par la poste) : adresse vérifiée
--     demandée, pour pouvoir joindre le gagnant ; toujours 7 jours après la vérification (comme avant).
--   - Les comptes « admin » (mot de passe des admins, 007) ne sont pas concernés.

-- 1. Compte appelant (remplace 004) : connecté et actif ; l'adresse n'est plus demandée ici.
create or replace function public._game_begin() returns uuid
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := auth.uid(); st text; t public.game_throttle%rowtype;
begin
  if uid is null then raise exception 'Connexion requise' using errcode = '28000'; end if;
  select p.status into st from public.profiles p where p.id = uid;
  if st is distinct from 'active' then raise exception 'Compte suspendu' using errcode = '42501'; end if;
  perform 1 from public.wallets where user_id = uid for update;
  if not found then raise exception 'Porte-monnaie introuvable'; end if;
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
revoke all on function public._game_begin() from public, anon, authenticated;

-- 2. Achat au PK shop (remplace 008) : adresse vérifiée demandée (le gagnant d'un lot doit pouvoir être joint).
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
  if not free and conf is null then raise exception 'Vérifie d''abord ton adresse e-mail pour participer aux tirages et recevoir tes lots' using errcode = 'P0001'; end if;
  if not free and conf > now() - interval '7 days' then raise exception 'Disponible 7 jours après la création de ton compte' using errcode = 'P0001'; end if;
  d := case when it.kind = 'ticket' then public._game_next_draw(it.cycle, now()) end;
  insert into public.tickets (user_id, item, cost_pk, draw_at, choice) values (uid, it.id, case when free then 0 else it.price_pk end, d, c);
  return public._game_move(uid, 'shop', -it.price_pk, 0, it.id || coalesce(' · ' || c, ''), req) || jsonb_build_object('item', it.id,
    'count', (select count(*) from public.tickets where user_id = uid and item = it.id and draw_at is not distinct from d),
    'draw_at', d, 'choice', c);
end; $$;
revoke all on function public.buy_item(text, uuid, text) from public, anon;
grant execute on function public.buy_item(text, uuid, text) to authenticated;
