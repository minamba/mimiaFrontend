/**
 * LES MOTS ÉCLAIR — reconnaître d'un coup d'œil les mots outils du CP.
 *
 * Le contenu d'abord : chaque leurre est un vrai mot de la liste, jamais un
 * mot mal écrit. Puis l'éclair : le mot ne reste pas à l'écran, et c'est
 * l'enfant qui le fait passer.
 */

import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MotsEclair from '../components/jeux/MotsEclair';
import {
  dureeEclair, MANCHES, MOTS, PHRASES, serie,
} from '../lib/jeux/motsEclair';
import { jeuxDeLaClasse } from '../lib/jeux/catalogue';

const graines = Array.from({ length: 80 }, (_, i) => i + 1);
const liste = MOTS.map((m) => m.mot);

describe('la liste des mots', () => {
  it('chaque leurre est un mot de la liste, différent du mot', () => {
    MOTS.forEach((m) => {
      expect(m.voisins).toHaveLength(2);
      m.voisins.forEach((v) => {
        expect(liste).toContain(v);
        expect(v).not.toBe(m.mot);
      });
      expect(new Set(m.voisins).size).toBe(2);
    });
  });

  it('aucun mot à accent, et aucun doublon', () => {
    liste.forEach((m) => expect(m).toMatch(/^[a-z]+$/));
    expect(new Set(liste).size).toBe(liste.length);
  });

  it('l’éclair raccourcit par palier, sans descendre sous une seconde', () => {
    expect(dureeEclair(0)).toBeGreaterThan(dureeEclair(5));
    expect(dureeEclair(MANCHES - 1)).toBeGreaterThanOrEqual(1000);
  });
});

describe('la série d’une partie', () => {
  it('dix mots différents, et trois cartes dont le mot', () => {
    graines.forEach((g) => {
      const l = serie(g);
      expect(l).toHaveLength(MANCHES);
      expect(new Set(l.map((m) => m.mot)).size).toBe(MANCHES);
      l.forEach((m) => {
        expect(m.cartes).toHaveLength(3);
        expect(m.cartes).toContain(m.mot);
      });
    });
  });

  it('le mot n’est pas toujours à la même place', () => {
    const places = new Set(graines.flatMap((g) => serie(g).map((m) => m.cartes.indexOf(m.mot))));
    expect(places.size).toBe(3);
  });
});

describe('le jeu à l’écran', () => {
  const GRAINE = 2024;
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(Date, 'now').mockReturnValue(GRAINE);
  });
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  const cliquer = (el) => {
    // userEvent v13 : un clic synchrone suffit avec les minuteries simulées.
    userEvent.click(el);
  };

  it('le mot passe, puis disparaît et laisse place aux trois cartes', async () => {
    render(<MotsEclair onQuitter={jest.fn()} />);
    const m = serie(GRAINE)[0];

    expect(screen.queryByText(m.mot)).not.toBeInTheDocument();
    await cliquer(screen.getByRole('button', { name: /Montre le mot/ }));
    expect(screen.getByText(m.mot)).toBeInTheDocument();

    act(() => { jest.advanceTimersByTime(dureeEclair(0)); });
    m.cartes.forEach((c) => expect(screen.getByRole('button', { name: c })).toBeInTheDocument());
  });

  it('une carte fausse est nommée et barrée ; la bonne donne la main', async () => {
    render(<MotsEclair onQuitter={jest.fn()} />);
    const m = serie(GRAINE)[0];
    const fausse = m.cartes.find((c) => c !== m.mot);

    await cliquer(screen.getByRole('button', { name: /Montre le mot/ }));
    act(() => { jest.advanceTimersByTime(dureeEclair(0)); });

    await cliquer(screen.getByRole('button', { name: fausse }));
    expect(screen.getByRole('status')).toHaveTextContent(PHRASES.erreur);
    expect(screen.getByRole('button', { name: fausse })).toBeDisabled();

    await cliquer(screen.getByRole('button', { name: m.mot }));
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeInTheDocument();
  });

  it('on peut revoir l’éclair une fois, pas deux', async () => {
    render(<MotsEclair onQuitter={jest.fn()} />);
    await cliquer(screen.getByRole('button', { name: /Montre le mot/ }));
    act(() => { jest.advanceTimersByTime(dureeEclair(0)); });

    await cliquer(screen.getByRole('button', { name: 'Revoir le mot' }));
    act(() => { jest.advanceTimersByTime(dureeEclair(0)); });
    expect(screen.getByRole('button', { name: /déjà revu/ })).toBeDisabled();
  });
});

describe('les mots éclair dans la ludothèque', () => {
  it('est un jeu de français du CP, sur les mots outils', () => {
    const jeu = jeuxDeLaClasse('CP').find((j) => j.cle === 'mots-eclair');
    expect(jeu.matiereCode).toBe('FRANCAIS');
    expect(jeu.competences).toEqual(['FR_CP_LECT_MOTS_OUTILS']);
  });
});
