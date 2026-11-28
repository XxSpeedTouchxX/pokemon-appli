-- INSTALLATION EN UNE FOIS des scripts 043, 044 et 045 (024 à 042 déjà installés le 2026-11-25).
-- 043 (2026-11-25) : e-mail de félicitations au joueur après un achat direct (il faut aussi relancer
-- install-notify.sh dans Coolify, docs/30 § 9).
-- 044 (2026-11-26) : Safari éclair au délai du grade pour tous (admins compris).
-- 045 (2026-11-28) : mode Admin : le grade choisi dans le panneau Admin vaut aussi sur le serveur (pièce et Safari).
-- Supabase Studio › SQL Editor › New query › colle TOUT ce fichier › Run. Puis colle 000_verifier.sql › Run : les lignes
-- 043, 044 et 045 doivent être « oui ». Rejouable. Fichier fabriqué par tools/supabase/make_install_024.sh : ne pas le
-- modifier à la main.

-- ================= 043_mail_joueur_lot.sql =================
-- 043_mail_joueur_lot.sql — e-mail de félicitations au JOUEUR après un achat direct au PK shop (2026-11-25, porteur :
-- « lorsque l'utilisateur arrive à acheter un booster direct à 10 000 PK ou un autre item du PK shop comme l'item rare
-- ou l'ETB, qu'il reçoive automatiquement un mail de félicitations sur sa boîte mail, en remontrant le lot acheté et en
-- lui demandant son nom, prénom, adresse, code postal, adresse mail et numéro de téléphone, à renvoyer à l'adresse mail
-- de Dropicards pour qu'on puisse lui envoyer »).
--
--   - Achats directs seulement (articles de type « lot » : booster, item rare, ETB) ; jamais les tickets des tirages.
--   - La fonction « notify » du serveur (tools/supabase/functions/notify) lit la liste (shop_player_pending), envoie
--     l'e-mail à l'adresse du compte du joueur avec Brevo, puis marque l'achat (shop_player_mark_sent) : un e-mail par
--     achat, jamais deux ; un envoi raté repart au prochain achat (de n'importe quel joueur).
--   - Seuls les achats faits après l'installation de 043 reçoivent l'e-mail (pas l'historique).
--   - Achats faits en mode Admin compris : l'admin reçoit le même e-mail (pratique pour voir à quoi il ressemble).
--   - Lecture et écriture réservées au serveur (clé service_role) : un joueur n'y a pas accès.
-- À installer après 012 (Supabase Studio › SQL Editor › New query › colle ce fichier › Run). Rejouable.
-- Tests : tests/test_043.sql. Guide : docs/30 § 9.

do $$ begin
  if to_regclass('public.shop_notices') is null then
    raise exception 'Installe d''abord 012_shop_notices.sql';
  end if;
end $$;

create table if not exists public.shop_player_mails (
  ticket_id uuid primary key references public.tickets (id) on delete cascade,
  sent_at timestamptz not null default now()
);
alter table public.shop_player_mails enable row level security;
revoke all on public.shop_player_mails from anon, authenticated;

create table if not exists public.shop_player_mail_start (
  k int primary key default 1 check (k = 1),
  since timestamptz not null default now()
);
alter table public.shop_player_mail_start enable row level security;
revoke all on public.shop_player_mail_start from anon, authenticated;
insert into public.shop_player_mail_start (k) values (1) on conflict (k) do nothing;

-- Achats directs dont le joueur n'a pas encore reçu l'e-mail, du plus ancien au plus récent (50 au plus par envoi).
-- price_pk : prix de l'article (pour un achat fait en mode Admin, enregistré à 0 PK, l'e-mail montre le vrai prix).
create or replace function public.shop_player_pending(lim int default 20) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(x order by x->>'bought_at'), '[]'::jsonb) from (
    select jsonb_build_object('id', t.id, 'item', t.item, 'label', i.label, 'cost_pk', t.cost_pk, 'price_pk', i.price_pk,
      'choice', t.choice, 'bought_at', t.bought_at, 'user_id', t.user_id, 'email', u.email::text, 'pseudo', p.pseudo) as x
    from public.tickets t
    join auth.users u on u.id = t.user_id
    join public.game_items i on i.id = t.item
    left join public.profiles p on p.id = t.user_id
    where i.kind = 'lot'
      and coalesce(u.email, '') <> ''
      and not exists (select 1 from public.shop_player_mails m where m.ticket_id = t.id)
      and t.bought_at >= (select since from public.shop_player_mail_start where k = 1)
    order by t.bought_at
    limit greatest(1, least(coalesce(lim, 20), 50))
  ) s;
$$;

-- Achats dont l'e-mail est parti (après l'envoi réussi).
create or replace function public.shop_player_mark_sent(ids uuid[]) returns int
language plpgsql volatile security definer set search_path = '' as $$
declare n int;
begin
  insert into public.shop_player_mails (ticket_id) select distinct x from unnest(coalesce(ids, '{}'::uuid[])) as x
    where exists (select 1 from public.tickets t where t.id = x)
  on conflict (ticket_id) do nothing;
  get diagnostics n = row_count;
  return n;
