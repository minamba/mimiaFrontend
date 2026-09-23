/**
 * LES MOTS ÉCLAIR — le troisième jeu de français de Mimia, pour le CP.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   FR_CP_LECT_MOTS_OUTILS — « Reconnaître sans hésiter les mots outils
 *   fréquents »
 *
 * LE JEU. L'enfant appuie sur l'éclair : un mot outil s'affiche un instant,
 * puis disparaît. Trois mots apparaissent ; il touche celui qu'il a vu.
 *
 * « SANS HÉSITER », C'EST L'ÉCLAIR. Un mot qu'on a le temps de déchiffrer
 * lettre à lettre ne dit rien de la reconnaissance : le mot ne reste affiché
 * que le temps d'un coup d'œil, un peu moins à chaque palier.
 *
 * L'ENFANT DÉCLENCHE L'ÉCLAIR. Un mot qui passerait pendant qu'Adrien parle,
 * ou pendant que l'enfant regarde ailleurs, serait perdu sans qu'il y soit
 * pour rien. Il peut aussi REVOIR l'éclair une fois par manche, sans
 * pénalité : c'est le regard qui s'exerce, pas la chance.
 *
 * LES LEURRES SONT DE VRAIS MOTS OUTILS, qui ressemblent au mot : « dans »,
 * « sans », « pas ». JAMAIS UN MOT MAL ÉCRIT : montrer « dan » à un enfant de
 * six ans, c'est lui apprendre une forme fausse. Un test vérifie que chaque
 * leurre est lui-même un mot de la liste.
 *
 * LA LISTE suit les mots outils les plus fréquents des listes de référence
 * pour le CP — articles, pronoms, prépositions, mots de liaison. Aucun mot à
 * accent : « à », « là », « où » se distinguent par un signe qu'un éclair
 * d'une seconde ne laisse pas voir, et ce n'est pas ce qu'on mesure ici.
 */

export const MANCHES = 10;
export const ESSAIS_AVANT_AIDE = 2;

/** Combien de temps le mot reste affiché, par palier de la partie. */
export function dureeEclair(manche) {
  if (manche < 3) return 1500;
  if (manche < 6) return 1200;
  return 1000;
}

/** Chaque mot, et les deux mots de la liste qui lui ressemblent le plus. */
export const MOTS = [
  { mot: 'le', voisins: ['la', 'de'] },
  { mot: 'la', voisins: ['le', 'ma'] },
  { mot: 'les', voisins: ['des', 'mes'] },
  { mot: 'un', voisins: ['une', 'on'] },
  { mot: 'une', voisins: ['un', 'ne'] },
  { mot: 'des', voisins: ['les', 'mes'] },
  { mot: 'et', voisins: ['est', 'en'] },
  { mot: 'est', voisins: ['et', 'les'] },
  { mot: 'il', voisins: ['ils', 'elle'] },
  { mot: 'ils', voisins: ['il', 'les'] },
  { mot: 'elle', voisins: ['il', 'le'] },
  { mot: 'dans', voisins: ['sans', 'pas'] },
  { mot: 'sans', voisins: ['dans', 'son'] },
  { mot: 'sur', voisins: ['sous', 'pour'] },
  { mot: 'sous', voisins: ['sur', 'nous'] },
  { mot: 'pour', voisins: ['par', 'sous'] },
  { mot: 'par', voisins: ['pour', 'pas'] },
  { mot: 'pas', voisins: ['par', 'sans'] },
  { mot: 'mais', voisins: ['mes', 'mon'] },
  { mot: 'qui', voisins: ['que', 'quand'] },
  { mot: 'que', voisins: ['qui', 'quand'] },
  { mot: 'quand', voisins: ['que', 'dans'] },
  { mot: 'on', voisins: ['un', 'en'] },
  { mot: 'en', voisins: ['on', 'et'] },
  { mot: 'ne', voisins: ['une', 'je'] },
  { mot: 'nous', voisins: ['vous', 'sous'] },
  { mot: 'vous', voisins: ['nous', 'sous'] },
  { mot: 'au', voisins: ['du', 'un'] },
  { mot: 'du', voisins: ['au', 'de'] },
  { mot: 'de', voisins: ['le', 'du'] },
  { mot: 'je', voisins: ['le', 'tu'] },
  { mot: 'tu', voisins: ['je', 'du'] },
  { mot: 'mon', voisins: ['ma', 'on'] },
  { mot: 'ma', voisins: ['la', 'mon'] },
  { mot: 'mes', voisins: ['les', 'des'] },
  { mot: 'son', voisins: ['sa', 'on'] },
  { mot: 'sa', voisins: ['la', 'ma'] },
  { mot: 'ses', voisins: ['les', 'mes'] },
  { mot: 'avec', voisins: ['aussi', 'alors'] },
  { mot: 'aussi', voisins: ['alors', 'avec'] },
  { mot: 'alors', voisins: ['aussi', 'avec'] },
  { mot: 'puis', voisins: ['plus', 'pour'] },
  { mot: 'plus', voisins: ['puis', 'pas'] },
  { mot: 'comme', voisins: ['chez', 'mon'] },
  { mot: 'chez', voisins: ['comme', 'ces'] },
  { mot: 'ces', voisins: ['les', 'ses'] },
];

export function voisins(mot) {
  return MOTS.find((m) => m.mot === mot).voisins;
}

/** Un tirage reproductible — voir la note de `boiteDeDix.js`. */
function suite(graine) {
  let etat = graine % 2147483647;
  if (etat <= 0) etat += 2147483646;

  return () => {
    etat = (etat * 16807) % 2147483647;
    return (etat - 1) / 2147483646;
  };
}

/**
 * LA SÉRIE D'UNE PARTIE : dix mots différents, et pour chacun ses trois
 * cartes — le mot et ses deux voisins — dans un ordre tiré.
 */
export function serie(graine = Date.now()) {
  const tirer = suite(graine);
  const melanger = (liste) => {
    const copie = [...liste];
    for (let i = copie.length - 1; i > 0; i -= 1) {
      const j = Math.floor(tirer() * (i + 1));
      [copie[i], copie[j]] = [copie[j], copie[i]];
    }
    return copie;
  };

  return melanger(MOTS).slice(0, MANCHES).map((m) => ({
    mot: m.mot,
    cartes: melanger([m.mot, ...m.voisins]),
  }));
}

/** Le mot de la fin — le même dans tous les jeux. */
export function bilan(duPremierCoup, manches = MANCHES) {
  if (duPremierCoup === manches) return 'Sans une seule erreur. Bravo !';
  if (duPremierCoup >= manches - 2) return 'Presque parfait !';
  if (duPremierCoup >= manches / 2) return 'C’est de mieux en mieux !';
  return 'Tu y arrives. On recommence ?';
}

/**
 * LES PHRASES DU JEU, ÉCRITES ET DITES. Elles vivent ici pour n'exister qu'en
 * un exemplaire : voir `voix/repliques.js`.
 */
export const PHRASES = {
  consigne: 'Touche l’éclair : un mot va passer très vite. Retrouve-le !',
  erreur: 'Ce n’est pas ce mot-là. Regarde bien les lettres.',
  aide: 'Le voici. Regarde-le bien.',
};
