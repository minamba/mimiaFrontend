/**
 * CE QUI MÉRITE DE PARTIR AU PROFESSEUR, ET CE QUI N'EN EST PAS.
 *
 * Il y a DEUX chemins par lesquels une parole devient un tour : le verdict du
 * fournisseur, et notre propre filet quand il ne tranche pas. Un seul était
 * gardé — d'où des bulles ne contenant qu'un point, envoyées alors que l'élève
 * n'avait rien dit.
 *
 * Ces tests tiennent le juge unique par les deux bouts : ce qui doit tomber, et
 * surtout ce qui ne doit JAMAIS tomber. Un filtre trop zélé ne se voit pas — il
 * ne laisse aucune trace, juste un élève qui parle et qu'on n'écoute plus.
 */

import {
  estUnTourDeParole,
  estUneHesitation,
  alphabetPlausible,
} from '../lib/storage/ecouteTempsReel';

describe('ce qui ne part pas', () => {
  test.each([
    ['.', 'le point arraché au silence — le cas relevé en séance'],
    ['...', 'trois points, même chose'],
    [' ', "du blanc"],
    ['', 'rien du tout'],
    [null, 'pas même une chaîne'],
    ['euh', 'une hésitation seule'],
    ['hmm hein', 'deux hésitations, toujours pas une réponse'],
    ['الشمالاين', "l'hallucination sur du bruit, dans un autre alphabet"],
    ['?!', 'de la ponctuation seule'],
  ])('%j ne part pas — %s', (texte) => {
    expect(estUnTourDeParole(texte)).toBe(false);
  });
});

describe('ce qui part', () => {
  test.each([
    ['Pluriel.', 'une réponse d’un mot'],
    ['Oui', 'la plus courte de toutes'],
    ['32', 'UN NOMBRE SEUL — une réponse entière en mathématiques'],
    ['3,5', 'un décimal'],
    ['euh je crois que c’est trois', 'une hésitation SUIVIE d’une réponse'],
    ['e accent aigu, e', 'une épellation par noms de lettres'],
    ['Je crois qu’il faut mettre un s parce que c’est au pluriel.', 'une phrase entière'],
  ])('%j part — %s', (texte) => {
    expect(estUnTourDeParole(texte)).toBe(true);
  });
});

test('un nombre seul n’est plus jeté', () => {
  // Le test ne portait que sur l'alphabet latin : un élève qui répondait « 32 »
  // voyait son tour disparaître sans un mot, et sans rien dans la console.
  // C'est le genre de perte qu'on ne remarque qu'en séance.
  expect(alphabetPlausible('32')).toBe(true);
  expect(alphabetPlausible('12,5 cm')).toBe(true);

  // Sans rouvrir la porte qu'on avait fermée : les chiffres arabes orientaux
  // n'en sont pas.
  expect(alphabetPlausible('٣٢')).toBe(false);
});

test('une hésitation reste une hésitation, une réponse reste une réponse', () => {
  expect(estUneHesitation('euh')).toBe(true);
  expect(estUneHesitation('ben alors')).toBe(true);

  // Le filtre ne joue QUE si tout en est. Tronquer une vraie réponse coûterait
  // plus cher que de laisser passer un « euh ».
  expect(estUneHesitation('euh trois')).toBe(false);
  expect(estUneHesitation('bonjour')).toBe(false);
});
