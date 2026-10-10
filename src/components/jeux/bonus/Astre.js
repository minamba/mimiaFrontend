import { useId } from 'react';

/**
 * LES PLANÈTES DESSINÉES — Camara, le 09/10/2026 : « ça ne ressemble pas trop
 * aux planètes, il y a la bonne couleur mais bon ». Une boule à dégradé ne se
 * reconnaît pas ; chaque planète porte maintenant ce qui la fait reconnaître :
 * les cratères de Mercure, les nuages de Vénus, les continents et les nuages
 * de la Terre, la calotte et les plaines sombres de Mars, les bandes et la
 * Grande Tache rouge de Jupiter, l'anneau de Saturne (derrière ET devant la
 * planète), l'anneau fin et presque vertical d'Uranus, la tache sombre de
 * Neptune. Par-dessus, la lumière du Soleil et le côté nuit.
 *
 * Dessin en SVG, repère 100 × 100, planète de rayon 48. La SURFACE est un motif
 * de 100 de large posé deux fois côte à côte : on la fait glisser de 100, et la
 * planète tourne sur elle-même sans à-coup (coupé en `prefers-reduced-motion`).
 */

const SURFACES = {
  mercure: {
    fond: '#9c958c',
    tour: 120,
    dessin: (
      <>
        <path d="M0 30 Q30 22 55 34 T100 30 V52 Q70 44 40 56 T0 50 Z" fill="#8a837a" opacity="0.6" />
        {[[12, 20, 7], [38, 64, 9], [70, 26, 6], [86, 70, 8], [24, 82, 5], [56, 44, 4], [8, 56, 4], [62, 84, 5], [92, 40, 4]].map(([x, y, r]) => (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r={r} fill="#7a736b" />
            <circle cx={x - r * 0.15} cy={y - r * 0.15} r={r * 0.75} fill="#8d867d" />
            <circle cx={x} cy={y} r={r} fill="none" stroke="#c4bdb3" strokeWidth="0.9" opacity="0.8" />
          </g>
        ))}
      </>
    ),
  },
  venus: {
    fond: '#e6bd72',
    tour: 160,
    atmosphere: '#ffe2a6',
    dessin: (
      <>
        <path d="M0 18 Q25 10 50 20 T100 18 V28 Q75 36 50 28 T0 30 Z" fill="#f4d9a0" opacity="0.8" />
        <path d="M0 44 Q30 34 55 46 T100 42 V54 Q70 62 45 52 T0 56 Z" fill="#d9a75a" opacity="0.55" />
        <path d="M0 66 Q25 58 50 68 T100 64 V74 Q75 82 50 74 T0 78 Z" fill="#f7e2b0" opacity="0.7" />
        <path d="M0 86 Q30 80 60 88 T100 86 V96 H0 Z" fill="#cf9a4e" opacity="0.5" />
      </>
    ),
  },
  terre: {
    fond: '#1f6fd1',
    tour: 70,
    atmosphere: '#8fd3ff',
    dessin: (
      <>
        {/* Les Amériques */}
        <path d="M14 14 Q24 10 30 18 Q28 28 22 32 Q26 38 30 44 Q34 54 28 62 Q26 74 22 84 Q18 76 18 66 Q14 56 16 46 Q10 40 8 30 Q8 20 14 14 Z" fill="#3f9b4b" />
        <path d="M20 40 Q24 44 22 50" stroke="#a88a55" strokeWidth="3" fill="none" opacity="0.7" />
        {/* L'Europe et l'Afrique */}
        <path d="M56 16 Q64 12 70 18 Q66 24 60 26 Q66 30 70 36 Q74 46 70 58 Q66 70 60 76 Q56 66 56 56 Q50 48 52 38 Q50 30 56 24 Z" fill="#4aa352" />
        <path d="M56 40 Q64 42 66 50 Q60 52 56 46 Z" fill="#c8a565" opacity="0.85" />
        {/* L'Asie et l'Australie */}
        <path d="M72 14 Q86 10 96 18 Q98 28 90 32 Q82 34 76 28 Q70 22 72 14 Z" fill="#3f9b4b" />
        <path d="M84 62 Q92 60 96 66 Q92 72 86 70 Z" fill="#b8955a" />
        {/* Les pôles */}
        <rect x="0" y="0" width="100" height="7" fill="#f4fbff" />
        <rect x="0" y="93" width="100" height="7" fill="#f4fbff" />
        {/* Les nuages */}
        <g fill="#fff" opacity="0.75">
          <path d="M4 36 Q14 32 24 36 Q16 39 4 38 Z" />
          <path d="M40 22 Q52 18 62 22 Q50 25 40 24 Z" />
          <path d="M34 64 Q46 60 58 64 Q46 67 34 66 Z" />
          <path d="M70 46 Q82 42 94 47 Q82 50 70 48 Z" />
          <path d="M8 80 Q18 77 28 80 Q18 83 8 82 Z" />
        </g>
      </>
    ),
  },
  mars: {
    fond: '#c4542a',
    tour: 72,
    dessin: (
      <>
        <path d="M8 40 Q20 30 34 40 Q30 52 18 54 Q8 50 8 40 Z" fill="#8f3416" opacity="0.75" />
        <path d="M52 56 Q66 48 80 58 Q74 70 60 68 Q52 64 52 56 Z" fill="#953a19" opacity="0.7" />
        <path d="M62 30 Q72 26 82 32 Q76 38 66 36 Z" fill="#9c3e1b" opacity="0.6" />
        {/* Valles Marineris */}
        <path d="M30 60 Q42 56 52 60" stroke="#7a2a10" strokeWidth="2" fill="none" opacity="0.8" />
        <path d="M0 70 Q30 64 60 74 T100 72 V84 Q60 80 30 86 T0 82 Z" fill="#dd7c4c" opacity="0.5" />
        {/* La calotte polaire */}
        <path d="M0 0 H100 V8 Q75 13 50 9 T0 9 Z" fill="#fbf3ee" />
      </>
    ),
  },
  jupiter: {
    fond: '#e8d3b4',
    tour: 40,
    dessin: (
      <>
        {[
          [6, 8, '#b9875c'], [16, 5, '#f2e3c9'], [22, 9, '#a8714a'], [33, 6, '#f5e8d2'],
          [40, 8, '#c08d60'], [50, 7, '#f0dfc2'], [58, 9, '#9e6844'], [69, 6, '#ecd9bb'],
          [76, 7, '#b78457'], [85, 6, '#e9d4b2'], [92, 8, '#a87a55'],
        ].map(([y, h, c]) => (
          <path key={y} d={`M0 ${y} Q25 ${y - 1.5} 50 ${y} T100 ${y} V${y + h} Q75 ${y + h + 1.5} 50 ${y + h} T0 ${y + h} Z`} fill={c} />
        ))}
        {/* La Grande Tache rouge */}
        <ellipse cx="34" cy="64" rx="10" ry="5.5" fill="#f0dcc0" />
        <ellipse cx="34" cy="64" rx="8" ry="4" fill="#c1502f" />
        <ellipse cx="33" cy="63.4" rx="4.5" ry="2" fill="#d8704a" />
      </>
    ),
  },
  saturne: {
    fond: '#ecd398',
    tour: 46,
    dessin: (
      <>
        {[[10, 8, '#d7b475'], [22, 6, '#f3e2b2'], [34, 9, '#dcbc80'], [50, 6, '#f6e7bd'], [60, 8, '#d1ad6c'], [74, 7, '#efdba6'], [86, 10, '#c9a464']].map(([y, h, c]) => (
          <rect key={y} x="0" y={y} width="100" height={h} fill={c} opacity="0.85" />
        ))}
      </>
    ),
  },
  uranus: {
    fond: '#9fe1e8',
    tour: 90,
    atmosphere: '#d6fbff',
    dessin: (
      <>
        <rect x="0" y="30" width="100" height="10" fill="#b4ecf1" opacity="0.6" />
        <rect x="0" y="58" width="100" height="12" fill="#86d0da" opacity="0.5" />
      </>
    ),
  },
  neptune: {
    fond: '#3560d4',
    tour: 64,
    atmosphere: '#8fb4ff',
    dessin: (
      <>
        <rect x="0" y="20" width="100" height="10" fill="#2a4fb8" opacity="0.7" />
        <rect x="0" y="62" width="100" height="14" fill="#4a78e6" opacity="0.6" />
        <ellipse cx="40" cy="46" rx="9" ry="5" fill="#1b2d78" />
        <path d="M30 38 Q40 35 52 38" stroke="#f2f6ff" strokeWidth="2" fill="none" opacity="0.85" strokeLinecap="round" />
        <path d="M66 58 Q76 55 88 58" stroke="#f2f6ff" strokeWidth="1.6" fill="none" opacity="0.75" strokeLinecap="round" />
        <path d="M10 70 Q18 68 26 70" stroke="#e8efff" strokeWidth="1.4" fill="none" opacity="0.6" strokeLinecap="round" />
      </>
    ),
  },
};

