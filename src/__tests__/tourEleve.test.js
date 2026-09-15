/**
 * QUAND L'ÉLÈVE A VRAIMENT FINI DE PARLER : le délai d'assemblage doit
 * rester court pour une réponse brève ("combien font 200 fois 6 ?" —
 * "six cents"), mais s'allonger pour une réponse qui continue sans jamais
 * conclure — sans quoi une longue explication au casque part par bouts de
 * cent cinquante millisecondes en silence.
 */

import {
  delaiAssemblage, DELAI_COURT, DELAI_LONG, DELAI_REFLEXION,
} from '../lib/storage/tourEleve';

test('une réponse courte, sans ponctuation finale, reste rapide', () => {
  expect(delaiAssemblage({ fragment: 'six cents', accumule: 'six cents' })).toBe(DELAI_COURT);
});

test('un fragment coupé sur une charnière attend, même court', () => {
  expect(delaiAssemblage({ fragment: 'parce que', accumule: 'je pense que parce que' }))
    .toBe(DELAI_LONG);
});

test('le professeur a demandé une justification : on attend', () => {
  expect(delaiAssemblage({
    demandeProf: 'Pourquoi est-ce que tu penses ça ?',
    fragment: 'je pense ça',
    accumule: 'je pense ça',
  })).toBe(DELAI_LONG);
});

test('une réponse longue, sans conclusion, obtient plus de patience', () => {
  const accumule =
    'alors je pense que le professeur a corrigé les copies que les élèves '
    + 'avaient rendues et il a noté les erreurs';
  expect(delaiAssemblage({ fragment: 'les erreurs', accumule })).toBe(DELAI_LONG);
});

test('une réponse longue mais qui se termine par un point reste rapide', () => {
  const accumule =
    'alors je pense que le professeur a corrigé les copies que les élèves '
    + 'avaient rendues.';
  expect(delaiAssemblage({ fragment: 'avaient rendues.', accumule })).toBe(DELAI_COURT);
});

test('rien à assembler : rien à attendre longtemps', () => {
  expect(delaiAssemblage({})).toBe(DELAI_COURT);
});

/**
 * LE CALCUL MENTAL A SON PROPRE PALIER — et c'est le correctif du bug relevé
 * par Camara le 13/09/2026 : « en maths, 80 à 95 % de ce que je dis se perd ».
 *
 * Une question de maths ne contient aucun mot de justification, par
 * construction. La patience tombait donc à 150 ms, alors qu'un enfant qui
 * pose une division dans sa tête se tait deux à trois secondes AU MILIEU de
 * sa phrase. Chaque pause expédiait un fragment, et chaque fragment annulait
 * la génération du précédent.
 */
describe('une question à chercher laisse le temps de réfléchir', () => {
  test.each([
    // Mathématiques
    'Combien font 234 divisé par 2 ?',
    'Calcule le périmètre de ce rectangle.',
    'Quel est le résultat ?',
    'Simplifie cette fraction.',
    'Développe cette expression.',
    'Ça fait combien ?',

    // LES AUTRES MATIÈRES AUSSI — le défaut ne touchait pas que les maths.
    // Rien ici ne dépend du cours : c'est la question qui décide.
    'Quelle est la formule de l’eau ?',           // physique-chimie
    'Combien de chromosomes a une cellule ?',      // SVT
    'En quelle année a eu lieu la Révolution ?',   // histoire
    'Cite trois causes de la Première Guerre.',    // histoire
    'Quels sont les fleuves de France ?',          // géographie
    'Donne-moi le pluriel de « cheval ».',         // français
  ])('« %s »', (demandeProf) => {
    // Le fragment ne doit être ni une charnière ni une phrase close : sinon
    // c'est lui qui décide, et on ne teste plus la question du professeur.
    // (« alors » en est une — d'où un premier jet de ce test qui mesurait
    // autre chose que ce qu'il annonçait.)
    const fragment = 'cent dix sept';

    expect(delaiAssemblage({ demandeProf, fragment, accumule: fragment }))
      .toBe(DELAI_REFLEXION);
  });

  test('mais moins qu’une vraie justification, qui reste prioritaire', () => {
    // « Calcule PUIS explique » : on est dans les deux cas, et c'est
    // l'explication qui commande — elle demande plus de temps.
    expect(delaiAssemblage({
      demandeProf: 'Calcule le résultat et explique-moi ta méthode.',
      fragment: 'cent dix sept',
    })).toBe(DELAI_LONG);
  });

  test('une question sans calcul ni justification reste immédiate', () => {
    expect(delaiAssemblage({
      demandeProf: 'Tu es prêt ?',
      fragment: 'oui',
    })).toBe(DELAI_COURT);
  });
});
