import MonAvis from './MonAvis';

/**
 * Le formulaire d'avis, dans une fenêtre — pour l'ouvrir depuis « Mes
 * matières », où l'enfant comme le parent passent vraiment, plutôt que
 * seulement depuis la page d'accueil publique ou « Mon compte » (voir le
 * commentaire en tête de `MonAvis.js` : même formulaire aux deux endroits,
 * jamais deux jumeaux qui divergeraient).
 */
export default function AvisModale({ onFermer }) {
  return (
    <div className="modale" role="dialog" aria-modal="true" aria-label="Votre avis sur Mimia">
      <div className="modale__boite modale__boite--avis">
        <h2>Votre avis sur Mimia</h2>

        <MonAvis />

        <div className="modale__actions">
          <button type="button" className="btn-ghost" onClick={onFermer}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
