/**
 * UNE CONVERSATION D'EXPRESSION ORALE EST EN COURS — et la question de la
 * vitesse ne doit plus se reposer.
 *
 * LE DÉFAUT QUE CE FICHIER ÉVITE, TROUVÉ AVANT LIVRAISON
 * -----------------------------------------------------
 * `carteVitesseVisible` repose la question dès qu'un passage INÉDIT arrive, et
 * c'est juste en compréhension orale : un nouveau texte à écouter, une
 * nouvelle question. Mais dans une conversation, CHAQUE réplique du professeur
 * est un texte inédit — la carte des quatre vitesses serait réapparue à chaque
 * tour de parole, entre deux phrases d'un échange qui doit couler.
 *
 * On ne touche pas à `carteVitesseVisible` : la compréhension orale marche,
 * elle est testée, et Camara y tient. On lui ajoute une condition, et elle ne
 * concerne que la conversation.
 *
 * POURQUOI UNE BALISE ET NON UNE DEVINETTE
 * ----------------------------------------
 * On aurait pu deviner : « si l'élève parle aussi dans la langue, c'est une
 * conversation ». Ça marche jusqu'au jour où un élève répond un mot en anglais
 * au milieu d'une compréhension orale, et la vitesse cesse alors d'être
 * demandée là où elle devrait l'être. Le professeur dit ce qu'il fait ; on ne
 * le déduit pas de ce que l'élève a tapé.
 */

import { ouvreAutreChose as ouvreAutreExercice } from './fenetreExercice';

/** Le professeur ouvre une conversation : elle commence au tour suivant. */
const DEBUT = /\[CONVERSATION\]/i;


/**
 * LA CONVERSATION SE REFERME DÈS QU’AUTRE CHOSE S’OUVRE.
 *
 * LE DÉFAUT QUE CETTE RÈGLE REMPLACE — Camara, en séance le 18/09/2026 :
 * « j’avais demandé une expression orale que j’ai pas faite, je viens de
 * demander un exercice d’expression écrite mais la fenêtre du choix de
 * vitesse pour l’expression orale est toujours là et ne part pas. »
 *
 * JE NE FERMAIS LA CONVERSATION QU’À SON ARCHIVAGE. C’était juste pour une
 * conversation qu’on FAIT — mais une conversation qu’on abandonne ne
 * s’archive jamais. Elle restait « en cours » pour le reste de la séance, et
 * les quatre vitesses s’empilaient sous la consigne de l’exercice suivant.
 *
 * UNE LISTE BLANCHE PLUTÔT QU’UNE LISTE NOIRE, et c’est le point : je ne
 * peux pas énumérer tout ce qui n’est pas une conversation, mais je peux
 * énumérer ce qui EN FAIT PARTIE — c’est court, et ça ne bouge pas. Un
 * exercice ajouté l’an prochain refermera la conversation sans que personne
 * ait à y penser. C’est la leçon du bloc [EXPRESSION_ORALE] qui s’est
 * affiché et prononcé en séance : ce qui dépend d’une liste à tenir à jour
 * finit par ne pas l’être.
 *
 * L’ARCHIVAGE LA REFERME TOUJOURS, du même coup : [EXPRESSION_ORALE] n’est
 * pas dans la liste blanche. Une balise de moins à penser pour le professeur.
 */
function ouvreAutreChose(texte) {
  return ouvreAutreExercice(texte, ['CONVERSATION']);
}

export function ouvreUneConversation(texte) {
  return DEBUT.test(texte ?? '');
}

/**
 * Une conversation est-elle en cours dans ce fil ?
 *
 * ON REMONTE À L'ENVERS et on s'arrête au premier des deux marqueurs : la
 * dernière chose écrite fait foi. Deux conversations dans une séance sont donc
 * distinctes, et la seconde repose la question de la vitesse.
 */
