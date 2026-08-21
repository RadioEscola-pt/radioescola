"use client";

import { useEffect, useState } from 'react';
import type { StudyItem } from '@/lib/config/study-guides';

/**
 * Resolve a study guide slug to its title, description and read time.
 *
 * The browse page mounts a QuestionCard per question (388 of them on cat1), so
 * this deliberately shares ONE request across every caller: the promise is
 * module scoped and started at most once per page load, and later callers await
 * the same result instead of issuing their own fetch.
 */
let itemsPromise: Promise<Map<string, StudyItem>> | null = null;

function loadItems(): Promise<Map<string, StudyItem>> {
  if (!itemsPromise) {
    itemsPromise = fetch('/api/study-items')
      .then((res) => {
        if (!res.ok) throw new Error(`study-items ${res.status}`);
        return res.json();
      })
      .then((items: StudyItem[]) => new Map(items.map((i) => [i.slug, i])))
      .catch((err) => {
        console.error(err);
        // Drop the rejected promise so a later mount can retry rather than
        // caching the failure for the rest of the session.
        itemsPromise = null;
        return new Map<string, StudyItem>();
      });
  }
  return itemsPromise;
}

/**
 * `loading` is derived, not stored: the resolved slug is kept alongside the
 * item, so a mismatch means the answer in hand belongs to a previous slug and
 * this one is still in flight. Setting a loading flag synchronously inside the
 * effect would trigger a cascading render instead.
 */
export function useStudyItem(slug: string | undefined): { item: StudyItem | null; loading: boolean } {
  const [resolved, setResolved] = useState<{ slug: string; item: StudyItem | null } | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    loadItems().then((map) => {
      if (!cancelled) setResolved({ slug, item: map.get(slug) ?? null });
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const matched = resolved && resolved.slug === slug ? resolved : null;
  return { item: matched?.item ?? null, loading: Boolean(slug) && !matched };
}
