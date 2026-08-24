import { NextResponse } from 'next/server';

/**
 * Container health probe.
 *
 * Deliberately does no work beyond proving the server is up and answering:
 * Docker polls it every 30s, and Caddy waits on it before accepting traffic
 * for a freshly rolled-out container.
 */
export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({ status: 'ok' });
}
