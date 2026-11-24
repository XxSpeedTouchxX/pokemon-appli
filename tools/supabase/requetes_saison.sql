-- Date de départ de la saison 1 de « Ma ligue » (2026-11-24, porteur : « pour la saison 1, lève le chrono et mets
-- "Commence bientôt", pour l'instant pas assez de monde pour commencer »).
-- En attendant, l'app affiche « Commence bientôt » (sans compte à rebours ni dates) et les PL gagnés comptent déjà pour
-- la saison 1. Le jour où tu décides du départ : Supabase Studio › SQL Editor › New query, colle UNE des deux requêtes,
-- change la date, puis Run. Rien d'autre à faire : l'app lit la date du serveur.
--   - date dans le futur : l'app affiche « Commence le 1ᵉʳ décembre » et « Dans 6 j 4 h » ;
--   - une fois la date passée : « Se termine dans … », dates de la saison et barre (60 jours).
-- Les saisons suivantes s'enchaînent toutes seules tous les 60 jours après ce départ.

-- 1. Voir la date de départ actuelle et la saison en cours (lecture seule).
select start_at at time zone 'Europe/Paris' as "départ (heure de Paris)", days as "jours par saison",
  public._season_at(now()) as "saison en cours"
from public.game_season where id = 1;

-- 2. Fixer le départ de la saison 1 (exemple : lundi 1ᵉʳ décembre 2026 à minuit, heure de Paris).
--    Avant le départ, les PL gagnés restent ceux de la saison 1 : le classement repart avec eux.
-- update public.game_season set start_at = '2026-12-01 00:00:00 Europe/Paris' where id = 1;
