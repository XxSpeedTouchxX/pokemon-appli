-- 034_recherche_dresseurs.sql — « Le coin des dresseurs » › « Ma vitrine » : rechercher un dresseur et voir sa vitrine
-- (2026-11-18, porteur : « il pourrait également rechercher tous les utilisateurs de l'appli et, en cliquant sur un
-- utilisateur, tomber sur la vitrine que celui-ci aura partagée, pour engager une discussion si une carte l'intéresse »).
--
--   - player_search(q, lim) : pour tout compte connecté.
--       · q vide : les dresseurs qui ont au moins une carte dans leur vitrine, la vitrine la plus récemment changée en
--         premier (« Vitrines des dresseurs »).
--       · q rempli (pseudo, 1 à 24 caractères, majuscules et accents comme tapés) : les dresseurs dont le pseudo contient
--         ce texte ; pseudo identique d'abord, puis qui commence par lui, puis le reste.
--     Pour chacun : identifiant, pseudo, avatar, grade et le nombre de cartes de sa vitrine (dont Pour trade et à vendre,
--     hors cartes déjà « d'accord »). Jamais l'adresse e-mail, l'âge, le rôle ni la collection.
--   - Comptes cachés : suspendus, sans pseudo, moi-même, et les moins de 15 ans (protection des mineurs : les échanges
--     commencent à 15 ans ; défaut à confirmer par le porteur). Les comptes admin sont trouvables comme les autres.
--   - Au plus 50 résultats par recherche. La vitrine elle-même s'ouvre avec player_showcase (033) et la carte de
--     dresseur avec player_card (031) ; les propositions passent par trade_send (033) : rien ne change pour elles.
-- À installer après 033 (fichier install_024_a_034.sql). Rejouable. Tests : tests/test_034.sql.

do $$ begin
  if to_regprocedure('public.player_showcase(uuid)') is null or to_regclass('public.showcase') is null then
    raise exception 'Installe d''abord 033_vitrine.sql (fichier install_024_a_034.sql)';
  end if;
end $$;

-- Recherche plus rapide sur le pseudo quand il y aura beaucoup de comptes.
create index if not exists profiles_pseudo_lower on public.profiles (lower(pseudo)) where pseudo is not null;
create index if not exists showcase_user on public.showcase (user_id);

create or replace function public.player_search(q text default '', lim int default 30) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  top_n int := least(greatest(coalesce(lim, 30), 1), 50);
  t text := lower(left(btrim(coalesce(q, '')), 24));
  pat text;
begin
  if uid is null then raise exception 'Connecte-toi à ton compte Dropicards.' using errcode = '42501'; end if;
  -- Les caractères spéciaux de LIKE (%, _ et \) sont cherchés tels quels.
  pat := '%' || replace(replace(replace(t, '\', '\\'), '%', '\%'), '_', '\_') || '%';
  return coalesce((select jsonb_agg(x.j order by x.rk, x.last_at desc nulls last, x.pseudo) from (
    select p.pseudo, v.last_at,
      case when t = '' then 0 when lower(p.pseudo) = t then 0 when left(lower(p.pseudo), char_length(t)) = t then 1 else 2 end as rk,
      jsonb_build_object('id', p.id, 'pseudo', p.pseudo, 'avatar', p.avatar, 'grade', public._game_grade(p.id),
        'cards', coalesce(v.n, 0), 'trade', coalesce(v.nt, 0), 'sale', coalesce(v.ns, 0)) as j
    from public.profiles p
    left join lateral (
      select count(*)::int as n, (count(*) filter (where s.for_trade and not s.deal))::int as nt,
             (count(*) filter (where s.for_sale and not s.deal))::int as ns, max(s.updated_at) as last_at
      from public.showcase s where s.user_id = p.id
    ) v on true
    where p.status = 'active' and p.pseudo is not null and p.id <> uid
      and p.age_range is distinct from 'u15'
      and ((t = '' and coalesce(v.n, 0) > 0) or (t <> '' and lower(p.pseudo) like pat escape '\'))
    order by 3, v.last_at desc nulls last, p.pseudo
    limit top_n) x), '[]'::jsonb);
end; $$;
revoke all on function public.player_search(text, int) from public, anon;
grant execute on function public.player_search(text, int) to authenticated;
