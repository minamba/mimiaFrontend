import { Etoile, Gerbe } from './commun';
import './cp-maths-1.css';

/**
 * LA FERME DE « LA BOÎTE DE 10 » (09/10/2026) — Camara : « je veux que ce
 * soit animé en fonction du thème […] un truc qui donne envie à mort à
 * l'enfant ». La couverture montre une ferme, une boîte à œufs sur la table,
 * et une poule ravie dans la paille ; la scène la reprend :
 *   - LE DÉCOR VIT : des nuages qui passent, deux papillons, une plume qui
 *     descend en se balançant, des herbes qui ondulent ;
 *   - LA MASCOTTE, COCOTTE LA POULE, DIT LA CONSIGNE : posée dans son nid à
 *     côté de la bulle, elle respire, cligne et picore en attendant ; elle
 *     penche la tête, un point d'interrogation au-dessus, quand le panier
 *     n'était pas le bon ; à la réussite elle bat des ailes, saute, et un
 *     poussin sort de sa coquille à côté d'elle ;
 *   - LA FÊTE : une gerbe d'étoiles, d'œufs et de plumes, et les œufs de la
 *     boîte qui se dandinent.
 * Rien de tout ça ne dit la réponse : la poule réagit à ce que l'enfant a
 * fait, jamais à ce qu'il devrait faire.
 */

/** Le décor animé, sous le jeu : il ne prend aucun clic et se tait aux lecteurs d'écran. */
export function DecorFerme() {
  return (
    <div className="sc-cp-maths-1__decor sc-boite-de-dix__decor" aria-hidden="true">
      <Nuage className="sc-boite-de-dix__nuage sc-boite-de-dix__nuage--1" />
      <Nuage className="sc-boite-de-dix__nuage sc-boite-de-dix__nuage--2" />
      <Papillon className="sc-boite-de-dix__papillon sc-boite-de-dix__papillon--1" couleur="#ff9ec7" />
      <Papillon className="sc-boite-de-dix__papillon sc-boite-de-dix__papillon--2" couleur="#ffd34d" />
      <svg className="sc-boite-de-dix__plume" viewBox="0 0 20 40" focusable="false">
        <path d="M10 2 C 18 10 18 26 10 38 C 2 26 2 10 10 2 Z" fill="#fffaf0" stroke="#e3d6bd" strokeWidth="1.2" />
        <path d="M10 6 L10 38" stroke="#d9c7a6" strokeWidth="1.2" />
      </svg>
      <svg className="sc-boite-de-dix__herbes" viewBox="0 0 90 50" focusable="false">
        {[8, 22, 36, 52, 66, 80].map((x, i) => (
          <path
            key={x}
            className="sc-boite-de-dix__brin"
            style={{ animationDelay: `${i * 0.35}s` }}
            d={`M${x} 50 Q ${x - 4} 28 ${x + (i % 2 ? 5 : -5)} ${10 + (i % 3) * 6}`}
          />
        ))}
      </svg>
    </div>
  );
}

function Nuage({ className }) {
  return (
    <svg className={className} viewBox="0 0 120 50" focusable="false">
      <path
        d="M20 42 C 6 42 6 26 20 26 C 22 12 44 10 50 22 C 56 8 84 8 86 24 C 102 22 108 42 92 42 Z"
        fill="rgba(255,255,255,0.88)"
      />
    </svg>
  );
}

/** Un papillon : deux paires d'ailes qui battent, un corps. Partagé avec le marché. */
export function Papillon({ className, couleur }) {
  return (
    <svg className={className} viewBox="0 0 40 30" focusable="false">
      <g className="sc-cp-maths-1__ailes">
        <ellipse cx="12" cy="11" rx="10" ry="8" fill={couleur} />
        <ellipse cx="28" cy="11" rx="10" ry="8" fill={couleur} />
        <ellipse cx="14" cy="21" rx="6" ry="5" fill={couleur} opacity="0.85" />
        <ellipse cx="26" cy="21" rx="6" ry="5" fill={couleur} opacity="0.85" />
      </g>
      <rect x="18.5" y="6" width="3" height="20" rx="1.5" fill="#5a3d2b" />
    </svg>
  );
}

/**
 * COCOTTE LA POULE — la mascotte de la ferme. `humeur` : 'attente', 'oups',
 * 'bravo' (voir `commun.js`). Les yeux changent avec elle : ouverts et ronds
 * en attendant, plissés de joie à la réussite — même immobile (mouvement
 * réduit), on voit qu'elle est contente.
 */
