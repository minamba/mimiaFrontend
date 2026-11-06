import { Link } from 'react-router-dom';
import { sessionEleve } from '../../lib/storage/sessionEleve';
import { MESSAGE_ESSAI_FICHES, messageForfait } from '../../lib/hooks/useAccesForfait';

/**
 * LES FICHES DEMANDENT UN VRAI FORFAIT — Camara, le 16/10/2026. Ce que les
 * pages des fiches montrent à une famille en essai, en pause ou sans
 * abonnement, si elle y arrive quand même (lien gardé, adresse tapée) : la
 * raison, et pour le parent, le chemin vers les formules.
 */
/**
 * `essaiUtilise` (18/10/2026) : la famille en essai a déjà sa fiche — la
 * phrase de Camara, « il faut être abonné pour continuer ».
 */
export default function ForfaitRequis({ essaiUtilise = false }) {
  const enfant = Boolean(sessionEleve());

  return (
    <div className="mf-vide" role="note">
      <p>
        <strong>
          <span aria-hidden="true">🔒 </span>
          {essaiUtilise ? MESSAGE_ESSAI_FICHES : 'Les fiches de révision sont réservées aux familles abonnées.'}
        </strong>
      </p>
      <p>
        {essaiUtilise
          ? (enfant
            ? 'Pendant l’essai, tu as droit à une fiche de révision. Demande à tes parents de choisir un forfait pour en créer d’autres.'
            : 'Pendant l’essai, une fiche de révision est offerte. Choisissez une formule pour en créer d’autres.')
          : messageForfait(enfant, 'cette fonctionnalité')}
      </p>
      {!enfant && <Link to="/tarifs" className="btn">Voir les formules</Link>}
    </div>
  );
}
