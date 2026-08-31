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

/**
 * One icon per exam topic, for anywhere a topic is named.
 *
 * The map is a total `Record<TopicSlug, …>` on purpose: a thirteenth topic
 * added to the taxonomy fails to compile until it is given an icon here,
 * rather than silently falling back to a generic one everywhere at once.
 *
 * Each choice comes from the topic's own scope in `lib/config/topics.ts`, not
 * from the word in its name — `medidas` is instruments, hence a gauge.
 */
const TOPIC_ICONS: Record<TopicSlug, LucideIcon> = {
  teoria: Zap,               // eletricidade e eletromagnetismo
  componentes: Microchip,    // dispositivos considerados isoladamente
  circuitos: CircuitBoard,   // os componentes já montados
  recetores: RadioReceiver,
  emissores: RadioTower,
  antenas: Antenna,
  propagacao: Waves,         // a onda a viajar
  medidas: Gauge,            // instrumentos de medida
  interferencias: AudioLines, // o sinal sujo
  seguranca: ShieldAlert,
  operacao: Headphones,      // operar a estação
  regulamentacao: Scale,     // a lei
};

export interface TopicIconProps {
  slug: string;
  className?: string;
}

/**
 * Decorative by default: every place that shows this also shows the topic's
 * name, so announcing the icon would just repeat it.
 */
export const TopicIcon: React.FC<TopicIconProps> = ({ slug, className }) => {
  if (!isTopicSlug(slug)) return null;
  const Icon = TOPIC_ICONS[slug];
  return <Icon className={cn('w-4 h-4', className)} aria-hidden="true" />;
};

export { TOPIC_ICONS };
