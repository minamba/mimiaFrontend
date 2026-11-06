/**
 * LES JEUX RANGÉS PAR MATIÈRE — une règle pour tous les jeux, présents et à
 * venir : un nouveau jeu rejoint la section de sa matière sans rien déclarer,
 * et une nouvelle matière ouvre sa section avec son premier jeu.
 */

import { JEUX, jeuxDeLaClasse, jeuxOuvertsEnEssai, parMatiere } from '../lib/jeux/catalogue';

const jeu = (cle, matiereCode, matiere) => ({ cle, matiereCode, matiere });

describe('les jeux rangés par matière', () => {
  it('chaque jeu est rangé sous sa matière, sans en perdre ni en doubler', () => {
    const groupes = parMatiere(JEUX);
    const ranges = groupes.flatMap((g) => g.jeux.map((j) => j.cle));

    expect(ranges.sort()).toEqual(JEUX.map((j) => j.cle).sort());
    groupes.forEach((g) => g.jeux.forEach((j) => expect(j.matiereCode).toBe(g.matiereCode)));
  });

  it('un futur jeu d’une nouvelle matière ouvre sa propre section', () => {
    const groupes = parMatiere([
      jeu('a', 'MATHS', 'Mathématiques'),
      jeu('b', 'FRANCAIS', 'Français'),
      jeu('c', 'MATHS', 'Mathématiques'),
    ]);

    expect(groupes.map((g) => g.matiere)).toEqual(['Mathématiques', 'Français']);
    expect(groupes[0].jeux.map((j) => j.cle)).toEqual(['a', 'c']);
    expect(groupes[1].jeux.map((j) => j.cle)).toEqual(['b']);
  });

  // UN SEUL ORDRE POUR TOUTES LES CLASSES — Camara, le 18/10/2026 : les
  // mathématiques d'abord, même quand un jeu de français est écrit avant.
  it('les matières suivent un ordre fixe, les jeux celui du catalogue', () => {
    const groupes = parMatiere([
      jeu('b', 'BONUS', 'Jeux bonus'),
      jeu('x', 'FRANCAIS', 'Français'),
      jeu('y', 'MATHS', 'Mathématiques'),
      jeu('z', 'MATHS', 'Mathématiques'),
      jeu('h', 'HISTOIRE_GEO', 'Histoire-Géographie'),
    ]);

    expect(groupes.map((g) => g.matiereCode)).toEqual(['MATHS', 'FRANCAIS', 'HISTOIRE_GEO', 'BONUS']);
    expect(groupes[0].jeux.map((j) => j.cle)).toEqual(['y', 'z']);
  });

  it('toutes les classes rangent leurs matières dans le même ordre', () => {
    const ordre = ['MATHS', 'FRANCAIS', 'HISTOIRE_GEO', 'ANGLAIS', 'SCIENCES', 'PHYSIQUE_CHIMIE', 'SVT', 'BONUS'];
    ['CP', 'CE1', 'CE2', 'CM1', 'CM2', 'SIXIEME', 'TROISIEME', 'SECONDE', 'TERMINALE', 'TERMINALE_TECHNO'].forEach((classe) => {
      const codes = parMatiere(jeuxDeLaClasse(classe)).map((g) => g.matiereCode);
      expect(codes[0]).toBe('MATHS');
      expect(codes).toEqual([...codes].sort((a, b) => ordre.indexOf(a) - ordre.indexOf(b)));
    });
  });

  // L'ESSAI (18/10/2026) : les deux premiers jeux de maths, escape games sautés.
  it('en essai, les deux premiers jeux de maths hors escape games', () => {
    const ouverts = jeuxOuvertsEnEssai([
      { ...jeu('esc', 'MATHS', 'Mathématiques'), escape: true },
      jeu('fr', 'FRANCAIS', 'Français'),
      jeu('m1', 'MATHS', 'Mathématiques'),
      jeu('m2', 'MATHS', 'Mathématiques'),
      jeu('m3', 'MATHS', 'Mathématiques'),
    ]);

    expect([...ouverts]).toEqual(['m1', 'm2']);
  });

  it('aucun jeu, aucune section', () => {
    expect(parMatiere([])).toEqual([]);
  });
});
