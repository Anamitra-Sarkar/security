#!/usr/bin/env bash
# Smoke test script for post-deploy verification.
# Usage: bash scripts/smoke_test.sh [BACKEND_URL]
#
# Env vars: BACKEND_URL (optional, defaults to localhost:8000)
set -euo pipefail

BACKEND_URL="${1:-http://localhost:8000}"

echo "=== Sentinel Smoke Tests ==="
echo "Backend URL: $BACKEND_URL"
echo ""

# Test 1: Health check
echo -n "1. Health check... "
HEALTH=$(curl -sf "$BACKEND_URL/health" 2>/dev/null || echo '{"status":"error"}')
if echo "$HEALTH" | grep -q '"ok"'; then
  echo "✅ PASS"
else
  echo "❌ FAIL: $HEALTH"
  exit 1
fi

# Test 2: Metrics endpoint
echo -n "2. Metrics endpoint... "
METRICS_STATUS=$(curl -sf -o /dev/null -w "%{http_code}" "$BACKEND_URL/metrics" 2>/dev/null || echo "000")
if [ "$METRICS_STATUS" = "200" ]; then
  echo "✅ PASS"
else
  echo "❌ FAIL: HTTP $METRICS_STATUS"
  exit 1
fi

# Test 3: Analyze endpoint
echo -n "3. Analyze endpoint... "
ANALYZE=$(curl -sf -X POST "$BACKEND_URL/api/analyze" \
  -H "Content-Type: application/json" \
  -d '{"text": "The Federal Reserve announced today that it will maintain current interest rates through the end of the quarter, citing stable employment numbers."}' \
  2>/dev/null || echo '{"status":"error"}')

if echo "$ANALYZE" | grep -q '"threat_score"'; then
  echo "✅ PASS"
  SCORE=$(echo "$ANALYZE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('threat_score','N/A'))" 2>/dev/null || echo "N/A")
  echo "   Threat score: $SCORE"
else
  echo "⚠️  WARN: Analyze returned unexpected response (external APIs may not be configured)"
  echo "   Response: ${ANALYZE:0:200}"
fi

# Test 4: Validation (text too short)
echo -n "4. Input validation... "
VAL_STATUS=$(curl -sf -o /dev/null -w "%{http_code}" -X POST "$BACKEND_URL/api/analyze" \
  -H "Content-Type: application/json" \
  -d '{"text": "short"}' 2>/dev/null || echo "000")
if [ "$VAL_STATUS" = "422" ]; then
  echo "✅ PASS (422 for invalid input)"
else
  echo "⚠️  WARN: Expected 422, got $VAL_STATUS"
fi

echo ""
echo "=== Smoke Tests Complete ==="
