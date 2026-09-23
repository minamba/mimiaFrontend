/**
 * LA PÊCHE AUX SONS — le premier jeu de français de Mimia, pour le CP.
 *
 * Ce qui se vérifie d'abord, c'est LE CONTENU : chaque manche ne fait pêcher
 * que des mots où le son s'entend, et ne propose en leurre que des mots où il
 * ne s'entend pas. Une erreur dans la table des mots apprendrait à un enfant
 * de six ans qu'on entend « u » dans « loup ».
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PecheAuxSons from '../components/jeux/PecheAuxSons';
import {
  CIBLES, MANCHES, mot, MOTS, PAR_MANCHE, PHRASES, serie, son, SONS, verdict,
} from '../lib/jeux/pecheAuxSons';
import { jeuxDeLaClasse } from '../lib/jeux/catalogue';
import { PROFESSEUR_PAR_MATIERE } from '../lib/jeux/voix/repliques';

const graines = Array.from({ length: 80 }, (_, i) => i + 1);

describe('la table des mots', () => {
  it('chaque son a au moins trois mots où l’entendre, en dehors de son exemple', () => {
    SONS.forEach((s) => {
      const avec = MOTS.filter((m) => m.sons.includes(s.cle) && m.cle !== s.exemple && !m.douteux?.includes(s.cle));
      expect(avec.length).toBeGreaterThanOrEqual(CIBLES);
    });
  });

  it('chaque mot d’exemple contient bien son son', () => {
    SONS.forEach((s) => expect(mot(s.exemple).sons).toContain(s.cle));
  });

  /** LES PIÈGES DU CP, écrits en dur : une erreur ici se verrait tout de suite. */
  it('« loup » n’a pas le son « u », « lune » n’a pas le son « ou », « main » n’a pas le son « a »', () => {
    expect(mot('loup').sons).not.toContain('u');
    expect(mot('lune').sons).not.toContain('ou');
    expect(mot('main').sons).not.toContain('a');
    expect(mot('lapin').sons).not.toContain('i');
    expect(mot('mouton').sons).not.toContain('o');
  });

  it('les clés et les images sont uniques', () => {
    expect(new Set(MOTS.map((m) => m.cle)).size).toBe(MOTS.length);
    expect(new Set(MOTS.map((m) => m.image)).size).toBe(MOTS.length);
  });
});

describe('la série d’une partie', () => {
  it('huit sons différents, six poissons chacun, dont trois à pêcher', () => {
    graines.forEach((g) => {
      const l = serie(g);
      expect(l).toHaveLength(MANCHES);
      expect(new Set(l.map((m) => m.son)).size).toBe(MANCHES);
      l.forEach((m) => {
        expect(m.poissons).toHaveLength(PAR_MANCHE);
        expect(m.poissons.filter((p) => p.cible)).toHaveLength(CIBLES);
        expect(new Set(m.poissons.map((p) => p.mot)).size).toBe(PAR_MANCHE);
      });
    });
  });

  it('on n’entend le son que dans les poissons à pêcher', () => {
    graines.forEach((g) => serie(g).forEach((m) => {
      m.poissons.forEach((p) => expect(mot(p.mot).sons.includes(m.son)).toBe(p.cible));
    }));
  });

  it('le mot d’exemple et les mots douteux ne sont jamais dans la mare', () => {
    graines.forEach((g) => serie(g).forEach((m) => {
      const cles = m.poissons.map((p) => p.mot);
      expect(cles).not.toContain(son(m.son).exemple);
      cles.forEach((c) => expect(mot(c).douteux ?? []).not.toContain(m.son));
    }));
  });
});

describe('ce que vaut une pêche', () => {
  const poissons = [
    { mot: 'loup', cible: true }, { mot: 'poule', cible: true }, { mot: 'lune', cible: false },
  ];

  it('juste, il en manque, ou un intrus désigné', () => {
    expect(verdict(['loup', 'poule'], poissons).sens).toBe('juste');
    expect(verdict(['loup'], poissons).sens).toBe('manque');
    expect(verdict(['loup', 'lune'], poissons)).toEqual({ sens: 'intrus', erreurs: ['lune'] });
  });
});

describe('le jeu à l’écran', () => {
  afterEach(() => { jest.restoreAllMocks(); });

  const GRAINE = 2024;
  beforeEach(() => { jest.spyOn(Date, 'now').mockReturnValue(GRAINE); });

  it('montre la lettre du son, et six poissons nommés', () => {
    render(<PecheAuxSons onQuitter={jest.fn()} />);
    const m = serie(GRAINE)[0];
    expect(screen.getByLabelText(`Le son ${son(m.son).lettre}`)).toBeInTheDocument();
    m.poissons.forEach((p) => {
      expect(screen.getByRole('button', { name: `Écouter : ${mot(p.mot).mot}` })).toBeInTheDocument();
    });
  });

  it('rien ne se gagne sans l’annoncer ; un intrus est nommé', async () => {
    render(<PecheAuxSons onQuitter={jest.fn()} />);
    const m = serie(GRAINE)[0];
    const intrus = m.poissons.find((p) => !p.cible);

    await userEvent.click(screen.getByRole('button', { name: mot(intrus.mot).mot }));
    await userEvent.click(screen.getByRole('button', { name: /C’est prêt/ }));
    expect(screen.getByRole('status')).toHaveTextContent(PHRASES.intrus);

    await userEvent.click(screen.getByRole('button', { name: `${mot(intrus.mot).mot}, pêché` }));
    for (const p of m.poissons.filter((x) => x.cible)) {
      await userEvent.click(screen.getByRole('button', { name: mot(p.mot).mot }));
    }
    expect(screen.queryByRole('button', { name: 'Continuer' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /C’est prêt/ }));
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeInTheDocument();
  });

  it('on peut revenir aux jeux à tout moment', async () => {
    const onQuitter = jest.fn();
    render(<PecheAuxSons onQuitter={onQuitter} />);
    await userEvent.click(screen.getByRole('button', { name: /Revenir aux jeux/ }));
    expect(onQuitter).toHaveBeenCalled();
  });
});

describe('la pêche dans la ludothèque', () => {
  it('est un jeu de français du CP, avec la voix d’Adrien', () => {
    const jeu = jeuxDeLaClasse('CP').find((j) => j.cle === 'peche-aux-sons');
    expect(jeu.matiereCode).toBe('FRANCAIS');
    expect(jeu.competences).toEqual(['FR_CP_LECT_GRAPHEMES']);
    expect(PROFESSEUR_PAR_MATIERE.FRANCAIS).toBe('adrien');
  });
});
