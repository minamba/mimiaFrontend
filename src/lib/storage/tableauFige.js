import { sansSurlignes } from './surlignesTableau';

/**
 * LE TABLEAU DE CORRECTION D'UNE EXPRESSION ÉCRITE NE SE RÉÉCRIT PAS — Camara,
 * le 19/09/2026 : « pendant la correction on a tous les badges, il n'y a pas
 * besoin de réécrire le texte après chaque faute. Tout reste figé. »
 *
 * CE QUI S'EST PASSÉ, EN BASE, LE JOUR MÊME. Le professeur a réécrit le tableau
 * six fois pendant une correction de treize minutes — malgré sa consigne, et
 * malgré le rappel qui part avec chaque tour. À chaque fois il CORRIGEAIT le
 * texte lui-même (« ==partie== » devenait « parti »), un surligné de moins,
 * et une fois sans aucun surligné : les badges avaient disparu de l'écran.
 * Une règle de prompt n'a pas suffi ; l'écran s'en charge.
 *
 * LA RÈGLE. Un tableau de correction commence par « La consigne ». Le PREMIER
 * tableau qui porte cette consigne ET des surlignés est celui qu'on garde :
 * tout tableau suivant avec la même consigne est ignoré, surlignés ou pas. Le
 * tableau de la consigne seule (avant que le texte arrive) est remplacé par le
 * premier tableau surligné : il n'est pas encore une correction.
 *
 * Un tableau SANS « La consigne » — une règle de grammaire montrée en passant,
 * une conjugaison — n'est jamais touché : c'est l'exception voulue.
 */

/** La consigne d'un tableau, normalisée ; null s'il n'en porte pas. */
export function consigneDuTableau(tableau) {
  const lignes = (tableau ?? '').split('\n').map((l) => l.trim());
  const debut = lignes.findIndex((l) => /^la\s+consigne\s*:?$/i.test(l));
  if (debut < 0) return null;

  const corps = [];
  for (let i = debut + 1; i < lignes.length; i += 1) {
    if (lignes[i] === '' || /^ton\s+texte/i.test(lignes[i])) break;
    corps.push(lignes[i]);
  }

  const texte = sansSurlignes(corps.join(' ')).replace(/\s+/g, ' ').trim();
  return texte === '' ? null : texte;
}

const surligne = (tableau) => /==[^=\n]+?==/.test(tableau ?? '');

/**
 * LA MÊME RÈGLE POUR LA DICTÉE — Camara, le 19/09/2026 : « la dictée et la
 * copie restent figées au tableau pendant toute la correction ». Le tableau de
 * comparaison (« La dictée » puis « Ta copie ») s'écrit une fois ; une
 * réécriture avec la même dictée est ignorée, quelle que soit la copie qu'elle
 * porte — c'est la copie d'origine, avec ses badges, qui doit rester.
 */
const estComparaison = (tableau) =>
  /^[ \t]*La dictée[ \t]*$/im.test(tableau ?? '') && /^[ \t]*Ta copie[ \t]*$/im.test(tableau ?? '');

/** Le texte dicté d'un tableau de comparaison, normalisé ; null sinon. */
export function dicteeDuTableau(tableau) {
  if (!estComparaison(tableau)) return null;

  const lignes = tableau.split('\n').map((l) => l.trim());
  const debut = lignes.findIndex((l) => /^la dictée$/i.test(l));
  const fin = lignes.findIndex((l, i) => i > debut && /^ta copie$/i.test(l));
  const texte = lignes.slice(debut + 1, fin).join(' ').replace(/\s+/g, ' ').trim();

  return texte === '' ? null : texte;
}

/**
 * Le tableau à afficher, à la place de `candidat`, quand un tableau de
 * correction plus ancien est déjà là : même consigne avec ses surlignés pour
 * une expression écrite, même dictée pour une dictée.
 *
 * @param candidat le dernier tableau écrit (ou en cours d'écriture)
 * @param tableaux tous les tableaux de la séance, dans l'ordre
 */
export function figerTableauDeCorrection(candidat, tableaux) {
  if (!candidat) return candidat;

  // EN COURS DE FLUX, un tableau de comparaison qui commence à s'écrire n'a
  // pas encore sa ligne « Ta copie » : il n'était pas reconnu comme une
  // comparaison, et il remplaçait le tableau figé le temps du flux — l'élève
  // voyait la dictée se réécrire, le 19/09/2026, avant que le serveur ne
  // retire le doublon. Tant qu'une comparaison est déjà au tableau, un
  // tableau qui s'ouvre par « La dictée » la laisse en place.
  if (!estComparaison(candidat) && /^[ \t]*La dictée[ \t]*$/im.test(candidat)) {
    const deja = (tableaux ?? []).find((t) => estComparaison(t));
    if (deja) return deja;
  }

  const dictee = dicteeDuTableau(candidat);
  if (dictee) {
    const fige = (tableaux ?? []).find((t) => dicteeDuTableau(t) === dictee);
    return fige ?? candidat;
  }

  const consigne = consigneDuTableau(candidat);
  if (!consigne) return candidat;

  const fige = (tableaux ?? []).find(
    (t) => surligne(t) && consigneDuTableau(t) === consigne,
  );

  return fige ?? candidat;
}
