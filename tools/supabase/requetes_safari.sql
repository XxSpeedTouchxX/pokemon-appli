-- ⚠ DEPUIS 044_safari_delai.sql (2026-11-26, porteur : « mets la limite à 1 fois toutes les X heures en fonction du
-- grade actuel ») : cette liste N'A PLUS D'EFFET. Tout le monde, admins et comptes de la liste compris, joue au Safari
-- au délai de son grade. Les requêtes ci-dessous restent pour l'historique ; pour revenir à l'ancien fonctionnement,
-- relancer 027_safari_libre.sql puis 039_jeux_grades.sql.
--
-- Safari éclair sans délai pour un compte (2026-11-13, porteur : « Safari illimité pour l'instant pour les admins et le
-- compte de mon ami »). Il faut 027_safari_libre.sql installé (install_024_a_033.sql). Les comptes admin sont déjà
-- sans délai ; ici, on ajoute (ou retire) un autre compte. Supabase Studio › SQL Editor › New query › Run.
-- Depuis 039 (2026-11-23, porteur) : « sans délai » retire seulement l'attente entre deux parties ; le Safari reste
-- fermé sous le grade Collectionneur, même pour un compte de la liste ou un admin (offrir un grade : requetes_grade.sql).

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
