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
  '[TEXTE AU CAHIER : il écrit sur son cahier. ÉCRIS LA CONSIGNE AU TABLEAU '
  + 'DANS CE MESSAGE, sous le titre « La consigne », si elle n’y est pas déjà : '
  + 'il va l’écrire en la regardant. Sa copie ne peut te parvenir '
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
  '[TEXTE AU CLAVIER : une feuille s’ouvre devant lui, il écrit ligne par ligne et clique sur « Envoyer mon texte » quand il a fini. ÉCRIS LA CONSIGNE AU TABLEAU DANS CE MESSAGE, sous le titre « La consigne », si elle n’y est pas déjà : il l’écrit en la regardant. TU NE RECEVRAS RIEN AVANT : son silence veut dire qu’il écrit, pas qu’il est bloqué. Ne le relance pas, ne lui redemande pas son texte, n’écris rien tant qu’il n’a pas envoyé. Ne lui demande JAMAIS de photo non plus : il n’a pas de cahier. Quand son texte arrive, remets-le AU TABLEAU sous « Ton texte », à l’identique, AVANT de corriger : dans le fil il sera remonté hors de vue, au tableau il reste affiché pendant toute la correction.]';

/**
 * LE FAIT DU TEXTE RENDU — accroché au message qui l'apporte, au clavier comme
 * en photo.
 *
 * LE DÉFAUT QU'IL CORRIGE — Camara, le 18/09/2026, en pleine correction :
 * « j'ai toujours rien, j'ai pas les badges comme sur la dictée ». Le
 * professeur corrigeait point par point, à l'oral, sans jamais surligner.
 *
 * DEUX CAUSES, ET LA PREMIÈRE ÉTAIT DE MOI : la consigne disait de ne rien
 * marquer au premier tableau et de surligner sur le SUIVANT. Or il n'y a pas
 * de suivant — le professeur reprend les points un par un sans refaire le
 * tableau. La seconde est la leçon de toujours : c'était une consigne, et une
 * consigne écrite à trois mille lignes de là ne pèse rien au moment où il
 * reçoit la copie.
 *
 * LA DICTÉE, ELLE, N'A PAS CE PROBLÈME : ses badges sont calculés, et le fait
 * de la copie part avec le message de l'enfant. On fait pareil — la consigne
 * arrive AU MOMENT où elle sert, collée au texte qu'elle concerne.
 *
 * LE MOT « DICTÉE » N'Y FIGURE PLUS — corrigé le 19/09/2026. Ce rappel reste
 * dans l'historique, et le serveur y cherche quels exercices charger : « comme
 * une dictée corrigée » faisait charger les consignes complètes de la dictée,
 * ~11 600 jetons relus à chaque tour, pendant toute une expression écrite.
 */
const MARQUEUR_RENDU =
  '[TEXTE RENDU : voici son texte. AVANT TOUT AUTRE MOT, écris-le AU TABLEAU '
  + 'sous « La consigne » puis « Ton texte », mot pour mot, fautes comprises — '
  + 'et encadre de deux signes égal chaque mot que tu vas reprendre : ==frend==. '
  + 'Trois ou quatre mots, pas davantage. L’écran les surligne et les numérote ; '
  + 'tu les reprends ensuite un par un, dans l’ordre, À L’ORAL — « regarde le mot 1 » — '
  + 'sans réécrire ce tableau pendant la correction.]';

/** Joint le fait du texte rendu au message qui l'apporte. */
export function marquerTexteRendu(texte) {
  return `${(texte ?? '').trim()}\n${MARQUEUR_RENDU}`;
}

const MOTIF = /\n\[TEXTE (?:AU CAHIER|AU CLAVIER|RENDU)[^\]]*\]/g;

/** Vrai si le professeur demande à l'élève de choisir son support. */
export function demandeSupportEcrit(texte) {
  return BALISE.test(texte ?? '');
}

/**
 * LA CONSIGNE D'UN TEXTE EST AU TABLEAU — « La consigne », sans « Ton texte ».
 *
 * ELLE SUPPOSE LA QUESTION, ELLE NE LA POSE PAS. Distinction payée le
 * 18/09/2026 : la faire compter comme une question posée rouvrait la fenêtre
 * devant un élève qui venait de cliquer, puisque dans le déroulé normal la
 * consigne vient APRÈS le choix. Voir `reponseEnAttente`, qui ne la retient
 * que si rien d'autre ne répond plus haut.
 */
export function consigneAuTableau(texte) {
  // `matchAll` sur un motif global : on le relit à chaque appel, donc pas de
  // `lastIndex` qui traîne d'un message à l'autre.
  for (const tableau of (texte ?? '').matchAll(ARDOISE)) {
    const contenu = tableau[1] ?? '';

    if (TITRE_CONSIGNE.test(contenu) && !TITRE_TON_TEXTE.test(contenu)) return true;
  }

  return false;
}

/**
 * LA RÉPONSE DITE À VOIX HAUTE, ou tapée au lieu d'être cliquée.
 *
 * `undefined` DÈS QUE ÇA NE TRANCHE PAS — ni l'un ni l'autre, les deux à la
 * fois, ou un message trop long pour être une simple réponse. La fenêtre reste
 * alors ouverte : c'est elle, le filet, et on ne devine pas à la place de
 * l'enfant. « Pas le cahier, plutôt le clavier » contient les deux mots ; on ne
 * va pas se mettre à analyser sa syntaxe.
 *
 * `cachier` EST ACCEPTÉ, et ce n'est pas une faute de ma part : c'est une
 * orthographe qu'un enfant tape, et la reconnaissance vocale la produit aussi.
 *
 * PAS DE `\b`, ET C'EST UN PIÈGE QUI A FAILLI PASSER. En JavaScript, `\b` ne
 * connaît que [A-Za-z0-9_] : une lettre accentuée n'est pas une lettre pour
 * lui. Mesuré avant de corriger, trois défauts d'un coup — « à la main » et
 * « écran » ne correspondaient JAMAIS, et « une étape » correspondait à
 * « tape », donc au clavier. Les bornes sont donc des lettres Unicode
 * (`\p{L}`), qui comptent le « é » comme une lettre.
 */
const ORAL_CAHIER = /(?<!\p{L})(cahier|cachier|papier|feuille|à la main|a la main)(?!\p{L})/iu;
const ORAL_CLAVIER = /(?<!\p{L})(clavier|ordi|ordinateur|taper|tape|écran|ecran)(?!\p{L})/iu;
const REPONSE_COURTE = 120;

export function lireReponseSupportEcrit(texte) {
  const dit = (texte ?? '').trim();
  if (!dit || dit.length > REPONSE_COURTE) return undefined;

  const cahier = ORAL_CAHIER.test(dit);
  const clavier = ORAL_CLAVIER.test(dit);

  if (cahier === clavier) return undefined;

  return cahier ? CAHIER : CLAVIER;
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
    lireReponseOrale: lireReponseSupportEcrit,
    pose: demandeSupportEcrit,
    poseeImplicitement: consigneAuTableau,
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
  // LA BALISE ET LA CONSIGNE COMPTENT TOUTES LES DEUX : le rang n'a pas à
  // valoir « un par exercice », il a seulement à MONTER quand un texte neuf
  // commence. Une consigne donnée sans question doit ouvrir une feuille, donc
  // elle doit faire monter le rang comme la balise.
  return (messages ?? []).filter(
    (m) => m?.role === 'assistant'
      && (demandeSupportEcrit(m.contenu ?? '') || consigneAuTableau(m.contenu ?? '')),
  ).length;
}
