#!/usr/bin/env bash
#
# pipeline.sh — run the whole mechanical stretch for one title in a single command.
#
# It reads a per-title config, then: scaffolds the folder (if needed), downloads
# the source (if needed), runs the OCR cleanup, and prints a prioritized review
# summary. It STOPS at the human-review checkpoint — it never auto-accepts OCR
# changes and never touches KDP.
#
# Usage:
#   ./pipeline.sh <slug>
#
# Requires: titles/<slug>.conf   (see titles/history-of-the-yorubas.conf)
# Layout:   tools/ocr_cleanup.py, new-title.sh, pipeline.sh, titles/, <slug>/

set -euo pipefail

SLUG="${1:-}"
[ -n "$SLUG" ] || { echo "Usage: $0 <slug>" >&2; exit 1; }

CONF="titles/$SLUG.conf"
[ -f "$CONF" ] || { echo "Missing config: $CONF" >&2; exit 1; }

# Defaults, then load config
HEADER_PATTERN=""
CLEAN_FLAGS="--reflow --strip-detected-headers"
SOURCE_URL=""
# shellcheck disable=SC1090
source "$CONF"

for v in TITLE AUTHOR DEATH PUB; do
  [ -n "${!v:-}" ] || { echo "Config $CONF is missing $v" >&2; exit 1; }
done

echo "==> [$SLUG] $TITLE"

# 1. Scaffold if the folder doesn't exist yet (also downloads if URL given)
if [ ! -d "$SLUG" ]; then
  echo "==> scaffolding"
  ./new-title.sh "$SLUG" "$TITLE" "$AUTHOR" "$DEATH" "$PUB" "$SOURCE_URL"
else
  echo "==> folder exists, skipping scaffold"
fi

# 2. Ensure we have the source text
if [ ! -s "$SLUG/source/raw.txt" ]; then
  if [ -n "$SOURCE_URL" ]; then
    echo "==> downloading source"
    curl -fSL "$SOURCE_URL" -o "$SLUG/source/raw.txt"
  else
    echo "No source/raw.txt and no SOURCE_URL in config — add the text manually." >&2
    exit 1
  fi
fi

# 3. Run the cleanup (mechanical fixes applied, risky stuff flagged only)
echo "==> cleaning"
HP=()
[ -n "$HEADER_PATTERN" ] && HP=(--header-pattern "$HEADER_PATTERN")
# shellcheck disable=SC2086
python3 tools/ocr_cleanup.py "$SLUG/source/raw.txt" \
  --out "$SLUG/text/clean.txt" \
  --diff "$SLUG/text/changes.diff" \
  --report "$SLUG/text/report.md" \
  $CLEAN_FLAGS "${HP[@]}"

# 4. Print the review summary and STOP at the human gate
echo
echo "======================================================================"
echo " MECHANICAL PIPELINE COMPLETE — Gate 2 needs your eyes"
echo "======================================================================"
if [ -f "$SLUG/text/report.md" ]; then
  # show the summary block + the per-stage table (everything up to the first H2)
  awk 'NR==1{p=1} /^## /{if(seen)exit; seen=1} p' "$SLUG/text/report.md" | sed 's/^/  /'
fi
cat <<EOF

  Now do the part only you can do:
    1. Review changes:   less $SLUG/text/changes.diff
    2. Work the flags:   less $SLUG/text/report.md
    3. Proof Yoruba names/dates against the page images, then edit clean.txt.

  Then tick Gate 2 in $SLUG/README.md and move to Gate 3 (the introduction).
  Nothing here touched KDP. Publishing stays manual, by design.
======================================================================
EOF
