/**
 * L'agent mélange deux registres dans un même flux :
 *   — ce qu'il DIT, lu à voix haute
 *   — ce qu'il ÉCRIT au tableau, entre [ARDOISE] et [/ARDOISE], jamais dicté
 *
 * Ces fonctions séparent les deux. Elles doivent tolérer un flux incomplet :
 * pendant le streaming, une balise arrive souvent coupée en deux fragments.
 */

const OUVERTURE = '[ARDOISE]';
const FERMETURE = '[/ARDOISE]';

/**
 * La dictée : LE MIROIR EXACT DE L'ARDOISE.
 *
 * L'ardoise est écrite et jamais dite. La dictée est dite et jamais écrite —
 * et c'est vital : affichée, l'élève la RECOPIE au lieu de l'écrire sous la
 * dictée, et l'exercice n'existe plus. C'est le premier défaut qu'on
 * rencontre en faisant dicter un modèle de texte : il écrit ce qu'il dit.
 *
 * Le bloc porte aussi une seconde information, pour la voix : ce passage se
 * prononce à un tout autre débit que la conversation. Voir `contientDictee`.
 */
const DICTEE_OUVERTURE = '[DICTEE]';

/**
 * Une variante que le professeur n'est plus censé produire.
 *
 * Elle a existé : le mode d'écriture — cahier ou clavier — voyageait dans le
 * marqueur, et c'était au professeur de poser la question à l'élève. Il ne
 * l'a pas fait. La consigne le lui demandait en tête de section, en capitales,
 * avec « rien ne commence avant cette question » ; dans une séance où il avait
 * déjà dicté deux fois sans demander, il a suivi son propre précédent. C'est
 * le comportement normal d'un modèle de langue, et aucune formulation ne le
 * rend fiable.
 *
 * La question est donc posée par l'ÉCRAN, avant le premier mot prononcé.
 *
 * On continue néanmoins de RECONNAÎTRE cette forme : un modèle qui la
 * produirait encore — par habitude, ou en recopiant un ancien message de la
 * conversation — ferait sinon apparaître « :CLAVIER] » en clair au milieu du
 * texte, et l'élève l'entendrait au milieu de sa dictée.
 */
const DICTEE_CLAVIER = '[DICTEE:CLAVIER]';

const DICTEE_FERMETURE = '[/DICTEE]';

/**
 * Les bornes de dictée telles qu'elles voyagent dans le TEXTE PRONONCÉ.
 *
 * Deux caractères de contrôle, choisis parce qu'aucun texte de professeur ne
 * peut en contenir et qu'aucune synthèse vocale ne saurait les prononcer. Ils
 * marquent où la dictée commence et où elle finit, à l'intérieur d'une chaîne
 * qui contient aussi l'annonce et la consigne.
 *
 * Le service de voix les retire au moment de mettre le texte en file, et s'en
 * sert pour n'appliquer le débit lent et les silences QU'À la dictée.
 */
export const DEBUT_DICTEE = '\u0001';
export const FIN_DICTEE = '\u0002';

/**
 * L’ÉCOUTE EN LANGUE ÉTUDIÉE, ET LES BORNES QUI LA SIGNALENT À LA VOIX.
 *
 * Le passage qu’elles entourent part à la synthèse avec une consigne de
 * prononciation ; le reste du message continue au registre habituel. C’est
 * ce qui permet de garder le principe pédagogique des langues étrangères —
 * on EXPLIQUE en français, on PRATIQUE dans la langue étudiée — tout en
 * rendant l’écoute possible, français comme langues étrangères.
 *
 * DIT MAIS PAS ÉCRIT, exactement comme la dictée : afficher le texte pendant
 * qu’on le prononce supprimerait l’exercice, l’élève lirait au lieu
 * d’écouter.
 *
 * Ces caractères de contrôle sont choisis pour les mêmes raisons que ceux
 * de la dictée — aucun texte de professeur n’en contient, aucune synthèse
 * ne saurait les prononcer.
 */
// UNE BALISE PAR LANGUE, UN SEUL MÉCANISME. Ajouter une langue, c'est
// ajouter une ligne ici ; rien d'autre dans ce fichier ne connaît la liste
// des langues enseignées. Un caractère de DÉBUT par langue ; un seul de
// FIN, commun à toutes, puisqu'un passage qui se referme referme toujours
// le même mode, quelle que soit la langue qui l'a ouvert.
const LANGUES_ECOUTE = [
  ['[EN]', '[/EN]', '\u0003', 'en'],
  ['[FR]', '[/FR]', '\u0005', 'fr'],
  ['[ES]', '[/ES]', '\u0006', 'es'],
  ['[DE]', '[/DE]', '\u0007', 'de'],
  ['[IT]', '[/IT]', '\u000b', 'it'],
  ['[ZH]', '[/ZH]', '\u000e', 'zh'],
];

/** Caractère de début de la balise d'écoute d'une langue, par son code. */
export const DEBUT_ECOUTE = Object.fromEntries(
  LANGUES_ECOUTE.map(([, , debut, code]) => [code, debut]),
);

/** Code de langue par caractère de début — pour retrouver la langue à la lecture du flux. */
export const LANGUE_PAR_DEBUT_ECOUTE = new Map(
  LANGUES_ECOUTE.map(([, , debut, code]) => [debut, code]),
);

export const FIN_ECOUTE = '\u0004';

/**
 * La prochaine ouverture de dictée, quelle que soit sa variante.
 *
 * Rend l'index ET la longueur du marqueur : les deux formes n'ont pas la même
 * taille, et se tromper de longueur laisserait « :CLAVIER] » dans le texte
 * prononcé — l'élève entendrait le nom du mode au milieu de sa dictée.
 */
function prochaineDictee(texte, depuis = 0) {
  const simple = texte.indexOf(DICTEE_OUVERTURE, depuis);
  const clavier = texte.indexOf(DICTEE_CLAVIER, depuis);

  if (simple === -1 && clavier === -1) return { index: -1, longueur: 0 };
  if (clavier !== -1 && (simple === -1 || clavier < simple)) {
    return { index: clavier, longueur: DICTEE_CLAVIER.length };
  }
  return { index: simple, longueur: DICTEE_OUVERTURE.length };
}

