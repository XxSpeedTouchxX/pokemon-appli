-- Safari éclair sans délai pour un compte (2026-11-13, porteur : « Safari illimité pour l'instant pour les admins et le
-- compte de mon ami »). Il faut 027_safari_libre.sql installé (install_024_a_028.sql). Les comptes admin sont déjà
-- sans délai ; ici, on ajoute (ou retire) un autre compte. Supabase Studio › SQL Editor › New query › Run.

-- 1. AJOUTER un compte : remplace l'adresse, puis Run.
insert into public.safari_free (user_id, note)
select id, 'ajouté par le porteur' from auth.users where lower(email) = lower('ADRESSE-DE-TON-AMI@exemple.fr')
on conflict (user_id) do nothing;

-- 2. VOIR la liste (sélectionne ces lignes seulement, puis Run).
-- select u.email, f.note, f.added_at from public.safari_free f join auth.users u on u.id = f.user_id order by f.added_at;

-- 3. RETIRER un compte (enlève les deux tirets du début, remplace l'adresse, sélectionne la ligne, Run).
-- delete from public.safari_free where user_id = (select id from auth.users where lower(email) = lower('ADRESSE-DE-TON-AMI@exemple.fr'));

-- 4. TOUT ARRÊTER (plus personne sans délai, sauf les admins) : enlève les deux tirets, sélectionne la ligne, Run.
-- delete from public.safari_free;
