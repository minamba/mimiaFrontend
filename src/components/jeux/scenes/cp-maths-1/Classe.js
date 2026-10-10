import { Etoile, Gerbe } from './commun';
import './cp-maths-1.css';

/**
 * LA SALLE DE CLASSE DES « PAQUETS DE DIX » (09/10/2026). La couverture
 * montre un tableau vert où « 10 = » un fagot de bûchettes bleues liées de
 * raphia, une fenêtre ensoleillée, des bûchettes sur le bureau ; la scène la
 * reprend :
 *   - LE DÉCOR VIT : des dessins à la craie qui se tracent tout seuls sur le
 *     mur (étoile, sourire, « + », spirale), un avion en papier qui traverse
 *     la classe, des grains de poussière dans le rayon de soleil ;
 *   - LA MASCOTTE, BÛCHOU, UNE BÛCHETTE BLEUE avec son nœud de raphia, DIT
 *     LA CONSIGNE : il se balance en attendant ; quand l'annonce est fausse
 *     il se gratte la tête, un « ? » à la craie au-dessus ; quand elle est
 *     juste il saute, bras en l'air, entouré d'étoiles de craie ;
 *   - LA FÊTE : étoiles et bûchettes qui jaillissent, et les paquets posés
 *     sur le bureau qui dansent l'un après l'autre.
 * Bûchou ne compte pas pour l'enfant : rien de ce qu'il fait ne dépend du
 * nombre à préparer.
 */

export function DecorClasse() {
  return (
    <div className="sc-cp-maths-1__decor sc-paquets-de-dix__decor" aria-hidden="true">
      <span className="sc-paquets-de-dix__rayon" />
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={`sc-paquets-de-dix__poussiere sc-paquets-de-dix__poussiere--${n}`} />
      ))}
      <svg className="sc-paquets-de-dix__craie sc-paquets-de-dix__craie--etoile" viewBox="0 0 40 40" focusable="false">
        <path pathLength="100" d="M20 3 L25 15 L38 16 L28 25 L31 37 L20 30 L9 37 L12 25 L2 16 L15 15 Z" />
      </svg>
      <svg className="sc-paquets-de-dix__craie sc-paquets-de-dix__craie--sourire" viewBox="0 0 40 40" focusable="false">
        <path pathLength="100" d="M20 3 A 17 17 0 1 1 19.9 3 M13 15 v3 M27 15 v3 M11 24 Q 20 33 29 24" />
      </svg>
      <svg className="sc-paquets-de-dix__craie sc-paquets-de-dix__craie--plus" viewBox="0 0 40 40" focusable="false">
        <path pathLength="100" d="M20 6 V 34 M6 20 H 34" />
      </svg>
      <svg className="sc-paquets-de-dix__craie sc-paquets-de-dix__craie--spirale" viewBox="0 0 40 40" focusable="false">
        <path pathLength="100" d="M20 20 m0 -2 a2 2 0 1 1 -0.1 0 M20 20 a6 6 0 1 0 6 -6 a10 10 0 1 0 10 10" />
      </svg>
      <svg className="sc-paquets-de-dix__avion" viewBox="0 0 60 36" focusable="false">
        <path d="M2 18 L58 2 L30 34 L26 22 Z" fill="#fdfdfd" stroke="#9fb4c8" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M26 22 L58 2" stroke="#9fb4c8" strokeWidth="1.2" />
      </svg>
    </div>
  );
}

/**
 * BÛCHOU, LA BÛCHETTE MASCOTTE. `humeur` : 'attente', 'oups' ou 'bravo'
 * (voir `commun.js`).
 */
