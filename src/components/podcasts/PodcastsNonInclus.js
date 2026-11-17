import { Link } from 'react-router-dom';

/**
 * À PARTIR DE LA FORMULE SOLO — Camara, le 15/11/2026 : les podcasts et la conseillère d'orientation sont fermés en
 * ESSAI et avec STARTER (« il faut minimum l'abonnement Solo pour y accéder »), et « le bouton est visible mais
 * l'utilisateur est bloqué avec un message ». Les mots des podcasts sont aussi ceux du serveur
 * (`PodcastsEleve.MessageNonInclusEnfant` / `MessageNonInclusParent`).
 */
const ACCES = {
  podcasts: 'accéder aux podcasts',
  conseillere: 'parler avec la conseillère d’orientation',
};

export function messageSolo(enfant, quoi = 'podcasts') {
  const debut = `Il faut au minimum l’abonnement Solo pour ${ACCES[quoi] ?? ACCES.podcasts}.`;
  return enfant ? `${debut} Demande à tes parents.` : `${debut} Choisissez la formule Solo ou une formule supérieure.`;
}

/** La fenêtre qui s'ouvre au clic sur « Mes podcasts » ou sur la carte de la conseillère. */
export default function PodcastsNonInclus({ enfant, onFermer, quoi = 'podcasts' }) {
  return (
    <div className="modale" role="dialog" aria-modal="true" aria-labelledby="titre-reserve-solo">
      <div className="modale__boite">
        <h2 id="titre-reserve-solo">À partir de la formule Solo</h2>
        <p className="modale__texte">{messageSolo(enfant, quoi)}</p>
        <div className="modale__actions">
          {!enfant && <Link to="/tarifs" className="btn-ghost" onClick={onFermer}>Voir les formules</Link>}
          <button type="button" className="btn btn--compact" onClick={onFermer}>D’accord</button>
        </div>
      </div>
    </div>
  );
}

/** Ce que les pages des podcasts montrent si on y arrive quand même (adresse tapée, lien gardé). */
export function PageNonIncluse({ enfant }) {
  return (
    <div className="mf-vide" role="note">
      <p>
        <strong><span aria-hidden="true">🔒 </span>Les podcasts sont réservés à partir de la formule Solo.</strong>
      </p>
      <p>{messageSolo(enfant, 'podcasts')}</p>
      {!enfant && <Link to="/tarifs" className="btn">Voir les formules</Link>}
    </div>
  );
}
