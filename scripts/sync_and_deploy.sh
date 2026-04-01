#!/bin/bash
# Sync site content from staging + FPSQ, rebuild, and deploy.
# Called by cron or manually.
set -e

SITE_DIR="$HOME/Documents/Application files/site-kilama"
cd "$SITE_DIR"

export PATH="/opt/homebrew/bin:$PATH"

NETLIFY_AUTH_TOKEN="nfp_2iBo3EdmRAub4k4reqGpeh75pTDxJvqVcd4e"
NETLIFY_SITE_ID="16645f05-2c54-4f21-8129-b13df3a386b2"
export NETLIFY_AUTH_TOKEN NETLIFY_SITE_ID

echo "[$(date '+%Y-%m-%d %H:%M')] Site sync starting..."

# 1. Ingest new staging documents
echo "→ Ingesting staging documents..."
python3 scripts/ingest_staging.py 2>&1 | tail -5

# 2. Update Vigie data (GPR + FPSQ scenarios)
echo "→ Updating Vigie data..."
python3 scripts/update_vigie_data.py 2>&1 | tail -5

# 3. Check if anything changed
if git diff --quiet && git diff --cached --quiet; then
    echo "[$(date '+%Y-%m-%d %H:%M')] No changes detected. Skipping deploy."
    exit 0
fi

# 4. Build Hugo (clean build to avoid stale assets)
echo "→ Building site..."
hugo --gc --minify 2>&1 | tail -3

# 5. Commit and push
echo "→ Committing changes..."
git add -A
git commit -m "Auto-sync $(date '+%Y-%m-%d %H:%M')

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"

echo "→ Pushing to GitHub..."
git push

# 6. Deploy to Netlify (direct CLI deploy — GitHub auto-build is broken)
echo "→ Deploying to Netlify..."
netlify deploy --prod --dir=public --message="Auto-sync $(date '+%Y-%m-%d %H:%M')" 2>&1 | tail -3

echo "[$(date '+%Y-%m-%d %H:%M')] Site sync complete."