end; $$;

revoke all on function public.shop_player_pending(int), public.shop_player_mark_sent(uuid[]) from public, anon, authenticated;
grant execute on function public.shop_player_pending(int), public.shop_player_mark_sent(uuid[]) to service_role;

-- Repère lu par 000_verifier.sql.
comment on table public.shop_player_mails is '043 : e-mail de félicitations au joueur après un achat direct';

notify pgrst, 'reload schema';

-- ================= 044_safari_delai.sql =================
-- 044_safari_delai.sql — Safari éclair : une partie toutes les X heures selon le grade, pour TOUS les comptes
-- (2026-11-26, porteur : « pour le Safari éclair, mets bien le délai en rapport avec les grades ; actuellement je suis
-- Collectionneur et j'ai joué autant de fois que je voulais ; mets la limite à 1 fois toutes les X heures en fonction du
-- grade actuel »).
--
--   - Cause : depuis 027 (2026-11-13), les comptes admin, le mode Admin (mot de passe des admins) et les comptes de la
--     liste safari_free jouaient au Safari sans délai.
--   - Désormais, plus aucune exception : Collectionneur 1 partie toutes les 24 h, Dresseur Pokémon 12 h, Maître Pokémon
--     6 h, Grand maître Pokémon 4 h ; fermé à la Recrue et au Chasseur (inchangé, 039). Admins et liste safari_free
--     compris. La table safari_free est gardée (rien d'effacé) mais n'est plus lue.
--   - safari_state, safari_start et safari_finish (027, 039) demandent tous « _safari_free » : il répond toujours
--     « non », donc le délai du grade s'applique partout, et les rappels « Safari éclair prêt » (036) partent aussi.
--   - Booster PK et pièce : inchangés (le mode Admin garde leurs parties sans délai).
-- À installer après 039 (Supabase Studio › SQL Editor › New query › colle ce fichier › Run). Rejouable.
-- Revenir en arrière (sans délai pour les admins et la liste) : relancer 027_safari_libre.sql puis 039_jeux_grades.sql.
-- Tests : tests/test_044.sql.

do $$ begin
  if to_regprocedure('public._safari_free(uuid)') is null or to_regprocedure('public.safari_start(uuid,integer)') is null then
    raise exception 'Installe d''abord 027_safari_libre.sql et 039_jeux_grades.sql';
  end if;
end $$;

create or replace function public._safari_free(uid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select false;
$$;
revoke all on function public._safari_free(uuid) from public, anon, authenticated;

-- Repère lu par 000_verifier.sql.
comment on function public._safari_free(uuid) is '044 : Safari éclair au délai du grade pour tous, sans exception';

notify pgrst, 'reload schema';

-- ================= 045_grade_admin.sql =================
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

-- Fin : l'API de Supabase relit la liste des fonctions.
notify pgrst, 'reload schema';
