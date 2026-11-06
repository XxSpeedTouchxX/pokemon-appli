-- 006 : double authentification obligatoire pour les admins (2026-11-06, « go » du porteur, docs/25 étape D).
-- Un compte « admin » n'a ses droits d'admin (outils admin, lecture des autres comptes, journal) que s'il s'est
-- connecté avec son code à 6 chiffres de l'application d'authentification (niveau « aal2 » de Supabase). Un mot de
-- passe volé ne suffit donc plus. Le tableau de bord Supabase (Studio) n'est pas concerné : il a sa propre protection.
-- Rejouable.
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
     and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin' and status = 'active');
$$;
