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
 * L'ANGLAIS PRONONCÉ, ET LES BORNES QUI LE SIGNALENT À LA VOIX.
 *
 * Le passage qu'elles entourent part à la synthèse avec une consigne de
 * langue ; le reste du message continue en français. C'est ce qui permet de
 * garder le principe pédagogique — on EXPLIQUE en français, on PRATIQUE en
 * anglais — tout en rendant l'écoute possible.
 *
 * DIT MAIS PAS ÉCRIT, exactement comme la dictée : afficher le texte pendant
 * qu'on le prononce supprimerait l'exercice, l'élève lirait au lieu
 * d'écouter.
 *
 * Deux caractères de contrôle de plus, choisis pour les mêmes raisons que
 * ceux de la dictée — aucun texte de professeur n'en contient, aucune
 * synthèse ne saurait les prononcer.
 */
const ANGLAIS_OUVERTURE = '[EN]';
const ANGLAIS_FERMETURE = '[/EN]';

export const DEBUT_ANGLAIS = '\u0003';
export const FIN_ANGLAIS = '\u0004';

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
 * Retire les passages d'anglais oral : ce qui se prononce pour être écouté
 * ne s'affiche pas, sinon l'élève lit la réponse au lieu de l'entendre.
 *
 * Tolère un bloc encore ouvert, comme la dictée : pendant le flux, la
 * fermeture n'est pas encore arrivée et le texte ne doit surtout pas
 * apparaître en attendant.
 */
function retirerAnglaisOral(texte) {
  let sortie = '';
  let reste = texte;

  while (reste.length > 0) {
    const debut = reste.indexOf(ANGLAIS_OUVERTURE);

    if (debut === -1) { sortie += reste; break; }

    sortie += reste.slice(0, debut);

    const apres = reste.slice(debut + ANGLAIS_OUVERTURE.length);
    const fin = apres.indexOf(ANGLAIS_FERMETURE);

    if (fin === -1) break;

    reste = apres.slice(fin + ANGLAIS_FERMETURE.length);
  }

  return sortie;
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

/** Marqueur posé par le professeur au moment où le contrôle commence. */
export const EVAL_DEBUT = '[DEBUT_EVALUATION]';

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

/**
 * L'élève demande-t-il à s'arrêter ?
 *
 * On lit son DERNIER message : c'est celui auquel le professeur répond.
 */
export function demandeArret(texte) {
  if (!texte) return false;

  // Accents retirés, apostrophes ET traits d'union ramenés à l'espace : la
  // dictée vocale écrit « j'arrête », le clavier « j arrete », l'apostrophe
  // typographique diffère de celle du clavier, et « week-end » s'écrit aussi
  // « week end » ou « weekend ». Toutes ces formes doivent se valoir.
  const propre = texte
    .normalize('NFD')
    .replace(new RegExp('[\\u0300-\\u036f]', 'g'), '')
    .replace(/['’`-]/g, ' ')
    .toLowerCase();

  return DEPARTS.some((motif) => motif.test(propre));
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
    .split(FIN_SEANCE).join('')
    .split(TABLEAU_EFFACE).join('');

  const blocs = [
    [EVAL_OUVERTURE, EVAL_FERMETURE],
    [RAPPORT_OUVERTURE, RAPPORT_FERMETURE],
    [FICHE_OUVERTURE, FICHE_FERMETURE],
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

  // La dictée et l’anglais oral sont retirés AVANT tout le reste : ce sont les
  // deux seules choses du flux qui s’entendent sans jamais se voir.
  let reste = retirerAnglaisOral(retirerDictees(retirerMarqueurs(texte)));

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
    .split(DICTEE_FERMETURE).join(bornes ? FIN_DICTEE : '')
    .split(ANGLAIS_OUVERTURE).join(bornes ? DEBUT_ANGLAIS : '')
    .split(ANGLAIS_FERMETURE).join(bornes ? FIN_ANGLAIS : '');

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
