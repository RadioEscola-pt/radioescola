/**
 * Exam topic taxonomy
 *
 * One consolidated list derived from the three CEPT syllabi Portugal's
 * categories map onto:
 *
 * - cat 3 — ECC Report 89, "A Radio Amateur Entry Level Examination and
 *   Licence" (docdb.cept.org/download/409)
 * - cat 2 — ERC Report 32, "Amateur Radio Novice Examination Syllabus"
 *   (docdb.cept.org/download/2065)
 * - cat 1 — Recommendation T/R 61-02, HAREC (docdb.cept.org/download/4424)
 *
 * ANACOM publishes the Portuguese national syllabus as Anexo 1 to the
 * "Procedimentos" — "Matérias dos exames de aptidão para as categorias de
 * amador 1, 2 e 3" (anacom.pt, contentId 954743). Its structure is the CEPT one
 * exactly: PARTE A chapters 1-10, PARTE B operating, PARTE C regulation. The
 * `pt` labels below are ANACOM's own chapter titles, modernised to the 1990
 * orthography the rest of this project uses (the annex predates it and still
 * writes "electricidade", "receptores"). `anacomRef` points back at them.
 *
 * The novice and HAREC syllabi already share chapter numbering 1-10 plus the
 * two regulatory sections b) and c), so `ceptRef` below is theirs verbatim.
 * ECC Report 89 uses its own headings but maps on without residue: Basics -> 1,
 * Transmitters -> 5, Receivers -> 4, Feeders and Antennas -> 6, Propagation ->
 * 7, Electromagnetic Compatibility -> 9, Safety Considerations -> 10, Licence
 * Conditions -> c, and its "Practical Operating Aspects" section is almost
 * entirely b.
 *
 * `boundary` is the part that matters. Classifying a question is only hard on
 * four seams, and every one of them needs a rule rather than a judgement, or
 * two passes over the same bank will disagree with each other.
 */
import type { CategoryId } from './categories';

export type TopicSlug =
  | 'teoria' | 'componentes' | 'circuitos' | 'recetores' | 'emissores'
  | 'antenas' | 'propagacao' | 'medidas' | 'interferencias' | 'seguranca'
  | 'operacao' | 'regulamentacao';

export type Topic = {
  slug: TopicSlug;
  /** Chapter as printed in ERC Report 32 and T/R 61-02. */
  ceptRef: string;
  /** Chapter as printed in ANACOM's Anexo 1. */
  anacomRef: string;
  /**
   * Lowest category at which Anexo 1 marks this chapter examinable.
   *
   * ADVISORY, NOT A CONSTRAINT. The annex is from 2009 and exam practice has
   * moved past it: six questions in our own cat 3 bank sit in chapters marked
   * "from category 2" yet are sourced to real 2023 category 3 papers — 69
   * (p.a.r.), 72, 77, 106 (directividade), 113 (reflexão ionosférica) and 130.
   * Treat a mismatch as worth a second look, never as an error.
   */
  examinedFrom: CategoryId;
  /** Full chapter title, as printed in Anexo 1. Reference-page length. */
  pt: string;
  en: string;
  /**
   * Card-sized label. The full titles do not fit on a question card —
   * "Regulamentação nacional e internacional relevante para os serviços de
   * amador e amador por satélite" is a heading, not a chip. Truncating with CSS
   * would produce "Regulamentação nacional e intern…", so the short form is
   * authored rather than derived.
   */
  shortPt: string;
  shortEn: string;
  /** What belongs here. */
  scope: string;
  /** Tie-break against the neighbouring topic it is most often confused with. */
  boundary?: string;
};

