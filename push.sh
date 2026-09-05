#!/usr/bin/env bash
# Creates the GitHub repo and pushes. Reads the token from the GH_TOKEN env var.
# Usage:  GH_TOKEN=github_pat_xxx GH_USER=yourusername ./push.sh
set -euo pipefail

: "${GH_TOKEN:?Set GH_TOKEN}"
: "${GH_USER:?Set GH_USER (your GitHub username)}"
REPO="${REPO:-bidtobe1}"
VISIBILITY="${VISIBILITY:-public}"

echo "→ Verifying token..."
LOGIN=$(curl -sf -H "Authorization: Bearer $GH_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/user | grep -o '"login"[ ]*:[ ]*"[^"]*"' | head -1 | cut -d'"' -f4)
echo "  authenticated as: ${LOGIN:-UNKNOWN}"
[ -n "${LOGIN:-}" ] || { echo "Token rejected."; exit 1; }

echo "→ Creating repo $LOGIN/$REPO ($VISIBILITY)..."
PRIV=false; [ "$VISIBILITY" = "private" ] && PRIV=true
CODE=$(curl -s -o /tmp/gh_create.json -w '%{http_code}' -X POST \
  -H "Authorization: Bearer $GH_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/user/repos \
  -d "{\"name\":\"$REPO\",\"private\":$PRIV,\"description\":\"BIDTOBE1 — One more bid. Be #1. New Zealand's public pay-to-rank business leaderboard.\",\"has_issues\":true,\"has_wiki\":false}")

if [ "$CODE" = "201" ]; then
  echo "  repo created."
elif grep -q "already exists" /tmp/gh_create.json 2>/dev/null; then
  echo "  repo already exists — pushing to it."
else
  echo "  create failed (HTTP $CODE):"; cat /tmp/gh_create.json; exit 1
fi

echo "→ Pushing..."
git remote remove origin 2>/dev/null || true
git remote add origin "https://${GH_TOKEN}@github.com/${LOGIN}/${REPO}.git"
git push -u origin main --quiet
# scrub the token out of .git/config immediately
git remote set-url origin "https://github.com/${LOGIN}/${REPO}.git"

echo ""
echo "✅ Pushed: https://github.com/${LOGIN}/${REPO}"
echo "   Token removed from git config."
echo "   REVOKE THE TOKEN NOW: https://github.com/settings/tokens"
