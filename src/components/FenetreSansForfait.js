import { Link } from 'react-router-dom';
import { sessionEleve } from '../lib/storage/sessionEleve';
import './sansForfait.css';

/**
 * « AUCUN ABONNEMENT EN COURS » — Camara, le 17/11/2026. La fenêtre illustrée qui s'ouvre, pour un compte sans forfait
 * (essai fini, pause, jamais abonné), au lieu d'une séance avec un professeur : carte d'un professeur, « Commencer à
 * réviser » un contrôle, « Préparer ce contrôle », « Faire le point », une épreuve d'examen. Le texte change selon qui
 * lit : le parent est invité à voir les formules, l'enfant à demander à ses parents.
 */
export default function FenetreSansForfait({ onFermer }) {
  const enfant = Boolean(sessionEleve());

  return (
    <div className="modale" role="dialog" aria-modal="true" aria-labelledby="titre-sans-forfait">
      <div className="modale__boite sans-forfait">
        <h2 id="titre-sans-forfait">Aucun abonnement en cours</h2>
        <p className="modale__texte">
          {enfant
            ? 'Ta famille n’a pas d’abonnement en cours. Pour retrouver tes cours avec les professeurs, demande à tes parents de choisir une formule.'
            : 'Votre compte n’a aucun abonnement en cours. Abonnez-vous pour accéder aux cours avec les professeurs.'}
        </p>
        <div className="modale__actions">
          <button type="button" className="btn-ghost" onClick={onFermer}>Fermer</button>
          {!enfant && <Link to="/tarifs" className="btn btn--compact">Voir les formules</Link>}
        </div>
      </div>
    </div>
  );
}
