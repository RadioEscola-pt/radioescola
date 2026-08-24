#!/usr/bin/env bash
# Points the stack at an image tag and rolls it out. Run by the release
# workflow, and by hand to roll back:
#
#   ssh deploy@server.radioescola.pt 'bash ~/app/release.sh 1.9.0'
#
# The tag has no leading v — metadata-action publishes the bare semver.
#
set -euo pipefail

TAG="${1:?usage: release.sh <image-tag>}"
cd "$(dirname "$0")"

printf 'IMAGE_TAG=%s\n' "$TAG" > .env

# A manual rollback runs without registry credentials (CI logs the box out
# again after every deploy). That is fine as long as the image is still cached
# locally, so a failed pull is a warning, not the end — `up --wait` below is
# what actually decides whether the release is viable.
docker compose pull || echo "==> pull failed; falling back to a locally cached image"
# --wait makes an unhealthy new container a failed deploy instead of a
# silently broken site.
docker compose up -d --remove-orphans --wait
docker image prune -f

docker compose ps
