import { Link } from 'react-router-dom';
import iconeControle from '../assets/controle.png';
import { styleMatiere } from '../lib/couleurMatiere';
import BarrePreparation from './BarrePreparation';
import BoutonAjoutControle from './BoutonAjoutControle';
import BoutonControlesPasses from './BoutonControlesPasses';
import PastillePret from './PastillePret';
import { vueIllustree } from '../lib/vueIllustree';
import illuPressePapiers from '../assets/controles-illustre/presse-papiers.webp';
import illuFuji from '../assets/controles-illustre/fuji-cerisiers.webp';
import './controlesIllustre.css';
import { SCENES } from '../lib/scenesMatieres';
import { universDeMatiere } from '../lib/carteIllustree';
import { iconeEpreuve } from './PreparationExamen';
import './controleCarteIllustre.css';

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

/**
 * LA CARTE ILLUSTRÉE D'UN CONTRÔLE À VENIR — Camara, le 16/11/2026 (maquette : icône de matière, pastille, titre au
 * trait doré, délai, encadré « Préparation », pastille d'état, gros bouton doré), « adaptée en fonction des
 * matières » : l'icône, les couleurs et la scène de droite viennent de la matière du contrôle. Le contrôle ne porte
 * que le libellé de sa matière : l'univers se lit dessus (lib/carteIllustree.js), la scène dans lib/scenesMatieres.js.
 * Vue de l'enfant seulement (`illustre`) ; les contrôles PASSÉS gardent leur carte (validée par Camara le 15/11).
 */
function habillage(controle) {
  const cle = universDeMatiere(controle.matiereLibelle);
  const scene = cle ? SCENES[cle] : null;
  if (!scene) return {};
  return {
    '--cci-scene': `url(${scene.image})`,
    '--cci-bord': scene.bord,
    '--cci-haut': scene.haut,
    '--cci-bas': scene.bas,
  };
}

