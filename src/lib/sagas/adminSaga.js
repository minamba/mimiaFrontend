import { all, call, put, select, takeLatest } from 'redux-saga/effects';
import {
  getResume,
  getSerieRequetes,
  getSerieParents,
  getSerieEleves,
  getSerieAbonnements,
  getParents,
  getEleves,
  getFicheEleve,
  ajusterHeures,
  modifierParent,
  modifierEleve,
  supprimerParent,
  supprimerEleve,
} from '../api/adminApi';
import {
  ADMIN_LOAD_REQUEST,
  ADMIN_LOAD_SUCCESS,
  ADMIN_LOAD_FAILURE,
  ADMIN_GRANULARITE,
  ADMIN_FILTRE_ELEVE,
  ADMIN_RECHERCHE,
  ADMIN_RECHERCHE_ELEVE,
  ADMIN_FILTRE_PARENT,
  ADMIN_PERIODE_COUT,
  ADMIN_FICHE_REQUEST,
  ADMIN_FICHE_SUCCESS,
  ADMIN_FICHE_FAILURE,
  ADMIN_MUTATION_REQUEST,
  ADMIN_MUTATION_SUCCESS,
  ADMIN_MUTATION_FAILURE,
} from '../actions/adminActions';

// `ajusterHeures` prend trois arguments quand les autres en prennent deux :
// cet adaptateur les remet dans l'ordre attendu par le client d'API. Sans lui,
// il faudrait un second chemin de mutation pour une seule operation.
const ajusterHeuresOperation = (id, donnees) =>
  ajusterHeures(id, donnees.minutes, donnees.motif, donnees.prevenir);

const OPERATIONS = {
  ajusterHeures: ajusterHeuresOperation,
  modifierParent,
  modifierEleve,
  supprimerParent,
  supprimerEleve,
};

function* chargerAdminSaga() {
  try {
    const {
      granularite, eleveFiltre, recherche, rechercheEleve, parentFiltre,
      periodeCout, decalageCout,
    } = yield select(
      (state) => state.admin,
    );

    // Sept appels indépendants : les paralléliser divise le temps d'affichage
    // du tableau de bord par autant.
    const [resume, requetes, parentsSerie, elevesSerie, abonnementsSerie, parents, eleves] =
      yield all([
        call(getResume),
        call(getSerieRequetes, granularite, eleveFiltre),
        call(getSerieParents, granularite),
        call(getSerieEleves, granularite),
        call(getSerieAbonnements, granularite, eleveFiltre),
        call(getParents, recherche, periodeCout, decalageCout),
        call(getEleves, null),
      ]);

    // La liste filtrée n'est demandée que si un filtre est actif : sans terme
    // ni parent, elle serait identique à la liste complète et l'appel serait
    // du gaspillage pur.
    const elevesTableau =
      rechercheEleve || parentFiltre
        ? (yield call(getEleves, parentFiltre?.id, rechercheEleve)).data
        : eleves.data;

    yield put({
      type: ADMIN_LOAD_SUCCESS,
      payload: {
        resume: resume.data,
        serieRequetes: requetes.data,
        serieParents: parentsSerie.data,
        serieEleves: elevesSerie.data,
        serieAbonnements: abonnementsSerie.data,
        parents: parents.data,
        eleves: eleves.data,
        elevesTableau,
      },
    });
  } catch (error) {
    yield put({
      type: ADMIN_LOAD_FAILURE,
      payload:
        error.response?.status === 403
          ? "Votre compte n'a pas les droits d'administration."
          : 'Impossible de charger le tableau de bord.',
    });
  }
}

function* muterSaga(action) {
  const { operation, id, data } = action.payload;

  try {
    yield call(OPERATIONS[operation], id, data);
    yield put({ type: ADMIN_MUTATION_SUCCESS });

    // Un compte supprimé change les compteurs, les séries et les tableaux :
    // on recharge tout plutôt que de tenter une mise à jour locale partielle
    // qui divergerait de la base au premier cas particulier.
    yield put({ type: ADMIN_LOAD_REQUEST });
  } catch (error) {
    yield put({
      type: ADMIN_MUTATION_FAILURE,
      payload:
        error.response?.data?.message ?? "L'opération a échoué, veuillez réessayer.",
    });
  }
}

function* chargerFicheSaga(action) {
  try {
    const { data } = yield call(getFicheEleve, action.payload);
    yield put({ type: ADMIN_FICHE_SUCCESS, payload: data });
  } catch (error) {
    yield put({
      type: ADMIN_FICHE_FAILURE,
      payload:
        error.response?.status === 404
          ? "Ce profil n'existe plus."
          : 'Impossible de charger la fiche de cet élève.',
    });
  }
}

export default function* adminSaga() {
  yield takeLatest(ADMIN_LOAD_REQUEST, chargerAdminSaga);
  yield takeLatest(ADMIN_MUTATION_REQUEST, muterSaga);

  // Tout changement de filtre relance le chargement.
  yield takeLatest(
    [
      ADMIN_GRANULARITE,
      ADMIN_FILTRE_ELEVE,
      ADMIN_RECHERCHE,
      ADMIN_RECHERCHE_ELEVE,
      ADMIN_FILTRE_PARENT,

      // La fenêtre de temps recharge le tableau : ses trois colonnes
      // chiffrées en dépendent, pas seulement le bandeau.
      ADMIN_PERIODE_COUT,
    ],
    chargerAdminSaga,
  );

  yield takeLatest(ADMIN_FICHE_REQUEST, chargerFicheSaga);
}
