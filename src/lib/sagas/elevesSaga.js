import { call, put, takeLatest } from 'redux-saga/effects';
import { getEleves, addEleve, updateEleve, definirEtablissement } from '../api/elevesApi';
import { eleveDeLaSession } from '../storage/sessionEleve';
import {
  ELEVES_LOAD_REQUEST,
  ELEVES_LOAD_SUCCESS,
  ELEVES_LOAD_FAILURE,
  ELEVE_SUBMIT_REQUEST,
  ELEVE_SUBMIT_SUCCESS,
  ELEVE_SUBMIT_FAILURE,
} from '../actions/elevesActions';

function* chargerElevesSaga() {
  // EN SESSION ENFANT, LA LISTE EST L'ENFANT LUI-MÊME — voir
  // `eleveDeLaSession`. `GET /eleves` est la liste du parent : fermée à
  // l'enfant (403), elle laissait les écrans sans élève.
  const enfant = eleveDeLaSession();
  if (enfant) {
    yield put({ type: ELEVES_LOAD_SUCCESS, payload: [enfant] });
    return;
  }

  try {
    const reponse = yield call(getEleves);
    yield put({ type: ELEVES_LOAD_SUCCESS, payload: reponse.data });
  } catch (error) {
    yield put({
      type: ELEVES_LOAD_FAILURE,
      payload: 'Impossible de charger les profils.',
    });
  }
}

function* submitEleveSaga(action) {
  try {
    const { etablissementUai, ...profil } = action.payload;
    const estModification = Boolean(profil.id);
    const reponse = yield call(estModification ? updateEleve : addEleve, profil);
    let eleve = reponse.data;

    // L'ÉTABLISSEMENT, EN SECOND TEMPS — Camara, le 18/10/2026. Sa route
    // demande l'identifiant de l'enfant, qui n'existe qu'une fois le profil
    // créé. Un échec ici (annuaire injoignable) ne défait pas la création :
    // l'enfant existe, le parent choisira son collège dans « Modifier ».
    if (!estModification && etablissementUai && eleve?.id) {
      try {
        const { data } = yield call(definirEtablissement, eleve.id, etablissementUai);
        const e = data?.etablissement;
        if (e) eleve = { ...eleve, etablissementUai: e.uai, etablissementLibelle: e.nom, etablissementCommune: e.commune };
      } catch {
        /* le profil est créé ; l'établissement reste à choisir */
      }
    }

    yield put({ type: ELEVE_SUBMIT_SUCCESS, payload: eleve });
  } catch (error) {
    const statut = error.response?.status;

    // 409 : la formule ne couvre pas un enfant de plus. Ce n'est ni une saisie
    // invalide ni une panne, et le serveur renvoie déjà le bon message — il
    // nomme la formule et le nombre de places. On le reprend tel quel.
    const message =
      statut === 409 || statut === 400
        ? error.response.data?.message ?? 'Les informations saisies sont invalides.'
        : 'Une erreur est survenue, veuillez réessayer.';

    yield put({ type: ELEVE_SUBMIT_FAILURE, payload: message });
  }
}

export default function* elevesSaga() {
  yield takeLatest(ELEVES_LOAD_REQUEST, chargerElevesSaga);
  yield takeLatest(ELEVE_SUBMIT_REQUEST, submitEleveSaga);
}
