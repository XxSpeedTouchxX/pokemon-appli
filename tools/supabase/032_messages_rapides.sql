-- 032_messages_rapides.sql — Messages rapides entre joueurs de « Ma ligue » (2026-11-16, choix du porteur : option B
-- de docs/43-proposition-messagerie-joueurs.md, maquette docs/43-maquette-messagerie/).
--
--   - Depuis la carte de dresseur d'un joueur, on lui envoie un des 8 messages tout faits de Dropicards (quick_msg_catalog).
--     Jamais de texte libre : rien à modérer, sans risque pour les joueurs de moins de 15 ans.
--   - 10 messages envoyés par jour au plus (jour de Paris), 3 au plus au même joueur par jour ; pas à soi-même ; pas à un
--     compte suspendu ou sans pseudo ; pas à un joueur qui a coupé ses messages.
--   - « Mes messages » : messages reçus (pseudo, avatar et grade de l'expéditeur), réponse en un appui par un autre message
--     tout fait (une seule réponse par message), réglage « Recevoir les messages rapides ».
--   - Messages effacés après 90 jours, et avec le compte (suppression du compte : effacement en cascade).
--   - Tables lues et écrites seulement par ces fonctions (aucun accès direct).
-- À installer après 028 et 031 (fichier install_024_a_033.sql). Rejouable. Tests : tests/test_032.sql.

do $$ begin
  if to_regprocedure('public._game_grade(uuid)') is null or to_regprocedure('public._game_today()') is null or to_regclass('public.profiles') is null then
    raise exception 'Installe d''abord 001 à 031 (fichier install_024_a_033.sql)';
  end if;
end $$;

-- 1. Les 8 messages tout faits (codes lus par l'app, qui affiche le texte et l'émoji).
create table if not exists public.quick_msg_catalog (code text primary key, label text not null, pos int not null);
insert into public.quick_msg_catalog (code, label, pos) values
  ('salut', '👋 Salut !', 1), ('bravo', '👏 Bien joué !', 2), ('collection', '🔥 Belle collection !', 3),
  ('top10', '🏆 Rendez-vous au top 10 !', 4), ('gg', '💪 GG !', 5), ('tirage', '🎁 Bonne chance au tirage !', 6),
  ('safari', '⚡ Prêt pour le Safari ?', 7), ('merci', '😄 Merci !', 8)
on conflict (code) do update set label = excluded.label, pos = excluded.pos;
alter table public.quick_msg_catalog enable row level security;
revoke all on public.quick_msg_catalog from anon, authenticated;

-- 2. Messages envoyés.
create table if not exists public.quick_messages (
  id bigint generated always as identity primary key,
  from_id uuid not null references auth.users (id) on delete cascade,
  to_id uuid not null references auth.users (id) on delete cascade,
  code text not null references public.quick_msg_catalog (code),
  reply_to bigint references public.quick_messages (id) on delete set null,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  check (from_id <> to_id)
);
create index if not exists quick_messages_to on public.quick_messages (to_id, created_at desc);
create index if not exists quick_messages_from on public.quick_messages (from_id, created_at desc);
create unique index if not exists quick_messages_one_reply on public.quick_messages (reply_to) where reply_to is not null;
alter table public.quick_messages enable row level security;
revoke all on public.quick_messages from anon, authenticated;

-- 3. Joueurs qui ont coupé leurs messages (une ligne = messages coupés).
create table if not exists public.quick_msg_off (user_id uuid primary key references auth.users (id) on delete cascade, at timestamptz not null default now());
alter table public.quick_msg_off enable row level security;
revoke all on public.quick_msg_off from anon, authenticated;

-- 4. Envoi (outil interne, partagé par l'envoi et la réponse).
create or replace function public._quick_msg_put(uid uuid, target uuid, c text, reply bigint) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare d timestamptz := (public._game_today()::timestamp) at time zone 'Europe/Paris'; n_day int; n_to int; id_new bigint;
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  if target is null or target = uid then raise exception 'Tu ne peux pas t''envoyer un message à toi-même.' using errcode = 'P0001'; end if;
  if not exists (select 1 from public.quick_msg_catalog where code = c) then raise exception 'Choisis un des messages proposés.' using errcode = 'P0001'; end if;
  if not exists (select 1 from public.profiles where id = target and status = 'active' and pseudo is not null) then
    raise exception 'Ce joueur n''est plus dans la ligue.' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.quick_msg_off where user_id = target) then
    raise exception 'Ce joueur ne reçoit pas de messages rapides.' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.profiles where id = uid and status <> 'active') then raise exception 'Compte suspendu.' using errcode = '42501'; end if;
  perform pg_advisory_xact_lock(hashtext('quick_msg:' || uid::text));
  select count(*), count(*) filter (where to_id = target) into n_day, n_to from public.quick_messages where from_id = uid and created_at >= d;
  if n_day >= 10 then raise exception 'Tu as déjà envoyé tes 10 messages rapides aujourd''hui. Reviens demain !' using errcode = 'P0001'; end if;
  if n_to >= 3 then raise exception 'Tu as déjà envoyé 3 messages à ce joueur aujourd''hui.' using errcode = 'P0001'; end if;
  insert into public.quick_messages (from_id, to_id, code, reply_to) values (uid, target, c, reply) returning id into id_new;
  -- Ménage : messages de plus de 90 jours.
  delete from public.quick_messages where created_at < now() - interval '90 days';
  return jsonb_build_object('ok', true, 'id', id_new, 'left', 9 - n_day);
