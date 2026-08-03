#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
if [ ! -f "package.json" ]; then echo "No package.json — skipping"; exit 0; fi
echo "=== Type check ===" && npx tsc --noEmit
echo "=== Lint ===" && npx eslint .
echo "=== Tests ===" && npx jest --passWithNoTests
echo "=== Build ===" && npm run build --if-present
echo "=== All checks passed ==="
