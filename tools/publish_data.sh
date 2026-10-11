#!/usr/bin/env bash
# Publie les données d'un workflow sur la branche (2026-10-11).
# Usage : tools/publish_data.sh <source> "<message de commit>" <fichiers ou dossiers…>
# Les trois workflows (boutiques, scellé, catalogue) écrivent tous web/data/status.json : s'ils publient en même temps,
# le rebase bute sur ce fichier. On repart alors de la dernière version publiée et on n'y remplace que la ligne de
# cette source (tools/check_data.py --merge-status) ; tout autre conflit arrête la publication.
set -u
BRANCH=claude/pokemon-app-mockup-1mxt7p
SOURCE=$1; MESSAGE=$2; shift 2
git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
for p in "$@"; do [ -e "$p" ] && git add "$p"; done
if git diff --cached --quiet; then echo "Aucun changement."; exit 0; fi
git commit -q -m "$MESSAGE"
MINE=$(git rev-parse HEAD)
for i in 1 2 3 4 5; do
  git fetch -q origin "$BRANCH"
  if ! git rebase -q "origin/$BRANCH"; then
    CONFLICTS=$(git diff --name-only --diff-filter=U)
    if [ "$CONFLICTS" != "web/data/status.json" ]; then
      echo "::error::Conflit de publication sur : $CONFLICTS"; git rebase --abort; exit 1
    fi
    python3 tools/check_data.py "$SOURCE" --merge-status "$MINE" || { git rebase --abort; exit 1; }
    git add web/data/status.json
    GIT_EDITOR=true git rebase --continue || { git rebase --abort; exit 1; }
    echo "status.json : ligne « $SOURCE » reposée sur la dernière version publiée."
  fi
  git push -q origin "HEAD:$BRANCH" && exit 0
  sleep $((i * 5))
done
exit 1
