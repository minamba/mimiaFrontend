import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login, logout } from '../lib/actions/authActions';
import logoFondClair from '../assets/logo-fond-clair.png';
import logoFondSombre from '../assets/logo-fond-sombre.png';
import { useModeTest } from '../lib/storage/modeTest';
import { fermerSessionEleve, rangerPortraitSession, sessionEleve } from '../lib/storage/sessionEleve';
import { fermerSession } from '../lib/api/sessionEleveApi';
import { getPortraitEleve } from '../lib/api/elevesApi';
import { avatarEnfant } from '../lib/avatarEnfant';
import BoutonTheme from './BoutonTheme';
import useEspaceParent from '../lib/hooks/useEspaceParent';
import './espaceParent/espaceParent.css';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const emplacement = useLocation();
  const { authentifie, estAdmin, utilisateur } = useSelector((state) => state.auth);

  const modeTest = useModeTest();

  // MON ESPACE PARENT (16/10/2026) : le bouton n'existe que pour un parent
  // qui a le droit aux fiches (coché dans Admin › Parents).
  const espace = useEspaceParent();

  // Relu à chaque navigation : ouvrir ou fermer une session change
  // l'adresse, donc la barre se remet à jour au bon moment sans état partagé.
  const eleve = sessionEleve();

  // SON PORTRAIT AU LIEU DE SON INITIALE — Camara, le 16/11/2026. L'avatar choisi par le parent, sinon celui par
  // défaut de sa classe et de son sexe ; l'initiale seulement si rien ne convient (sexe non précisé). Relu du
  // serveur une fois par session de navigation : une session plus ancienne, ou un avatar changé depuis.
  const [, setPortraitRelu] = useState(0);
  const eleveId = eleve?.eleveId;
  useEffect(() => {
    if (!eleveId) return undefined;
    let actif = true;
    Promise.resolve(getPortraitEleve(eleveId))
      .then(({ data }) => {
        if (actif && rangerPortraitSession(data ?? {})) setPortraitRelu((n) => n + 1);
      })
      .catch(() => {});
    return () => { actif = false; };
  }, [eleveId]);
  const portraitEleve = eleve
    ? avatarEnfant({ avatar: eleve.avatar, sexe: eleve.sexe, niveauCode: eleve.niveauCode || eleve.niveau })
    : null;

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

  // LA PAGE DU SCANNER, SUR LE TÉLÉPHONE : un seul geste, prendre la photo.
  // « Commencer gratuitement » et le menu n'y feraient que distraire un enfant
  // qui tient sa feuille d'une main.
  if (emplacement.pathname.startsWith('/scan/')) return null;

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
            <Link
              to="/tarifs"
              className="btn-ghost navbar__lien-direct navbar__lien-direct--tarifs"
            >
              <svg className="navbar__icone" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12.6V4.5A1.5 1.5 0 0 1 4.5 3h8.1a1.5 1.5 0 0 1 1.06.44l7 7a1.5 1.5 0 0 1 0 2.12l-8.1 8.1a1.5 1.5 0 0 1-2.12 0l-7-7A1.5 1.5 0 0 1 3 12.6Z" /><circle cx="8" cy="8" r="1.6" /></svg>
              Tarifs
            </Link>
          )}
          {/* LA PORTE DES ENFANTS, À CÔTÉ DE CELLE DES PARENTS.
              Un enfant qui arrive sur mimia.fr ne doit pas avoir à comprendre
              que « Connexion » n'est pas pour lui. */}
          <Link to="/code" className="btn-ghost navbar__lien-direct">
            <svg className="navbar__icone" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m8 7-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16" /></svg>
            J’ai un code
          </Link>
          <button
            type="button"
            /* UN BOUTON PLEIN depuis le 16/11/2026 — maquette de Camara : « Connexion » en orange lumineux,
               avec ses éclats, à côté des deux pilules bleues. */
            className="btn navbar__connexion"
            onClick={() => dispatch(login())}
          >
            <svg className="navbar__icone" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4.5 20.5c.8-3.6 3.9-6 7.5-6s6.7 2.4 7.5 6Z" /></svg>
            Connexion
          </button>
          {/* PAS DE « Commencer gratuitement » ICI.
              Il figurait à trois endroits — la barre, le héros, le bas de
              l'accueil — et la barre est le pire des trois : elle suit le
              visiteur partout, y compris sur les pages où il n'a rien demandé.
              L'accueil garde ses deux appels, à l'endroit où la promesse
              vient d'être faite. La barre ne porte plus que les portes
              d'entrée : le code élève et la connexion. */}

          {/* LE THÈME, TOUT À DROITE, DANS LES TROIS BARRES — Camara, le
              15/09/2026 : visiteur, enfant, parent. Il était posé dans deux
              pages seulement (« Vos enfants », les matières) : ailleurs, on ne
              pouvait pas changer de thème sans passer par « Mon compte ».
              Masqué en Blue Sky, qui impose le sombre (voir App.css). */}
          <BoutonTheme className="navbar__theme" />
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
            {portraitEleve ? (
              <img className="navbar__eleve-portrait" src={portraitEleve} alt="" />
            ) : (
              <span className="navbar__eleve-pastille" aria-hidden="true">
                {(eleve.prenom || '?').charAt(0).toUpperCase()}
              </span>
            )}
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

          <BoutonTheme className="navbar__theme" />
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

          {/* AVANT LA BULLE DU COMPTE — Camara, le 16/10/2026 (d'abord à sa droite). */}
          {espace?.fiches && (
            <Link to="/espace-parent" className="btn-ghost navbar__espace-parent">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 11l9-7 9 7" />
                <path d="M5 10v10h14V10" />
                <path d="M10 20v-5h4v5" />
              </svg>
              Mon espace parent
            </Link>
          )}

          <div className="menu-compte" ref={menuRef}>
            {/* UNE SEULE BULLE, ICÔNE ET CHEVRON ENSEMBLE — sur toutes les
                tailles d'écran, y compris l'ordinateur.

                Il y a eu un essai avec l'icône en lien direct vers « Mon
                compte » et le chevron séparé pour ouvrir le menu : deux
                cibles voisines avec deux comportements différents, ce que
                l'œil ne devine pas avant de cliquer au mauvais endroit.
                « Mon compte » reste à un clic — premier lien du panneau —
                et depuis la page « Vos enfants », le bouton dédié fait déjà
                ce travail mieux qu'une icône de la barre. */}
            <button
              type="button"
              className={`menu-compte__bouton ${menuOuvert ? 'menu-compte__bouton--ouvert' : ''}`}
              onClick={() => setMenuOuvert(!menuOuvert)}
              aria-expanded={menuOuvert}
              aria-haspopup="true"
              aria-label="Mon compte"
            >
              <span className="menu-compte__pastille" aria-hidden="true">
                {nom.charAt(0).toUpperCase()}
              </span>
              <span className="menu-compte__chevron" aria-hidden="true" />
            </button>

            {menuOuvert && (
              <div className="menu-compte__panneau" role="menu">
                <div className="menu-compte__entete">
                  <strong>{nom}</strong>
                  {utilisateur?.email && <span>{utilisateur.email}</span>}
                </div>

                <Link to="/profil" className="menu-compte__item" role="menuitem">
                  Mon compte
                </Link>
                <Link to="/eleves" className="menu-compte__item" role="menuitem">
                  Mes enfants
                </Link>

                {/* Sur téléphone, le bouton de la barre s'efface : l'espace est ici. */}
                {espace?.fiches && (
                  <Link to="/espace-parent" className="menu-compte__item" role="menuitem">
                    Mon espace parent
                  </Link>
                )}

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


          <BoutonTheme className="navbar__theme" />
        </div>
      )}

    </header>
  );
}
