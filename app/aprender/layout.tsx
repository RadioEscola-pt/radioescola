import type { ReactNode } from 'react';
import GuideShell from '@/components/study/GuideShell';
import { readStudyItems } from '@/lib/study-items';

/**
 * Reads the guide index once per request and hands it to the chrome, so the
 * header band renders server-side with the right title. `readStudyItems` walks
 * `app/aprender/**\/page.mdx` off disk: `outputFileTracingIncludes` in
 * `next.config.js` has an `/aprender/**` entry, or the header is empty in
 * production only.
 */
export default function AprenderLayout({ children }: { children: ReactNode }) {
  return <GuideShell items={readStudyItems()}>{children}</GuideShell>;
}