/**
 * Ce message contient-il une dictée ?
 *
 * Sert à basculer la synthèse vocale en mode dictée pour TOUT le tour de
 * parole. Le grain est volontairement grossier : la consigne du professeur lui
 * demande de ne rien mettre d'autre dans le message qui porte une dictée, ce
 * qui rend ce drapeau exact — et bien plus simple à tenir qu'un découpage
 * caractère par caractère du flux, où l'on perdrait la frontière au premier
 * fragment coupé en deux.
 */
/**
 * Vrai quand ce message porte la correction d'une dictée.
 *
 * CE QUI CLÔT UNE DICTÉE, C'EST LA CORRECTION — PAS L'ENVOI DE LA COPIE.
 *
 * L'écran croyait la dictée finie dès que l'élève avait rendu sa copie. Mais
 * le professeur relit souvent une phrase que l'enfant n'a pas eu le temps
 * de retenir, et cette relecture est encore la même dictée. Faute de savoir
 * la distinguer d'une dictée neuve, l'écran redemandait « comment veux-tu
 * écrire ? » au milieu de celle qui était en cours, et repartait sur une
 * copie vide.
 */
export function contientCorrectionDictee(texte) {
  return typeof texte === 'string' && texte.includes(DICTEE_CORRIGEE_OUVERTURE);
}
export function contientDictee(texte) {
  return Boolean(texte)
    && (texte.includes(DICTEE_OUVERTURE) || texte.includes(DICTEE_CLAVIER));
}

/**
 * Retire les blocs de dictée : ce qui est dicté ne s'affiche jamais.
 *
 * Tolère un bloc encore ouvert — pendant le flux, la fermeture n'est pas
 * encore arrivée et le texte ne doit surtout pas apparaître en attendant.
 */
/**
 * Retire les passages d'écoute en langue étudiée : ce qui se prononce pour
 * être écouté ne s'affiche pas, sinon l'élève lit la réponse au lieu de
 * l'entendre. Boucle sur toutes les langues de `LANGUES_ECOUTE`, avec le
 * même retrait de bloc que les autres balises internes (`retirerBloc`, plus
 * bas, définie plus loin mais utilisable ici — les déclarations de fonction
 * sont hissées) : ajouter une langue là-bas suffit à la couvrir ici aussi.
 */
/**
 * LE TEXTE DES PASSAGES D'ÉCOUTE, toutes langues confondues.
 *
 * Sert à savoir qu'un exercice de compréhension orale commence — et à
 * distinguer un passage INÉDIT d'une relecture du même texte, pour ne
 * redemander la vitesse qu'au premier. Voir `vitesseEcoute.js`.
 *
 * TOLÈRE UN BLOC ENCORE OUVERT : le texte arrive en flux, et c'est justement
 * AVANT la fin du passage qu'il faut poser la question — sinon la voix aurait
 * déjà tout lu.
 */
export function extraireEcoutes(texte) {
  if (!texte) return '';

  const passages = [];

  for (const [ouverture, fermeture] of LANGUES_ECOUTE) {
    let reste = texte;

    for (;;) {
      const debut = reste.indexOf(ouverture);
      if (debut === -1) break;

      const apres = reste.slice(debut + ouverture.length);
      const fin = apres.indexOf(fermeture);

      passages.push(fin === -1 ? apres : apres.slice(0, fin));
      reste = fin === -1 ? '' : apres.slice(fin + fermeture.length);
    }
  }

  return passages.join(' ').replace(/\s+/g, ' ').trim();
}

function retirerEcouteLangue(texte) {
  return LANGUES_ECOUTE.reduce(
    (texteCourant, [ouverture, fermeture]) => retirerBloc(texteCourant, ouverture, fermeture),
    texte,
  );
}

function retirerDictees(texte) {
  let sortie = '';
  let reste = texte;

  while (reste.length > 0) {
    const { index: debut, longueur } = prochaineDictee(reste);

    if (debut === -1) {
      sortie += reste;
      break;
    }

    sortie += reste.slice(0, debut);

    const apres = reste.slice(debut + longueur);
    const fin = apres.indexOf(DICTEE_FERMETURE);

    // Encore ouverte : tout ce qui suit est du texte dicté, on s'arrête là.
    if (fin === -1) break;

    reste = apres.slice(fin + DICTEE_FERMETURE.length);
  }

  // LE TROU QUE LAISSE UNE DICTÉE RETIRÉE.
  //
  // Le bloc est entouré de sauts de ligne qui, eux, restent : la bulle
  // affichait une phrase, un grand blanc de plusieurs lignes, puis la suite.
  // On ne garde qu'une séparation de paragraphe.
  return sortie.replace(/\n\s*\n\s*\n+/g, '\n\n');
}

/**
 * Le bloc d'évaluation est un canal de données, pas du discours : il porte la
 * note et la remarque vers la fiche de l'élève. Le professeur a déjà TOUT dit
 * à l'oral juste avant — le bloc n'est donc ni prononcé ni affiché.
 *
 * Retiré dès l'ouverture de la balise, sans attendre la fermeture : pendant le
 * flux, « [EVALUATION]\nnotion: ... » s'afficherait sinon caractère par
 * caractère sous les yeux de l'enfant avant de disparaître.
 */
const EVAL_OUVERTURE = '[EVALUATION]';
const EVAL_FERMETURE = '[/EVALUATION]';

/** Le compte rendu de séance : même nature, autre destination. */
const RAPPORT_OUVERTURE = '[RAPPORT]';
const RAPPORT_FERMETURE = '[/RAPPORT]';

/** La fiche de révision : rangée dans les fiches, jamais déroulée dans le chat. */
const FICHE_OUVERTURE = '[FICHE]';
const FICHE_FERMETURE = '[/FICHE]';

/**
 * Un contrôle scolaire annoncé par l'élève et noté par son professeur : rangé
 * dans le calendrier, jamais lu ni affiché dans le chat — même nature que
 * [FICHE] ou [EVALUATION].
 */
