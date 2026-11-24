-- Vérifier les 2XP d'un compte (2026-11-24, porteur : « j'ai l'impression que je n'ai pas eu de double XP sur mes PK
-- aujourd'hui »). LECTURE SEULE : rien n'est modifié. Supabase Studio › SQL Editor › New query : colle tout, remplace
-- l'adresse (3 fois), puis Run. Studio montre le résultat de la dernière requête : lance-les une par une (sélectionne
-- les lignes d'une requête, puis Run) pour voir chaque tableau.

-- 1. 2XP en cours : fin du 2XP PK, fin du 2XP PA, DropiPass.
--    « 2XP PK jusqu'au » vide ou passé = pas de 2XP PK en ce moment : les gains de PK ne sont pas doublés.
select u.email,
  (select until from public.pk_boosts b where b.user_id = u.id) as "2XP PK jusqu'au",
  (select until > now() from public.pk_boosts b where b.user_id = u.id) as "2XP PK actif",
  (select until from public.pa_boosts b where b.user_id = u.id) as "2XP PA jusqu'au",
  (select status || coalesce(' jusqu''au ' || to_char(period_end at time zone 'Europe/Paris', 'DD/MM/YYYY'), '') from public.premium p where p.user_id = u.id) as "DropiPass",
  (select xp_gift_at from public.premium p where p.user_id = u.id) as "2XP PK offert par le DropiPass le"
from auth.users u where lower(u.email) = lower('TON-ADRESSE@exemple.fr');

-- 2. Gains de PK et de PA d'aujourd'hui (heure de Paris), du plus récent au plus ancien.
--    « Doublé » = oui quand le serveur a appliqué le 2XP (Booster PK, pile ou face, Safari, PA du jour).
select to_char(l.at at time zone 'Europe/Paris', 'HH24:MI') as heure,
  case l.kind when 'booster' then 'Booster PK' when 'coin' then 'Pile ou face' when 'safari' then 'Safari éclair'
    when 'pa_day' then 'PA du jour' when 'mystery' then 'Boîte mystère' else l.kind end as jeu,
  l.pk as "PK", l.pa as "PA",
  case when l.ref like '%2XP PK%' or l.ref like '%2XP PA%' or l.ref like '%×2%' then 'oui' when l.pk > 0 or l.pa > 0 then 'non' else '' end as "doublé",
  l.ref as détail
from public.ledger l join auth.users u on u.id = l.user_id
where lower(u.email) = lower('TON-ADRESSE@exemple.fr')
  and l.kind in ('booster', 'coin', 'safari', 'pa_day', 'mystery')
  and (l.at at time zone 'Europe/Paris')::date = (now() at time zone 'Europe/Paris')::date
order by l.at desc;

-- 3. Les 2XP gagnés dans la boîte mystère (30 derniers jours) : quel lot, quand.
select to_char(l.at at time zone 'Europe/Paris', 'DD/MM HH24:MI') as quand, l.ref as lot
from public.ledger l join auth.users u on u.id = l.user_id
where lower(u.email) = lower('TON-ADRESSE@exemple.fr') and l.kind = 'mystery' and l.at > now() - interval '30 days'
order by l.at desc;
