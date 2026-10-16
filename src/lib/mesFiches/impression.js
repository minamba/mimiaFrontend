import { isolerPourImpression, nomDocument } from '../impression';
import { texteNu } from './texteFiche';

/**
 * L'IMPRESSION D'UNE FICHE — et donc son enregistrement en PDF.
 *
 * Relevé par Camara le 14/10/2026 sur la fiche questions/réponses : en PDF,
 * on ne peut pas cliquer sur « Voir la réponse », et les réponses n'y étaient
 * pas. Le PDF montrait aussi l'en-tête du site (connexion, tarifs) et son
 * pied de page — « la fiche doit contenir le logo Mimia et juste la fiche ».
 *
 * Juste avant l'impression (`beforeprint` : le bouton comme Ctrl+P) :
 * 1. tout ce qui n'est pas la fiche est masqué, par le même moyen que les
 *    copies et les dictées imprimables (`isolerPourImpression`) ;
 * 2. la classe `fdr-impression` est posée sur <html> : la fiche prend la
 *    largeur d'une page A4 et sa mise en page complète, même depuis un
 *    téléphone (voir mesFiches.css).
 * Tout est rendu après (`afterprint`).
 *
 * Les traits des cartes sont recalculés à cette largeur par `useTraits`, qui
 * appelle `entrerEnImpression` avant de mesurer : l'ordre des écouteurs ne
 * compte donc pas.
 */
const CLASSE = 'fdr-impression';

let rendre = null;

export function entrerEnImpression() {
  if (rendre) return;

  // Les miniatures de la page de création ne s'impriment pas : la vraie fiche seulement.
  const feuille = document.querySelector('.fdr-feuille:not(.fdr-feuille--miniature)');
  if (!feuille) return;

  document.documentElement.classList.add(CLASSE);
  const rendreVisible = isolerPourImpression(feuille);

  rendre = () => {
    rendreVisible();
    document.documentElement.classList.remove(CLASSE);
    rendre = null;
  };
}

export function sortirDeLImpression() {
  rendre?.();
}

let installee = false;

/** Branche les deux écouteurs, une seule fois pour toute la page. */
export function installerImpression() {
  if (installee || typeof window === 'undefined') return;
  installee = true;
  window.addEventListener('beforeprint', entrerEnImpression);
  window.addEventListener('afterprint', sortirDeLImpression);
}

/**
 * Le bouton « Imprimer ou enregistrer en PDF » : la même impression, avec un
 * nom de fichier lisible — `Mimia--Francais_2026-10-14_Les-figures-d-opposition`.
 */
export function imprimerFiche(fiche) {
  const titreOrigine = document.title;

  const restaurer = () => {
    document.title = titreOrigine;
    window.removeEventListener('afterprint', restaurer);
  };

  window.addEventListener('afterprint', restaurer);
  document.title = nomDocument({
    matiere: fiche.matiere,
    date: fiche.dateCreation,
    suffixe: texteNu(fiche.titre),
  });

  window.print();

  // Si le navigateur n'émet jamais `afterprint`, le titre revient quand même.
  setTimeout(restaurer, 5000);
}
