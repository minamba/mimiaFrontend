import { getCalendrierEleve } from '../lib/api/adminApi';
import { CalendrierContenu } from './CalendrierContenu';

/**
 * Le calendrier d'un enfant, depuis l'administration — dans une fenêtre,
 * pas une page à part : l'administrateur y revient depuis l'onglet
 * « Élèves », il n'a pas besoin d'une adresse à lui.
 *
 * EXACTEMENT CE QUE L'ENFANT ET SON PARENT VOIENT.
 * Même composant (`CalendrierContenu`) que `CalendrierEleve.js` — seule la
 * route qui nourrit les données change (`adminApi.getCalendrierEleve`, sans
 * la vérification de propriété que porte la route familiale, puisque
 * l'administration doit pouvoir ouvrir le calendrier de n'importe quel
 * profil).
 */
export default function CalendrierEleveModale({ eleve, onFermer }) {
  return (
    <div className="modale" role="dialog" aria-modal="true" aria-label={`Calendrier de ${eleve.prenom}`}>
      <div className="modale__boite modale__boite--calendrier">
        <h2>Calendrier de {eleve.prenom}</h2>

        <div className="modale__corps">
          <CalendrierContenu eleveId={eleve.id} chargerCalendrier={getCalendrierEleve} />
        </div>

        <div className="modale__actions">
          <button type="button" className="btn-ghost" onClick={onFermer}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
