#!/usr/bin/env bash
set -euo pipefail

# Load .env if present
if [[ -f .env ]]; then
  set -a
  source .env
  set +a
fi

REMOTE_USER="${DEPLOY_REMOTE_USER:?Set DEPLOY_REMOTE_USER}"
REMOTE_HOST="${DEPLOY_REMOTE_HOST:?Set DEPLOY_REMOTE_HOST}"
REMOTE_DIR="${DEPLOY_REMOTE_DIR:-~/containers/radioescola}"
APP_NAME="${DEPLOY_APP_NAME:-radioescola}"

echo "==> Building locally..."
bun run build

echo "==> Syncing to ${REMOTE_HOST}..."
# Standalone output includes everything needed to run
rsync -az --delete .next/standalone/ "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/"

# Static assets and public files are not included in standalone, sync separately
rsync -az --delete .next/static/ "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/.next/static/"
rsync -az --delete public/ "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/public/"

echo "==> Restarting PM2 on remote..."
ssh "${REMOTE_USER}@${REMOTE_HOST}" "
  cd ${REMOTE_DIR}
  if pm2 describe ${APP_NAME} > /dev/null 2>&1; then
    pm2 restart ${APP_NAME}
  else
    pm2 start server.js --name ${APP_NAME} --cwd ${REMOTE_DIR}
  fi
  pm2 status ${APP_NAME}
"

echo "==> Done! Site is live."
