/**
 * SUR QUOI L'ÉLÈVE ÉCRIT SON TEXTE — voulu par Camara le 18/09/2026 : « il
 * faut sortir la fenêtre de choix si l'élève veut le faire sur son cahier ou
 * au clavier, comme pour la dictée ».
 *
 * TROISIÈME FOIS QUE CETTE QUESTION SE POSE, ET C'EST NORMAL. La dictée
 * l'avait déjà (`copieCahier.js`), l'évaluation aussi depuis le 17/09
 * (`supportEvaluation.js`), et l'expression écrite la pose pour la même
 * raison : dès qu'un enfant ÉCRIT quelque chose de long, il a le droit de
 * choisir son support, et le professeur doit savoir lequel.
 *
 * POURQUOI UN TROISIÈME FICHIER PLUTÔT QU'UN SEUL PARTAGÉ. Les trois exercices
 * ne disent pas la même chose au professeur. Pour une dictée, il ne doit rien
 * afficher au tableau ; pour une évaluation, il doit afficher le sujet ENTIER ;
 * ici, il doit attendre le texte avant de corriger quoi que ce soit, et
 * RECOPIER la copie papier dans son bloc d'archive. Un marqueur commun aurait
 * dit trois choses à la fois, donc aucune clairement.
 *
 * LA LEÇON QUI LES RÉUNIT, elle, est la même — et elle a coûté une dictée
 * entière : UNE GARANTIE D'USAGE NE SE DEMANDE PAS, ELLE S'IMPOSE. Le choix ne
 * part pas comme une phrase d'élève que le professeur relirait mille tokens
 * plus loin, il part comme un FAIT accroché au message.
 */

import { reponseEnAttente } from './fenetreExercice';

/** La balise que le professeur écrit pour déclencher la question. */
const BALISE = /\[SUPPORT_ECRIT\]/i;

/**
 * LA CONSIGNE AU TABLEAU VAUT LA BALISE — Camara, le 18/09/2026 : « pourquoi
 * la copie n'apparaît toujours pas ? »
 *
 * CE QUI S'ÉTAIT PASSÉ. Le professeur a repris un texte d'une séance
 * précédente — « on reprend l'expression écrite, je te remets la consigne » —
 * et il a enchaîné droit sur « vas-y, tape ton texte directement ici ». Il n'a
 * jamais réécrit [SUPPORT_ECRIT], donc rien n'a ouvert la feuille, donc chaque
 * phrase tapée partait comme un message ordinaire.
 *
 * UNE RÈGLE DE PROMPT NE VAUT PAS UN FAIT, et c'est la leçon la plus chère de
 * ce produit. On peut écrire dix fois « écris la balise avant la consigne » :
 * un modèle qui se croit au milieu d'un exercice déjà commencé ne la réécrit
 * pas. Il faut un SECOND chemin, qui ne dépende pas de sa mémoire.
 *
 * CE CHEMIN EST LE TABLEAU. La consigne impose au professeur d'y écrire la
 * consigne du texte sous le titre « La consigne » avant que l'élève écrive —
 * c'est structurel, pas une tournure de phrase, et c'est vérifiable.
 *
 * ET « Ton texte » L'EXCLUT, parce que c'est le tableau de la CORRECTION : là,
 * le texte est déjà écrit, et rouvrir une feuille vide au moment où le
 * professeur corrige serait pire que de n'en ouvrir aucune.
 */
const ARDOISE = /\[ARDOISE\]([\s\S]*?)\[\/ARDOISE\]/gi;
const TITRE_CONSIGNE = /^[ \t]*la\s+consigne[ \t]*:?[ \t]*$/im;
const TITRE_TON_TEXTE = /^[ \t]*ton\s+texte[ \t]*:?[ \t]*$/im;

export const CAHIER = 'cahier';
export const CLAVIER = 'clavier';

export const QUESTION_SUPPORT_ECRIT = 'Comment veux-tu écrire ton texte ?';

/**
 * LE FAIT DU CAHIER.
 *
 * LA RETRANSCRIPTION AU TABLEAU VIENT AVANT LA CORRECTION, ET NON À
 * L'ARCHIVAGE — Camara, le 18/09/2026 : « pour la photo uploadée, elle doit
 * être retranscrite telle quelle pour que le professeur puisse faire la
 * correction. La correction se fait au tableau. »
 *
 * JE L'AVAIS MISE À LA FIN, et c'était le mauvais moment : une correction
 * qui pointe un texte que l'enfant n'a pas sous les yeux ne pointe rien. Sur
 * son cahier, son texte est sur du papier à côté de l’écran ; au tableau, il
 * reste affiché pendant toute la correction.
 */
