import { FIN_SEANCE } from './ardoise';
import { ouvreAutreChose } from './fenetreExercice';

/**
 * L'ÉNONCÉ SEUL, POUR SE FAIRE EXPLIQUER UN EXERCICE.
 *
 * Voulu par Camara le 20/09/2026 : « il se peut qu'un enfant te demande
 * d'uploader l'énoncé et uniquement l'énoncé pour que tu lui expliques un
 * exercice ou plusieurs exercices. Dans ce cas-là tu afficheras une fenêtre de
 * choix avec deux boutons, le bouton d'importation de l'énoncé et le bouton du
 * scan de l'énoncé. Après l'envoi du ou des documents, le professeur demandera
 * à l'élève sur quel exercice il a bloqué. »
 *
 * RIEN À VOIR AVEC LA COPIE D'UN CONTRÔLE — `copieControle.js` — et les deux
 * ne doivent jamais se confondre. Là-bas, l'enfant montre ce qu'il a RENDU, on
 * attend l'énoncé ET sa copie, et rien ne s'analyse avant d'avoir tout reçu.
 * Ici il ne montre QUE le sujet, il n'a rien écrit, et il vient chercher une
 * explication. Réclamer sa copie n'aurait aucun sens : elle n'existe pas.
 *
 * LA FENÊTRE EST OUVERTE PAR LE PROFESSEUR, jamais par l'enfant tout seul :
 * c'est lui qui reconnaît « je bloque sur un exercice, je t'envoie le sujet »
 * et pose [ENONCE_EXERCICE]. L'écran affiche alors la carte à deux boutons.
 *
 * ELLE SE REFERME COMME LES AUTRES : une pièce reçue, un autre exercice
 * ouvert, ou la fin de la séance. Voir `fenetreExercice.js` — la leçon de la
 * carte de vitesse restée à l'écran trois exercices durant.
 *
 * PLUSIEURS PAGES SONT PRÉVUES : « du ou des documents ». L'enfant peut
 * envoyer les deux pages d'un sujet, ou scanner plusieurs feuilles — la liste
 * de pièces du message s'en charge, comme partout ailleurs.
 */

/** La balise que le professeur écrit pour ouvrir la fenêtre. */
export const ENONCE_EXERCICE = '[ENONCE_EXERCICE]';

/**
 * Elle peut porter le numéro du contrôle dont il s'agit :
 * `[ENONCE_EXERCICE] controle: 5 [/ENONCE_EXERCICE]`. Sans numéro, c'est un
 * exercice ordinaire — un devoir maison, une page de manuel.
 */
const BALISE = /\[ENONCE_EXERCICE\](?:\s*controle\s*:\s*(\d+)\s*\[\/ENONCE_EXERCICE\])?/i;

export const QUESTION_CHOIX = 'Qu’est-ce que tu veux m’envoyer ?';

export const CHOIX_SEUL = 'seul';
export const CHOIX_AVEC_COPIE = 'avec-copie';

/**
 * LE MESSAGE ENVOYÉ QUAND IL VEUT AUSSI SA COPIE.
 *
 * Ce choix-là, contrairement à l'autre, part au professeur — Camara, le
 * 20/09/2026 : « sinon on aura l'autre fenêtre de choix qui demandera si la
 * copie et l'énoncé sont séparés, qui est un workflow qui existe déjà ».
 *
 * Or ce workflow s'ouvre sur [COPIE_CONTROLE], que SEUL le professeur peut
 * écrire. Le clic doit donc lui parvenir. Il part comme une phrase d'élève
 * — c'est vraiment ce que l'enfant vient de dire — accompagnée du fait qui
 * garantit la balise : sans lui, le professeur répondrait « d'accord » sans
 * rien ouvrir, et l'enfant resterait devant un écran vide.
 *
 * LE CHOIX « SEULEMENT L'ÉNONCÉ » NE PART PAS, LUI : l'écran sait déjà quoi
 * afficher, et un aller-retour au modèle pour une question déjà répondue se
 * paie en jetons comme en secondes d'attente.
 */
