-- 043_mail_joueur_lot.sql — e-mail de félicitations au JOUEUR après un achat direct au PK shop (2026-11-25, porteur :
-- « lorsque l'utilisateur arrive à acheter un booster direct à 10 000 PK ou un autre item du PK shop comme l'item rare
-- ou l'ETB, qu'il reçoive automatiquement un mail de félicitations sur sa boîte mail, en remontrant le lot acheté et en
-- lui demandant son nom, prénom, adresse, code postal, adresse mail et numéro de téléphone, à renvoyer à l'adresse mail
-- de Dropicards pour qu'on puisse lui envoyer »).
--
--   - Achats directs seulement (articles de type « lot » : booster, item rare, ETB) ; jamais les tickets des tirages.
--   - La fonction « notify » du serveur (tools/supabase/functions/notify) lit la liste (shop_player_pending), envoie
--     l'e-mail à l'adresse du compte du joueur avec Brevo, puis marque l'achat (shop_player_mark_sent) : un e-mail par
--     achat, jamais deux ; un envoi raté repart au prochain achat (de n'importe quel joueur).
--   - Seuls les achats faits après l'installation de 043 reçoivent l'e-mail (pas l'historique).
--   - Achats faits en mode Admin compris : l'admin reçoit le même e-mail (pratique pour voir à quoi il ressemble).
--   - Lecture et écriture réservées au serveur (clé service_role) : un joueur n'y a pas accès.
-- À installer après 012 (Supabase Studio › SQL Editor › New query › colle ce fichier › Run). Rejouable.
-- Tests : tests/test_043.sql. Guide : docs/30 § 9.

do $$ begin
  if to_regclass('public.shop_notices') is null then
    raise exception 'Installe d''abord 012_shop_notices.sql';
  end if;
end $$;

create table if not exists public.shop_player_mails (
  ticket_id uuid primary key references public.tickets (id) on delete cascade,
  sent_at timestamptz not null default now()
);
alter table public.shop_player_mails enable row level security;
revoke all on public.shop_player_mails from anon, authenticated;

create table if not exists public.shop_player_mail_start (
  k int primary key default 1 check (k = 1),
  since timestamptz not null default now()
);
alter table public.shop_player_mail_start enable row level security;
revoke all on public.shop_player_mail_start from anon, authenticated;
insert into public.shop_player_mail_start (k) values (1) on conflict (k) do nothing;

-- Achats directs dont le joueur n'a pas encore reçu l'e-mail, du plus ancien au plus récent (50 au plus par envoi).
-- price_pk : prix de l'article (pour un achat fait en mode Admin, enregistré à 0 PK, l'e-mail montre le vrai prix).
create or replace function public.shop_player_pending(lim int default 20) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(x order by x->>'bought_at'), '[]'::jsonb) from (
    select jsonb_build_object('id', t.id, 'item', t.item, 'label', i.label, 'cost_pk', t.cost_pk, 'price_pk', i.price_pk,
      'choice', t.choice, 'bought_at', t.bought_at, 'user_id', t.user_id, 'email', u.email::text, 'pseudo', p.pseudo) as x
    from public.tickets t
    join auth.users u on u.id = t.user_id
    join public.game_items i on i.id = t.item
    left join public.profiles p on p.id = t.user_id
    where i.kind = 'lot'
      and coalesce(u.email, '') <> ''
      and not exists (select 1 from public.shop_player_mails m where m.ticket_id = t.id)
      and t.bought_at >= (select since from public.shop_player_mail_start where k = 1)
    order by t.bought_at
    limit greatest(1, least(coalesce(lim, 20), 50))
  ) s;
$$;

-- Achats dont l'e-mail est parti (après l'envoi réussi).
create or replace function public.shop_player_mark_sent(ids uuid[]) returns int
language plpgsql volatile security definer set search_path = '' as $$
declare n int;
begin
  insert into public.shop_player_mails (ticket_id) select distinct x from unnest(coalesce(ids, '{}'::uuid[])) as x
    where exists (select 1 from public.tickets t where t.id = x)
  on conflict (ticket_id) do nothing;
  get diagnostics n = row_count;
  return n;
end; $$;

revoke all on function public.shop_player_pending(int), public.shop_player_mark_sent(uuid[]) from public, anon, authenticated;
grant execute on function public.shop_player_pending(int), public.shop_player_mark_sent(uuid[]) to service_role;

-- Repère lu par 000_verifier.sql.
comment on table public.shop_player_mails is '043 : e-mail de félicitations au joueur après un achat direct';

notify pgrst, 'reload schema';