/** L'anneau, en deux moitiés : celle de derrière avant la planète, celle de devant après. */
function Anneau({ devant, fin = false }) {
  const arc = devant ? 'M-32 50 A82 17 0 0 0 132 50' : 'M-32 50 A82 17 0 0 1 132 50';
  if (fin) {
    return <path d={arc} fill="none" stroke="#d6f4f7" strokeWidth="1.4" opacity={devant ? 0.75 : 0.4} />;
  }
  return (
    <g fill="none" opacity={devant ? 1 : 0.85}>
      <path d={arc} stroke="#b89c66" strokeWidth="11" />
      <path d={arc} stroke="#e6cf9a" strokeWidth="7" />
      <path d={arc} stroke="#5d4a2c" strokeWidth="1.2" opacity="0.7" />
    </g>
  );
}

export default function Astre({ cle, diametre }) {
  const id = `astre-${useId().replace(/:/g, '')}`;
  const s = SURFACES[cle];
  if (!s) return null;
  const anneau = cle === 'saturne' ? { inclinaison: -16 } : cle === 'uranus' ? { inclinaison: -80, fin: true } : null;
  return (
    <svg
      className={`astre astre--${cle}`}
      viewBox="0 0 100 100"
      width={diametre}
      height={diametre}
      style={{ '--tour': `${s.tour}s` }}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id={`${id}-disque`}><circle cx="50" cy="50" r="48" /></clipPath>
        <radialGradient id={`${id}-lumiere`} cx="34%" cy="30%" r="78%">
          <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="0.35" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.7" stopColor="#000" stopOpacity="0.32" />
          <stop offset="1" stopColor="#000" stopOpacity="0.78" />
        </radialGradient>
      </defs>

      {anneau && (
        <g transform={`rotate(${anneau.inclinaison} 50 50)`}><Anneau devant={false} fin={anneau.fin} /></g>
      )}

      <g clipPath={`url(#${id}-disque)`}>
        <rect x="0" y="0" width="100" height="100" fill={s.fond} />
        <g className="astre__surface">
          {s.dessin}
          <g transform="translate(100 0)">{s.dessin}</g>
        </g>
        <circle cx="50" cy="50" r="48" fill={`url(#${id}-lumiere)`} />
      </g>
      {s.atmosphere && <circle cx="50" cy="50" r="48.5" fill="none" stroke={s.atmosphere} strokeWidth="1.6" opacity="0.55" />}

      {anneau && (
        <g transform={`rotate(${anneau.inclinaison} 50 50)`}><Anneau devant fin={anneau.fin} /></g>
      )}
    </svg>
  );
}

/** Le Soleil : un cœur brûlant, une surface granuleuse, une couronne qui respire. */
export function Soleil() {
  const id = `soleil-${useId().replace(/:/g, '')}`;
  return (
    <svg className="planetes__soleil-dessin" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`${id}-coeur`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff6c9" />
          <stop offset="0.45" stopColor="#ffd25a" />
          <stop offset="0.8" stopColor="#ff8a1f" />
          <stop offset="1" stopColor="#e5481b" />
        </radialGradient>
        <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.22" numOctaves="2" seed="7" />
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 0.55  0 0 0 0 0.1  0 0 0 -1.6 1.05" />
        </filter>
        <clipPath id={`${id}-disque`}><circle cx="50" cy="50" r="50" /></clipPath>
      </defs>
      <circle cx="50" cy="50" r="50" fill={`url(#${id}-coeur)`} />
      <g clipPath={`url(#${id}-disque)`}>
        <rect x="0" y="0" width="100" height="100" filter={`url(#${id}-grain)`} opacity="0.45" />
      </g>
    </svg>
  );
}
