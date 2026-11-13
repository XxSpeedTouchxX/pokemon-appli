-- 000 : vérifier quels scripts sont installés sur le serveur (2026-11-10).
-- À coller dans Supabase Studio › SQL Editor › Run, à tout moment : il ne modifie rien, il lit seulement.
-- Résultat : une ligne par script, « oui » s'il est en place, « NON » s'il manque. Les scripts s'installent dans
-- l'ordre des numéros : installe le premier « NON », relance ce contrôle, et ainsi de suite.
-- 002, 009 et 015 ne laissent pas de trace propre à eux (ils corrigent d'autres fonctions) : ils ne sont pas listés.
select script, case when ok then 'oui' else 'NON' end as installe, role
from (values
  ('001_comptes', to_regclass('public.wallets') is not null, 'comptes, porte-monnaie'),
  ('003_inscription', to_regprocedure('public.handle_new_user()') is not null, 'profil créé à l''inscription'),
  ('004_jeu', to_regprocedure('public.open_booster(uuid)') is not null, 'jeux tenus par le serveur'),
  ('005_jetables', to_regclass('public.disposable_domains') is not null, 'adresses jetables refusées'),
  ('006_admin_2fa', to_regprocedure('public.is_admin()') is not null, 'admins'),
  ('007_admin_boutique', to_regprocedure('public._game_free(uuid)') is not null, 'mot de passe des admins, PK shop'),
  ('008_shop_grades', exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'game_items' and column_name = 'min_grade'), 'PK shop par grade'),
  ('010_premium', to_regclass('public.premium') is not null, 'abonnement Premium'),
  ('012_shop_notices', to_regclass('public.shop_notices') is not null, 'e-mail de chaque achat'),
  ('013_saisons', to_regprocedure('public.season_board(integer)') is not null, 'saisons, classement'),
  ('014_avatar', to_regprocedure('public.avatar_state()') is not null, 'avatar'),
  ('016_xp_pk', to_regclass('public.pk_boost_offers') is not null, '2XP PK'),
  ('017_suppression_compte', to_regprocedure('public.delete_my_account()') is not null, 'supprimer mon compte'),
  ('018_lots_limites', to_regclass('public.shop_stock') is not null, 'lots limités, tirage mensuel'),
  ('019_boite_mystere (1re version)', to_regclass('public.mystery_lots') is not null, 'boîte mystère, scans bonus'),
  ('019_boite_mystere (version du 9 novembre au soir)', to_regprocedure('public.open_gift_box(uuid)') is not null, '2XP PA, PA jusqu''à 80, boîte offerte'),
  ('021_avatar_v2', exists (select 1 from public.avatar_items where id = 'acc:couronne'), 'avatar v2 : accessoires, shiny'),
  ('023_boite_legendaires', to_regprocedure('public._mystery_weights(uuid,boolean)') is not null, 'boîte mystère : légendaires barrés'),
  ('022_avatar_v3', exists (select 1 from public.avatar_items where id = 'frame:lave'), 'avatar v3 : Pokémon d''avatar, cadres'),
  ('024_safari', to_regprocedure('public.safari_start(uuid)') is not null, 'jeu Safari éclair'),
  ('025_suivi_joueurs', to_regprocedure('public.admin_players()') is not null, 'Admin › Joueurs, temps passé dans l''app'),
  ('026_safari_niveaux', to_regprocedure('public.safari_start(uuid,integer)') is not null, 'Safari : 3 niveaux de difficulté'),
  ('027_safari_libre', to_regclass('public.safari_free') is not null, 'Safari sans délai (admins, comptes choisis)'),
  ('020_premium_formules', exists (select 1 from pg_constraint where conname = 'premium_plan_check' and pg_get_constraintdef(oid) like '%quarter%'), 'Premium trimestriel et semestriel')
) as t(script, ok, role)
order by script;
