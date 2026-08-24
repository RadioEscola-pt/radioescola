#!/usr/bin/env bash
# Points the stack at an image tag and rolls it out. Run by the release
# workflow, and by hand to roll back:
#
#   ssh deploy@server.radioescola.pt 'bash ~/app/release.sh v1.9.0'
#
set -euo pipefail

TAG="${1:?usage: release.sh <image-tag>}"
cd "$(dirname "$0")"

printf 'IMAGE_TAG=%s\n' "$TAG" > .env

docker compose pull
# --wait makes an unhealthy new container a failed deploy instead of a
# silently broken site.
docker compose up -d --remove-orphans --wait
docker image prune -f

docker compose ps