export const TOPICS: readonly Topic[] = [
  {
    slug: 'teoria', ceptRef: '1',
    anacomRef: 'PARTE A / 1', examinedFrom: '3',
    pt: 'Teoria da eletricidade, do eletromagnetismo e das radiocomunicações',
    en: 'Electrical, electromagnetic and radio theory',
    shortPt: 'Teoria', shortEn: 'Theory',
    scope: 'Condutividade, fontes de eletricidade, campos elétrico e magnético, sinais sinusoidais e não sinusoidais, ruído, sinais modulados, potência e energia, processamento digital de sinais.',
    boundary: 'Uma grandeza ou um princípio físico pertence aqui; um objeto que se compra pertence a componentes. A aritmética de decibéis é aqui — o Anexo 1 põe em 1.9 c) a \'relação de potência entre entrada/saída em dB de amplificadores e/ou atenuadores\' — mas só quando a razão é o assunto. Se os dB apenas especificam um parâmetro (largura de banda a -3 dB, ganho de antena, relação frente/costas), a pergunta pertence ao capítulo da coisa descrita.',
  },
  {
    slug: 'componentes', ceptRef: '2',
    anacomRef: 'PARTE A / 2', examinedFrom: '3',
    pt: 'Componentes',
    en: 'Components',
    shortPt: 'Componentes', shortEn: 'Components',
    scope: 'Resistências, condensadores, bobinas, transformadores, díodos, transístores, válvulas e outros dispositivos considerados isoladamente.',
    boundary: 'Um componente sozinho, e as suas características, pertence aqui. Vários componentes combinados para desempenhar uma função pertencem a circuitos.',
  },
  {
    slug: 'circuitos', ceptRef: '3',
    anacomRef: 'PARTE A / 3', examinedFrom: '2',
    pt: 'Circuitos',
    en: 'Circuits',
    shortPt: 'Circuitos', shortEn: 'Circuits',
    scope: 'Combinações de componentes, filtros, fontes de alimentação, amplificadores, detetores, osciladores, PLL, sistemas de tempo discreto (DSP).',
    boundary: 'Se o enunciado descreve uma montagem com uma função (oscilar, filtrar, amplificar, regular), é circuitos, mesmo que nomeie os componentes que a compõem.',
  },
  {
    slug: 'recetores', ceptRef: '4',
    anacomRef: 'PARTE A / 4', examinedFrom: '2',
    pt: 'Recetores',
    en: 'Receivers',
    shortPt: 'Recetores', shortEn: 'Receivers',
    scope: 'Tipos de recetor, diagramas de blocos, funcionamento dos andares, características do recetor (sensibilidade, seletividade, bloqueio, intermodulação).',
    boundary: 'Um andar identificado como parte de um recetor pertence aqui, não a circuitos.',
  },
  {
    slug: 'emissores', ceptRef: '5',
    anacomRef: 'PARTE A / 5', examinedFrom: '2',
    pt: 'Emissores',
    en: 'Transmitters',
    shortPt: 'Emissores', shortEn: 'Transmitters',
    scope: 'Tipos de emissor, diagramas de blocos, funcionamento dos andares, características do emissor, modulação e classes de funcionamento do andar final.',
    boundary: 'Um andar identificado como parte de um emissor pertence aqui, não a circuitos. As designações de classe de emissão (A3E, J3E, F3E) pertencem aqui e não a regulamentação: identificam a modulação, e o seu significado não muda quando a lei muda.',
  },
  {
    slug: 'antenas', ceptRef: '6',
    anacomRef: 'PARTE A / 6', examinedFrom: '2',
    pt: 'Antenas e linhas de transmissão',
    en: 'Antennas and transmission lines',
    shortPt: 'Antenas', shortEn: 'Antennas',
    scope: 'Tipos e características de antenas, ganho, diretividade, polarização, linhas de transmissão, ROE, adaptação de impedâncias, p.a.r. e p.i.r.e.',
    boundary: 'Potência radiada, ROE e a adaptação de uma antena à linha ou ao emissor pertencem aqui, não a emissores, porque medem o que sai da antena e não o que o emissor produz. Mas adaptação de impedâncias entre dois circuitos, sem antena no enunciado, é circuitos.',
  },
  {
    slug: 'propagacao', ceptRef: '7',
    anacomRef: 'PARTE A / 7', examinedFrom: '2',
    pt: 'Propagação',
    en: 'Propagation',
    shortPt: 'Propagação', shortEn: 'Propagation',
    scope: 'Espectro de frequências, camadas ionosféricas, onda terrestre e ionosférica, MUF, desvanecimento, alcance, horizonte rádio, modos de propagação particulares.',
  },
  {
    slug: 'medidas', ceptRef: '8',
    anacomRef: 'PARTE A / 8', examinedFrom: '2',
    pt: 'Medições',
    en: 'Measurements',
    shortPt: 'Medições', shortEn: 'Measurements',
    scope: 'Realização de medições e instrumentos: multímetro, osciloscópio, wattímetro, medidor de ROE, analisador de espectro, frequencímetro, medidor S.',
    boundary: 'Se a pergunta é sobre o instrumento ou sobre como medir, é medidas, mesmo que a grandeza medida pertença a outro capítulo.',
  },
  {
    slug: 'interferencias', ceptRef: '9',
    anacomRef: 'PARTE A / 9', examinedFrom: '3',
    pt: 'Interferência e imunidade',
    en: 'Interference and immunity',
    shortPt: 'Interferências', shortEn: 'Interference',
    scope: 'Interferência em equipamentos eletrónicos, causas, harmónicas e espúrias, blindagem, filtragem, ligação à terra, imunidade, compatibilidade eletromagnética.',
    boundary: 'A blindagem pertence aqui quando serve para evitar interferência; a teoria do campo que a blindagem trava pertence a teoria.',
  },
  {
    slug: 'seguranca', ceptRef: '10',
    anacomRef: 'PARTE A / 10', examinedFrom: '3',
    pt: 'Segurança',
    en: 'Safety',
    shortPt: 'Segurança', shortEn: 'Safety',
    scope: 'O corpo humano, tensões e correntes perigosas, rede elétrica, ligação à terra de proteção, descargas atmosféricas, exposição a campos eletromagnéticos, segurança em torres e mastros.',
    boundary: 'Exposição a campos eletromagnéticos pertence aqui, não a teoria, porque a pergunta é sobre o risco para pessoas.',
  },
  {
    slug: 'operacao', ceptRef: 'b',
    anacomRef: 'PARTE B', examinedFrom: '3',
    pt: 'Regulamentos e procedimentos nacionais e internacionais de operação',
    en: 'Operating rules and procedures',
    shortPt: 'Operação', shortEn: 'Operating',
    scope: 'Alfabeto fonético, código Q, abreviaturas de operação, indicativos de chamada, planos de faixas da IARU, procedimentos de contacto, tráfego de emergência, diário de estação.',
    boundary: 'Uma prática acordada entre amadores é operação; uma obrigação imposta por lei é regulamentação. Os planos de faixas da IARU são operação, mesmo quando a pergunta parece regulamentar. Nos indicativos de chamada a divisão é: como se forma e se transmite um indicativo no ar é operação; quem tem direito a qual série, e por quanto tempo, é regulamentação.',
  },
  {
    slug: 'regulamentacao', ceptRef: 'c',
    anacomRef: 'PARTE C', examinedFrom: '3',
    pt: 'Regulamentação nacional e internacional relevante para os serviços de amador e amador por satélite',
    en: 'National and international regulations',
    shortPt: 'Regulamentação', shortEn: 'Regulations',
    scope: 'Regulamento das Radiocomunicações da UIT, regulamentação CEPT, legislação nacional, categorias e CAN, licenciamento de estações, atribuição de faixas e estatutos, potências máximas, entidades (ANACOM, UIT, CEPT, IARU).',
    boundary: 'Se a resposta muda quando a lei muda, é regulamentação.',
  },
];

