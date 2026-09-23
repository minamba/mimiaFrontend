/**
 * L'ATELIER DES SYLLABES — le deuxième jeu de français de Mimia, pour le CP.
 *
 * Comme pour la pêche aux sons, c'est LE CONTENU qui se vérifie d'abord :
 * une coupe fausse ou un leurre qui se lit comme la bonne syllabe
 * apprendrait à un enfant qu'il a mal lu alors qu'il a bien lu.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AtelierDesSyllabes from '../components/jeux/AtelierDesSyllabes';
import {
  DEUX_SYLLABES, MANCHES, mot, MOTS, PHRASES, serie, verdict,
} from '../lib/jeux/atelierDesSyllabes';
import { jeuxDeLaClasse } from '../lib/jeux/catalogue';

const graines = Array.from({ length: 80 }, (_, i) => i + 1);

/** Ce qui s'écrit, sans les accents qu'on ne voit pas dans la coupe. */
const sansAccent = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '');

describe('la table des mots', () => {
  it('les syllabes, mises bout à bout, redonnent le mot', () => {
    MOTS.forEach((m) => expect(m.syllabes.join('')).toBe(m.mot));
  });

  it('deux ou trois syllabes, et trois leurres par mot', () => {
    MOTS.forEach((m) => {
      expect([2, 3]).toContain(m.syllabes.length);
      expect(m.leurres).toHaveLength(3);
    });
  });

  it('aucun leurre n’est une syllabe du mot', () => {
    MOTS.forEach((m) => m.leurres.forEach((l) => expect(m.syllabes).not.toContain(l)));
  });

  it('aucun leurre ne se lit comme une syllabe du mot', () => {
    // Les graphies qui se disent pareil au CP : o / au / eau, s / c devant
    // e, i, et c / k / qu devant a, o, u.
    const son = (t) => sansAccent(t)
      .replace(/eau|au/g, 'o')
      .replace(/c([eiy])/g, 's$1')
      .replace(/qu|c/g, 'k');
    MOTS.forEach((m) => m.leurres.forEach((l) => {
      expect(m.syllabes.map(son)).not.toContain(son(l));
    }));
  });

  it('assez de mots pour une partie sans doublon', () => {
    expect(MOTS.filter((m) => m.syllabes.length === 2).length).toBeGreaterThanOrEqual(DEUX_SYLLABES);
    expect(MOTS.filter((m) => m.syllabes.length === 3).length).toBeGreaterThanOrEqual(MANCHES - DEUX_SYLLABES);
    expect(new Set(MOTS.map((m) => m.cle)).size).toBe(MOTS.length);
    expect(new Set(MOTS.map((m) => m.image)).size).toBe(MOTS.length);
  });
});

describe('la série d’une partie', () => {
  it('huit mots différents : deux syllabes d’abord, trois ensuite', () => {
    graines.forEach((g) => {
      const l = serie(g);
      expect(l).toHaveLength(MANCHES);
      expect(new Set(l.map((m) => m.mot)).size).toBe(MANCHES);
      l.forEach((m, i) => {
        expect(mot(m.mot).syllabes).toHaveLength(i < DEUX_SYLLABES ? 2 : 3);
      });
    });
  });

  it('chaque manche porte les syllabes du mot et ses trois leurres', () => {
    graines.forEach((g) => serie(g).forEach((m) => {
      const { syllabes, leurres } = mot(m.mot);
      expect(m.etiquettes.map((e) => e.texte).sort()).toEqual([...syllabes, ...leurres].sort());
      expect(new Set(m.etiquettes.map((e) => e.id)).size).toBe(m.etiquettes.length);
    }));
  });

  it('la même graine donne la même partie', () => {
    expect(serie(42)).toEqual(serie(42));
  });
});

describe('ce que vaut un train', () => {
  it('juste, dans le désordre, ou un wagon faux désigné', () => {
    expect(verdict(['ra', 'di', 'o'], 'radio').sens).toBe('juste');
    expect(verdict(['di', 'ra', 'o'], 'radio').sens).toBe('ordre');
    expect(verdict(['ra', 'da', 'o'], 'radio')).toEqual({ sens: 'faux', erreurs: [1] });
  });

  it('les deux « bé » de « bébé » se valent', () => {
    expect(verdict(['bé', 'bé'], 'bebe').sens).toBe('juste');
    expect(verdict(['bé', 'ba'], 'bebe')).toEqual({ sens: 'faux', erreurs: [1] });
  });
});

describe('le jeu à l’écran', () => {
  afterEach(() => { jest.restoreAllMocks(); });

  const GRAINE = 2024;
  beforeEach(() => { jest.spyOn(Date, 'now').mockReturnValue(GRAINE); });

  const premier = () => serie(GRAINE)[0];

  it('montre l’image, un wagon vide par syllabe, et toutes les étiquettes', () => {
    render(<AtelierDesSyllabes onQuitter={jest.fn()} />);
    const m = premier();
    const { syllabes } = mot(m.mot);
    expect(screen.getByRole('img', { name: mot(m.mot).mot })).toBeInTheDocument();
    syllabes.forEach((_, i) => {
      expect(screen.getByRole('button', { name: `Wagon ${i + 1}, vide` })).toBeInTheDocument();
    });
    expect(screen.getAllByRole('button').filter((b) => b.classList.contains('syllabes__etiquette')))
      .toHaveLength(m.etiquettes.length);
  });

  it('rien ne se gagne sans l’annoncer ; un wagon faux est nommé, puis réparé', async () => {
    render(<AtelierDesSyllabes onQuitter={jest.fn()} />);
    const m = premier();
    const [s1, s2] = mot(m.mot).syllabes;
    const leurre = mot(m.mot).leurres[0];

    // Un premier train faux : la bonne syllabe, puis un leurre.
    await userEvent.click(screen.getAllByRole('button', { name: s1 })[0]);
    await userEvent.click(screen.getByRole('button', { name: leurre }));
    expect(screen.queryByRole('button', { name: 'Continuer' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /C’est prêt/ }));
    expect(screen.getByRole('status')).toHaveTextContent(PHRASES.faux);

    // Le wagon faux redescend, la bonne syllabe monte.
    await userEvent.click(screen.getByRole('button', { name: `Wagon 2 : ${leurre}` }));
    await userEvent.click(screen.getAllByRole('button', { name: s2 })[0]);
    await userEvent.click(screen.getByRole('button', { name: /C’est prêt/ }));
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeInTheDocument();
  });

  it('on peut revenir aux jeux à tout moment', async () => {
    const onQuitter = jest.fn();
    render(<AtelierDesSyllabes onQuitter={onQuitter} />);
    await userEvent.click(screen.getByRole('button', { name: /Revenir aux jeux/ }));
    expect(onQuitter).toHaveBeenCalled();
  });
});

describe('l’atelier dans la ludothèque', () => {
  it('est un jeu de français du CP, sur le déchiffrage', () => {
    const jeu = jeuxDeLaClasse('CP').find((j) => j.cle === 'atelier-syllabes');
    expect(jeu.matiereCode).toBe('FRANCAIS');
    expect(jeu.competences).toEqual(['FR_CP_LECT_SYLLABES']);
  });
});
