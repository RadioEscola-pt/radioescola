#!/usr/bin/env bash
set -euo pipefail

APP_NAME="radioescola"
APP_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "==> Pulling latest changes..."
cd "$APP_DIR"
git pull

echo "==> Installing dependencies..."
bun install

echo "==> Building production bundle..."
bun run build

echo "==> Restarting server..."
if pm2 describe "$APP_NAME" > /dev/null 2>&1; then
  pm2 restart "$APP_NAME"
else
  pm2 start "bun run start" --name "$APP_NAME" --cwd "$APP_DIR"
fi

echo "==> Done! Site is live."
pm2 status "$APP_NAME"
