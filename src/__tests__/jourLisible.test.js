import { regrouperParMatiere } from '../lib/jeuxTests';
import { jourLisible } from '../lib/jeuxTests';

describe('« Effectué le » (06/11/2026)', () => {
  it('avec l’heure posée par le changement de statut', () => {
    expect(jourLisible('2026-11-06T14:32:10.123')).toBe('06/11/2026 à 14:32');
  });

  it('une ancienne date choisie au calendrier reste un jour, sans heure', () => {
    expect(jourLisible('2026-11-04T00:00:00')).toBe('04/11/2026');
    expect(jourLisible('2026-11-04')).toBe('04/11/2026');
  });

  it('telle que l’API l’envoie, avec le Z : toujours sans heure, et l’heure de France reste lue telle quelle', () => {
    expect(jourLisible('2026-11-07T00:00:00Z')).toBe('07/11/2026');
    expect(jourLisible('2026-11-07T00:00:00+00:00')).toBe('07/11/2026');
    expect(jourLisible('2026-11-08T16:19:41.8237745Z')).toBe('08/11/2026 à 16:19');
  });

  it('une modification faite à minuit garde son heure', () => {
    expect(jourLisible('2026-11-06T00:00:41.5')).toBe('06/11/2026 à 00:00');
  });

  it('rien d’effectué : un tiret', () => {
    expect(jourLisible(null)).toBe('—');
  });
});

describe('déplacer une ligne (08/11/2026)', () => {
  const { positionApresDeplacement } = require('../lib/jeuxTests');

  it('vers le haut : le rang est l’emplacement', () => {
    expect(positionApresDeplacement(2, 0)).toBe(0);
    expect(positionApresDeplacement(3, 1)).toBe(1);
  });

  it('vers le bas : la ligne retirée décale tout d’un cran', () => {
    expect(positionApresDeplacement(0, 2)).toBe(1);
    expect(positionApresDeplacement(0, 3)).toBe(2);
  });
});

describe('compteParStatut', () => {
  const { compteParStatut } = require('../lib/jeuxTests');
  it('compte les lignes dans l\'ordre OK, KO, en cours, à tester, zéros compris', () => {
    const lignes = [{ statut: 'ok' }, { statut: 'ok' }, { statut: 'ko' }, { statut: 'a_tester' }];
    expect(compteParStatut(lignes).map((c) => [c.libelle, c.nombre])).toEqual([
      ['OK', 2], ['KO', 1], ['En cours', 0], ['À tester', 1],
    ]);
  });
});

describe('les tests regroupés par matière (07/11/2026)', () => {
  it('un groupe par matière, par ordre alphabétique, les tests dans l’ordre du jeu', () => {
    const groupes = regrouperParMatiere([
      { id: 1, titre: 'TEST 2', matiere: 'Français', matiereCode: 'FRANCAIS' },
      { id: 2, titre: 'Test des syllabes', matiere: 'Mathématiques', matiereCode: 'MATHS' },
      { id: 3, titre: 'Test CP', matiere: 'Français', matiereCode: 'FRANCAIS' },
    ]);
    expect(groupes.map((g) => g.matiere)).toEqual(['Français', 'Mathématiques']);
    expect(groupes[0].tests.map((t) => t.titre)).toEqual(['TEST 2', 'Test CP']);
    expect(regrouperParMatiere([])).toEqual([]);
  });
});
