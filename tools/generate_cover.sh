#!/usr/bin/env bash
#
# generate_cover.sh — Programmatically generates a high-end book cover using LaTeX.
#
# Usage:
#   ./tools/generate_cover.sh <slug>

set -euo pipefail

SLUG="${1:-}"
[ -n "$SLUG" ] || { echo "Usage: $0 <slug>" >&2; exit 1; }

CONF="titles/$SLUG.conf"
[ -f "$CONF" ] || { echo "Missing config: $CONF" >&2; exit 1; }

# shellcheck disable=SC1090
source "$CONF"

echo "==> [$SLUG] Generating cover for: $TITLE"

# Ensure design folder exists
COVER_DIR="$SLUG/design/cover"
mkdir -p "$COVER_DIR"

# Copy the template and any images
cp "_TEMPLATE/design/"* "$COVER_DIR/" 2>/dev/null || true

# Replace placeholders in both templates
SAFE_TITLE=$(echo "$TITLE" | sed -e 's/&/\\\&/g')
SAFE_AUTHOR=$(echo "$AUTHOR" | sed -e 's/&/\\\&/g')

for file in "$COVER_DIR"/cover*.tex; do
    sed -i '' "s|{{TITLE}}|$SAFE_TITLE|g" "$file"
    sed -i '' "s|{{AUTHOR}}|$SAFE_AUTHOR|g" "$file"
done

# Compile to PDF using xelatex
echo "==> Compiling LaTeX..."
cd "$COVER_DIR"
export PATH="/Library/TeX/texbin:$PATH"

xelatex -interaction=nonstopmode cover.tex > /dev/null
xelatex -interaction=nonstopmode cover_watermark.tex > /dev/null

# Clean up LaTeX aux files
rm -f *.aux *.log

# Convert PDF to high-res JPG for EPUB/KDP using sips
echo "==> Converting to JPG..."
sips -s format jpeg -s formatOptions 100 cover.pdf --out cover.jpg > /dev/null
sips -s format jpeg -s formatOptions 100 cover_watermark.pdf --out cover_watermark.jpg > /dev/null

echo "==> Cover generation complete: $COVER_DIR/cover.pdf (Centered) and cover_watermark.pdf (Watermark)"
