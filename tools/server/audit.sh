#!/usr/bin/env bash
# Audit du serveur Dropicards, en LECTURE SEULE (2026-10-30).
# Il ne modifie rien : aucune installation, aucun redémarrage, aucun fichier écrit (sauf si vous redirigez la sortie).
# Il n'affiche aucun secret : ni clé, ni mot de passe, ni contenu de fichier de configuration sensible ; les adresses
# IP sont masquées (sauf 0.0.0.0, 127.0.0.1 et ::), pour pouvoir coller le résultat sans risque.
#
# Usage, sur le serveur, depuis le dossier du dépôt :
#   sudo bash tools/server/audit.sh | tee ~/audit-dropicards.txt
# Sans sudo, il marche aussi, mais certaines vérifications (SSH, pare-feu, PostgreSQL, comptes) restent vides.
# Variable facultative : SITE=https://dropicards.fr (adresse vérifiée de l'extérieur).

SITE="${SITE:-https://dropicards.fr}"
HOST="${SITE#https://}"; HOST="${HOST%%/*}"
export LC_ALL=C

# Masque les adresses IPv4 et IPv6 (garde 0.0.0.0, 127.x, ::, ::1 et *), et les adresses e-mail.
mask() {
  sed -E \
    -e 's/\b(0\.0\.0\.0|127\.[0-9]+\.[0-9]+\.[0-9]+)\b/<<\1>>/g' \
    -e 's/\b[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\b/x.x.x.x/g' \
    -e 's/<<([0-9.]+)>>/\1/g' \
    -e 's/\b([0-9a-fA-F]{1,4}:){3,7}[0-9a-fA-F]{1,4}\b/x:x::x/g' \
    -e 's/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/(e-mail masqué)/g'
}
have() { command -v "$1" >/dev/null 2>&1; }
ROOT_OK=0; [ "$(id -u)" = 0 ] && ROOT_OK=1
SUMMARY=()
ok()   { SUMMARY+=("OK   | $1"); }
warn() { SUMMARY+=("À VOIR | $1"); }
bad()  { SUMMARY+=("RISQUE | $1"); }
section() { printf '\n==================== %s ====================\n' "$1"; }

