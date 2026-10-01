"use client";

import { useEffect, useState } from 'react';
import type { CategoryId } from '@/lib/config/categories';
import { CATEGORIES } from '@/lib/config/categories';

const KEY = 'hamradio_reader_category';
const EVENT = 'hamradio:reader-category';

/**
 * A categoria para que o leitor está a estudar.
 *
 * Vive à parte do progresso porque não é progresso: é uma preferência de
 * navegação, escrita quando a pessoa escolhe uma categoria no índice e lida
 * depois dentro dos guias, para marcar as secções que o exame dela não pede.
 *
 * `null` é um estado legítimo e o inicial: quem nunca escolheu não é presumido.
 * Sem escolha não se marca nada, porque marcar exigiria adivinhar o nível de
 * quem está a ler, e enganar-se aí é dizer a alguém que não precisa de estudar
 * matéria que lhe sai no exame.
 */
export function getReaderCategory(): CategoryId | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(KEY);
    return CATEGORIES.includes(stored as CategoryId) ? (stored as CategoryId) : null;
  } catch {
    // Modo privado, armazenamento bloqueado: segue-se sem preferência.
    return null;
  }
}

export function setReaderCategory(category: CategoryId | null) {
  if (typeof window === 'undefined') return;
  try {
    if (category) {
      window.localStorage.setItem(KEY, category);
    } else {
      window.localStorage.removeItem(KEY);
    }
  } catch {
    // Não se guardou; a interface desta sessão ainda assim acompanha.
  }
  // `storage` só dispara noutros separadores, e a página que escreve também
  // tem de reagir.
  window.dispatchEvent(new CustomEvent(EVENT, { detail: category }));
}

export function useReaderCategory(): CategoryId | null {
  const [category, setCategory] = useState<CategoryId | null>(null);

  useEffect(() => {
    setCategory(getReaderCategory());
    const sync = () => setCategory(getReaderCategory());
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return category;
}
