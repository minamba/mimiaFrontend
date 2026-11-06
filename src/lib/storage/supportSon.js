/**
 * L'ENFANT ÉCRIT LE SON QU'IL ENTEND : SUR QUOI ? — Camara, le 05/11/2026 : « afficher la
 * fenêtre de choix cahier ou clavier, comme ça le professeur saura que s'il est sur cahier et
 * quand l'enfant dit qu'il a fini, il doit envoyer sa copie ».
 *
 * UN FICHIER DE PLUS, POUR LA RAISON DÉJÀ DITE DANS `supportEcrit.js` : chaque exercice dit autre
 * chose au professeur. Ici, il ne doit rien afficher tant que l'enfant n'a pas répondu, et un
 * marqueur commun avec le texte à rédiger lui ferait écrire une consigne au tableau.
 *
 * LA CARTE EST CELLE DE LA DICTÉE ET DU TEXTE, et les réponses dites à voix haute se lisent de
 * la même façon (`lireReponseSupportEcrit`).
 *
 * PAS DE CROCHET DANS LES MARQUEURS : le motif de retrait s'arrête au premier crochet fermant.
 */

import { reponseEnAttente } from './fenetreExercice';
import { CAHIER, CLAVIER, lireReponseSupportEcrit } from './supportEcrit';

const BALISE = /\[SUPPORT_SON\]/i;

export const QUESTION_SUPPORT_SON = 'Où veux-tu écrire ce que tu entends ?';

const MARQUEUR_CAHIER =
  '[SON AU CAHIER : il écrit sur son cahier ce que tu prononces, et tu ne vois pas son cahier : '
  + 'sa copie ne peut t’arriver qu’en PHOTO. Dicte tout de suite un mot court ou une syllabe, un à la fois, jamais une consonne seule, uniquement dans ta '
  + 'balise de voix, sans rien écrire ni au tableau ni dans ta phrase. Quand il dit qu’il a fini, ou après '
  + 'trois à cinq mots, demande-lui d’envoyer la photo de sa page : le bouton est déjà affiché '
  + 'devant lui. Tant que la photo n’est pas arrivée, tu ne corriges rien, tu ne donnes aucune '
  + 'réponse, et tu ne lui demandes pas de te les dire à l’oral.]';

const MARQUEUR_CLAVIER =
  '[SON AU CLAVIER : il tape dans son champ de saisie ce que tu prononces, et son message est sa '
  + 'réponse. Dicte tout de suite un mot court ou une syllabe, un à la fois, jamais une consonne seule, uniquement dans ta balise de voix, sans rien écrire ni au '
  + 'tableau ni dans ta phrase, puis attends son message. Tu n’as aucune photo à lui demander. Une '
  + 'fois sa réponse reçue, tu peux l’écrire au tableau pour corriger.]';

const MARQUEUR_PHOTO =
  '[COPIE DES SONS : voici la photo de sa page. Lis ce qu’il a écrit pour chaque mot que tu as '
  + 'dicté. Pour un mot faux, aide-le à le corriger sans l’écrire, trois essais au plus ; au troisième, '
  + 'écris le mot au tableau, puis efface le tableau avant de passer au suivant. Pour une nouvelle '
  + 'série, tu réécriras la balise de choix.]';

const MOTIF = /\n\[(?:SON AU (?:CAHIER|CLAVIER)|COPIE DES SONS)[^\]]*\]/g;

/** Vrai si le professeur demande à l'élève de choisir son support. */
export function demandeSupportSon(texte) {
  return BALISE.test(texte ?? '');
}

/** Joint le fait du support au message de l'élève. */
export function marquerSupportSon(texte, support) {
  const propre = (texte ?? '').trim()
    || (support === CAHIER ? 'J’écris sur mon cahier.' : 'J’écris au clavier.');

  return `${propre}\n${support === CAHIER ? MARQUEUR_CAHIER : MARQUEUR_CLAVIER}`;
}

/** Chaque tour avant la photo le redit : une règle lue plus haut ne vaut pas un fait au tour même. */
export function marquerSonAuCahier(texte) {
  return `${(texte ?? '').trim()}\n${MARQUEUR_CAHIER}`;
}

/**
 * AU CLAVIER, L'ÉCRAN SAIT D'OÙ VIENT LE MESSAGE — essai du 05/11/2026 : « chat » dit au micro a
 * reçu « tu as entendu chat, c'est tout bon », alors que l'exercice est d'ÉCRIRE. Conditionnel :
 * ce fait suit l'enfant jusqu'à la fin de la séance, et il a pu changer d'activité entre-temps.
 */
export function marquerSonAuClavier(texte, { auMicro = false } = {}) {
  const origine = auMicro
    ? 'CE MESSAGE VIENT DU MICRO, PAS DU CLAVIER : ce n’est pas une réponse écrite, ne le corrige pas et ne le '
      + 'valide pas. S’il demande de répéter, redis le même mot dans ta balise de voix ; sinon, demande-lui de le taper.'
    : 'CE MESSAGE EST TAPÉ : c’est sa réponse écrite. Un fait à part te dit si elle est juste et quoi faire.';

  return `${(texte ?? '').trim()}\n[SON AU CLAVIER : si vous êtes encore dans l’exercice où il écrit ce que tu dictes. ${origine}]`;
}

/** La photo vient d'arriver : la réponse peut enfin s'afficher. */
export function marquerPhotoDesSons(texte) {
  return `${(texte ?? '').trim()}\n${MARQUEUR_PHOTO}`;
}

/** Retire les marqueurs pour l'affichage. */
export function retirerMarqueurSupportSon(texte) {
  return (texte ?? '').replace(MOTIF, '').replace(BALISE, '').trimEnd();
}

/**
 * Le support en cours : `'cahier'` ou `'clavier'` s'il a choisi, `null` si la question attend
 * (la carte s'affiche), `undefined` si elle n'est pas posée.
 */
export function supportSonChoisi(messages) {
  return reponseEnAttente(messages, {
    lireReponse: (contenu) => {
      if (contenu.includes('[SON AU CAHIER')) return CAHIER;
      if (contenu.includes('[SON AU CLAVIER')) return CLAVIER;
      return undefined;
    },
    lireReponseOrale: lireReponseSupportEcrit,
    pose: demandeSupportSon,
    propres: ['SUPPORT_SON'],
  });
}

/**
 * LE PANNEAU « TA COPIE » RESTE OUVERT TANT QUE LA PHOTO N'EST PAS LÀ. En remontant le fil : une
 * photo de l'élève le referme, le choix du cahier l'ouvre, une nouvelle question le referme.
 */
export function copieSonAttendue(messages) {
  const liste = messages ?? [];

  for (let i = liste.length - 1; i >= 0; i -= 1) {
    const message = liste[i];

    if (message?.role === 'assistant' && demandeSupportSon(message.contenu)) return false;
    if (message?.role !== 'user') continue;

    if ((message.piecesJointes?.length ?? 0) > 0 || message.pieceJointe) return false;

    const support = (message.contenu ?? '').includes('[SON AU CAHIER')
      ? CAHIER
      : (message.contenu ?? '').includes('[SON AU CLAVIER') ? CLAVIER : null;

    if (support) return support === CAHIER;
  }

  return false;
}

export { CAHIER as SON_CAHIER, CLAVIER as SON_CLAVIER };
