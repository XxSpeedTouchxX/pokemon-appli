-- Imitation minimale de Supabase pour tester 001_comptes.sql sur un PostgreSQL ordinaire (jamais sur le vrai serveur).
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin bypassrls; end if;
end $$;
create schema auth;
create schema if not exists extensions;
create extension if not exists pgcrypto schema extensions;
create table auth.users (id uuid primary key default gen_random_uuid(), email varchar(255), raw_user_meta_data jsonb, email_confirmed_at timestamptz, created_at timestamptz default now(), last_sign_in_at timestamptz);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to anon, authenticated; grant execute on function auth.uid() to anon, authenticated;
grant usage on schema public to anon, authenticated, service_role;
