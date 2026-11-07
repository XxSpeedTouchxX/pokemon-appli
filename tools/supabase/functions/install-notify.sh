#!/bin/bash
# Installe (ou met à jour) la fonction « notify » (e-mail de chaque achat du PK shop) dans le Supabase de Coolify (guide docs/30).
# À lancer dans le terminal du serveur (Coolify › Terminal › le serveur), en une ligne :
#   curl -fsSL https://raw.githubusercontent.com/XxSpeedTouchxX/pokemon-appli/claude/pokemon-app-mockup-1mxt7p/tools/supabase/functions/install-notify.sh | bash
# Le script ne touche qu'au dossier des fonctions de Supabase : rien d'autre (ni Axicall Pilot, ni la base, ni les clés).
set -euo pipefail
SRC="https://raw.githubusercontent.com/XxSpeedTouchxX/pokemon-appli/claude/pokemon-app-mockup-1mxt7p/tools/supabase/functions/notify/index.ts"
stop() { echo "ARRÊT : $1"; exit 1; }

# Dossier des fonctions du Supabase installé par Coolify (celui qui contient la fonction « main »).
mapfile -t DIRS < <(ls -d /data/coolify/services/*/volumes/functions 2>/dev/null | while read -r d; do [ -f "$d/main/index.ts" ] && echo "$d"; done)
[ "${#DIRS[@]}" -eq 0 ] && stop "dossier des fonctions de Supabase introuvable (/data/coolify/services/…/volumes/functions)."
[ "${#DIRS[@]}" -gt 1 ] && { printf '  %s\n' "${DIRS[@]}"; stop "plusieurs Supabase trouvés : envoie cette liste à Claude."; }
DIR="${DIRS[0]}"
echo "Dossier des fonctions : $DIR"

mkdir -p "$DIR/notify"
TMP="$(mktemp)"
curl -fsSL "$SRC" -o "$TMP" || stop "téléchargement depuis GitHub impossible."
grep -q "makeHandler" "$TMP" && grep -q "shop_pending" "$TMP" || stop "fichier téléchargé incomplet."
[ -f "$DIR/notify/index.ts" ] && cp "$DIR/notify/index.ts" "$DIR/notify/index.ts.avant-$(date +%Y%m%d-%H%M%S)"
mv "$TMP" "$DIR/notify/index.ts"
chmod 644 "$DIR/notify/index.ts"
echo "OK : fonction « notify » installée ($(wc -l < "$DIR/notify/index.ts") lignes)."

# Variables vues par le service des fonctions (valeurs jamais affichées).
C="$(docker ps --format '{{.Names}}' | grep -m1 'supabase-edge-functions' || true)"
if [ -n "$C" ]; then
  for V in BREVO_API_KEY; do
    if docker exec "$C" sh -c "test -n \"\$$V\"" 2>/dev/null; then echo "OK : $V est réglée."; else echo "À FAIRE : $V n'est pas encore réglée (guide docs/30, étape 3)."; fi
  done
else
  echo "Service des fonctions introuvable : vérifie dans Coolify que Supabase tourne."
fi
