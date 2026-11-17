/**
 * LES ICÔNES DES ACTIONS DE L'ADMINISTRATION — un œil pour l'aperçu, un crayon pour
 * modifier, une corbeille pour supprimer. Partagées par les jeux de test et les
 * signalements (06/11/2026) ; les boutons qui les portent ont la classe `idee-action`.
 */
/* Les trois mêmes dessins que le carnet d'idées : « pour aperçu l'icône d'œil, pour
   modifier un crayon, pour supprimer une corbeille ». */
export const Oeil = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M1.5 12S5 5.5 12 5.5 22.5 12 22.5 12 19 18.5 12 18.5 1.5 12 1.5 12z" />
    <circle cx="12" cy="12" r="3.2" />
  </svg>
);

export const Crayon = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M16.5 3.5a2.1 2.1 0 013 3L7.5 18.5l-4 1 1-4z" />
    <path d="M14.5 5.5l4 4" />
  </svg>
);

/** Deux flèches, vers le haut et vers le bas : déplacer une ligne dans sa liste (08/11/2026). */
export const Deplacer = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 20V5" />
    <path d="M4 9l4-4 4 4" />
    <path d="M16 4v15" />
    <path d="M12 15l4 4 4-4" />
  </svg>
);

export const Corbeille = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 7h16" />
    <path d="M9 7V4.8A.8.8 0 019.8 4h4.4a.8.8 0 01.8.8V7" />
    <path d="M6.5 7l.8 12.2a1 1 0 001 .8h7.4a1 1 0 001-.8L17.5 7" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);