export const TOPIC_BY_SLUG: Record<TopicSlug, Topic> = Object.fromEntries(
  TOPICS.map((t) => [t.slug, t])
) as Record<TopicSlug, Topic>;

export const TOPIC_SLUGS: readonly TopicSlug[] = TOPICS.map((t) => t.slug);

export function isTopicSlug(value: unknown): value is TopicSlug {
  return typeof value === 'string' && TOPIC_SLUGS.includes(value as TopicSlug);
}

/**
 * Chapters Anexo 1 marks as starting above category 3.
 *
 * Derived from the annex rather than guessed, but see `examinedFrom`: the annex
 * is 2009 and real category 3 papers have since examined antennas, receivers,
 * transmitters and propagation. A category 3 question landing here is a prompt
 * to check the classification, not evidence that it is wrong.
 */
export const ABOVE_ENTRY_LEVEL: readonly TopicSlug[] = TOPICS
  .filter((t) => t.examinedFrom !== '3')
  .map((t) => t.slug);

/** Card-sized label for a topic slug in the reader's locale. */
export function topicShortLabel(slug: string, locale: string): string | null {
  if (!isTopicSlug(slug)) return null;
  const topic = TOPIC_BY_SLUG[slug];
  return locale.startsWith('pt') ? topic.shortPt : topic.shortEn;
}
