import { Etoile, Gerbe } from './commun';
import './cp-maths-1.css';

/**
 * LA GARE DU « TRAIN DES NOMBRES » (09/10/2026). La couverture montre un quai
 * sous une marquise, un chef de gare qui accueille, une voie qui file vers un
 * viaduc, et un petit oiseau bleu perché sur le poteau indicateur ; la scène
 * la reprend :
 *   - LE DÉCOR VIT : des nuages qui glissent, un vol d'oiseaux qui traverse
 *     le ciel, des feuilles qui tombent de la marquise ;
 *   - LA MASCOTTE, PIOU, L'OISEAU CHEF DE GARE (le petit oiseau bleu de la
 *     couverture, avec la casquette du chef), DIT LA CONSIGNE : il se dandine
 *     sur sa pancarte en attendant, penche la tête avec un « ? » quand le
 *     wagon n'est pas au bon arrêt, et siffle le départ — sifflet, notes de
 *     musique, battements d'ailes — quand il y est ;
 *   - LA LOCOMOTIVE FUME en attendant sur le zéro ; à la réussite le wagon
 *     descend s'accrocher à son arrêt en rebondissant, la locomotive lâche un
 *     grand panache et ses roues tournent (voir `TrainDesNombres.js`) ;
 *   - LA FÊTE : des étoiles, des tickets et des bouffées de vapeur.
 * L'oiseau ne montre jamais l'arrêt : il réagit à l'essai, il ne le guide pas.
 */

export function DecorGare() {
  return (
    <div className="sc-cp-maths-1__decor sc-train-des-nombres__decor" aria-hidden="true">
      <svg className="sc-train-des-nombres__nuage sc-train-des-nombres__nuage--1" viewBox="0 0 120 50" focusable="false">
        <path d="M20 42 C 6 42 6 26 20 26 C 22 12 44 10 50 22 C 56 8 84 8 86 24 C 102 22 108 42 92 42 Z" fill="rgba(255,255,255,0.8)" />
      </svg>
      <svg className="sc-train-des-nombres__nuage sc-train-des-nombres__nuage--2" viewBox="0 0 120 50" focusable="false">
        <path d="M20 42 C 6 42 6 26 20 26 C 22 12 44 10 50 22 C 56 8 84 8 86 24 C 102 22 108 42 92 42 Z" fill="rgba(255,255,255,0.7)" />
      </svg>
      <svg className="sc-train-des-nombres__vol" viewBox="0 0 90 40" focusable="false">
        {[[10, 20], [36, 10], [62, 24]].map(([x, y], i) => (
          <path
            key={x}
            className="sc-train-des-nombres__oiseau-vol"
            style={{ animationDelay: `${i * 0.2}s` }}
            d={`M${x} ${y} q6 -7 12 0 q6 -7 12 0`}
          />
        ))}
      </svg>
      {[1, 2, 3].map((n) => (
        <svg key={n} className={`sc-train-des-nombres__feuille sc-train-des-nombres__feuille--${n}`} viewBox="0 0 20 20" focusable="false">
          <path d="M2 18 C 2 6 10 2 18 2 C 18 12 12 18 2 18 Z" fill={n === 2 ? '#f2b33d' : '#7cc35a'} />
          <path d="M3 17 L15 5" stroke="rgba(0,0,0,0.25)" strokeWidth="1" />
        </svg>
      ))}
    </div>
  );
}

/**
 * PIOU, L'OISEAU CHEF DE GARE. `humeur` : 'attente', 'oups' ou 'bravo'
 * (voir `commun.js`).
 */
