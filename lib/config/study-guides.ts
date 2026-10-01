/**
 * Shared vocabulary for Study Library guides.
 *
 * Lives here rather than in the study index page because the answer reveal in
 * QuestionCard renders the same guides: two copies of this map would drift, and
 * a guide would end up wearing different icons on different surfaces.
 */
import {
  BookOpen,
  Zap, CircuitBoard, Filter, RadioReceiver, RadioTower, Antenna, Radar,
  Gauge, ShieldAlert, HardHat, Waves, Palette, SpellCheck, MessagesSquare,
  Tag, Footprints, Landmark, AudioWaveform, MessageSquareCode, BookMarked,
  Activity, Cpu, BatteryCharging, Binary, FileCheck, Sigma, Network, Repeat, AudioLines, TrendingUp, Blend, Radio, SignalHigh, ChartSpline,
  type LucideIcon,
} from 'lucide-react';

/** Tinted tile presets for the guide icons (light + dark). */
export const GUIDE_ACCENTS = {
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  violet: 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
  cyan: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300',
  rose: 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
  slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
} as const;

export type GuideAccent = keyof typeof GUIDE_ACCENTS;

/** Per-guide icon + accent. Unlisted slugs fall back to a neutral book icon. */
export const GUIDE_VISUAL: Record<string, { icon: LucideIcon; accent: GuideAccent }> = {
  'getting-started': { icon: Footprints, accent: 'amber' },
  'teoria-electrica-e-radio': { icon: Zap, accent: 'amber' },
  'componentes': { icon: CircuitBoard, accent: 'blue' },
  'circuitos': { icon: Filter, accent: 'cyan' },
  'recetores': { icon: RadioReceiver, accent: 'violet' },
  'emissores': { icon: RadioTower, accent: 'rose' },
  'antenas': { icon: Antenna, accent: 'emerald' },
  'propagacao': { icon: Radar, accent: 'cyan' },
  'medidas': { icon: Gauge, accent: 'blue' },
  'interferencias': { icon: ShieldAlert, accent: 'rose' },
  'seguranca': { icon: HardHat, accent: 'amber' },
  'campo-electromagnetico': { icon: Waves, accent: 'violet' },
  'codigo-de-cores': { icon: Palette, accent: 'emerald' },
  'alfabeto-fonetico': { icon: SpellCheck, accent: 'blue' },
  'abreviaturas-de-operacao': { icon: MessagesSquare, accent: 'cyan' },
  'prefixos-ic': { icon: Tag, accent: 'violet' },
  'entidades': { icon: Landmark, accent: 'amber' },
  'corrente-alternada': { icon: AudioWaveform, accent: 'rose' },
  'codigo-q': { icon: MessageSquareCode, accent: 'blue' },
  'definicoes': { icon: BookMarked, accent: 'violet' },
  'figuras-de-lissajous': { icon: Waves, accent: 'emerald' },
  'ressonancia-e-fator-q': { icon: Activity, accent: 'rose' },
  'circuitos-rl-rc': { icon: AudioWaveform, accent: 'cyan' },
  'amplificadores-operacionais': { icon: CircuitBoard, accent: 'violet' },
  'transistores': { icon: Cpu, accent: 'blue' },
  'baterias-e-alimentacao': { icon: BatteryCharging, accent: 'emerald' },
  'modos-digitais-e-fec': { icon: Binary, accent: 'cyan' },
  'marcar-exame-anacom': { icon: FileCheck, accent: 'amber' },
  'formulario': { icon: Sigma, accent: 'violet' },
  'leis-de-kirchhoff': { icon: Network, accent: 'amber' },
  'malha-de-captura-de-fase': { icon: Repeat, accent: 'rose' },
  'processamento-digital-de-sinal': { icon: AudioLines, accent: 'cyan' },
  'amplificadores-e-classes': { icon: TrendingUp, accent: 'violet' },
  'distorcao-e-intermodulacao': { icon: Blend, accent: 'rose' },
  'modulacao-am': { icon: Radio, accent: 'amber' },
  'banda-lateral-unica': { icon: SignalHigh, accent: 'emerald' },
  'modulacao-de-frequencia': { icon: ChartSpline, accent: 'blue' },
};

