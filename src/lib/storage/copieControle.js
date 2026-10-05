import { CORRECTION_TERMINEE, ERREUR_CORRECTION, FIN_SEANCE } from './ardoise';

/**
 * LA COPIE D'UN CONTRÔLE PASSÉ, REGARDÉE AVEC LE PROFESSEUR.
 *
 * Voulu par Camara le 13/09/2026. Après le contrôle, le professeur demande
 * comment ça s'est passé ; s'il propose de regarder la copie, [COPIE_CONTROLE]
 * est dans son message — écrit par lui, ou ajouté par le serveur s'il a
 * réclamé la copie sans l'écrire : la question est OBLIGATOIRE. L'écran
 * demande alors :
 *
 *   « L'énoncé et ta copie sont-ils séparés ? »  [Oui] [Non]
 *
 *   - Oui → Importer l'énoncé · Importer ma copie · Scanner ma copie
 *   - Non → Importer ma copie · Scanner ma copie
 *
 * Le professeur n'analyse rien avant d'avoir TOUT reçu — et ce n'est pas une
 * consigne qu'on lui demande de retenir : le serveur le lui rappelle à chaque
 * tour, d'après ce qu'il a enregistré.
 *
 * LA RÉPONSE OUI/NON NE PASSE PAS PAR UN MESSAGE : un clic partait autrefois
 * au professeur, qui y répondait « j'ai bien reçu » à une pièce inexistante.
 * Elle est enregistrée à part, et connue ici par `choixParDemande`. Les pièces,
 * elles, sont des messages avec un marqueur en français, lisible tel quel par
 * le professeur dans l'historique : « [ÉNONCÉ DU CONTRÔLE n° 42] ».
 *
 * LES MARQUEURS SONT PARTAGÉS AVEC LE SERVEUR, MOT POUR MOT : voir
 * `LecteurCopieControle.cs`.
 */

const DEMANDE = /\[COPIE_CONTROLE\]([\s\S]*?)\[\/COPIE_CONTROLE\]/i;
const CHOIX = /\[COPIE DU CONTR[ÔO]LE n°\s?(\d+)\s?:\s?([^\]]+)\]/i;

// Crochet fermant juste après le numéro : c'est ce qui distingue une pièce
// (« n° 42] ») d'un choix (« n° 42 : … »).
const PIECE = /\[([ÉE]NONC[ÉE]|COPIE) DU CONTR[ÔO]LE n°\s?(\d+)\]/i;

// « [CORRECTION DU CONTRÔLE n° 42 : aide-moi à me corriger] » — le choix de
// correction, une fois la copie reçue. Voir `marquerStyleCorrection`.
const STYLE = /\[CORRECTION DU CONTR[ÔO]LE n°\s?(\d+)\s?:\s?([^\]]+)\]/i;

const TOUS_LES_MARQUEURS = /\n?\[(?:[ÉE]NONC[ÉE]|COPIE|CORRECTION) DU CONTR[ÔO]LE n°\s?\d+(?:\s?:\s?[^\]]*)?\]/gi;

export const CHOIX_SEPARES = 'énoncé et copie séparés';
export const CHOIX_MEME_COPIE = 'énoncé et réponses sur la même copie';

export const QUESTION_COPIE = 'L’énoncé et ta copie sont-ils séparés ?';

/** Le numéro du contrôle dont le professeur propose de regarder la copie, ou `null`. */
export function lireDemandeCopie(texte) {
  const bloc = DEMANDE.exec(texte ?? '');
  if (!bloc) return null;

  const numero = /\d+/.exec(bloc[1]);
  return numero ? Number(numero[0]) : null;
}

/**
 * `{ controleId, separee }`, ou `null`. Ne sert plus qu'à relire l'historique
 * d'avant le 13/09/2026, quand le choix partait encore comme un message.
 */
export function lireChoixCopie(texte) {
  const choix = CHOIX.exec(texte ?? '');
  if (!choix) return null;

  return { controleId: Number(choix[1]), separee: !/m[êe]me/i.test(choix[2]) };
}

/** `{ controleId, role: 'enonce' | 'copie' }`, ou `null`. */
export function lirePieceControle(texte) {
  const piece = PIECE.exec(texte ?? '');
  if (!piece) return null;

  return { controleId: Number(piece[2]), role: /^copie/i.test(piece[1]) ? 'copie' : 'enonce' };
}

