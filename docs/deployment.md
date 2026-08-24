# Deployment

Releases are cut by tagging. `git push origin v2.0.0` makes GitHub Actions run
the test suite, build a Docker image, push it to GHCR, and roll it out to
`server.radioescola.pt`. Nothing is built on the production box, and every
release is an immutable image you can roll back to by name.

```
git tag v2.0.0  ──▶  .github/workflows/release.yml
                        │
                        ├─ check    type-check, lint, test, content:check
                        ├─ build    Dockerfile ──▶ ghcr.io/radioescola-pt/radioescola:2.0.0
                        └─ deploy ──▶ deploy.yml (also runnable on its own,
                                      for a redeploy or a rollback)
                                        │
                                        scp deploy/* ──▶ ~/app ──▶ release.sh 2.0.0
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
| `.github/workflows/release.yml` | Tag → build → push → calls the deploy workflow |
| `.github/workflows/deploy.yml` | The rollout. Called by a release, or run by hand for a redeploy or rollback |

Edit the `deploy/` files here, never on the server — the next deploy overwrites
whatever is in `~/app`.

## One-time server setup

Everything below runs on the VPS as `root` unless noted.

### 1. DNS

Point every name Caddy serves at the VPS (`A`, plus `AAAA` if it has IPv6)
*before* deploying a Caddyfile that mentions it. Certificates are issued on
demand over HTTP-01, so a name that does not yet resolve here fails the
challenge — and Let's Encrypt allows only **5 failed validations per hostname
per hour**.

The names currently served, from `deploy/Caddyfile`:

| Name | Role |
| --- | --- |
| `www.radioescola.pt` | canonical public site |
| `radioescola.pt` | permanent redirect to www |
| `server.radioescola.pt` | alias, kept so deploys never depend on the public name |

When moving a live name across (as `www` was, from GitHub Pages): lower its TTL
first, flip the DNS, confirm it resolves to this host, and only then deploy the
Caddyfile that claims it. Doing it the other way round burns failed validations
while the old host still answers the challenge.

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

Then lock down SSH. **Do not edit `/etc/ssh/sshd_config` directly** — it already
says `PasswordAuthentication no`, but it `Include`s `sshd_config.d/*.conf` above
that line, and cloud-init and the provider both drop files in there turning it
back on. sshd keeps the *first* value it obtains, so the drop-ins win. Add one
that sorts ahead of them:

```bash
cat > /etc/ssh/sshd_config.d/00-hardening.conf <<'EOF'
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin prohibit-password
EOF

sshd -t && sshd -T | grep -E 'passwordauth|permitroot'   # confirm before reloading
systemctl reload ssh
```

Verify from a *second* terminal that your key still works before you close the
first one.

### 3. Docker

```bash
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

# Debian 14 is "forky", and Docker publishes no forky suite — pin trixie, whose
# packages work fine. Check before changing this:
#   curl -sI https://download.docker.com/linux/debian/dists/forky/Release
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/debian trixie stable" \
  > /etc/apt/sources.list.d/docker.list

apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable --now docker
```

> Once Docker ships a `forky` suite, switch the line to `$VERSION_CODENAME`.

### 4. Deploy user

```bash
useradd --create-home --shell /bin/bash --password '!' deploy
usermod -aG docker deploy
install -o deploy -g deploy -m 700 -d /home/deploy/app
```

(`useradd`, not `adduser`: `/usr/sbin` is off `PATH` for a non-interactive SSH
command, so scripted setup fails on `adduser: command not found`.)

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

### 6. Registry access — nothing to do

The repo is private, so the image is too, and the server has to authenticate to
pull it. Rather than parking a long-lived token on the box, the release workflow
logs the server in with its own `GITHUB_TOKEN` just before pulling and logs it
out again afterwards (`if: always()`, so a failed rollout still cleans up). That
token dies with the workflow run, so no registry credential outlives a deploy.

The one consequence: **a manual rollback runs without credentials.** That is
fine when the image is still cached on the box, which it is for anything recent
— `release.sh` treats a failed `pull` as a warning and lets `up --wait` decide.
To roll back to something already pruned, either re-run the release workflow for
that tag, or log in by hand first with a `read:packages` token.

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
| `DEPLOY_HOST` | `server.radioescola.pt` — the box to SSH to |
| `DEPLOY_USER` | `deploy` |
| `SITE_URL` | `https://www.radioescola.pt` — the public site, used for the smoke test and the environment link. Falls back to `https://$DEPLOY_HOST` if unset |
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

## The repository rename

The image name comes from `ghcr.io/${{ github.repository }}`, so it follows a
repository rename automatically — but `deploy/compose.yaml` names it literally
and does not. Both have to move together, or the workflow publishes to one
package while the server pulls from another and `release.sh` aborts with
"neither pullable nor cached".

**Packages do not rename with the repository.** Tags published before a rename
stay under the old package name, so a rollback across a rename cannot reach
them. Do not delete the old package, and cut a fresh tag straight after
renaming so the new one has something to roll back to.

## Deploying by hand, and rolling back

Images are never overwritten, so both are the same operation: point the stack at
a tag that already exists.

**Actions → Deploy → Run workflow**, and give it an image tag. That is the way to
do it. The workflow supplies registry credentials, so it works for any tag still
in GHCR, whether or not the box has it cached — and it is the same code path a
tag release takes, because `release.yml` calls this workflow too.

Note the tag has **no leading `v`**: published tags are the bare semver
(`2.0.0`, `2.0`) plus a `sha-` tag. Check the repo's Packages page for what
exists.

Over SSH also works, but only for an image the box still has cached — it holds
no registry credentials of its own by design:

```bash
ssh deploy@server.radioescola.pt 'bash ~/app/release.sh 2.0.0'
```

Either way, a tag that can be neither pulled nor found locally aborts before
`.env` is rewritten, so a typo leaves the running site alone.

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
