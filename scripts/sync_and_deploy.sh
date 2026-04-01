#!/bin/bash
# Sync site content from staging + FPSQ, rebuild, and deploy.
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

# 3. Check if anything changed
if git diff --quiet && git diff --cached --quiet; then
    echo "[$(date '+%Y-%m-%d %H:%M')] No changes detected. Skipping deploy."
    exit 0
fi

# 4. Commit and push
echo "→ Committing changes..."
git add -A
git commit -m "Auto-sync: staging content + Vigie data update $(date '+%Y-%m-%d %H:%M')

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"

echo "→ Pushing to GitHub (triggers Netlify rebuild)..."
git push

echo "[$(date '+%Y-%m-%d %H:%M')] Site sync complete."
