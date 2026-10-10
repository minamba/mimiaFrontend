import { Etoile, Gerbe } from './commun';
import { Papillon } from './Ferme';
import './cp-maths-1.css';

/**
 * LE MARCHÉ DE « LA MARCHANDE » (09/10/2026) — au CP on paie, au CE1 on rend
 * la monnaie (`Caisse.js`), au CE2 on lit un prix à virgule
 * (`PrixAVirgule.js`) : trois écrans, un seul marché. La couverture montre un
 * stand sous un auvent rayé, des cageots de pommes et de bananes, et une
 * grosse pomme rouge sur l'enseigne ; la scène la reprend :
 *   - LE DÉCOR VIT : deux papillons autour des fleurs, une abeille qui fait
 *     des huit, des pétales qui tombent doucement ;
 *   - LA MASCOTTE, POMME, la pomme de l'enseigne, DIT LA COMMANDE à côté de
 *     la bulle : elle se balance en attendant, se gratte la tête avec un
 *     « ? » quand le compte n'y est pas, ouvre les bras avec un cœur quand le
 *     jeu montre la réponse, et saute de joie, une pièce d'or dans la main,
 *     quand c'est payé juste ;
 *   - LA FÊTE : une pluie de pièces d'or, d'étoiles et de petites pommes, et
 *     les pièces du comptoir qui sautent l'une après l'autre.
 * Le total n'apparaît jamais avant la réponse : la pomme ne compte pas à la
 * place de l'enfant.
 */

export function DecorMarche() {
  return (
    <div className="sc-cp-maths-1__decor sc-marchande__decor" aria-hidden="true">
      <Papillon className="sc-marchande__papillon sc-marchande__papillon--1" couleur="#ff8fb1" />
      <Papillon className="sc-marchande__papillon sc-marchande__papillon--2" couleur="#8fd3ff" />
      <svg className="sc-marchande__abeille" viewBox="0 0 40 30" focusable="false">
        <ellipse className="sc-marchande__abeille-aile" cx="16" cy="8" rx="7" ry="6" />
        <ellipse className="sc-marchande__abeille-aile" cx="25" cy="8" rx="7" ry="6" />
        <ellipse cx="20" cy="18" rx="12" ry="9" fill="#ffd23f" stroke="#3a2a1a" strokeWidth="1.5" />
        <path d="M17 10 L17 26 M23 10 L23 26" stroke="#3a2a1a" strokeWidth="3" />
        <circle cx="29" cy="16" r="1.6" fill="#3a2a1a" />
      </svg>
      {[1, 2, 3, 4].map((n) => (
        <svg key={n} className={`sc-marchande__petale sc-marchande__petale--${n}`} viewBox="0 0 20 20" focusable="false">
          <path d="M10 1 C 17 5 17 15 10 19 C 3 15 3 5 10 1 Z" fill={n % 2 ? '#fff' : '#ffc6d9'} />
        </svg>
      ))}
    </div>
  );
}

/**
 * POMME, LA MASCOTTE DU MARCHÉ. `humeur` : 'attente', 'oups', 'aide' ou
 * 'bravo' (voir `commun.js`).
 */
