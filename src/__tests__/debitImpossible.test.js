/**
 * UNE PHRASE INVENTÉE N'A PAS D'AUDIO DERRIÈRE.
 *
 * Relevé en séance : « Qu'est-ce que signifie "auxiliaire" ? » est parti au
 * professeur alors que l'élève n'avait rien dit. Ce n'était pas un écho de la
 * voix du professeur — le mot « auxiliaire » n'apparaît nulle part dans ce
 * qu'il venait de dire —, mais une phrase inventée sur du quasi-silence, bâtie
 * autour d'un mot de la liste de vocabulaire qu'on souffle au transcripteur.
 *
 * Aucun filtre de contenu ne peut l'attraper : elle est grammaticale, dans le
 * sujet, et parfaitement plausible. Le seul critère qui ne se discute pas est
 * la PHYSIQUE — personne ne prononce trente-sept caractères en un quart de
 * seconde.
 *
 * CE QUE CES TESTS PROTÈGENT SURTOUT, C'EST L'AUTRE SENS. Un garde-fou trop
 * serré jetterait la parole d'un élève qui articule vite, et ne laisserait
 * aucune trace : il parlerait, et on ne l'écouterait plus.
 */

import { debitImpossible } from '../lib/storage/ecouteTempsReel';

describe("ce qui n'a pas pu être dit", () => {
  test('la question fantôme de la séance du 31 août', () => {
    // Trente-sept caractères. Il aurait fallu une seconde et demie ; il y a eu
    // quatre cents millisecondes de souffle.
    expect(debitImpossible('Qu\'est-ce que signifie "auxiliaire" ?', 0.4)).toBe(true);
  });

  test('une liste de vocabulaire recrachée sur un silence', () => {
    const liste = 'consigne, exercice, énoncé, exemple, question, réponse, singulier, pluriel';
    expect(debitImpossible(liste, 1.2)).toBe(true);
  });

  test('une phrase sans le moindre son transmis', () => {
    // Le cas le plus net : le micro n'a rien envoyé, et pourtant un texte
    // arrive. Il ne peut venir que du modèle.
    expect(debitImpossible('Je crois que la réponse est trois.', 0)).toBe(true);
  });
});

describe('ce qui a très bien pu être dit', () => {
  test.each([
    ["Qu'est-ce que signifie « auxiliaire » ?", 2.0, 'la même phrase, réellement prononcée'],
    ['Les photos sont féminines, donc ça prend un e et un s.', 4.0, 'une explication posée'],
    ['Je crois que c’est au pluriel.', 1.4, 'une réponse rapide'],
    ['Attends je réfléchis.', 1.0, 'une phrase courte et vive'],
  ])('%j en %s s — %s', (texte, secondes) => {
    expect(debitImpossible(texte, secondes)).toBe(false);
  });

  test('un élève qui articule vite reste au-dessus du seuil', () => {
    // Vingt caractères par seconde est déjà un débit de bonimenteur. La limite
    // est posée à vingt-cinq : on ne coupe que l'absurde.
    const texte = 'a'.repeat(40);
    expect(debitImpossible(texte, 2)).toBe(false);
  });
});

test('les fragments courts ne sont jamais jugés', () => {
  // Les premiers morceaux d'un tour arrivent alors qu'une fraction de seconde
  // a été transmise. « Pluriel » sur deux cents millisecondes donne un débit
  // énorme sans rien d'anormal — et c'est justement une bonne réponse.
  expect(debitImpossible('Pluriel.', 0.2)).toBe(false);
  expect(debitImpossible('Oui', 0.05)).toBe(false);
  expect(debitImpossible('32', 0)).toBe(false);
  expect(debitImpossible('', 0)).toBe(false);
  expect(debitImpossible(null, 0)).toBe(false);
});
