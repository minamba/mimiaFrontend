import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login, logout } from '../lib/actions/authActions';
import logoFondClair from '../assets/logo-fond-clair.png';
import logoFondSombre from '../assets/logo-fond-sombre.png';
import { useModeTest } from '../lib/storage/modeTest';
import { fermerSessionEleve, sessionEleve } from '../lib/storage/sessionEleve';
import { fermerSession } from '../lib/api/sessionEleveApi';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const emplacement = useLocation();
  const { authentifie, estAdmin, utilisateur } = useSelector((state) => state.auth);

  const modeTest = useModeTest();

  // Relu à chaque navigation : ouvrir ou fermer une session change
  // l'adresse, donc la barre se remet à jour au bon moment sans état partagé.
  const eleve = sessionEleve();

  const [menuOuvert, setMenuOuvert] = useState(false);
  const menuRef = useRef(null);

  // Le menu se referme au clic ailleurs et à Échap : sans ça il reste ouvert
  // par-dessus la page, et le seul moyen de le fermer serait de recliquer
  // exactement sur le bouton.
  useEffect(() => {
    if (!menuOuvert) return undefined;

    const auClic = (evenement) => {
      if (!menuRef.current?.contains(evenement.target)) setMenuOuvert(false);
    };
    const auClavier = (evenement) => {
      if (evenement.key === 'Escape') setMenuOuvert(false);
    };

    document.addEventListener('mousedown', auClic);
    document.addEventListener('keydown', auClavier);

    return () => {
      document.removeEventListener('mousedown', auClic);
      document.removeEventListener('keydown', auClavier);
    };
  }, [menuOuvert]);

  // Une navigation ferme le menu : il resterait sinon ouvert sur la page d'arrivée.
  useEffect(() => setMenuOuvert(false), [emplacement.pathname]);

  const nom = utilisateur?.given_name ?? utilisateur?.email ?? 'Mon compte';

  return (
    <header className="navbar">
      {/* Le logo porte déjà le nom : l'accompagner d'un texte le dirait deux
          fois. Deux fichiers plutôt qu'un filtre CSS — le lettrage marine est
          illisible sur fond sombre, et inverser l'image entière retournerait
          aussi le corail et le bleu ciel, qui sont la marque. */}
      <Link to="/" className="navbar__brand" aria-label="Mimia — accueil">
        <img src={logoFondClair} alt="Mimia" className="navbar__logo navbar__logo--clair" />
        <img
          src={logoFondSombre}
          alt=""
          aria-hidden="true"
          className="navbar__logo navbar__logo--sombre"
        />
      </Link>

      {/* Un membre qui revient ne doit pas passer par « Commencer
          gratuitement » pour retrouver son compte : l'invitation à s'inscrire
          et le retour d'un habitué sont deux gestes différents. */}
      {!authentifie && !eleve && (
        <div className="navbar__right">
          {/* Pas de tarifs en accès privé : il n'y a rien à acheter tant que
              le service n'est pas ouvert, et une grille visible sans moyen de
              souscrire ne fait que promettre dans le vide. */}
          {!modeTest && (
            <Link to="/tarifs" className="btn-ghost navbar__lien-direct">
              Tarifs
            </Link>
          )}
          {/* LA PORTE DES ENFANTS, À CÔTÉ DE CELLE DES PARENTS.
              Un enfant qui arrive sur mimia.fr ne doit pas avoir à comprendre
              que « Connexion » n'est pas pour lui. */}
          <Link to="/code" className="btn-ghost navbar__lien-direct">
            J’ai un code
          </Link>
          <button
            type="button"
            className="btn-ghost navbar__connexion"
            onClick={() => dispatch(login())}
          >
            Connexion
          </button>
          {/* PAS DE « Commencer gratuitement » ICI.
              Il figurait à trois endroits — la barre, le héros, le bas de
              l'accueil — et la barre est le pire des trois : elle suit le
              visiteur partout, y compris sur les pages où il n'a rien demandé.
              L'accueil garde ses deux appels, à l'endroit où la promesse
              vient d'être faite. La barre ne porte plus que les portes
              d'entrée : le code élève et la connexion. */}
        </div>
      )}

      {/*
        LA BARRE D'UN ENFANT NE PORTE QUE SON PRÉNOM.

        « Mes enfants », « Mon compte », « Déconnexion » sont des mots
        d'adulte. Un enfant n'a rien à en faire, et les lui montrer ne ferait
        que lui donner des portes à pousser — que le serveur refuserait, mais
        avec des messages d'erreur qu'il ne comprendrait pas.

        Il ne reste que son prénom et « Quitter », qui ferme sa session ici et
        côté serveur.
      */}
      {eleve && (
        <div className="navbar__right">
          <span className="navbar__eleve">
            <span className="navbar__eleve-pastille" aria-hidden="true">
              {(eleve.prenom || '?').charAt(0).toUpperCase()}
            </span>
            {eleve.prenom}
          </span>

          <button
            type="button"
            className="btn-ghost navbar__sortie"
            onClick={async () => {
              // La session est fermée côté SERVEUR d'abord. L'effacer
              // seulement ici laisserait une ligne vivante en base, dont le
              // jeton resterait valable pour qui l'aurait relevé.
              await fermerSession().catch(() => {});
              fermerSessionEleve();
              navigate('/');
            }}
          >
            Quitter
          </button>
        </div>
      )}

      {/* `--compte` marque la barre d'un PARENT CONNECTÉ, et sert au style
          mobile : là, « Mes enfants » s'efface au profit du menu, qui le
          contient déjà.

          Une classe explicite plutôt qu'un sélecteur qui devinerait la
          présence du menu : la barre d'un visiteur porte, elle aussi, des
          liens directs — « Tarifs », « J'ai un code » — et ceux-là n'ont
          AUCUN autre accès. Les masquer fermerait la porte des enfants. */}
      {authentifie && !eleve && (
        <div className="navbar__right navbar__right--compte">
          <Link to="/eleves" className="btn-ghost navbar__lien-direct">
            Mes enfants
          </Link>

          <div className="menu-compte" ref={menuRef}>
            <button
              type="button"
              className={`menu-compte__bouton ${menuOuvert ? 'menu-compte__bouton--ouvert' : ''}`}
              onClick={() => setMenuOuvert(!menuOuvert)}
              aria-expanded={menuOuvert}
              aria-haspopup="true"
            >
              <span className="menu-compte__pastille" aria-hidden="true">
                {nom.charAt(0).toUpperCase()}
              </span>
              Mon compte
              <span className="menu-compte__chevron" aria-hidden="true" />
            </button>

            {menuOuvert && (
              <div className="menu-compte__panneau" role="menu">
                <div className="menu-compte__entete">
                  <strong>{nom}</strong>
                  {utilisateur?.email && <span>{utilisateur.email}</span>}
                </div>

                <Link to="/profil" className="menu-compte__item" role="menuitem">
                  Mon profil
                </Link>
                <Link to="/eleves" className="menu-compte__item" role="menuitem">
                  Mes enfants
                </Link>

                {/* CONTACT ICI, EN PLUS DU PIED DE PAGE.
                    Un parent qui a un problème le rencontre pendant qu'il
                    utilise le service — devant le forfait de son enfant, pas
                    en bas de la page d'accueil. Le lien existait déjà dans le
                    pied de page, mais il fallait faire défiler tout l'écran
                    pour le trouver, ce que personne ne fait quand il est
                    contrarié. */}
                <Link to="/contact" className="menu-compte__item" role="menuitem">
                  Contact
                </Link>

                {estAdmin && (
                  <Link to="/admin" className="menu-compte__item" role="menuitem">
                    Administration
                  </Link>
                )}

                <div className="menu-compte__separateur" />

                <button
                  type="button"
                  className="menu-compte__item menu-compte__item--danger"
                  role="menuitem"
                  onClick={() => dispatch(logout())}
                >
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </header>
  );
}
