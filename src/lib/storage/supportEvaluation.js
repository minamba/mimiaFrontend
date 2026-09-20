/**
 * SUR QUOI L'ÉLÈVE COMPOSE SON ÉVALUATION — voulu par Camara le 18/09/2026.
 *
 * Il s'agit de l'ÉVALUATION DU PROFESSEUR — celle qu'il fait passer en séance,
 * qui commence par [DEBUT_EVALUATION] et se termine par un bloc [EVALUATION]
 * avec une note. RIEN À VOIR avec le contrôle passé à l'école, dont on regarde
 * la copie après coup : celui-là vit dans `copieControle.js`, avec son propre
 * vocabulaire (« [COPIE DU CONTRÔLE n° 42] »). Les deux mots se ressemblent,
 * les mécaniques n'ont rien de commun, et les mélanger ferait réclamer une
 * photo de devoir au milieu d'une interrogation.
 *
 * AVANT DE LANCER L'ÉVALUATION, le professeur regarde ce qu'elle demande et
 * PRÉCONISE un support : le cahier s'il faut tracer des figures, poser une
 * division, dessiner ; l'ordinateur si tout se tape. Puis il écrit
 * `[SUPPORT_EVALUATION]`, et l'écran pose la question à l'élève :
 *
 *   « Sur quoi veux-tu composer ? »  [Mon cahier] [L'ordinateur]
 *
 * LE CHOIX RESTE À L'ENFANT, et c'est explicite dans la demande de Camara :
 * « ce sont juste des préconisations ». Un élève qui préfère son cahier pour
 * une interrogation de conjugaison a le droit ; celui qui veut taper une
 * figure de géométrie aussi, et il découvrira tout seul que c'était une
 * mauvaise idée.
 *
 * POURQUOI LE MÊME MOTIF QUE `copieCahier.js`, ET NON UNE CONSIGNE
 * ---------------------------------------------------------------
 * La leçon est écrite là-bas, et elle a coûté une dictée entière : UNE
 * GARANTIE D'USAGE NE SE DEMANDE PAS, ELLE S'IMPOSE. Le professeur avait
 * toutes les règles dans sa consigne et il a quand même affiché « les deux
 * versions » d'une copie qu'il n'avait jamais reçue.
 *
 * Le support choisi ne part donc pas comme une phrase d'élève — « je prends
 * mon cahier » — que le professeur relirait mille tokens plus loin. Il part
 * comme un FAIT accroché au message, qui dit ce qui est vrai et ce qui en
 * découle, au moment où ça compte.
 */

import { reponseEnAttente } from './fenetreExercice';

/** La balise que le professeur écrit pour déclencher la question. */
const BALISE = /\[SUPPORT_EVALUATION\]/i;

export const CAHIER = 'cahier';
export const ORDINATEUR = 'ordinateur';

export const QUESTION_SUPPORT = 'Sur quoi veux-tu composer ?';

/**
 * LE FAIT DU CAHIER.
 *
 * Il dit les trois choses que le professeur oublierait : le sujet s'affiche en
 * entier au tableau, la copie arrivera en photo et pas autrement, et rien ne
 * se corrige avant.
 *
 * Écrit sur une seule ligne, sans crochet à l'intérieur — c'est ce qui rend le
 * motif de retrait sûr, comme pour la dictée.
 */
const MARQUEUR_CAHIER =
  '[ÉVALUATION AU CAHIER : il compose sur son cahier. Affiche-lui MAINTENANT '
  + 'le sujet ENTIER au tableau, en une seule fois — il pourra faire défiler '
  + 'pour relire les questions du haut. Ne pose pas les questions une par une. '
  + 'Sa copie ne peut te parvenir qu’en PHOTO : tant qu’elle n’est pas arrivée, '
  + 'tu n’as rien à corriger, rien à comparer, et tu ne lui demandes pas de te '
  + 'dire ses réponses à l’oral.]';

/**
 * LE FAIT DE L'ORDINATEUR.
 *
 * Son pendant exact, et pour la même raison qu'à la dictée : relevé le
 * 11/09/2026, le professeur réclamait « la photo de ta page » à un élève qui
 * venait de tout taper sous ses yeux. Il n'a pas de cahier. Il n'y a rien à
 * photographier.
 */
const MARQUEUR_ORDINATEUR =
  '[ÉVALUATION À L’ORDINATEUR : il compose ici, à l’écran. Tu poses '
  + 'les questions une par une, comme d’habitude. Ne lui demande JAMAIS de '
  + 'photo de sa copie : il n’a pas de cahier. S’il joint quand même un '
  + 'document, lis-le et compte-le dans sa note avec ce qu’il t’a répondu à '
  + 'l’écrit et à l’oral.]';

const MOTIF = /\n\[ÉVALUATION (?:AU CAHIER|À L’ORDINATEUR)[^\]]*\]/g;

/** Vrai si le professeur demande à l'élève de choisir son support. */
export function demandeSupport(texte) {
  return BALISE.test(texte ?? '');
}

