/**
 * The preview card's contract.
 *
 * The one behaviour worth pinning down is the reveal: this card exists on a
 * study surface, and the reason it shows the options but withholds which one is
 * right is that pointing at a citation must not hand the answer to someone who
 * is testing themselves. A refactor that renders the correct option eagerly
 * would look fine and quietly undo the whole point, so it is asserted here.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuestionPreviewCard } from '@/components/question-preview/QuestionPreviewCard';
import { parseQuestionRef, lookupQuestion } from '@/lib/question-lookup';
import type { Question } from '@/lib/types';

const question: Question = {
  id: 92,
  question: 'Qual a resistência total de duas resistências de 12,5 Ohm cada, quando ligadas em série?',
  options: ['12,5 Ohm', '25 Ohm', '50 Ohm', '37,5 Ohm'],
  correctIndex: 1,
  img: null,
  notes: null,
  hasNotesMdx: false,
  sources: null,
  tutorial: null,
  materia: null,
  calc: null,
};

/** The option row carries the correct styling only once revealed. */
const correctRow = () => screen.getByText('25 Ohm').closest('li');

describe('Unit: QuestionPreviewCard', () => {
  it('shows the stem and every option', () => {
    render(<QuestionPreviewCard refId="cat2#92" state={{ status: 'ready', question }} />);
    expect(screen.getByText(question.question)).toBeTruthy();
    for (const option of question.options) expect(screen.getByText(option)).toBeTruthy();
  });

  it('does not give the answer away before it is asked for', () => {
    render(<QuestionPreviewCard refId="cat2#92" state={{ status: 'ready', question }} />);
    expect(correctRow()?.className).not.toContain('bg-green-200');
    expect(screen.queryByText('(resposta correta)')).toBeNull();
    expect(screen.getByRole('button', { name: /ver resposta/i })).toBeTruthy();
  });

  it('marks the correct option once asked', () => {
    render(<QuestionPreviewCard refId="cat2#92" state={{ status: 'ready', question }} />);
    fireEvent.click(screen.getByRole('button', { name: /ver resposta/i }));
    expect(correctRow()?.className).toContain('bg-green-200');
    expect(screen.getByText('(resposta correta)')).toBeTruthy();
    // The button is spent; the card now offers the way through to the bank.
    expect(screen.queryByRole('button', { name: /ver resposta/i })).toBeNull();
    expect(screen.getByRole('link', { name: /abrir no banco/i })).toBeTruthy();
  });

  it('says so when the reference names a question the bank no longer ships', () => {
    render(<QuestionPreviewCard refId="cat2#92" state={{ status: 'missing' }} />);
    expect(screen.getByText(/já não faz parte do banco/i)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /ver resposta/i })).toBeNull();
  });
});

describe('Unit: parseQuestionRef', () => {
  it('reads a well-formed reference', () => {
    expect(parseQuestionRef('cat2#92')).toEqual({ cat: '2', id: 92 });
    expect(parseQuestionRef('  cat1#7  ')).toEqual({ cat: '1', id: 7 });
  });

  it('rejects anything else rather than guessing', () => {
    for (const bad of ['cat4#1', 'cat2-92', 'cat2#', '', 'nonsense']) {
      expect(parseQuestionRef(bad), bad).toBeNull();
    }
  });
});

describe('Unit: lookupQuestion', () => {
  const payload = { questions: [{ id: 92, question: 'Q', options: ['a', 'b'], correctIndex: 1 }] };

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => payload }) as unknown as Response));
  });
  afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });

  it('fetches a category once however many references point into it', async () => {
    // Six chips on one row must not mean six requests — and must never drag
    // the other two categories down with them.
    const { lookupQuestion: fresh } = await import('@/lib/question-lookup?cache-bust=1');
    await Promise.all([fresh('cat2#92'), fresh('cat2#92'), fresh('cat2#93')]);
    expect((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.length).toBe(1);
    expect((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]).toBe('/data/cat2.json');
  });

  it('resolves null for a reference the category does not contain', async () => {
    const { lookupQuestion: fresh } = await import('@/lib/question-lookup?cache-bust=2');
    expect(await fresh('cat2#999')).toBeNull();
  });

  it('resolves null for a malformed reference without fetching', async () => {
    expect(await lookupQuestion('cat9#1')).toBeNull();
  });
});
