-- 017 : « Supprimer mon compte » (2026-11-09, demande du porteur pour la publication sur Google Play ; docs/23 §2).
-- Après 016. Rejouable.
-- Google Play et l'App Store exigent qu'une app où l'on crée un compte permette de le supprimer depuis l'app.
-- Le joueur connecté efface lui-même son compte, en une fois et pour de bon :
--   - sa connexion (auth.users : adresse, mot de passe, Face ID / empreinte) ;
--   - en cascade : profil, porte-monnaie (PK, PA), Pokédex, tickets, avatar et styles achetés, 2XP PK, Premium,
--     et son journal des PK et des PA (ledger), qui ne s'efface jamais autrement ;
--   - les paiements Premium déjà reçus restent pour la comptabilité (obligation de 10 ans), sans lien avec le compte.
-- Refusé, avec un message clair :
--   - un compte admin (retirer d'abord le rôle dans Studio : le journal des admins garde ses actions) ;
--   - un abonnement Premium en cours dont l'arrêt n'est pas demandé (sinon Stripe continuerait de prélever).

-- 1. Le journal des PK et des PA reste intouchable, sauf pendant la suppression du compte de son propriétaire,
--    faite par delete_my_account() ci-dessous (un joueur n'a aucun droit d'effacer une ligne lui-même).
create or replace function public.ledger_readonly() returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'DELETE' and coalesce(current_setting('dropicards.erase_user', true), '') = old.user_id::text then
    return old;
  end if;
  raise exception 'Le journal des PK et des PA ne peut être ni modifié ni effacé';
end; $$;
drop trigger if exists ledger_no_change on public.ledger;
create trigger ledger_no_change before update or delete on public.ledger
  for each row execute function public.ledger_readonly();

-- 2. Suppression du compte connecté.
create or replace function public.delete_my_account() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  p record;
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards pour le supprimer.'; end if;
  if exists (select 1 from public.profiles where id = uid and role = 'admin')
     or exists (select 1 from public.admin_log where admin_id = uid) then
    raise exception 'Ce compte est un compte admin : il ne peut pas être supprimé depuis l’app. Écris-nous à contact@dropicards.fr.';
  end if;
  select * into p from public.premium where user_id = uid;
  if found and p.status in ('active', 'trialing', 'past_due', 'unpaid', 'paused') and not p.cancel_at_period_end
     and coalesce(p.period_end, now()) > now() then
    raise exception 'Ton abonnement Premium est encore actif : arrête-le d’abord (sur dropicards.fr, ou en écrivant à contact@dropicards.fr), puis supprime ton compte.';
  end if;
  perform set_config('dropicards.erase_user', uid::text, true);
  update public.premium_payments set user_id = null where user_id = uid;
  delete from auth.users where id = uid;
  perform set_config('dropicards.erase_user', '', true);
  return jsonb_build_object('ok', true);
end; $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
