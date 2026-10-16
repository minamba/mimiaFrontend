import { createContext, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { styleMatiere } from '../couleurMatiere';

/**
 * À QUI SONT CES FICHES — l'élève, ou le parent dans son espace (Camara, le
 * 16/10/2026 : « le système des fiches, mais pour les parents qui en ont le
 * droit, pas lié aux enfants »).
 *
 * LES MÊMES PAGES SERVENT LES DEUX : seul le propriétaire change. L'espace
 * parent enveloppe ses pages dans `EspaceFichesContext` ; sans lui, c'est
 * l'élève de l'adresse (`/eleves/:eleveId/...`).
 *
 * `eleveId` vaut `PARENT` pour le parent : l'API des fiches (`mesFichesApi`)
 * y lit l'adresse de l'espace parent au lieu de celle d'un élève.
 */
export const PARENT = 'parent';

export const EspaceFichesContext = createContext(false);

/** Le chemin de base des pages de fiches d'un propriétaire. */
export const cheminFiches = (eleveId) =>
  (eleveId === PARENT ? '/espace-parent/fiches' : `/eleves/${eleveId}/mes-fiches`);

export function useProprietaireFiches() {
  const parent = useContext(EspaceFichesContext);
  const { eleveId } = useParams();

  if (parent) {
    return { eleveId: PARENT, estParent: true, chemin: cheminFiches(PARENT), retour: null };
  }

  return {
    eleveId,
    estParent: false,
    chemin: cheminFiches(eleveId),
    retour: { to: `/eleves/${eleveId}/matieres`, libelle: '← Mes matières' },
  };
}

/** Les teintes d'une catégorie de parent, au format de `styleMatiere`. */
export const styleCategorie = (couleur) => ({
  '--matiere': couleur,
  '--matiere-claire': `color-mix(in srgb, ${couleur} 55%, #ffffff)`,
});

/** La couleur d'un cours : sa catégorie (parent) ou sa matière (élève). */
export const styleDuCours = (cours) => (cours?.categorieCouleur
  ? styleCategorie(cours.categorieCouleur)
  : styleMatiere(cours?.matiereCode ?? cours?.matiereLibelle));