const MARQUEUR_CAHIER =
  '[TEXTE AU CAHIER : il écrit sur son cahier. Sa copie ne peut te parvenir '
  + 'qu’en PHOTO — tant qu’elle n’est pas arrivée, tu n’as rien à corriger et tu '
  + 'ne lui demandes pas de te dire son texte à l’oral. QUAND ELLE ARRIVE, ET '
  + 'AVANT DE CORRIGER QUOI QUE CE SOIT, retranscris son texte AU TABLEAU sous '
  + '« Ton texte », mot pour mot, fautes comprises : c’est là que la correction '
  + 'va s’accrocher, et c’est ce même texte qui ira dans ton bloc d’archive.]';

/**
 * LE FAIT DU CLAVIER.
 *
 * Son pendant exact, et pour la même raison qu'à la dictée : relevé le
 * 11/09/2026, le professeur réclamait « la photo de ta page » à un élève qui
 * venait de tout taper sous ses yeux.
 */
const MARQUEUR_CLAVIER =
  '[TEXTE AU CLAVIER : une feuille s’ouvre devant lui, il écrit ligne par ligne et clique sur « Envoyer mon texte » quand il a fini. TU NE RECEVRAS RIEN AVANT : son silence veut dire qu’il écrit, pas qu’il est bloqué. Ne le relance pas, ne lui redemande pas son texte, n’écris rien tant qu’il n’a pas envoyé. Ne lui demande JAMAIS de photo non plus : il n’a pas de cahier. Quand son texte arrive, remets-le AU TABLEAU sous « Ton texte », à l’identique, AVANT de corriger : dans le fil il sera remonté hors de vue, au tableau il reste affiché pendant toute la correction.]';

const MOTIF = /\n\[TEXTE (?:AU CAHIER|AU CLAVIER)[^\]]*\]/g;

/** Vrai si le professeur demande à l'élève de choisir son support. */
export function demandeSupportEcrit(texte) {
  const message = texte ?? '';

  if (BALISE.test(message)) return true;

  // `matchAll` sur un motif global : on le relit à chaque appel, donc pas de
  // `lastIndex` qui traîne d'un message à l'autre.
  for (const tableau of message.matchAll(ARDOISE)) {
    const contenu = tableau[1] ?? '';

    if (TITRE_CONSIGNE.test(contenu) && !TITRE_TON_TEXTE.test(contenu)) return true;
  }

  return false;
}

/** Joint le fait du support au message de l'élève. */
export function marquerSupportEcrit(texte, support) {
  const propre = (texte ?? '').trim()
    || (support === CAHIER ? 'J’écris sur mon cahier.' : 'J’écris au clavier.');

  return `${propre}\n${support === CAHIER ? MARQUEUR_CAHIER : MARQUEUR_CLAVIER}`;
}

/** Retire le marqueur ET la balise pour l'affichage. */
export function retirerMarqueurSupportEcrit(texte) {
  return (texte ?? '').replace(MOTIF, '').replace(BALISE, '').trimEnd();
}

/**
 * Le support du texte en cours :
 *
 *   - `'cahier'` ou `'clavier'` — il a choisi ;
 *   - `null` — la question est posée, sans réponse : la carte s'affiche ;
 *   - `undefined` — elle n'a jamais été posée.
 *
 * On remonte le fil à l'envers et on s'arrête à la première balise : deux
 * textes dans une séance posent deux fois la question, et le support du
 * premier n'engage pas le second.
 */
export function supportEcritChoisi(messages) {
  return reponseEnAttente(messages, {
    lireReponse: (contenu) => {
      if (contenu.includes('[TEXTE AU CAHIER')) return CAHIER;
      if (contenu.includes('[TEXTE AU CLAVIER')) return CLAVIER;
      return undefined;
    },
    pose: demandeSupportEcrit,
    propres: ['SUPPORT_ECRIT', 'EXPRESSION_ECRITE'],
  });
}

/**
 * LE RANG DE LA QUESTION POSÉE : la première de la séance vaut 1, la deuxième 2.
 * Zéro si elle ne l'a jamais été.
 *
 * SERT D'IDENTITÉ AU PANNEAU D'ÉCRITURE, et c'est tout son intérêt : l'élève
 * rend son texte, le panneau se ferme, et `supportEcritChoisi` vaut toujours
 * `clavier` — sans quoi le panneau se rouvrirait aussitôt, vide, sur un texte
 * déjà envoyé. En comparant le rang rendu au rang courant, on sait lequel est
 * fini et lequel ne l'est pas.
 *
 * UN COMPTE ET NON L'INDEX DU MESSAGE : la leçon est déjà payée sur la carte
 * des vitesses, le 18/09/2026. Un message du professeur arrive d'abord en FLUX
 * puis se range dans l'historique — son index n'existe pas encore pendant qu'il
 * s'écrit, et l'identité changeait au moment où il se rangeait. Le compte, lui,
 * vaut pareil des deux côtés de ce passage.
 */
export function rangSupportEcrit(messages) {
  return (messages ?? []).filter(
    (m) => m?.role === 'assistant' && demandeSupportEcrit(m.contenu ?? ''),
  ).length;
}
