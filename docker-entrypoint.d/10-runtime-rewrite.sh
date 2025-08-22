#!/bin/sh
set -eu

ROOT="/usr/share/nginx/html"

# Only include envs used in environment.ts
cat >"$ROOT/runtime-config.js.tmpl" <<'EOF'
window.runtimeConfig = {
  VITE_SPARROW_LAUNCH_URL: "${VITE_SPARROW_LAUNCH_URL}",
  VITE_API_BASE_URL: "${VITE_API_BASE_URL}",
  VITE_LOGIN_REDIRECT: "${VITE_LOGIN_REDIRECT}",
  VITE_SPARROW_DOCS_URL: "${VITE_SPARROW_DOCS_URL}",
  VITE_ENVIRONMENT: "${VITE_ENVIRONMENT}",
  VITE_APP_EDITION: "${VITE_APP_EDITION}",
  VITE_POSTHOG_CONNECTION_API_KEY: "${VITE_POSTHOG_CONNECTION_API_KEY}"
}
EOF

envsubst < "$ROOT/runtime-config.js.tmpl" > "$ROOT/runtime-config.js" || true
rm -f "$ROOT/runtime-config.js.tmpl"

# Helpful log
echo "Generated runtime-config.js:"
sed -n '1,20p' "$ROOT/runtime-config.js"