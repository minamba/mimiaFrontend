/**
 * LE RECORD PERSONNEL — Camara, le 25/09/2026.
 *
 * Le meilleur score d'un enfant à un jeu donné, pour qu'il ait quelque chose
 * à battre. C'est ce qui fait rejouer, bien plus qu'un classement : on se
 * mesure à soi, on gagne toujours un jour, et on ne se compare à personne.
 *
 * DANS LE NAVIGATEUR, ET PAS EN BASE — POUR L'INSTANT
 * ---------------------------------------------------
 * Aucun score de jeu n'est enregistré côté serveur aujourd'hui : il n'existe
 * ni table, ni route, ni entité. Passer par la base demanderait une migration,
 * et les migrations de ce projet sont écrites à la main — chacune est un
 * risque qu'on ne prend pas pour un compteur de jeu.
 *
 * Ce que ça coûte, et il faut le savoir : le record ne suit pas l'enfant d'un
 * appareil à l'autre. Il joue sur la tablette, puis sur l'ordinateur du
 * salon : deux records. C'est acceptable parce que le record sert à se
 * motiver dans l'instant, pas à faire foi. Le jour où les ligues existeront,
 * il faudra bien une table — et ce fichier sera le seul endroit à reprendre.
 *
 * UNE CLÉ PAR ENFANT, ET C'EST INDISPENSABLE
 * -------------------------------------------
 * Deux frères sur la même tablette, c'est le cas normal, pas le cas limite.
 * Sans l'identifiant de l'élève dans la clé, le petit hériterait du record du
 * grand et ne le battrait jamais — la seule chose que ce dispositif doit
 * éviter.
 *
 * ET UNE CLÉ PAR NIVEAU. Un CM2 qui rouvre un jeu de CE1 y joue une version
 * plus facile : mêler les deux records rendrait l'un des deux inatteignable.
 *
 * LE TOTAL FAIT PARTIE DU RECORD. Si un jeu passe un jour de 8 manches à 10,
 * un ancien « 7 » ne se compare plus à rien. On garde donc le total, et un
 * record d'un autre total est ignoré plutôt que comparé de travers.
 */

const CLE = 'mimia-records';

/** Au-delà, on oublie les plus vieux : le stockage local n'est pas extensible. */
const MAX = 400;

function tout() {
  try {
    const brut = window.localStorage.getItem(CLE);
    const lu = brut ? JSON.parse(brut) : null;
    return lu && typeof lu === 'object' ? lu : {};
  } catch {
    // Navigation privée, stockage bloqué, JSON abîmé : on repart de rien.
    // Un record perdu n'est pas une panne.
    return {};
  }
}

function ecrire(table) {
  try {
    window.localStorage.setItem(CLE, JSON.stringify(table));
  } catch {
    /* sans stockage, pas de record. Le jeu marche exactement pareil. */
  }
}

function cleDe(eleveId, jeu, niveau) {
  return `${eleveId}|${jeu}|${niveau}`;
}

/**
 * Le meilleur score connu pour ce jeu, ou null.
 *
 * `null` veut dire « on ne sait pas », jamais « zéro » : la nuance décide de
 * ce qui s'affiche à l'écran de fin.
 */
export function meilleur(eleveId, jeu, niveau, total) {
  if (!eleveId || !jeu) return null;

  const ligne = tout()[cleDe(eleveId, jeu, niveau)];
  if (!ligne || typeof ligne.score !== 'number') return null;

  // Le jeu a changé de longueur depuis : l'ancien record ne veut plus rien
  // dire. On l'ignore, il sera remplacé à la fin de cette partie.
  if (total && ligne.total !== total) return null;

  return ligne.score;
}

/**
 * Enregistre une partie finie, et dit ce qu'elle valait.
 *
 * Rend `{ precedent, record }` : le meilleur score AVANT cette partie (ou
 * null), et si celle-ci l'a battu. L'écran de fin n'a besoin de rien d'autre.
 *
 * ÉGALER N'EST PAS BATTRE. Annoncer « nouveau record » sur un score identique
 * userait le mot en trois parties, et c'est le mot qui fait rejouer.
 */
export function enregistrer(eleveId, jeu, niveau, score, total) {
  if (!eleveId || !jeu || typeof score !== 'number') {
    return { precedent: null, record: false };
  }

  const table = tout();
  const cle = cleDe(eleveId, jeu, niveau);
  const ligne = table[cle];

  const comparable = ligne && ligne.total === total && typeof ligne.score === 'number';
  const precedent = comparable ? ligne.score : null;
  const record = precedent === null ? false : score > precedent;

  if (precedent === null || score > precedent) {
    table[cle] = { score, total, le: new Date().toISOString() };

    // LE MÉNAGE SE FAIT ICI, pas dans un balayage à part : c'est le seul
    // moment où l'on écrit. On garde les plus récents.
    const cles = Object.keys(table);
    if (cles.length > MAX) {
      cles
        .sort((a, b) => String(table[a].le ?? '').localeCompare(String(table[b].le ?? '')))
        .slice(0, cles.length - MAX)
        .forEach((vieille) => { delete table[vieille]; });
    }

    ecrire(table);
  }

  return { precedent, record };
}

/**
 * Le record complet — score ET total — ou null.
 *
 * SÉPARÉ DE `meilleur` parce que l'écran du choix ne connaît pas encore le
 * nombre de manches du jeu : il n'a pas ouvert le jeu, justement. Il a donc
 * besoin qu'on lui rende le total avec le score, faute de quoi il afficherait
 * un « 8 » tout seul, qui ne veut rien dire.
 */
export function recordDe(eleveId, jeu, niveau) {
  if (!eleveId || !jeu) return null;

  const ligne = tout()[cleDe(eleveId, jeu, niveau)];
  if (!ligne || typeof ligne.score !== 'number') return null;

  return { score: ligne.score, total: ligne.total ?? null };
}

/** Efface tous les records de cet appareil. Sert aux essais, et au ménage. */
export function oublierRecords() {
  try {
    window.localStorage.removeItem(CLE);
  } catch {
    /* rien à faire */
  }
}
