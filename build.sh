#!/usr/bin/env bash
#
# build.sh — Gate 4: Typesetting and Design
# Compiles the final cleaned text and apparatus into EPUB and PDF.
#
# Usage:
#   ./build.sh <slug>

set -euo pipefail

export PATH="/Library/TeX/texbin:$PATH"

SLUG="${1:-}"
[ -n "$SLUG" ] || { echo "Usage: $0 <slug>" >&2; exit 1; }

CONF="titles/$SLUG.conf"
[ -f "$CONF" ] || { echo "Missing config: $CONF" >&2; exit 1; }

# shellcheck disable=SC1090
source "$CONF"

echo "==> [$SLUG] Building $TITLE"

# Check dependencies
if ! command -v pandoc &> /dev/null; then
    echo "Pandoc is required but not installed. Please run: brew install pandoc" >&2
    exit 1
fi

# Ensure build directory exists
mkdir -p "$SLUG/build"

# Combine source files (Apparatus + Cleaned Text)
# Note: Ensure the files exist before adding them
SOURCES=()

# Add apparatus if they exist
# Use nullglob to avoid adding literally '*.md' if no files exist
shopt -s nullglob
for file in "$SLUG"/apparatus/*.md; do
    if [ -f "$file" ]; then
        SOURCES+=("$file")
    fi
done
shopt -u nullglob

# Add the main text
if [ -f "$SLUG/text/clean.txt" ]; then
    SOURCES+=("$SLUG/text/clean.txt")
else
    echo "Error: $SLUG/text/clean.txt not found. Did you finish Gate 2?" >&2
    exit 1
fi

# Generate Cover
./tools/generate_cover.sh "$SLUG"

echo "==> Generating EPUB..."
pandoc "${SOURCES[@]}" \
    -f markdown-raw_tex \
    -o "$SLUG/build/$SLUG.epub" \
    --epub-cover-image="$SLUG/design/cover/cover.jpg" \
    --metadata title="$TITLE" \
    --metadata author="$AUTHOR" \
    --toc \
    --toc-depth=2

echo "==> Generating PDF..."
pandoc "${SOURCES[@]}" \
    -f markdown-raw_tex \
    -o "$SLUG/build/$SLUG.pdf" \
    --pdf-engine=xelatex \
    --metadata title="$TITLE" \
    --metadata author="$AUTHOR" \
    --toc \
    --toc-depth=2 \
    -V geometry:margin=1in

echo "======================================================================"
echo " BUILD COMPLETE — Check the $SLUG/build/ directory"
echo "======================================================================"
