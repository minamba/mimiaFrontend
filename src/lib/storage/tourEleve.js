/**
 * Quand l'élève a-t-il VRAIMENT fini de parler ?
 *
 * Le transcripteur ferme un tour dès que la phrase lui paraît complète. C'est
 * le bon réglage pour un dialogue de calcul — question courte, réponse courte —
 * et le mauvais pour une justification : « alors, parce que si on prend 234… »
 * (l'élève réfléchit) « …on peut le couper en 200, 30 et 4 » arrivait en DEUX
 * tours. Le professeur commençait à répondre au premier, le second annulait sa
 * génération, et l'élève le voyait démarrer puis se taire.
 *
 * On sépare donc les deux notions : le transcripteur dit qu'une PHRASE est
 * finie, ce module décide qu'un TOUR l'est. Entre les deux, un court délai
 * pendant lequel un nouveau fragment vient se recoller au précédent.
 *
 * Rendre la détection elle-même plus patiente ne marchait pas : `low` a été
 * essayé, et une phrase terminée restait sans réponse tant que l'élève ne
 * reparlait pas. Le délai doit donc être court par défaut, et long seulement
 * quand on a de bonnes raisons d'attendre.
 */

/**
 * Assez court pour être imperceptible. C'est le cas normal : à « combien font
 * 200 fois 6 ? » on attend un nombre, et le professeur doit répondre aussitôt.
 */
export const DELAI_COURT = 150;

/**
 * De quoi laisser réfléchir au milieu d'un raisonnement. Un enfant qui
 * justifie s'arrête pour chercher ses mots, et cette pause-là ne signifie pas
 * qu'il a fini.
 */
export const DELAI_LONG = 2500;

// Traits d'union ramenés à l'espace au même titre que les apostrophes : sans
// ça, « Qu'est-ce qui te fait dire ça ? » restait « qu est-ce qui », et le
// motif écrit en mots séparés ne s'y retrouvait pas.
const normaliser = (texte) =>
  (texte ?? '')
    .normalize('NFD')
    .replace(new RegExp('[\\u0300-\\u036f]', 'g'), '')
    .replace(/['’-]/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase();

/**
 * Le professeur vient-il de demander une explication ?
 *
 * C'est LUI qui sait quelle longueur de réponse il attend : il l'a décidé en
 * posant sa question. Plutôt qu'un compromis unique pour tous les cas, la
 * patience se règle sur ce qu'il vient de demander.
 *
 * `combien` est volontairement absent : c'est une question à réponse courte.
 */
const JUSTIFICATION = [
  /\bexplique\b|\bexpliquer\b|\bexplication\b/,
  /\bpourquoi\b/,
  /\bcomment\b/,
  /\bjustifie\b|\bjustifier\b/,
  /\bdetaille\b|\bdecris\b|\braconte\b/,
  /\bqu est ce qui te fait\b|\bqu est ce que tu en penses\b/,
  /\ba ton avis\b|\bselon toi\b|\bd apres toi\b/,
];

export function demandeJustification(texte) {
  const propre = normaliser(texte);

  return JUSTIFICATION.some((motif) => motif.test(propre));
}

/**
 * Mots sur lesquels une phrase ne s'arrête pas.
 *
 * Un fragment qui finit par « parce que » ou « donc » n'est pas une réponse,
 * c'est une phrase coupée en plein élan. Aucune question du professeur n'est
 * nécessaire pour le savoir : le texte le dit tout seul.
 */
const CHARNIERES = new RegExp(
  '\\b(parce que|par ce que|car|donc|alors|et|mais|ou|puis|ensuite|apres|'
  + 'si|quand|lorsque|comme|pour|afin|sauf|meme|du coup|en fait|c est a dire|'
  + 'a cause|grace|vu que|puisque|tandis que|alors que|alors qu|alors quon)\\s*$',
);

export function fragmentInacheve(texte) {
  const propre = normaliser(texte).replace(/[.!?…]+\s*$/, '').trim();
  if (!propre) return false;

  // Une virgule finale dit la même chose et se lit plus vite.
  if (/,$/.test(propre)) return true;

  return CHARNIERES.test(propre);
}

/**
 * Combien de temps attendre avant de considérer le tour terminé.
 *
 * Le fragment prime sur la question : une phrase manifestement coupée doit
 * attendre, même si le professeur demandait un simple résultat.
 */
export function delaiAssemblage({ demandeProf, fragment } = {}) {
  if (fragmentInacheve(fragment)) return DELAI_LONG;
  if (demandeJustification(demandeProf)) return DELAI_LONG;

  return DELAI_COURT;
}
