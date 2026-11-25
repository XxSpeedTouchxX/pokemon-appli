-- Requêtes du PK shop, à coller dans Supabase Studio › SQL Editor › New query, puis Run. Une requête à la fois.

-- 1. Nom du booster du PK shop dans l'e-mail d'achat et le panneau Admin (2026-11-24, porteur : « remplace le booster
-- 30 ans par le booster Règne Delta avec Rayquaza »). FACULTATIF : l'app affiche déjà « Booster Règne Delta » ; cette
-- requête change seulement le libellé que le serveur met dans l'e-mail envoyé à contact@dropicards.fr à chaque achat.
update public.game_items set label = 'Booster de la série du moment (Règne Delta)' where id = 'achat-booster';
select id, label from public.game_items where id = 'achat-booster';

-- 2. Stock du mois (lecture seule, après 040_stock_admin.sql) : articles vendus et restants de la période en cours,
-- achats des admins compris.
select s.item as "article", s.qty as "stock de la période",
  (select count(*) from public.tickets t where t.item = s.item and t.bought_at >= public._shop_period(now(), s.months)) as "vendus",
  (select count(*) from public.tickets t where t.item = s.item and t.cost_pk = 0 and t.bought_at >= public._shop_period(now(), s.months)) as "dont achats d'admin",
  greatest(0, s.qty - (select count(*) from public.tickets t where t.item = s.item and t.bought_at >= public._shop_period(now(), s.months))) as "restants"
from public.shop_stock s order by s.item;

-- 3. Rendre au stock les achats d'ESSAI faits en mode Admin pendant la période en cours (2026-11-25). Depuis 040, un
-- achat direct fait en mode Admin retire un article du stock, comme celui d'un joueur. Si c'était seulement un essai
-- (aucun article à envoyer), cette requête efface ces achats d'admin (enregistrés à 0 PK) et le stock remonte d'autant.
-- Les achats des joueurs ne sont jamais touchés. Enlève les deux tirets au début de la ligne « delete » pour l'activer.
-- delete from public.tickets t using public.shop_stock s
--   where t.item = s.item and t.cost_pk = 0 and t.bought_at >= public._shop_period(now(), s.months);
