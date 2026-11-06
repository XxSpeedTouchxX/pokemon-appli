// Produit tools/supabase/005_jetables.sql : refus des adresses e-mail jetables (porteur, 2026-11-06).
// Liste : disposable_domains.txt, copie de disposable-email-domains/disposable_email_blocklist.conf (domaine public,
// CC0 1.0, https://github.com/disposable-email-domains/disposable-email-domains), relevée le 2026-11-06.
// Mise à jour : recopier la liste, puis node tools/supabase/gen_disposable.mjs, puis lancer 005 dans Supabase.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url));
const list = readFileSync(join(HERE, 'disposable_domains.txt'), 'utf8').split('\n').map(s => s.trim()).filter(s => /^[a-z0-9.-]+\.[a-z0-9-]+$/.test(s));
const chunks = [];
for (let i = 0; i < list.length; i += 1000) chunks.push('insert into public.disposable_domains (domain) values\n  ' + list.slice(i, i + 1000).map(d => "('" + d + "')").join(', ') + '\non conflict do nothing;');
const sql = `-- 005 : adresses e-mail jetables refusées à l'inscription et au changement d'adresse (porteur, 2026-11-06).
-- Fichier produit par node tools/supabase/gen_disposable.mjs (liste CC0 de disposable-email-domains, ${list.length} domaines,
-- relevée le 2026-11-06). Les sous-domaines sont refusés aussi (x.yopmail.com). Rejouable.
create table if not exists public.disposable_domains (domain text primary key);
alter table public.disposable_domains enable row level security;
revoke all on public.disposable_domains from anon, authenticated;
${chunks.join('\n')}

create or replace function public.auth_refuse_disposable() returns trigger
language plpgsql security definer set search_path = '' as $$
declare d text := lower(split_part(coalesce(new.email, ''), '@', 2));
begin
  if d <> '' and exists (select 1 from public.disposable_domains x where d = x.domain or d like '%.' || x.domain) then
    raise exception 'Adresse e-mail jetable refusée' using errcode = '23514';
  end if;
  return new;
end; $$;
revoke all on function public.auth_refuse_disposable() from public, anon, authenticated;
drop trigger if exists refuse_disposable on auth.users;
create trigger refuse_disposable before insert or update of email on auth.users
  for each row execute function public.auth_refuse_disposable();
`;
writeFileSync(join(HERE, '005_jetables.sql'), sql);
console.log('005_jetables.sql : ' + list.length + ' domaines, ' + Math.round(sql.length / 1024) + ' Ko');