export function marquerAvecCopie(controleId = null) {
  const numero = controleId ? ` controle: ${controleId}` : '';

  return 'Je veux t’envoyer l’énoncé et ma copie.\n'
    + `[IL VEUT ENVOYER LES DEUX : écris [COPIE_CONTROLE]${numero} dans ta réponse — `
    + 'c\'est ce bloc qui lui affiche la question « L\'énoncé et ta copie sont-ils '
    + 'séparés ? » et les boutons d\'envoi. Une phrase courte suffit à côté. '
    // SANS CETTE LIGNE, IL ÉCRIVAIT LES DEUX — quatre tours de suite le
    // 20/09/2026 : le mot « énoncé » de la phrase ci-dessus lui faisait
    // rouvrir [ENONCE_EXERCICE], la fenêtre de choix se réaffichait, et
    // l'enfant recliquait sur le même bouton indéfiniment.
    + 'N\'ÉCRIS PAS [ENONCE_EXERCICE] : il a déjà choisi, cette fenêtre-là est '
    + 'fermée et la rouvrir lui reposerait la question à laquelle il vient de '
    + 'répondre.]';
}

/**
 * ANCRÉ SUR LA LIGNE, ET PAS SUR LES CROCHETS.
 *
 * Les autres marqueurs de l'application s'interdisent tout crochet à
 * l'intérieur, ce qui rend leur retrait sûr (`[^\]]*`). Celui-ci ne peut pas :
 * il NOMME deux balises, [COPIE_CONTROLE] et [ENONCE_EXERCICE], et c'est tout
 * son intérêt. Un motif qui compte les crochets s'arrêtait donc au premier
 * fermant et laissait la fin de la phrase dans la bulle de l'enfant.
 *
 * Le marqueur tient sur UNE ligne, posée seule à la fin du message : la fin de
 * ligne le délimite sans ambiguïté, quel que soit ce qu'il cite.
 */
