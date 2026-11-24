-- Nom du booster du PK shop dans l'e-mail d'achat et le panneau Admin (2026-11-24, porteur : « remplace le booster
-- 30 ans par le booster Règne Delta avec Rayquaza »). FACULTATIF : l'app affiche déjà « Booster Règne Delta » ; cette
-- requête change seulement le libellé que le serveur met dans l'e-mail envoyé à contact@dropicards.fr à chaque achat.
-- Supabase Studio › SQL Editor › New query : colle, puis Run.
update public.game_items set label = 'Booster de la série du moment (Règne Delta)' where id = 'achat-booster';
select id, label from public.game_items where id = 'achat-booster';