const CONTROLE_PROGRAMME_OUVERTURE = '[CONTROLE_PROGRAMME]';
const CONTROLE_PROGRAMME_FERMETURE = '[/CONTROLE_PROGRAMME]';

/** Les notions travaillées pour un contrôle : même nature, autre bloc. */
const CONTROLE_NOTIONS_OUVERTURE = '[CONTROLE_NOTIONS]';
const CONTROLE_NOTIONS_FERMETURE = '[/CONTROLE_NOTIONS]';

/** Le verdict du professeur sur la préparation : l'élève est-il prêt ? */
const CONTROLE_PRET_OUVERTURE = '[CONTROLE_PRET]';
const CONTROLE_PRET_FERMETURE = '[/CONTROLE_PRET]';

/** Le même verdict, pour une épreuve d'examen préparée. */
const EXAMEN_PRET_OUVERTURE = '[EXAMEN_PRET]';
const EXAMEN_PRET_FERMETURE = '[/EXAMEN_PRET]';

/**
 * La correction d'une évaluation remise au cours suivant vient d'avoir lieu —
 * ou l'élève n'a pas voulu la faire. Un simple numéro entre deux balises, qui
 * ne doit ni s'afficher ni se prononcer : « quatorze » lu à voix haute au
 * milieu d'une phrase du professeur ne voudrait rien dire pour l'enfant.
 */
const EVALUATION_CORRIGEE_OUVERTURE = '[EVALUATION_CORRIGEE]';
const EVALUATION_CORRIGEE_FERMETURE = '[/EVALUATION_CORRIGEE]';

/** Ce que le contrôle a donné, une fois passé : la note, le ressenti, les erreurs. */
const CONTROLE_RESULTAT_OUVERTURE = '[CONTROLE_RESULTAT]';
const CONTROLE_RESULTAT_FERMETURE = '[/CONTROLE_RESULTAT]';

/**
 * Le professeur propose de regarder la copie d'un contrôle passé : l'écran
 * affiche la question et les boutons d'envoi. Voir `copieControle.js`.
 */
const COPIE_CONTROLE_OUVERTURE = '[COPIE_CONTROLE]';
const COPIE_CONTROLE_FERMETURE = '[/COPIE_CONTROLE]';

/**
 * Une évaluation reportée au prochain cours, faute de temps.
 *
 * Il manquait à cette liste depuis sa création — relevé par Camara le
 * 13/09/2026, à la première séance qui en a produit un : « [EVALUATION_PREVUE]
 * notion: Utiliser la réciproque de Thalès » affiché tel quel dans la bulle du
 * professeur, et lu à voix haute avec ses crochets. Chaque bloc du prompt doit
 * figurer ici ; c'est le plus facile à oublier, parce que l'oubli ne se voit
 * qu'en séance.
 */
const EVALUATION_PREVUE_OUVERTURE = '[EVALUATION_PREVUE]';
const EVALUATION_PREVUE_FERMETURE = '[/EVALUATION_PREVUE]';

/**
 * La dictée corrigée : même nature que [EVALUATION] — le professeur a déjà
 * tout dit à l'oral, le bloc sert seulement à archiver la copie dans « Mes
 * dictées ». Ni prononcé ni affiché.
 */
const DICTEE_CORRIGEE_OUVERTURE = '[DICTEE_CORRIGEE]';
const DICTEE_CORRIGEE_FERMETURE = '[/DICTEE_CORRIGEE]';

/**
 * La compréhension orale archivée : même nature que [DICTEE_CORRIGEE] — le
 * professeur a déjà tout dit à l'oral, le bloc sert seulement à archiver
 * l'échange dans « Mes compréhensions orales ». Ni prononcé ni affiché.
 */
const COMPREHENSION_ORALE_OUVERTURE = '[COMPREHENSION_ORALE]';
const COMPREHENSION_ORALE_FERMETURE = '[/COMPREHENSION_ORALE]';

/**
 * L'ARCHIVE D'UNE CONVERSATION D'EXPRESSION ORALE.
 *
 * OUBLIÉE DE CETTE LISTE À LA LIVRAISON, et Camara l'a vu en séance le
 * 18/09/2026 : « je suis rentré en cours et j'ai vu ce gros bloc là ». Le
 * bloc entier — titre, langue, chaque réplique, la remarque — s'affichait
 * dans la bulle du professeur ET se faisait prononcer à voix haute. Un
 * enfant de dix ans a entendu « titre deux points commander au restaurant ».
 *
 * LA LEÇON : un bloc technique n'est pas masqué parce qu'on a écrit dans la
 * consigne qu'il ne doit pas l'être. Il est masqué parce qu'il est DANS
 * cette liste.
 */
const EXPRESSION_ORALE_OUVERTURE = '[EXPRESSION_ORALE]';
const EXPRESSION_ORALE_FERMETURE = '[/EXPRESSION_ORALE]';

/**
 * Le bloc d'archivage d'un TEXTE ÉCRIT : sa consigne, la copie de l'élève
 * fautes comprises, et chaque reprise du professeur.
 *
 * AJOUTÉ ICI AVANT D'EXISTER AILLEURS, et c'est délibéré. Le bloc précédent
 * de cette même famille a été livré sans y figurer : il s'est affiché en
 * entier dans la bulle du professeur et s'est fait PRONONCER. Celui-ci est
 * plus gros encore — une rédaction entière suivie de sa correction.
 */
const EXPRESSION_ECRITE_OUVERTURE = '[EXPRESSION_ECRITE]';
const EXPRESSION_ECRITE_FERMETURE = '[/EXPRESSION_ECRITE]';

/**
 * Les deux marqueurs isolés de l'expression orale : celui qui ouvre la
 * conversation, et celui qui demande à l’élève sur quoi il compose son
 * évaluation.
 *
 * ILS ÉTAIENT RETIRÉS À L'AFFICHAGE, PAS À LA VOIX. Chacun avait son propre
 * nettoyage dans `Chat.js`, qui ne sert que la bulle — la synthèse vocale,
 * elle, passe par ici. Le professeur les prononçait donc.
 */
