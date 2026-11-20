#!/bin/bash
# Installe (ou met à jour) la fonction « push » (notifications envoyées par le serveur, même app fermée) dans le Supabase de
# Coolify (guide docs/46). À lancer dans le terminal du serveur (Coolify › Terminal › le serveur), en une ligne :
#   curl -fsSL https://raw.githubusercontent.com/XxSpeedTouchxX/pokemon-appli/claude/pokemon-app-mockup-1mxt7p/tools/supabase/functions/install-push.sh | bash
# Le script ne touche qu'au dossier des fonctions de Supabase : rien d'autre (ni Axicall Pilot, ni la base, ni les clés).
# Aucune variable à régler : les clés d'envoi sont créées toutes seules au premier passage et gardées dans la base.
set -euo pipefail
SRC="https://raw.githubusercontent.com/XxSpeedTouchxX/pokemon-appli/claude/pokemon-app-mockup-1mxt7p/tools/supabase/functions/push/index.ts"
stop() { echo "ARRÊT : $1"; exit 1; }

# Dossier des fonctions du Supabase installé par Coolify (celui qui contient la fonction « main »).
mapfile -t DIRS < <(ls -d /data/coolify/services/*/volumes/functions 2>/dev/null | while read -r d; do [ -f "$d/main/index.ts" ] && echo "$d"; done)
[ "${#DIRS[@]}" -eq 0 ] && stop "dossier des fonctions de Supabase introuvable (/data/coolify/services/…/volumes/functions)."
[ "${#DIRS[@]}" -gt 1 ] && { printf '  %s\n' "${DIRS[@]}"; stop "plusieurs Supabase trouvés : envoie cette liste à Claude."; }
DIR="${DIRS[0]}"
echo "Dossier des fonctions : $DIR"

mkdir -p "$DIR/push"
TMP="$(mktemp)"
curl -fsSL "$SRC" -o "$TMP" || stop "téléchargement depuis GitHub impossible."
grep -q "makeHandler" "$TMP" && grep -q "push_due" "$TMP" && grep -q "encryptPush" "$TMP" || stop "fichier téléchargé incomplet."
[ -f "$DIR/push/index.ts" ] && cp "$DIR/push/index.ts" "$DIR/push/index.ts.avant-$(date +%Y%m%d-%H%M%S)"
mv "$TMP" "$DIR/push/index.ts"
chmod 644 "$DIR/push/index.ts"
echo "OK : fonction « push » installée ($(wc -l < "$DIR/push/index.ts") lignes)."

# Essai : la clé publique doit répondre (elle est créée au premier appel si 036 est installé).
sleep 2
R="$(curl -s -m 20 https://api.dropicards.fr/functions/v1/push/key || true)"
if echo "$R" | grep -q '"key"'; then echo "OK : la fonction répond et la clé d'envoi est prête."
else echo "À VÉRIFIER : réponse de la fonction : ${R:-aucune}. As-tu installé 036_notifications_push.sql dans Studio ? Sinon, redémarre Supabase dans Coolify puis relance cette commande."; fi
