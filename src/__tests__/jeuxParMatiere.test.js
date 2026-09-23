/**
 * LES JEUX RANGÉS PAR MATIÈRE — une règle pour tous les jeux, présents et à
 * venir : un nouveau jeu rejoint la section de sa matière sans rien déclarer,
 * et une nouvelle matière ouvre sa section avec son premier jeu.
 */

import { JEUX, parMatiere } from '../lib/jeux/catalogue';

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

  it('l’ordre est celui du catalogue, pour les sections comme pour les jeux', () => {
    const groupes = parMatiere([
      jeu('x', 'FRANCAIS', 'Français'),
      jeu('y', 'MATHS', 'Mathématiques'),
    ]);

    expect(groupes.map((g) => g.matiereCode)).toEqual(['FRANCAIS', 'MATHS']);
  });

  it('aucun jeu, aucune section', () => {
    expect(parMatiere([])).toEqual([]);
  });
});
