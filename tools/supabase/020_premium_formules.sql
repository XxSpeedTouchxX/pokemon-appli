-- 020 : formules Premium trimestrielle et semestrielle (2026-11-10, porteur). Après 010. Rejouable.
--   Prix (porteur) : 9,90 € par mois, 24,90 € pour 3 mois, 39,90 € pour 6 mois, 69,90 € par an. Les prix eux-mêmes
--   sont dans Stripe (docs/28 § 8 ter) ; ici, la base accepte seulement les deux nouvelles formules.
do $$
begin
  if to_regclass('public.premium') is null then raise exception 'Installe d''abord 010_premium.sql, puis relance 020 (000_verifier.sql liste ce qui manque)'; end if;
end $$;
alter table public.premium drop constraint if exists premium_plan_check;
alter table public.premium add constraint premium_plan_check check (plan is null or plan in ('month', 'quarter', 'semester', 'year'));