const CONVERSATION = '[CONVERSATION]';
const SUPPORT_EVALUATION = '[SUPPORT_EVALUATION]';

/** Le support d'un texte à rédiger : cahier ou clavier. */
const SUPPORT_ECRIT = '[SUPPORT_ECRIT]';

/** Marqueur posé par le professeur au moment où le contrôle commence. */
export const EVAL_DEBUT = '[DEBUT_EVALUATION]';

/**
 * CHANGER DE VITESSE EN COURS D'EXERCICE — voulu par Camara le 16/09/2026.
 *
 * « Un élève peut choisir une vitesse et se rendre compte qu'elle n'est pas
 * adaptée » : il doit pouvoir en changer à tout moment, autant de fois qu'il
 * veut, et réentendre le même passage au nouveau débit.
 *
 * DEUX FORMES, PARCE QUE DEUX DEMANDES DIFFÉRENTES :
 *
 *   [VITESSE]            « change la vitesse » — la fenêtre des quatre
 *                        boutons se rouvre, l'élève choisit.
 *   [VITESSE:lent]       « plus lent », « plus vite » — le professeur connaît
 *                        le débit en cours (le marqueur le lui donne à chaque
 *                        tour) et pose lui-même le cran voisin. Pas de
 *                        fenêtre : l'élève a déjà dit ce qu'il voulait.
 *
 * Aux bornes, il n'y a PAS de balise : le professeur répond simplement qu'il
 * lit déjà au plus lent — ou au plus rapide — et rien ne change.
 *
 * Ni affichée ni prononcée, comme les autres marqueurs.
 */
export const VITESSE_CHOIX = '[VITESSE]';

/** `[VITESSE:tres_lent]` et ses trois sœurs, dans le texte du professeur. */
const VITESSE_CIBLE = /\[VITESSE:([a-z_]+)\]/gi;

/**
 * Le professeur demande-t-il de ROUVRIR la fenêtre des quatre vitesses ?
 *
 * La forme nue seulement : `[VITESSE:lent]` dit une cible, pas une question à
 * reposer.
 */
export function demandeChoixVitesse(texte) {
  if (!texte) return false;

  return texte.replace(VITESSE_CIBLE, '').includes(VITESSE_CHOIX);
}

/**
 * La vitesse que le professeur vient de poser lui-même, ou null.
 *
 * La DERNIÈRE l'emporte : un message qui en porterait deux — cela arrive quand
 * un modèle se reprend — doit laisser l'élève sur celle qu'il a annoncée en
 * dernier, c'est-à-dire celle qu'il s'apprête à employer.
 */
export function vitesseDemandee(texte) {
  if (!texte) return null;

  const trouvees = [...texte.matchAll(VITESSE_CIBLE)];
  return trouvees.length > 0 ? trouvees[trouvees.length - 1][1].toLowerCase() : null;
}

/**
 * Le contrôle a été abandonné : l'élève a quitté le cours en plein milieu.
 *
 * Posé par le serveur à la sortie, pas par le professeur. Il referme un
 * contrôle qui, sans lui, serait resté ouvert indéfiniment — l'élève revenait
 * le lendemain et reprenait à la question trois.
 *
 * Ce n'est PAS une copie rendue : il n'y a ni note ni copie à afficher. Le
 * contrôle sera reproposé en entier.
 */
export const EVAL_ABANDON = '[EVALUATION_ABANDONNEE]';

/**
 * La dictée a été interrompue avant que la copie n'arrive.
 *
 * Posé par le serveur, comme l'abandon de contrôle : l'élève a quitté le
 * cours — bouton ou onglet fermé — pendant que le professeur dictait ou
 * relisait. La dictée est ANNULÉE : rien n'est archivé, et le professeur le
 * lui dira à son retour.
 */
export const DICTEE_ABANDON = '[DICTEE_ABANDONNEE]';

/** L'abandon d'une dictée est-il déclaré dans ce texte ? */
export function dicteeAbandonnee(texte) {
  return Boolean(texte) && texte.includes(DICTEE_ABANDON);
}

/**
 * L'ÉLÈVE NE VEUT PLUS DE CETTE DICTÉE — voulu par Camara le 11/09/2026 :
 * passée, abandonnée, ou refusée à la reprise, elle est SUPPRIMÉE de partout,
 * pour que le professeur ne la ressorte jamais. Posé par le professeur :
 * `[DICTEE_SUPPRIMEE]derniere[/DICTEE_SUPPRIMEE]`, ou avec le numéro d'une
 * dictée archivée. Le serveur fait la suppression ; l'écran referme la
 * dictée en cours et n'affiche rien du bloc.
 */
/**
 * L'élève ne veut plus de cet exercice d'écoute : la fiche est supprimée de
 * « Mes compréhensions orales », et le filet de fin de séance ne la
 * reconstitue pas. Posé par le professeur, jamais affiché ni prononcé.
 */
const COMPREHENSION_SUPPRIMEE_OUVERTURE = '[COMPREHENSION_SUPPRIMEE]';
const COMPREHENSION_SUPPRIMEE_FERMETURE = '[/COMPREHENSION_SUPPRIMEE]';

const DICTEE_SUPPRIMEE_OUVERTURE = '[DICTEE_SUPPRIMEE]';
const DICTEE_SUPPRIMEE_FERMETURE = '[/DICTEE_SUPPRIMEE]';

export function dicteeSupprimee(texte) {
  return Boolean(texte) && texte.includes(DICTEE_SUPPRIMEE_OUVERTURE);
}

/**
 * UNE DICTÉE ARCHIVÉE, REMISE AU TABLEAU PAR SON NUMÉRO.
 *
 * Voulu par Camara le 11/09/2026 : revenir sur une dictée — même vieille de
 * huit mois — doit la montrer comme dans « Mes dictées », erreurs numérotées.
 * Le professeur ne recopie donc plus rien : il pose
 * `[DICTEE_AU_TABLEAU]42[/DICTEE_AU_TABLEAU]`, et l'écran affiche l'archive
 * elle-même — le texte dicté et la copie D'ORIGINE, jamais une version qu'il
 * aurait corrigée en la recopiant.
 */
