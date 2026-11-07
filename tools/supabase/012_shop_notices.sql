-- 012 : e-mail à Dropicards pour chaque achat au PK shop (2026-11-07, demande du porteur). Après 011. Rejouable.
-- À chaque ticket (Bronze, Argent, Or) ou achat direct (booster, item rare, ETB), la fonction « notify » du serveur
-- (tools/supabase/functions/notify) envoie un e-mail à l'adresse de Dropicards (contact@dropicards.fr par défaut) avec
-- le joueur (pseudo, e-mail), l'article, le tirage visé et son nombre de tickets pour ce tirage. Cette table retient les
-- achats déjà signalés : chacun n'est envoyé qu'une fois, et un e-mail raté repart au prochain achat.
-- Seuls les achats faits après l'installation de 012 sont signalés (pas l'historique).
-- Lecture et écriture réservées au serveur (clé service_role) : un joueur n'y a pas accès.

create table if not exists public.shop_notices (
  ticket_id uuid primary key references public.tickets (id) on delete cascade,
  sent_at timestamptz not null default now()
);
alter table public.shop_notices enable row level security;
revoke all on public.shop_notices from anon, authenticated;

create table if not exists public.shop_notice_start (
  k int primary key default 1 check (k = 1),
  since timestamptz not null default now()
);
alter table public.shop_notice_start enable row level security;
revoke all on public.shop_notice_start from anon, authenticated;
insert into public.shop_notice_start (k) values (1) on conflict (k) do nothing;

-- Achats pas encore signalés, du plus ancien au plus récent (50 au plus par envoi).
create or replace function public.shop_pending(lim int default 20) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(x order by x->>'bought_at'), '[]'::jsonb) from (
    select jsonb_build_object('id', t.id, 'item', t.item, 'label', i.label, 'kind', i.kind, 'cost_pk', t.cost_pk,
      'bought_at', t.bought_at, 'draw_at', t.draw_at, 'choice', t.choice, 'user_id', t.user_id, 'email', u.email::text, 'pseudo', p.pseudo,
      'count', (select count(*) from public.tickets t2 where t2.user_id = t.user_id and t2.item = t.item and t2.draw_at is not distinct from t.draw_at)) as x
    from public.tickets t
    join auth.users u on u.id = t.user_id
    left join public.profiles p on p.id = t.user_id
    left join public.game_items i on i.id = t.item
    where not exists (select 1 from public.shop_notices n where n.ticket_id = t.id)
      and t.bought_at >= (select since from public.shop_notice_start where k = 1)
    order by t.bought_at
    limit greatest(1, least(coalesce(lim, 20), 50))
  ) s;
$$;
-- Achats signalés (après l'envoi réussi de l'e-mail).
create or replace function public.shop_mark_sent(ids uuid[]) returns int
language plpgsql volatile security definer set search_path = '' as $$
declare n int;
begin
  insert into public.shop_notices (ticket_id) select distinct x from unnest(coalesce(ids, '{}'::uuid[])) as x
    where exists (select 1 from public.tickets t where t.id = x)
  on conflict (ticket_id) do nothing;
  get diagnostics n = row_count;
  return n;
end; $$;
revoke all on function public.shop_pending(int), public.shop_mark_sent(uuid[]) from public, anon, authenticated;
grant execute on function public.shop_pending(int), public.shop_mark_sent(uuid[]) to service_role;
