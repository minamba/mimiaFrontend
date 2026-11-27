import httpClient from './httpClient';

/**
 * L'ONGLET « SESSIONS D'EXAMENS » (25/11/2026) : les dates officielles des épreuves, ce que la veille propose, la
 * validation. Voir `SessionsExamensController`.
 */
const base = '/admin/sessions-examens';

/** `{ epreuves: [{ code, libelle, examenLibelle, session, validee, proposee }], pages: [{ url, libelle, statut, … }] }`. */
export const getSessionsExamens = () => httpClient.get(base);

export const validerDateEpreuve = (id) => httpClient.post(`${base}/${id}/valider`);

export const rejeterDateEpreuve = (id) => httpClient.post(`${base}/${id}/rejeter`);

/** Relit tout de suite les pages du calendrier : `{ pages: [{ url, lue, proposees, session }] }`. Payant (quelques centimes). */
export const relireCalendrier = () => httpClient.post(`${base}/relire`);
