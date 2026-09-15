import Etoiles from './Etoiles';

/**
 * Un avis, tel qu'un visiteur le lit.
 *
 * EXTRAIT PARCE QU'IL SERT À DEUX ENDROITS — le carrousel de la page d'accueil
 * et la page qui les liste tous. Deux copies divergeraient au premier
 * ajustement, et l'écart se verrait en passant de l'une à l'autre, c'est-à-dire
 * exactement au moment où on compare.
 *
 * DANS L'ORDRE DE CE QUI CONVAINC — Camara, le 14/09/2026 : les étoiles, le
 * titre, le commentaire, puis qui l'a écrit et quand, en pied de carte. Le nom
 * ouvrait la carte, en gras ; c'est pourtant ce qui compte le moins pour un
 * parent qui ne connaît pas son auteur.
 */
export default function CarteAvis({ avis }) {
  return (
    <article className="avis__carte">
      <Etoiles note={avis.note} />

      {avis.titre && <h3 className="avis__titre">{avis.titre}</h3>}

      {avis.commentaire && <p className="avis__texte">{avis.commentaire}</p>}

      <footer className="avis__carte-pied">
        <span className="avis__signature">
          <span className="avis__auteur">{avis.auteur}</span>
          <time className="avis__date" dateTime={avis.date}>
            {new Date(avis.date).toLocaleDateString('fr-FR', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </time>
        </span>

        {avis.abonne && (
          <span className="avis__verifie">
            <span aria-hidden="true">✓</span> Client abonné
          </span>
        )}
      </footer>
    </article>
  );
}
