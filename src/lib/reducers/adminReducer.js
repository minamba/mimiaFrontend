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
  ADMIN_FICHE_FERMER,
  ADMIN_REINITIALISER_FILTRES,
  ADMIN_MUTATION_REQUEST,
  ADMIN_MUTATION_SUCCESS,
  ADMIN_MUTATION_FAILURE,
} from '../actions/adminActions';

const initialState = {
  resume: null,
  serieRequetes: [],
  serieParents: [],
  serieEleves: [],
  serieAbonnements: [],
  parents: [],

  // Deux listes volontairement distinctes. `eleves` reste complète : elle
  // alimente le sélecteur « filtrer par élève » des statistiques, qui doit
  // toujours proposer tout le monde. `elevesTableau` est le résultat de la
  // recherche — les confondre ferait disparaître du sélecteur les élèves que
  // la recherche exclut.
  eleves: [],
  elevesTableau: [],

  granularite: 'jour',
  eleveFiltre: '',
  recherche: '',

  // La fenêtre du bandeau de coût, partagée avec le tableau des parents.
  periodeCout: 'mois',
  decalageCout: 0,

  rechercheEleve: '',
  parentFiltre: null,

  // Fiche élève ouverte en superposition. Conservée à part du reste : la
  // fermer ne doit pas recharger le tableau de bord derrière.
  fiche: null,
  ficheLoading: false,
  ficheError: null,

  loading: true,
  muting: false,
  error: null,
};

export default function adminReducer(state = initialState, action) {
  switch (action.type) {
    case ADMIN_LOAD_REQUEST:
      return { ...state, loading: true, error: null };

    case ADMIN_LOAD_SUCCESS:
      return { ...state, loading: false, ...action.payload };

    case ADMIN_LOAD_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // Les filtres déclenchent un rechargement via la saga, d'où l'absence
    // de loading ici : on garde les données à l'écran pendant le refetch
    // plutôt que de faire clignoter les graphiques à chaque clic.
    case ADMIN_GRANULARITE:
      return { ...state, granularite: action.payload };

    case ADMIN_FILTRE_ELEVE:
      return { ...state, eleveFiltre: action.payload };

    case ADMIN_RECHERCHE:
      return { ...state, recherche: action.payload };

    case ADMIN_RECHERCHE_ELEVE:
      return { ...state, rechercheEleve: action.payload };

    case ADMIN_PERIODE_COUT:
      return {
        ...state,
        periodeCout: action.payload.periode,
        decalageCout: action.payload.decalage,
      };

    case ADMIN_FILTRE_PARENT:
      return { ...state, parentFiltre: action.payload };

    case ADMIN_FICHE_REQUEST:
      return { ...state, ficheLoading: true, ficheError: null, fiche: null };

    // LES DONNÉES RESTENT, LES FILTRES TOMBENT. Vider aussi les listes
    // ferait clignoter l'écran au retour : elles seront de toute façon
    // rechargées au montage suivant, sans filtre cette fois.
    case ADMIN_REINITIALISER_FILTRES:
      return {
        ...state,
        recherche: '',
        rechercheEleve: '',
        eleveFiltre: '',
        parentFiltre: null,
      };

    case ADMIN_FICHE_SUCCESS:
      return { ...state, ficheLoading: false, fiche: action.payload };

    case ADMIN_FICHE_FAILURE:
      return { ...state, ficheLoading: false, ficheError: action.payload };

    case ADMIN_FICHE_FERMER:
      return { ...state, fiche: null, ficheLoading: false, ficheError: null };

    case ADMIN_MUTATION_REQUEST:
      return { ...state, muting: true, error: null };

    case ADMIN_MUTATION_SUCCESS:
      return { ...state, muting: false };

    case ADMIN_MUTATION_FAILURE:
      return { ...state, muting: false, error: action.payload };

    default:
      return state;
  }
}
