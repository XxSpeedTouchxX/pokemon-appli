-- 002 : chemin de recherche figé pour les 3 fonctions de déclenchement (alerte « role mutable search_path »
-- de Supabase Studio, 2026-11-06). Sans effet sur leur comportement. Rejouable. Déjà inclus dans 001 pour une
-- nouvelle installation.
alter function public.admin_log_readonly() set search_path = '';
alter function public.touch_updated_at() set search_path = '';
alter function public.profiles_news_rules() set search_path = '';
