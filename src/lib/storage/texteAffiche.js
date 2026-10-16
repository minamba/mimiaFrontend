import { decouper } from './ardoise';
import { retirerMarqueurCahier } from './copieCahier';
import { retirerMarqueurCopieControle } from './copieControle';
import { retirerMarqueurConversation } from './conversationLangue';
import { retirerMarqueurAvecCopie, retirerMarqueurEnonce } from './enonceExercice';
import { retirerMarqueurSupportEcrit } from './supportEcrit';
import { retirerMarqueurSupport } from './supportEvaluation';

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
  return retirerMarqueurSupportEcrit(retirerMarqueurConversation(
    retirerMarqueurSupport(retirerMarqueurCopieControle(
      retirerMarqueurCahier(retirerMarqueurEnonce(retirerMarqueurAvecCopie(texte ?? ''))),
    )),
  ));
}

/**
 * Le texte d'un message tel qu'on peut le relire hors du chat : marqueurs de
 * l'application et blocs techniques retirés, tableau compris. Pour les écrans
 * qui n'affichent qu'un paragraphe (archives, comptes rendus).
 */
export function texteLisible(texte) {
  return decouper(retirerMarqueursApplication(texte))
    .map((s) => s.contenu.trim())
    .filter(Boolean)
    .join('\n\n');
}
