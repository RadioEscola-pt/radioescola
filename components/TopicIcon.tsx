import React from 'react';
import {
  Antenna,
  AudioLines,
  CircuitBoard,
  Gauge,
  Headphones,
  Microchip,
  RadioReceiver,
  RadioTower,
  Scale,
  ShieldAlert,
  Waves,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { isTopicSlug, type TopicSlug } from '@/lib/config';
import { cn } from '@/lib/utils';

type TopicStyle = {
  icon: LucideIcon;
  /** Bare icon, on the page's own background. */
  fg: string;
  /** Filled square, for when the topic is the subject of the row. */
  tile: string;
};

/**
 * One icon and one colour per exam topic, for anywhere a topic is named.
 *
 * The map is a total `Record<TopicSlug, …>` on purpose: a thirteenth topic
 * added to the taxonomy fails to compile until it is given a style here,
 * rather than silently falling back to a generic one everywhere at once.
 *
 * Icons come from the topic's `scope` in `lib/config/topics.ts`, not from the
 * word in its name — `medidas` is instruments, hence a gauge. Colours run the
 * hue wheel so neighbouring topics never share one, and are grouped by family:
 * the equipment chain (componentes → antenas) sits in the blues, the wave
 * subjects in the greens, and the human/legal ones at the ends.
 *
 * The classes are written out in full because Tailwind scans source text; a
 * colour assembled from pieces at runtime would be purged from the build.
 */
const TOPIC_STYLES: Record<TopicSlug, TopicStyle> = {
  teoria: {
    icon: Zap, // eletricidade e eletromagnetismo
    fg: 'text-amber-600 dark:text-amber-400',
    tile: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
  componentes: {
    icon: Microchip, // dispositivos considerados isoladamente
    fg: 'text-violet-600 dark:text-violet-400',
    tile: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  },
  circuitos: {
    icon: CircuitBoard, // os componentes já montados
    fg: 'text-indigo-600 dark:text-indigo-400',
    tile: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  },
  recetores: {
    icon: RadioReceiver,
    fg: 'text-sky-600 dark:text-sky-400',
    tile: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  },
  emissores: {
    icon: RadioTower,
    fg: 'text-blue-600 dark:text-blue-400',
    tile: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
  antenas: {
    icon: Antenna,
    fg: 'text-cyan-600 dark:text-cyan-400',
    tile: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  },
  propagacao: {
    icon: Waves, // a onda a viajar
    fg: 'text-teal-600 dark:text-teal-400',
    tile: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  },
  medidas: {
    icon: Gauge, // instrumentos de medida
    fg: 'text-emerald-600 dark:text-emerald-400',
    tile: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  interferencias: {
    icon: AudioLines, // o sinal sujo
    fg: 'text-rose-600 dark:text-rose-400',
    tile: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  },
  seguranca: {
    icon: ShieldAlert,
    fg: 'text-orange-600 dark:text-orange-400',
    tile: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  },
  operacao: {
    icon: Headphones, // operar a estação
    fg: 'text-fuchsia-600 dark:text-fuchsia-400',
    tile: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-300',
  },
  regulamentacao: {
    icon: Scale, // a lei
    fg: 'text-slate-600 dark:text-slate-300',
    tile: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  },
};

/** Classes for a filled square holding the topic's icon; empty for an unknown slug. */
export function topicTileClass(slug: string): string {
  return isTopicSlug(slug) ? TOPIC_STYLES[slug].tile : '';
}

export interface TopicIconProps {
  slug: string;
  /**
   * Colour the icon by topic. Off inside a tile, which already carries the
   * colour, and off where the surrounding text owns the colour.
   */
  colored?: boolean;
  className?: string;
}

/**
 * Decorative by default: every place that shows this also shows the topic's
 * name, so announcing the icon would just repeat it.
 */
export const TopicIcon: React.FC<TopicIconProps> = ({ slug, colored = false, className }) => {
  if (!isTopicSlug(slug)) return null;
  const { icon: Icon, fg } = TOPIC_STYLES[slug];
  return <Icon className={cn('w-4 h-4', colored && fg, className)} aria-hidden="true" />;
};

export { TOPIC_STYLES };
