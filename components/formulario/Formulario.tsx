"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Search, Sigma, Lightbulb, X, ListTree } from 'lucide-react';
import { CATEGORIES, CATEGORY_CONFIG, type CategoryId } from '@/lib/config/categories';
import { FORMULARIO } from '@/lib/config/formulario.data';
import { questionHref, sectionVisual, type Formula, type FormulaSection, type FormulaTable } from '@/lib/config/formulario';
import { Math, RichText } from './Math';

type Filter = CategoryId | 'all';

/**
 * Stacking order on this page. The site navbar owns z-50; everything here sits
 * under it so a sticky heading never covers the site nav.
 */
const Z_TOOLBAR = 'z-30';
const Z_SECTION_HEADER = 'z-20';

/** Height of the site navbar (`h-14` in NavBar) — the offset every sticky here starts from. */
const NAV = '3.5rem';
/** Toolbar height is measured at runtime: two rows on a phone, one on a laptop. */
const BELOW_TOOLBAR = `calc(${NAV} + var(--fm-toolbar, 0px))`;

/** Everything the free-text box searches: name, expression, variables, notes. */
function haystack(entry: Formula | FormulaTable): string {
  const base = [entry.nome, entry.key, ...entry.refs];
  if ('latex' in entry) {
    base.push(entry.latex, entry.notas, ...entry.variantes);
    for (const v of entry.variaveis) base.push(v.simbolo, v.significado, v.unidade);
  } else {
    base.push(...entry.colunas, ...entry.notas, ...entry.linhas.flat());
  }
  return base.join(' ').toLowerCase();
}

const allEntries = (s: FormulaSection): Array<Formula | FormulaTable> => [...s.formulas, ...s.tabelas];

