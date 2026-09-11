/**
 * Projects the compiled content into the bundle the Flutter app ships.
 *
 * The app reads the same questions as the site but cannot reach the network for
 * them, so three things the browser resolves at request time are resolved here
 * instead:
 *
 * - **Explanations are inlined.** The site serves them from
 *   `content/notes/cat{n}/{id}.mdx` through `/api/notes`, compiled per request.
 *   The app has no such route, so each note is compiled to HTML at build time
 *   and written into the question as `explanationHtml`.
 * - **Images are bundled.** Every `public/` path a question or its note points
 *   at is copied into `assets/images/cat{n}/` and the reference rewritten.
 * - **Links become absolute.** A relative `exams/...` href resolves against the
 *   site in a browser and against nothing in a WebView, so it is expanded.
 *
 * The field names are the app's, not the site's: `materia` is `topic` there,
 * and an unavailable source omits its `url` rather than carrying `unavailable`.
 * Keep this in step with `lib/models/question.dart` in the app repo — it is the
 * other half of this contract, and nothing fails loudly when they disagree.
 *
 * Derived from `appJson` rather than from the source tree on purpose: the app's
 * question set is then the site's by construction, including `disabled`, so the
 * two cannot drift apart in what they ship.
 */
import { basename } from "path";

import { renderNoteToHtml } from "./render-note";

/** Where a relative link in a note points once it leaves the browser. */
export const MOBILE_ORIGIN = "https://radioescola.pt";

/** One image to copy: both paths, source relative to `public/`. */
export type MobileImage = {
  /** e.g. `images/cat2/ohm_law.png`, or `capitulos/AC/images.png`. */
  from: string;
  /** e.g. `assets/images/cat2/ohm_law.png`. */
  to: string;
};

/** A note that would not compile, and so has no HTML to inline. */
export type NoteFailure = { id: number; reason: string };

export type MobileArtifacts = {
  /** Contents of `assets/content/cat{n}.json`. */
  json: string;
  /** Every image the category references, deduped. */
  images: MobileImage[];
  /**
   * Notes that failed to compile, in question order.
   *
   * Reported rather than swallowed. `Question.explanationHtml` defaults to the
   * empty string, so inlining nothing produces a question that looks fine and
   * has quietly lost its explanation — indistinguishable, in the app, from one
   * that never had a note. These are the same failures `/api/notes` hits at
   * request time, so anything listed here is already broken on the site.
   */
  noteFailures: NoteFailure[];
};

/** Strips the leading slash, so `/images/x.png` and `images/x.png` agree. */
function publicRelative(src: string): string {
  return src.replace(/^\/+/, "");
}

/**
 * Where an image lands in the bundle.
 *
 * Flattened to a basename inside the category's directory because `pubspec.yaml`
 * declares `assets/images/cat{n}/` and Flutter does not include subdirectories
 * of a declared asset directory. Notes reference a few images from outside
 * `images/`, and those land alongside the rest.
 */
export function bundleImagePath(src: string, categoryId: string): string {
  return `assets/images/cat${categoryId}/${basename(publicRelative(src))}`;
}

/**
 * Collects images while rewriting, refusing to let two different files claim
 * one bundle path.
 *
 * Flattening to a basename makes that collision possible, and it would
 * otherwise resolve as whichever file was copied last — a wrong figure on a
 * question, silently, in a build that reported success.
 */
export class ImageCollector {
  private readonly byBundlePath = new Map<string, string>();

  constructor(private readonly categoryId: string) {}

  add(src: string): string {
    const from = publicRelative(src);
    const to = bundleImagePath(from, this.categoryId);
    const existing = this.byBundlePath.get(to);
    if (existing !== undefined && existing !== from) {
      throw new Error(
        `cat${this.categoryId}: "${from}" and "${existing}" both bundle to "${to}" — rename one`
      );
    }
    this.byBundlePath.set(to, from);
    return to;
  }