{
section "1. Système"
echo "Date de l'audit : $(date -u '+%Y-%m-%d %H:%M UTC')"
[ -r /etc/os-release ] && . /etc/os-release && echo "Système : ${PRETTY_NAME:-?}"
echo "Noyau : $(uname -r)"
echo "Allumé depuis : $(uptime -p 2>/dev/null || uptime)"
echo "Audit lancé avec les droits root : $([ $ROOT_OK = 1 ] && echo oui || echo 'non (relancer avec sudo pour tout voir)')"
have nproc && echo "Processeurs : $(nproc)"
have free && free -h | sed -n '1,2p'
echo; df -h -x tmpfs -x devtmpfs 2>/dev/null
FULL=$(df -P -x tmpfs -x devtmpfs 2>/dev/null | awk 'NR>1 {gsub("%","",$5); if ($5+0 >= 85) print $6" ("$5" %)"}')
[ -n "$FULL" ] && warn "Disque presque plein : $FULL" || ok "Espace disque suffisant"
have timedatectl && timedatectl 2>/dev/null | grep -Ei 'time zone|synchronized|NTP service'
if have timedatectl && timedatectl show -p NTPSynchronized --value 2>/dev/null | grep -q yes; then ok "Heure synchronisée (NTP)"; else warn "Heure non synchronisée (NTP) ou inconnue"; fi
have lsblk && { echo; lsblk -o NAME,SIZE,TYPE,FSTYPE,MOUNTPOINT 2>/dev/null; }
if have lsblk && lsblk -o FSTYPE 2>/dev/null | grep -q crypto_LUKS; then ok "Disque chiffré (LUKS)"; else warn "Disque non chiffré (LUKS absent) : recommandé avant d'y mettre des données d'utilisateurs"; fi

section "2. Mises à jour"
if have apt; then
  UPG=$(apt list --upgradable 2>/dev/null | grep -c upgradable)
  SEC=$(apt list --upgradable 2>/dev/null | grep -ci security)
  echo "Paquets à mettre à jour : $UPG (dont sécurité : $SEC)"
  [ -e /var/lib/apt/lists ] && echo "Dernière lecture des dépôts : $(stat -c %y /var/lib/apt/lists 2>/dev/null | cut -d. -f1)"
  [ "$SEC" -gt 0 ] && bad "$SEC mises à jour de sécurité en attente" || ok "Pas de mise à jour de sécurité en attente (selon la dernière lecture des dépôts)"
  if dpkg -s unattended-upgrades >/dev/null 2>&1; then
    echo "unattended-upgrades : installé"
    grep -hs 'APT::Periodic::Unattended-Upgrade' /etc/apt/apt.conf.d/* | head -3
    grep -hqs 'Unattended-Upgrade "1"' /etc/apt/apt.conf.d/* && ok "Mises à jour de sécurité automatiques" || warn "unattended-upgrades installé mais pas activé"
  else
    warn "Mises à jour automatiques absentes (paquet unattended-upgrades)"
  fi
elif have dnf; then
  dnf -q check-update --security 2>/dev/null | tail -n +1 | head -20
  warn "Système en dnf : vérifier dnf-automatic à la main"
fi
[ -e /var/run/reboot-required ] && warn "Redémarrage demandé par une mise à jour (/var/run/reboot-required)"

section "3. Comptes et droits"
echo "Comptes avec un shell de connexion :"
awk -F: '$7 !~ /(nologin|false|sync|halt|shutdown)$/ {print "  " $1 " (uid " $3 ")"}' /etc/passwd
ROOTS=$(awk -F: '$3 == 0 {print $1}' /etc/passwd | tr '\n' ' ')
echo "Comptes avec l'uid 0 : $ROOTS"
[ "$(echo $ROOTS)" = "root" ] && ok "Seul root a l'uid 0" || bad "Plusieurs comptes ont les droits root (uid 0) : $ROOTS"
echo "Membres de sudo / wheel : $(getent group sudo wheel 2>/dev/null | cut -d: -f4 | tr '\n' ' ')"
if [ $ROOT_OK = 1 ]; then
  EMPTY=$(awk -F: '($2 == "") {print $1}' /etc/shadow | tr '\n' ' ')
  [ -n "$EMPTY" ] && bad "Comptes sans mot de passe : $EMPTY" || ok "Aucun compte sans mot de passe"
  echo "Clés SSH autorisées (nombre de clés, sans leur contenu) :"
  for h in /root $(awk -F: '$3 >= 1000 && $7 !~ /nologin|false/ {print $6}' /etc/passwd); do
    f="$h/.ssh/authorized_keys"; [ -f "$f" ] && echo "  $f : $(grep -cvE '^\s*(#|$)' "$f") clé(s), droits $(stat -c %a "$f")"
  done
  NOPASS=$(grep -rhsE '^[^#].*NOPASSWD' /etc/sudoers /etc/sudoers.d 2>/dev/null | sed 's/^/  /')
  [ -n "$NOPASS" ] && { echo "sudo sans mot de passe :"; echo "$NOPASS"; warn "sudo sans mot de passe configuré (NOPASSWD)"; }
fi

section "4. SSH"
if have sshd && [ $ROOT_OK = 1 ]; then
  sshd -T 2>/dev/null | grep -Ei '^(port|permitrootlogin|passwordauthentication|kbdinteractiveauthentication|challengeresponseauthentication|pubkeyauthentication|permitemptypasswords|maxauthtries|allowusers|allowgroups|x11forwarding|logingracetime) '
  P=$(sshd -T 2>/dev/null | awk '$1=="passwordauthentication"{print $2}')
  R=$(sshd -T 2>/dev/null | awk '$1=="permitrootlogin"{print $2}')
  [ "$P" = "no" ] && ok "SSH : connexion par mot de passe refusée (clés seulement)" || bad "SSH : connexion par mot de passe autorisée (passwordauthentication $P)"
  case "$R" in no) ok "SSH : root ne peut pas se connecter";; prohibit-password|without-password) warn "SSH : root peut se connecter avec une clé (mieux : no)";; *) bad "SSH : root peut se connecter (permitrootlogin $R)";; esac
  if have journalctl; then
    F=$(journalctl -u ssh -u sshd --since "24 hours ago" 2>/dev/null | grep -cE 'Failed password|Invalid user|authentication failure')
    echo "Tentatives de connexion SSH ratées sur 24 h : $F"
  fi
elif ! have sshd; then
  echo "Serveur SSH (sshd) introuvable."
else
  echo "(relancer avec sudo pour lire la configuration SSH)"
fi

section "5. Ports ouverts"
if have ss; then
  ss -tulpnH 2>/dev/null | awk '{print $1, $5, $7}' | sort -u
  EXPOSED=$(ss -tlnH 2>/dev/null | awk '{print $4}' | grep -vE '^(127\.|\[::1\]|::1)' | sed -E 's/.*:([0-9]+)$/\1/' | sort -un | tr '\n' ' ')
  echo "Ports TCP ouverts hors de la machine elle-même : $EXPOSED"
  OTHER=$(for p in $EXPOSED; do case $p in 22|80|443) ;; *) echo -n "$p ";; esac; done)
  [ -n "$OTHER" ] && warn "Ports ouverts au-delà de 22, 80 et 443 : $OTHER(à justifier, ou à fermer au pare-feu)" || ok "Seuls les ports web et SSH écoutent à l'extérieur"
  ss -tlnH 2>/dev/null | awk '{print $4}' | grep -qE '(0\.0\.0\.0|\*|\[::\]|^::):5432$' && bad "PostgreSQL (5432) écoute sur toutes les adresses : à limiter à 127.0.0.1"
fi

section "6. Pare-feu et protections"
FW=0
if have ufw; then ufw status verbose 2>/dev/null; ufw status 2>/dev/null | grep -q 'Status: active' && FW=1; fi
if have nft && [ $ROOT_OK = 1 ]; then
  echo "nftables : $(nft list ruleset 2>/dev/null | grep -c rule) règle(s) ; politiques :"
  nft list ruleset 2>/dev/null | grep -E 'chain|policy' | sed 's/^/  /' | head -20
  nft list ruleset 2>/dev/null | grep -q 'policy drop' && FW=1
fi
if have iptables && [ $ROOT_OK = 1 ]; then iptables -S 2>/dev/null | grep -E '^-P' | sed 's/^/  iptables /'; iptables -S INPUT 2>/dev/null | grep -q '^-P INPUT DROP' && FW=1; fi
[ $FW = 1 ] && ok "Pare-feu actif (refus par défaut)" || bad "Aucun pare-feu actif détecté (ou relancer avec sudo)"
for s in fail2ban crowdsec; do systemctl is-active --quiet "$s" 2>/dev/null && { echo "$s : actif"; PROT=1; }; done
[ "${PROT:-0}" = 1 ] && ok "Protection contre les essais de mots de passe (fail2ban ou CrowdSec)" || warn "Ni fail2ban ni CrowdSec actif"
have aa-status && [ $ROOT_OK = 1 ] && aa-status 2>/dev/null | head -2

section "7. Serveur web"
if have nginx; then
  nginx -v 2>&1
  if [ $ROOT_OK = 1 ]; then
    CONF=$(nginx -T 2>/dev/null)
    echo "Extraits utiles de la configuration nginx (sans secrets) :"
    echo "$CONF" | grep -E '^\s*(server_name|listen|root|ssl_protocols|ssl_certificate |add_header|return 30|location|autoindex|server_tokens)' | sed 's/^\s*/  /' | sort | uniq -c | sort -rn | head -60
    echo "$CONF" | grep -qE '^\s*server_tokens\s+off' && ok "nginx n'affiche pas sa version" || warn "nginx affiche sa version (server_tokens off conseillé)"
    echo "$CONF" | grep -qE '^\s*autoindex\s+on' && bad "Listing des dossiers activé (autoindex on)"
    WEBROOT=$(echo "$CONF" | awk '$1=="root"{gsub(";","",$2); print $2}' | sort -u | tr '\n' ' ')
    echo "Dossiers servis (root) : $WEBROOT"
  fi
fi
have apache2 && { echo "Apache est aussi installé : $(apache2 -v 2>/dev/null | head -1)"; systemctl is-active --quiet apache2 && warn "Apache actif en plus de nginx : à justifier"; }
have caddy && echo "Caddy est installé : $(caddy version 2>/dev/null)"
have certbot && [ $ROOT_OK = 1 ] && certbot certificates 2>/dev/null | grep -E 'Certificate Name|Domains|Expiry' | sed 's/^/  /'

section "8. Le site vu de l'extérieur ($SITE)"
CODE=$(have curl && curl -s -o /dev/null -w '%{http_code}' "$SITE/" --max-time 10)
if [ "${CODE:-000}" = 000 ]; then
  echo "Site injoignable depuis le serveur ($SITE) : vérifications web sautées."
  warn "Site injoignable depuis le serveur lui-même ($SITE) : DNS, pare-feu sortant ou nginx à vérifier"
elif have curl; then
  echo "Page d'accueil : code $CODE"
  echo "Redirection http → https : $(curl -s -o /dev/null -w '%{http_code} -> %{redirect_url}' "http://$HOST/" --max-time 10)"
  curl -sI "$SITE/" --max-time 10 | grep -iE '^(HTTP|server|strict-transport-security|content-security-policy|x-content-type-options|x-frame-options|referrer-policy|permissions-policy|cache-control)' | tr -d '\r'
  H=$(curl -sI "$SITE/" --max-time 10 | tr -d '\r')
  echo "$H" | grep -qi '^strict-transport-security' && ok "HSTS présent" || warn "En-tête HSTS absent (voir tools/web/README.md, nginx)"
  echo "$H" | grep -qi '^content-security-policy' && ok "CSP présente" || warn "En-tête Content-Security-Policy absent (voir tools/web/README.md)"
  echo "$H" | grep -qi '^x-content-type-options' && ok "X-Content-Type-Options présent" || warn "En-tête X-Content-Type-Options absent"
  # Fichiers qui ne doivent jamais être servis : dépôt git, outils, documents, secrets.
  echo "Fichiers sensibles servis par le site ? (attendu : 403 ou 404)"
  for p in /.git/HEAD /.git/config /.env /CLAUDE.md /docs/ /tools/ /tools/web/build.mjs /.github/workflows/tcgdex.yml /package.json; do
    c=$(curl -s -o /dev/null -w '%{http_code}' "$SITE$p" --max-time 10)
    echo "  $p : $c"
    [ "$c" = 200 ] && bad "Le site sert $p (code 200) : le dossier servi doit être web/ seulement"
  done
  for p in /index.html /app.js /sw.js /data/cards.json; do echo "  $p : $(curl -s -o /dev/null -w '%{http_code}' "$SITE$p" --max-time 10) (attendu : 200)"; done
fi
if have openssl; then
  END=$(echo | openssl s_client -servername "$HOST" -connect "$HOST:443" 2>/dev/null | openssl x509 -noout -enddate -issuer 2>/dev/null)
  echo "Certificat : $END"
  for v in tls1 tls1_1; do echo | openssl s_client -"$v" -connect "$HOST:443" >/dev/null 2>&1 && warn "Ancien protocole $v accepté (désactiver TLS 1.0 et 1.1)"; done
fi

section "9. Mise à jour du site (comment le serveur récupère la branche)"
have crontab && { echo "crontab de $(whoami) :"; crontab -l 2>/dev/null | grep -vE '^\s*(#|$)' | sed 's/^/  /'; }
[ $ROOT_OK = 1 ] && for u in $(awk -F: '$3 >= 1000 && $7 !~ /nologin|false/ {print $1}' /etc/passwd); do
  L=$(crontab -l -u "$u" 2>/dev/null | grep -vE '^\s*(#|$)'); [ -n "$L" ] && { echo "crontab de $u :"; echo "$L" | sed 's/^/  /'; }
done
ls /etc/cron.d 2>/dev/null | sed 's/^/  cron.d : /'
have systemctl && systemctl list-timers --all --no-pager 2>/dev/null | head -20
for d in $WEBROOT /var/www/*; do
  r=$(git -C "$d" rev-parse --show-toplevel 2>/dev/null) || continue
  echo "Dépôt git : $r · branche $(git -C "$r" rev-parse --abbrev-ref HEAD 2>/dev/null) · dernier commit $(git -C "$r" log -1 --format='%h %cs %s' 2>/dev/null)"
  git -C "$r" status --porcelain 2>/dev/null | head -5 | sed 's/^/  modifié sur le serveur : /'
done 2>/dev/null | sort -u

section "10. PostgreSQL et autres services"
if have psql || systemctl list-unit-files 2>/dev/null | grep -q postgresql; then
  echo "PostgreSQL : $(psql --version 2>/dev/null) · service $(systemctl is-active postgresql 2>/dev/null)"
  if [ $ROOT_OK = 1 ] && id postgres >/dev/null 2>&1; then
    echo "Bases (nom, propriétaire) :"
    sudo -u postgres psql -Atqc "select datname, pg_get_userbyid(datdba) from pg_database where not datistemplate" 2>/dev/null | sed 's/^/  /'
    echo "Rôles (nom, superutilisateur, connexion) :"
    sudo -u postgres psql -Atqc "select rolname, rolsuper, rolcanlogin from pg_roles where rolname !~ '^pg_'" 2>/dev/null | sed 's/^/  /'
    echo "listen_addresses : $(sudo -u postgres psql -Atqc 'show listen_addresses' 2>/dev/null) · ssl : $(sudo -u postgres psql -Atqc 'show ssl' 2>/dev/null)"
    HBA=$(sudo -u postgres psql -Atqc 'show hba_file' 2>/dev/null)
    [ -n "$HBA" ] && { echo "Règles d'accès (pg_hba.conf, sans commentaires) :"; grep -vE '^\s*(#|$)' "$HBA" | sed 's/^/  /'; }
    [ -n "$HBA" ] && grep -vE '^\s*#' "$HBA" | grep -qE '\btrust\b' && bad "PostgreSQL : méthode « trust » (sans mot de passe) dans pg_hba.conf"
    [ -n "$HBA" ] && grep -vE '^\s*#' "$HBA" | grep -qE '0\.0\.0\.0/0|::/0' && bad "PostgreSQL : accès ouvert à toutes les adresses dans pg_hba.conf"
  fi
else
  echo "PostgreSQL n'est pas installé."
fi
have docker && { echo "Docker : $(docker --version 2>/dev/null)"; [ $ROOT_OK = 1 ] && docker ps --format '  {{.Names}} · {{.Image}} · {{.Ports}}' 2>/dev/null; }
echo "Services en marche :"
systemctl list-units --type=service --state=running --no-pager --no-legend 2>/dev/null | awk '{print "  " $1}'

section "11. Sauvegardes"
B=$(ls /etc/cron.d /etc/cron.daily 2>/dev/null; crontab -l 2>/dev/null; systemctl list-timers --all --no-pager 2>/dev/null)
echo "$B" | grep -iqE 'backup|borg|restic|pgbackrest|pg_dump|rsync|rclone' && { echo "Traces de sauvegarde :"; echo "$B" | grep -iE 'backup|borg|restic|pgbackrest|pg_dump|rsync|rclone' | sed 's/^/  /'; ok "Une sauvegarde automatique semble programmée (à vérifier : restauration testée ?)"; } \
  || warn "Aucune sauvegarde automatique trouvée sur le serveur (à vérifier aussi côté OVH : snapshot, Backup Storage)"

section "RÉSUMÉ"
printf '%s\n' "${SUMMARY[@]}"
echo
echo "Ce résumé ne remplace pas un audit complet : il couvre les erreurs les plus courantes."
} 2>&1 | mask
