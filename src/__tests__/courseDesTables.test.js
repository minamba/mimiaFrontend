/**
 * LA COURSE DES TABLES — les tables de 2 à 5 et la commutativité, au CE1.
 *
 * Ce qui se vérifie : les calculs restent dans les tables du programme, les
 * jumelles reprennent un calcul déjà posé, les leurres sont des erreurs
 * d'enfant, et une erreur ne fait jamais reculer la voiture.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CourseDesTables from '../components/jeux/CourseDesTables';
import {
  JUMELLES, MANCHES, methode, PHRASES, propositions, serie, TABLES,
} from '../lib/jeux/courseDesTables';
import { jeuxDeLaClasse } from '../lib/jeux/catalogue';

const graines = Array.from({ length: 80 }, (_, i) => i + 1);

describe('la série d’une partie', () => {
  it('dix questions, dont deux jumelles aux places prévues', () => {
    graines.forEach((g) => {
      const l = serie(g);
      expect(l).toHaveLength(MANCHES);
      l.forEach((m, i) => expect(m.jumelle).toBe(JUMELLES.includes(i)));
    });
  });

  it('chaque calcul est dans une table de 2 à 5, sans « fois 1 »', () => {
    graines.forEach((g) => serie(g).filter((m) => !m.jumelle).forEach((m) => {
      expect(TABLES).toContain(m.a);
      expect(m.b).toBeGreaterThanOrEqual(2);
      expect(m.b).toBeLessThanOrEqual(10);
    }));
  });

  it('une jumelle retourne un calcul déjà posé plus tôt dans la partie', () => {
    graines.forEach((g) => {
      const l = serie(g);
      JUMELLES.forEach((i) => {
        const j = l[i];
        expect(j.modele).toEqual([j.b, j.a]);
        expect(l.slice(0, i).some((m) => !m.jumelle && m.a === j.b && m.b === j.a)).toBe(true);
      });
    });
  });

  it('trois résultats différents, dont le bon', () => {
    graines.forEach((g) => serie(g).forEach((m) => {
      expect(m.choix).toHaveLength(3);
      expect(new Set(m.choix).size).toBe(3);
      expect(m.choix).toContain(m.a * m.b);
      m.choix.forEach((r) => expect(r).toBeGreaterThan(0));
    }));
  });

  it('l’addition est proposée comme leurre quand elle diffère du produit', () => {
    let vue = 0;
    for (let i = 0; i < 50; i += 1) {
      if (propositions(3, 4, () => 0.9).includes(7)) vue += 1;
    }
    expect(vue).toBeGreaterThan(0);
  });

  it('la méthode compte dans la table du calcul', () => {
    expect(methode(3, 7)).toBe('Compte de 3 en 3.');
    expect(methode(7, 3)).toBe('Compte de 3 en 3.');
  });
});

describe('la course à l’écran', () => {
  afterEach(() => { jest.restoreAllMocks(); });
  beforeEach(() => { jest.spyOn(Date, 'now').mockReturnValue(2024); });

  it('une erreur donne la méthode et la voiture n’avance pas ; la bonne réponse fait continuer', async () => {
    render(<CourseDesTables onQuitter={jest.fn()} />);
    const m = serie(2024)[0];
    const fausse = m.choix.find((r) => r !== m.a * m.b);

    await userEvent.click(screen.getByRole('button', { name: String(fausse) }));
    expect(screen.getByRole('status')).toHaveTextContent(methode(m.a, m.b));

    await userEvent.click(screen.getByRole('button', { name: String(m.a * m.b) }));
    expect(screen.getByRole('img', { name: /avancé de 0 cases/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeInTheDocument();
  });

  it('une bonne réponse du premier coup fait avancer d’une case', async () => {
    render(<CourseDesTables onQuitter={jest.fn()} />);
    const m = serie(2024)[0];
    await userEvent.click(screen.getByRole('button', { name: String(m.a * m.b) }));
    expect(screen.getByRole('img', { name: /avancé de 1 cases/ })).toBeInTheDocument();
    expect(PHRASES.jumelle).toMatch(/ne change pas/);
  });
});

describe('la course dans la ludothèque', () => {
  it('est un jeu de maths du CE1', () => {
    const jeu = jeuxDeLaClasse('CE1').find((j) => j.cle === 'course-des-tables');
    expect(jeu.competences).toEqual(['MATH_CE1_TABLES_BASE', 'MATH_CE1_MULT_COMMUTATIVE']);
  });
});
