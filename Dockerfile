# syntax=docker/dockerfile:1

# Bun builds (the content pipeline scripts are run by bun), Node serves — the
# standalone server is a plain Node program and Node is what Next supports for
# it. Both stages are glibc/Debian so the traced native binaries (sharp) that
# get copied across match the runner's libc.

FROM oven/bun:1.4 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile


FROM oven/bun:1.4 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* is inlined by next build, so feature flags are baked into the
# image here — the server's app.env cannot change them afterwards.
ARG NEXT_PUBLIC_GAMIFICATION
ENV NEXT_PUBLIC_GAMIFICATION=$NEXT_PUBLIC_GAMIFICATION
ENV NEXT_TELEMETRY_DISABLED=1

# `bun run build` gates on content:check, so a stale generated artifact fails
# the image build rather than shipping.
RUN bun run build

# Next traces sharp's musl binaries alongside the glibc ones. The runner is
# Debian, so the musl copies are ~19 MB of dead weight — drop them here, before
# the runner stage copies the tree (deleting them later would not shrink the
# image, only add a whiteout layer).
RUN rm -rf .next/standalone/node_modules/@img/sharp-libvips-linuxmusl-x64 \
           .next/standalone/node_modules/@img/sharp-linuxmusl-x64


FROM node:24-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs

# standalone carries the server plus its traced dependencies; static assets and
# public/ are never traced and have to come across on their own.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
