-- 003 : à l'inscription depuis l'app, le profil est rempli avec le pseudo, la tranche d'âge, le starter et l'accord
-- pour les nouveautés envoyés par l'app (2026-11-06). Ces valeurs viennent de l'utilisateur : chacune est vérifiée et
-- mise de côté si elle n'est pas valable (l'inscription n'échoue jamais pour elles). Le rôle, le statut et les PK ne
-- sont jamais lus. Les moins de 15 ans ne reçoivent jamais les nouveautés (règle profiles_news_rules). Rejouable.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  p text := nullif(btrim(regexp_replace(coalesce(m->>'pseudo', ''), '\s+', ' ', 'g')), '');
  a text := m->>'age_range';
  st int := case when coalesce(m->>'starter', '') in ('1', '4', '7', '25') then (m->>'starter')::int end;
begin
  if p is not null and char_length(p) not between 2 and 24 then p := null; end if;
  if a is null or a not in ('u15', '15-25', '25-35', '35+') then a := null; end if;
  insert into public.profiles (id, pseudo, age_range, starter, buddy, news_optin)
    values (new.id, p, a, st, st, coalesce(m->>'news_optin', '') = 'true')
    on conflict (id) do nothing;
  insert into public.wallets (user_id, pk, pk_earned) values (new.id, 100, 100) on conflict (user_id) do nothing;
  return new;
end; $$;
