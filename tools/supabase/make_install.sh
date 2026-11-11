#!/bin/bash
# Refait install_011_a_022.sql à partir des scripts 011 à 022 (à relancer après toute modification de l'un d'eux).
cd "$(dirname "$0")" && head -6 install_011_a_022.sql > /tmp/install_head.sql && {
  cat /tmp/install_head.sql
  for f in 011 012 013 014 015 016 017 018 019 020 021 022; do printf '\n-- ================= %s =================\n' "$(ls ${f}_*.sql)"; cat ${f}_*.sql; done
  printf "\n-- Fin : l'API de Supabase relit la liste des fonctions (sinon l'app ne les voit qu'au redémarrage).\nnotify pgrst, 'reload schema';\n"
} > install_011_a_022.sql.new && mv install_011_a_022.sql.new install_011_a_022.sql && echo "install_011_a_022.sql refait"