const DICTEE_AU_TABLEAU_OUVERTURE = '[DICTEE_AU_TABLEAU]';
const DICTEE_AU_TABLEAU_FERMETURE = '[/DICTEE_AU_TABLEAU]';

/**
 * Ce que le tableau retient d'un tel geste : un repère, résolu ensuite par
 * l'écran en allant chercher l'archive. Un caractère nul en tête — aucun
 * contenu écrit par le professeur ne peut commencer ainsi.
 */
export const REPERE_DICTEE_ARCHIVEE = '\u0000dictee-archivee:';

/** Le numéro de la dernière dictée remise au tableau dans ce texte, ou null. */
export function dicteeAuTableau(texte) {
  if (!texte) return null;

  let numero = null;
  for (const trouve of texte.matchAll(/\[DICTEE_AU_TABLEAU\]\s*(?:n°\s*)?(\d+)\s*\[\/DICTEE_AU_TABLEAU\]/g)) {
    numero = Number(trouve[1]);
  }

  return numero;
}

/**
 * Marqueur d'adieu : le professeur vient de saluer l'élève et la séance est
 * close. Posé quand l'élève demande à s'arrêter, ou quand il accepte la
 * proposition d'arrêt du professeur.
 */
export const FIN_SEANCE = '[FIN_SEANCE]';

/**
 * LA GOMME DU TABLEAU.
 *
 * POURQUOI ELLE N'EXISTAIT PAS, ET CE QUE ÇA A DONNÉ
 * --------------------------------------------------
 * Le professeur pouvait REMPLACER le contenu du tableau, jamais l'effacer :
 * « extraireArdoises » jette les blocs vides, et le tableau remonte alors au
 * dernier contenu non vide. Un bloc [ARDOISE] vide ne faisait donc rien du
 * tout.
 *
 * Relevé en séance, en fin de cours : l'élève demande « mets à jour le
 * tableau ». Le professeur répond « on efface le tableau pour aujourd'hui »,
 * puis « Effacé, Bilal, ne t'en fais pas ! ». Le tableau affichait toujours
 * l'exercice précédent — « Sa sœur les a (fermer) ce soir. » L'élève a dû le
 * redire deux fois.
 *
 * Ce n'était pas une consigne ignorée : il n'avait aucun moyen de le faire.
 * On le lui donne.
 *
 * UN MARQUEUR PLUTÔT QU'UN BLOC VIDE. Il rejoint la famille de [FIN_SEANCE] :
 * retiré de l'affichage, jamais prononcé, impossible à confondre avec un bloc
 * mal refermé pendant le flux.
 */
export const TABLEAU_EFFACE = '[TABLEAU_EFFACE]';

/** Ce message demande-t-il d'effacer le tableau ? */
export function effaceLeTableau(texte) {
  return (texte ?? '').includes(TABLEAU_EFFACE);
}

/**
 * LA DEMANDE DE DOCUMENT.
 *
 * Posée par le professeur quand il réclame un devoir, un contrôle ou un
 * exercice fait sur le cahier : elle allume le trombone et la caméra pour que
 * l'élève sache où répondre. Même famille que [FIN_SEANCE] et
 * [TABLEAU_EFFACE] — retirée de l'affichage, jamais prononcée.
 */
export const DEMANDE_DOCUMENT = '[DEMANDE_DOCUMENT]';

/**
 * L'ÉNONCÉ SEUL — Camara, le 20/09/2026. Le professeur l'écrit quand l'enfant
 * veut lui envoyer un sujet pour se le faire expliquer : l'écran pose alors
 * la carte à deux boutons. Même famille que les autres : retirée de
 * l'affichage, jamais prononcée. Voir `enonceExercice.js`.
 */
export const ENONCE_EXERCICE = '[ENONCE_EXERCICE]';

/** Le professeur vient-il de demander un document ? */
export function demandeDocument(texte) {
  return (texte ?? '').includes(DEMANDE_DOCUMENT);
}

/** Le professeur a-t-il dit au revoir dans ce texte ? */
export function seanceClose(texte) {
  return Boolean(texte) && texte.includes(FIN_SEANCE);
}

/**
 * Formulations par lesquelles un élève annonce qu'il s'en va.
 *
 * Sert de CORROBORATION, jamais de détection : on ne s'en sert que pour
 * confirmer un adieu que le professeur a déjà décidé d'écrire. Un faux positif
 * laisse donc passer un au revoir qui allait de toute façon être dit ; un faux
 * négatif garde la séance ouverte, et l'élève a le bouton « Quitter le cours »
 * juste au-dessus. L'erreur penche du bon côté : celui du temps qu'il a payé.
 */
const DEPARTS = [
  /\bj ?arrete\b|\bon arrete\b|\barretons\b/,

  // Arrêter ou quitter, avec l'objet nommé.
  //
  // Ces trois lignes manquaient, et leur absence a coûté une séance entière :
  // l'élève avait écrit « je vais m'arrêter ici aujourd'hui et quitter la
  // séance. Je vais arrêter le cours. Non, je veux arrêter le cours. » — quatre
  // fois, en français clair. Aucun motif ne s'y appliquait : ils visaient tous
  // « j'arrête » à l'élidée, jamais « je veux arrêter » ni « quitter le
  // cours ». Le professeur avait bien salué ; la corroboration a refusé, la
  // séance est restée ouverte, et le minuteur lui a fait relancer un exercice
  // au tour suivant.
  /\b(arreter|quitter) (le cours|la seance|la lecon|ici|maintenant)\b/,
  /\bje (quitte|m arrete)\b/,

  // La négation qui suit écarte « je vais arrêter DE me tromper » : le verbe
  // doit porter sur la séance, pas sur une habitude.
  /\bje (veux|vais|voudrais|prefere|souhaite) (bien )?(m ?arreter|arreter|quitter)(?! (de|d )) ?/,
  /\b(au revoir|a bientot|a plus|a demain|a la prochaine|bye|salut|ciao|tchao)\b/,

  // Les souhaits de fin de journée. « Bonne soirée » manquait, et son absence
  // a coûté cher : le professeur avait dit au revoir, le marqueur a été refusé
  // faute de corroboration, et le minuteur a conclu une seconde fois derrière.
  /\bbonne (soiree|journee|nuit|fin de journee)\b|\bbon week ?end\b/,

  /\bj ?ai (fini|termine|assez)\b|\bc ?est (fini|bon pour (moi|aujourd ?hui))\b/,
  /\bje (dois )?(y vais|pars|m ?en vais|dois partir|y aller)\b/,
  /\bon (continue|reprend|verra|se voit) (demain|la prochaine fois|plus tard)\b/,
  /\bje suis (fatigue|creve)\b|\bj ?en ai marre\b|\bstop\b/,
  /\bmerci (pour tout|beaucoup)\b/,
];

