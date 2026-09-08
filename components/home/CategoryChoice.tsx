import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { CATEGORIES, CATEGORY_CONFIG, CATEGORY_IMAGES, QUESTION_COUNTS } from "@/lib/config";
import { bandReach } from "@/lib/config/bands";
import { Button } from "@/components/ui/button";

/**
 * The three licences, as the choice the visitor is actually making.
 *
 * Photographs, as before, but the earlier version drowned them: the scrim was
 * at 88% by the middle of the card and solid black at the foot, over a crop
 * pushed off-centre, so 460px of height bought an image nobody could read. Here
 * the top half is the photograph and the scrim only closes over the bottom, and
 * the copy it used to carry — a level word and a sentence of encouragement — is
 * replaced by the one line that separates the three: what the licence reaches,
 * derived from the band plan in `lib/config/bands.ts`, and how big the bank is.
 *
 * The scrim itself lives in `globals.css`, because hovering animates a gradient
 * stop and a chroma and those need `@property` to be interpolable at all. Only
 * the hue comes from here, per category: a rule along the top edge read as a
 * stripe laid on the photo, where a tinted scrim colours the card itself.
 */
export default async function CategoryChoice() {
  const t = await getTranslations("Home");

  return (
    <div className="mt-8 grid gap-4 md:mt-10 lg:grid-cols-3">
      {CATEGORIES.map((id) => {
        const s = CATEGORY_CONFIG[id];
        const { bandCount, maxPower } = bandReach(id);
        const name = t("categoryName", { id });

        return (
          <article
            key={id}
            className="category-card relative isolate flex min-h-95 flex-col justify-end overflow-hidden rounded-xl bg-slate-950 lg:min-h-110"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- self-hosted standalone build deliberately avoids the /_next/image optimizer */}
            <img
              src={CATEGORY_IMAGES[id]}
              alt=""
              decoding="async"
              fetchPriority={id === "3" ? "high" : undefined}
              className="category-photo absolute inset-0 -z-20 h-full w-full object-cover"
            />
            <div
              className="category-scrim absolute inset-0 -z-10"
              style={{ "--scrim-hue": s.onImageHue } as CSSProperties}
              aria-hidden
            />

            <div className="flex flex-col gap-3 p-5">
              <p className={`text-[11px] font-bold tracking-[0.14em] uppercase ${s.onImageInk}`}>
                {t(`categoryLevel.${s.level}`)}
                {id === "3" && (
                  <>
                    <span aria-hidden> · </span>
                    {t("categoryStartHere")}
                  </>
                )}
              </p>

              <h2 className="text-[clamp(1.75rem,3.2vw,2.5rem)] leading-none font-bold tracking-tight text-white">
                {name}
              </h2>

              <p className="text-[13px] font-semibold tabular-nums text-white/90">
                {t("categoryFacts", { bands: bandCount, power: maxPower, count: QUESTION_COUNTS[id] })}
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Button className={`flex-1 ${s.solidBtn}`} asChild>
                  {/* Stretched so the whole card is the study target; the exam button sits above it. */}
                  <Link href={`/browse/${id}`} className="after:absolute after:inset-0 after:content-['']">
                    {t("categoryBrowse")}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                    <span className="sr-only">{name}</span>
                  </Link>
                </Button>
                <Button variant="secondary" className="relative z-10" asChild>
                  <Link href={`/exam/${id}`}>
                    {t("categorySimulation")}
                    <span className="sr-only">{name}</span>
                  </Link>
                </Button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
