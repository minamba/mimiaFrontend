import { useDispatch } from 'react-redux';
import { login } from '../lib/actions/authActions';
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
 */
export default function Maintenance() {
  const dispatch = useDispatch();

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
          <button
            type="button"
            className="maintenance__lien"
            onClick={() => dispatch(login())}
          >
            Accès administrateur
          </button>
        </div>
      </div>
    </div>
  );
}