// Accents retirés, apostrophes ET traits d'union ramenés à l'espace : la
// dictée vocale écrit « j'arrête », le clavier « j arrete », l'apostrophe
// typographique diffère de celle du clavier, et « week-end » s'écrit aussi
// « week end » ou « weekend ». Toutes ces formes doivent se valoir.
function normaliserPourDeparts(texte) {
  return texte
    .normalize('NFD')
    .replace(new RegExp('[\\u0300-\\u036f]', 'g'), '')
    .replace(/['’`-]/g, ' ')
    .toLowerCase();
}

/**
 * L'élève demande-t-il à s'arrêter ?
 *
 * On lit son DERNIER message : c'est celui auquel le professeur répond.
 */
export function demandeArret(texte) {
  if (!texte) return false;

  return DEPARTS.some((motif) => motif.test(normaliserPourDeparts(texte)));
}

/**
 * LE FILET CONTRE LE DOUBLE AU REVOIR.
 *
 * Le professeur dit-il adieu EN TOUTES LETTRES, sans avoir posé [FIN_SEANCE] ?
 * On ne lit que la DERNIÈRE phrase : un adieu mentionné en passant plus tôt
 * dans le message («la dernière fois qu'on s'est dit à bientôt…») ne compte
 * pas, seule la formule de sortie réelle déclenche le filet.
 */
export function sembleDireAuRevoir(texte) {
  if (!texte) return false;

  const phrases = texte.split(/[.!?]+/).map((p) => p.trim()).filter(Boolean);
  const derniere = phrases[phrases.length - 1];
  if (!derniere) return false;

  return DEPARTS.some((motif) => motif.test(normaliserPourDeparts(derniere)));
}

/**
 * Les formules par lesquelles on PREND CONGÉ — et elles seules.
 *
 * Plus étroite que `DEPARTS` : « salut » n'y est pas, parce qu'il dit aussi
 * bonjour. Sans cette exclusion, le « Salut Bilal ! » d'un accueil aurait pu
 * passer pour un départ.
 */
const ADIEUX = /^(au revoir|a bientot|a plus|a demain|a la prochaine|a tres vite|a tout a l ?heure|bye|ciao|tchao|bonne (soiree|journee|nuit|fin de journee|semaine|vacances)|bon week ?end)\b/;

/**
 * LE PROFESSEUR PREND-IL CONGÉ, EN TOUTES LETTRES ?
 *
 * Relevé par Camara le 11/09/2026 : « OK, à la prochaine », dit l'élève ;
 * « À bientôt Bilal ! On reprendra la fin de la dictée au prochain cours »,
 * répond le professeur — sans poser [FIN_SEANCE]. La séance restait ouverte
 * jusqu'au bout du minuteur, deux personnes qui s'étaient dit au revoir.
 *
 * Plus large que `sembleDireAuRevoir`, qui ne lit que la dernière phrase : ici
 * l'adieu venait EN PREMIER, et la dernière phrase parlait du prochain cours.
 * On regarde donc la première phrase ET la dernière — mais une formule doit
 * OUVRIR la phrase, ou l'une de ses parties : « Parfait, à bientôt ! » compte,
 * « la dernière fois qu'on s'est dit à bientôt, tu avais… » ne compte pas.
 *
 * Ne s'emploie JAMAIS seul — voir la corroboration dans `Chat.js` : il faut
 * aussi que l'élève, juste avant, ait annoncé qu'il partait.
 */
export function prendConge(texte) {
  if (!texte) return false;

  const phrases = retirerMarqueurs(texte)
    .split(/[.!?…]+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (phrases.length === 0) return false;

  const ouvreSurUnAdieu = (phrase) => normaliserPourDeparts(phrase)
    .split(/[,;:—–]/)
    .some((partie) => ADIEUX.test(partie.trim()));

  return ouvreSurUnAdieu(phrases[0]) || ouvreSurUnAdieu(phrases[phrases.length - 1]);
}

/**
 * Un contrôle est-il en cours dans ce texte ?
 *
 * Un contrôle commencé et non refermé signifie que l'élève est encore en
 * train de composer : c'est ce qui autorise la séance à dépasser son temps.
 */
export function evaluationOuverte(texte) {
  if (!texte) return false;

  const debut = texte.lastIndexOf(EVAL_DEBUT);
  if (debut === -1) return false;

  // Un abandon referme au même titre qu'une copie rendue. Sans lui, le
  // contrôle restait « en cours » au retour de l'élève, avec tout ce que ça
  // entraîne : le rab accordé au dépassement, le minuteur qui se tait, et le
  // professeur qui reprend à la question trois.
  if (texte.lastIndexOf(EVAL_ABANDON) > debut) return false;

  return texte.lastIndexOf(EVAL_FERMETURE) < debut;
}

/** La copie vient-elle d'être rendue dans ce texte ? */
export function evaluationRendue(texte) {
  return Boolean(texte) && texte.includes(EVAL_FERMETURE);
}

/**
 * L'abandon est-il déclaré dans ce texte ?
 *
 * POURQUOI CE TEST NE PEUT PAS RESTER DANS evaluationOuverte
 * ---------------------------------------------------------
 * Celui-ci ne regarde qu'UN texte, et le serveur enregistre l'abandon dans un
 * message SÉPARÉ — pas dans celui qui avait ouvert le contrôle. Le marqueur
 * n'était donc jamais dans le texte où on le cherchait : le message d'abandon
 * n'ouvre rien, ne ferme rien, et se faisait ignorer ; on remontait alors
 * jusqu'à l'ouverture, restée béante, et le contrôle passait pour toujours en
 * cours. L'élève voyait l'indicateur « Contrôle » alors que le professeur
 * venait de lui dire qu'on le garderait pour la prochaine fois.
 *
 * Le serveur, lui, parcourait bien l'historique message par message
 * (LecteurEvaluation.EstOuvert). Les deux côtés se contredisaient.
 */
export function evaluationAbandonnee(texte) {
  return Boolean(texte) && texte.includes(EVAL_ABANDON);
}

/**
 * Retire tout ce qui est destiné à l'application et non à l'élève : le bloc
 * d'évaluation, le marqueur d'ouverture de contrôle et celui de fin de séance.
 */
/** Retire un bloc délimité, en s'arrêtant net s'il est encore ouvert. */
function retirerBloc(texte, ouverture, fermeture) {
  let sortie = '';
  let reste = texte;

  for (;;) {
    const debut = reste.indexOf(ouverture);

    if (debut === -1) {
      // Filet de sécurité : une balise FERMANTE sans son ouverture.
      //
      // Ça ne devrait jamais arriver, et pourtant c'est arrivé — deux flux
      // écrivant dans le même tampon avaient effacé le début d'un message,
      // balise ouvrante comprise. Faute d'ouverture, rien n'était masqué : le
      // compte rendu de séance destiné à la base s'est affiché en clair sous
      // les yeux de l'élève, `[/RAPPORT]` et notes comprises.
      //
      // La cause est corrigée ailleurs — un seul flux à la fois, voir
      // chatSaga.js. Ce garde-fou reste, parce que le prix d'une erreur n'est
      // pas symétrique : perdre une phrase du professeur est un désagrément,
      // montrer à un enfant la note qu'on vient de lui mettre en est un autre.
      //
      // On ne coupe QUE devant la balise orpheline : ce qui a déjà été validé
      // par des blocs bien formés plus haut n'est pas remis en cause.
      const orpheline = reste.indexOf(fermeture);

      if (orpheline !== -1) {
        reste = reste.slice(orpheline + fermeture.length);
        continue;
      }

      sortie += reste;
      break;
    }

    sortie += reste.slice(0, debut);

    const apres = reste.slice(debut + ouverture.length);
    const fin = apres.indexOf(fermeture);

    if (fin === -1) break; // bloc encore ouvert : rien de ce qui suit ne sort

    reste = apres.slice(fin + fermeture.length);
  }

  return sortie;
}

function retirerMarqueurs(texte) {
  const sansMarqueurs = (texte ?? '')
    .split(EVAL_DEBUT).join('')
    .split(EVAL_ABANDON).join('')
    .split(DICTEE_ABANDON).join('')
    .split(FIN_SEANCE).join('')
    .split(TABLEAU_EFFACE).join('')
    .split(DEMANDE_DOCUMENT).join('')
    .split(ENONCE_EXERCICE).join('')
    .split(VITESSE_CHOIX).join('')
    .split(CONVERSATION).join('')
    .split(SUPPORT_EVALUATION).join('')
    .split(SUPPORT_ECRIT).join('')
    // La forme à cible porte un paramètre : elle se retire par motif, sinon
    // l'élève lirait « :lent] » au milieu de la phrase et l'entendrait.
    .replace(VITESSE_CIBLE, '');

  const blocs = [
    [EVAL_OUVERTURE, EVAL_FERMETURE],
    [RAPPORT_OUVERTURE, RAPPORT_FERMETURE],
    [FICHE_OUVERTURE, FICHE_FERMETURE],
    [CONTROLE_PROGRAMME_OUVERTURE, CONTROLE_PROGRAMME_FERMETURE],
    [CONTROLE_NOTIONS_OUVERTURE, CONTROLE_NOTIONS_FERMETURE],
    [CONTROLE_PRET_OUVERTURE, CONTROLE_PRET_FERMETURE],
    [EXAMEN_PRET_OUVERTURE, EXAMEN_PRET_FERMETURE],
    [EVALUATION_CORRIGEE_OUVERTURE, EVALUATION_CORRIGEE_FERMETURE],
    [CONTROLE_RESULTAT_OUVERTURE, CONTROLE_RESULTAT_FERMETURE],
    [COPIE_CONTROLE_OUVERTURE, COPIE_CONTROLE_FERMETURE],
    [EVALUATION_PREVUE_OUVERTURE, EVALUATION_PREVUE_FERMETURE],
    [DICTEE_CORRIGEE_OUVERTURE, DICTEE_CORRIGEE_FERMETURE],
    [COMPREHENSION_ORALE_OUVERTURE, COMPREHENSION_ORALE_FERMETURE],
    [EXPRESSION_ORALE_OUVERTURE, EXPRESSION_ORALE_FERMETURE],
    [EXPRESSION_ECRITE_OUVERTURE, EXPRESSION_ECRITE_FERMETURE],
    [DICTEE_SUPPRIMEE_OUVERTURE, DICTEE_SUPPRIMEE_FERMETURE],
    [COMPREHENSION_SUPPRIMEE_OUVERTURE, COMPREHENSION_SUPPRIMEE_FERMETURE],
    [DICTEE_AU_TABLEAU_OUVERTURE, DICTEE_AU_TABLEAU_FERMETURE],
  ];

  return blocs.reduce(
    (texteCourant, [ouverture, fermeture]) =>
      retirerBloc(texteCourant, ouverture, fermeture),
    sansMarqueurs,
  );
}

/**
 * Découpe le texte en segments pour l'affichage.
 * @returns [{ type: 'texte' | 'ardoise', contenu: string }]
 */
export function decouper(texte) {
  const segments = [];

  // La dictée et l’écoute en langue étudiée sont retirées AVANT tout le
  // reste : ce sont les seules choses du flux qui s’entendent sans jamais
  // se voir.
  let reste = retirerEcouteLangue(retirerDictees(retirerMarqueurs(texte)));

  // UNE BALISE COUPÉE EN DEUX NE S'AFFICHE PAS.
  //
  // Pendant le flux, « [DICT » ou « [ARDO » arrive seul et s'affichait tel
  // quel sous les yeux de l'élève avant de disparaître au fragment suivant.
  // `texteParle` se protégeait déjà de ce cas ; l'affichage, non.
  const balisePartielle = reste.lastIndexOf('[');
  if (balisePartielle !== -1 && !reste.slice(balisePartielle).includes(']')) {
    reste = reste.slice(0, balisePartielle);
  }

  while (reste.length > 0) {
    const debut = reste.indexOf(OUVERTURE);

    if (debut === -1) {
      if (reste.trim()) segments.push({ type: 'texte', contenu: reste });
      break;
    }

    const avant = reste.slice(0, debut);
    if (avant.trim()) segments.push({ type: 'texte', contenu: avant });

    const apres = reste.slice(debut + OUVERTURE.length);
    const fin = apres.indexOf(FERMETURE);

    if (fin === -1) {
      // Ardoise encore ouverte : le flux n'est pas terminé. On affiche ce
      // qu'on a déjà, l'affichage se complètera au fragment suivant.
      if (apres.trim()) segments.push({ type: 'ardoise', contenu: apres });
      break;
    }

    segments.push({ type: 'ardoise', contenu: apres.slice(0, fin) });
    reste = apres.slice(fin + FERMETURE.length);
  }

  return segments;
}

/**
 * Ce message a-t-il quoi que ce soit à montrer à l'élève ?
 *
 * Tout ce qui est destiné à l'application — marqueurs, rapport, fiche — est
 * retiré à l'affichage, et il reste des messages dont il ne subsiste rien.
 * `decouper` renvoie alors une liste vide, mais la bulle qui l'entoure était
 * dessinée quand même.
 */
export function aQuelqueChoseAMontrer(texte) {
  return decouper(texte ?? '').length > 0;
}

/**
 * Retire les sauts de ligne autour d'un contenu d'ardoise, SANS toucher à
 * l'indentation de la première ligne.
 *
 * Un trim() classique mangerait les espaces qui placent le sommet d'une figure
 * géométrique, et décalerait le A d'un triangle par rapport à ses côtés.
 */
export function nettoyerArdoise(contenu) {
  return contenu.replace(/^\n+/, '').replace(/\s+$/, '');
}

/**
 * Tous les contenus d'ardoise d'un texte, dans l'ordre.
 * Sert à alimenter le tableau affiché à côté de la conversation.
 */
export function extraireArdoises(texte) {
  return decouper(texte ?? '')
    .filter((segment) => segment.type === 'ardoise')
    .map((segment) => nettoyerArdoise(segment.contenu))
    .filter(Boolean);
}

/**
 * Ne retourne que ce qui doit être prononcé.
 *
 * Si une ardoise est ouverte mais pas encore refermée, on s'arrête avant :
 * prononcer un contenu d'ardoise partiel donnerait « trois barre oblique
 * quatre plus un barre oblique... » en plein milieu.
 */
export function texteParle(texte, { bornes = false } = {}) {
  let sortie = '';

  // Les BALISES de dictée tombent, son CONTENU reste : c'est exactement
  // l'inverse de l'affichage.
  //
  // AVEC `bornes`, elles sont remplacées par deux caractères de contrôle au
  // lieu d'être supprimées. C'EST CE QUI PERMET DE RALENTIR LA DICTÉE SANS
  // RALENTIR LE RESTE DU MESSAGE.
  //
  // Le mode s'appliquait à tout le tour de parole, au motif que la consigne
  // interdit au professeur de mettre autre chose dans un message de dictée.
  // Il en met. Sa phrase d'annonce était donc traitée comme une phrase dictée
  // et recevait sa pause : l'élève attendait vingt secondes AVANT le premier
  // mot, alors que le silence doit tomber ENTRE les phrases.
  //
  // Ces deux bornes voyagent dans le texte prononcé et n'en sortent qu'au
  // moment de la mise en file. Invisibles, jamais prononçables, elles ne
  // coûtent rien au découpage incrémental — qui continue de travailler sur
  // une simple chaîne et ses index.
  let reste = retirerMarqueurs(texte)
    .split(DICTEE_CLAVIER).join(bornes ? DEBUT_DICTEE : '')
    .split(DICTEE_OUVERTURE).join(bornes ? DEBUT_DICTEE : '')
    .split(DICTEE_FERMETURE).join(bornes ? FIN_DICTEE : '');

  // Une paire de bornes par langue, mais une seule fermeture pour toutes :
  // voir le commentaire sur `LANGUES_ECOUTE`.
  for (const [ouverture, fermeture, debut] of LANGUES_ECOUTE) {
    reste = reste
      .split(ouverture).join(bornes ? debut : '')
      .split(fermeture).join(bornes ? FIN_ECOUTE : '');
  }

  while (reste.length > 0) {
    const debut = reste.indexOf(OUVERTURE);

    if (debut === -1) {
      sortie += reste;
      break;
    }

    sortie += reste.slice(0, debut);

    const apres = reste.slice(debut + OUVERTURE.length);
    const fin = apres.indexOf(FERMETURE);

    if (fin === -1) break; // ardoise ouverte : on ne va pas plus loin

    reste = apres.slice(fin + FERMETURE.length);
  }

  // Une balise partielle en fin de flux (« [ARDO ») ne doit pas être lue.
  const balisePartielle = sortie.lastIndexOf('[');
  if (balisePartielle !== -1 && !sortie.slice(balisePartielle).includes(']')) {
    sortie = sortie.slice(0, balisePartielle);
  }

  return sortie;
}
