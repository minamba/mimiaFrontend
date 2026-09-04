export const ADMIN_LOAD_REQUEST = 'ADMIN_LOAD_REQUEST';
export const ADMIN_LOAD_SUCCESS = 'ADMIN_LOAD_SUCCESS';
export const ADMIN_LOAD_FAILURE = 'ADMIN_LOAD_FAILURE';

export const ADMIN_GRANULARITE = 'ADMIN_GRANULARITE';
export const ADMIN_FILTRE_ELEVE = 'ADMIN_FILTRE_ELEVE';
export const ADMIN_RECHERCHE = 'ADMIN_RECHERCHE';
export const ADMIN_RECHERCHE_ELEVE = 'ADMIN_RECHERCHE_ELEVE';

export const ADMIN_FILTRE_PARENT = 'ADMIN_FILTRE_PARENT';

/**
 * Tous les filtres tombent d'un coup.
 *
 * Ils vivent dans le store, donc ils survivent au démontage de l'écran : on
 * quittait l'administration avec « ceo » en recherche, on y revenait, et un
 * seul parent s'affichait. Le champ, lui, repartait vide — l'écran annonçait
 * « aucun filtre » au-dessus d'une liste filtrée, et il fallait recharger la
 * page pour s'en sortir.
 */
export const ADMIN_REINITIALISER_FILTRES = 'ADMIN_REINITIALISER_FILTRES';

/** La fenêtre de temps du bandeau de coût ET du tableau des parents. */
export const ADMIN_PERIODE_COUT = 'ADMIN_PERIODE_COUT';

export const ADMIN_FICHE_REQUEST = 'ADMIN_FICHE_REQUEST';
export const ADMIN_FICHE_SUCCESS = 'ADMIN_FICHE_SUCCESS';
export const ADMIN_FICHE_FAILURE = 'ADMIN_FICHE_FAILURE';
export const ADMIN_FICHE_FERMER = 'ADMIN_FICHE_FERMER';

export const ADMIN_MUTATION_REQUEST = 'ADMIN_MUTATION_REQUEST';
export const ADMIN_MUTATION_SUCCESS = 'ADMIN_MUTATION_SUCCESS';
export const ADMIN_MUTATION_FAILURE = 'ADMIN_MUTATION_FAILURE';

export const chargerAdmin = () => ({ type: ADMIN_LOAD_REQUEST });

export const changerGranularite = (granularite) => ({
  type: ADMIN_GRANULARITE,
  payload: granularite,
});

export const filtrerParEleve = (eleveId) => ({ type: ADMIN_FILTRE_ELEVE, payload: eleveId });

export const rechercher = (terme) => ({ type: ADMIN_RECHERCHE, payload: terme });

/**
 * Déplace la fenêtre de temps.
 *
 * Elle vit dans l'état PARTAGÉ et non dans le bandeau : le tableau en dépend
 * aussi, et deux fenêtres séparées afficheraient un total qui ne correspond
 * plus aux lignes du dessous.
 */
export const changerPeriodeCout = (periode, decalage) => ({
  type: ADMIN_PERIODE_COUT,
  payload: { periode, decalage },
});

/** Recherche dans les profils élèves : prénom, âge, classe ou compte parent. */
export const rechercherEleve = (terme) => ({ type: ADMIN_RECHERCHE_ELEVE, payload: terme });

/**
 * Restreint le tableau des élèves à un compte parent.
 * @param parent  { id, libelle } — ou null pour lever le filtre
 */
export const filtrerParParent = (parent) => ({ type: ADMIN_FILTRE_PARENT, payload: parent });

export const ouvrirFiche = (eleveId) => ({ type: ADMIN_FICHE_REQUEST, payload: eleveId });

export const fermerFiche = () => ({ type: ADMIN_FICHE_FERMER });

/** Remet les filtres à zéro. Appelé en quittant l'administration. */
export const reinitialiserFiltres = () => ({ type: ADMIN_REINITIALISER_FILTRES });

/**
 * @param operation 'modifierParent' | 'modifierEleve' | 'supprimerParent' | 'supprimerEleve'
 */
export const muter = (operation, id, data) => ({
  type: ADMIN_MUTATION_REQUEST,
  payload: { operation, id, data },
});
