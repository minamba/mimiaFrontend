/**
 * Le tri d'un tableau d'administration, par colonne.
 *
 * POURQUOI CE FICHIER PLUTÔT QUE TROIS LIGNES DANS L'ÉCRAN
 * -------------------------------------------------------
 * Trois des cinq colonnes triables ont chacune un piège, et aucun ne se voit
 * en lisant un `sort` d'une ligne. Les isoler permet de les nommer, et de les
 * éprouver un par un.
 */

/**
 * La valeur sur laquelle chaque colonne se range.
 *
 * LE LIBELLÉ DE CLASSE NE SE TRIE PAS. Par ordre alphabétique, « 3e » précède
 * « 6e » qui précède « CM1 » — l'envers exact de la progression scolaire. On
 * range donc sur le RANG du niveau, que le serveur envoie désormais.
 *
 * LE GENRE SE RANGE SUR SON LIBELLÉ, pas sur son code. L'énumération vaut
 * 1 pour « Fille » et 2 pour « Garçon », mais 0 pour « non renseigné » — trier
 * sur le nombre placerait les inconnus en tête, là où ils n'apprennent rien.
 */
const VALEURS = {
  prenom: (e) => (e.prenom ?? '').toLowerCase(),
  nom: (e) => (e.nom ?? '').toLowerCase(),
  classe: (e) => e.niveauOrdre ?? 0,
  age: (e) => e.age ?? 0,
  sexe: (e) => e.sexe ?? 0,
  parent: (e) => (e.parentMail ?? '').toLowerCase(),
  requetes: (e) => e.nombreRequetes ?? 0,
  activite: (e) => (e.derniereActivite ? new Date(e.derniereActivite).getTime() : null),
};

/**
 * Le sens naturel d'une colonne au premier clic.
 *
 * Sur un nombre ou une date, ce qu'on cherche est le PLUS : l'élève le plus
 * actif, la venue la plus récente. Sur un texte, c'est l'ordre alphabétique.
 * Imposer le même sens partout ferait cliquer deux fois sur trois colonnes.
 */
const DESCENDANT_DABORD = new Set(['age', 'requetes', 'activite', 'classe']);

export const sensParDefaut = (colonne) => !DESCENDANT_DABORD.has(colonne);

/**
 * Range les lignes. Ne modifie pas le tableau reçu — l'ordre d'origine reste
 * disponible, et React voit bien un nouveau tableau.
 *
 * LES VALEURS ABSENTES VONT TOUJOURS À LA FIN, dans les deux sens. Un élève
 * qui n'a jamais travaillé n'a pas de « dernière activité » : le placer en
 * tête du tri décroissant le ferait passer pour le plus récent, et en tête du
 * croissant pour le plus ancien. Ni l'un ni l'autre n'est vrai — il n'a pas de
 * date, et sa place est hors du classement.
 */
export function ranger(lignes, colonne, ascendant) {
  const valeur = VALEURS[colonne];
  if (!valeur) return lignes;

  return [...lignes].sort((a, b) => {
    const x = valeur(a);
    const y = valeur(b);

    const xVide = x === null || x === undefined || x === '';
    const yVide = y === null || y === undefined || y === '';

    if (xVide && yVide) return 0;
    if (xVide) return 1;
    if (yVide) return -1;

    // `localeCompare` pour le texte : sans lui, « Émile » se retrouve après
    // « Zoé », les accents étant classés d'après leur position Unicode.
    const ecart = typeof x === 'string'
      ? x.localeCompare(y, 'fr')
      : x - y;

    return ascendant ? ecart : -ecart;
  });
}

/** L'état de tri suivant, quand on clique sur un en-tête. */
export function suivant(triCourant, colonne) {
  return triCourant.colonne === colonne
    ? { colonne, ascendant: !triCourant.ascendant }
    : { colonne, ascendant: sensParDefaut(colonne) };
}

/** La valeur `aria-sort` attendue par les lecteurs d'écran. */
export const annoncerTri = (tri, colonne) =>
  tri.colonne !== colonne ? 'none' : tri.ascendant ? 'ascending' : 'descending';
