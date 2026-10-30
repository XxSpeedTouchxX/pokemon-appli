#!/usr/bin/env bash
# Mise à jour automatique de https://dropicards.fr depuis GitHub (2026-10-30).
#
# À lancer UNE SEULE FOIS sur le serveur, avec sudo. Ensuite, toutes les 5 minutes, le serveur télécharge la branche
# publiée et met le site à jour tout seul.
#
#   curl -fsSL https://raw.githubusercontent.com/XxSpeedTouchxX/pokemon-appli/claude/pokemon-app-mockup-1mxt7p/tools/server/install-autoupdate.sh -o maj.sh
#   sudo bash maj.sh
#
# Ce que fait le script (il explique tout et demande « OUI » avant de modifier quoi que ce soit) :
# 1. trouve le dossier que nginx sert pour dropicards.fr (ou celui donné par ROOT=/chemin) ;
# 2. sauvegarde ce dossier dans /root ;
# 3. télécharge le dépôt (public, sans mot de passe) dans /opt/dropicards/depot ;
# 4. installe une tâche automatique (minuterie systemd, sinon cron) qui, toutes les 5 minutes :
#    télécharge la branche, vérifie que le site est complet, puis copie le dossier web/ dans le dossier servi ;
# 5. lance une première mise à jour et vérifie la version vue de l'extérieur.
# Il ne touche pas à la configuration de nginx, ni au pare-feu, ni à SSH.
#
# Pour tout retirer : sudo systemctl disable --now dropicards-maj.timer ; sudo rm /etc/systemd/system/dropicards-maj.*
#                     /usr/local/bin/dropicards-maj /etc/cron.d/dropicards-maj ; sudo rm -r /opt/dropicards

set -u
REPO_URL="https://github.com/XxSpeedTouchxX/pokemon-appli.git"
BRANCH="claude/pokemon-app-mockup-1mxt7p"
DOMAIN="${DOMAIN:-dropicards.fr}"
BASE=/opt/dropicards
DEPOT="$BASE/depot"
CONF="$BASE/maj.conf"
BIN=/usr/local/bin/dropicards-maj

say()  { printf '\n\033[1m%s\033[0m\n' "$1"; }
info() { printf '  %s\n' "$1"; }
stop() { printf '\n\033[31mArrêt : %s\033[0m\n' "$1"; exit 1; }
have() { command -v "$1" >/dev/null 2>&1; }

[ "$(id -u)" = 0 ] || stop "lance le script avec sudo : sudo bash maj.sh"

