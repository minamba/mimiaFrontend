import httpClient from './httpClient';

/**
 * Ce que l'oreille de l'élève a attendu, remonté au serveur.
 *
 * POURQUOI CE FICHIER EXISTE
 * --------------------------
 * Le délai « le professeur a quelque chose à dire → première syllabe entendue »
 * était mesuré depuis longtemps, mais il ne sortait pas du navigateur : un
 * `console.info` coupé en production. La seule question qui compte pour un test
 * avec de vraies familles — « est-ce que ça paraît lent CHEZ EUX ? » — n'avait
 * donc aucune réponse chez eux, précisément.
 *
 * ON NE BLOQUE JAMAIS SUR UNE MESURE
 * ----------------------------------
 * Aucun `await` n'est attendu par l'appelant, et toute erreur est avalée. Une
 * séance ne doit ni ralentir ni afficher quoi que ce soit parce qu'un chiffre
 * n'a pas pu être enregistré : l'enfant travaille, il n'est pas notre sonde.
 */

/**
 * L'identifiant de la séance en cours.
 *
 * Tiré au sort, gardé en mémoire, jamais écrit sur le disque. Il sert
 * uniquement à regrouper les mesures d'une même séance pour en calculer une
 * médiane — sans lui, on ne saurait pas distinguer « une famille avec une
 * mauvaise connexion » de « tout le monde a un problème ».
 *
 * Il ne désigne personne et ne survit pas à la fermeture de l'onglet : deux
 * séances du même enfant portent deux tirages différents, et rien ne permet de
 * les rapprocher.
 */
let seance = null;

function identifiantDeSeance() {
  if (seance) return seance;

  seance = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    // Repli pour les contextes non sécurisés, où `crypto.randomUUID` n'existe
    // pas. La qualité du tirage n'a aucune importance ici : on regroupe des
    // mesures, on ne protège rien.
    : `s-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9).toString(36)}`;

  return seance;
}

/** Ouvre une nouvelle séance de mesure. Appelé à l'ouverture d'un cours. */
export function nouvelleSeanceDeMesure() {
  seance = null;
  return identifiantDeSeance();
}

/**
 * Enregistre un délai. `repli` dit que la voix du navigateur a pris le relais,
 * ce qui rend le délai sans objet mais l'événement d'autant plus intéressant.
 */
export function mesurerVoix({
  delaiMs = 0,
  repli = false,

  // Les trois maillons qui manquaient au décompte. `null` quand la mesure n'a
  // pas de sens pour ce tour — l'élève a écrit au lieu de parler, ou le
  // transcripteur a tranché avant qu'on ne clôture.
  transcriptionMs = null,
  assemblageMs = null,
  reponseMs = null,
} = {}) {
  const arrondi = (ms) => (typeof ms === 'number' && ms >= 0 ? Math.round(ms) : null);

  try {
    httpClient
      .post('/mesures/voix', {
        seance: identifiantDeSeance(),
        delaiMs: Math.round(delaiMs),
        repli,
        transcriptionMs: arrondi(transcriptionMs),
        assemblageMs: arrondi(assemblageMs),
        reponseMs: arrondi(reponseMs),
      })
      .catch(() => {});
  } catch {
    // Rien. Voir l'en-tête : une mesure ne gêne jamais une séance.
  }
}

/**
 * CE QUE LE MICRO A RÉELLEMENT DONNÉ — Camara, le 16/09/2026 : trois familles,
 * trois PC, « comme si leur micro était en mute », casque ou haut-parleur, et
 * rien à reproduire sur son Mac, son PC ni son téléphone.
 *
 * QUAND ON NE PEUT PAS REPRODUIRE, ON FAIT REMONTER. Ce relevé part une fois
 * par écoute, quelques secondes après l'ouverture du micro : le navigateur, le
 * périphérique choisi, si la piste est muette aux yeux du système, les
 * fréquences, le niveau maximal capté, la liste des entrées audio. Un relevé
 * SAIN part aussi : c'est en comparant les machines qui marchent à celles qui
 * ne marchent pas qu'on trouve ce qu'elles ont de différent.
 *
 * Côté serveur, il n'est QUE journalisé — pas de table, pas de migration à la
 * veille du lancement : on lit les logs du conteneur.
 *
 * AUCUNE DONNÉE PERSONNELLE : ni identifiant d'élève, ni son. Le nom d'un micro
 * (« Realtek High Definition Audio ») décrit une machine, pas une personne.
 */
export function mesurerMicro(diagnostic = {}) {
  const texte = (valeur, max) => (typeof valeur === 'string' && valeur ? valeur.slice(0, max) : null);
  const nombre = (valeur) => (typeof valeur === 'number' && Number.isFinite(valeur) ? valeur : null);

  try {
    httpClient
      .post('/mesures/micro', {
        seance: identifiantDeSeance(),
        moteur: texte(diagnostic.moteur, 20) ?? 'temps-reel',
        muet: Boolean(diagnostic.muet),
        pisteMuette: Boolean(diagnostic.pisteMuette),
        erreur: texte(diagnostic.erreur, 60),
        peripherique: texte(diagnostic.peripherique, 120),
        entrees: texte(diagnostic.entrees, 400),
        etatPiste: texte(diagnostic.etatPiste, 20),
        frequencePiste: nombre(diagnostic.frequencePiste),
        frequenceContexte: nombre(diagnostic.frequenceContexte),
        niveauMax: nombre(diagnostic.niveauMax),
        secondes: nombre(diagnostic.secondes),
        navigateur: texte(typeof navigator !== 'undefined' ? navigator.userAgent : null, 300),
      })
      .catch(() => {});
  } catch {
    // Rien. Voir l'en-tête : une mesure ne gêne jamais une séance.
  }
}
