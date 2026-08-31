export const PROFIL_LOAD_REQUEST = 'PROFIL_LOAD_REQUEST';
export const PROFIL_LOAD_SUCCESS = 'PROFIL_LOAD_SUCCESS';
export const PROFIL_LOAD_FAILURE = 'PROFIL_LOAD_FAILURE';

export const PROFIL_SAVE_REQUEST = 'PROFIL_SAVE_REQUEST';
export const PROFIL_SAVE_SUCCESS = 'PROFIL_SAVE_SUCCESS';
export const PROFIL_SAVE_FAILURE = 'PROFIL_SAVE_FAILURE';

export const MOT_DE_PASSE_REQUEST = 'MOT_DE_PASSE_REQUEST';
export const MOT_DE_PASSE_SUCCESS = 'MOT_DE_PASSE_SUCCESS';
export const MOT_DE_PASSE_FAILURE = 'MOT_DE_PASSE_FAILURE';

export const PROFIL_RESET_MESSAGES = 'PROFIL_RESET_MESSAGES';

export const chargerProfil = () => ({ type: PROFIL_LOAD_REQUEST });

export const enregistrerProfil = (donnees) => ({ type: PROFIL_SAVE_REQUEST, payload: donnees });

export const changerMotDePasse = (donnees) => ({ type: MOT_DE_PASSE_REQUEST, payload: donnees });

/** Efface les bandeaux de succès et d'erreur, au changement d'onglet. */
export const effacerMessages = () => ({ type: PROFIL_RESET_MESSAGES });
