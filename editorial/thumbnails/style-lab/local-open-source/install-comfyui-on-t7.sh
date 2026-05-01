#!/usr/bin/env bash
set -euo pipefail

ROOT="/Volumes/T7 sharing/ai-image-lab"
COMFY="$ROOT/ComfyUI"

mkdir -p "$ROOT"

if [ ! -d "$COMFY/.git" ]; then
  git clone https://github.com/comfyanonymous/ComfyUI.git "$COMFY"
fi

cd "$COMFY"

if command -v python3.11 >/dev/null 2>&1; then
  PY=python3.11
else
  echo "python3.11 not found. Install it first, for example: brew install python@3.11" >&2
  exit 1
fi

"$PY" -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip wheel setuptools
python -m pip install torch torchvision torchaudio
python -m pip install -r requirements.txt

cat <<'MSG'

ComfyUI installed.

Next:
1. Put models under:
   /Volumes/T7 sharing/ai-image-lab/ComfyUI/models/checkpoints/
2. Run:
   cd "/Volumes/T7 sharing/ai-image-lab/ComfyUI"
   source .venv/bin/activate
   python main.py --listen 127.0.0.1 --port 8188

Open:
http://127.0.0.1:8188

MSG
