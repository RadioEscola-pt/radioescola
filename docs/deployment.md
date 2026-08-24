# Deployment

Releases are cut by tagging. `git push origin v2.0.0` makes GitHub Actions run
the test suite, build a Docker image, push it to GHCR, and roll it out to
`server.radioescola.pt`. Nothing is built on the production box, and every
release is an immutable image you can roll back to by name.

```
git tag v2.0.0  ──▶  .github/workflows/release.yml
                        │
                        ├─ check    type-check, lint, test, content:check
                        ├─ build    Dockerfile ──▶ ghcr.io/radioescola-pt/site:2.0.0
                        └─ deploy   scp deploy/* ──▶ ~/app  ──▶ release.sh 2.0.0
                                                                │
                                    VPS: caddy (TLS) ──▶ app container :3000
```

## Files

| Path | What it is |
| --- | --- |
| `Dockerfile` | Bun builds, Node serves the standalone output |
| `.dockerignore` | Keeps the build context down (`public/` alone is ~170 MB) |
| `deploy/compose.yaml` | The stack: app + Caddy. Copied to the server on every deploy |
| `deploy/Caddyfile` | Reverse proxy and automatic TLS |
| `deploy/release.sh` | Pins an image tag and rolls it out. Also the rollback tool |
| `.github/workflows/ci.yml` | Checks. Runs on PRs, and is reused by the release |
| `.github/workflows/release.yml` | Tag → build → push → deploy |

Edit the `deploy/` files here, never on the server — the next deploy overwrites
whatever is in `~/app`.

## One-time server setup

Everything below runs on the VPS as `root` unless noted.

### 1. DNS

Point `server.radioescola.pt` at the VPS (`A`, plus `AAAA` if it has IPv6)
*before* the first deploy. Caddy issues the certificate on startup and needs the
name to resolve to itself.

### 2. Base system

```bash
apt update && apt full-upgrade -y
apt install -y ca-certificates curl ufw unattended-upgrades

ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443
ufw --force enable
```

Lock down SSH in `/etc/ssh/sshd_config` — `PasswordAuthentication no`,
`PermitRootLogin prohibit-password` — then `systemctl restart ssh`.

### 3. Docker

```bash
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

. /etc/os-release
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/debian $VERSION_CODENAME stable" \
  > /etc/apt/sources.list.d/docker.list

apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable --now docker
```

> Docker publishes per-release suites. If `apt update` 404s on the Debian 14
> codename, the repo has not caught up yet — substitute the previous stable
> codename (`trixie`) in the `sources.list.d` line. The packages are compatible.

### 4. Deploy user

```bash
adduser --disabled-password --gecos "" deploy
usermod -aG docker deploy
install -o deploy -g deploy -m 700 -d /home/deploy/app
```

`docker` group membership is root-equivalent. That is why this user exists and
why it does nothing else.

### 5. SSH key for GitHub Actions

On your machine:

```bash
ssh-keygen -t ed25519 -f /tmp/radioescola_deploy -N "" -C "github-actions"
ssh-copy-id -i /tmp/radioescola_deploy.pub deploy@server.radioescola.pt
ssh-keyscan -t ed25519 server.radioescola.pt   # → DEPLOY_KNOWN_HOSTS
```

Keep the private key for the `DEPLOY_SSH_KEY` secret below, then delete it
locally. Pinning `known_hosts` rather than disabling host-key checking is what
stops a deploy from being redirected to another host.

### 6. Registry access

The repo is private, so the image is too, and the server has to authenticate to
pull it. Create a **classic** personal access token with only the
`read:packages` scope, then, as `deploy`:

```bash
echo "<token>" | docker login ghcr.io -u <github-username> --password-stdin
```