export function Buchou({ humeur }) {
  const ravi = humeur === 'bravo';
  return (
    <svg className={`sc-paquets-de-dix__buchou est-${humeur}`} viewBox="0 0 150 124" aria-hidden="true" focusable="false">
      <ellipse className="sc-paquets-de-dix__ombre" cx="62" cy="118" rx="26" ry="5" />
      <g className="sc-paquets-de-dix__buchou-corps">
        <path className="sc-paquets-de-dix__bras sc-paquets-de-dix__bras--g" d="M48 66 Q 30 70 26 84" />
        <path className="sc-paquets-de-dix__bras sc-paquets-de-dix__bras--d" d="M76 66 Q 94 70 98 84" />
        <circle className="sc-paquets-de-dix__main sc-paquets-de-dix__main--g" cx="26" cy="86" r="5.5" />
        <circle className="sc-paquets-de-dix__main sc-paquets-de-dix__main--d" cx="98" cy="86" r="5.5" />
        <ellipse className="sc-paquets-de-dix__pied" cx="54" cy="114" rx="8" ry="4.5" />
        <ellipse className="sc-paquets-de-dix__pied" cx="72" cy="114" rx="8" ry="4.5" />

        <rect className="sc-paquets-de-dix__baton" x="46" y="8" width="32" height="104" rx="16" />
        <rect className="sc-paquets-de-dix__baton-reflet" x="52" y="16" width="6" height="34" rx="3" />

        {ravi ? (
          <g className="sc-paquets-de-dix__yeux-ravis">
            <path d="M51 34 q4 -5 8 0" />
            <path d="M65 34 q4 -5 8 0" />
          </g>
        ) : (
          <g className="sc-paquets-de-dix__yeux">
            <ellipse cx="55" cy="33" rx="3.2" ry="4.2" />
            <ellipse cx="69" cy="33" rx="3.2" ry="4.2" />
            <circle cx="56.1" cy="31.4" r="1.2" fill="#fff" />
            <circle cx="70.1" cy="31.4" r="1.2" fill="#fff" />
          </g>
        )}
        <circle className="sc-paquets-de-dix__joue" cx="50" cy="42" r="3.4" />
        <circle className="sc-paquets-de-dix__joue" cx="74" cy="42" r="3.4" />
        <path
          className="sc-paquets-de-dix__bouche"
          d={ravi ? 'M54 43 Q 62 54 70 43 Z' : humeur === 'oups' ? 'M56 47 Q 62 44 68 47' : 'M55 44 Q 62 51 69 44'}
        />

        {/* LE NŒUD DE RAPHIA, celui des paquets : Bûchou est une bûchette du jeu. */}
        <rect className="sc-paquets-de-dix__raphia" x="44" y="62" width="36" height="9" rx="2" />
        <path className="sc-paquets-de-dix__noeud" d="M62 66 L50 58 L50 76 Z M62 66 L74 58 L74 76 Z" />
        <circle className="sc-paquets-de-dix__noeud" cx="62" cy="66" r="3.4" />
      </g>

      {humeur === 'oups' && (
        <g className="sc-paquets-de-dix__doute">
          <circle cx="118" cy="26" r="14" />
          <text x="118" y="33" textAnchor="middle">?</text>
        </g>
      )}

      {ravi && (
        <g className="sc-paquets-de-dix__etoiles-craie">
          <path className="sc-paquets-de-dix__etoile-craie sc-paquets-de-dix__etoile-craie--1" d="M112 20 l3 7 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1 Z" />
          <path className="sc-paquets-de-dix__etoile-craie sc-paquets-de-dix__etoile-craie--2" d="M130 52 l2 5 5 .5 -4 3.5 1 5 -4 -2.5 -4 2.5 1 -5 -4 -3.5 5 -.5 Z" />
          <path className="sc-paquets-de-dix__etoile-craie sc-paquets-de-dix__etoile-craie--3" d="M16 22 l2 5 5 .5 -4 3.5 1 5 -4 -2.5 -4 2.5 1 -5 -4 -3.5 5 -.5 Z" />
        </g>
      )}
    </svg>
  );
}

/** La fête de la classe : étoiles et bûchettes qui jaillissent du bureau. */
export function FeteClasse() {
  return (
    <Gerbe
      prefixe="sc-paquets-de-dix"
      nombre={16}
      formes={[
        () => <Etoile couleur="#ffd34d" />,
        () => (
          <svg viewBox="0 0 10 40" width="100%" height="100%" focusable="false">
            <rect x="1" y="1" width="8" height="38" rx="4" fill="#2f7fd0" stroke="#1c5698" strokeWidth="1" />
            <rect x="3" y="5" width="2" height="12" rx="1" fill="rgba(255,255,255,0.5)" />
          </svg>
        ),
        () => <Etoile couleur="#ffffff" />,
        () => <Etoile couleur="#8fe3a8" />,
      ]}
    />
  );
}
