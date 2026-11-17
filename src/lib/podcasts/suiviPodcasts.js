/**
 * LES PODCASTS QUI SE FABRIQUENT, SUIVIS SUR TOUTES LES PAGES — Camara, le 15/11/2026 : « une barre de progression
 * qui reste fixe même si on change d'onglet, pour voir l'avancement de la génération des podcasts ; à 100 %, une
 * fenêtre signale que le podcast est prêt, avec un bouton “Écouter” qui ramène au podcast ».
 *
 * La liste des cours suivis vit dans le navigateur (localStorage) : elle survit au changement de page, au
 * rechargement, et se partage entre les onglets (l'événement `storage`). L'état lui-même vient toujours du serveur
 * (`GET …/cours/{id}/avancement`) : la liste ne dit que QUOI regarder.
 */
const CLE = 'mimia.podcasts.suivis';
const EVENEMENT = 'mimia:suivi-podcasts';

export function lireSuivis() {
  try {
    const brut = window.localStorage.getItem(CLE);
    const liste = brut ? JSON.parse(brut) : [];
    return Array.isArray(liste)
      ? liste.filter((s) => s && s.eleveId != null && s.coursId != null)
      : [];
  } catch {
    return [];
  }
}

function ecrire(liste) {
  try {
    window.localStorage.setItem(CLE, JSON.stringify(liste));
  } catch {
    // Navigation privée, stockage plein : la barre ne suivra pas, la page du podcast reste juste.
  }
  window.dispatchEvent(new Event(EVENEMENT));
}

const meme = (a, b) => String(a.eleveId) === String(b.eleveId) && String(a.coursId) === String(b.coursId);

/** Commence à suivre un cours (sans doublon). */
export function suivre(eleveId, coursId) {
  if (eleveId == null || coursId == null) return;
  const entree = { eleveId: String(eleveId), coursId: String(coursId) };
  const liste = lireSuivis();
  if (liste.some((s) => meme(s, entree))) return;
  ecrire([...liste, entree]);
}

/**
 * Cesse de suivre un cours. Rend `true` si c'est CET appel qui l'a retiré : deux onglets ouverts voient tous deux le
 * podcast prêt, un seul doit montrer la fenêtre.
 */
export function oublier(eleveId, coursId) {
  const liste = lireSuivis();
  const reste = liste.filter((s) => !meme(s, { eleveId, coursId }));
  if (reste.length === liste.length) return false;
  ecrire(reste);
  return true;
}

/** Prévient quand la liste change, dans cet onglet ou dans un autre. Rend la fonction qui arrête d'écouter. */
export function surChangement(rappel) {
  const surStockage = (e) => { if (e.key === null || e.key === CLE) rappel(); };
  window.addEventListener(EVENEMENT, rappel);
  window.addEventListener('storage', surStockage);
  return () => {
    window.removeEventListener(EVENEMENT, rappel);
    window.removeEventListener('storage', surStockage);
  };
}

/** Les états d'un cours que la barre suit encore. */
export const ETATS_SUIVIS = ['a_lire', 'notions', 'a_generer'];
