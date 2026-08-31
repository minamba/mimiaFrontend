export const ELEVES_LOAD_REQUEST = 'ELEVES_LOAD_REQUEST';
export const ELEVES_LOAD_SUCCESS = 'ELEVES_LOAD_SUCCESS';
export const ELEVES_LOAD_FAILURE = 'ELEVES_LOAD_FAILURE';

export const ELEVE_SUBMIT_REQUEST = 'ELEVE_SUBMIT_REQUEST';
export const ELEVE_SUBMIT_SUCCESS = 'ELEVE_SUBMIT_SUCCESS';
export const ELEVE_SUBMIT_FAILURE = 'ELEVE_SUBMIT_FAILURE';
export const ELEVE_RESET = 'ELEVE_RESET';

export const ELEVE_SELECT = 'ELEVE_SELECT';

export const chargerEleves = () => ({ type: ELEVES_LOAD_REQUEST });
export const submitEleve = (data) => ({ type: ELEVE_SUBMIT_REQUEST, payload: data });
export const resetEleve = () => ({ type: ELEVE_RESET });
export const selectionnerEleve = (eleve) => ({ type: ELEVE_SELECT, payload: eleve });
