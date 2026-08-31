/**
 * Détection d'écho : le micro a-t-il capté la voix du professeur ?
 *
 * Sur haut-parleurs, ce qui sort des enceintes revient dans le micro. La
 * reconnaissance vocale le transcrit fidèlement, et l'application croit que
 * l'élève vient de dire ce que le professeur vient de dire — le cours part
 * alors en boucle sur lui-même.
 *
 * Au casque le problème n'existe pas. C'est donc un signal d'équipement, pas
 * une panne : la bonne réponse est de le dire à l'élève.
 */

/** En dessous, la phrase est trop courte pour conclure quoi que ce soit. */
const MOTS_MINIMUM = 4;

/** Proportion de mots communs à partir de laquelle on parle d'écho. */
const RECOUVREMENT = 0.7;

/**
 * Au-delà, ce n'est plus un écho : l'élève a eu le temps de formuler.
 * Un retour d'enceinte, lui, arrive dans la seconde.
 */
const FENETRE_MS = 6000;

const normaliser = (texte) =>
  (texte ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // accents
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

/**
 * @param transcription ce que le micro vient de capter
 * @param parole        ce que le professeur vient de dire
 * @param finLe         horodatage de la fin de sa phrase (Date.now())
 */
export function estUnEcho(transcription, parole, finLe) {
  if (!parole || !finLe) return false;
  if (Date.now() - finLe > FENETRE_MS) return false;

  const mots = normaliser(transcription);

  // Une réponse courte — « oui », « je sais pas », « 12 » — ne doit jamais
  // être prise pour un écho, même si le professeur venait de le dire.
  if (mots.length < MOTS_MINIMUM) return false;

  const dites = new Set(normaliser(parole));
  if (dites.size === 0) return false;

  const communs = mots.filter((mot) => dites.has(mot)).length;

  return communs / mots.length >= RECOUVREMENT;
}
