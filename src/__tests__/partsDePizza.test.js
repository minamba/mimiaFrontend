/**
 * LES PARTS DE PIZZA — lire, comparer et additionner des fractions, au CE1.
 *
 * Ce qui se vérifie : chaque temps propose ses pièges (parts vides, fraction
 * à l'envers, nombres du bas additionnés), et chaque piège se nomme.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PartsDePizza from '../components/jeux/PartsDePizza';
import {
  cle, MANCHES, MANCHES_COMPARER, MANCHES_LIRE, PHRASES, reponse, serie, verdict,
} from '../lib/jeux/partsDePizza';
import { jeuxDeLaClasse } from '../lib/jeux/catalogue';

const graines = Array.from({ length: 80 }, (_, i) => i + 1);

describe('la série d’une partie', () => {
  it('trois à lire, trois à comparer, deux à additionner', () => {
    graines.forEach((g) => {
      const l = serie(g);
      expect(l).toHaveLength(MANCHES);
      l.forEach((m, i) => {
        let attendu = 'additionner';
        if (i < MANCHES_LIRE) attendu = 'lire';
        else if (i < MANCHES_LIRE + MANCHES_COMPARER) attendu = 'comparer';
        expect(m.mode).toBe(attendu);
      });
    });
  });

  it('à lire : la bonne fraction, celle des parts vides, et l’envers', () => {
    graines.forEach((g) => serie(g).filter((m) => m.mode === 'lire').forEach((m) => {
      const { n, d } = m.fraction;
      expect(m.choix.map(cle).sort()).toEqual([`${n}/${d}`, `${d - n}/${d}`, `${d}/${n}`].sort());
      expect(2 * n).not.toBe(d);
    }));
  });

  it('à comparer : deux fractions différentes de même dénominateur', () => {
    graines.forEach((g) => serie(g).filter((m) => m.mode === 'comparer').forEach((m) => {
      const [x, y] = m.choix;
      expect(x.d).toBe(y.d);
      expect(x.n).not.toBe(y.n);
    }));
  });

  it('à additionner : la somme reste une part de la pizza, et le piège des nombres du bas est là', () => {
    graines.forEach((g) => serie(g).filter((m) => m.mode === 'additionner').forEach((m) => {
      const [x, y] = m.termes;
      expect(m.fraction).toEqual({ n: x.n + y.n, d: x.d });
      expect(m.fraction.n).toBeLessThan(m.fraction.d);
      expect(m.choix.map(cle)).toContain(`${x.n + y.n}/${2 * x.d}`);
      expect(new Set(m.choix.map(cle)).size).toBe(3);
    }));
  });
});

describe('chaque piège se nomme', () => {
  it('les parts vides, l’envers, la comparaison, les nombres du bas', () => {
    const lire = { mode: 'lire', fraction: { n: 3, d: 4 } };
    expect(verdict({ n: 3, d: 4 }, lire)).toBe('juste');
    expect(verdict({ n: 1, d: 4 }, lire)).toBe('vides');
    expect(verdict({ n: 4, d: 3 }, lire)).toBe('envers');

    const comparer = { mode: 'comparer', choix: [{ n: 2, d: 6 }, { n: 5, d: 6 }] };
    expect(reponse(comparer)).toEqual({ n: 5, d: 6 });
    expect(verdict({ n: 2, d: 6 }, comparer)).toBe('comparer');

    const add = { mode: 'additionner', fraction: { n: 3, d: 4 } };
    expect(verdict({ n: 3, d: 8 }, add)).toBe('bas');
    expect(verdict({ n: 4, d: 4 }, add)).toBe('compter');
  });
});

describe('la pizza à l’écran', () => {
  afterEach(() => { jest.restoreAllMocks(); });
  beforeEach(() => { jest.spyOn(Date, 'now').mockReturnValue(2024); });

  it('compter les parts vides est nommé ; la bonne fraction fait continuer', async () => {
    render(<PartsDePizza onQuitter={jest.fn()} />);
    const { n, d } = serie(2024)[0].fraction;

    await userEvent.click(screen.getByRole('button', { name: `${d - n} sur ${d}` }));
    expect(screen.getByRole('status')).toHaveTextContent(PHRASES.vides);

    await userEvent.click(screen.getByRole('button', { name: `${n} sur ${d}` }));
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeInTheDocument();
  });
});

describe('la pizza dans la ludothèque', () => {
  it('est un jeu de maths du CE1, sur les fractions', () => {
    const jeu = jeuxDeLaClasse('CE1').find((j) => j.cle === 'parts-de-pizza');
    expect(jeu.competences).toEqual(['MATH_CE1_FRAC_SENS', 'MATH_CE1_FRAC_COMPARER', 'MATH_CE1_FRAC_ADD']);
  });
});