/** L'ancien message de choix — gardé pour les tests de compatibilité de l'historique. */
export function marquerChoixCopie(separee, controleId) {
  const phrase = separee ? 'Oui, ils sont séparés.' : 'Non, tout est sur la même copie.';
  return `${phrase}\n[COPIE DU CONTRÔLE n° ${controleId} : ${separee ? CHOIX_SEPARES : CHOIX_MEME_COPIE}]`;
}

/**
 * Le message qui accompagne une pièce envoyée depuis la carte.
 *
 * S'il n'a rien écrit — le cas presque constant, il vient de cliquer un
 * bouton —, sa bulle dit quand même ce qu'il envoie : une photo seule dans le
 * fil ne dit pas si c'est l'énoncé ou la copie.
 */
export function marquerPieceControle(texte, role, controleId) {
  const propre = (texte ?? '').trim()
    || (role === 'enonce' ? 'Voici l’énoncé de mon contrôle.' : 'Voici ma copie.');

  return `${propre}\n[${role === 'enonce' ? 'ÉNONCÉ' : 'COPIE'} DU CONTRÔLE n° ${controleId}]`;
}

/**
 * COMMENT CORRIGER LA COPIE — Camara, le 26/09/2026, sur la remontée d'un
 * parent : sa fille voulait se corriger seule, et le professeur lui a donné
 * les réponses.
 *
 * Une fois la copie reçue, la carte demande « Comment veux-tu corriger ta
 * copie ? ». Le professeur n'analyse rien avant la réponse, et le serveur lui
 * rappelle ensuite ce choix à CHAQUE tour. En « Je t'aide à te corriger », il
 * ne donne jamais la réponse ; seul l'enfant peut en sortir, par
 * « Finalement, corrige et explique-moi ».
 *
 * Les valeurs sont celles du serveur (`StylesCorrection`), et le marqueur est
 * lu mot pour mot par `LecteurCopieControle.LireStyle`.
 */
export const STYLE_AIDE = 'aide';
export const STYLE_EXPLIQUE = 'explique';

const PHRASE_STYLE = {
  [STYLE_AIDE]: 'Aide-moi à me corriger.',
  [STYLE_EXPLIQUE]: 'Corrige et explique-moi.',
};

const CHOIX_STYLE = {
  [STYLE_AIDE]: 'aide-moi à me corriger',
  [STYLE_EXPLIQUE]: 'corrige et explique-moi',
};

/** Le message envoyé au clic : une phrase pour la bulle, un marqueur pour le professeur. */
export function marquerStyleCorrection(style, controleId) {
  return `${PHRASE_STYLE[style]}\n[CORRECTION DU CONTRÔLE n° ${controleId} : ${CHOIX_STYLE[style]}]`;
}

/** `{ controleId, style }`, ou `null`. Même règle que le serveur : « aide-moi » ou « me corriger » = il se corrige seul. */
export function lireStyleCorrection(texte) {
  const style = STYLE.exec(texte ?? '');
  if (!style) return null;

  const seul = /aide-moi|me corriger/i.test(style[2]);
  return { controleId: Number(style[1]), style: seul ? STYLE_AIDE : STYLE_EXPLIQUE };
}

/** Toutes les pièces annoncées dans le message, dans l'ordre : `[{ controleId, role }]`. */
export function lirePiecesControle(texte) {
  const toutes = new RegExp(PIECE.source, 'gi');
  return Array.from((texte ?? '').matchAll(toutes)).map((m) => ({
    controleId: Number(m[2]),
    role: /^copie/i.test(m[1]) ? 'copie' : 'enonce',
  }));
}

/**
 * L'ÉNONCÉ ET LA COPIE ENVOYÉS ENSEMBLE — Camara, le 26/09/2026. La carte les
 * garde jusqu'à ce que tout soit importé, puis ce message les porte d'un
 * coup : une phrase pour la bulle, un marqueur par document, DANS L'ORDRE des
 * documents joints. Lu par `LecteurCopieControle.LirePieces`.
 */
export function marquerPiecesControle(texte, roles, controleId) {
  const deux = roles.includes('enonce') && roles.includes('copie');
  const propre = (texte ?? '').trim()
    || (deux ? 'Voici l’énoncé et ma copie.'
      : roles[0] === 'enonce' ? 'Voici l’énoncé de mon contrôle.' : 'Voici ma copie.');

  const marqueurs = roles
    .map((role) => `[${role === 'enonce' ? 'ÉNONCÉ' : 'COPIE'} DU CONTRÔLE n° ${controleId}]`)
    .join('\n');

  return `${propre}\n${marqueurs}`;
}

