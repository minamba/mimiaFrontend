import { Link } from 'react-router-dom';
import { sessionEleve } from '../../lib/storage/sessionEleve';
import { messageForfait } from '../../lib/hooks/useAccesForfait';

/**
 * LES FICHES DEMANDENT UN VRAI FORFAIT — Camara, le 16/10/2026. Ce que les
 * pages des fiches montrent à une famille en essai, en pause ou sans
 * abonnement, si elle y arrive quand même (lien gardé, adresse tapée) : la
 * raison, et pour le parent, le chemin vers les formules.
 */
export default function ForfaitRequis() {
  const enfant = Boolean(sessionEleve());

  return (
    <div className="mf-vide" role="note">
      <p>
        <strong>
          <span aria-hidden="true">🔒 </span>
          Les fiches de révision sont réservées aux familles abonnées.
        </strong>
      </p>
      <p>{messageForfait(enfant, 'cette fonctionnalité')}</p>
      {!enfant && <Link to="/tarifs" className="btn">Voir les formules</Link>}
    </div>
  );
}
