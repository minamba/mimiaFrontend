import { Link } from 'react-router-dom';
import iconeControle from '../assets/controle.png';
import { styleMatiere } from '../lib/couleurMatiere';
import BarrePreparation from './BarrePreparation';
import BoutonAjoutControle from './BoutonAjoutControle';
import PastillePret from './PastillePret';

/**
 * « Mes contrôles » — la section posée sous les cartes de matières.
 *
 * POURQUOI UNE SECTION À PART, ET PAS UNE CARTE DE MATIÈRE DE PLUS. Les
 * matières disent AVEC QUI travailler ; les contrôles disent CE QU'IL FAUT
 * PRÉPARER. Ce sont deux niveaux différents, et les mélanger ferait disparaître
 * le second : un enfant qui cherche son professeur de maths ne lit pas la
 * septième tuile.
 *
 * TROIS AU PLUS, PUIS UN LIEN. L'accueil montre ce qui arrive maintenant, pas
 * l'agenda de l'année — le reste vit sur la page dédiée.
 */
const MAX_CARTES = 3;

/** « dans 3 jours », « demain », « aujourd'hui » — le délai vient du serveur. */
export const delaiControle = (jours) => {
  if (jours <= 0) return "aujourd'hui";
  if (jours === 1) return 'demain';
  return `dans ${jours} jours`;
};

/** « Vendredi 20 septembre », sans l'année : un contrôle se prépare de près. */
export const jourControle = (iso) =>
  new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

/**
 * L'urgence d'un contrôle, en un mot et une teinte.
 *
 * TROIS PALIERS SEULEMENT, les mêmes que ceux qui font changer de ton le
 * professeur : au-delà d'une semaine on a le temps, en deçà de deux jours
 * c'est imminent. Un dégradé continu aurait demandé à l'enfant de comparer
 * des nuances pour savoir s'il doit s'inquiéter.
 */
const urgence = (jours) => {
  if (jours <= 1) return 'imminent';
  if (jours <= 6) return 'proche';
  return 'lointain';
};

export function ControleCarte({
  controle, onPreparer, onBilan = null, passe = false, retour = null,
}) {
  const preparation = controle.preparation;
  const commence = (controle.nombrePreparations ?? 0) > 0;

  return (
    <li
      className={`controle-carte${passe ? ' controle-carte--passe' : ''}`}
      style={styleMatiere({ matiereLibelle: controle.matiereLibelle })}
    >
      <div className="controle-carte__haut">
        <span className="controle-carte__matiere">
          <span className="controle-carte__point" aria-hidden="true" />
          {controle.matiereLibelle}
        </span>

        {/* Le délai en pastille plutôt qu'en fin de phrase : c'est la
            première chose qu'on cherche sur cette carte, et la dernière
            qu'on trouvait. */}
        {!passe && (
          <span className={`controle-carte__delai est-${urgence(controle.joursRestants)}`}>
            {delaiControle(controle.joursRestants)}
          </span>
        )}
      </div>

      {/* D'OÙ L'ON VIENT VOYAGE DANS L'URL, ET NON DANS UN ÉTAT REACT.
          Même raison que `casque` et `controleId` sur le chat : un F5 sur la
          fiche ne doit pas transformer le bouton de retour en aller simple
          vers une page que l'enfant n'a jamais ouverte. */}
      <Link
        to={`/eleves/${controle.eleveId}/controles/${controle.id}${retour ? `?retour=${retour}` : ''}`}
        className="controle-carte__titre"
      >
        {controle.sujet || 'Sujet à préciser'}
      </Link>

      <p className="controle-carte__quand">
        <span className="controle-carte__jour">{jourControle(controle.dateControle)}</span>
        {controle.heureControle && ` · ${controle.heureControle.slice(0, 5)}`}
      </p>

      {/* Sur un contrôle passé, l'avancement des révisions n'a plus d'objet :
          c'est le résultat qu'on vient lire. */}
      {passe ? (
        <p className="controle-carte__resultat">
          {controle.note !== null && controle.note !== undefined ? (
            <>
              <strong>{controle.note.toLocaleString('fr-FR', { maximumFractionDigits: 1 })}/20</strong>
              {controle.ressenti && <span className="controle-carte__ressenti"> · {controle.ressenti}</span>}
            </>
          ) : controle.ressenti ? (
            <span className="controle-carte__ressenti">{controle.ressenti}</span>
          ) : controle.bilanClos ? (
            <span className="controle-carte__ressenti">Pas de bilan pour ce contrôle.</span>
          ) : (
            <span className="controle-carte__ressenti">
              Fais le point avec ton professeur quand tu veux.
            </span>
          )}
        </p>
      ) : (
        <>
          <BarrePreparation
            pourcent={preparation?.pourcent}
            perimetreConnu={preparation?.perimetreConnu ?? false}
            compact
          />

          {/* SOUS LA BARRE, ET C'EST VOULU. Le pourcentage dit où il en est,
              la pastille dit ce que ça VAUT face à ce contrôle-là — et c'est
              la seconde qui répond à la question que l'enfant se pose. La
              lire après le chiffre, c'est lire la conclusion après la mesure.
              L'observation du professeur voyage en infobulle : la carte doit
              rester courte, la fiche la donne en entier. */}
          <PastillePret
            statut={preparation?.pretStatut}
            titre={preparation?.pretObservation}
          />
        </>
      )}

      {!passe && (
        <button
          type="button"
          className="btn btn--compact controle-carte__action"
          onClick={() => onPreparer?.(controle)}
        >
          {commence ? 'Continuer la préparation' : 'Commencer à réviser'}
        </button>
      )}

      {/* LE BILAN S'OUVRE PAR SON BOUTON — voulu par Camara le 14/09/2026.
          Le professeur ne demande plus de lui-même, en cours normal, comment
          s'est passé un contrôle : c'est l'enfant qui vient en parler, quand
          il le veut, et le professeur sait alors pourquoi il est là. */}
      {passe && onBilan && (
        <button
          type="button"
          className="btn btn--compact controle-carte__action"
          onClick={() => onBilan(controle)}
        >
          Faire le point sur ce contrôle
        </button>
      )}
    </li>
  );
}

