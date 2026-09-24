import fs from 'node:fs';
import path from 'node:path';
import Link from 'next/link';
import { Download } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

interface DownloadButtonProps {
  url: string;
  name: string;
  description?: string;
}

/** Bare filename, `docs/x.pdf`, `/docs/x.pdf` and absolute URLs all land here. */
function resolveHref(url: string) {
  if (/^https?:\/\//i.test(url)) return url;
  const clean = url.replace(/^\/+/, '');
  return clean.startsWith('docs/') ? `/${clean}` : `/docs/${clean}`;
}

function extensionOf(url: string) {
  const name = url.split('?')[0]?.split('#')[0] ?? '';
  const dot = name.lastIndexOf('.');
  return dot > -1 ? name.slice(dot + 1).toUpperCase() : 'FILE';
}

/**
 * Measured, never declared. The size used to be a `sizeMb` prop typed in at the
 * call site, and it was wrong: the phonetic alphabet PDF was advertised as 3 MB
 * and is 272 KB. Files live under `public/`, which the Dockerfile copies into
 * the image, so this reads the real thing at request time.
 */
function fileSize(href: string) {
  if (/^https?:\/\//i.test(href)) return null;
  try {
    const bytes = fs.statSync(path.join(process.cwd(), 'public', href)).size;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
  } catch {
    return null;
  }
}

/**
 * A file offered by a study guide, drawn as the guides draw a formula: a
 * bordered panel with a caption, not a poster. The whole row is the link, so
 * the "Transferir" pill is a span: an interactive element nested in an anchor
 * is invalid, and it used to swallow the keyboard here.
 */
export default async function DownloadButton({ url, name, description }: DownloadButtonProps) {
  const t = await getTranslations('Download');
  const href = resolveHref(url);
  const size = fileSize(href);

  return (
    <div className="not-prose my-7 overflow-hidden rounded-[10px] border border-[var(--guide-line)] bg-[var(--guide-panel)]">
      <p className="border-b border-[var(--guide-line)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-stone-500 dark:text-slate-400">
        {t('caption')}
      </p>

      <Link
        href={href}
        download
        className="group flex items-center gap-3.5 px-4 py-3.5 no-underline transition-colors hover:bg-amber-500/[0.07] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-amber-500/60 dark:hover:bg-white/5"
      >
        <span className="shrink-0 rounded-[5px] border border-[var(--guide-line)] px-1.5 py-0.5 text-[11px] font-bold tracking-[0.08em] text-stone-600 dark:text-slate-300">
          {extensionOf(url)}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold text-slate-900 dark:text-slate-100">
            {name}
          </span>
          {description && (
            <span className="mt-0.5 block text-[13px] leading-snug text-stone-500 dark:text-slate-400">
              {description}
            </span>
          )}
        </span>

        {size && (
          <span className="hidden shrink-0 text-[13px] tabular-nums text-stone-500 sm:block dark:text-slate-400">
            {size}
          </span>
        )}

        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-[7px] border border-[var(--guide-line)] bg-white px-2.5 py-1.5 text-[13px] font-semibold text-slate-900 transition-colors group-hover:border-brand-700 group-hover:bg-brand-700 group-hover:text-white dark:bg-transparent dark:text-slate-100 dark:group-hover:border-brand-500 dark:group-hover:bg-brand-600">
          <Download className="h-[15px] w-[15px]" aria-hidden="true" />
          <span className="hidden sm:inline">{t('action')}</span>
        </span>
      </Link>
    </div>
  );
}
