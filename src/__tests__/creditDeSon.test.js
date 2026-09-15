/**
 * UN TEXTE N'EST IMPOSSIBLE QUE S'IL DÉPASSE TOUT LE SON RÉCENT.
 *
 * Relevé par Camara le 13/09/2026 : « toute ma justification, cinq ou six
 * lignes, s'est écrite puis effacée, et ensuite il a envoyé un bout de
 * phrase ».
 *
 * On jugeait chaque texte contre la durée d'UN ordre de fin de tour, en
 * supposant qu'à chaque ordre répondait exactement un texte. Or le fournisseur
 * clôt aussi les phrases lui-même ; quand il le fait avant nous, le serveur
 * écarte notre ordre et aucun texte ne lui répond. La durée orpheline était
 * alors associée au texte SUIVANT : vingt-cinq secondes de justification
 * jugées contre trois secondes, déclarées impossibles, jetées.
 *
 * Le crédit remplace cet appariement. Il ne suppose rien de l'ordre d'arrivée.
 *
 * Ce fichier remplace `mesureDuVerdict.test.js`, qui verrouillait
 * l'appariement lui-même — la règle qu'on vient de reconnaître fausse.
 */

import { crediter, jugerTranscription } from '../lib/storage/ecouteTempsReel';

const SECONDE = 24000;

const LA_JUSTIFICATION = 'Alors pour la réciproque on compare AD sur AB et AE sur AC, '
  + 'trois sur neuf ça fait un tiers et quatre sur douze ça fait aussi un tiers, '
  + 'les deux rapports sont égaux donc les droites DE et BC sont parallèles, '
  + 'et en plus les points sont dans le même ordre sur les deux droites.';

test('la justification qui suit une fin de tour orpheline est acceptée', () => {
  const credit = [];

  // Le bout de phrase : trois secondes, et son texte revient.
  crediter(credit, 3 * SECONDE, 0);
  expect(jugerTranscription('Alors, comme D appartient à AB et E à', credit, 3000).impossible)
    .toBe(false);

  // Notre ordre de fin de tour est écarté par le serveur : aucun texte. Puis
  // vingt-cinq secondes de justification, et son texte revient.
  crediter(credit, 25 * SECONDE, 28000);

  expect(LA_JUSTIFICATION.length).toBeGreaterThan(250);
  expect(jugerTranscription(LA_JUSTIFICATION, credit, 30000).impossible).toBe(false);
});

test('la phrase fantôme sur un silence, sans aucun son transmis, reste écartée', () => {
  expect(jugerTranscription('Qu’est-ce que signifie « auxiliaire » ?', [], 0).impossible)
    .toBe(true);
});

test('le crédit périmé ne couvre pas une phrase inventée longtemps après', () => {
  // Dix secondes de vraie parole, puis une minute de silence, puis un texte
  // qui sort de nulle part : la vieille parole ne peut pas le justifier.
  const credit = [];
  crediter(credit, 10 * SECONDE, 0);

  expect(jugerTranscription('Qu’est-ce que signifie « auxiliaire » ?', credit, 60000).impossible)
    .toBe(true);
});

test('deux textes d’une même phrase coupée en deux partagent le crédit', () => {
  // Le fournisseur découpe parfois une phrase en deux textes. Le premier ne
  // doit pas épuiser ce dont le second a besoin.
  const credit = [];
  crediter(credit, 5 * SECONDE, 0);

  expect(jugerTranscription('Je pense que les deux droites sont', credit, 5000).impossible)
    .toBe(false);
  expect(jugerTranscription('parallèles parce que les rapports.', credit, 5200).impossible)
    .toBe(false);
});

test('un texte consomme son crédit : le même son ne justifie pas deux fois beaucoup', () => {
  // Deux secondes de son ne portent pas deux textes de quarante-cinq
  // caractères — il en aurait fallu près de quatre.
  const credit = [];
  crediter(credit, 2 * SECONDE, 0);

  const phrase = 'Je crois que la réponse est trente-deux, oui.';
  expect(jugerTranscription(phrase, credit, 2000).impossible).toBe(false);
  expect(jugerTranscription(phrase, credit, 2100).impossible).toBe(true);
});

test('les textes courts ne sont jamais jugés, même sans crédit', () => {
  expect(jugerTranscription('oui', [], 0).impossible).toBe(false);
  expect(jugerTranscription('32', [], 0).impossible).toBe(false);
});
