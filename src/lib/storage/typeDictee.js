/**
 * DES MOTS OU DES PHRASES — voulu par Camara le 01/11/2026.
 *
 * Remonté par un parent : son fils, en CP, révisait l'écriture des nombres de
 * un à cinq. Le professeur a mis ces mots dans des phrases — or un enfant de CP
 * ne sait pas encore écrire une phrase. La dictée de mots existe du CP au
 * collège ; au lycée, une dictée est toujours faite de phrases.
 *
 * LE DÉROULÉ. Avant une nouvelle dictée, le professeur pose la question avec la
 * balise [TYPE_DICTEE], dans un message SANS bloc de dictée. L'écran affiche
 * deux boutons. Le clic (ou la réponse dite à voix haute) part au professeur
 * avec le FAIT de son choix, et c'est le message suivant qui porte la dictée.
 *
 * MÊME CONSTRUCTION QUE `supportEcrit.js`, et pour la même leçon : une garantie
 * d'usage ne se demande pas au modèle. Le choix ne part pas comme une phrase
 * d'élève qu'il relirait mal, il part comme un fait accroché au message.
 *
 * AU LYCÉE, LA CARTE NE S'AFFICHE JAMAIS : le serveur le dit à l'écran
 * (`dicteeAuChoix` de la conversation) et ne demande pas la question au
 * professeur. Si la balise passait quand même, elle serait retirée du texte et
 * de la voix, sans carte dessous.
 *
 * PAS DE CROCHETS DANS LES FAITS : le motif qui les retire de l'affichage
 * s'arrête au premier crochet fermant. Et pas de « [DICTEE] » écrit dedans :
 * l'écran et le serveur y verraient une dictée qui commence.
 */

import { reponseEnAttente } from './fenetreExercice';

/** La balise que le professeur écrit pour déclencher la question. */
const BALISE = /\[TYPE_DICTEE\]/gi;

export const MOTS = 'mots';
export const PHRASES = 'phrases';

export const QUESTION_TYPE_DICTEE = 'Quelle dictée veux-tu faire ?';

/** Les débuts des deux faits, tels que le serveur les relit (TypeDeDictee.cs). */
const DEBUT_MOTS = '[DICTÉE DE MOTS';
const DEBUT_PHRASES = '[DICTÉE DE PHRASES';

const FAIT_MOTS = `${DEBUT_MOTS} : il a choisi une dictée de MOTS. Écris-la dans ton `
  + 'prochain message, comme toute dictée (la question « sur ton cahier ou au '
  + 'clavier ? » puis le bloc), avec UNIQUEMENT des mots seuls : un mot par ligne, '
  + 'chacun suivi d’un point (« un. deux. trois. »), sans aucune phrase autour — ni '
  + 'verbe, ni article ajouté. Les mots viennent de ce qu’il travaille.]';

const FAIT_PHRASES = `${DEBUT_PHRASES} : il a choisi une dictée de PHRASES. Écris-la `
  + 'dans ton prochain message, comme toute dictée (la question « sur ton cahier ou '
  + 'au clavier ? » puis le bloc), en phrases courtes, à la mesure de sa classe.]';

const MOTIF = /\n?\[DICTÉE DE (?:MOTS|PHRASES)[^\]]*\]/g;

/** Vrai si le professeur demande à l'élève de choisir le type de dictée. */
export function demandeTypeDictee(texte) {
  BALISE.lastIndex = 0;
  const pose = BALISE.test(texte ?? '');
  BALISE.lastIndex = 0;
  return pose;
}

/**
 * LA RÉPONSE DITE À VOIX HAUTE, ou tapée au lieu d'être cliquée.
 *
 * `undefined` DÈS QUE ÇA NE TRANCHE PAS — ni l'un ni l'autre, les deux à la
 * fois, ou un message trop long pour être une simple réponse. La carte reste
 * ouverte : on ne devine pas à la place de l'enfant.
 *
 * Les bornes sont des lettres Unicode et non `\b`, qui ne connaît pas les
 * accents (voir `lireReponseSupportEcrit`).
 */
const ORAL_MOTS = /(?<!\p{L})mots?(?!\p{L})/iu;
const ORAL_PHRASES = /(?<!\p{L})phrases?(?!\p{L})/iu;
const REPONSE_COURTE = 120;

export function lireReponseTypeDictee(texte) {
  const dit = (texte ?? '').trim();
  if (!dit || dit.length > REPONSE_COURTE) return undefined;

  const mots = ORAL_MOTS.test(dit);
  const phrases = ORAL_PHRASES.test(dit);

  if (mots === phrases) return undefined;

  return mots ? MOTS : PHRASES;
}

/** Joint le fait du choix au message de l'élève. */
export function marquerTypeDictee(texte, type) {
  const propre = (texte ?? '').trim()
    || (type === MOTS ? 'Une dictée de mots.' : 'Une dictée de phrases.');

  return `${propre}\n${type === MOTS ? FAIT_MOTS : FAIT_PHRASES}`;
}

/** Retire le fait ET la balise pour l'affichage et la voix. */
export function retirerMarqueurTypeDictee(texte) {
  return (texte ?? '').replace(MOTIF, '').replace(BALISE, '').trimEnd();
}

