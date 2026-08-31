import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../lib/actions/authActions';
import logoFondClair from '../assets/logo-fond-clair.png';
import logoFondSombre from '../assets/logo-fond-sombre.png';
import { useModeTest } from '../lib/storage/modeTest';

/**
 * Le pied de page.
 *
 * IL NE CONTIENT QUE DES LIENS QUI EXISTENT
 * -----------------------------------------
 * Chaque adresse citée ici correspond à une route déclarée : un pied de page
 * constellé de liens morts inspire moins confiance qu'un pied de page court.
 *
 * Le bloc des tarifs suit le mode test, comme la barre du haut : quand le mode
 * est actif, le site est en accès privé et montrer les prix serait incohérent.
 */
export default function Footer() {
  const { authentifie } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const emplacement = useLocation();
  const modeTest = useModeTest();
  const annee = new Date().getFullYear();

  // Le cours occupe toute la hauteur de l'écran, tableau compris : un pied de
  // page en dessous ajouterait un défilement là où il ne doit y en avoir
  // aucun, et l'élève verrait des liens de navigation pendant sa leçon.
  if (emplacement.pathname.endsWith('/chat')) return null;

  return (
    <footer className="pied">
      <div className="pied__contenu">
        <div className="pied__marque">
          {/* Deux fichiers plutôt qu'un filtre CSS, comme dans la barre du
              haut : le lettrage marine est illisible sur fond sombre, et
              inverser l'image retournerait aussi le corail, qui est la marque. */}
          <Link to="/" className="pied__logo-lien" aria-label="Mimia — accueil">
            <img src={logoFondClair} alt="Mimia" className="pied__logo pied__logo--clair" />
            <img
              src={logoFondSombre}
              alt=""
              aria-hidden="true"
              className="pied__logo pied__logo--sombre"
            />
          </Link>
          <p className="pied__phrase">
            Un professeur particulier pour chacun de vos enfants, du CP à la
            Terminale. Il ne donne jamais la réponse&nbsp;: il cherche où ça
            bloque.
          </p>
        </div>

        <nav className="pied__colonnes" aria-label="Pied de page">
          <div className="pied__colonne">
            <h2 className="pied__titre">Le site</h2>
            <ul className="pied__liste">
              <li><Link to="/">Accueil</Link></li>
              <li><a href="/#methode">La méthode</a></li>
              {!modeTest && <li><Link to="/tarifs">Tarifs</Link></li>}
            </ul>
          </div>

          <div className="pied__colonne">
            <h2 className="pied__titre">Votre espace</h2>
            <ul className="pied__liste">
              {authentifie ? (
                <>
                  <li><Link to="/eleves">Mes enfants</Link></li>
                  <li><Link to="/profil">Mon profil</Link></li>
                </>
              ) : (
                // Un bouton et non un lien : la connexion passe par une
                // redirection vers le serveur d'identité, elle n'a pas
                // d'adresse interne vers laquelle pointer.
                <li>
                  <button
                    type="button"
                    className="pied__lien-bouton"
                    onClick={() => dispatch(login())}
                  >
                    Espace membre
                  </button>
                </li>
              )}
            </ul>
          </div>

          <div className="pied__colonne">
            <h2 className="pied__titre">Nous joindre</h2>
            <ul className="pied__liste">
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/cgv">CGV</Link></li>
              <li><Link to="/confidentialite">RGPD &amp; Confidentialité</Link></li>
              <li><Link to="/mentions-legales">Mentions légales</Link></li>
            </ul>
          </div>
        </nav>
      </div>

      <div className="pied__bas">
        <p className="pied__droits">© {annee} Mimia</p>
      </div>
    </footer>
  );
}