/** Retire les marqueurs pour l'affichage : ils sont écrits pour le professeur, pas pour l'élève. */
export function retirerMarqueurCopieControle(texte) {
  return (texte ?? '').replace(TOUS_LES_MARQUEURS, '');
}

/**
 * Où en est la copie, d'après les messages.
 *
 * `null` quand il n'y a rien à montrer : aucune demande, ou une demande d'une
 * séance déjà close — une carte d'hier ne doit pas rester au bas du fil.
 *
 * `cle` IDENTIFIE LA DEMANDE, pas seulement le contrôle : une seconde demande
 * sur le même contrôle — une copie déjà regardée, qu'on veut revoir — repart
 * de zéro et REPOSE la question. Le serveur fait de même.
 *
 * Une pièce ne compte que si le message porte VRAIMENT un document : un
 * marqueur sans pièce ne prouve rien, et c'est la même règle côté serveur.
 */
/**
 * Ce que les messages d'élève disent de la copie, à partir du message `depuis`
 * (exclu) jusqu'à `jusqua` (exclu).
 *
 * UN MESSAGE PEUT PORTER L'ÉNONCÉ ET LA COPIE ENSEMBLE — Camara, le
 * 26/09/2026 : la carte les garde jusqu'à ce que tout soit importé, puis les
 * envoie d'un coup. Ses marqueurs et ses documents sont dans le même ordre ;
 * un marqueur ne compte que s'il a SON document.
 */
function lireCopie(liste, depuis, jusqua, controleId) {
  let separee = null;
  let enonceRecu = false;
  let copieRecue = false;

  liste
    .slice(depuis + 1, jusqua)
    .filter((m) => m.role === 'user')
    .forEach((m) => {
      const choix = lireChoixCopie(m.contenu);
      if (choix && choix.controleId === controleId) {
        separee = choix.separee;
        if (!choix.separee) enonceRecu = false;
      }

      const documents = m.piecesJointes?.length ?? (m.pieceJointe ? 1 : 0);

      lirePiecesControle(m.contenu).slice(0, documents).forEach((piece) => {
        if (piece.controleId !== controleId) return;

        if (piece.role === 'enonce') {
          enonceRecu = true;
          // Un énoncé envoyé à part prouve que les feuilles sont séparées.
          separee = true;
        } else {
          copieRecue = true;
        }
      });
    });

  return { separee, enonceRecu, copieRecue };
}

export function etatCopieControle(messages, choixParDemande = {}) {
  const liste = messages ?? [];

  const demandes = [];

  for (let i = 0; i < liste.length; i += 1) {
    if (liste[i]?.role === 'assistant') {
      const id = lireDemandeCopie(liste[i].contenu);
      if (id !== null) demandes.push({ index: i, controleId: id });
    }
  }

  if (demandes.length === 0) return null;

  const derniere = demandes[demandes.length - 1];
  const { controleId } = derniere;

  const close = (liste[derniere.index].contenu ?? '').includes(FIN_SEANCE)
    || liste.slice(derniere.index + 1)
      .some((m) => m.role === 'assistant' && (m.contenu ?? '').includes(FIN_SEANCE));

  if (close) return null;

  // UNE DEMANDE RÉPÉTÉE PENDANT QU'ON ATTEND LA COPIE N'EN OUVRE PAS UNE
  // NOUVELLE — relevé par Camara le 26/09/2026 : l'énoncé reçu, le professeur
  // réclamait la copie en réécrivant le bloc, et la question « séparés ? »
  // revenait, l'énoncé oublié. On remonte donc aux demandes précédentes du
  // MÊME contrôle tant que la copie n'était pas complète au moment de la
  // suivante, et sans fin de séance entre les deux. Une copie COMPLÈTE
  // redemandée, elle, repart bien de zéro. Même règle que le serveur
  // (`OuvrirCopieAsync`).
  let debutCopie = derniere.index;

  for (let k = demandes.length - 2; k >= 0; k -= 1) {
    const precedente = demandes[k];
    if (precedente.controleId !== controleId) break;

    const entre = liste.slice(precedente.index, debutCopie);
    if (entre.some((m) => m.role === 'assistant' && (m.contenu ?? '').includes(FIN_SEANCE))) break;

    const avant = lireCopie(liste, precedente.index, debutCopie, controleId);
    const separeeAvant = avant.separee ?? choixParDemande?.[`${precedente.index}:${controleId}`] ?? null;
    const completeAvant = avant.copieRecue && (separeeAvant === false || avant.enonceRecu);

    if (completeAvant) break;
    debutCopie = precedente.index;
  }

  const cle = `${debutCopie}:${controleId}`;
  const lu = lireCopie(liste, debutCopie, liste.length, controleId);

  let { separee } = lu;
  const choixConnu = choixParDemande?.[cle];
  if (separee === null && typeof choixConnu === 'boolean') separee = choixConnu;

  const { enonceRecu, copieRecue } = lu;
  const complet = copieRecue && (separee === false || enonceRecu);

  const correction = lireCorrection(liste, debutCopie, controleId);

  return {
    cle, controleId, separee, enonceRecu, copieRecue, complet, ...correction,
  };
}

