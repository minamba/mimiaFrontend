/**
 * LE TRI DES COLONNES, ET SES TROIS PIÈGES.
 *
 * Aucun ne se voit en relisant un `sort` d'une ligne, et chacun produit un
 * classement qui a l'air juste : c'est ce qui les rend coûteux. Un tableau mal
 * rangé ne lève pas d'erreur — on lit simplement le mauvais élève en tête.
 */

import { ranger, suivant, sensParDefaut, annoncerTri } from '../lib/triTableau';

const eleve = (p) => ({
  prenom: 'X', nom: 'Y', age: 12, sexe: 1, niveauOrdre: 6,
  parentMail: 'a@b.fr', nombreRequetes: 0, derniereActivite: null, ...p,
});

test('la classe suit l’échelle scolaire, pas l’alphabet', () => {
  // LE PIÈGE PRINCIPAL. Par ordre alphabétique : « 3e », « 6e », « CM1 » —
  // l'envers exact de la progression. On range sur le rang du niveau.
  const lignes = [
    eleve({ prenom: 'Troisieme', niveauOrdre: 9 }),
    eleve({ prenom: 'CM1', niveauOrdre: 4 }),
    eleve({ prenom: 'Sixieme', niveauOrdre: 6 }),
  ];

  expect(ranger(lignes, 'classe', true).map((e) => e.prenom))
    .toEqual(['CM1', 'Sixieme', 'Troisieme']);
});

test('les élèves sans activité restent en fin de liste, dans les deux sens', () => {
  // Un élève qui n'a jamais travaillé n'a pas de date. Le mettre en tête du
  // décroissant le ferait passer pour le plus récent ; en tête du croissant,
  // pour le plus ancien. Ni l'un ni l'autre n'est vrai.
  const lignes = [
    eleve({ prenom: 'Jamais', derniereActivite: null }),
    eleve({ prenom: 'Recent', derniereActivite: '2026-08-31T10:00:00Z' }),
    eleve({ prenom: 'Ancien', derniereActivite: '2026-07-01T10:00:00Z' }),
  ];

  expect(ranger(lignes, 'activite', false).map((e) => e.prenom))
    .toEqual(['Recent', 'Ancien', 'Jamais']);

  expect(ranger(lignes, 'activite', true).map((e) => e.prenom))
    .toEqual(['Ancien', 'Recent', 'Jamais']);
});

test('les accents ne renvoient pas les prénoms en fin d’alphabet', () => {
  // Sans `localeCompare`, « Émile » passe après « Zoé » : les accents sont
  // classés d'après leur position Unicode, loin derrière z.
  const lignes = [
    eleve({ prenom: 'zoé' }),
    eleve({ prenom: 'émile' }),
    eleve({ prenom: 'alice' }),
  ];

  expect(ranger(lignes, 'prenom', true).map((e) => e.prenom))
    .toEqual(['alice', 'émile', 'zoé']);
});

test('l’âge et les requêtes se rangent en nombres', () => {
  const lignes = [eleve({ age: 9, nombreRequetes: 100 }), eleve({ age: 14, nombreRequetes: 20 })];

  expect(ranger(lignes, 'age', true).map((e) => e.age)).toEqual([9, 14]);
  expect(ranger(lignes, 'requetes', false).map((e) => e.nombreRequetes)).toEqual([100, 20]);
});

test('le tableau d’origine n’est jamais modifié', () => {
  // React compare les références : trier sur place ne redessinerait rien, et
  // l'ordre initial serait perdu pour de bon.
  const lignes = [eleve({ age: 14 }), eleve({ age: 9 })];
  const copie = [...lignes];

  ranger(lignes, 'age', true);

  expect(lignes).toEqual(copie);
});

describe('le sens du premier clic', () => {
  test('un nombre ou une date part du plus grand', () => {
    // Ce qu'on cherche est l'élève le plus actif, la venue la plus récente.
    expect(sensParDefaut('requetes')).toBe(false);
    expect(sensParDefaut('activite')).toBe(false);
    expect(sensParDefaut('age')).toBe(false);
  });

  test('un texte part de l’ordre alphabétique', () => {
    expect(sensParDefaut('prenom')).toBe(true);
    expect(sensParDefaut('sexe')).toBe(true);
  });

  test('recliquer la même colonne inverse le sens', () => {
    const un = suivant({ colonne: 'activite', ascendant: false }, 'activite');
    expect(un).toEqual({ colonne: 'activite', ascendant: true });

    // Changer de colonne reprend le sens naturel de la NOUVELLE, pas celui
    // qu'on avait laissé sur la précédente.
    const deux = suivant({ colonne: 'activite', ascendant: true }, 'prenom');
    expect(deux).toEqual({ colonne: 'prenom', ascendant: true });
  });
});

test('une colonne inconnue laisse la liste intacte', () => {
  const lignes = [eleve({ age: 14 }), eleve({ age: 9 })];
  expect(ranger(lignes, 'inexistante', true)).toBe(lignes);
});

test('l’état du tri est annoncé aux lecteurs d’écran', () => {
  const tri = { colonne: 'age', ascendant: true };

  expect(annoncerTri(tri, 'age')).toBe('ascending');
  expect(annoncerTri({ ...tri, ascendant: false }, 'age')).toBe('descending');
  expect(annoncerTri(tri, 'prenom')).toBe('none');
});
