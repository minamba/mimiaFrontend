import { FIN_SEANCE } from './ardoise';

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

const TOUS_LES_MARQUEURS = /\n?\[(?:[ÉE]NONC[ÉE]|COPIE) DU CONTR[ÔO]LE n°\s?\d+(?:\s?:\s?[^\]]*)?\]/gi;

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
export function etatCopieControle(messages, choixParDemande = {}) {
  const liste = messages ?? [];

  let indexDemande = -1;
  let controleId = null;

  for (let i = liste.length - 1; i >= 0; i -= 1) {
    if (liste[i]?.role !== 'assistant') continue;

    const id = lireDemandeCopie(liste[i].contenu);
    if (id !== null) {
      indexDemande = i;
      controleId = id;
      break;
    }
  }

  if (indexDemande === -1) return null;

  const apres = liste.slice(indexDemande + 1);

  const close = (liste[indexDemande].contenu ?? '').includes(FIN_SEANCE)
    || apres.some((m) => m.role === 'assistant' && (m.contenu ?? '').includes(FIN_SEANCE));

  if (close) return null;

  const cle = `${indexDemande}:${controleId}`;

  let separee = null;
  let enonceRecu = false;
  let copieRecue = false;

  apres
    .filter((m) => m.role === 'user')
    .forEach((m) => {
      const choix = lireChoixCopie(m.contenu);
      if (choix && choix.controleId === controleId) {
        separee = choix.separee;
        if (!choix.separee) enonceRecu = false;
      }

      const piece = lirePieceControle(m.contenu);
      if (piece && piece.controleId === controleId && m.pieceJointe) {
        if (piece.role === 'enonce') {
          enonceRecu = true;
          // Un énoncé envoyé à part prouve que les feuilles sont séparées.
          separee = true;
        } else {
          copieRecue = true;
        }
      }
    });

  const choixConnu = choixParDemande?.[cle];
  if (separee === null && typeof choixConnu === 'boolean') separee = choixConnu;

  const complet = copieRecue && (separee === false || enonceRecu);

  return { cle, controleId, separee, enonceRecu, copieRecue, complet };
}

/**
 * Les boutons à proposer — exactement ceux que Camara a décrits.
 *
 * Un bouton disparaît dès que sa pièce est arrivée : proposer encore
 * « Importer l'énoncé » après l'avoir reçu ferait croire à l'élève qu'il ne
 * l'a pas été.
 */
export function boutonsCopie(etat) {
  if (!etat || etat.separee === null || etat.complet) return [];

  const boutons = [];

  if (etat.separee && !etat.enonceRecu) {
    boutons.push({ cle: 'importer-enonce', libelle: 'Importer l’énoncé', role: 'enonce', scanner: false });
  }

  if (!etat.copieRecue) {
    boutons.push({ cle: 'importer-copie', libelle: 'Importer ma copie', role: 'copie', scanner: false });
    boutons.push({ cle: 'scanner-copie', libelle: 'Scanner ma copie', role: 'copie', scanner: true });
  }

  return boutons;
}