function IconeCalendrier() {
  return (
    <svg className="cci__icone-ligne" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="3.5" y="5" width="17" height="15" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 10h17M8 3v4M16 3v4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 14l2 2 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CarteIllustree({ controle, onPreparer, retour }) {
  const preparation = controle.preparation;
  const commence = (controle.nombrePreparations ?? 0) > 0;
  const style = habillage(controle);
  const avecScene = Boolean(style['--cci-scene']);

  return (
    <li
      className={`controle-carte cci${avecScene ? ' cci--scene' : ''}`}
      style={{ ...styleMatiere({ matiereLibelle: controle.matiereLibelle }), ...style }}
    >
      <span className="cci__scene" aria-hidden="true" />

      <div className="cci__tete">
        <span className="cci__icone" aria-hidden="true">{iconeEpreuve({ libelle: controle.matiereLibelle })}</span>

        <div className="cci__ident">
          <span className="controle-carte__matiere">{controle.matiereLibelle}</span>
          {/* Le lien couvre toute la carte (son ::after, voulu le 13/09/2026) : le trait doré est donc un élément à
              part, juste après lui. */}
          <span className="cci__titre-ligne">
            <Link
              to={`/eleves/${controle.eleveId}/controles/${controle.id}${retour ? `?retour=${retour}` : ''}`}
              className="controle-carte__titre"
            >
              {controle.sujet || 'Sujet à préciser'}
            </Link>
            <span className="cci__trait" aria-hidden="true" />
          </span>
          <p className="controle-carte__quand">
            <IconeCalendrier />
            <span className="controle-carte__jour">{jourControle(controle.dateControle)}</span>
            {controle.heureControle && ` · ${controle.heureControle.slice(0, 5)}`}
          </p>
        </div>

        <span className={`controle-carte__delai est-${urgence(controle.joursRestants)}`}>
          <span aria-hidden="true">⏳ </span>
          {delaiControle(controle.joursRestants)}
        </span>
      </div>

      <div className="cci__preparation">
        <BarrePreparation
          pourcent={preparation?.pourcent}
          perimetreConnu={preparation?.perimetreConnu ?? false}
          compact
        />
      </div>

      <div className="cci__etat">
        <PastillePret statut={preparation?.pretStatut} titre={preparation?.pretObservation} />
        {/* « OBJECTIF » DE LA MAQUETTE : le contrôle n'en porte pas. La seule phrase qui en tienne lieu est l'avis du
            professeur sur la préparation (`pretObservation`) : affichée seulement quand elle existe. */}
        {preparation?.pretObservation && (
          <p className="cci__mot">
            <span className="cci__mot-titre">Le mot de ton professeur</span>
            <span className="cci__mot-texte">{preparation.pretObservation}</span>
          </p>
        )}
      </div>

      <button
        type="button"
        className="btn btn--compact controle-carte__action cci__action"
        onClick={() => onPreparer?.(controle)}
      >
        <span className="cci__action-icone" aria-hidden="true">▶</span>
        {commence ? 'Continuer la préparation' : 'Commencer à réviser'}
      </button>
    </li>
  );
}

export function ControleCarte({
  controle, onPreparer, onBilan = null, passe = false, retour = null, illustre = false,
}) {
  const preparation = controle.preparation;
  const commence = (controle.nombrePreparations ?? 0) > 0;

  if (illustre && !passe) return <CarteIllustree controle={controle} onPreparer={onPreparer} retour={retour} />;

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

  // LA VUE ILLUSTRÉE DE L'ENFANT — Camara, le 15/11/2026 (maquette « Mes contrôles ») : le presse-papiers et son chat à
  // gauche, le Fuji et les cerisiers à droite, un cadre lumineux (controlesIllustre.css).
  // Aussi pour le parent dans l'espace de son enfant (16/11/2026) : voir lib/vueIllustree.js.
  const illustre = vueIllustree();

  return (
    // L'IDENTIFIANT EST UNE DESTINATION, pas une décoration : les pages de
    // détail renvoient ici par `#mes-controles` plutôt qu'en haut de la page.
    <section className={`controles-section${illustre ? ' ctr-illu' : ''}`} id="mes-controles">
      {illustre && (
        <>
          <img className="ctr-illu__deco ctr-illu__deco--gauche" src={illuPressePapiers} alt="" aria-hidden="true" />
          <img className="ctr-illu__deco ctr-illu__deco--droite" src={illuFuji} alt="" aria-hidden="true" />
        </>
      )}
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
            Il reste absent de l'état vide, où la carte en porte déjà un.

            « VOIR LES CONTRÔLES PASSÉS » L'ACCOMPAGNE — Camara, le
            20/09/2026. Il s'affiche même quand l'enfant n'en a encore aucun :
            la page dédiée le lui dit en une phrase, alors qu'un bouton qui
            apparaît et disparaît selon l'historique ne se laisse jamais
            trouver. */}
        {controles.length > 0 && (
          <div className="controles-section__actions">
            <BoutonControlesPasses eleveId={eleveId} />
            <BoutonAjoutControle onClick={onAjouter} />
          </div>
        )}
      </div>

      {controles.length === 0 ? (
        <div className="fiches-vide">
          {illustre && (
            <span className="ctr-illu__calendrier">
              <svg viewBox="0 0 48 48" aria-hidden="true">
              <rect x="6" y="10" width="36" height="32" rx="6" fill="none" stroke="currentColor" strokeWidth="3" />
              <path d="M6 19h36" stroke="currentColor" strokeWidth="3" />
              <path d="M16 6v8M32 6v8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              <path d="M14 26h4M22 26h4M30 26h4M14 33h4M22 33h4M30 33h4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            </span>
          )}
          <p className="fiches-vide__titre">Pas encore de contrôle prévu.</p>
          <p>
            Ajoute ton prochain contrôle : ton professeur pourra te le rappeler
            et t’aider à le préparer, un peu à chaque cours.
          </p>
          <div className="fiches-vide__actions">
            <BoutonAjoutControle onClick={onAjouter} />
            <BoutonControlesPasses eleveId={eleveId} />
          </div>
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
                illustre={illustre}
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
