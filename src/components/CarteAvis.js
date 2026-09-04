import Etoiles from './Etoiles';

/**
 * Un avis, tel qu'un visiteur le lit.
 *
 * EXTRAIT PARCE QU'IL SERT À DEUX ENDROITS — le carrousel de la page d'accueil
 * et la page qui les liste tous. Deux copies divergeraient au premier
 * ajustement, et l'écart se verrait en passant de l'une à l'autre, c'est-à-dire
 * exactement au moment où on compare.
 */
export default function CarteAvis({ avis }) {
  return (
    <article className="avis__carte">
      <div className="avis__carte-entete">
        <span className="avis__auteur">{avis.auteur}</span>
        {avis.abonne && <span className="avis__verifie">Client abonné</span>}
      </div>

      <Etoiles note={avis.note} />

      {avis.titre && <h3 className="avis__titre">{avis.titre}</h3>}

      <time className="avis__date" dateTime={avis.date}>
        {new Date(avis.date).toLocaleDateString('fr-FR', {
          day: 'numeric', month: 'long', year: 'numeric',
        })}
      </time>

      {avis.commentaire && <p className="avis__texte">{avis.commentaire}</p>}
    </article>
  );
}