function CategoryBadges({ categorias }: { categorias: CategoryId[] }) {
  return (
    <span className="flex shrink-0 items-center gap-1">
      {CATEGORIES.filter((c) => categorias.includes(c)).map((c) => {
        const cfg = CATEGORY_CONFIG[c];
        return (
          <span
            key={c}
            title={`Sai na categoria ${c}`}
            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold leading-none ${cfg.badgeBg} ${cfg.badgeText}`}
          >
            {c}
          </span>
        );
      })}
    </span>
  );
}

function Refs({ refs }: { refs: string[] }) {
  if (refs.length === 0) return null;
  // `min-h-7` keeps these reachable with a thumb; a bare text-xs link is a
  // ~16px target, which on a phone is a miss more often than a hit.
  const chip =
    'inline-flex min-h-7 items-center rounded-md bg-slate-100 px-2 font-mono text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400';
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1">
      <span className="text-xs text-slate-500 dark:text-slate-400">Sai em</span>
      {refs.map((ref) => {
        const href = questionHref(ref);
        const label = ref.replace('#', ' · ');
        return href ? (
          <Link
            key={ref}
            href={href}
            className={`${chip} transition-colors duration-150 hover:bg-amber-100 hover:text-amber-800 motion-reduce:transition-none dark:hover:bg-amber-950/60 dark:hover:text-amber-300`}
          >
            {label}
          </Link>
        ) : (
          <span key={ref} className={chip}>{label}</span>
        );
      })}
    </div>
  );
}

/**
 * A horizontally scrollable well for content that cannot wrap — a long
 * expression, a wide table. The right-edge mask is the only hint a phone user
 * gets that there is more to the right, since touch scrollbars are invisible.
 */
function Scroller({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`overflow-x-auto [-webkit-overflow-scrolling:touch] [mask-image:linear-gradient(to_right,#000_calc(100%-1.5rem),transparent)] [scrollbar-width:thin] ${className}`}
    >
      {children}
    </div>
  );
}

function RowHeader({ nome, categorias }: { nome: string; categorias: CategoryId[] }) {
  return (
    <header className="mb-3 flex items-start justify-between gap-3">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{nome}</h3>
      <CategoryBadges categorias={categorias} />
    </header>
  );
}

/** Shared row chrome: padding, anchor offset, and the offscreen-skip hint. */
const ROW = 'px-4 py-5 [content-visibility:auto] [contain-intrinsic-size:auto_14rem]';
const rowStyle = { scrollMarginTop: `calc(${BELOW_TOOLBAR} + 4rem)` };

function FormulaRow({ formula, visible }: { formula: Formula; visible: boolean }) {
  return (
    <article id={formula.key} hidden={!visible} style={rowStyle} className={ROW}>
      <RowHeader nome={formula.nome} categorias={formula.categorias} />

      {/* The expression is what somebody opened this page to look at, so it gets
          the size and the space; everything else on the row is annotation. */}
      <Scroller className="py-1 text-center">
        <Math tex={formula.latex} display />
      </Scroller>

      {formula.variantes.length > 0 && (
        <Scroller className="mt-1 text-slate-500 dark:text-slate-400">
          <div className="flex min-w-max items-center justify-center gap-x-6">
            {formula.variantes.map((v) => <Math key={v} tex={v} />)}
          </div>
        </Scroller>
      )}

      {formula.variaveis.length > 0 && (
        // A wrapped run rather than a two-column grid: the entries are wildly
        // uneven in length, and a grid leaves one column half-empty on a phone.
        <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
          {formula.variaveis.map((v) => (
            <div key={v.simbolo} className="flex items-baseline gap-1.5">
              <dt className="shrink-0 text-slate-900 dark:text-slate-100">
                <Math tex={v.simbolo} />
              </dt>
              <dd className="text-slate-500 dark:text-slate-400">
                <RichText text={v.significado} />
                {v.unidade && v.unidade !== '—' && (
                  // Through RichText, not raw: a few units carry an inline
                  // `$…$` island ("nH (com $A_L$ em nH/espira²)"). The brackets
                  // are added only when the unit does not already bring its own
                  // gloss, or 24 of them print as "(V (volt))".
                  <span className="ml-1 text-slate-500 dark:text-slate-400">
                    {v.unidade.includes('(')
                      ? <RichText text={v.unidade} />
                      : <>(<RichText text={v.unidade} />)</>}
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {/* The exam trap for this formula. It is the only warm-tinted thing on the
          row, and usually its longest prose, so it gets a defined edge, real
          padding and reading leading rather than the tight run it had — and the
          `**bold**` the notes lean on is pushed a step darker so the emphasis
          inside a four-line note actually reads as emphasis. */}
      {formula.notas && (
        <div className="mt-4 flex gap-3 rounded-lg border border-amber-200/80 bg-amber-50 px-4 py-3 dark:border-amber-900/60 dark:bg-amber-950/40">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-300" aria-hidden="true" />
          <p className="text-pretty text-sm leading-relaxed text-amber-900 [&_strong]:text-amber-950 dark:text-amber-50 dark:[&_strong]:text-amber-200">
            <RichText text={formula.notas} />
          </p>
        </div>
      )}

      <Refs refs={formula.refs} />
    </article>
  );
}

function TableRow({ tabela, visible }: { tabela: FormulaTable; visible: boolean }) {
  return (
    <article id={tabela.key} hidden={!visible} style={rowStyle} className={ROW}>
      <RowHeader nome={tabela.nome} categorias={tabela.categorias} />

      {tabela.linhas.length > 0 && (
        <Scroller>
          <table className="w-full min-w-max text-sm">
            {tabela.colunas.length > 0 && (
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  {tabela.colunas.map((c) => (
                    <th key={c} className="px-2 py-1.5 text-left font-medium text-slate-500 first:pl-0 dark:text-slate-400">
                      <RichText text={c} />
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {tabela.linhas.map((linha, i) => (
                <tr key={i} className="border-b border-slate-100 last:border-0 dark:border-slate-700/50">
                  {linha.map((cell, j) => (
                    <td
                      key={j}
                      className={`px-2 py-1.5 first:pl-0 ${j === 0 ? 'font-medium text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}
                    >
                      <RichText text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Scroller>
      )}

      {tabela.notas.length > 0 && (
        <ul className="mt-3 space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
          {tabela.notas.map((n, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-300 dark:bg-slate-600" aria-hidden="true" />
              <span><RichText text={n} /></span>
            </li>
          ))}
        </ul>
      )}

      <Refs refs={tabela.refs} />
    </article>
  );
}

/**
 * The index wants a label you can scan, not the full heading. Section titles
 * run to 45 characters ("Recetores: frequência imagem, ruído e sensibilidade")
 * and clamp to an ellipsis in a narrow rail; the first clause identifies the
 * section on its own, and the full title is one hover away.
 */
function shortLabel(titulo: string): string {
  const head = titulo.split(/[,:]/)[0]?.trim() ?? titulo;
  return head.length >= 4 ? head : titulo;
}

/** The section index, shared by the desktop rail and the phone disclosure. */
function IndexList({
  sections,
  counts,
  active,
  onPick,
}: {
  sections: FormulaSection[];
  counts: Map<string, number>;
  active: string | null;
  onPick?: () => void;
}) {
  return (
    <ul className="flex flex-col gap-0.5">
      {sections.map((s) => {
        const isActive = s.id === active;
        const { icon: Icon, tint } = sectionVisual(s.id);
        return (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              onClick={onPick}
              aria-current={isActive ? 'true' : undefined}
              title={s.titulo}
              className={`flex min-h-9 items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors duration-150 motion-reduce:transition-none ${
                isActive
                  ? 'bg-amber-50 font-medium text-amber-900 dark:bg-amber-950/50 dark:text-amber-100'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
              }`}
            >
              {/* The glyph keeps its own hue in every state. It is what makes
                  the row findable at a glance; recolouring it on selection
                  would remove the identity exactly when you are looking at it. */}
              <Icon className={`h-4 w-4 shrink-0 ${tint}`} aria-hidden="true" />
              <span className="min-w-0 flex-1 text-pretty">{shortLabel(s.titulo)}</span>
              <span
                className={`shrink-0 tabular-nums text-[11px] ${
                  isActive ? 'text-amber-700 dark:text-amber-300' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {counts.get(s.id) ?? 0}
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export default function Formulario() {
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<string | null>(FORMULARIO[0]?.id ?? null);
  const rootRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef<HTMLDetailsElement>(null);

  // The list is ~210 blocks of typeset maths; rebuilding it on every keystroke
  // makes the input lag behind the typing. Deferring keeps the field live.
  const deferredQuery = useDeferredValue(query);

  /**
   * Which entries pass the filter — a key set rather than a filtered list.
   *
   * Every row is rendered once and stays mounted; filtering only toggles
   * `hidden`. Rebuilding the list instead re-mounts up to 180 rows and makes
   * React re-parse ~1200 blocks of KaTeX markup, which measured at a full
   * second per filter change.
   */
  const visible = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    const keys = new Set<string>();
    for (const s of FORMULARIO) {
      for (const e of allEntries(s)) {
        if ((filter === 'all' || e.categorias.includes(filter)) && (!q || haystack(e).includes(q))) {
          keys.add(e.key);
        }
      }
    }
    return keys;
  }, [filter, deferredQuery]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of FORMULARIO) {
      map.set(s.id, allEntries(s).filter((e) => visible.has(e.key)).length);
    }
    return map;
  }, [visible]);

  const shown = useMemo(() => FORMULARIO.filter((s) => (counts.get(s.id) ?? 0) > 0), [counts]);
  const total = visible.size;
  const grandTotal = useMemo(() => FORMULARIO.reduce((n, s) => n + allEntries(s).length, 0), []);
  const filtering = filter !== 'all' || deferredQuery.trim() !== '';

  /**
   * The toolbar is two rows on a phone and one on a laptop, and every other
   * sticky offset on the page is measured from its underside. Publishing the
   * real height as a custom property beats hard-coding a number that is wrong
   * at one of the two sizes.
   */
  useEffect(() => {
    const el = toolbarRef.current;
    const root = rootRef.current;
    if (!el || !root) return;
    // Published on the ROOT, not on the toolbar: the sticky section headings
    // read this variable and they are siblings of the toolbar, not descendants.
    // Setting it on the toolbar leaves them falling back to 0 and sticking
    // *behind* it, where the reader never sees them.
    const publish = () => root.style.setProperty('--fm-toolbar', `${el.offsetHeight}px`);
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /**
   * Scroll-spy: which section the reader is actually under.
   *
   * The rule is positional — the last section whose top has passed under the
   * toolbar — rather than an IntersectionObserver ratio tally. Sections here
   * run to 3,600px, so several are "intersecting" at once and any ratio-based
   * tie-break reports whichever the observer happened to update last. Reading
   * position directly is both cheaper to reason about and always right.
   *
   * Re-runs when the filter changes, since hiding a section changes the answer.
   */
  useEffect(() => {
    let frame = 0;
    const pick = () => {
      frame = 0;
      const nav = 56; // the site navbar, `h-14`
      const line = nav + (toolbarRef.current?.offsetHeight ?? 0) + 8;
      let current: string | null = null;
      for (const s of FORMULARIO) {
        const el = document.getElementById(s.id);
        if (!el || el.hidden) continue;
        if (el.getBoundingClientRect().top <= line) current = s.id;
        else break; // sections are in document order; the rest are below
      }
      setActive(current ?? shown[0]?.id ?? null);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(pick); };
    pick();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [shown]);

  const clear = () => { setQuery(''); setFilter('all'); };

  return (
    <div ref={rootRef} className="not-prose lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-8">
      {/* Desktop index rail. On a reference this size the reader's constant
          question is "where am I, and what else is there"; a rail answers both
          without costing a scroll. Below lg it collapses into the toolbar. */}
      <nav
        aria-label="Secções do formulário"
        className="hidden lg:sticky lg:block lg:self-start lg:overflow-y-auto lg:overscroll-contain print:!hidden"
        style={{ top: `calc(${NAV} + 1.5rem)`, maxHeight: `calc(100vh - ${NAV} - 3rem)` }}
      >
        {/* Panelled like the section containers it sits beside. Left bare, a
            column of plain links next to bordered content reads as unfinished
            rather than as the page's second column. */}
        <div className="rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800/50">
          <div className="mb-1.5 flex items-baseline justify-between gap-2 px-2 pt-1 text-xs">
            <span className="font-medium text-slate-600 dark:text-slate-300">Secções</span>
            <span className="tabular-nums text-slate-500 dark:text-slate-400">
              {shown.length}/{FORMULARIO.length}
            </span>
          </div>
          <IndexList sections={shown} counts={counts} active={active} />
        </div>
      </nav>

      <div className="min-w-0">
        {/* Controls travel with the reader. With 210 entries below, a filter you
            have to scroll back to the top to reach is a filter nobody uses.
            `print:hidden` because on paper the furniture is only noise. */}
        <div
          ref={toolbarRef}
          className={`sticky ${Z_TOOLBAR} -mx-4 mb-6 border-b border-slate-200 bg-white/90 px-4 py-2.5 backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/90 print:hidden`}
          style={{ top: NAV }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative order-1 w-full sm:w-auto sm:flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-400" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Procurar no formulário"
                placeholder="Procurar fórmula, símbolo ou grandeza…"
                // 16px on phones: anything smaller and iOS Safari zooms the
                // page on focus and never zooms back out.
                className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-base text-slate-900 placeholder-slate-500 transition-colors duration-150 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 motion-reduce:transition-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400 sm:h-10 sm:text-sm"
              />
            </div>

            {/* A segmented control rather than four loose pills: it holds one row
                at 360px, and it reads as a single choice, which it is. */}
            <div
              role="group"
              aria-label="Filtrar por categoria"
              className="order-3 flex shrink-0 rounded-lg bg-slate-100 p-1 dark:bg-slate-800 sm:order-2"
            >
              {(['all', ...CATEGORIES] as Filter[]).map((value) => {
                const isActive = filter === value;
                const cfg = value === 'all' ? null : CATEGORY_CONFIG[value as CategoryId];
                const Icon = cfg?.icon;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilter(value)}
                    aria-pressed={isActive}
                    aria-label={value === 'all' ? 'Todas as categorias' : `Categoria ${value}`}
                    className={`inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md px-3.5 text-sm sm:px-3 font-medium transition-colors duration-150 motion-reduce:transition-none sm:h-8 ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100'
                    }`}
                  >
                    {Icon && cfg && (
                      <Icon className={`hidden h-3.5 w-3.5 sm:inline-block ${isActive ? cfg.badgeText : ''}`} aria-hidden="true" />
                    )}
                    {value === 'all' ? 'Todas' : value}
                  </button>
                );
              })}
            </div>
            {/* The index is a disclosure below lg. Fourteen section links laid
                out flat cost most of a phone screen before the first formula. */}
            <details ref={indexRef} className="order-4 min-w-[6rem] flex-1 basis-0 lg:hidden">
              <summary className="inline-flex min-h-8 max-w-full cursor-pointer list-none items-center gap-1.5 rounded-md text-sm text-slate-600 dark:text-slate-300 [&::-webkit-details-marker]:hidden">
                <ListTree className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">
                  {shown.find((s) => s.id === active)?.titulo ?? 'Secções'}
                </span>
              </summary>
              {/* Anchored to the toolbar, not to the summary: as a flex item the
                  disclosure is only ~150px wide, which is narrower than every
                  section name in the list. The toolbar has no clipping ancestor,
                  so absolute positioning escapes cleanly. */}
              <div className="absolute inset-x-4 top-full z-10 mt-1 max-h-[55vh] overflow-y-auto overscroll-contain rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                <IndexList
                  sections={shown}
                  counts={counts}
                  active={active}
                  onPick={() => indexRef.current?.removeAttribute('open')}
                />
              </div>
            </details>

            <p className="order-5 ml-auto flex shrink-0 items-center text-sm tabular-nums text-slate-500 dark:text-slate-400" aria-live="polite">
              {/* "210 entradas" is decorative until something is filtered; on a
                  phone the words are the difference between one row and two. */}
              <span className={filtering ? '' : 'hidden sm:inline'}>
                {filtering ? `${total} de ${grandTotal}` : `${grandTotal} entradas`}
              </span>
              {filtering && (
                <button
                  type="button"
                  onClick={clear}
                  className="ml-2 inline-flex min-h-8 items-center gap-1 rounded-md px-1.5 text-sm text-amber-700 transition-colors duration-150 hover:bg-amber-50 motion-reduce:transition-none dark:text-amber-300 dark:hover:bg-amber-950/50"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  Limpar
                </button>
              )}
            </p>
          </div>
        </div>

        {shown.length === 0 ? (
          <div className="py-16 text-center">
            <Sigma className="mx-auto mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" aria-hidden="true" />
            <p className="text-slate-700 dark:text-slate-200">Nada no formulário corresponde a esta procura.</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Tenta um símbolo (XL, ROE, dB) ou o nome de uma grandeza.
            </p>
            <button
              type="button"
              onClick={clear}
              className="mt-4 inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-slate-100 px-4 text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-200 motion-reduce:transition-none dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {FORMULARIO.map((s) => {
              const count = counts.get(s.id) ?? 0;
              return (
                <section key={s.id} id={s.id} hidden={count === 0} className="scroll-mt-4">
                  {/* Sticky from lg up only. On a laptop it is a 44px reminder
                      of which section the formula belongs to. On a phone the
                      same title wraps to two lines and, stacked under the navbar
                      and the toolbar, would pin 29% of the screen — and the
                      index button in the toolbar already names the section you
                      are in, so it would be paying that in duplicate. */}
                  <div
                    className={`lg:sticky ${Z_SECTION_HEADER} mb-3 py-1 lg:-mx-4 lg:bg-white/90 lg:px-4 lg:py-2 lg:backdrop-blur-md dark:lg:bg-slate-900/90 print:static print:bg-transparent`}
                    style={{ top: BELOW_TOOLBAR }}
                  >
                    <h2 className="flex items-baseline gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
                      <span className="text-balance">{s.titulo}</span>
                      <span className="shrink-0 text-sm font-normal tabular-nums text-slate-500 dark:text-slate-400">
                        {count}
                      </span>
                    </h2>
                  </div>
                  <p className="mb-4 max-w-[70ch] text-pretty text-sm text-slate-500 dark:text-slate-400">
                    <RichText text={s.intro} />
                  </p>
                  {/* One bordered container per section, hairlines between rows.
                      Two hundred identical cards read as debris; a section that
                      holds its own rows reads as a chapter. */}
                  <div className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-800/50">
                    {s.formulas.map((f) => <FormulaRow key={f.key} formula={f} visible={visible.has(f.key)} />)}
                    {s.tabelas.map((t) => <TableRow key={t.key} tabela={t} visible={visible.has(t.key)} />)}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
