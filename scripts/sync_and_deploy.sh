#!/bin/bash
# Sync site content from staging + FPSQ, rebuild, and deploy to GitHub Pages.
# Called by cron or manually.
set -e

SITE_DIR="$HOME/Documents/Application files/site-kilama"
cd "$SITE_DIR"

export PATH="/opt/homebrew/bin:$PATH"

echo "[$(date '+%Y-%m-%d %H:%M')] Site sync starting..."

# 1. Ingest new staging documents
echo "→ Ingesting staging documents..."
python3 scripts/ingest_staging.py 2>&1 | tail -5

# 2. Update Vigie data (GPR + FPSQ scenarios)
echo "→ Updating Vigie data..."
python3 scripts/update_vigie_data.py 2>&1 | tail -5

# 2b. Regenerate trust page with live TLS fingerprint
echo "→ Regenerating trust page..."
bash scripts/generate_trust_page.sh 2>&1 | tail -2 || echo "  (skipped: cert fetch failed, keeping previous trust.md)"

# 3. Check if anything changed
if git diff --quiet && git diff --cached --quiet; then
    echo "[$(date '+%Y-%m-%d %H:%M')] No changes detected. Skipping deploy."
    exit 0
fi

# 4. Build Hugo for GitHub Pages
echo "→ Building site..."
hugo --gc --minify --baseURL "https://erickilama.com/" 2>&1 | tail -3

# 5. Commit and push source to main
echo "→ Committing changes..."
git add -A
git commit -m "Auto-sync $(date '+%Y-%m-%d %H:%M')

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"

echo "→ Pushing to GitHub..."
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

echo "[$(date '+%Y-%m-%d %H:%M')] Site sync complete. Live at: https://erickilama.com/"
