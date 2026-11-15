#!/bin/bash
# Télécharge les enregistrements d'origine (Kenney, CC0) utilisés par make_coffre.py et vérifie leurs empreintes.
# Usage : bash tools/sfx/coffre/telecharger.sh DOSSIER
# DOSSIER doit être un dossier à part, vide (données téléchargées : rien n'y est lancé). Sources : voir SOURCES.md.
# Les packs de Kenney (kenney.nl) sont pris dans le miroir public github.com/series-ai/jam-ready-assets (fichiers en
# Git LFS, servis par media.githubusercontent.com), avec leur License.txt ; chaque fichier est refusé si son empreinte
# SHA-256 ne correspond pas à sources.sha256.
set -euo pipefail
out="${1:?Usage : telecharger.sh DOSSIER}"
here="$(cd "$(dirname "$0")" && pwd)"
media="https://media.githubusercontent.com/media/series-ai/jam-ready-assets/main"
raw="https://raw.githubusercontent.com/series-ai/jam-ready-assets/main"
mkdir -p "$out/kenney-rpg-audio" "$out/kenney-impact-sounds"
for pack in kenney-rpg-audio kenney-impact-sounds; do
  curl -fsS --max-time 60 -o "$out/$pack/License.txt" "$raw/$pack/audio/License.txt"
done
while read -r sum path; do
  pack="${path%%/*}"; file="${path#*/}"
  curl -fsS --max-time 60 -o "$out/$path" "$media/$pack/audio/Audio/$file"
done < "$here/sources.sha256"
(cd "$out" && sha256sum -c --quiet "$here/sources.sha256")
echo "OK : $(wc -l < "$here/sources.sha256") fichiers vérifiés dans $out"
