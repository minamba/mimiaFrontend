/**
 * LA VUE ILLUSTRÉE, POUR L'ENFANT ET POUR LE PARENT DANS L'ESPACE DE L'ENFANT — Camara, le 16/11/2026 : « pour la vue
 * parent, quand il rentre dans le cours d'un enfant, je veux la même vue que pour la vue enfant, je parle des
 * nouveautés visuelles ».
 *
 * Vraie quand l'enfant est connecté, OU quand la page est dans l'espace d'un enfant (`/eleves/<id>/…`). Fausse dans
 * l'espace parent (`/espace-parent/…`), l'administration et ailleurs.
 *
 * NE DÉCIDE QUE DU RENDU. Les textes qui dépendent du lecteur (« tu » pour l'enfant, « vous » ou la 3e personne pour
 * le parent, boutons réservés au parent) gardent leur propre condition `sessionEleve()`.
 *
 * L'ADRESSE EST LUE SUR `window.location`, pas par `useLocation` : les pages concernées sont des routes, redessinées à
 * chaque navigation, et beaucoup de tests simulent le routeur sans `useLocation`.
 */
import { sessionEleve } from './storage/sessionEleve';

const ESPACE_ENFANT = /^\/eleves\/[^/]+(\/|$)/;

export function vueIllustree(pathname) {
  if (sessionEleve()) return true;
  const chemin = pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '');
  return ESPACE_ENFANT.test(chemin ?? '');
}

/** Le même calcul, sous forme de hook (même valeur ; garde la porte ouverte à une lecture par le routeur). */
export function useVueIllustree() {
  return vueIllustree();
}