This writes `~/.docker/config.json` and persists across reboots. (Making the
GHCR package public instead removes this step — but the image contains the full
site build, so only do that if the site's content is public anyway.)

### 7. Runtime secrets

As `deploy`, create `~/app/app.env` — this is the only configuration that lives
on the server:

```bash
cat > ~/app/app.env <<'EOF'
RESEND_API_KEY=re_xxxxxxxxxxxx
EXAM_SUBMISSION_EMAIL=you@example.com
RESEND_FROM_EMAIL=onboarding@resend.dev
EOF
chmod 600 ~/app/app.env
```

The app runs fine without these; only `/submit-exam` needs them.

`~/app/.env` is a *different* file, written by `release.sh` on every deploy to
record which image tag is live. Do not put secrets in it.

Build-time flags (`NEXT_PUBLIC_GAMIFICATION`) are **not** here. Next inlines
them at build time, so they are baked into the image — changing one means a new
tag, not an edit on the server.

## One-time GitHub setup

**Settings → Secrets and variables → Actions → Variables** (repository):

| Variable | Value |
| --- | --- |
| `DEPLOY_HOST` | `server.radioescola.pt` |
| `DEPLOY_USER` | `deploy` |
| `NEXT_PUBLIC_GAMIFICATION` | `true` to ship gamification, otherwise leave unset |

**Settings → Environments → New environment → `production`**, then add its
secrets:

| Secret | Value |
| --- | --- |
| `DEPLOY_SSH_KEY` | the private key from step 5 |
| `DEPLOY_KNOWN_HOSTS` | the `ssh-keyscan` output from step 5 |

Scoping them to the environment means only the `deploy` job can read them. Add
required reviewers to that environment if you ever want releases to pause for
approval.

Nothing needs configuring for GHCR on the CI side — `GITHUB_TOKEN` with
`packages: write` covers the push.

## Releasing

```bash
git tag -a v2.0.0 -m "Release 2.0.0"
git push origin v2.0.0
```

Watch it in the Actions tab. The deploy step fails loudly if the new container
does not come up healthy, and a final smoke test hits `/api/health` through
Caddy.

Only `v*.*.*` tags trigger a release. Pushes to `main` run the checks only.

## Rolling back

Images are never overwritten, so rollback is just pointing at an older one:

```bash
ssh deploy@server.radioescola.pt 'bash ~/app/release.sh 1.9.0'
```

Note the tag has no leading `v` — the published image tags are the semver
version (`2.0.0`, `2.0`) plus a `sha-` tag. `docker image ls` on the server
shows what is still cached locally; anything else pulls from GHCR.

## Operating it

```bash
cd ~/app
docker compose ps                 # what is running, and its health
docker compose logs -f app        # app logs (rotated, 10 MB × 5)
docker compose logs -f caddy      # TLS issuance and access problems
cat .env                          # which tag is live
```

The stack has `restart: unless-stopped` and Docker is enabled at boot, so a
reboot brings the site back on its own.

Never `docker volume prune` — the `caddy_data` volume holds the ACME account
and issued certificates, and re-issuing runs into Let's Encrypt rate limits.
`release.sh` only prunes dangling *images*, which is safe.

## Known trade-offs

- **A deploy has a few seconds of downtime.** The app container is replaced in
  place. Zero-downtime would need two app containers and a proxy that drains
  the old one (blue/green, or a tool like Kamal). Not worth it for a site with
  no server-side session state.
- **The image unpacks to ~436 MB**: ~245 MB Debian + Node runtime, 185 MB
  `public/` (169 MB of it exam PDFs), 52 MB traced `node_modules`, 4 MB static
  assets. (`docker images` reports ~770 MB under the containerd image store —
  it counts the compressed blobs *and* the unpacked snapshot.) Only the ~56 MB
  of app layers change between releases; the PDF layer is content-addressed and
  is reused, so it is pushed and pulled exactly once. Verified by rebuilding
  after a code change and comparing layer digests.
- **`deploy.sh` and `deploy-remote.sh` are superseded.** The first builds on the
  production box, the second builds on your laptop; both fight with the
  container for the port. Delete them once this flow is live.
