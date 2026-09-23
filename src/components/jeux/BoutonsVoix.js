/**
 * LES DEUX BOUTONS DE LA VOIX, posés au bout de la consigne de chaque jeu.
 *
 * RÉÉCOUTER, D'ABORD. Un enfant de six ans qui ne lit pas encore n'a que la
 * voix pour savoir ce qu'on lui demande : s'il était distrait quand elle a
 * parlé, il doit pouvoir la faire revenir, autant de fois qu'il veut.
 *
 * COUPER, ENSUITE. Une salle de classe, une bibliothèque, un frère qui dort :
 * la voix doit pouvoir se taire, et le rester d'une partie à l'autre.
 *
 * Rien ne s'affiche si la matière n'a pas de voix : un bouton qui ne produit
 * aucun son serait pire que pas de bouton.
 */
export default function BoutonsVoix({ voix, consigne }) {
  if (!voix.parle) return null;

  return (
    <span className="voix-jeu">
      <button
        type="button"
        className="voix-jeu__bouton"
        onClick={() => voix.reecouter(consigne)}
        aria-label="Réécouter la consigne"
        title="Réécouter la consigne"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 9h4l5-4v14l-5-4H4z" />
          <path d="M16 8.5a4.5 4.5 0 0 1 0 7" className="voix-jeu__onde" />
          <path d="M18.5 6a8 8 0 0 1 0 12" className="voix-jeu__onde" />
        </svg>
      </button>

      <button
        type="button"
        className="voix-jeu__bouton voix-jeu__bouton--muet"
        onClick={voix.basculerMuet}
        aria-pressed={voix.muet}
        aria-label={voix.muet ? 'Remettre la voix' : 'Couper la voix'}
        title={voix.muet ? 'Remettre la voix' : 'Couper la voix'}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 9h4l5-4v14l-5-4H4z" />
          {voix.muet
            ? <path d="M16 9l6 6M22 9l-6 6" className="voix-jeu__onde" />
            : <path d="M16 8.5a4.5 4.5 0 0 1 0 7" className="voix-jeu__onde" />}
        </svg>
      </button>
    </span>
  );
}
