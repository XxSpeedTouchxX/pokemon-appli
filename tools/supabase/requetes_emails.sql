-- Requêtes pour récupérer les adresses e-mail des comptes (2026-11-12, porteur).
-- À coller dans Supabase Studio › SQL Editor › Run. Elles lisent seulement : rien n'est modifié.
-- Lance UNE requête à la fois (sélectionne-la, puis Run). Le résultat s'exporte avec le bouton « Export » › CSV,
-- au-dessus du tableau. Garde le fichier pour toi : ce sont des données personnelles (RGPD).

-- 1. Combien de comptes ? (total, créés aujourd'hui, ayant accepté les nouveautés)
select count(*) as comptes,
       count(*) filter (where u.created_at >= date_trunc('day', now() at time zone 'Europe/Paris') at time zone 'Europe/Paris') as crees_aujourdhui,
       count(*) filter (where p.news_optin and p.status = 'active' and coalesce(p.age_range, '') <> 'u15') as nouveautes_ok
from auth.users u left join public.profiles p on p.id = u.id;

-- 2. Tous les comptes, du plus récent au plus ancien (pour ton suivi interne, PAS pour envoyer de la publicité).
select u.email, p.pseudo, p.age_range as age, p.news_optin as nouveautes_ok,
       u.email_confirmed_at is not null as adresse_verifiee,
       to_char(u.created_at at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as cree_le,
       to_char(u.last_sign_in_at at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as derniere_connexion
from auth.users u left join public.profiles p on p.id = u.id
order by u.created_at desc;

-- 3. Les seules adresses à qui tu peux envoyer des nouveautés (newsletter, annonces) :
--    case « nouveautés » cochée, compte actif, 15 ans et plus. Les autres ne reçoivent que les e-mails du compte.
select u.email, p.pseudo,
       to_char(p.news_optin_at at time zone 'Europe/Paris', 'DD/MM/YYYY HH24:MI') as accord_le,
       u.email_confirmed_at is not null as adresse_verifiee
from auth.users u join public.profiles p on p.id = u.id
where p.news_optin and p.status = 'active' and coalesce(p.age_range, '') <> 'u15'
order by p.news_optin_at;

-- 4. Inscriptions par jour (pour voir l'effet de TikTok).
select to_char(date_trunc('day', u.created_at at time zone 'Europe/Paris'), 'DD/MM/YYYY') as jour, count(*) as inscriptions
from auth.users u
group by date_trunc('day', u.created_at at time zone 'Europe/Paris')
order by date_trunc('day', u.created_at at time zone 'Europe/Paris') desc;
