/**
 * The formulary: every expression a candidate has to know by heart to answer a
 * calculation question in the ANACOM exams, in one place.
 *
 * Data, not prose, because the page filters it three ways (category, section,
 * free text) and a hand-written MDX wall cannot be filtered. It was derived
 * from `content/questions/**` — every entry carries the bank refs that require
 * it, which is what stops the list drifting into a generic radio cheat-sheet.
 *
 * `refs` are bank refs in `cat{n}#{id}` form; `questionHref` turns one into the
 * browse deep link. Keep them accurate: they are the only evidence that an
 * entry earns its place.
 */
import type { CategoryId } from './categories';

export type FormulaVariable = {
  /** LaTeX for the symbol, without delimiters. */
  simbolo: string;
  significado: string;
  /** Unit as plain text ("Ω", "Hz", "—" when dimensionless). */
  unidade: string;
};

export type Formula = {
  /** Unique across the whole formulary — it is the anchor id. */
  key: string;
  nome: string;
  /** KaTeX display form, no `$$` delimiters. */
  latex: string;
  /** Rearrangements the exam actually asks for. */
  variantes: string[];
  variaveis: FormulaVariable[];
  categorias: CategoryId[];
  /** Bank refs that require this formula, `cat2#134`. */
  refs: string[];
  /** The exam trap: a prefix to convert, a factor of 10 vs 20, a term that drops out. */
  notas: string;
};

export type FormulaTable = {
  key: string;
  nome: string;
  /**
   * Header cells. Empty when the entry is a set of rules rather than a grid —
   * structured rather than markdown so the page needs no markdown renderer,
   * and so a cell can carry inline `$…$` without a parser guessing at it.
   */
  colunas: string[];
  /** Rows of cells, each aligned to `colunas`. Cells may contain inline `$…$`. */
  linhas: string[][];
  /** Rules of thumb, shown as a list under the grid (or instead of one). */
  notas: string[];
  categorias: CategoryId[];
  refs: string[];
};

export type FormulaSection = {
  id: string;
  titulo: string;
  intro: string;
  formulas: Formula[];
  tabelas: FormulaTable[];
};

/** `cat2#134` → `{ cat: '2', id: 134 }`, or null when it does not parse. */
export function parseRef(ref: string): { cat: CategoryId; id: number } | null {
  const m = /^cat([321])#(\d+)$/.exec(ref.trim());
  if (!m || !m[1] || !m[2]) return null;
  return { cat: m[1] as CategoryId, id: Number(m[2]) };
}

/** The browse deep link for a bank ref; `#q-{id}` is scrolled to on arrival. */
export function questionHref(ref: string): string | null {
  const parsed = parseRef(ref);
  return parsed ? `/browse/${parsed.cat}#q-${parsed.id}` : null;
}

/**
 * Per-section icon and tint for the index.
 *
 * Fourteen rows of identical grey text can only be read linearly; a glyph and a
 * hue let the eye jump to the right one. The palette is deliberately the same
 * six accents the Study Library already uses on its guide tiles
 * (`GUIDE_ACCENTS` in `./study-guides`) rather than a new set — this rail sits
 * two clicks from that index and should look like the same product.
 *
 * Text-only classes, not the tile classes: at 16px a filled tile per row is a
 * wall of colour, where a glyph is an accent.
 */
import {
  Activity, Antenna, AudioWaveform, Binary, Cable, CircuitBoard, Cpu, Gauge,
  Magnet, Radar, RadioReceiver, RadioTower, Signal, Zap, type LucideIcon,
} from 'lucide-react';

export const SECTION_TINTS = {
  amber: 'text-amber-600 dark:text-amber-400',
  blue: 'text-blue-600 dark:text-blue-400',
  emerald: 'text-emerald-600 dark:text-emerald-400',
  violet: 'text-violet-600 dark:text-violet-400',
  cyan: 'text-cyan-600 dark:text-cyan-400',
  rose: 'text-rose-600 dark:text-rose-400',
} as const;

export type SectionTint = keyof typeof SECTION_TINTS;

/** Unlisted sections fall back to a neutral glyph rather than breaking the row. */
export const SECTION_VISUAL: Record<string, { icon: LucideIcon; tint: SectionTint }> = {
  'bases-electricas': { icon: Zap, tint: 'amber' },
  'associacao-componentes': { icon: CircuitBoard, tint: 'blue' },
  'corrente-alternada': { icon: AudioWaveform, tint: 'cyan' },
  'transformadores-magnetismo': { icon: Magnet, tint: 'violet' },
  'reactancia-ressonancia': { icon: Activity, tint: 'rose' },
  'semicondutores-amplificadores': { icon: Cpu, tint: 'emerald' },
  'decibel': { icon: Signal, tint: 'amber' },
  'emissores-modulacao': { icon: RadioTower, tint: 'rose' },
  'recetores': { icon: RadioReceiver, tint: 'violet' },
  'digital': { icon: Binary, tint: 'cyan' },
  'linhas-transmissao': { icon: Cable, tint: 'blue' },
  'antenas': { icon: Antenna, tint: 'emerald' },
  'propagacao': { icon: Radar, tint: 'cyan' },
  'medidas-seguranca': { icon: Gauge, tint: 'blue' },
};

export function sectionVisual(id: string): { icon: LucideIcon; tint: string } {
  const found = SECTION_VISUAL[id];
  return found
    ? { icon: found.icon, tint: SECTION_TINTS[found.tint] }
    : { icon: Activity, tint: 'text-slate-500 dark:text-slate-400' };
}
