import { decouper } from './ardoise';
import { retirerMarqueurCahier } from './copieCahier';
import { retirerMarqueurCopieControle } from './copieControle';
import { retirerMarqueurConversation } from './conversationLangue';
import { retirerMarqueurAvecCopie, retirerMarqueurEnonce } from './enonceExercice';
import { retirerMarqueurSupportEcrit } from './supportEcrit';
import { retirerMarqueurSupportSon } from './supportSon';
import { retirerMarqueurSupport } from './supportEvaluation';
import { retirerMarqueurTypeDictee } from './typeDictee';
import { retirerMarqueurChoixExerciceSons } from './choixExerciceSons';
import { retirerMarqueurClicRetrait } from './retraitNotion';
import { MARQUEUR_LECTURE_IMAGE } from '../lectureDImage';
import { sansBalisesAEcouter } from '../reponseADictee';

/**
 * CE QUE L'APPLICATION GLISSE DANS UN MESSAGE NE SE MONTRE JAMAIS — Camara, le
 * 12/10/2026 : dans « Mes conversations », un message de Bilal affichait
 * « [L'élève a choisi la vitesse. LANCE LA CONVERSATION MAINTENANT…] » et
 * « [TEXTE AU CAHIER : il écrit sur son cahier…] ».
 *
 * Ces consignes sont ajoutées au message de l'élève pour guider le professeur.
 * Le chat les retirait, chacune par son propre filtre ; les écrans qui
 * relisent un échange après coup ne les retiraient pas. UNE SEULE CHAÎNE,
 * ici, pour tous : un marqueur ajouté un jour s'ajoute à cette liste, et
 * aucun écran ne peut l'oublier.
 */
export function retirerMarqueursApplication(texte) {
  return retirerMarqueurClicRetrait(retirerMarqueurChoixExerciceSons(retirerMarqueurLectureImage(retirerMarqueurSupportSon(retirerMarqueurTypeDictee(retirerMarqueurSupportEcrit(retirerMarqueurConversation(
    retirerMarqueurSupport(retirerMarqueurCopieControle(
      retirerMarqueurCahier(retirerMarqueurEnonce(retirerMarqueurAvecCopie(texte ?? ''))),
    )),
  )))))));
}

/** La syllabe ou le mot à lire (07/11/2026) : le tableau le montre, la bulle ne le dit pas. */
const retirerMarqueurLectureImage = (texte) => (texte ?? '').replace(MARQUEUR_LECTURE_IMAGE, '').trimEnd();

/**
 * Le texte d'un message tel qu'on peut le relire hors du chat : marqueurs de
 * l'application et blocs techniques retirés, tableau compris. Pour les écrans
 * qui n'affichent qu'un paragraphe (archives, comptes rendus).
 */
export function texteLisible(texte) {
  // Une relecture après coup (archives, comptes rendus) montre le nombre dicté : l'exercice est passé.
  return decouper(retirerMarqueursApplication(sansBalisesAEcouter(texte)))
    .map((s) => s.contenu.trim())
    .filter(Boolean)
    .join('\n\n');
}
