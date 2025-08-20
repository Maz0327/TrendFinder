#!/bin/bash
set -euo pipefail

# --- Helpers ---
PM="npm"
if command -v pnpm >/dev/null 2>&1; then PM="pnpm"; fi
RUN() { if [ "$PM" = "pnpm" ]; then pnpm "$@"; else npm run "$@"; fi }
LSDEP() { if [ "$PM" = "pnpm" ]; then pnpm ls "$@" --depth=0 || true; else npm ls "$@" --depth=0 || true; fi }

mkdir -p artifacts logs
REPORT="artifacts/system_audit_$(date -u +%Y%m%dT%H%M%SZ).md"
: > "$REPORT"
section(){ echo -e "\n## $1\n" | tee -a "$REPORT"; }
code(){ echo -e '```'"$1"'\n'"$2"'\n```' | tee -a "$REPORT"; }

echo "# System Audit Report" | tee -a "$REPORT"
echo "_Generated: $(date -u)_" | tee -a "$REPORT"

# --- 1) Environment & Toolchain ---
section "Environment & Toolchain"
NODEV=$(node -v 2>/dev/null || echo "not found")
NPMV=$(npm -v 2>/dev/null || echo "not found")
PNPMV=$(pnpm -v 2>/dev/null || echo "not found")
echo "- Node: $NODEV" | tee -a "$REPORT"
echo "- npm:  $NPMV" | tee -a "$REPORT"
echo "- pnpm: $PNPMV" | tee -a "$REPORT"
echo "- Package manager used for audit: $PM" | tee -a "$REPORT"

# --- 2) Package.json snapshot ---
section "package.json Snapshot"
if [ -f package.json ]; then
  node - <<'NODE' | tee -a "$REPORT"
const pkg = require("./package.json");
const pick = (o, ks) => Object.fromEntries(ks.filter(k => k in o).map(k=>[k,o[k]]));
console.log("Name:", pkg.name || "(none)");
console.log("Version:", pkg.version || "(none)");
console.log("\nScripts:");
console.log(Object.keys(pkg.scripts||{}).map(k=>`- ${k}: ${pkg.scripts[k]}`).join("\n") || "(none)");
console.log("\nKey deps:");
const keys = ["react","react-dom","vite","@vitejs/plugin-react","typescript","esbuild","tailwindcss","@tailwindcss/postcss","concurrently","tsx"];
const all = {...(pkg.dependencies||{}), ...(pkg.devDependencies||{})};
console.log(keys.map(k=>`- ${k}: ${all[k]||"(missing)"}`).join("\n"));
NODE
else
  echo "package.json not found" | tee -a "$REPORT"
fi

# --- 3) Dependency Integrity (presence, not installing) ---
section "Dependency Integrity (presence)"
LSDEP react react-dom vite @vitejs/plugin-react typescript tailwindcss @tailwindcss/postcss esbuild concurrently tsx | tee -a "$REPORT"

# --- 4) Config sanity (Vite/Tailwind/PostCSS) ---
section "Build Configuration"
echo "- postcss.config.cjs:" | tee -a "$REPORT"
[ -f postcss.config.cjs ] && head -n 20 postcss.config.cjs | sed 's/^/  /' | tee -a "$REPORT" || echo "  (missing)" | tee -a "$REPORT"
echo "- tailwind.config.*:" | tee -a "$REPORT"
ls -1 tailwind.config.* 2>/dev/null | sed 's/^/  /' | tee -a "$REPORT" || echo "  (none)" | tee -a "$REPORT"
echo "- vite.config.ts:" | tee -a "$REPORT"
[ -f vite.config.ts ] && head -n 40 vite.config.ts | sed 's/^/  /' | tee -a "$REPORT" || echo "  (missing)" | tee -a "$REPORT"