/**
 * LA CORRECTION, ERREUR PAR ERREUR — Camara, le 26/09/2026 : « à chaque
 * erreur, la question de l'aide ou de la correction + explication apparaît,
 * et ainsi de suite jusqu'à la fin de la correction de toutes les erreurs ».
 *
 * Le professeur ouvre chaque erreur par « [ERREUR n/N] » et clôt la correction
 * par « [CORRECTION_TERMINEE] ». Le style vaut pour L'ERREUR EN COURS : c'est
 * le dernier choix de l'enfant APRÈS la dernière balise d'erreur. Une nouvelle
 * erreur n'a donc pas de style, et la carte repose la question.
 *
 * Même lecture que le serveur (`LecteurCopieControle.EtatCorrection`).
 */
function lireCorrection(liste, debut, controleId) {
  let indexErreur = -1;
  let erreur = null;
  let total = null;
  let termine = false;

  for (let i = debut + 1; i < liste.length; i += 1) {
    const m = liste[i];
    if (m?.role === 'assistant') {
      const contenu = m.contenu ?? '';
      const balises = Array.from(contenu.matchAll(new RegExp(ERREUR_CORRECTION.source, 'gi')));
      const derniere = balises[balises.length - 1];
      const fin = contenu.lastIndexOf(CORRECTION_TERMINEE);

      if (derniere) {
        indexErreur = i;
        erreur = Number(derniere[1]);
        total = derniere[2] ? Number(derniere[2]) : total;
        termine = false;
      }

      if (fin !== -1 && (!derniere || fin > derniere.index)) termine = true;
    }
  }

  let style = null;

  if (indexErreur !== -1 && !termine) {
    liste.slice(indexErreur + 1)
      .filter((m) => m.role === 'user')
      .forEach((m) => {
        // Le DERNIER choix l'emporte : « Finalement, corrige et explique-moi »
        // remplace « Aide-moi à me corriger » pour cette erreur.
        const choix = lireStyleCorrection(m.contenu);
        if (choix && choix.controleId === controleId) style = choix.style;
      });
  }

  return {
    erreur, total, style, termine,
  };
}

/**
 * Les boutons à proposer — exactement ceux que Camara a décrits.
 *
 * Un bouton disparaît dès que sa pièce est arrivée : proposer encore
 * « Importer l'énoncé » après l'avoir reçu ferait croire à l'élève qu'il ne
 * l'a pas été.
 */
export function boutonsCopie(etat, { photo = false } = {}) {
  if (!etat || etat.separee === null || etat.complet) return [];

  // LES MÊMES MOYENS POUR LES DEUX FEUILLES — Camara, le 26/09/2026 : importer
  // un fichier, la prendre en photo avec la caméra de l'ordinateur (`photo`,
  // quand il y en a une), ou la scanner avec le téléphone. Sur téléphone,
  // « Scanner » ouvre directement l'appareil photo.
  const pour = (role) => {
    const nom = role === 'enonce' ? 'l’énoncé' : 'ma copie';
    return [
      { cle: `importer-${role}`, libelle: `Importer ${nom}`, role, geste: 'fichier', scanner: false },
      ...(photo
        ? [{ cle: `photo-${role}`, libelle: `Photographier ${nom}`, role, geste: 'photo', scanner: false }]
        : []),
      { cle: `scanner-${role}`, libelle: `Scanner ${nom}`, role, geste: 'scan', scanner: true },
    ];
  };

  return [
    ...(etat.separee && !etat.enonceRecu ? pour('enonce') : []),
    ...(!etat.copieRecue ? pour('copie') : []),
  ];
}