/** Joint le fait du support au message de l'élève. */
export function marquerSupport(texte, support) {
  const propre = (texte ?? '').trim()
    || (support === CAHIER ? 'Je prends mon cahier.' : 'Je reste sur l’ordinateur.');

  return `${propre}\n${support === CAHIER ? MARQUEUR_CAHIER : MARQUEUR_ORDINATEUR}`;
}

/**
 * Retire le marqueur ET la balise pour l'affichage.
 *
 * Les deux sont écrits POUR LE PROFESSEUR : l'élève a cliqué sur un bouton, il
 * n'a pas récité un état technique, et sa bulle doit montrer ce qu'il a voulu
 * dire. La balise, elle, n'a jamais rien à faire à l'écran.
 */
export function retirerMarqueurSupport(texte) {
  return (texte ?? '').replace(MOTIF, '').replace(BALISE, '').trimEnd();
}

/**
 * Le support de l'évaluation en cours :
 *
 *   - `'cahier'` ou `'ordinateur'` — l'élève a choisi ;
 *   - `null` — la question est posée, sans réponse : c'est le moment d'afficher
 *     la carte ;
 *   - `undefined` — elle n'a jamais été posée.
 *
 * ON REMONTE LE FIL À L'ENVERS, et on s'arrête à la PREMIÈRE balise trouvée :
 * une séance peut porter deux évaluations, et le support de la première
 * n'engage pas la seconde. Si une réponse est passée après cette balise-là,
 * c'est elle qu'on rencontre en premier, et c'est elle qui vaut.
 */
/**
 * LA RÉPONSE DITE À VOIX HAUTE — même défaut que la carte du texte à rédiger,
 * relevé par Camara le 18/09/2026 sur celle-ci : l'élève dit son choix au lieu
 * de cliquer, le professeur le comprend, et la fenêtre reste ouverte parce
 * qu'elle ne lisait que le fait accroché au clic.
 *
 * MÊMES RÈGLES : première réponse seulement, message court, et rien quand ça
 * ne tranche pas. Mêmes bornes Unicode aussi — `\b` ignore les accents et
 * aurait laissé passer « écran » sans le voir.
 */
const ORAL_CAHIER = /(?<!\p{L})(cahier|cachier|papier|feuille|à la main|a la main)(?!\p{L})/iu;
const ORAL_ORDINATEUR = /(?<!\p{L})(ordinateur|ordi|clavier|écran|ecran|taper)(?!\p{L})/iu;

export function lireReponseSupportEvaluation(texte) {
  const dit = (texte ?? '').trim();
  if (!dit || dit.length > 120) return undefined;

  const cahier = ORAL_CAHIER.test(dit);
  const ordinateur = ORAL_ORDINATEUR.test(dit);

  if (cahier === ordinateur) return undefined;

  return cahier ? CAHIER : ORDINATEUR;
}

export function supportChoisi(messages) {
  return reponseEnAttente(messages, {
    lireReponse: (contenu) => {
      if (contenu.includes('[ÉVALUATION AU CAHIER')) return CAHIER;
      if (contenu.includes('[ÉVALUATION À L’ORDINATEUR')) return ORDINATEUR;
      return undefined;
    },
    lireReponseOrale: lireReponseSupportEvaluation,
    pose: demandeSupport,

    // TOUTES LES BALISES DE L’ÉVALUATION, ET PAS SEULEMENT CELLE QUI POSE
    // LA QUESTION : le sujet, la copie et le verdict appartiennent au même
    // exercice. Les oublier ici ferait tomber la carte au moment précis où
    // le professeur commence à composer.
    propres: ['SUPPORT_EVALUATION', 'DEBUT_EVALUATION', 'EVALUATION',
      'EVALUATION_CORRIGEE', 'COPIE_CONTROLE', 'CONTROLE_RESULTAT'],
  });
}

/**
 * L'élève a-t-il rendu quelque chose depuis qu'il compose au cahier ?
 *
 * SERT AU RAPPEL DES DEUX MINUTES, et à lui seul. Camara : « si on approche à
 * 2 minutes de la fin du cours et que le professeur n'a pas reçu sa copie, il
 * préviendra l'élève ». Prévenir celui qui vient de l'envoyer serait le
 * presser pour rien.
 *
 * UNE PIÈCE JOINTE ET NON UN MOT DE L'ÉLÈVE. « J'ai fini » ne vaut pas une
 * copie — c'est exactement l'erreur de la première dictée au cahier, où le
 * professeur a corrigé une page qu'il n'avait jamais vue.
 */
export function copieRendue(messages) {
  const liste = messages ?? [];

  for (let i = liste.length - 1; i >= 0; i -= 1) {
    if (liste[i]?.role === 'assistant' && demandeSupport(liste[i].contenu ?? '')) return false;

    if (liste[i]?.role !== 'user') continue;

    const pieces = liste[i].piecesJointes
      ?? (liste[i].pieceJointe ? [liste[i].pieceJointe] : []);

    if (pieces.length > 0) return true;
  }

  return false;
}