# --- 5) Security & Hardening checks (static) ---
section "Security & Hardening (static scan)"
echo "- Helmet usage:" | tee -a "$REPORT"; git grep -n "from \"helmet\"" -- server 2>/dev/null | tee -a "$REPORT" || echo "  (not found)" | tee -a "$REPORT"
echo "- Rate limiting middleware:" | tee -a "$REPORT"; git grep -n "express-rate-limit" -- server 2>/dev/null | tee -a "$REPORT" || echo "  (not found)" | tee -a "$REPORT"
echo "- CORS middleware (strict):" | tee -a "$REPORT"; git grep -n "corsMiddleware" -- server 2>/dev/null | tee -a "$REPORT" || echo "  (not found)" | tee -a "$REPORT"
echo "- Project scope middleware:" | tee -a "$REPORT"; git grep -n "project-scope" -- server 2>/dev/null | tee -a "$REPORT" || echo "  (not found)" | tee -a "$REPORT"
echo "- Auth enforcement (requireAuth):" | tee -a "$REPORT"; git grep -n "requireAuth" -- server 2>/dev/null | tee -a "$REPORT" || echo "  (not found)" | tee -a "$REPORT"
echo "- Dev/mock flags (should be dev-only):" | tee -a "$REPORT"; git grep -n "MOCK_AUTH\|VITE_MOCK_AUTH\|dev-mock-token\|mock-token" -- server client 2>/dev/null | tee -a "$REPORT" || echo "  (not found)" | tee -a "$REPORT"
echo "- Wildcard CORS or permissive origins:" | tee -a "$REPORT"; git grep -n "\*\.|\\*|Access-Control-Allow-Origin" -- server 2>/dev/null | tee -a "$REPORT" || echo "  (not found)" | tee -a "$REPORT"
echo "- CSP/CORS headers mentions:" | tee -a "$REPORT"; git grep -n "Cache-Control\|ETag\|Strict-Transport-Security\|Content-Security-Policy" -- server 2>/dev/null | tee -a "$REPORT" || echo "  (not found)" | tee -a "$REPORT"

# --- 6) API Surface & Routes (static) ---
section "API Surface & Routes (static grep)"
git grep -n "app\.\(get\|post\|put\|patch\|delete\)\(.*\)\/api" -- server 2>/dev/null | sed 's/^/  /' | tee -a "$REPORT" || echo "  (no explicit routes found)" | tee -a "$REPORT"
echo "- Captures router mounted:" | tee -a "$REPORT"; git grep -n 'app\.use("/api/captures"' -- server 2>/dev/null | tee -a "$REPORT" || echo "  (not mounted)" | tee -a "$REPORT"
echo "- Daily briefing route:" | tee -a "$REPORT"; git grep -n "daily-briefing" -- server client 2>/dev/null | tee -a "$REPORT" || echo "  (not found)" | tee -a "$REPORT"
echo "- Truth Lab routes:" | tee -a "$REPORT"; git grep -n "/api/truth" -- server 2>/dev/null | tee -a "$REPORT" || echo "  (not found)" | tee -a "$REPORT"

# --- 7) Client Scoping & UI-V2 checks ---
section "Client Scoping & UI-V2"
echo "- X-Project-ID header set:" | tee -a "$REPORT"; git grep -n "X-Project-ID" -- client/src/ui-v2/lib/api.ts 2>/dev/null | tee -a "$REPORT" || echo "  (not found)" | tee -a "$REPORT"
echo "- ProjectProvider integration:" | tee -a "$REPORT"; git grep -n "ProjectProvider\|useProjectContext\|setScopedProjectId" -- client/src/ui-v2 2>/dev/null | tee -a "$REPORT" || echo "  (not found)" | tee -a "$REPORT"
echo "- Upload workflow (UploadPanel + service):" | tee -a "$REPORT"; git grep -n "uploadCaptures(" -- client/src/ui-v2 2>/dev/null | tee -a "$REPORT" || echo "  (not found)" | tee -a "$REPORT"

# --- 8) Extension Manifest sanity ---
section "Chrome Extension (permissions & CSP)"
if ls -1 extension 2>/dev/null >/dev/null; then
  echo "- extension/manifest.json (first 60 lines):" | tee -a "$REPORT"
  head -n 60 extension/manifest.json | sed 's/^/  /' | tee -a "$REPORT" || true
  echo "- Broad permissions scan:" | tee -a "$REPORT"; git grep -n "<all_urls>\|activeTab\|scripting" -- extension 2>/dev/null | tee -a "$REPORT" || echo "  (none)" | tee -a "$REPORT"
else
  echo "extension/ not found" | tee -a "$REPORT"
fi

