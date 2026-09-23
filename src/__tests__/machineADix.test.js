/**
 * LA MACHINE À DIX — multiplier par 10, au CE1.
 *
 * Ce qui se vérifie : un chiffre puis deux, les deux pièges (plus dix, deux
 * zéros) toujours proposés à la sortie, et la machine remontée à la fin.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MachineADix from '../components/jeux/MachineADix';
import {
  MANCHES, MANCHES_SORTIE, PHRASES, reponse, serie, verdict,
} from '../lib/jeux/machineADix';
import { jeuxDeLaClasse } from '../lib/jeux/catalogue';

const graines = Array.from({ length: 80 }, (_, i) => i + 1);

describe('la série d’une partie', () => {
  it('cinq sorties puis trois entrées, huit nombres différents, jamais un multiple de dix', () => {
    graines.forEach((g) => {
      const l = serie(g);
      expect(l).toHaveLength(MANCHES);
      expect(new Set(l.map((m) => m.entree)).size).toBe(MANCHES);
      l.forEach((m, i) => {
        expect(m.mode).toBe(i < MANCHES_SORTIE ? 'sortie' : 'entree');
        expect(m.entree % 10).not.toBe(0);
      });
    });
  });

  it('un chiffre pour commencer, puis deux', () => {
    graines.forEach((g) => {
      const l = serie(g);
      l.slice(0, 3).forEach((m) => expect(m.entree).toBeLessThan(10));
      l.slice(3, MANCHES_SORTIE).forEach((m) => expect(m.entree).toBeGreaterThan(10));
    });
  });

  it('à la sortie, les deux pièges sont toujours là', () => {
    graines.forEach((g) => serie(g).filter((m) => m.mode === 'sortie').forEach((m) => {
      expect(m.choix.sort((x, y) => x - y)).toEqual([m.entree + 10, m.entree * 10, m.entree * 100].sort((x, y) => x - y));
    }));
  });

  it('chaque piège se nomme', () => {
    const m = { mode: 'sortie', entree: 7 };
    expect(reponse(m)).toBe(70);
    expect(verdict(70, m)).toBe('juste');
    expect(verdict(17, m)).toBe('plus-dix');
    expect(verdict(700, m)).toBe('deux-zeros');
    expect(verdict(70, { mode: 'entree', entree: 7 })).toBe('remonter');
  });
});

describe('la machine à l’écran', () => {
  afterEach(() => { jest.restoreAllMocks(); });
  beforeEach(() => { jest.spyOn(Date, 'now').mockReturnValue(2024); });

  it('ajouter dix est nommé ; la bonne sortie fait continuer', async () => {
    render(<MachineADix onQuitter={jest.fn()} />);
    const { entree } = serie(2024)[0];

    await userEvent.click(screen.getByRole('button', { name: String(entree + 10) }));
    expect(screen.getByRole('status')).toHaveTextContent(PHRASES.plusDix);

    await userEvent.click(screen.getByRole('button', { name: String(entree * 10) }));
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeInTheDocument();
  });
});

describe('la machine dans la ludothèque', () => {
  it('est un jeu de maths du CE1', () => {
    const jeu = jeuxDeLaClasse('CE1').find((j) => j.cle === 'machine-a-dix');
    expect(jeu.competences).toEqual(['MATH_CE1_MULT_DIX']);
  });
});
