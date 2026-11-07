#!/bin/bash
# Installe (ou met à jour) la fonction « stripe » dans le Supabase de Coolify (guide docs/28, étape 4).
# À lancer dans le terminal du serveur (Coolify › Terminal › le serveur), en une ligne :
#   curl -fsSL https://raw.githubusercontent.com/XxSpeedTouchxX/pokemon-appli/claude/pokemon-app-mockup-1mxt7p/tools/supabase/functions/install-stripe.sh | bash
# Le script ne touche qu'au dossier des fonctions de Supabase : rien d'autre (ni Axicall Pilot, ni la base, ni les clés).
set -euo pipefail
SRC="https://raw.githubusercontent.com/XxSpeedTouchxX/pokemon-appli/claude/pokemon-app-mockup-1mxt7p/tools/supabase/functions/stripe/index.ts"
stop() { echo "ARRÊT : $1"; exit 1; }

# Dossier des fonctions du Supabase installé par Coolify (celui qui contient la fonction « main »).
mapfile -t DIRS < <(ls -d /data/coolify/services/*/volumes/functions 2>/dev/null | while read -r d; do [ -f "$d/main/index.ts" ] && echo "$d"; done)
[ "${#DIRS[@]}" -eq 0 ] && stop "dossier des fonctions de Supabase introuvable (/data/coolify/services/…/volumes/functions)."
[ "${#DIRS[@]}" -gt 1 ] && { printf '  %s\n' "${DIRS[@]}"; stop "plusieurs Supabase trouvés : envoie cette liste à Claude."; }
DIR="${DIRS[0]}"
echo "Dossier des fonctions : $DIR"

mkdir -p "$DIR/stripe"
TMP="$(mktemp)"
curl -fsSL "$SRC" -o "$TMP" || stop "téléchargement depuis GitHub impossible."
grep -q "makeHandler" "$TMP" && grep -q "verifySignature" "$TMP" || stop "fichier téléchargé incomplet."
[ -f "$DIR/stripe/index.ts" ] && cp "$DIR/stripe/index.ts" "$DIR/stripe/index.ts.avant-$(date +%Y%m%d-%H%M%S)"
mv "$TMP" "$DIR/stripe/index.ts"
chmod 644 "$DIR/stripe/index.ts"
echo "OK : fonction « stripe » installée ($(wc -l < "$DIR/stripe/index.ts") lignes)."

# Variables Stripe vues par le service des fonctions (valeurs jamais affichées).
C="$(docker ps --format '{{.Names}}' | grep -m1 'supabase-edge-functions' || true)"
if [ -n "$C" ]; then
  for V in STRIPE_SECRET_KEY STRIPE_WEBHOOK_SECRET; do
    if docker exec "$C" sh -c "test -n \"\$$V\"" 2>/dev/null; then echo "OK : $V est réglée."; else echo "À FAIRE : $V n'est pas encore réglée (guide docs/28, étape 5)."; fi
  done
else
  echo "Service des fonctions introuvable : vérifie dans Coolify que Supabase tourne."
fi
