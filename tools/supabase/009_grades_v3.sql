-- 009 : délais des jeux selon les nouveaux avantages des grades (2026-11-07, listes du porteur). Après 008. Rejouable.
--   Booster PK : Recrue 24 h, Chasseur 20 h, Collectionneur 12 h, Dresseur Pokémon 8 h, Maître Pokémon 6 h,
--   Grand maître Pokémon 4 h. Pile ou face : fermée à la Recrue, puis 24 h, 12 h, 8 h, 6 h, 4 h.
--   (Classeur limité, scans par jour et Radar dès Maître Pokémon sont tenus par l'app : la collection est encore sur
--   l'appareil.)
update public.game_grades g set booster_h = v.b, coin_h = v.c
from (values (0, 24, 0), (1, 20, 24), (2, 12, 12), (3, 8, 8), (4, 6, 6), (5, 4, 4)) as v(i, b, c)
where g.i = v.i;
