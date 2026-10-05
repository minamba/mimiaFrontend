/**
 * LES NUMÉROS DU TABLEAU SONT AUSSI CEUX DU PROFESSEUR — Camara, le 03/10/2026.
 *
 * En correction de dictée, le tableau numérote les écarts (①, ②, ③…) avec
 * `comparerDictee`. Le professeur ne les voyait pas : il a recompté « par
 * lignes », annoncé trois erreurs où le tableau en montrait deux, inventé un
 * mot, et confondu deux phrases. Depuis, le serveur recalcule les mêmes
 * numéros et les lui donne à chaque tour — `SchoolWebApp/Services/EcartsDictee.cs`.
 *
 * DEUX CALCULS, UNE SEULE RÈGLE. Le C# est la copie à la lettre de ce
 * fichier ; le 03/10/2026, les deux donnaient la même liste sur douze dictées
 * réelles. Ces cas fixent cette sortie : SI CE TEST TOMBE APRÈS UNE
 * MODIFICATION DE `diffDictee.js`, LE SERVEUR DOIT ÊTRE MODIFIÉ DE MÊME — sinon
 * le professeur parlera du n° 4 pendant que l'élève regarde un autre mot.
 */

import { comparerDictee } from '../lib/storage/diffDictee';

/** La liste « n:dicté|copie », comme le serveur la construit. */
function ecarts(dicte, copie) {
  const r = comparerDictee(dicte, copie);
  if (!r.comparable) return null;

  const parNumero = new Map();
  const poser = (segments, cote) => segments.forEach((s) => {
    if (s.type !== 'mot' || !s.erreur || !/[\p{L}\p{N}]/u.test(s.texte)) return;
    const e = parNumero.get(s.erreur) ?? { dicte: [], copie: [] };
    e[cote].push(s.texte);
    parNumero.set(s.erreur, e);
  });
  poser(r.dicte, 'dicte');
  poser(r.copie, 'copie');

  return [...Array(r.erreurs).keys()].map((i) => {
    const e = parNumero.get(i + 1) ?? { dicte: [], copie: [] };
    return `${i + 1}:${e.dicte.join(' ')}|${e.copie.join(' ')}`;
  });
}

test('la dictée d’anglais du 03/10 : sept écarts, dans l’ordre du tableau', () => {
  const dicte = 'Yesterday, Sarah and her brother went to the park to play with their dog. '
    + 'Suddenly, it started to rain, so they decided to go back home quickly. '
    + 'They were tired but happy after their walk.';
  const copie = 'yersteday Sarah her brother went to the park to play with their dog\n'
    + 'suddendly it starting to rain and they decided to back to home quickly\n'
    + 'they were tired but happy after their walk';

  expect(ecarts(dicte, copie)).toEqual([
    '1:Yesterday,|yersteday',
    '2:and|',
    '3:Suddenly,|suddendly',
    '4:started|starting',
    '5:so|and',
    '6:go|',
    '7:|to',
  ]);
});

test('un mot soudé et des accents oubliés', () => {
  expect(ecarts(
    "Le ciel s'assombrissait peu à peu. Un orage éclatait dans le lointain.",
    "le ciel s'aasombrssait peu a peu\nunorage eclat idans le lointain",
  )).toEqual([
    "1:s'assombrissait|s'aasombrssait",
    '2:à|a',
    '3:Un orage|unorage',
    '4:éclatait|eclat',
    '5:dans|idans',
  ]);
});

test('une longue dictée : phrase entière oubliée, mots coupés et soudés', () => {
  const dicte = "Ce matin, Karim s'est levé plus tôt que d'habitude car il avait un examen important. "
    + 'Il a relu ses notes une dernière fois avant de partir. Sur le chemin, il a croisé son ami '
    + "Yanis qui allait dans la même direction. Ils ont discuté du sujet qui pourrait tomber pendant "
    + "l'épreuve. Arrivés devant le lycée, ils se sont souhaité bonne chance. Karim est entré dans "
    + "la salle, le cœur battant, et s'est installé à sa place habituelle. Quand le sujet a été "
    + 'distribué, il a respiré un grand coup avant de commencer à écrire. À la fin de l\'épreuve, il '
    + "s'est senti soulagé d'avoir pu répondre à toutes les questions.";
  const copie = "ce matin Karim s'est levée plut tôt que d'habitude car il avait un examen important\n"
    + 'il a relu ses notes avant de partir\n'
    + "ils ont discuté du sujet qui pourrait tomber pendant l'éprevuer\n"
    + 'arrivé devant le lycée, ilse sont souhaité bonne chance\n'
    + 'kari mest rentré dans la salle le coeur batton et sst installé à sa place hatibuelle\n'
    + 'quand le sujet a été distribué, il a respiré un grand coup avant de commencer a écrire\n'
    + "a la fin de l'epreuve il s'est senti soulagé d'avoir pu répondre a toutes les questions";

  const liste = ecarts(dicte, copie);

  expect(liste).toHaveLength(17);
  expect(liste.slice(0, 8)).toEqual([
    '1:levé|levée',
    '2:plus|plut',
    '3:une dernière fois|',
    '4:Sur le chemin, il a croisé son ami Yanis qui allait dans la même direction.|',
    "5:l'épreuve.|l'éprevuer",
    '6:Arrivés|arrivé',
    '7:ils se|ilse',
    '8:Karim|kari',
  ]);
});