export function Pomme({ humeur }) {
  const ravie = humeur === 'bravo';
  return (
    <svg className={`sc-marchande__pomme est-${humeur}`} viewBox="0 0 140 124" aria-hidden="true" focusable="false">
      <ellipse className="sc-marchande__ombre" cx="60" cy="116" rx="34" ry="6" />
      <g className="sc-marchande__pomme-corps">
        {/* Les bras, derrière le fruit : levés à la réussite, une main sur la
            tête quand ça doute. */}
        <path className="sc-marchande__bras sc-marchande__bras--g" d="M30 74 Q 14 70 12 56" />
        <path className="sc-marchande__bras sc-marchande__bras--d" d="M90 74 Q 106 70 108 56" />
        <circle className="sc-marchande__main sc-marchande__main--g" cx="12" cy="54" r="6" />
        <circle className="sc-marchande__main sc-marchande__main--d" cx="108" cy="54" r="6" />

        <path className="sc-marchande__pieds" d="M46 108 h-8 M74 108 h8" />
        <path
          className="sc-marchande__fruit"
          d="M60 34 C 72 22 102 26 102 62 C 102 92 82 110 70 108 C 64 107 62 105 60 105 C 58 105 56 107 50 108 C 38 110 18 92 18 62 C 18 26 48 22 60 34 Z"
        />
        <ellipse className="sc-marchande__reflet" cx="38" cy="54" rx="7" ry="12" transform="rotate(-20 38 54)" />
        <path className="sc-marchande__queue" d="M60 34 Q 58 22 64 14" />
        <path className="sc-marchande__feuille" d="M64 20 C 74 8 92 10 94 16 C 86 24 72 26 64 20 Z" />

        {ravie ? (
          <g className="sc-marchande__yeux-ravis">
            <path d="M42 62 q6 -7 12 0" />
            <path d="M66 62 q6 -7 12 0" />
          </g>
        ) : (
          <g className="sc-marchande__yeux">
            <ellipse cx="48" cy="61" rx="4.2" ry="5.4" />
            <ellipse cx="72" cy="61" rx="4.2" ry="5.4" />
            <circle cx="49.5" cy="59" r="1.5" fill="#fff" />
            <circle cx="73.5" cy="59" r="1.5" fill="#fff" />
          </g>
        )}
        <circle className="sc-marchande__joue" cx="38" cy="72" r="5" />
        <circle className="sc-marchande__joue" cx="82" cy="72" r="5" />
        <path
          className="sc-marchande__bouche"
          d={ravie ? 'M48 74 Q 60 90 72 74 Z' : humeur === 'oups' ? 'M52 80 Q 60 76 68 80' : 'M50 76 Q 60 86 70 76'}
        />
      </g>

      {humeur === 'oups' && (
        <g className="sc-marchande__doute">
          <circle cx="118" cy="24" r="14" />
          <text x="118" y="31" textAnchor="middle">?</text>
        </g>
      )}

      {humeur === 'aide' && (
        <path
          className="sc-marchande__coeur"
          d="M118 38 C 104 28 106 14 114 14 C 117 14 118 17 118 18 C 118 17 119 14 122 14 C 130 14 132 28 118 38 Z"
        />
      )}

      {ravie && (
        <g className="sc-marchande__piece-or">
          <circle cx="118" cy="30" r="13" />
          <text x="118" y="35.5" textAnchor="middle">€</text>
        </g>
      )}
    </svg>
  );
}

/** La fête du marché : une pluie de pièces d'or, d'étoiles et de petites pommes. */
export function FeteMarche() {
  return (
    <Gerbe
      prefixe="sc-marchande"
      nombre={16}
      formes={[
        () => (
          <svg viewBox="0 0 24 24" width="100%" height="100%" focusable="false">
            <circle cx="12" cy="12" r="11" fill="#c9962f" />
            <circle cx="12" cy="12" r="8.5" fill="#f2cf63" />
            <text x="12" y="16.5" textAnchor="middle" fontSize="12" fontWeight="700" fill="#7a5a12">€</text>
          </svg>
        ),
        () => <Etoile couleur="#ffd34d" />,
        () => (
          <svg viewBox="0 0 24 24" width="100%" height="100%" focusable="false">
            <path d="M12 6 C 16 2 22 4 22 12 C 22 19 16 23 12 21 C 8 23 2 19 2 12 C 2 4 8 2 12 6 Z" fill="#e2483c" />
            <path d="M12 6 Q 13 3 15 2" stroke="#6b4a2a" strokeWidth="1.6" fill="none" />
          </svg>
        ),
        () => <Etoile couleur="#8fe3a8" />,
      ]}
    />
  );
}