export function Poule({ humeur }) {
  const ravie = humeur === 'bravo';
  return (
    <svg className={`sc-boite-de-dix__poule est-${humeur}`} viewBox="0 0 150 124" aria-hidden="true" focusable="false">
      {/* LE NID DE PAILLE, comme sur la couverture. */}
      <ellipse className="sc-boite-de-dix__nid" cx="62" cy="108" rx="50" ry="13" />
      {[18, 34, 50, 66, 82, 98].map((x, i) => (
        <path
          key={x}
          className="sc-boite-de-dix__paille"
          d={`M${x} ${104 + (i % 2) * 4} l${i % 2 ? 14 : -12} ${-6 + (i % 3) * 3}`}
        />
      ))}

      <g className="sc-boite-de-dix__poule-corps">
        <path className="sc-boite-de-dix__queue" d="M88 70 C 104 52 112 60 106 72 C 116 70 114 86 98 88 Z" />
        <ellipse className="sc-boite-de-dix__ventre" cx="62" cy="80" rx="36" ry="27" />
        <ellipse className="sc-boite-de-dix__aile sc-boite-de-dix__aile--g" cx="32" cy="80" rx="12" ry="18" />
        <ellipse className="sc-boite-de-dix__aile sc-boite-de-dix__aile--d" cx="92" cy="80" rx="12" ry="18" />

        <g className="sc-boite-de-dix__tete">
          <path
            className="sc-boite-de-dix__crete"
            d="M48 30 C 46 16 56 14 58 22 C 60 10 72 12 70 22 C 76 14 86 20 78 32 Z"
          />
          <circle className="sc-boite-de-dix__visage" cx="62" cy="46" r="22" />
          <circle className="sc-boite-de-dix__joue" cx="47" cy="52" r="4.5" />
          <circle className="sc-boite-de-dix__joue" cx="77" cy="52" r="4.5" />
          {ravie ? (
            <g className="sc-boite-de-dix__yeux-ravis">
              <path d="M49 43 q5 -6 10 0" />
              <path d="M65 43 q5 -6 10 0" />
            </g>
          ) : (
            <g className="sc-boite-de-dix__yeux">
              <ellipse cx="54" cy="42" rx="3.4" ry="4.4" />
              <ellipse cx="70" cy="42" rx="3.4" ry="4.4" />
              <circle cx="55.2" cy="40.4" r="1.2" fill="#fff" />
              <circle cx="71.2" cy="40.4" r="1.2" fill="#fff" />
            </g>
          )}
          <path className="sc-boite-de-dix__bec" d={ravie ? 'M55 49 L69 49 L62 59 Z M56 51 L68 51' : 'M55 49 L69 49 L62 58 Z'} />
          <ellipse className="sc-boite-de-dix__barbillon" cx="62" cy="62" rx="3.4" ry="4.6" />
        </g>
      </g>

      {/* LE DOUTE, après un panier faux : un « ? » qui monte, jamais une croix. */}
      {humeur === 'oups' && (
        <g className="sc-boite-de-dix__doute">
          <circle cx="118" cy="24" r="14" />
          <text x="118" y="31" textAnchor="middle">?</text>
        </g>
      )}

      {/* LE POUSSIN DE LA RÉUSSITE, qui sort de sa coquille à côté de la poule. */}
      {ravie && (
        <g className="sc-boite-de-dix__poussin">
          <circle className="sc-boite-de-dix__poussin-corps" cx="126" cy="94" r="12" />
          <circle cx="122" cy="91" r="1.8" fill="#3a2a1a" />
          <circle cx="130" cy="91" r="1.8" fill="#3a2a1a" />
          <path d="M123 96 L129 96 L126 100 Z" fill="#f5a524" />
          <path className="sc-boite-de-dix__coquille" d="M110 100 L114 95 L118 100 L122 95 L126 100 L130 95 L134 100 L138 95 L142 100 C 142 116 110 116 110 100 Z" />
        </g>
      )}
    </svg>
  );
}

/** La fête de la ferme : étoiles, petits œufs et plumes, qui jaillissent et retombent. */
export function FeteFerme() {
  return (
    <Gerbe
      prefixe="sc-boite-de-dix"
      nombre={16}
      formes={[
        () => <Etoile couleur="#ffd34d" />,
        () => (
          <svg viewBox="0 0 24 30" width="100%" height="100%" focusable="false">
            <path d="M12 2 C 19 2 22 13 22 18 C 22 25 17 28 12 28 C 7 28 2 25 2 18 C 2 13 5 2 12 2 Z" fill="#f0c9a0" stroke="#fff" strokeWidth="1.4" />
          </svg>
        ),
        () => <Etoile couleur="#ff9ec7" />,
        () => (
          <svg viewBox="0 0 20 40" width="100%" height="100%" focusable="false">
            <path d="M10 2 C 18 10 18 26 10 38 C 2 26 2 10 10 2 Z" fill="#fffaf0" stroke="#e3d6bd" strokeWidth="1.2" />
          </svg>
        ),
      ]}
    />
  );
}
