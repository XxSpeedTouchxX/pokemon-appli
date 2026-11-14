#!/bin/bash
# Installe (ou met à jour) la fonction « annonces » (fil des annonces Vinted) dans le Supabase de Coolify (guide docs/42).
# À lancer dans le terminal du serveur (Coolify › Terminal › le serveur), en une ligne :
#   curl -fsSL https://raw.githubusercontent.com/XxSpeedTouchxX/pokemon-appli/claude/pokemon-app-mockup-1mxt7p/tools/supabase/functions/install-annonces.sh | bash
# Le script ne touche qu'au dossier des fonctions de Supabase : rien d'autre (ni Axicall Pilot, ni la base, ni les clés).
# Aucune clé à régler : la fonction utilise seulement SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY, déjà fournies par Supabase.
set -euo pipefail
SRC="https://raw.githubusercontent.com/XxSpeedTouchxX/pokemon-appli/claude/pokemon-app-mockup-1mxt7p/tools/supabase/functions/annonces/index.ts"
stop() { echo "ARRÊT : $1"; exit 1; }

# Dossier des fonctions du Supabase installé par Coolify (celui qui contient la fonction « main »).
mapfile -t DIRS < <(ls -d /data/coolify/services/*/volumes/functions 2>/dev/null | while read -r d; do [ -f "$d/main/index.ts" ] && echo "$d"; done)
[ "${#DIRS[@]}" -eq 0 ] && stop "dossier des fonctions de Supabase introuvable (/data/coolify/services/…/volumes/functions)."
[ "${#DIRS[@]}" -gt 1 ] && { printf '  %s\n' "${DIRS[@]}"; stop "plusieurs Supabase trouvés : envoie cette liste à Claude."; }
DIR="${DIRS[0]}"
echo "Dossier des fonctions : $DIR"

mkdir -p "$DIR/annonces"
TMP="$(mktemp)"
curl -fsSL "$SRC" -o "$TMP" || stop "téléchargement depuis GitHub impossible."
grep -q "makeHandler" "$TMP" && grep -q "listings_upsert" "$TMP" || stop "fichier téléchargé incomplet."
[ -f "$DIR/annonces/index.ts" ] && cp "$DIR/annonces/index.ts" "$DIR/annonces/index.ts.avant-$(date +%Y%m%d-%H%M%S)"
mv "$TMP" "$DIR/annonces/index.ts"
chmod 644 "$DIR/annonces/index.ts"
echo "OK : fonction « annonces » installée ($(wc -l < "$DIR/annonces/index.ts") lignes)."

# Premier essai depuis le serveur : le serveur peut-il joindre Vinted ? (une seule requête, la page d'accueil)
CODE="$(curl -s -o /dev/null -w '%{http_code}' -m 15 -A 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' https://www.vinted.fr/ || echo 000)"
case "$CODE" in
  200|301|302) echo "OK : le serveur joint Vinted (code $CODE)." ;;
  403|429) echo "ATTENTION : Vinted refuse le serveur (code $CODE, anti-robot). Envoie ce message à Claude." ;;
  *) echo "ATTENTION : Vinted ne répond pas normalement (code $CODE). Envoie ce message à Claude." ;;
esac
echo "Étape suivante : ouvre https://api.dropicards.fr/functions/v1/annonces/vinted dans ton navigateur (guide docs/42)."
