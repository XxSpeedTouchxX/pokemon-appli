-- 045_grade_admin.sql — Grade choisi en mode Admin, suivi aussi par le serveur (2026-11-28, porteur : « je suis en mode
-- admin en Grand maître Pokémon et je ne peux pas relancer la pièce ; il est marqué réservé au grade Collectionneur, et
-- pareil pour le Safari ; fais en sorte qu'à partir du grade Collectionneur on ait le lancer de la pièce, pas que pour le
-- grade Collectionneur »).
--
--   - Cause : le grade choisi dans le panneau Admin (Mode Admin › Grade) ne changeait que l'app. Le serveur gardait le
--     vrai grade du compte (PK gagnés, Pokédex) : la pièce était refusée et le Safari affiché « fermé », alors que l'app
--     montrait le grade Grand maître Pokémon.
--   - Désormais, l'app envoie au serveur le grade choisi (admin_force_grade). Le serveur s'en sert pour CE compte admin,
--     seulement tant que le mode Admin est ouvert (mot de passe des admins tapé depuis moins de 24 h, 007) et seulement
--     pour ses propres actions : les autres joueurs voient toujours son vrai grade (carte de dresseur, Ma ligue,
--     recherche des dresseurs, messages). « Auto » ou la sortie du mode Admin efface le grade choisi.
--   - Règles inchangées, valables pour le grade atteint ET tous ceux au-dessus : pièce dès Chasseur, Safari éclair dès
--     Collectionneur ; délais du grade (pièce : 24, 12, 8, 6, 4 h ; Safari : 24, 12, 6, 4 h). Le mode Admin garde la
--     pièce et le Booster PK sans délai ; le Safari garde le délai du grade (044).
-- À installer après 044 (Supabase Studio › SQL Editor › New query › colle ce fichier › Run). Rejouable.
-- Revenir en arrière : relancer 011_grades_v4.sql (seulement sa fonction _game_grade) ; la table admin_grade peut rester.
-- Tests : tests/test_045.sql.

do $$ begin
  if to_regprocedure('public._game_free(uuid)') is null or to_regclass('public.game_grades') is null
     or to_regprocedure('public._safari_free(uuid)') is null then
    raise exception 'Installe d''abord 007_admin_boutique.sql, 011_grades_v4.sql et 044_safari_delai.sql';
  end if;
end $$;

-- 1. Grade choisi par un admin (une ligne par compte admin, effacée avec le compte).
create table if not exists public.admin_grade (
  user_id uuid primary key references auth.users (id) on delete cascade,
  grade int not null check (grade between 0 and 20),
  set_at timestamptz not null default now()
);
alter table public.admin_grade enable row level security;
revoke all on public.admin_grade from public, anon, authenticated;

-- 2. Vrai grade (corps de 011, inchangé) : PK gagnés au total, compagnons et méga-évolutions débloqués.
create or replace function public._game_grade_natural(uid uuid) returns int
language sql stable security definer set search_path = '' as $$
  with c as (
    select coalesce((select pk_earned from public.wallets where user_id = uid), 0) as pk,
           (select count(*) from public.game_pokemon g where public._game_owns(uid, g.n)) as comp,
           (select count(*) from public.dex_unlocks d join public.game_pokemon g on g.n = d.pokemon where d.user_id = uid and g.mega) as mega
  )
  select coalesce(max(gr.i), 0) from public.game_grades gr, c where c.pk >= gr.pk_earned and c.comp >= gr.comp and c.mega >= gr.mega;
$$;
revoke all on function public._game_grade_natural(uuid) from public, anon, authenticated;

-- 3. Grade utilisé partout (jeux, PK shop, état du jeu) : celui choisi en mode Admin pour les actions du compte admin
--    lui-même (auth.uid() = uid) tant que le mode Admin est ouvert, sinon le vrai grade.
create or replace function public._game_grade(uid uuid) returns int
language sql stable security definer set search_path = '' as $$
  select coalesce(
    (select least(a.grade, (select max(i) from public.game_grades)) from public.admin_grade a
      where a.user_id = uid and uid = auth.uid() and public._game_free(uid)),
    public._game_grade_natural(uid));
$$;
revoke all on function public._game_grade(uuid) from public, anon, authenticated;

-- 4. Choisir le grade en mode Admin (app : Mode Admin › Grade). g = null (ou < 0) : « Auto », vrai grade.
--    Choisir un grade demande le mode Admin ouvert ; revenir à « Auto » est toujours permis (sa propre ligne).
create or replace function public.admin_force_grade(g int) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid := auth.uid(); top int; had int;
begin
  if uid is null then raise exception 'Connexion requise' using errcode = '28000'; end if;
  select grade into had from public.admin_grade where user_id = uid;
  if g is null or g < 0 then
    delete from public.admin_grade where user_id = uid;
    if had is not null and public._game_free(uid) then
      insert into public.admin_log (admin_id, action, target_user, details, reason)
      values (uid, 'force_grade', uid, jsonb_build_object('grade', null, 'before', had), 'Mode Admin : grade remis sur Auto');
    end if;
    return jsonb_build_object('ok', true, 'grade', public._game_grade(uid), 'forced', false);
  end if;
  if not public._game_free(uid) then
    raise exception 'Mode Admin fermé : tape le mot de passe des admins' using errcode = '42501';
  end if;
  select max(i) into top from public.game_grades;
  if g > top then raise exception 'Grade inconnu' using errcode = '22023'; end if;
  insert into public.admin_grade (user_id, grade, set_at) values (uid, g, now())
    on conflict (user_id) do update set grade = excluded.grade, set_at = excluded.set_at;
  if had is distinct from g then
    insert into public.admin_log (admin_id, action, target_user, details, reason)
    values (uid, 'force_grade', uid, jsonb_build_object('grade', g, 'before', had), 'Mode Admin : grade choisi pour tester les jeux');
  end if;
  return jsonb_build_object('ok', true, 'grade', public._game_grade(uid), 'forced', true);
end; $$;
revoke all on function public.admin_force_grade(int) from public, anon;
grant execute on function public.admin_force_grade(int) to authenticated;

-- Repère lu par 000_verifier.sql.
comment on function public.admin_force_grade(int) is '045 : grade choisi en mode Admin, suivi par le serveur';

notify pgrst, 'reload schema';
