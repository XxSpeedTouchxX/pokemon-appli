-- Remettre un compte à zéro dans le jeu, comme un nouveau joueur (2026-11-25, porteur : « rappelle-moi la commande pour
-- enlever les stats que j'ai mises à quelqu'un, pour le faire recommencer à 0 sur l'app »). C'est l'inverse de
-- requetes_grade.sql (grade et PA offerts).
-- Supabase Studio › SQL Editor › New query. Une requête à la fois : remplace l'adresse (ligne marquée « ← »), puis Run.

-- 1. VOIR le compte avant (lecture seule, rien ne change) : grade, PK, PA, PK gagnés au total, Pokémon débloqués.
select u.email, p.pseudo, g.name as "grade", w.pk as "PK", w.pa as "PA", w.pk_earned as "PK gagnés au total",
  (select count(*) from public.dex_unlocks d where d.user_id = u.id) as "Pokémon débloqués"
from auth.users u join public.profiles p on p.id = u.id left join public.wallets w on w.user_id = u.id
  left join public.game_grades g on g.i = public._game_grade(u.id)
where lower(u.email) = lower(trim('ADRESSE-DU-COMPTE@exemple.fr'));   -- ← adresse e-mail du compte

-- 2. REMETTRE À ZÉRO. Ce que ça fait :
--   - PK à 100 (le cadeau de bienvenue), PA à 0, « PK gagnés au total » à 100 : grade Recrue ;
--   - série des PA du jour remise au jour 1 ;
--   - Pokédex vidé (seul son starter reste, il est toujours offert) ; son compagnon redevient son starter ;
--   - 2XP PK et 2XP PA en cours, coffres mystère offerts et scans bonus retirés ;
--   - « Mon avatar » : styles et Pokémon d'avatar achetés retirés, avatar de départ remis ;
--   - retiré de la liste « Safari sans délai » s'il y était ;
--   - une ligne dans son historique des PK et PA (« remise à zéro ») et une dans le journal admin.
-- Ce qui NE change PAS : le compte lui-même (adresse, pseudo, mot de passe), son DropiPass s'il en a un, ses tickets
-- et achats du PK shop, ses points de loyauté (PL) et sa place dans « Ma ligue », sa vitrine.
-- Sur son téléphone, tout se met à jour à sa prochaine ouverture de l'app.
do $$
declare
  ami text := 'ADRESSE-DU-COMPTE@exemple.fr';   -- ← adresse e-mail du compte à remettre à zéro
  uid uuid;
  w public.wallets;
  achetes int := 0;
begin
  select id into uid from auth.users where lower(email) = lower(trim(ami));
  if uid is null then raise exception 'Aucun compte avec l''adresse %', ami; end if;
  if exists (select 1 from public.profiles where id = uid and role = 'admin') then
    raise exception 'Le compte % est un compte admin : remise à zéro refusée par sécurité', ami;
  end if;
  select * into w from public.wallets where user_id = uid for update;
  if w.user_id is null then raise exception 'Le compte % n''a pas encore de porte-monnaie : rien à remettre à zéro', ami; end if;
  if to_regclass('public.pa_purchases') is not null then
    execute 'select coalesce(sum(pa_given - pa_taken), 0) from public.pa_purchases where user_id = $1' into achetes using uid;
  end if;

  -- Porte-monnaie et grade.
  update public.wallets set pk = 100, pa = 0, pk_earned = 100, pa_streak = 0, pa_day = null, updated_at = now() where user_id = uid;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'wallets' and column_name = 'pa_run') then
    execute 'update public.wallets set pa_run = 0 where user_id = $1' using uid;
  end if;
  insert into public.ledger (user_id, kind, pk, pa, pk_after, pa_after, ref)
  values (uid, 'admin', 100 - w.pk, -w.pa, 100, 0, 'remise à zéro');

  -- Pokédex, compagnon, avatar.
  delete from public.dex_unlocks where user_id = uid;
  update public.profiles set buddy = starter, updated_at = now() where id = uid;
  if to_regclass('public.avatar_unlocks') is not null then
    execute 'delete from public.avatar_unlocks where user_id = $1' using uid;
    update public.profiles set avatar = null where id = uid;
  end if;

  -- Bonus en cours (scripts 016, 019, 027 : ignorés s'ils ne sont pas installés).
  if to_regclass('public.pk_boosts') is not null then execute 'delete from public.pk_boosts where user_id = $1' using uid; end if;
  if to_regclass('public.pa_boosts') is not null then execute 'delete from public.pa_boosts where user_id = $1' using uid; end if;
  if to_regclass('public.mystery_gifts') is not null then execute 'delete from public.mystery_gifts where user_id = $1' using uid; end if;
  if to_regclass('public.scan_bonus') is not null then execute 'delete from public.scan_bonus where user_id = $1' using uid; end if;
  if to_regclass('public.safari_free') is not null then execute 'delete from public.safari_free where user_id = $1' using uid; end if;

  insert into public.admin_log (admin_id, action, target_user, details, reason)
  values (null, 'reset', uid, jsonb_build_object('pk_avant', w.pk, 'pa_avant', w.pa, 'pk_gagnes_avant', w.pk_earned),
    'Remise à zéro par le porteur depuis Studio');
  raise notice 'Compte % remis à zéro : grade %, 100 PK, 0 PA (avant : % PK, % PA, % PK gagnés au total).',
    ami, (select name from public.game_grades where i = public._game_grade(uid)), w.pk, w.pa, w.pk_earned;
  if achetes > 0 then
    raise notice 'Attention : ce compte avait acheté % PA en euros (Recharger mes PA). Ils sont remis à 0 eux aussi.', achetes;
  end if;
end $$;
