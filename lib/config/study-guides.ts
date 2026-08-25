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
  Activity, Cpu, BatteryCharging, Binary, FileCheck,
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
};

export const DEFAULT_GUIDE_VISUAL = { icon: BookOpen, accent: 'slate' as const };

export function guideVisual(slug: string) {
  return GUIDE_VISUAL[slug] ?? DEFAULT_GUIDE_VISUAL;
}

/** One entry of /api/study-items. */
export type StudyItem = {
  slug: string;
  title: string;
  description?: string;
  categories: string[];
  type?: string;
  readTime?: number;
};
