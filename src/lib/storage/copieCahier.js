/**
 * La dictée faite AU CAHIER, et ce que l'interface en dit au professeur.
 *
 * POURQUOI CE FICHIER EXISTE
 * --------------------------
 * Relevé à la toute première dictée faite au cahier : l'élève dit « j'ai fini
 * d'écrire », et le professeur affiche « les deux versions » — la sienne et
 * celle de l'élève — alors qu'il n'avait JAMAIS reçu sa copie. Puis il lui
 * demande de dire à l'oral ce qu'il a écrit, ce que sa consigne lui interdit
 * en toutes lettres, et finit par se contredire tout seul : « tu n'as encore
 * rien écrit pour cette comparaison ».
 *
 * Sa consigne disait déjà tout cela. C'est la quatrième règle de dictée qu'il
 * ignore, et la leçon est celle du choix du mode : UNE GARANTIE D'USAGE NE SE
 * DEMANDE PAS, ELLE S'IMPOSE. L'écran SAIT que la copie est sur un cahier et
 * qu'aucune photo n'est arrivée. Il le lui dit donc comme un fait du tour, au
 * moment où ça compte, au lieu de compter sur une règle lue mille tokens plus
 * haut.
 *
 * POURQUOI LES DEUX MOITIÉS SONT ICI, ENSEMBLE
 * --------------------------------------------
 * Poser le marqueur et l'effacer de l'affichage sont la même décision vue des
 * deux bouts. Séparées, elles dérivent — on retouche la phrase d'un côté, le
 * filtre de l'autre ne reconnaît plus rien, et l'enfant retrouve un pavé
 * technique dans sa propre bulle. C'est déjà arrivé avec le marqueur de
 * pointage, dont le motif a dû être repris après le premier ajout.
 */

/**
 * Le fait, tel qu'il part au professeur.
 *
 * C'est un FAIT et non une consigne : il n'a matériellement pas la copie. La
 * dernière phrase est la seule qui demande quelque chose, et elle découle du
 * reste.
 *
 * Écrit sur une seule ligne, sans crochet à l'intérieur : c'est ce qui rend le
 * motif de retrait sûr.
 */
const MARQUEUR =
  '[DICTÉE AU CAHIER : sa copie est sur son cahier et ne t’est PAS encore '
  + 'parvenue — elle ne peut arriver qu’en photo. Tu n’as donc rien à corriger, '
  + 'rien à comparer et rien à afficher au tableau pour l’instant. Ne lui '
  + 'demande pas de te la dire à l’oral : la voix ne porte pas l’orthographe, '
  + 'et c’est l’orthographe qu’on corrige. Demande-lui la photo de sa page.]';

/**
 * Le motif de retrait.
 *
 * Ancré en fin de message et sans crochet fermant à l'intérieur : il ne peut
 * mordre ni sur la phrase de l'élève, ni sur un autre marqueur.
 */
const MOTIF = /\n\[DICTÉE AU CAHIER[^\]]*\]$/;

/** Joint l'état de la copie au message de l'élève. */
export function marquerCopieAuCahier(texte) {
  return `${texte}\n${MARQUEUR}`;
}

/**
 * LE PENDANT EXACT, POUR L'AUTRE SUPPORT.
 *
 * Relevé le 11/09/2026 : l'élève tape sa dictée au clavier, la rend, elle
 * s'affiche entière dans le fil — et le professeur lui répond « envoie-moi la
 * photo dès que tu peux ». Il n'a pas de cahier. Il n'y a rien à
 * photographier. La copie était sous ses yeux.
 *
 * Même leçon que pour le cahier, et c'est pour cela que les deux vivent dans
 * ce fichier : l'écran SAIT comment l'élève a écrit, et un fait posé dans le
 * tour vaut mieux qu'une règle lue mille tokens plus haut.
 *
 * Il ne dit RIEN des passages manquants : cette vérification a été retirée le
 * 11/09/2026, la façon de traiter les manques étant à redéfinir.
 *
 * Écrit sur une seule ligne, sans crochet à l'intérieur, pour la même raison
 * que le marqueur du cahier.
 */
const MARQUEUR_CLAVIER =
  '[DICTÉE AU CLAVIER : cette copie est celle que l’élève vient de rendre, '
  + 'tapée au clavier — tu l’as sous les yeux. Ne lui demande JAMAIS de photo : '
  + 'il n’a pas de cahier, il n’y a rien à photographier. Une fois les deux textes '
  + 'au tableau, tu reprends les erreurs DANS L’ORDRE DES NUMÉROS, en commençant '
  + 'par le 1.]';

/** Même ancrage, même garantie de retrait sûr. */
const MOTIF_CLAVIER = /\n\[DICTÉE AU CLAVIER[^\]]*\]$/;

/** Joint l'état de la copie rendue au clavier. */
export function marquerCopieAuClavier(texte) {
  return `${texte}\n${MARQUEUR_CLAVIER}`;
}

/**
 * Retire le marqueur pour l'affichage.
 *
 * Il est écrit POUR LE PROFESSEUR. L'élève, lui, a dit « j'ai fini » — il n'a
 * pas récité un état technique, et sa bulle doit montrer ce qu'il a dit.
 */
export function retirerMarqueurCahier(texte) {
  return (texte ?? '').replace(MOTIF, '').replace(MOTIF_CLAVIER, '');
}
