import { useDispatch } from 'react-redux';
import { login } from '../lib/actions/authActions';
import { useBlueSky } from '../lib/storage/modeTest';
import logoFondClair from '../assets/logo-fond-clair.png';
import logoFondSombre from '../assets/logo-fond-sombre.png';

/**
 * La page d'attente, quand le site est en maintenance.
 *
 * CE QU'ELLE EST, ET CE QU'ELLE N'EST PAS
 * ---------------------------------------
 * Un rideau, pas un verrou. L'API continue de répondre derrière : c'est
 * indispensable, sans quoi l'administrateur qui vient de tirer le rideau ne
 * pourrait plus le lever. Pour fermer vraiment le service, on arrête l'API.
 *
 * ELLE NE PROMET PAS D'HEURE
 * --------------------------
 * « De retour à 14 h » est la phrase qu'on regrette : les travaux débordent
 * toujours, et un visiteur revenu à 14 h 05 devant la même page conclut que
 * c'est cassé pour de bon. « Bientôt » ne déçoit personne.
 *
 * LE LIEN DE CONNEXION RESTE, ET IL EST NÉCESSAIRE
 * ------------------------------------------------
 * Un administrateur déconnecté — session expirée, autre machine, téléphone —
 * resterait dehors sans lui, et le seul moyen de rouvrir le site serait de se
 * connecter à la base à la main. Il ne révèle rien : la page de connexion est
 * publique de toute façon, et c'est le serveur qui décide qui passe.
 *
 * DEUX VERSIONS, SELON LE STYLE DU SITE
 * -------------------------------------
 * Refaite le 15/09/2026 à la demande de Camara (« un design un peu plus
 * stylé »), puis rattachée au mode « Blue Sky » : allumé, la version au fond
 * bleu de marque ; éteint, la version sobre d'origine, EXACTEMENT celle d'avant.
 * Deux balisages et non un seul habillé autrement : la nouvelle porte des
 * engrenages, une barre et des pastilles que l'ancienne n'a pas.
 */
export default function Maintenance() {
  const dispatch = useDispatch();
  const blueSky = useBlueSky();

  const seConnecter = () => dispatch(login());

  return blueSky
    ? <AttenteBlueSky onConnexion={seConnecter} />
    : <AttenteOrigine onConnexion={seConnecter} />;
}

/** La page d'attente d'origine — le style sombre du site. */
function AttenteOrigine({ onConnexion }) {
  return (
    <div className="maintenance">
      <div className="maintenance__carte">
        {/* Deux fichiers plutôt qu'un filtre CSS, comme partout ailleurs : le
            lettrage marine est illisible sur fond sombre, et inverser l'image
            retournerait aussi le corail, qui est la marque. */}
        <img src={logoFondClair} alt="Mimia" className="maintenance__logo maintenance__logo--clair" />
        <img src={logoFondSombre} alt="Mimia" className="maintenance__logo maintenance__logo--sombre" />

        {/* Décoratif, et annoncé comme tel : un lecteur d'écran qui énoncerait
            « trois points » avant le titre ferait perdre l'information utile. */}
        <div className="maintenance__ondes" aria-hidden="true">
          <span /><span /><span />
        </div>

        <h1 className="maintenance__titre">Nous revenons très vite</h1>

        <p className="maintenance__texte">
          Mimia est en maintenance le temps d’une mise à jour. Les cours, les
          fiches et la progression de votre enfant sont intacts&nbsp;: rien
          n’est perdu, tout vous attend au retour.
        </p>

        <p className="maintenance__texte maintenance__texte--doux">
          Merci de votre patience. Réessayez dans quelques minutes.
        </p>

        <div className="maintenance__pied">
          <button type="button" className="maintenance__lien" onClick={onConnexion}>
            Accès administrateur
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * La page d'attente « Blue Sky » — fond `ban2.png`, carte en verre dépoli.
 * Toutes ses règles sont rangées sous `.maintenance--blue-sky` dans App.css.
 */
function AttenteBlueSky({ onConnexion }) {
  return (
    <div className="maintenance maintenance--blue-sky">
      <main className="maintenance__carte">
        {/* Un seul logo : le fond bleu de marque est le même dans les deux thèmes. */}
        <img src={logoFondSombre} alt="Mimia" className="maintenance__logo" />

        {/* Deux engrenages qui tournent : ça travaille, ce n'est pas figé.
            Décoratif, et annoncé comme tel aux lecteurs d'écran. */}
        <div className="maintenance__medaillon" aria-hidden="true">
          <svg viewBox="14 14 76 76" className="maintenance__engrenages">
            <g className="maintenance__engrenage maintenance__engrenage--grand">
              <circle cx="42" cy="56" r="24" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="6.3 6.3" />
              <circle cx="42" cy="56" r="19" fill="currentColor" />
              <circle cx="42" cy="56" r="7" className="maintenance__moyeu" />
            </g>
            <g className="maintenance__engrenage maintenance__engrenage--petit">
              <circle cx="72" cy="30" r="12" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray="4.2 4.2" />
              <circle cx="72" cy="30" r="9" fill="currentColor" />
              <circle cx="72" cy="30" r="3.5" className="maintenance__moyeu" />
            </g>
          </svg>
        </div>

        <p className="maintenance__badge">
          <span className="maintenance__badge-point" aria-hidden="true" />
          Mise à jour en cours
        </p>

        <h1 className="maintenance__titre">Nous revenons très vite</h1>

        <p className="maintenance__texte">
          Mimia est en maintenance le temps d’une mise à jour. Tout ce que votre
          enfant a fait est bien à l’abri&nbsp;: rien n’est perdu, tout vous
          attend au retour.
        </p>

        {/* LA QUESTION QU'UN PARENT SE POSE D'ABORD — « le travail de mon
            enfant a-t-il disparu ? » — trouve sa réponse d'un coup d'œil. */}
        <ul className="maintenance__garanties" aria-label="Ce qui est conservé">
          <li><span className="maintenance__coche" aria-hidden="true">✓</span>Ses cours</li>
          <li><span className="maintenance__coche" aria-hidden="true">✓</span>Ses fiches</li>
          <li><span className="maintenance__coche" aria-hidden="true">✓</span>Sa progression</li>
        </ul>

        <div className="maintenance__progression" aria-hidden="true">
          <span />
        </div>

        <p className="maintenance__texte maintenance__texte--doux">
          Merci de votre patience. Réessayez dans quelques minutes.
        </p>

        <div className="maintenance__pied">
          <button type="button" className="maintenance__lien" onClick={onConnexion}>
            Accès administrateur
          </button>
        </div>
      </main>
    </div>
  );
}
