#!/bin/sh
# Ferme au public les ports 8000 (tableau de bord de Coolify), 6001 et 6002 (temps réel et terminal de Coolify)
# (docs/25, étape D, 2026-11-06). Docker ouvre ces ports en passant à côté du pare-feu : la règle est donc posée dans
# la chaîne DOCKER-USER, que Docker garde. Seule la carte réseau publique est fermée : Tailscale et le serveur
# lui-même gardent l'accès ; Coolify reste ouvert par son domaine (port 443, Traefik).
# Installation (terminal de Coolify, une fois) :  sh close-ports.sh install
# Retour en arrière :                              sh close-ports.sh remove
set -e
PORTS="8000 6001 6002"
IF=$(ip route show default | awk '{print $5; exit}')
[ -n "$IF" ] || { echo "Carte réseau publique introuvable : rien n'est changé."; exit 1; }
rule() { iptables "$1" DOCKER-USER -i "$IF" -p tcp -m conntrack --ctorigdstport "$2" --ctdir ORIGINAL -j DROP; }
case "${1:-apply}" in
  apply)
    for P in $PORTS; do rule -C "$P" 2>/dev/null || rule -I "$P"; done
    echo "Ports $PORTS fermés au public sur $IF." ;;
  remove)
    for P in $PORTS; do while rule -C "$P" 2>/dev/null; do rule -D "$P"; done; done
    rm -f /etc/systemd/system/dropicards-ports.service /usr/local/sbin/dropicards-close-ports.sh
    systemctl daemon-reload 2>/dev/null || true
    echo "Ports $PORTS de nouveau ouverts comme avant." ;;
  install)
    cp "$0" /usr/local/sbin/dropicards-close-ports.sh && chmod 755 /usr/local/sbin/dropicards-close-ports.sh
    cat > /etc/systemd/system/dropicards-ports.service <<UNIT
[Unit]
Description=Dropicards : ports 8000, 6001, 6002 fermés au public (docs/25)
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
ExecStart=/usr/local/sbin/dropicards-close-ports.sh apply
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
UNIT
    systemctl daemon-reload && systemctl enable --now dropicards-ports.service
    echo "Installé : la règle est reposée à chaque redémarrage du serveur." ;;
  *) echo "Usage : sh close-ports.sh install | apply | remove"; exit 1 ;;
esac