export default function MesControles({ eleveId, controles, onPreparer, onAjouter }) {
  // `null` = pas encore chargé : on n'affiche ni la liste ni l'état vide,
  // pour ne pas faire clignoter « Pas encore de contrôle » à chaque ouverture.
  if (controles === null || controles === undefined) return null;

  return (
    <section className="controles-section">
      <div className="controles-section__entete">
        <div className="controles-section__titre">
          {/* L'ILLUSTRATION QUI DÉBORDE — Camara, le 14/09/2026 : la
              planchette et son A+ sortent par le haut de la carte. Le span
              garde sa place dans la ligne du titre ; l'image, plus grande,
              est posée en absolu dedans et dépasse. Décorative : le titre
              dit déjà tout. */}
          <span className="controles-section__icone" aria-hidden="true">
            <img src={iconeControle} alt="" />
          </span>

          <div>
            <h2>Mes contrôles</h2>
            <p>Ce qui arrive à l’école, et où tu en es dans tes révisions.</p>
          </div>
        </div>

        {/* PERMANENT DÈS QU'IL Y A DES CONTRÔLES — voulu par Camara le
            13/09/2026. Sans lui, en ajouter un second obligeait à passer par
            la page dédiée : le bouton n'existait que dans l'état vide, c'est
            à dire exactement quand on en a le moins besoin par la suite.
            Il reste absent de l'état vide, où la carte en porte déjà un. */}
        {controles.length > 0 && <BoutonAjoutControle onClick={onAjouter} />}
      </div>

      {controles.length === 0 ? (
        <div className="fiches-vide">
          <p className="fiches-vide__titre">Pas encore de contrôle prévu.</p>
          <p>
            Ajoute ton prochain contrôle : ton professeur pourra te le rappeler
            et t’aider à le préparer, un peu à chaque cours.
          </p>
          <BoutonAjoutControle onClick={onAjouter} />
        </div>
      ) : (
        <>
          <ul className="controles-liste">
            {controles.slice(0, MAX_CARTES).map((controle) => (
              <ControleCarte
                retour="matieres"
                key={controle.id}
                controle={{ ...controle, eleveId }}
                onPreparer={onPreparer}
              />
            ))}
          </ul>

          <Link to={`/eleves/${eleveId}/controles`} className="controles-section__tous">
            Voir tous mes contrôles →
          </Link>
        </>
      )}
    </section>
  );
}
