/**
 * DEUX PAR DEUX — le huitième jeu de Mimia, pour le CP.
 *
 * Ce qui se vérifie : que la question oblige à se servir du double — l'une
 * des assiettes est cachée —, que les deux pièges du CP sont toujours parmi
 * les réponses et nommés à part, et que tout reste dans les doubles jusqu'à
 * 20.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeuxParDeux from '../components/jeux/DeuxParDeux';
import {
  bilan, MANCHES, MANCHES_DOUBLE, PHRASES, reponse, serie, verdict,
} from '../lib/jeux/deuxParDeux';
import { jeuxDeLaClasse } from '../lib/jeux/catalogue';

const graines = Array.from({ length: 80 }, (_, i) => i + 1);

describe('la série d’une partie', () => {
  it('quatre doubles, puis quatre moitiés', () => {
    const l = serie(1);
    expect(l).toHaveLength(MANCHES);
    l.forEach((m, i) => expect(m.mode).toBe(i < MANCHES_DOUBLE ? 'double' : 'moitie'));
  });

  it('tout reste dans les doubles jusqu’à 20', () => {
    graines.forEach((g) => serie(g).forEach((m) => {
      expect(m.n).toBeGreaterThanOrEqual(2);
      expect(m.n).toBeLessThanOrEqual(10);
      m.choix.forEach((v) => {
        expect(v).toBeGreaterThanOrEqual(1);
        expect(v).toBeLessThanOrEqual(20);
      });
    }));
  });

  /** LES DEUX PIÈGES DU CP sont toujours là : sinon, rien ne les révèle. */
  it('quatre réponses différentes, dont la bonne et le piège', () => {
    graines.forEach((g) => serie(g).forEach((m) => {
      expect(new Set(m.choix).size).toBe(4);
      expect(m.choix).toContain(reponse(m));
      expect(m.choix).toContain(m.mode === 'double' ? m.n : 2 * m.n);
    }));
  });

  it('jamais le même nombre deux fois d’affilée, et la même graine redonne la même série', () => {
    graines.forEach((g) => {
      const l = serie(g);
      l.slice(1).forEach((m, i) => expect(m.n).not.toBe(l[i].n));
    });
    expect(serie(7)).toEqual(serie(7));
  });
});

describe('l’erreur se nomme', () => {
  it('au double : n’avoir compté qu’une assiette, c’est le piège', () => {
    const m = { mode: 'double', n: 6 };
    expect(verdict(12, m)).toBe('juste');
    expect(verdict(6, m)).toBe('oubli');
    expect(verdict(14, m)).toBe('trop');
    expect(verdict(10, m)).toBe('pas-assez');
  });

  it('à la moitié : donner le total sans partager, c’est le piège', () => {
    const m = { mode: 'moitie', n: 6 };
    expect(verdict(6, m)).toBe('juste');
    expect(verdict(12, m)).toBe('tout');
    expect(verdict(7, m)).toBe('trop');
    expect(verdict(5, m)).toBe('pas-assez');
  });

  it('le mot de la fin est celui des autres jeux', () => {
    expect(bilan(8)).toMatch(/Bravo/);
  });
});

describe('le jeu à l’écran', () => {
  afterEach(() => { jest.restoreAllMocks(); });

  const GRAINE = 2024;
  beforeEach(() => { jest.spyOn(Date, 'now').mockReturnValue(GRAINE); });

  it('l’assiette de droite est cachée, et le piège est nommé', async () => {
    render(<DeuxParDeux onQuitter={jest.fn()} />);
    const m = serie(GRAINE)[0];

    expect(screen.getByRole('img', { name: /sous une cloche\.$/ })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: String(m.n) }));
    expect(screen.getByRole('status')).toHaveTextContent(PHRASES.oubli);
  });

  it('la bonne réponse lève la cloche et fait continuer', async () => {
    render(<DeuxParDeux onQuitter={jest.fn()} />);
    const m = serie(GRAINE)[0];

    await userEvent.click(screen.getByRole('button', { name: String(2 * m.n) }));
    expect(screen.getByRole('img', { name: new RegExp(`on voit ${m.n} biscuits`) })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeInTheDocument();
  });

  it('à la moitié, le total non partagé est nommé', async () => {
    render(<DeuxParDeux onQuitter={jest.fn()} />);
    const s = serie(GRAINE);
    for (let i = 0; i < MANCHES_DOUBLE; i += 1) {
      await userEvent.click(screen.getByRole('button', { name: String(reponse(s[i])) }));
      await userEvent.click(screen.getByRole('button', { name: 'Continuer' }));
    }
    const m = s[MANCHES_DOUBLE];

    await userEvent.click(screen.getByRole('button', { name: String(2 * m.n) }));
    expect(screen.getByRole('status')).toHaveTextContent(PHRASES.tout);
  });

  it('on peut revenir aux jeux à tout moment', async () => {
    const onQuitter = jest.fn();
    render(<DeuxParDeux onQuitter={onQuitter} />);
    await userEvent.click(screen.getByRole('button', { name: /Revenir aux jeux/ }));
    expect(onQuitter).toHaveBeenCalled();
  });
});

describe('deux par deux dans la ludothèque', () => {
  it('est proposé au CP, avec la seule compétence qu’il travaille', () => {
    const jeu = jeuxDeLaClasse('CP').find((j) => j.cle === 'deux-par-deux');
    expect(jeu.competences).toEqual(['MATH_CP_CALC_DOUBLE']);
    expect(jeuxDeLaClasse('CE1').map((j) => j.cle)).not.toContain('deux-par-deux');
  });
});
