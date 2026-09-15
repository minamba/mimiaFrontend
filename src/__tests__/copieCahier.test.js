/**
 * LA DICTÉE AU CAHIER : ce que l'interface dit au professeur, et ce que
 * l'élève voit.
 *
 * Ces deux moitiés sont la même décision vue des deux bouts, et c'est
 * exactement pour ça qu'elles cassent ensemble : on retouche la phrase d'un
 * côté, le filtre de l'autre ne reconnaît plus rien, et l'enfant retrouve un
 * pavé technique dans sa propre bulle — à la place de « j'ai fini d'écrire ».
 *
 * Rien ne signalerait cette dérive : le professeur continuerait de bien se
 * comporter, seul l'affichage serait abîmé. D'où ces tests.
 */

import {
  marquerCopieAuCahier,
  marquerCopieAuClavier,
  retirerMarqueurCahier,
} from '../lib/storage/copieCahier';

test("l'aller-retour rend exactement ce que l'élève a dit", () => {
  const dit = "C'est bon, j'ai fini d'écrire.";
  expect(retirerMarqueurCahier(marquerCopieAuCahier(dit))).toBe(dit);
});

test('le marqueur dit au professeur ce qu’il ne peut pas deviner', () => {
  const charge = marquerCopieAuCahier("C'est bon, j'ai fini d'écrire.");

  // Les trois erreurs constatées en séance, chacune fermée par une phrase.
  expect(charge).toMatch(/pas encore parvenue/i);   // il croyait avoir la copie
  expect(charge).toMatch(/rien à comparer/i);       // il a affiché « les deux versions »
  expect(charge).toMatch(/à l’oral/i);              // il a demandé de la réciter
  expect(charge).toMatch(/photo/i);                 // ce qu'il aurait dû demander
});

test("le marqueur ne se voit pas dans la bulle de l'élève", () => {
  const charge = marquerCopieAuCahier('Attends, je réfléchis.');

  expect(retirerMarqueurCahier(charge)).not.toMatch(/DICTÉE AU CAHIER/);
  expect(retirerMarqueurCahier(charge)).toBe('Attends, je réfléchis.');
});

test('un message sans marqueur traverse intact', () => {
  // Le filtre s'applique à TOUTES les bulles de la conversation, dont celles
  // du professeur. Mordre sur un message ordinaire coûterait plus cher que le
  // marqueur qu'on cache.
  const ordinaire = 'Regarde encore : dans « il les a posté », « les » vient avant « a ».';
  expect(retirerMarqueurCahier(ordinaire)).toBe(ordinaire);

  expect(retirerMarqueurCahier('')).toBe('');
  expect(retirerMarqueurCahier(null)).toBe('');
  expect(retirerMarqueurCahier(undefined)).toBe('');
});

test('un crochet dans la phrase de l’élève ne déborde pas sur le marqueur', () => {
  // Le motif est ancré en fin de message et refuse tout crochet fermant à
  // l'intérieur : sans ces deux bornes, il pourrait avaler la phrase entière
  // dès qu'elle contient un crochet — et l'élève verrait sa bulle vide.
  const dit = "J'ai écrit [le mot] entre crochets.";
  expect(retirerMarqueurCahier(marquerCopieAuCahier(dit))).toBe(dit);
});

/**
 * LE PENDANT CLAVIER.
 *
 * Relevé le 11/09/2026 : l'élève tape sa dictée, la rend, elle s'affiche
 * entière — et le professeur répond « envoie-moi la photo dès que tu peux ».
 * Il n'a pas de cahier.
 */
describe('marquerCopieAuClavier', () => {
  const copie = 'la forêt s\'etendait a perte de vue\nchaque été mon frère et moi';

  test('dit au professeur qu\'il a la copie sous les yeux', () => {
    expect(marquerCopieAuClavier(copie)).toContain('sous les yeux');
  });

  test('lui interdit de réclamer une photo', () => {
    expect(marquerCopieAuClavier(copie)).toContain('JAMAIS de photo');
  });

  test('ne dit rien des passages manquants : cette vérification est retirée', () => {
    const charge = marquerCopieAuClavier(copie);

    expect(charge).not.toMatch(/MANQUE/i);
    expect(charge).not.toMatch(/RATTRAPAGE/i);
  });

  test('la copie de l\'élève reste intacte au début', () => {
    expect(marquerCopieAuClavier(copie).startsWith(copie)).toBe(true);
  });

  test('aucun crochet dans le corps du marqueur', () => {
    const charge = marquerCopieAuClavier('ma copie');

    expect((charge.match(/\[/g) || []).length).toBe(1);
    expect((charge.match(/\]/g) || []).length).toBe(1);
  });

  test('le marqueur disparaît de la bulle de l\'élève', () => {
    expect(retirerMarqueurCahier(marquerCopieAuClavier(copie))).toBe(copie);
  });

  test('les deux marqueurs se retirent par la même porte', () => {
    expect(retirerMarqueurCahier(marquerCopieAuCahier(copie))).toBe(copie);
  });
});
