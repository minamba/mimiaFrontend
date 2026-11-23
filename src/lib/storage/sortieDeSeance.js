/**
 * L'INSTANT OÙ L'ÉLÈVE VIENT DE QUITTER UNE SÉANCE — signalement #65 (23/11/2026).
 *
 * POURQUOI LES PAGES EN ONT BESOIN
 * -------------------------------
 * « Quitter » prévient le serveur, qui dépose la séance dans une file : le
 * professeur la conclut EN ARRIÈRE-PLAN, par un appel au modèle, et c'est cette
 * conclusion qui pose son verdict (« Bientôt prêt »…). Elle arrive quelques
 * secondes APRÈS le retour sur l'accueil. Les cartes de « Mes contrôles »,
 * chargées au montage, gardaient donc le verdict d'avant (« Pas encore prêt »)
 * jusqu'au prochain rechargement, alors que la page de l'examen blanc, ouverte
 * plus tard, disait déjà le nouveau.
 *
 * Les pages qui montrent une préparation se relisent donc quelques fois dans la
 * minute et demie qui suit une sortie de séance (voir `useRelectureApresSeance`).
 * Une seule clé, l'heure de la sortie : rien d'autre n'est gardé.
 *
 * `sessionStorage` et non `localStorage` : une sortie ne concerne que cet onglet,
 * et le délai est court. Un stockage indisponible (navigation privée stricte)
 * fait simplement retomber sur l'ancien comportement : la relecture au retour
 * sur l'onglet.
 */

const CLE = 'mimia.seance.sortie';

/**
 * Les relectures, en millisecondes après la sortie. Serrées au début (la
 * conclusion prend d'ordinaire quelques secondes), plus espacées ensuite (un
 * modèle lent, une file chargée). Au-delà de 90 s on s'arrête : la relecture au
 * retour sur l'onglet prend le relais.
 */
export const RELECTURES_MS = [3000, 6000, 10000, 15000, 25000, 40000, 60000, 90000];

export function noterSortieDeSeance(maintenant = Date.now()) {
  try {
    window.sessionStorage.setItem(CLE, String(maintenant));
  } catch {
    // Stockage indisponible : la page se relira au retour sur l'onglet, comme avant.
  }
}

const lire = () => {
  try {
    const brut = window.sessionStorage.getItem(CLE);
    const instant = brut ? Number(brut) : NaN;
    return Number.isFinite(instant) ? instant : null;
  } catch {
    return null;
  }
};

/**
 * Les délais qui restent avant chaque relecture, comptés depuis `maintenant`.
 * Vide sans sortie récente — et pour une sortie « dans le futur » (horloge
 * changée), qu'on ne sait pas interpréter.
 */
export function relecturesRestantes(maintenant = Date.now()) {
  const sortie = lire();
  if (sortie === null) return [];

  const ecoule = maintenant - sortie;
  if (ecoule < 0) return [];

  return RELECTURES_MS.filter((delai) => delai > ecoule).map((delai) => delai - ecoule);
}
