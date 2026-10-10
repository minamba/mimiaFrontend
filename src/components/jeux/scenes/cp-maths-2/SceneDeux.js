import Enfant from './Enfant';
import { Gerbe } from './communs';
import './cp-maths-2.css';

/**
 * DEUX PAR DEUX — l'univers de la couverture (09/10/2026).
 *
 * La couverture : une fillette aux longs cheveux violets fait deux « V » avec
 * ses doigts, devant le stand d'une fête foraine où tout va par paires —
 * deux nounours, deux canards, deux ballons de plage — sous les fanions, à
 * côté du manège. Par-dessus le décor peint : la guirlande de fanions ondule
 * et ses ampoules clignotent, et des ballons, TOUJOURS PAR DEUX, se dandinent
 * au bord de la scène.
 *
 * LES BALLONS DU DÉCOR NE SE COMPTENT PAS : deux à gauche, deux à droite,
 * quelle que soit la manche. Ils disent « par paires », pas un nombre.
 *
 * À LA RÉUSSITE, la fillette saute en faisant son « V », une paire de ballons
 * s'envole du milieu de la fête, et la gerbe lance des éclats deux par deux :
 * deux cœurs, deux étoiles, deux canards, deux ballons.
 */
const P = 'sc-deux-par-deux';

const COULEURS_FANIONS = ['#e84a3c', '#f2b632', '#2f7fe0', '#2fae5a', '#ff7eb3', '#7b5cd6'];

export function DecorDeux({ gagne }) {
  return (
    <div className={`${P}__decor`} aria-hidden="true">
      {/* LA GUIRLANDE : fanions et ampoules. */}
      <svg className={`${P}__guirlande`} viewBox="0 0 600 46" preserveAspectRatio="none">
        <path d="M0 6 Q150 30 300 8 Q450 30 600 6" stroke="#7a5a3a" strokeWidth="2" fill="none" />
        {Array.from({ length: 16 }, (_, i) => {
          const x = 18 + i * 37;
          const t = (x % 300) / 300;
          const y = 6 + Math.sin(t * Math.PI) * 13;
          return (
            <g key={i} className={`${P}__fanion ${P}__fanion--${i % 3}`} style={{ transformOrigin: `${x}px ${y}px` }}>
              <path d={`M${x - 11} ${y} L${x + 11} ${y} L${x} ${y + 24} Z`} fill={COULEURS_FANIONS[i % COULEURS_FANIONS.length]} />
              <circle className={`${P}__ampoule ${P}__ampoule--${i % 2}`} cx={x + 18} cy={y + 3} r="3.2" />
            </g>
          );
        })}
      </svg>

      <Paire classe={`${P}__paire ${P}__paire--g`} couleurs={['#e84a3c', '#2f7fe0']} />
      <Paire classe={`${P}__paire ${P}__paire--d`} couleurs={['#f2b632', '#e84a3c']} />

      {gagne && <Paire classe={`${P}__envol`} couleurs={['#ff7eb3', '#2fae5a']} />}
    </div>
  );
}

/** Deux ballons noués ensemble. */
function Paire({ classe, couleurs }) {
  return (
    <svg className={classe} viewBox="0 0 80 150">
      <path d="M24 62 Q30 100 40 146 M56 62 Q50 100 40 146" stroke="#8a8a8a" strokeWidth="1.5" fill="none" />
      {couleurs.map((c, i) => {
        const cx = i ? 56 : 24;
        return (
          <g key={c + cx}>
            <ellipse cx={cx} cy="34" rx="20" ry="25" fill={c} />
            <path d={`M${cx - 3} 58 L${cx} 63 L${cx + 3} 58 Z`} fill={c} />
            <ellipse cx={cx - 7} cy="24" rx="5" ry="8" fill="#fff" opacity="0.45" />
          </g>
        );
      })}
    </svg>
  );
}

/** Le « V » des deux doigts, comme sur la couverture. */
const V = (
  <path d="M-1 -3 L-6 -16 M1 -3 L6 -15" stroke="#f7d4b8" strokeWidth="4" strokeLinecap="round" fill="none" />
);

export function MascotteDeux({ humeur }) {
  return (
    <Enfant
      prefixe={P}
      humeur={humeur}
      main={V}
      tenue={{
        peau: '#f7d4b8',
        cheveux: '#6b4f8f',
        coiffure: 'longs',
        haut: '#f48fb1',
        hautClair: '#f8b7cd',
        bas: '#4a5a8a',
        chaussures: '#f4f4f4',
        accent: '#ffd23f',
      }}
    />
  );
}

/** Les éclats de la fête vont par deux : c'est le thème. */
const COEURS = (
  <g fill="#ff5d8f">
    <path d="M11 30 C1 23 1 13 6 12 C9 11.5 10.5 13.5 11 15 C11.5 13.5 13 11.5 16 12 C21 13 21 23 11 30 Z" />
    <path d="M29 30 C19 23 19 13 24 12 C27 11.5 28.5 13.5 29 15 C29.5 13.5 31 11.5 34 12 C39 13 39 23 29 30 Z" />
  </g>
);

const ETOILES = (
  <g fill="#ffc83d" stroke="#e09a00" strokeWidth="1.2" strokeLinejoin="round">
    <path d="M10 10 L12.6 16 L19 16.4 L14 20.6 L15.6 27 L10 23.6 L4.4 27 L6 20.6 L1 16.4 L7.4 16 Z" />
    <path d="M30 10 L32.6 16 L39 16.4 L34 20.6 L35.6 27 L30 23.6 L24.4 27 L26 20.6 L21 16.4 L27.4 16 Z" />
  </g>
);

const CANARDS = (
  <g>
    {[0, 20].map((dx) => (
      <g key={dx} transform={`translate(${dx} 0)`}>
        <ellipse cx="10" cy="26" rx="9" ry="6.5" fill="#ffd23f" />
        <circle cx="13" cy="17" r="5.5" fill="#ffd23f" />
        <path d="M17.5 17 L22 18.5 L17.5 20 Z" fill="#ff8a1f" />
        <circle cx="14" cy="15.5" r="1.1" fill="#222" />
      </g>
    ))}
  </g>
);

const BALLONS = (
  <g>
    {[[10, '#e84a3c'], [30, '#2f7fe0']].map(([cx, c]) => (
      <g key={cx}>
        <circle cx={cx} cy="20" r="9" fill="#fff" />
        <path d={`M${cx} 11 A9 9 0 0 1 ${cx + 9} 20 L${cx} 20 Z`} fill={c} />
        <path d={`M${cx} 29 A9 9 0 0 1 ${cx - 9} 20 L${cx} 20 Z`} fill={c} />
        <circle cx={cx} cy="20" r="9" fill="none" stroke="#bbb" strokeWidth="1" />
      </g>
    ))}
  </g>
);

const MOTIFS = [COEURS, ETOILES, CANARDS, BALLONS];

export function FeteDeux() {
  return <Gerbe prefixe={P} motifs={MOTIFS} nombre={16} />;
}