say "1. Recherche du dossier du site"
ROOT="${ROOT:-}"
if [ -z "$ROOT" ] && have nginx; then
  # Bloc « server » de nginx qui contient dropicards.fr, et son « root ».
  ROOT=$(nginx -T 2>/dev/null | awk -v d="$DOMAIN" '
    /^[[:space:]]*server[[:space:]]*\{/ { inb=1; hit=0; r="" }
    inb && $1=="server_name" && index($0, d) { hit=1 }
    inb && $1=="root" { r=$2; gsub(";", "", r) }
    inb && /^[[:space:]]*}[[:space:]]*$/ { if (hit && r != "") { print r; exit } }
  ')
fi
[ -n "$ROOT" ] || stop "dossier du site introuvable dans nginx. Relance avec le chemin : sudo ROOT=/var/www/... bash maj.sh"
[ -d "$ROOT" ] || stop "le dossier $ROOT n'existe pas"
ROOT="${ROOT%/}"
info "Dossier servi par nginx pour $DOMAIN : $ROOT"
if [ -f "$ROOT/index.html" ] && grep -q "Dropicards\|pkm" "$ROOT/index.html" 2>/dev/null; then info "Il contient bien le site Dropicards."; else info "Attention : pas de index.html de Dropicards dans ce dossier."; fi
[ -d "$ROOT/.git" ] && info "Attention : ce dossier contient .git (fichiers internes du projet). À corriger ensuite dans nginx : servir seulement web/."
OLD=$(grep -o 'pkm-demo-v[0-9]*' "$ROOT/sw.js" 2>/dev/null | head -1)
info "Version actuellement sur le serveur : ${OLD:-inconnue}"

say "2. Ce qui va être fait"
info "- sauvegarde du dossier du site dans /root/dropicards-avant-maj-$(date +%Y%m%d-%H%M).tar.gz ;"
info "- téléchargement du dépôt public dans $DEPOT ;"
info "- toutes les 5 minutes : téléchargement de la branche $BRANCH, puis copie de web/ dans $ROOT ;"
info "- aucune modification de nginx, du pare-feu ni de SSH."
printf '\nTape OUI (en majuscules) puis Entrée pour continuer, ou autre chose pour annuler : '
if [ -n "${CONFIRM:-}" ]; then ANS="$CONFIRM"; echo "$ANS"; else read -r ANS </dev/tty || ANS=""; fi
[ "$ANS" = "OUI" ] || stop "annulé, rien n'a été modifié."

say "3. Outils nécessaires"
NEED=""
have git || NEED="$NEED git"
have rsync || NEED="$NEED rsync"
have curl || NEED="$NEED curl"
if [ -n "$NEED" ]; then
  info "Installation de :$NEED"
  if have apt-get; then apt-get update -qq && DEBIAN_FRONTEND=noninteractive apt-get install -y -qq $NEED || stop "installation impossible de$NEED"
  elif have dnf; then dnf install -y -q $NEED || stop "installation impossible de$NEED"
  else stop "installe d'abord :$NEED"; fi
fi
info "git, rsync et curl sont là."

say "4. Sauvegarde du site actuel"
SAVE="/root/dropicards-avant-maj-$(date +%Y%m%d-%H%M).tar.gz"
tar -czf "$SAVE" -C "$(dirname "$ROOT")" "$(basename "$ROOT")" 2>/dev/null && info "Sauvegarde : $SAVE" || stop "sauvegarde impossible, rien n'a été modifié."

say "5. Téléchargement du dépôt"
mkdir -p "$BASE"
if [ -d "$DEPOT/.git" ]; then
  info "Dépôt déjà présent, mise à jour."
else
  git clone -q --depth 50 --branch "$BRANCH" "$REPO_URL" "$DEPOT" || stop "téléchargement depuis GitHub impossible (connexion sortante bloquée ?)"
fi
printf 'ROOT=%q\nDEPOT=%q\nBRANCH=%q\n' "$ROOT" "$DEPOT" "$BRANCH" > "$CONF"
chmod 600 "$CONF"

# Script de mise à jour lancé toutes les 5 minutes.
cat > "$BIN" <<'EOF'
#!/usr/bin/env bash
# Mise à jour de dropicards.fr depuis GitHub (installé par tools/server/install-autoupdate.sh).
set -eu
. /opt/dropicards/maj.conf
cd "$DEPOT"
git fetch -q --depth 50 origin "$BRANCH"
NEW=$(git rev-parse "origin/$BRANCH")
[ "$NEW" = "$(git rev-parse HEAD)" ] && [ -f "$ROOT/.dropicards-commit" ] && [ "$(cat "$ROOT/.dropicards-commit")" = "$NEW" ] && exit 0
git reset -q --hard "origin/$BRANCH"
# Garde-fou : on ne remplace jamais le site par une version incomplète.
for f in web/index.html web/app.js web/sw.js web/data/cards.json; do [ -s "$f" ] || { echo "fichier manquant : $f, mise à jour annulée" >&2; exit 1; }; done
rsync -a --delete --exclude '_headers' --exclude '_redirects' --exclude '.dropicards-commit' --exclude '.well-known' web/ "$ROOT/"
echo "$NEW" > "$ROOT/.dropicards-commit"
echo "site mis à jour : $(git log -1 --format='%h %cs %s') ($(grep -o 'pkm-demo-v[0-9]*' web/sw.js | head -1))"
EOF
chmod 755 "$BIN"

say "6. Tâche automatique (toutes les 5 minutes)"
if have systemctl && [ -d /run/systemd/system ]; then
  cat > /etc/systemd/system/dropicards-maj.service <<EOF
[Unit]
Description=Mise à jour de dropicards.fr depuis GitHub
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
ExecStart=$BIN
Environment=HOME=$BASE
ProtectSystem=strict
ReadWritePaths=$BASE $ROOT
PrivateTmp=true
NoNewPrivileges=true
ProtectHome=true
EOF
  cat > /etc/systemd/system/dropicards-maj.timer <<'EOF'
[Unit]
Description=Mise à jour de dropicards.fr toutes les 5 minutes

[Timer]
OnBootSec=2min
OnUnitActiveSec=5min
Persistent=true

[Install]
WantedBy=timers.target
EOF
  systemctl daemon-reload
  systemctl enable --now dropicards-maj.timer >/dev/null 2>&1 || stop "impossible d'activer la minuterie"
  info "Minuterie systemd « dropicards-maj » active."
  info "Journal des mises à jour : sudo journalctl -u dropicards-maj -n 20"
  systemctl start dropicards-maj.service || { journalctl -u dropicards-maj -n 20 --no-pager; stop "la première mise à jour a échoué (détail ci-dessus)"; }
else
  echo "*/5 * * * * root $BIN >> /var/log/dropicards-maj.log 2>&1" > /etc/cron.d/dropicards-maj
  info "Tâche cron installée (/etc/cron.d/dropicards-maj). Journal : /var/log/dropicards-maj.log"
  "$BIN" || stop "la première mise à jour a échoué"
fi

say "7. Vérification"
NOWV=$(grep -o 'pkm-demo-v[0-9]*' "$ROOT/sw.js" 2>/dev/null | head -1)
info "Version maintenant sur le serveur : ${NOWV:-inconnue} (avant : ${OLD:-inconnue})"
if have curl; then
  SEEN=$(curl -s --max-time 15 "https://$DOMAIN/sw.js?verif=$(date +%s)" | grep -o 'pkm-demo-v[0-9]*' | head -1)
  info "Version vue de l'extérieur (https://$DOMAIN) : ${SEEN:-pas de réponse}"
  CC=$(curl -sI --max-time 15 "https://$DOMAIN/sw.js" | tr -d '\r' | grep -i '^cache-control' || true)
  case "$CC" in *no-cache*|*no-store*|*max-age=0*) info "Cache de sw.js : OK ($CC)";;
    *) info "À corriger dans nginx : sw.js et app.js doivent partir avec « Cache-Control: no-cache », sinon les téléphones gardent l'ancienne version (voir tools/web/README.md, Hébergement).";; esac
  [ -n "$SEEN" ] && [ "$SEEN" != "$NOWV" ] && info "La version vue de l'extérieur diffère : un cache (Cloudflare ou nginx) sert encore l'ancienne. À vider."
  C=$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "https://$DOMAIN/.git/HEAD")
  [ "$C" = 200 ] && info "RISQUE : https://$DOMAIN/.git/HEAD est lisible. À corriger dans nginx (servir seulement le dossier du site)."
fi
say "C'est fait. Désormais, chaque modification poussée sur GitHub arrive sur https://$DOMAIN en 5 minutes au plus."
info "Sur ton téléphone : ferme et rouvre l'app deux fois, puis Réglages › À propos doit afficher ${NOWV:-la dernière version}."
