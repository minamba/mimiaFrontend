/**
 * LIRE LA SYLLABE OU LE MOT DE L'IMAGE — Camara, le 07/11/2026 : « le professeur affiche une image avec une syllabe et lui
 * demande de dire à voix haute la syllabe ou le mot ; le professeur ne dit pas la syllabe ou le mot », « c'est vraiment
 * faire l'inverse de l'exercice des syllabes et des mots », « tout est à l'oral ».
 *
 * C'EST LE SERVEUR QUI CHOISIT (voir LectureDImage.cs) : il finit le message du professeur par
 * « [LECTURE_IMAGE:genre]cible[/LECTURE_IMAGE] », jamais affiché ni dit (voir `ardoise.js`). L'écran en tire l'image du
 * tableau :
 *  - syllabe : l'image de la syllabe (« jo » en couleur dans « joker »), dès la question ;
 *  - mot français : le MOT écrit en grand, seul — son dessin ne porte pas le mot, et l'enfant nommerait le dessin sans
 *    lire. Le dessin vient une fois le mot bien lu ;
 *  - anglais : l'image du mot (« sh » en couleur dans « ship »), qui porte le mot écrit.
 *
 * Le jugement est celui de l'écoute, au serveur : la bulle de l'enfant dit « Bonne lecture » ou « On réessaie ».
 */
import { imageDeSyllabe, imageDuMot } from './imagesMots';
import { imageDuSonAnglais, sonDuMot } from './imagesSonsAnglais';
import { imageDuMotAnglais } from './imagesMotsAnglais';
import { imageDuNombre } from './nombresALire';

// LES NOMBRES (12/11/2026) : la lecture des nombres en maths, même balise, genre « nombre » — voir nombresALire.js.
const MARQUEUR = /\[LECTURE_IMAGE:(syllabe|mot|anglais|nombre)\]([^[\]]+)\[\/LECTURE_IMAGE\]/gi;

/** Le motif à retirer de l'affichage et de la voix. */
export const MARQUEUR_LECTURE_IMAGE = /\[LECTURE_IMAGE:[^\]]*\][^[]*\[\/LECTURE_IMAGE\]/gi;

/** Le verdict écrit par le serveur dans le message de l'enfant : « J'ai lu la syllabe jo. », « J'ai lu le nombre 73. » */
export const estVerdictDeLecture = (contenu) => /^\s*j.ai lu (?:le mot|la syllabe|le nombre)\b/i.test(contenu ?? '');

/** Il a lu le mot entier de l'image au lieu de la syllabe en couleur : ni juste, ni faux. */
export const estMotEntierLu = (contenu) => /^\s*j.ai lu la syllabe en disant le mot entier\b/i.test(contenu ?? '');

export const LIBELLE_MOT_ENTIER = 'Seulement la partie en couleur';

/** Le dernier élément à lire de ce message : `{ genre, cible }`, ou null. */
export function aLire(contenu) {
  const trouves = [...(contenu ?? '').matchAll(MARQUEUR)];
  if (trouves.length === 0) return null;
  const dernier = trouves[trouves.length - 1];
  return { genre: dernier[1].toLowerCase(), cible: dernier[2].trim() };
}

/** Ce que montre le tableau pour cet élément : avant la réponse (`lu` faux) ou une fois bien lu. */
export function imageALire(element, eleve, lu = false) {
  if (!element) return null;
  const { genre, cible } = element;

  // UN NOMBRE : son image si elle est déposée, le nombre écrit en grand sinon (voir Chat.js et nombresALire.js).
  if (genre === 'nombre') return { mot: cible, image: imageDuNombre(cible), type: 'nombre' };

  if (genre === 'syllabe') {
    const image = imageDeSyllabe(cible);
    return image ? { mot: cible, image, type: 'syllabe' } : null;
  }

  if (genre === 'anglais') {
    // L'image du MOT (« apple / Pomme », 07/11/2026), celle du son à défaut.
    const imageMot = imageDuMotAnglais(cible);
    if (imageMot) return { mot: cible, image: imageMot, type: 'mot-anglais' };
    const son = sonDuMot(cible, eleve?.niveauCode ?? eleve?.niveauLibelle);
    const image = son ? imageDuSonAnglais(son.son) : null;
    return image ? { mot: cible, image, type: 'son' } : null;
  }

  // UN MOT : écrit en grand tant qu'il n'est pas lu, son dessin ensuite.
  if (!lu) return { mot: cible, image: null, type: 'a-lire' };
  const image = imageDuMot(cible);
  return image ? { mot: cible, image, type: 'mot' } : { mot: cible, image: null, type: 'a-lire' };
}

/**
 * LA CONSIGNE DU CODE, RECONNUE PAR LA VOIX — Camara, le 08/11/2026 : « je dis "ba", il dit bonne réponse et il affiche
 * la prochaine image, une robe, en me donnant l'explication sur le mot ballon ». Le message arrive d'un bloc, sa voix
 * non : le bravo porte sur l'image d'avant, et l'image suivante ne doit venir qu'avec cette phrase. Ce sont les débuts
 * de `LectureDImage.Consigne` (serveur) : les deux se modifient ensemble.
 */
const CONSIGNE_DE_LECTURE = /(?:regarde bien (?:la syllabe|le mot|le nombre)|regarde le tableau|voici une autre image|voici un autre (?:mot|nombre))/i;
const CONSIGNE_AU_DEBUT = new RegExp(`^\\s*${CONSIGNE_DE_LECTURE.source}`, 'i');

/** Cette phrase EST la consigne. */
export const estConsigneDeLecture = (phrase) => CONSIGNE_AU_DEBUT.test(phrase ?? '');

/** Ce passage de la voix la contient : seule, ou derrière un bravo trop court pour partir sans elle. */
export const contientConsigneDeLecture = (passage) => CONSIGNE_DE_LECTURE.test(passage ?? '');

/** Les messages sans la question arrivée après la dernière réponse de l'enfant : le tableau d'avant cette question. */
function sansLaDerniereQuestion(messages) {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i]?.role === 'user') return messages;
    if (messages[i]?.role === 'assistant' && aLire(messages[i].contenu)) return messages.slice(0, i);
  }
  return messages;
}

/**
 * CE QUE LE TABLEAU MONTRE PENDANT L'EXERCICE, ou null hors de lui. Il en est tant que le dernier message du professeur
 * porte une image à lire ; une réponse jugée juste après lui montre la version « lue » (le dessin d'un mot).
 *
 * `retenue` : la voix n'a pas encore commencé la consigne (voir `estConsigneDeLecture`), la nouvelle image attend.
 */
export function lectureAuTableau(messages, eleve, { retenue = false } = {}) {
  const liste = retenue ? sansLaDerniereQuestion(messages ?? []) : (messages ?? []);
  let lu = false;
  let reponse = null;

  for (let i = liste.length - 1; i >= 0; i -= 1) {
    const m = liste[i];
    if (m?.role === 'user') {
      if (!reponse) reponse = m;
      if (m.sonJuste === true && reponse === m) lu = true;
      continue;
    }
    if (m?.role !== 'assistant' || !(m.contenu ?? '').trim()) continue;
    // Une fiche ou un rapport écrit après la question n'est pas la question.
    if (/^\s*\[(?:FICHE|RAPPORT|FIN_SEANCE)\]/i.test(m.contenu)) continue;

    const element = aLire(m.contenu);
    if (!element) return null;

    const montre = imageALire(element, eleve, lu);
    if (!montre) return null;
    return { ...montre, cle: `lecture-${m.id ?? i}-${element.cible}${lu ? '-lu' : ''}` };
  }

  return null;
}
