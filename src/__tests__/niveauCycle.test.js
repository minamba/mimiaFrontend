/**
 * LE CYCLE DÉDUIT DU LIBELLÉ — le filet des sessions trop anciennes.
 *
 * Camara, le 21/09/2026 : le bouton des jeux manquait dans la vue de l'enfant
 * et apparaissait chez le parent. Le cycle est écrit dans la session au moment
 * de la connexion ; une session ouverte avant que ce champ existe ne le porte
 * pas, et le parent, lui, relit la liste de ses enfants à chaque visite.
 *
 * LES VINGT-SIX CLASSES DE LA BASE SONT ÉNUMÉRÉES ICI, avec leur cycle tel
 * qu'il est en base. C'est ce qui rend le filet sûr : si un libellé change ou
 * si une classe s'ajoute sans cycle reconnaissable, ce test tombe.
 */

import { cycleDuNiveau } from '../lib/niveauCycle';

// Relevé en base le 21/09/2026 : `SELECT code, libelle, cycle FROM
// NiveauScolaire ORDER BY ordre`.
const CLASSES = [
  ['CP', 'Primaire'],
  ['CE1', 'Primaire'],
  ['CE2', 'Primaire'],
  ['CM1', 'Primaire'],
  ['CM2', 'Primaire'],
  ['6e', 'College'],
  ['5e', 'College'],
  ['4e', 'College'],
  ['3e', 'College'],
  ['3e prépa-métiers', 'College'],
  ['Seconde professionnelle', 'Lycee'],
  ['Seconde générale et technologique', 'Lycee'],
  ['Première générale', 'Lycee'],
  ['Première technologique - série à préciser', 'Lycee'],
  ['Première professionnelle', 'Lycee'],
  ['Première STMG', 'Lycee'],
  ['Première STI2D', 'Lycee'],
  ['Première ST2S', 'Lycee'],
  ['Première STL', 'Lycee'],
  ['Terminale STL', 'Lycee'],
  ['Terminale ST2S', 'Lycee'],
  ['Terminale STI2D', 'Lycee'],
  ['Terminale STMG', 'Lycee'],
  ['Terminale technologique - série à préciser', 'Lycee'],
  ['Terminale professionnelle', 'Lycee'],
  ['Terminale générale', 'Lycee'],
];

test('les vingt-six classes de la base tombent sur le bon cycle', () => {
  expect(CLASSES).toHaveLength(26);

  CLASSES.forEach(([libelle, cycle]) => {
    expect([libelle, cycleDuNiveau(libelle)]).toEqual([libelle, cycle]);
  });
});

test('un libellé absent ou inconnu ne décide de rien', () => {
  expect(cycleDuNiveau(null)).toBeNull();
  expect(cycleDuNiveau('')).toBeNull();
  expect(cycleDuNiveau('   ')).toBeNull();
  expect(cycleDuNiveau('Licence 1')).toBeNull();
  expect(cycleDuNiveau('Grande section')).toBeNull();
});

/**
 * CE N'EST QU'UN FILET : dès qu'une session porte son cycle, c'est lui qui
 * vaut. On vérifie donc que la fonction reste une déduction, pas une règle —
 * elle ne connaît que le libellé et n'invente rien d'autre.
 */
test('la casse et les espaces autour ne changent rien', () => {
  expect(cycleDuNiveau('  ce1  ')).toBe('Primaire');
  expect(cycleDuNiveau('3E')).toBe('College');
  expect(cycleDuNiveau('terminale générale')).toBe('Lycee');
});

// « 3e prépa-métiers » est la seule classe de collège dont le libellé ne se
// réduit pas à deux caractères : elle a fait tomber une première version du
// motif, qui exigeait la fin de chaîne.
test('la 3e prépa-métiers reste au collège', () => {
  expect(cycleDuNiveau('3e prépa-métiers')).toBe('College');
});
