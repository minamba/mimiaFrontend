/**
 * Le début de la séance en cours, qui survit à un rechargement de page.
 *
 * POURQUOI ÇA NE POUVAIT PAS RESTER EN MÉMOIRE
 * -------------------------------------------
 * Le chronomètre partait de `Date.now()` au montage du composant. Un F5 le
 * remettait donc à zéro, et avec lui TOUT ce qui en dépend : le temps restant
 * annoncé au professeur redevenait complet — donc il ne concluait plus —, la
 * séance terminée cessait de l'être, et l'évaluation des compétences, qui se
 * déclenche à la clôture, ne partait jamais.
 *
 * L'argent, lui, n'était pas en jeu : le quota est débité côté serveur à chaque
 * tour de parole, sur le temps réellement écoulé. Rafraîchir n'offrait pas de
 * minutes, ça désorganisait la séance.
 *
 * POURQUOI PAS CÔTÉ SERVEUR
 * -------------------------
 * Le serveur ne tient pas l'horloge de la séance, et c'est délibéré : c'est le
 * navigateur qui sait quand l'élève est entré, quelle durée il a choisie, et
 * quand il a relancé. Y remonter cette responsabilité demanderait une colonne,
 * une migration et un accord entre deux horloges. Ici, on ne fait que rendre
 * durable ce que la page savait déjà.
 *
 * CE QUI EST GARDÉ, ET CE QUI NE L'EST PAS
 * ----------------------------------------
 * Une séance abandonnée hier ne doit pas reprendre son décompte aujourd'hui :
 * l'enfant retrouverait un chronomètre à zéro minute restante sans comprendre.
 * Un départ trop vieux est donc ignoré, et la séance repart proprement.
 */

const CLE = 'mimia.seance.depart';

/**
 * Au-delà, on ne reprend plus : ce n'est plus un rafraîchissement, c'est une
 * autre journée. Six heures couvrent largement la plus longue séance (45 min)
 * et les pauses qu'un enfant peut prendre au milieu.
 */
const PEREMPTION_MS = 6 * 60 * 60 * 1000;

const lire = () => {
  try {
    const brut = window.localStorage.getItem(CLE);
    return brut ? JSON.parse(brut) : null;
  } catch {
    // Stockage indisponible — navigation privée, quota plein, réglage strict.
    // La séance doit avoir lieu quand même : on retombe sur l'ancien
    // comportement, un départ à l'instant.
    return null;
  }
};

/**
 * Le départ enregistré vaut-il encore ? Une séance en pause se périme à partir de
 * sa pause, et non de son départ : le temps de pause ne compte pas comme du cours.
 */
const pasPerimee = (enregistre, maintenant) =>
  maintenant - (enregistre.pauseDepuis ?? enregistre.depart) < PEREMPTION_MS;

/**
 * L'instant où la séance a commencé.
 *
 * Reprend celui qui est enregistré s'il concerne la même séance, le même
 * enfant et la même matière ; en pose un nouveau sinon.
 *
 * `seance` est le compteur de relances : il change quand l'élève repart pour un
 * tour, et c'est ce qui distingue « je rafraîchis » de « je recommence ».
 */
export function departDeLaSeance({ eleveId, matiereId, seance }) {
  const maintenant = Date.now();
  const enregistre = lire();

  const memeSeance =
    enregistre
    && enregistre.eleveId === eleveId
    && enregistre.matiereId === matiereId
    && enregistre.seance === seance
    && typeof enregistre.depart === 'number'
    && pasPerimee(enregistre, maintenant);

  if (memeSeance) return enregistre.depart;

  try {
    window.localStorage.setItem(
      CLE,
      JSON.stringify({ eleveId, matiereId, seance, depart: maintenant }),
    );
  } catch {
    // Voir plus haut : on continue sans mémoire plutôt que sans séance.
  }

  return maintenant;
}

/**
 * Le temps déjà écoulé, en secondes, SANS rien enregistrer.
 *
 * Nécessaire dès le PREMIER rendu : c'est lui qui dit si la séance était déjà
 * terminée au chargement de la page. Sans cette information avant le premier
 * rendu, un rechargement sur une séance finie relance l'au revoir — et chaque
 * rechargement est un appel au modèle facturé.
 *
 * Distinct de `departDeLaSeance` parce que celui-ci ÉCRIT quand il ne trouve
 * rien, et qu'on n'écrit pas pendant le rendu d'un composant.
 */
export function ecouleDepuisLeDepart({ eleveId, matiereId, seance }) {
  const enregistre = lire();
  if (!enregistre) return 0;

  const maintenant = Date.now();

  const memeSeance =
    enregistre.eleveId === eleveId
    && enregistre.matiereId === matiereId
    && enregistre.seance === seance
    && typeof enregistre.depart === 'number'
    && pasPerimee(enregistre, maintenant);

  // En pause, le compteur s'est arrêté à la pause, même après un rechargement.
  return memeSeance
    ? Math.floor(((enregistre.pauseDepuis ?? maintenant) - enregistre.depart) / 1000)
    : 0;
}

/**
 * LA PAUSE SURVIT AU RECHARGEMENT, COMME LE DÉPART — Camara, le 03/11/2026. Un F5
 * pendant une pause la laisse en place : sans quoi le compteur repartirait tout
 * seul, et tout le temps de pause serait perdu d'un coup.
 */
const seanceEnPause = ({ eleveId, matiereId, seance }) => {
  const enregistre = lire();

  return enregistre
    && enregistre.eleveId === eleveId
    && enregistre.matiereId === matiereId
    && enregistre.seance === seance
    && typeof enregistre.depart === 'number'
    ? enregistre
    : null;
};

const ecrire = (enregistre) => {
  try {
    window.localStorage.setItem(CLE, JSON.stringify(enregistre));
  } catch {
    // Voir plus haut : on continue sans mémoire plutôt que sans séance.
  }
};

/** La séance est-elle en pause, au chargement de la page ? */
export function pauseEnregistree(seance) {
  const enregistre = seanceEnPause(seance);
  return Boolean(
    enregistre
    && typeof enregistre.pauseDepuis === 'number'
    && pasPerimee(enregistre, Date.now()),
  );
}

/** Note le début de la pause. Une pause déjà en cours garde son début. */
export function poserPause(seance) {
  const enregistre = seanceEnPause(seance);
  if (!enregistre || typeof enregistre.pauseDepuis === 'number') return;

  ecrire({ ...enregistre, pauseDepuis: Date.now() });
}

/**
 * Lève la pause : le départ avance d'autant, et le compteur repart exactement où
 * il s'était arrêté. Rend la durée de la pause, en millisecondes.
 */
export function leverPause(seance) {
  const enregistre = seanceEnPause(seance);
  if (!enregistre || typeof enregistre.pauseDepuis !== 'number') return 0;

  const duree = Math.max(0, Date.now() - enregistre.pauseDepuis);
  const { pauseDepuis, ...reste } = enregistre;
  ecrire({ ...reste, depart: enregistre.depart + duree });

  return duree;
}

/**
 * Efface le départ enregistré.
 *
 * Appelé quand l'élève quitte le cours : sans ça, revenir dans la même matière
 * quelques minutes plus tard reprendrait le décompte de la séance précédente,
 * et l'enfant retrouverait un chronomètre déjà entamé.
 */
export function oublierLeDepart() {
  try {
    window.localStorage.removeItem(CLE);
  } catch {
    // Sans importance : un départ périmé est ignoré à la lecture.
  }
}
