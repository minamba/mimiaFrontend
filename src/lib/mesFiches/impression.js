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

  // TOUTES LES FICHES D'UN COUP (18/10/2026) : quand le lot est monté, c'est lui
  // qu'on imprime, une fiche par page. Sinon la fiche affichée — jamais les
  // miniatures de la page de création.
  const feuille = document.querySelector('.fdr-lot')
    ?? document.querySelector('.fdr-feuille:not(.fdr-feuille--miniature)');
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
/**
 * `surFin(nomFichier)` (18/10/2026) : appelé quand la fenêtre d'impression se
 * ferme. Le navigateur ne dit pas si l'on a enregistré ou annulé — l'écran ne
 * peut donc que rappeler le nom du fichier et où le trouver.
 */
export function imprimerFiche(fiche, { surFin = null } = {}) {
  const titreOrigine = document.title;
  const nomFichier = nomDocument({
    matiere: fiche.matiere,
    date: fiche.dateCreation,
    suffixe: texteNu(fiche.titre),
  });

  // LE MESSAGE N'ARRIVE QU'UNE FOIS LA FENÊTRE VRAIMENT FERMÉE (18/10/2026).
  // Chrome émet « afterprint » dès que son aperçu est prêt, fenêtre encore
  // ouverte : afficher le message à ce moment changeait la page sous l'aperçu,
  // Chrome la remettait en mode impression et ne la rendait plus — la fiche
  // restait seule, en petit. On attend donc le premier geste sur la page (la
  // fenêtre est alors fermée), on rétablit la page de force, puis on prévient.
  let fini = false;
  const gestes = ['pointermove', 'pointerdown', 'keydown', 'touchstart', 'focus'];
  const apresFermeture = () => {
    gestes.forEach((g) => window.removeEventListener(g, apresFermeture, true));
    sortirDeLImpression();
    surFin?.(nomFichier);
  };

  const restaurer = () => {
    document.title = titreOrigine;
    window.removeEventListener('afterprint', restaurer);
    if (fini) return;
    fini = true;
    if (!surFin) return;
    // Un court délai : le geste qui ferme la fenêtre ne compte pas encore.
    setTimeout(() => gestes.forEach((g) => window.addEventListener(g, apresFermeture, true)), 300);
  };

  window.addEventListener('afterprint', restaurer);
  document.title = nomFichier;

  window.print();

  // Si le navigateur n'émet jamais `afterprint`, le titre revient quand même.
  setTimeout(restaurer, 5000);
}
