/**
 * UN OU DES ? — marquer le pluriel d'un nom par un -s, au CP.
 *
 * Le contenu d'abord : des noms à pluriel régulier seulement. Puis la règle :
 * le nombre d'objets décide du petit mot, le petit mot décide du s — et les
 * deux erreurs reçoivent deux remarques différentes.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UnOuDes from '../components/jeux/UnOuDes';
import {
  etiquette, MANCHES, nom, NOMS, PHRASES, serie, verdict,
} from '../lib/jeux/unOuDes';
import { jeuxDeLaClasse } from '../lib/jeux/catalogue';

const graines = Array.from({ length: 80 }, (_, i) => i + 1);

describe('les noms', () => {
  it('pluriel régulier seulement : ni s, ni x, ni z à la fin, ni -eau, -au, -al', () => {
    NOMS.forEach((n) => {
      expect(n.nom).not.toMatch(/[sxz]$/);
      expect(n.nom).not.toMatch(/(eau|au|eu|al)$/);
    });
  });

  it('un article au singulier, et aucun doublon', () => {
    NOMS.forEach((n) => expect(['un', 'une']).toContain(n.article));
    expect(new Set(NOMS.map((n) => n.nom)).size).toBe(NOMS.length);
    expect(new Set(NOMS.map((n) => n.image)).size).toBe(NOMS.length);
  });
});

describe('la série d’une partie', () => {
  it('dix noms différents, autant de un que de des', () => {
    graines.forEach((g) => {
      const l = serie(g);
      expect(l).toHaveLength(MANCHES);
      expect(new Set(l.map((m) => m.nom)).size).toBe(MANCHES);
      expect(l.filter((m) => m.combien > 1)).toHaveLength(MANCHES / 2);
    });
  });

  it('au pluriel, de deux à cinq objets — pas toujours deux', () => {
    const combiens = new Set();
    graines.forEach((g) => serie(g).filter((m) => m.combien > 1).forEach((m) => {
      expect(m.combien).toBeGreaterThanOrEqual(2);
      expect(m.combien).toBeLessThanOrEqual(5);
      combiens.add(m.combien);
    }));
    expect(combiens.size).toBe(4);
  });

  it('les choix sont le bon petit mot et « des », le nom avec et sans s', () => {
    graines.forEach((g) => serie(g).forEach((m) => {
      expect([...m.petitsMots].sort()).toEqual([nom(m.nom).article, 'des'].sort());
      expect([...m.formes].sort()).toEqual([m.nom, `${m.nom}s`].sort());
    }));
  });
});

describe('ce que vaut une étiquette', () => {
  const trois = { nom: 'chat', combien: 3 };
  const une = { nom: 'pomme', combien: 1 };

  it('juste au pluriel comme au singulier', () => {
    expect(verdict('des', 'chats', trois).sens).toBe('juste');
    expect(verdict('une', 'pomme', une).sens).toBe('juste');
    expect(etiquette(trois)).toBe('des chats');
    expect(etiquette(une)).toBe('une pomme');
  });

  it('le nombre d’abord : « un » devant trois chats', () => {
    expect(verdict('un', 'chat', trois)).toEqual({ sens: 'nombre', pluriel: true });
    expect(verdict('des', 'pommes', une)).toEqual({ sens: 'nombre', pluriel: false });
  });

  it('puis l’accord : « des chat », « une pommes »', () => {
    expect(verdict('des', 'chat', trois)).toEqual({ sens: 'accord', pluriel: true });
    expect(verdict('une', 'pommes', une)).toEqual({ sens: 'accord', pluriel: false });
  });
});

describe('le jeu à l’écran', () => {
  afterEach(() => { jest.restoreAllMocks(); });

  const GRAINE = 2024;
  beforeEach(() => { jest.spyOn(Date, 'now').mockReturnValue(GRAINE); });

  it('rien ne se gagne sans l’annoncer ; l’oubli du s est nommé', async () => {
    render(<UnOuDes onQuitter={jest.fn()} />);
    const m = serie(GRAINE)[0];
    const pluriel = m.combien > 1;
    const petit = pluriel ? 'des' : nom(m.nom).article;
    const bonne = pluriel ? `${m.nom}s` : m.nom;
    const mauvaise = pluriel ? m.nom : `${m.nom}s`;

    await userEvent.click(screen.getByRole('button', { name: petit }));
    await userEvent.click(screen.getByRole('button', { name: mauvaise }));
    await userEvent.click(screen.getByRole('button', { name: /C’est prêt/ }));
    expect(screen.getByRole('status')).toHaveTextContent(pluriel ? PHRASES.accordDes : PHRASES.accordUn);

    await userEvent.click(screen.getByRole('button', { name: bonne }));
    expect(screen.queryByRole('button', { name: 'Continuer' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /C’est prêt/ }));
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeInTheDocument();
  });

  it('on peut revenir aux jeux à tout moment', async () => {
    const onQuitter = jest.fn();
    render(<UnOuDes onQuitter={onQuitter} />);
    await userEvent.click(screen.getByRole('button', { name: /Revenir aux jeux/ }));
    expect(onQuitter).toHaveBeenCalled();
  });
});

describe('un ou des dans la ludothèque', () => {
  it('est un jeu de français du CP, sur le pluriel', () => {
    const jeu = jeuxDeLaClasse('CP').find((j) => j.cle === 'un-ou-des');
    expect(jeu.matiereCode).toBe('FRANCAIS');
    expect(jeu.competences).toEqual(['FR_CP_LANG_PLURIEL']);
  });
});
