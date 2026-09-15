/**
 * LES TROIS DÉCISIONS QUI GOUVERNENT UNE DICTÉE.
 *
 * POURQUOI CE FICHIER EXISTE
 * --------------------------
 * Elles vivaient au milieu d'un composant de trois mille six cents lignes,
 * mêlées au micro, au tableau, au minuteur et au défilement. Impossible à
 * éprouver autrement qu'en faisant une dictée à la main — et le 11/09/2026,
 * trois régressions de suite ont traversé la journée sans qu'aucun test ne
 * bronche :
 *
 * 1. la question du support revenait au milieu d'une dictée, parce qu'on la
 *    croyait finie dès que la copie partait ;
 * 2. l'état d'une dictée jamais corrigée survivait à la suivante, qui héritait
 *    d'un cahier que l'élève n'avait pas choisi ;
 * 3. la dictée se refermait DANS LA SECONDE suivant le clic — le test « est-ce
 *    une nouvelle dictée ? » se retournait contre celle qu'on venait d'ouvrir.
 *
 * Les trois sont des fonctions de quelques lignes. Sorties ici, elles se
 * vérifient en une milliseconde, et la troisième n'aurait jamais atteint
 * l'écran.
 *
 * Rien de React ici : des entrées, une sortie, aucun effet.
 */

import { ouvreUneNouvelleDictee } from './comparaisonDictee';

/**
 * La question « cahier ou clavier ? » doit-elle s'afficher ?
 *
 * Quatre conditions, et chacune vient d'un défaut constaté :
 *
 * - une dictée doit être en cours, évidemment ;
 * - le mode ne doit pas déjà avoir été choisi POUR CE TOUR — sinon la carte
 *   reparaît à chaque fragment reçu ;
 * - la copie clavier doit être fermée — tant qu'elle est ouverte, l'élève
 *   écrit, et lui redemander son support n'aurait aucun sens ;
 * - la dictée ne doit pas être ouverte — rendre sa copie ne termine pas une
 *   dictée, seule la correction le fait.
 */
export function carteDeChoixVisible({
  dicteeCourante, tourDuMode, tourEleve, copieOuverte, dicteeOuverte,
}) {
  return Boolean(dicteeCourante)
    && tourDuMode !== tourEleve
    && !copieOuverte
    && !dicteeOuverte;
}

/**
 * Où commence la dictée qu'on vient de choisir, dans le fil des messages.
 *
 * Le message qui la porte est soit encore en train d'arriver — il prendra
 * donc la place suivante —, soit déjà le dernier versé au fil.
 *
 * Ce repère borne tout le reste : sans lui, le calcul des passages manquants
 * remonte aux dictées précédentes et réclame leurs phrases.
 */
export function debutDeDictee({ dicteeDansLeFlux, nombreMessages, indexDernierProf }) {
  return dicteeDansLeFlux ? nombreMessages : Math.max(0, indexDernierProf);
}

/**
 * Qu'est-ce qui met fin à la dictée en cours ?
 *
 * - `"correction"` : le professeur a rendu la copie corrigée ;
 * - `"abandon"` : l'élève est parti avant de rendre sa copie — le serveur a
 *   annulé la dictée, et l'écran ne doit pas rouvrir une copie morte ;
 * - `"nouvelle"` : il repart sur un texte inédit, celle-ci est abandonnée ;
 * - `null` : rien, elle continue — y compris quand il relit un passage.
 */
export function finDeDictee({
  dicteeOuverte,
  correctionArrivee,
  abandonArrive = false,
  passageArrivant,
  dejaDicte,
  indexDernierProf,
  debutDictee,
  dicteeDansLeFlux,
}) {
  if (!dicteeOuverte) return null;
  if (correctionArrivee) return 'correction';

  // Relevé dans la spécification du 11/09/2026 : un élève qui quitte pendant
  // la dictée la voit annulée. Sans cette sortie, la copie gardée par le
  // navigateur (deux heures) se rouvrait à son retour, pour une dictée que le
  // professeur venait de déclarer perdue.
  if (abandonArrive) return 'abandon';

  // LE MESSAGE QUI A OUVERT CETTE DICTÉE N'EN OUVRE PAS UNE AUTRE.
  //
  // Sans cette garde, le test tournait sur la dictée qu'on venait de choisir :
  // « déjà dicté » était vide, son texte passait pour inédit, et la copie
  // disparaissait dans la seconde suivant le clic.
  if (indexDernierProf <= debutDictee && !dicteeDansLeFlux) return null;

  if (!passageArrivant) return null;

  // Rien d'antérieur dans cette dictée : ce passage EST la dictée en cours.
  if (!dejaDicte) return null;

  return ouvreUneNouvelleDictee(passageArrivant, dejaDicte) ? 'nouvelle' : null;
}

/**
 * Le tableau doit-il rester vide ?
 *
 * TANT QUE LA COPIE N'EST PAS RENDUE, OUI. Le texte dicté écrit au tableau,
 * face à une copie en cours, et il n'y a plus de dictée : l'enfant recopie ce
 * qu'il a sous les yeux. C'est arrivé le 11/09/2026.
 *
 * DÈS QU'ELLE EST RENDUE, NON — c'est même là que le tableau sert : le
 * professeur y pose le texte dicté et, dessous, la copie de l'élève (tapée,
 * ou retranscrite de sa photo), et la correction se fait devant les deux.
 *
 * Trois moments verrouillent :
 * - la question du support est posée — la dictée est arrivée, rien n'est
 *   encore écrit ;
 * - la copie clavier est ouverte ;
 * - le cahier attend sa photo.
 */
export function tableauVerrouille({
  carteDeChoix, dicteeOuverte, copieClavierOuverte, cahierEnAttente,
}) {
  if (carteDeChoix) return true;
  if (!dicteeOuverte) return false;
  return Boolean(copieClavierOuverte || cahierEnAttente);
}
