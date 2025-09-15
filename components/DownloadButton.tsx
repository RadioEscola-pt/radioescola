import Link from 'next/link';
import {
  Download,
  FileDown,
  FileText,
  FileArchive,
  FileSpreadsheet,
  FileImage,
  FileAudio,
  FileVideo,
  FileCode,
} from 'lucide-react';

interface DownloadButtonProps {
  url: string;
  name: string;
  description?: string;
  sizeMb?: number; // optional size in megabytes
}

export default function DownloadButton({ url, name, description, sizeMb }: DownloadButtonProps) {
  const href = (() => {
    if (/^https?:\/\//i.test(url)) return url;
    const clean = url.replace(/^\/+/, '');
    if (clean.startsWith('docs/')) return `/${clean}`;
    if (clean.startsWith('/docs/')) return clean;
    return `/docs/${clean}`;
  })();

  const ext = (() => {
    const fromUrl = url.split('?')[0].split('#')[0];
    const idx = fromUrl.lastIndexOf('.')
    return idx > -1 ? fromUrl.slice(idx + 1).toLowerCase() : '';
  })();

  const Icon = (() => {
    switch (ext) {
      case 'pdf':
      case 'txt':
      case 'md':
        return FileText;
      case 'zip':
      case 'rar':
      case '7z':
        return FileArchive;
      case 'csv':
      case 'xls':
      case 'xlsx':
        return FileSpreadsheet;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'webp':
      case 'svg':
        return FileImage;
      case 'mp3':
      case 'wav':
      case 'flac':
        return FileAudio;
      case 'mp4':
      case 'mov':
      case 'webm':
        return FileVideo;
      case 'js':
      case 'ts':
      case 'json':
        return FileCode;
      default:
        return FileDown;
    }
  })();

  return (
    <Link href={href} download className="block w-full">
      <button
        type="button"
        aria-label={`Download ${name}`}
        className="w-full rounded-lg bg-slate-700 text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <div className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer">
          <div className="flex items-center gap-4">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-white/20">
              <Icon className="h-6 w-6" />
            </span>
            <div className="text-left">
              <div className="text-lg md:text-xl font-semibold leading-tight">{name}</div>
              {description && (
                <div className="text-sm opacity-90">{description}</div>
              )}
            </div>
          </div>
          <div className="text-sm opacity-90 whitespace-nowrap">
            {ext ? ext.toUpperCase() : 'FILE'}{typeof sizeMb === 'number' ? ` · ${sizeMb.toFixed(1)} MB` : ''}
          </div>
        </div>
      </button>
    </Link>
  );
}