  get images(): MobileImage[] {
    return [...this.byBundlePath].map(([to, from]) => ({ from, to }));
  }
}

/** True for anything already absolute — those are left exactly as they are. */
function isExternal(url: string): boolean {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(url);
}

/**
 * Rewrites one compiled note so every path in it works offline.
 *
 * Attribute-level rather than a full parse: the note bodies are hand-written
 * HTML fragments and markdown, and the only references that matter are `src`
 * and `href`.
 */
export function rewriteNoteHtml(
  html: string,
  categoryId: string,
  images: ImageCollector,
  origin: string
): string {
  const withImages = html.replace(
    /(<img\b[^>]*?\bsrc=)(["'])(.*?)\2/gi,
    (match, prefix: string, quote: string, src: string) =>
      isExternal(src) || src.startsWith("data:")
        ? match
        : `${prefix}${quote}${images.add(src)}${quote}`
  );

  return withImages.replace(
    /(<a\b[^>]*?\bhref=)(["'])(.*?)\2/gi,
    (match, prefix: string, quote: string, href: string) =>
      isExternal(href) || href.startsWith("#")
        ? match
        : `${prefix}${quote}${origin}/${publicRelative(href)}${quote}`
  );
}

/** The site's app question, as `toAppQuestion` writes it. */
type AppQuestion = {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  hasNotesMdx?: boolean;
  sources?: { pdf: string; question: number; page?: number; unavailable?: boolean }[];
  img?: string;
  tutorial?: string;
  materia?: string;
  calc?: string;
};

/**
 * Compiles a category's shipped artifacts into the app's bundle.
 *
 * `notes` is `CategoryArtifacts.notes` — the MDX bodies keyed by question id,
 * already filtered to live questions.
 */
export async function emitMobileCategory(
  appJson: string,
  notes: Map<number, string>,
  origin: string = MOBILE_ORIGIN
): Promise<MobileArtifacts> {
  const parsed = JSON.parse(appJson) as {
    category: string;
    anacomFile: number;
    questions: AppQuestion[];
  };
  const images = new ImageCollector(parsed.category);
  const noteFailures: NoteFailure[] = [];

  const questions = [];
  for (const q of parsed.questions) {
    const out: Record<string, unknown> = {
      id: q.id,
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
    };

    const note = notes.get(q.id);
    if (note !== undefined) {
      try {
        out.explanationHtml = rewriteNoteHtml(
          await renderNoteToHtml(note),
          parsed.category,
          images,
          origin
        ).trim();
      } catch (e) {
        noteFailures.push({
          id: q.id,
          reason: ((e as Error).message.split("\n")[0] ?? "").trim(),
        });
      }
    }

    if (q.img !== undefined) out.img = images.add(q.img);
    // The site's name for it is `materia`; the app's model calls it `topic`.
    if (q.materia !== undefined) out.topic = q.materia;
    if (q.tutorial !== undefined) out.tutorial = q.tutorial;

    if (q.sources !== undefined && q.sources.length > 0) {
      out.sources = q.sources.map((s) => {
        const ref: Record<string, unknown> = { pdf: s.pdf, question: s.question };
        if (s.page !== undefined) ref.page = s.page;
        // The app reads a missing `url` as "cite it, don't link it", which is
        // the same judgement `unavailable` encodes for the site.
        if (s.unavailable !== true) ref.url = `${origin}/exams/${s.pdf}.pdf`;
        return ref;
      });
    }

    questions.push(out);
  }

  const bundle = {
    category: parsed.category,
    anacomFile: parsed.anacomFile,
    questions,
  };

  return {
    json: `${JSON.stringify(bundle, null, 2)}\n`,
    images: images.images,
    noteFailures,
  };
}

/**
 * The exam rules, as the app reads them.
 *
 * Emitted rather than hand-kept so the simulation cannot disagree with the
 * site's about what a pass is.
 */
export function emitMobileExamConfig(config: Record<string, number>): string {
  return `${JSON.stringify(config, null, 2)}\n`;
}