export function conversationEnCours(messages, reponseEnCours = '') {
  if (ouvreAutreChose(reponseEnCours)) return false;
  if (ouvreUneConversation(reponseEnCours)) return true;

  const liste = messages ?? [];

  for (let i = liste.length - 1; i >= 0; i -= 1) {
    if (liste[i]?.role !== 'assistant') continue;

    const contenu = liste[i].contenu ?? '';

    if (ouvreAutreChose(contenu)) return false;
    if (DEBUT.test(contenu)) return true;
  }

  return false;
}

/**
 * Retire la balise pour l'affichage : elle est écrite pour l'application, pas
 * pour l'élève — comme [DEBUT_EVALUATION] et les autres.
 */
export function retirerMarqueurConversation(texte) {
  return (texte ?? '')
    .replace(/\[CONVERSATION\]/gi, '')
    .replace(MOTIF_VITESSE, '');
}

/**
 * LE RANG DE LA CONVERSATION EN COURS : la première de la séance vaut 1, la
 * deuxième 2. `null` si aucune n'est ouverte.
 *
 * SERT D'IDENTITÉ À LA QUESTION DE LA VITESSE, et c'est tout son intérêt : on
 * la pose une fois par conversation, et on sait laquelle a déjà répondu.
 *
 * POURQUOI UN COMPTE ET NON L'INDEX DU MESSAGE — le défaut que ce choix évite,
 * trouvé le 18/09/2026 juste après la première version. Un message du
 * professeur arrive d'abord en FLUX, puis se range dans l'historique : son
 * index n'existe pas encore pendant qu'il s'écrit. Avec l'index, l'identité
 * changeait au moment où le message se rangeait — et la fenêtre des vitesses
 * revenait juste après que l'élève avait cliqué, pour une conversation qu'il
 * venait de régler.
 *
 * Le compte, lui, vaut pareil des deux côtés de ce passage : celle qui s'écrit
 * porte déjà le rang qu'elle aura une fois rangée.
 */
export function rangConversation(messages, reponseEnCours = '') {
  if (!conversationEnCours(messages, reponseEnCours)) return null;

  const ouvertures = (messages ?? []).filter(
    (m) => m?.role === 'assistant' && ouvreUneConversation(m.contenu ?? ''),
  ).length;

  return ouvreUneConversation(reponseEnCours) ? ouvertures + 1 : ouvertures;
}

/**
 * LE CLIC SUR LA VITESSE DOIT PARLER AU PROFESSEUR — Camara, le 18/09/2026 :
 * « j'ai choisi la vitesse, mais la prof n'a pas démarré ».
 *
 * LE DÉFAUT ÉTAIT DANS MA CONCEPTION. En compréhension orale, le choix de la
 * vitesse ne produit aucun tour de parole, et c'est correct : le professeur a
 * DÉJÀ écrit son passage dans le même message, la carte ne fait que décider à
 * quel débit la voix le prononcera. Rien n'attend l'élève.
 *
 * En conversation, j'ai demandé au professeur de poser la question PUIS
 * D'ATTENDRE. Sauf que le clic ne lui envoyait rien : il attendait un signal
 * qui n'arrivait jamais, et l'élève regardait un écran muet.
 *
 * Le choix part donc comme un tour normal — invisible dans la bulle, comme le
 * clic sur le tableau ou le choix du support d'évaluation.
 */
const MARQUEUR_VITESSE =
  '[L’élève a choisi la vitesse. LANCE LA CONVERSATION MAINTENANT : c’est à toi '
  + 'de parler en premier, dans la langue du cours, et de lui poser une question '
  + 'pour qu’il puisse rebondir.]';

const MOTIF_VITESSE = /\n?\[L’élève a choisi la vitesse[^\]]*\]/g;

/** Le tour qui dit au professeur de commencer. */
export function marquerVitesseChoisie() {
  return `C’est bon pour moi.\n${MARQUEUR_VITESSE}`;
}