const AVEC_COPIE_MOTIF = /\[IL VEUT ENVOYER LES DEUX[^\n]*/i;

/** Le marqueur du choix « les deux », retiré de l'affichage. */
export function retirerMarqueurAvecCopie(texte) {
  return (texte ?? '')
    .replace(/\n?\[IL VEUT ENVOYER LES DEUX[^\n]*/gi, '')
    .replace(/\n?\[IL REVIENT SUR SON CHOIX[^\n]*/gi, '')
    .trim();
}

const RETOUR_MOTIF = /\[IL REVIENT SUR SON CHOIX[^\n]*/i;

/**
 * IL S'EST TROMPÉ DE BOUTON — Camara, le 20/09/2026 : « si l'enfant s'est
 * trompé sur son choix, faudrait lui permettre de revenir en arrière et de
 * faire un autre choix ».
 *
 * REVENIR DEPUIS « TA COPIE ET L'ÉNONCÉ » COÛTE UN TOUR, et c'est inévitable :
 * ce chemin-là a déjà ouvert la fenêtre de la copie chez le professeur, et lui
 * seul peut la refermer. Le retour part donc comme une phrase d'élève, avec le
 * fait qui la referme — symétrique de `marquerAvecCopie`.
 *
 * Le chemin inverse, lui, est gratuit : « Juste l'énoncé » n'a jamais quitté
 * le navigateur, et le bouton « Changer » repose simplement la question.
 */
export function marquerRetourChoix() {
  return 'Finalement, je veux juste t’envoyer l’énoncé.\n'
    + '[IL REVIENT SUR SON CHOIX : il s’était trompé de bouton, il N’A PAS de copie '
    + 'à envoyer. N’écris PLUS [COPIE_CONTROLE] et cesse de réclamer sa copie. '
    + 'Écris [ENONCE_EXERCICE] pour lui rouvrir le choix.]';
}

/**
 * Le choix « ta copie et l'énoncé » est-il encore celui qui vaut ?
 *
 * Sert à proposer le retour, et seulement là : on ne met pas de bouton
 * « changer » sur la fenêtre de copie d'un bilan ordinaire, où l'enfant n'a
 * jamais fait de choix.
 *
 * On remonte jusqu'au premier marqueur de l'enfant, quel qu'il soit : c'est le
 * dernier mot qu'il a dit sur la question.
 */
export function choixAvecCopieActif(messages) {
  const liste = messages ?? [];

  for (let i = liste.length - 1; i >= 0; i -= 1) {
    if (liste[i]?.role !== 'user') continue;

    const texte = liste[i].contenu ?? '';

    if (RETOUR_MOTIF.test(texte)) return false;
    if (porteUnEnonce(texte)) return false;
    if (AVEC_COPIE_MOTIF.test(texte)) return true;
  }

  return false;
}

/**
 * Le marqueur accroché au message qui porte l'énoncé.
 *
 * EN FRANÇAIS ET LISIBLE TEL QUEL, comme « [ÉNONCÉ DU CONTRÔLE n° 42] » : le
 * professeur le relit dans l'historique sans dictionnaire.
 *
 * IL DIT AUSSI CE QU'IL FAUT FAIRE, et ce n'est pas un hasard — c'est la règle
 * apprise à la dictée : une garantie d'usage ne se demande pas dans une
 * consigne relue mille tokens plus loin, elle s'impose au moment où elle
 * compte. Le professeur a devant lui un sujet entier et aucune question ; sans
 * ce rappel, il se met à expliquer l'exercice 1 alors que l'enfant bloque sur
 * le 4.
 *
 * AUCUN MOT QUI DÉCLENCHE UN EXERCICE DE LANGUE ici — ni « rédaction », ni
 * « expression », ni « conversation » : ce texte part avec le message de
 * l'élève et traverse `DetecteurExercicesLangue`, qui chargerait alors des
 * milliers de jetons de consignes pour rien. Voir la note de ce détecteur.
 */
export const MARQUEUR =
  '[ÉNONCÉ SEUL : il t\'envoie le sujet, et RIEN de ce qu\'il a fait — '
  + 'il n\'a pas de copie à montrer, ne lui en demande pas. '
  + 'AVANT D\'EXPLIQUER QUOI QUE CE SOIT, demande-lui sur quel exercice il a '
  + 'bloqué : le sujet en compte plusieurs et tu ignores lequel lui résiste.]';

/**
 * DEUX MOTIFS POUR LE MÊME MARQUEUR, ET C'EST NÉCESSAIRE.
 *
 * Le drapeau `g` sert au retrait — plusieurs marqueurs peuvent traîner dans un
 * historique relu — mais un motif global GARDE SA POSITION entre deux appels
 * de `test()`. Partagé, il répondait vrai puis faux sur le même message, une
 * fois sur deux, et la fenêtre se rouvrait toute seule. Attrapé par le test
 * du 20/09/2026, jamais en séance : c'est exactement le genre de défaut qui
 * ne se voit qu'une fois en production.
 */
const MARQUEUR_RETRAIT = /\n?\[ÉNONCÉ SEUL[^\]]*\]/gi;
const MARQUEUR_MOTIF = /\[ÉNONCÉ SEUL[^\]]*\]/i;

export const QUESTION_ENONCE = 'Envoie l’énoncé de ton exercice.';

export const AIDE_ENONCE =
  'Une photo ou un PDF, autant de pages que nécessaire. Ton professeur te '
  + 'demandera ensuite sur quel exercice tu bloques.';

/** Le message qui accompagne l'énoncé envoyé depuis la carte. */
export function marquerEnonce(texte = '') {
  return `${texte}\n${MARQUEUR}`.trim();
}

/** Le marqueur retiré, pour l'affichage et pour la lecture à voix haute. */
export function retirerMarqueurEnonce(texte) {
  return (texte ?? '').replace(MARQUEUR_RETRAIT, '').trim();
}

/** Ce message porte-t-il un énoncé envoyé par l'enfant ? */
export function porteUnEnonce(texte) {
  return MARQUEUR_MOTIF.test(texte ?? '');
}

/**
 * LA FENÊTRE EST-ELLE OUVERTE, ET SUR QUOI PORTE-T-ELLE ?
 *
 * Relue à l'envers depuis la fin du fil, et on s'arrête à la PREMIÈRE réponse
 * — c'est ce qui fait qu'une fenêtre d'hier ne rouvre pas aujourd'hui.
 *
 * Rend `{ cle, controleId }` tant que le professeur a ouvert la fenêtre et que
 * l'enfant n'a ni envoyé son énoncé, ni demandé l'autre chemin ; `null` sinon.
 *
 * `cle` identifie CETTE ouverture-là : c'est elle qui porte le choix de
 * l'enfant, comme `choixCopie` porte le sien. Deux demandes dans la même
 * séance ne partagent donc pas leur réponse.
 */
/**
 * L'enfant a-t-il demandé les deux juste avant ce message du professeur ?
 *
 * On remonte jusqu'à sa dernière prise de parole, et à elle seule : ce qu'il
 * a demandé il y a cinq tours ne dit rien de ce qu'il veut maintenant.
 */
function aDemandeLesDeux(liste, indexProfesseur) {
  for (let i = indexProfesseur - 1; i >= 0; i -= 1) {
    if (liste[i]?.role !== 'user') continue;

    return AVEC_COPIE_MOTIF.test(liste[i].contenu ?? '');
  }

  return false;
}

export function etatEnonce(messages) {
  const liste = messages ?? [];

  for (let i = liste.length - 1; i >= 0; i -= 1) {
    const message = liste[i];
    const texte = message?.contenu ?? '';

    if (message?.role === 'user') {
      // L'énoncé est arrivé, ou l'enfant a demandé l'autre chemin : dans les
      // deux cas la fenêtre a fait son travail.
      if (porteUnEnonce(texte) || AVEC_COPIE_MOTIF.test(texte)) return null;
      continue;
    }

    if (texte.includes(FIN_SEANCE)) return null;

    const balise = BALISE.exec(texte);
    if (balise) {
      // LES DEUX BALISES DANS LE MÊME MESSAGE : C'EST LA DEMANDE DE L'ENFANT
      // QUI TRANCHE, PAS L'ORDRE DES BALISES.
      //
      // Le professeur écrit très souvent [ENONCE_EXERCICE] ET [COPIE_CONTROLE]
      // ensemble — quatre tours de suite le 20/09/2026. Départager par une
      // règle fixe se trompe une fois sur deux, parce que les deux cas
      // existent :
      //
      //   - l'enfant a dit n'avoir AUCUNE copie, et le professeur réclame la
      //     copie par vieux réflexe : la fenêtre de l'énoncé doit gagner ;
      //   - l'enfant vient de cliquer « Ta copie et l'énoncé », et le
      //     professeur rouvre l'énoncé parce que le mot y est : c'est la
      //     COPIE qui doit gagner, sinon la fenêtre de choix se réaffiche à
      //     l'identique et on tourne en rond — exactement ce qui s'est passé.
      //
      // On regarde donc ce que l'enfant a demandé juste avant.
      if (aDemandeLesDeux(liste, i)) return null;

      if (ouvreAutreChose(texte, ['ENONCE_EXERCICE', 'COPIE_CONTROLE'])) return null;

      return {
        cle: `enonce:${i}`,
        controleId: balise[1] ? Number(balise[1]) : null,
      };
    }

    // Un autre exercice ouvert depuis referme la fenêtre.
    if (ouvreAutreChose(texte, ['ENONCE_EXERCICE'])) return null;
  }

  return null;
}

/**
 * LES TROIS BOUTONS DE LA CARTE — Camara, le 20/09/2026.
 *
 * Trois gestes, parce qu'un énoncé arrive de trois endroits différents et
 * qu'aucun ne couvre les deux autres :
 *
 *   - FICHIER : le sujet est déjà numérique, envoyé par le professeur de
 *     l'école ou téléchargé d'un manuel. Rien à photographier.
 *   - PHOTO : la feuille est là, l'ordinateur a une caméra — on la montre
 *     sans sortir le téléphone.
 *   - SCAN : la feuille est là et l'ordinateur n'a pas de caméra, ou l'enfant
 *     travaille sur téléphone. Le QR code prend le relais, ou l'appareil
 *     photo natif s'il est déjà sur mobile.
 *
 * Le bouton PHOTO s'efface quand aucune caméra n'est branchée : proposer un
 * geste impossible est pire que de ne pas le proposer.
 */
export function boutonsEnonce({ cameraDispo = false } = {}) {
  const boutons = [
    { cle: 'importer-enonce', libelle: 'Importer l’énoncé', geste: 'fichier' },
  ];

  if (cameraDispo) {
    boutons.push({ cle: 'photo-enonce', libelle: 'Prendre en photo', geste: 'photo' });
  }

  boutons.push({ cle: 'scanner-enonce', libelle: 'Scanner l’énoncé', geste: 'scan' });

  return boutons;
}
