#!/bin/bash
# Sync site content from staging + FPSQ, rebuild, and deploy to GitHub Pages.
# Called by cron or manually.
set -e

SITE_DIR="$HOME/Documents/Application files/site-kilama"
cd "$SITE_DIR"

export PATH="/opt/homebrew/bin:$PATH"

# Secrets (FRED_API_KEY for the Vigie refresh fallback) — stored outside this
# public repo, 600 perms. Absent secret = no-op (refresh degrades gracefully).
[ -f "$HOME/.config/macrodata/secrets/fred.env" ] && . "$HOME/.config/macrodata/secrets/fred.env"

echo "[$(date '+%Y-%m-%d %H:%M')] Site sync starting..."

# 0. Site-lane gate (GO Eric 2026-07-11 — DELEGATED_SITE_VALIDATION, fail-closed).
# Vérifie les notes de staging marquées "delegated" (sidecar .lane.json) : allowlist signée,
# gates PASS, n-draw >=3, quota, kill-switch, autorisation Eric en phase pilote.
# Toute violation interrompt le deploy AVANT ingestion. Les notes du circuit humain
# classique (sans sidecar) ne sont pas concernées.
if ! python3 "$HOME/.config/macrodata/scripts/site_lane_gate.py" preflight; then
    echo "  ✖ SITE_LANE_GATE BLOCK — deploy interrompu (voir violations ci-dessus)."
    exit 2
fi

# 0b. Scan the complete public staging lane, including non-routable files. An
# internal artifact misplaced here must be quarantined, not merely skipped by
# the ingestion router.
echo "→ Checking public staging attribution..."
if ! python3 scripts/public_attribution_gate.py staging/for-site; then
    echo "  ✖ PUBLIC STAGING ATTRIBUTION BLOCK — deploy interrompu."
    exit 2
fi

# 1. Ingest new staging documents
echo "→ Ingesting staging documents..."
python3 scripts/ingest_staging.py 2>&1 | tail -5
INGEST_RC=${PIPESTATUS[0]}
if [ "$INGEST_RC" -ne 0 ]; then
    echo "  ✖ STAGING INGEST FAILED (exit $INGEST_RC) — deploy interrompu."
    exit 2
fi

# 2. Refresh Vigie public snapshot + FPSQ hybrid data
# Non-fatal but LOUD: an external-source outage (e.g. FRED fredgraph.csv timing
# out) must not silently ship a stale snapshot under a "complete" banner.
# tail masks the python exit code, so read it from PIPESTATUS, not $?.
echo "→ Refreshing Vigie site snapshot..."
python3 scripts/refresh_vigie_site_snapshot.py 2>&1 | tail -8
VIGIE_RC=${PIPESTATUS[0]}
if [ "$VIGIE_RC" -ne 0 ]; then
    VIGIE_STALE=1
    PREV_SNAP=$(date -r data/vigie_snapshot.json '+%Y-%m-%d %H:%M' 2>/dev/null || echo "unknown")
    echo "  ⚠ VIGIE REFRESH FAILED (exit $VIGIE_RC) — external data source unreachable."
    echo "  ⚠ Deploying PREVIOUS snapshot from ${PREV_SNAP}. Re-run when the source is back."
fi

# 2b. Regenerate trust page with live TLS fingerprint
echo "→ Regenerating trust page..."
bash scripts/generate_trust_page.sh 2>&1 | tail -2 || echo "  (skipped: cert fetch failed, keeping previous trust.md)"

# 2c. Regenerate Policy thumbnails manifest/assets
if [ -f editorial/thumbnails/build-thumbnails.mjs ]; then
    echo "→ Regenerating Policy thumbnails..."
    node editorial/thumbnails/build-thumbnails.mjs 2>&1 | tail -8
fi

# 2d. Public-attribution firewall. This must run after every content generator
# and before any build, commit, push, or deploy action.
echo "→ Checking public attribution firewall..."
if ! python3 scripts/public_attribution_gate.py; then
    echo "  ✖ PUBLIC ATTRIBUTION BLOCK — deploy interrompu."
    exit 2
fi

# 3. Check if anything changed
if git diff --quiet && git diff --cached --quiet; then
    echo "[$(date '+%Y-%m-%d %H:%M')] No changes detected. Skipping deploy."
    exit 0
fi

# 4. Build Hugo for GitHub Pages
echo "→ Building site..."
hugo --gc --minify --baseURL "https://erickilama.com/" 2>&1 | tail -3

echo "→ Checking rendered public attribution..."
if ! python3 scripts/public_attribution_gate.py public; then
    echo "  ✖ RENDERED PUBLIC ATTRIBUTION BLOCK — deploy interrompu."
    exit 2
fi

# 5. Commit and push source to main
echo "→ Committing changes..."
git add -A
git commit -m "Auto-sync $(date '+%Y-%m-%d %H:%M')

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"

echo "→ Pushing to GitHub..."
git config http.postBuffer 524288000
git push

# 6. Deploy to GitHub Pages (push built site to gh-pages branch)
echo "→ Deploying to GitHub Pages..."
TMPDIR=$(mktemp -d)
cp -r public/* "$TMPDIR/"
echo "erickilama.com" > "$TMPDIR/CNAME"
cd "$TMPDIR"
git init -b gh-pages
git config http.postBuffer 157286400
git add -A
git commit -m "Deploy $(date '+%Y-%m-%d %H:%M')"
git remote add origin https://github.com/killergabin-star/site-kilama.git
git push -f origin gh-pages 2>&1 | tail -3
rm -rf "$TMPDIR"

if [ "${VIGIE_STALE:-0}" -eq 1 ]; then
    echo "[$(date '+%Y-%m-%d %H:%M')] Site deployed, but ⚠ VIGIE DATA WAS NOT REFRESHED (external source down). Live snapshot is from a previous run — re-run this script when the source is reachable. Live at: https://erickilama.com/"
else
    echo "[$(date '+%Y-%m-%d %H:%M')] Site sync complete. Live at: https://erickilama.com/"
fi