# --- 9) Env requirements presence (strings only) ---
section "Environment Variables (string presence check)"
REQ_VARS=( NODE_ENV VITE_SITE_URL ALLOWED_ORIGINS CHROME_EXTENSION_ID SUPABASE_URL SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY SUPABASE_JWT_SECRET SUPABASE_STORAGE_BUCKET RATE_LIMIT_WINDOW_MS RATE_LIMIT_MAX )
for v in "${REQ_VARS[@]}"; do
  echo "- $v: ${!v:-"(not set)"}" | tee -a "$REPORT"
done

# --- 10) Typecheck / Lint / Tests / Build ---
section "Typecheck"
( RUN typecheck ) > logs/audit_typecheck.out 2>&1 || true
code "text" "$(tail -n 40 logs/audit_typecheck.out 2>/dev/null || echo "(no output)")"

section "Unit Tests"
( RUN test ) > logs/audit_test.out 2>&1 || true
code "text" "$(tail -n 60 logs/audit_test.out 2>/dev/null || echo "(no test script or no output)")"

section "Build"
( RUN build ) > logs/audit_build.out 2>&1 || true
code "text" "$(tail -n 60 logs/audit_build.out 2>/dev/null || echo "(no build output)")"

# --- 11) Security: dependency advisory scan (best-effort) ---
section "Dependency Vulnerability Summary"
if [ "$PM" = "pnpm" ]; then
  pnpm audit --prod --audit-level=moderate || true | tee logs/audit_vulns.out
else
  npm audit --omit=dev --audit-level=moderate || true | tee logs/audit_vulns.out
fi
code "text" "$(tail -n 80 logs/audit_vulns.out 2>/dev/null || echo "(audit unavailable)")"
# esbuild version check
ESV=$(node -e "try{console.log(require('esbuild/package.json').version)}catch(e){console.log('not installed')}" || true)
echo "- esbuild version: $ESV (expect >= 0.24.4)" | tee -a "$REPORT"

# --- 12) Live Probe (dev) ---
section "Dev Server Probe (5000 API / 5173 Vite)"
( RUN dev ) > logs/audit_dev.out 2>&1 & DEV_PID=$! || true
sleep 5
echo "- /healthz:" | tee -a "$REPORT"
curl -s -i http://127.0.0.1:5000/healthz 2>/dev/null | head -n 10 | sed 's/^/  /' | tee -a "$REPORT" || echo "  (unavailable)" | tee -a "$REPORT"
echo "- /api/daily-briefing (unauth sample, expect 401):" | tee -a "$REPORT"
curl -s -i http://127.0.0.1:5000/api/daily-briefing 2>/dev/null | head -n 10 | sed 's/^/  /' | tee -a "$REPORT" || echo "  (unavailable)" | tee -a "$REPORT"
echo "- /api/captures (unauth, expect 401):" | tee -a "$REPORT"
curl -s -i http://127.0.0.1:5000/api/captures 2>/dev/null | head -n 10 | sed 's/^/  /' | tee -a "$REPORT" || echo "  (unavailable)" | tee -a "$REPORT"
echo "- Vite root (5173):" | tee -a "$REPORT"
curl -s -i http://127.0.0.1:5173/ 2>/dev/null | head -n 10 | sed 's/^/  /' | tee -a "$REPORT" || echo "  (unavailable)" | tee -a "$REPORT"
kill $DEV_PID >/dev/null 2>&1 || true

# --- 13) Diagnostics: common pitfalls ---
section "Common Pitfalls Checklist"
cat <<'TXT' | tee -a "$REPORT"
- [ ] @vitejs/plugin-react missing or not resolved
- [ ] tsx missing (use npx tsx or add devDep)
- [ ] Tailwind v4 config mismatched (ensure @tailwindcss/postcss in postcss.config.cjs)
- [ ] Two PostCSS configs present (keep only postcss.config.cjs)
- [ ] Auth bypass flags set in production (MOCK_AUTH/VITE_MOCK_AUTH)
- [ ] CORS wildcard or unlisted origins allowed
- [ ] Rate limiting not mounted on /api and /api/auth
- [ ] Project scoping absent (X-Project-ID not set or ignored)
- [ ] Captures upload endpoint missing/broken
- [ ] Daily briefing route missing/broken
- [ ] Esbuild < 0.24.4 (known vuln)
- [ ] Missing error tracking (e.g., Sentry)
- [ ] E2E tests absent (Playwright/Cypress)
- [ ] CDN/caching headers absent on static assets
TXT

echo -e "\n---\nReport: $REPORT\nLogs: ./logs\n"