/**
 * « TU PEUX RÉPÉTER LE MOT ? » DIT À VOIX HAUTE PENDANT LA DICTÉE — Camara, le
 * 01/11/2026 : « c'est comme s'il avait cliqué sur Redis le mot ». Relevé en
 * base : la phrase partait au professeur, qui redictait TOUTE la dictée depuis
 * le début. Courte, et qui parle de répéter, redire, ou de ne pas avoir
 * entendu — rien d'autre : « j'ai fini » ou « attends » ne sont pas une redite.
 */
const REDITE = /(?<!\p{L})(r[ée]p[èeé]te|redis|encore(\s+une\s+fois)?|pas\s+(bien\s+)?entendu|pas\s+compris)(?!\p{L})/iu;
const REDITE_COURTE = 80;

export function demandeRedite(texte) {
  const dit = (texte ?? '').trim();
  return dit.length > 0 && dit.length <= REDITE_COURTE && REDITE.test(dit);
}

/** « Une dictée de mots », dit en toutes lettres — même règle que le serveur. */
const DIT_MOTS = /dict[ée]e\s+de\s+mots?(?!\p{L})/iu;
const DIT_PHRASES = /dict[ée]e\s+de\s+phrases?(?!\p{L})/iu;
const OUVERTURE = /\[DICTEE(?::CLAVIER)?\]/i;

function choixDuMessage(contenu) {
  if (contenu.includes(DEBUT_MOTS)) return MOTS;
  if (contenu.includes(DEBUT_PHRASES)) return PHRASES;

  const mots = DIT_MOTS.test(contenu);
  const phrases = DIT_PHRASES.test(contenu);
  if (mots !== phrases) return mots ? MOTS : PHRASES;

  return null;
}

/** À défaut de choix connu, la forme du texte dicté : un mot par morceau. */
function formeDeLaDictee(contenu) {
  const debut = contenu.search(OUVERTURE);
  if (debut < 0) return null;

  const corps = contenu.slice(debut).replace(OUVERTURE, '').split(/\[\/DICTEE\]/i)[0];
  const morceaux = corps.split(/[.!?\n]+/).map((m) => m.trim()).filter(Boolean);
  if (morceaux.length === 0) return null;

  return morceaux.every((m) => m.split(/\s+/).length === 1) ? MOTS : PHRASES;
}

/**
 * LE TYPE DE LA DICTÉE EN COURS, pour ce que dit la voix — « premier mot » ou
 * « première phrase » (Camara, le 01/11/2026).
 *
 * Le choix de l'élève fait foi — clic, ou « une dictée de mots » dit en toutes
 * lettres —, rattaché à la dictée qui le SUIT. Sans choix connu (le professeur
 * la redit, ou un lycéen), c'est la forme du texte dicté qui tranche.
 *
 * @param messages le fil
 * @param enCours  le message du professeur en train d'arriver, s'il y en a un
 * @returns 'mots', 'phrases', ou null tant qu'aucune dictée n'est en vue
 */
export function typeDeLaDictee(messages, enCours) {
  const liste = [
    ...(messages ?? []),
    ...(enCours ? [{ role: 'assistant', contenu: enCours }] : []),
  ];

  let attente = null;
  let type = null;

  liste.forEach((m) => {
    const contenu = m?.contenu ?? '';

    if (m?.role === 'user') {
      const lu = choixDuMessage(contenu);
      if (lu) attente = lu;
    } else if (m?.role === 'assistant' && OUVERTURE.test(contenu)) {
      type = attente ?? formeDeLaDictee(contenu);
      attente = null;
    }
  });

  return type;
}

/**
 * Le type de la dictée qui vient :
 *
 *   - `'mots'` ou `'phrases'` — il a choisi ;
 *   - `null` — la question est posée, sans réponse : la carte s'affiche ;
 *   - `undefined` — elle n'a pas été posée, ou une autre chose a commencé
 *     depuis (la dictée elle-même referme la question).
 */
export function typeDicteeChoisi(messages) {
  const reponse = reponseEnAttente(messages, {
    lireReponse: (contenu) => {
      if (contenu.includes(DEBUT_MOTS)) return MOTS;
      if (contenu.includes(DEBUT_PHRASES)) return PHRASES;
      return undefined;
    },
    lireReponseOrale: lireReponseTypeDictee,
    pose: demandeTypeDictee,
    propres: ['TYPE_DICTEE'],
  });

  // LA QUESTION N'ATTEND PLUS SI LE PROFESSEUR A REPRIS LA PAROLE — Camara,
  // le 01/11/2026 : « Aucun des deux, je voudrais faire de la lecture », le
  // professeur passe à la lecture… et la carte restait affichée sous la
  // phrase à lire. La réponse ne tranchait pas entre mots et phrases, et le
  // tableau de lecture n'est pas une balise qui « ouvre autre chose ». Mais
  // quand le dernier mot du professeur n'est plus la question, c'est qu'elle
  // a été réglée, ou abandonnée : la carte n'a plus rien à demander.
  if (reponse === null) {
    const dernierProf = [...(messages ?? [])].reverse().find((m) => m?.role === 'assistant');
    if (!demandeTypeDictee(dernierProf?.contenu)) return undefined;
  }

  return reponse;
}
