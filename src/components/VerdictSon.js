/**
 * LE VERDICT D'UN SON, À LA PLACE DU TEXTE — Camara, le 04/11/2026 : pendant un exercice de
 * syllabes, rien n'est écrit quand l'enfant parle, et sa bulle dit où il en est.
 *
 * PLUS DE ROUGE NI DE « MAUVAISE PRONONCIATION » — Camara, le même soir, après son essai : le
 * jugement de la voix refuse aussi de bonnes réponses, et une erreur de l'outil ne doit pas
 * dire à un enfant qu'il prononce mal. Un son non reconnu se dit « On réessaie », en couleur
 * neutre, sans secousse.
 *
 * Le son jugé reste dans le contenu du message, pour le professeur ; l'élève, lui, ne voit que
 * ces mots. C'est le serveur qui décide quand un tour est un son (voir `RegleVerificationSon`).
 */
export const BONNE_PRONONCIATION = 'Bonne prononciation';
export const ON_REESSAIE = 'On réessaie';

/** L'écoute des mots — Camara, le 05/11/2026 : le même système, avec ses mots à elle. */
export const BONNE_ECOUTE = 'Bonne écoute';
export const MAUVAISE_ECOUTE = 'Mauvaise écoute';

/** Le serveur écrit toujours ce verdict sous cette forme : c'est ce qui le distingue d'une prononciation. */
export const estVerdictDEcoute = (contenu) => /^\s*j.ai entendu (?:le mot|la syllabe)\b/i.test(contenu ?? '');

/**
 * LE REFUS QUI VIENT D'UNE TRADUCTION — décision de Min's (22/11/2026, 00 h 04) : « deux » pour two n'est pas une mauvaise
 * écoute (l'enfant a compris le mot), la bulle dit « On réessaie ». « Mauvaise écoute » reste pour un autre mot. Le serveur
 * le signale dans le texte gardé : « J'ai entendu le mot deux (en français). » (même marque côté serveur :
 * RegleVerificationSon.MarqueDeTraduction — ne pas la changer d'un seul côté).
 */
export const MARQUE_DE_TRADUCTION = ' (en français)';
export const estTraductionEntendue = (contenu) =>
  estVerdictDEcoute(contenu) && (contenu ?? '').trimEnd().replace(/\.+$/, '').endsWith(MARQUE_DE_TRADUCTION);

/**
 * LA LECTURE EN IMAGES — Camara, le 07/11/2026 : l'écoute à l'envers. Jugée comme l'écoute, par ce que le micro a écrit :
 * il peut se tromper, d'où « On réessaie » plutôt qu'un « mauvaise » qui accuserait l'enfant.
 */
export const BONNE_LECTURE = 'Bonne lecture';

export default function VerdictSon({ juste, ecoute = false, lecture = false, traduction = false }) {
  const texte = lecture
    ? (juste ? BONNE_LECTURE : ON_REESSAIE)
    : ecoute
      ? (juste ? BONNE_ECOUTE : traduction ? ON_REESSAIE : MAUVAISE_ECOUTE)
      : (juste ? BONNE_PRONONCIATION : ON_REESSAIE);

  return (
    <span className={`verdict-son verdict-son--${juste ? 'juste' : 'faux'}`} role="status">
      <span className="verdict-son__icone" aria-hidden="true">{juste ? '✓' : '↻'}</span>
      <span className="verdict-son__texte">{texte}</span>
    </span>
  );
}