end; $$;
revoke all on function public._quick_msg_put(uuid, uuid, text, bigint) from public, anon, authenticated;

-- 5. Envoyer un message tout fait à un joueur (depuis sa carte de dresseur).
create or replace function public.quick_msg_send(target uuid, code text) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
begin
  return public._quick_msg_put(auth.uid(), target, code, null);
end; $$;
revoke all on function public.quick_msg_send(uuid, text) from public, anon;
grant execute on function public.quick_msg_send(uuid, text) to authenticated;

-- 6. Répondre à un message reçu (une seule réponse par message).
create or replace function public.quick_msg_reply(msg_id bigint, code text) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := auth.uid(); m public.quick_messages%rowtype;
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  select * into m from public.quick_messages where id = msg_id and to_id = uid;
  if not found then raise exception 'Message introuvable.' using errcode = 'P0001'; end if;
  if exists (select 1 from public.quick_messages where reply_to = msg_id) then raise exception 'Tu as déjà répondu à ce message.' using errcode = 'P0001'; end if;
  return public._quick_msg_put(uid, m.from_id, code, msg_id);
end; $$;
revoke all on function public.quick_msg_reply(bigint, text) from public, anon;
grant execute on function public.quick_msg_reply(bigint, text) to authenticated;

-- 7. Mes messages reçus (30 derniers par défaut), avec l'expéditeur et ma réponse éventuelle.
create or replace function public.quick_msg_inbox(lim int default 30) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid(); n int := least(greatest(coalesce(lim, 30), 1), 100);
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  return jsonb_build_object(
    'off', exists (select 1 from public.quick_msg_off where user_id = uid),
    'unread', (select count(*) from public.quick_messages where to_id = uid and read_at is null),
    'left', greatest(0, 10 - (select count(*) from public.quick_messages where from_id = uid and created_at >= (public._game_today()::timestamp) at time zone 'Europe/Paris')),
    'items', coalesce((select jsonb_agg(x.j order by x.at desc) from (
      select q.created_at as at, jsonb_build_object('id', q.id, 'code', q.code, 'at', q.created_at, 'read', q.read_at is not null,
        'from', q.from_id, 'pseudo', p.pseudo, 'avatar', p.avatar, 'grade', public._game_grade(q.from_id),
        'replied', (select r.code from public.quick_messages r where r.reply_to = q.id)) as j
      from public.quick_messages q join public.profiles p on p.id = q.from_id
      where q.to_id = uid and p.status = 'active'
      order by q.created_at desc limit n) x), '[]'::jsonb));
end; $$;
revoke all on function public.quick_msg_inbox(int) from public, anon;
grant execute on function public.quick_msg_inbox(int) to authenticated;

-- 8. Nombre de messages non lus (pastille) et messages restants aujourd'hui.
create or replace function public.quick_msg_state() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  return jsonb_build_object(
    'unread', (select count(*) from public.quick_messages q join public.profiles p on p.id = q.from_id where q.to_id = uid and q.read_at is null and p.status = 'active'),
    'left', greatest(0, 10 - (select count(*) from public.quick_messages where from_id = uid and created_at >= (public._game_today()::timestamp) at time zone 'Europe/Paris')),
    'off', exists (select 1 from public.quick_msg_off where user_id = uid));
end; $$;
revoke all on function public.quick_msg_state() from public, anon;
grant execute on function public.quick_msg_state() to authenticated;

-- 9. Tout marquer comme lu (à l'ouverture de « Mes messages »).
create or replace function public.quick_msg_read() returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := auth.uid(); n int;
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  update public.quick_messages set read_at = now() where to_id = uid and read_at is null;
  get diagnostics n = row_count;
  return jsonb_build_object('ok', true, 'read', n);
end; $$;
revoke all on function public.quick_msg_read() from public, anon;
grant execute on function public.quick_msg_read() to authenticated;

-- 10. Recevoir ou non les messages rapides.
create or replace function public.quick_msg_set(receive boolean) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  if coalesce(receive, true) then delete from public.quick_msg_off where user_id = uid;
  else insert into public.quick_msg_off (user_id) values (uid) on conflict (user_id) do nothing; end if;
  return jsonb_build_object('ok', true, 'off', not coalesce(receive, true));
end; $$;
revoke all on function public.quick_msg_set(boolean) from public, anon;
grant execute on function public.quick_msg_set(boolean) to authenticated;

-- Fin : l'API de Supabase relit la liste des fonctions (sinon l'app ne les voit qu'au redémarrage).
notify pgrst, 'reload schema';
