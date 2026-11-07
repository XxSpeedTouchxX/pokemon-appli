-- 011 : « Supprimer mon compte » (2026-11-07, « go » du porteur ; docs/23 §2 point 2, règle d'Apple 5.1.1(v), RGPD
-- article 17). Après 010. Rejouable.
--   Le joueur efface lui-même son compte depuis Mon profil (app et site) : compte de connexion, profil, collection en
--   ligne, porte-monnaie (PK, PA), Bestiaire, tickets, état Premium. Rien ne se récupère ensuite.
--   - Chemin normal : la fonction « stripe » du serveur (route delete_account) arrête d'abord tout abonnement Stripe en
--     cours, puis appelle account_delete(uid) avec la clé service_role.
--   - Repli (fonction pas encore installée) : l'app appelle delete_my_account() ; refusé tant qu'un abonnement Premium
--     se renouvelle encore (message « premium_actif »), pour ne jamais laisser un prélèvement sans compte.
--   Journaux gardés, mais anonymisés : le journal des PK et PA (ledger) et le journal des admins restent
--   ineffaçables ; la seule modification permise est d'effacer l'identifiant du compte supprimé (user_id ou admin_id
--   mis à vide, rien d'autre ne change). Les paiements reçus (premium_payments, obligations comptables) gardent leur
--   montant et leur date, sans lien avec le compte (déjà « on delete set null » depuis 010).
--   Chaque suppression est notée au journal des admins (compte visé, sans adresse e-mail).

-- 1. Journaux : effacer l'identifiant d'un compte supprimé est la seule modification permise.
create or replace function public._journal_anonymize_only() returns trigger language plpgsql set search_path = '' as $$
declare col text := tg_argv[0];
begin
  if tg_op = 'UPDATE' and (to_jsonb(old) ->> col) is not null and (to_jsonb(new) ->> col) is null
     and (to_jsonb(new) - col) = (to_jsonb(old) - col) then
    return new;
  end if;
  raise exception 'Ce journal ne peut être ni modifié ni effacé';
end; $$;
revoke all on function public._journal_anonymize_only() from public, anon, authenticated;

drop trigger if exists ledger_no_change on public.ledger;
create trigger ledger_no_change before update or delete on public.ledger
  for each row execute function public._journal_anonymize_only('user_id');
drop trigger if exists admin_log_no_change on public.admin_log;
create trigger admin_log_no_change before update or delete on public.admin_log
  for each row execute function public._journal_anonymize_only('admin_id');

-- 2. Journal des PK et PA : le compte supprimé laisse ses lignes, sans identifiant (au lieu d'empêcher la suppression).
alter table public.ledger alter column user_id drop not null;
do $$
declare c text;
begin
  for c in select conname from pg_constraint
    where conrelid = 'public.ledger'::regclass and contype = 'f' and confrelid = 'auth.users'::regclass loop
    execute format('alter table public.ledger drop constraint %I', c);
  end loop;
  alter table public.ledger add constraint ledger_user_id_fkey foreign key (user_id) references auth.users (id) on delete set null;
end $$;

-- 3. Suppression elle-même (interne) : note au journal des admins, puis effacement du compte (cascade sur le profil,
--    la collection, le porte-monnaie, le Bestiaire, les tickets, l'état Premium…).
create or replace function public._account_delete(uid uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if uid is null or not exists (select 1 from auth.users u where u.id = uid) then
    raise exception 'compte_introuvable';
  end if;
  insert into public.admin_log (admin_id, action, target_user, details, reason)
  values (null, 'account_deleted', uid, '{}'::jsonb, 'Suppression du compte demandée par le joueur');
  delete from auth.users u where u.id = uid;
end; $$;
revoke all on function public._account_delete(uuid) from public, anon, authenticated;

-- 4. Appel par le joueur connecté (repli de l'app quand la fonction « stripe » n'a pas la route delete_account).
create or replace function public.delete_my_account() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'non_connecte'; end if;
  if exists (select 1 from public.premium p where p.user_id = uid
             and p.status in ('active', 'trialing', 'past_due') and not p.cancel_at_period_end
             and (p.period_end is null or p.period_end > now())) then
    raise exception 'premium_actif';
  end if;
  perform public._account_delete(uid);
  return jsonb_build_object('deleted', true);
end; $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- 5. Appel par le serveur (fonction « stripe », clé service_role), après l'arrêt de l'abonnement chez Stripe.
create or replace function public.account_delete(uid uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  perform public._account_delete(uid);
  return jsonb_build_object('deleted', true);
end; $$;
revoke all on function public.account_delete(uuid) from public, anon, authenticated;
grant execute on function public.account_delete(uuid) to service_role;