export const DEFAULT_GUIDE_VISUAL = { icon: BookOpen, accent: 'slate' as const };

export function guideVisual(slug: string) {
  return GUIDE_VISUAL[slug] ?? DEFAULT_GUIDE_VISUAL;
}

/**
 * Guides that own their own page layout, so the shared guide chrome (header
 * band, section rail, prev/next) stays off them. `formulario` is a filtered
 * data surface with its own measured sticky offsets, not a prose guide.
 */
export const BARE_GUIDE_SLUGS = new Set(['formulario']);

/** One entry of /api/study-items. */
export type StudyItem = {
  slug: string;
  title: string;
  description?: string;
  categories: string[];
  type?: string;
  readTime?: number;
};

/**
 * Os guias agrupados pelos capítulos do programa de exame, pela ordem do
 * programa e não pelo alfabeto.
 *
 * A fonte é o Anexo 1 da ANACOM (`docs/referencias/`), que numera os capítulos
 * e marca a categoria de cada matéria; os guias técnicos já carregam esse
 * número nos próprios títulos de secção (`## 2.1`, `## 7.6`). O mapa está
 * escrito por extenso, e não deduzido dos títulos, porque metade dos guias não
 * tem secções numeradas e um agrupamento meio deduzido meio declarado seria
 * pior de ler do que estas trinta e sete linhas. `__tests__` garante que cobre
 * todos os guias e não inventa nenhum.
 *
 * Os títulos vivem em `messages/{pt,en}.json`, sob `Study.chapters`: isto é
 * dados, não texto.
 */
export interface StudyChapter {
  id: string;
  /** Número no programa. Nulo nos grupos que não são capítulos do exame. */
  number: string | null;
  slugs: string[];
}

export const STUDY_CHAPTERS: StudyChapter[] = [
  { id: 'comecar', number: null, slugs: ['getting-started', 'marcar-exame-anacom'] },
  {
    id: 'teoria',
    number: '1',
    slugs: [
      'teoria-electrica-e-radio',
      'corrente-alternada',
      'campo-electromagnetico',
      'modulacao-am',
      'banda-lateral-unica',
      'modulacao-de-frequencia',
      'processamento-digital-de-sinal',
    ],
  },
  { id: 'componentes', number: '2', slugs: ['componentes', 'transistores', 'codigo-de-cores'] },
  {
    id: 'circuitos',
    number: '3',
    slugs: [
      'leis-de-kirchhoff',
      'circuitos',
      'circuitos-rl-rc',
      'ressonancia-e-fator-q',
      'amplificadores-e-classes',
      'amplificadores-operacionais',
      'distorcao-e-intermodulacao',
      'malha-de-captura-de-fase',
      'baterias-e-alimentacao',
    ],
  },
  { id: 'recetores', number: '4', slugs: ['recetores'] },
  { id: 'emissores', number: '5', slugs: ['emissores'] },
  { id: 'antenas', number: '6', slugs: ['antenas'] },
  { id: 'propagacao', number: '7', slugs: ['propagacao'] },
  { id: 'medidas', number: '8', slugs: ['medidas', 'figuras-de-lissajous'] },
  { id: 'interferencias', number: '9', slugs: ['interferencias'] },
  { id: 'seguranca', number: '10', slugs: ['seguranca'] },
  {
    id: 'operacao',
    number: 'B',
    slugs: [
      'alfabeto-fonetico',
      'codigo-q',
      'abreviaturas-de-operacao',
      'prefixos-ic',
      'modos-digitais-e-fec',
    ],
  },
  { id: 'regulamentacao', number: 'C', slugs: ['definicoes', 'entidades'] },
  { id: 'referencia', number: null, slugs: ['formulario'] },
];

/** O capítulo de um guia, ou undefined se o mapa não o cobrir. */
export function chapterOf(slug: string): StudyChapter | undefined {
  return STUDY_CHAPTERS.find((c) => c.slugs.includes(slug));
}
