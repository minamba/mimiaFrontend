/**
 * Le tri des tableaux de l'administration — Camara, le 17/09/2026.
 *
 * POURQUOI UN MODULE PLUTÔT QU'UN `sort` PAR TABLEAU
 * -------------------------------------------------
 * Trier est trois lignes ; trier JUSTE ne l'est pas. Les colonnes de ces
 * tableaux sont pleines de trous — un parent qui ne s'est jamais connecté, un
 * compte sans forfait donc sans coût — et c'est ce que le tri fait de ces trous
 * qui décide s'il sert à quelque chose. Écrit une fois, vérifié une fois.
 */

/**
 * VIDE VA TOUJOURS À LA FIN, DANS LES DEUX SENS.
 *
 * C'est le choix qui demande le plus d'explication, et c'est le seul qui rend
 * ces tris utilisables. Sur « dernière connexion », la moitié des comptes n'ont
 * rien : traités comme une date très ancienne, ils rempliraient l'écran de
 * tirets en tête de tri croissant — on cherche le parent qui n'est pas revenu
 * depuis longtemps, pas la liste de ceux qu'on n'a jamais mesurés. Sur « ce
 * qu'il a coûté », un compte sans forfait n'a pas coûté zéro : on ne sait pas.
 *
 * Les deux cas sont la même règle : une absence de mesure n'est pas une valeur
 * basse, elle n'a pas sa place dans le classement.
 */
const VIDE = (v) => v === null || v === undefined || v === '';

/**
 * Compare deux valeurs de même nature.
 *
 * Les dates arrivent en chaînes ISO depuis l'API ; `Date.parse` les ramène à
 * des nombres, et une chaîne qui n'est pas une date rend `NaN` — on retombe
 * alors sur la comparaison de texte, en français, pour que « É » se range avec
 * « E » plutôt qu'après « Z ».
 */
function comparer(a, b) {
  if (typeof a === 'number' && typeof b === 'number') return a - b;

  if (typeof a === 'string' && typeof b === 'string') {
    const da = Date.parse(a);
    const db = Date.parse(b);

    if (!Number.isNaN(da) && !Number.isNaN(db)) return da - db;

    return a.localeCompare(b, 'fr', { sensitivity: 'base' });
  }

  if (typeof a === 'boolean' && typeof b === 'boolean') return (a ? 1 : 0) - (b ? 1 : 0);

  return 0;
}

/**
 * Une copie triée de `liste`.
 *
 * UNE COPIE, PAS UN TRI SUR PLACE : la liste vient du magasin Redux, et
 * `Array.prototype.sort` modifie son tableau. Trier en place réordonnerait
 * l'état partagé sans passer par un réducteur — le genre de mutation qui se
 * voit trois écrans plus loin, sur un tableau qu'on n'a pas touché.
 *
 * @param liste     ce qu'on trie
 * @param valeurDe  ce qu'on lit sur chaque ligne pour la classer
 * @param sens      'asc' (croissant) ou 'desc' (décroissant)
 */
export function trier(liste, valeurDe, sens = 'desc') {
  const signe = sens === 'asc' ? 1 : -1;

  return [...(liste ?? [])].sort((x, y) => {
    const a = valeurDe(x);
    const b = valeurDe(y);

    // Le sens ne s'applique PAS aux vides : ils restent en bas quoi qu'il
    // arrive. Voir le commentaire de `VIDE`.
    if (VIDE(a) && VIDE(b)) return 0;
    if (VIDE(a)) return 1;
    if (VIDE(b)) return -1;

    return signe * comparer(a, b);
  });
}

/** `'asc'` ↔ `'desc'`. */
export const inverser = (sens) => (sens === 'asc' ? 'desc' : 'asc');
