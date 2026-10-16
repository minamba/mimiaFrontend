import { NavLink, Navigate } from 'react-router-dom';
import useEspaceParent from '../../lib/hooks/useEspaceParent';
import { EspaceFichesContext } from '../../lib/mesFiches/espaceFiches';
import Loader from '../Loader';
import './espaceParent.css';

/**
 * MON ESPACE PARENT — Camara, le 16/10/2026 : « un nouveau bouton à droite de
 * Mon compte, et dedans un menu avec un seul item pour l'instant : Mes fiches
 * de révision. Ce n'est PAS lié aux enfants : ces fiches sont visibles par le
 * parent seul ».
 *
 * Le menu à gauche (en haut sur téléphone), la page à droite. Les pages de
 * fiches sont celles des élèves, enveloppées dans `EspaceFichesContext` : leur
 * propriétaire devient le parent connecté.
 *
 * SANS LE DROIT, PAS D'ESPACE : retour à « Mes enfants ». Le serveur, lui,
 * refuse chaque route (404) — ce renvoi n'est qu'un confort.
 */
export default function EspaceParent({ children }) {
  const espace = useEspaceParent();

  if (espace === null) return <Loader texte="Ouverture de votre espace…" />;
  if (!espace.fiches) return <Navigate to="/eleves" replace />;

  return (
    <div className="espace-parent">
      <aside className="espace-parent__menu" aria-label="Mon espace parent">
        <p className="espace-parent__titre">Mon espace parent</p>
        <nav>
          <ul>
            <li>
              <NavLink
                to="/espace-parent/fiches"
                className={({ isActive }) => `espace-parent__item${isActive ? ' est-actif' : ''}`}
              >
                <span className="espace-parent__icone" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 5a2 2 0 0 1 2-2h11v16H6a2 2 0 0 0-2 2z" />
                    <path d="M4 19V5M8 7h6M8 11h6" />
                  </svg>
                </span>
                Mes fiches personnelles
              </NavLink>
            </li>
          </ul>
        </nav>
        {espace.sansLimite && <p className="espace-parent__note">Compte administrateur : ni limite ni quota.</p>}
      </aside>

      <div className="espace-parent__contenu">
        <EspaceFichesContext.Provider value>
          {children}
        </EspaceFichesContext.Provider>
      </div>
    </div>
  );
}