export function Oiseau({ humeur }) {
  const ravi = humeur === 'bravo';
  return (
    <svg className={`sc-train-des-nombres__piou est-${humeur}`} viewBox="0 0 150 124" aria-hidden="true" focusable="false">
      {/* LA PANCARTE OÙ IL SE PERCHE — le poteau indicateur de la couverture. */}
      <rect className="sc-train-des-nombres__poteau" x="56" y="100" width="10" height="24" rx="2" />
      <path className="sc-train-des-nombres__pancarte" d="M18 96 H 100 L 110 104 L 100 112 H 18 Z" />

      <g className="sc-train-des-nombres__piou-corps">
        <path className="sc-train-des-nombres__pattes" d="M50 98 v-6 M72 98 v-6" />
        <path className="sc-train-des-nombres__queue-piou" d="M24 76 L 6 70 L 12 84 Z" />
        <circle className="sc-train-des-nombres__plumage" cx="60" cy="66" r="32" />
        <ellipse className="sc-train-des-nombres__poitrail" cx="62" cy="76" rx="20" ry="18" />
        <path className="sc-train-des-nombres__aile-piou sc-train-des-nombres__aile-piou--g" d="M30 64 C 18 70 20 88 34 90 C 38 82 38 72 30 64 Z" />
        <path className="sc-train-des-nombres__aile-piou sc-train-des-nombres__aile-piou--d" d="M90 64 C 102 70 100 88 86 90 C 82 82 82 72 90 64 Z" />

        {ravi ? (
          <g className="sc-train-des-nombres__yeux-ravis">
            <path d="M44 56 q5 -6 10 0" />
            <path d="M66 56 q5 -6 10 0" />
          </g>
        ) : (
          <g className="sc-train-des-nombres__yeux">
            <ellipse cx="49" cy="56" rx="3.6" ry="4.6" />
            <ellipse cx="71" cy="56" rx="3.6" ry="4.6" />
            <circle cx="50.3" cy="54.2" r="1.3" fill="#fff" />
            <circle cx="72.3" cy="54.2" r="1.3" fill="#fff" />
          </g>
        )}
        <circle className="sc-train-des-nombres__joue" cx="40" cy="64" r="4" />
        <circle className="sc-train-des-nombres__joue" cx="80" cy="64" r="4" />
        <path className="sc-train-des-nombres__bec-piou" d="M54 62 L66 62 L60 70 Z" />

        {/* LA CASQUETTE DU CHEF DE GARE : bleu nuit, galon doré, visière. */}
        <g className="sc-train-des-nombres__casquette">
          <path className="sc-train-des-nombres__casquette-haut" d="M34 40 C 34 22 86 22 86 40 Z" />
          <rect className="sc-train-des-nombres__galon" x="34" y="36" width="52" height="6" rx="2" />
          <path className="sc-train-des-nombres__visiere" d="M30 42 Q 60 52 90 42 L 90 46 Q 60 56 30 46 Z" />
          <circle className="sc-train-des-nombres__insigne" cx="60" cy="31" r="4" />
        </g>

        {ravi && (
          <g className="sc-train-des-nombres__sifflet">
            <rect x="64" y="64" width="16" height="7" rx="3.5" />
            <circle cx="82" cy="67.5" r="5" />
          </g>
        )}
      </g>

      {humeur === 'oups' && (
        <g className="sc-train-des-nombres__doute">
          <circle cx="122" cy="24" r="14" />
          <text x="122" y="31" textAnchor="middle">?</text>
        </g>
      )}

      {ravi && (
        <g className="sc-train-des-nombres__notes">
          <text className="sc-train-des-nombres__note sc-train-des-nombres__note--1" x="104" y="56">♪</text>
          <text className="sc-train-des-nombres__note sc-train-des-nombres__note--2" x="118" y="40">♫</text>
          <text className="sc-train-des-nombres__note sc-train-des-nombres__note--3" x="130" y="58">♪</text>
        </g>
      )}
    </svg>
  );
}

/** La fête de la gare : étoiles, tickets de train et bouffées de vapeur. */
export function FeteGare() {
  return (
    <Gerbe
      prefixe="sc-train-des-nombres"
      nombre={16}
      formes={[
        () => <Etoile couleur="#ffd34d" />,
        () => (
          <svg viewBox="0 0 30 20" width="100%" height="100%" focusable="false">
            <rect x="1" y="2" width="28" height="16" rx="3" fill="#ffe08a" stroke="#c8542f" strokeWidth="1.5" />
            <path d="M20 2 V 18" stroke="#c8542f" strokeWidth="1.2" strokeDasharray="2 2" />
          </svg>
        ),
        () => (
          <svg viewBox="0 0 30 24" width="100%" height="100%" focusable="false">
            <path d="M8 20 C 1 20 1 11 8 11 C 9 4 19 3 21 10 C 28 9 30 20 22 20 Z" fill="rgba(255,255,255,0.95)" />
          </svg>
        ),
        () => <Etoile couleur="#8fd3ff" />,
      ]}
    />
  );
}
