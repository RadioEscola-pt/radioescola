#!/usr/bin/env bash
# Points the stack at an image tag and rolls it out. Run by the Deploy
# workflow. To roll back, prefer that workflow's "Run workflow" button over
# running this by hand: CI supplies registry credentials, which the box
# deliberately does not keep.
#
# By hand, if the image is still cached locally:
#
#   ssh deploy@server.radioescola.pt 'bash ~/app/release.sh 1.9.0'
#
# The tag has no leading v — metadata-action publishes the bare semver.
set -euo pipefail

TAG="${1:?usage: release.sh <image-tag>}"
cd "$(dirname "$0")"

# Resolve the image the compose file would use for this tag, without touching
# the live .env yet — so a typo'd or never-built tag cannot leave the recorded
# tag out of step with what is actually running.
# Name the service: `config --images` lists every service alphabetically, so an
# unqualified `head -1` returns caddy.
IMAGE=$(IMAGE_TAG="$TAG" docker compose config --images app)
echo "==> $IMAGE"

if ! docker pull "$IMAGE"; then
  # A manual rollback runs without registry credentials. That is fine as long
  # as the image is still cached locally.
  echo "==> pull failed; looking for a local copy"
  docker image inspect "$IMAGE" > /dev/null 2>&1 || {
    echo "!!! $IMAGE is neither pullable nor cached locally — nothing changed." >&2
    exit 1
  }
  echo "==> using the cached copy"
fi

printf 'IMAGE_TAG=%s\n' "$TAG" > .env

# --wait makes an unhealthy new container a failed deploy instead of a
# silently broken site.
docker compose up -d --remove-orphans --wait

# `up -d` only recreates a container whose *configuration* changed. The
# Caddyfile is a bind-mounted file, so editing its contents is invisible to
# compose and Caddy keeps serving the config it started with — a new hostname
# added here would never take effect, with nothing reporting an error. Reload it
# explicitly. This is graceful: connections are not dropped and certificates
# already held are kept.
# Retried because on a cold start Caddy's admin API may not be listening yet,
# and failing the deploy over that would be a false alarm — it started with the
# new config in that case anyway.
reloaded=""
for attempt in 1 2 3; do
  if docker compose exec -T caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile; then
    reloaded=yes
    break
  fi
  echo "==> caddy reload attempt $attempt failed; retrying"
  sleep 3
done
if [ -z "$reloaded" ]; then
  echo "!!! Caddy would not accept the new config; it is still serving the previous one." >&2
  exit 1
fi

docker image prune -f

docker compose ps
