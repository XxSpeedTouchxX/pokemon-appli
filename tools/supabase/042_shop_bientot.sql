-- 042_shop_bientot.sql — PK shop : booster à 10 000 PK, item rare et ETB « Bientôt disponible » (2026-11-25, porteur :
-- « pour les boosters, remets à 10 le nombre de dispos et monte le prix à 10 000 PK ; remplace "Épuisé" sur l'item rare
-- au choix et l'ETB 30 ans par "Bientôt disponible" »).
--
--   - Booster de la série du moment : 10 000 PK (7 500 avant). buy_item prend toujours le prix de cette table.
--   - Item rare au choix et ETB 30 ans fermés (active = false) : buy_item les refuse (« Article indisponible ») ; l'app
--     affiche « Bientôt disponible » à la place du stock et de « Épuisé ».
--   - Stock du booster remis à 10 : voir requetes_boutique.sql, requête 4 (achats d'essai faits en mode Admin rendus au
--     stock). Ce script ne touche à aucun achat.
-- Rouvrir l'item rare ou l'ETB plus tard : requetes_boutique.sql, requête 5 (et retirer « soon » dans l'app).
-- À installer après 040 (fichier install_024_a_034.sql, qui le contient). Rejouable. Tests : tests/test_042.sql.

do $$ begin
  if to_regclass('public.shop_stock') is null or to_regclass('public.game_items') is null then
    raise exception 'Installe d''abord 018_lots_limites.sql et 040_stock_admin.sql';
  end if;
end $$;

update public.game_items set price_pk = 10000 where id = 'achat-booster';
update public.game_items set active = false where id in ('achat-rare', 'achat-etb-30');

-- Repère lu par 000_verifier.sql.
comment on table public.game_items is '042 : booster 10 000 PK, item rare et ETB bientôt disponibles';

notify pgrst, 'reload schema';
