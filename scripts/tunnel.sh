#!/usr/bin/env bash
# Expose the local dev server through an ephemeral Cloudflare tunnel.
# Prints a fresh https://<random>.trycloudflare.com URL on every run.
set -euo pipefail

PORT="${PORT:-3000}"

command -v cloudflared >/dev/null 2>&1 || {
  echo "cloudflared not found. Install: https://developers.cloudflare.com/cloudflared" >&2
  exit 1
}

DEV_PID=""
cleanup() {
  if [[ -n "$DEV_PID" ]] && kill -0 "$DEV_PID" 2>/dev/null; then
    echo "Stopping dev server (pid $DEV_PID)"
    kill "$DEV_PID" 2>/dev/null || true
    wait "$DEV_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

cd "$(dirname "$0")/.."

if ss -ltn "sport = :${PORT}" 2>/dev/null | grep -q LISTEN; then
  echo "Detected existing listener on :${PORT}; skipping dev server start"
else
  echo "Starting dev server on :${PORT}"
  bun run dev --port "${PORT}" &
  DEV_PID=$!

  for _ in $(seq 1 60); do
    if ss -ltn "sport = :${PORT}" 2>/dev/null | grep -q LISTEN; then
      break
    fi
    if ! kill -0 "$DEV_PID" 2>/dev/null; then
      echo "Dev server exited before binding to :${PORT}" >&2
      exit 1
    fi
    sleep 0.5
  done
fi

echo "Starting ephemeral tunnel to http://localhost:${PORT}"
cloudflared tunnel --url "http://localhost:${PORT}"
