import { Enonce, useEtapes } from './commun';

/**
 * L'OBSERVATOIRE — « Le globe » (3e), le 09/10/2026.
 * La couverture : un observatoire de verre et de laiton la nuit, une sphère
 * armillaire dorée autour d'un globe bleu, la lune sur la mer. La scène :
 *   - L'ÉNONCÉ sur une plaque de verre bleu nuit cerclée d'or ; à côté, la
 *     sphère armillaire qui tourne lentement ;
 *   - LA CARTE CÉLESTE : le planisphère quadrillé, l'équateur et le méridien
 *     de Greenwich en or ;
 *   - LIRE : APRÈS, un repère part de l'intersection de l'équateur et de
 *     Greenwich, suit l'équateur jusqu'à sa longitude, puis monte ou descend
 *     jusqu'à sa latitude — et l'on écrit la LATITUDE D'ABORD ;
 *   - LE VOYAGE : l'avion est posé à son départ (la question le donne) ;
 *     APRÈS, il vole vers le nord, le sud, l'est ou l'ouest ;
 *   - LES NOTIONS : APRÈS, la ligne ou le point dont on parle s'allume.
 */

const P = 'sc-le-globe';
const X = (lon) => 180 + lon;
const Y = (lat) => 90 - lat;

/** « 40° N ; 30° O » → [40, −30] (latitude, longitude, signées). */
function lireCoord(texte) {
  const lat = String(texte).match(/(\d+)° ([NS])/);
  const lon = String(texte).match(/(\d+)° ([EO])/);
  if (!lat || !lon) return null;
  return [Number(lat[1]) * (lat[2] === 'N' ? 1 : -1), Number(lon[1]) * (lon[2] === 'E' ? 1 : -1)];
}

/** Le planisphère : quadrillage de 30° en 30°, équateur et Greenwich dorés. */
function Carte({ children, equateur = false, greenwich = false }) {
  const meridiens = Array.from({ length: 13 }, (_, i) => -180 + i * 30);
  const paralleles = Array.from({ length: 7 }, (_, i) => -90 + i * 30);
  return (
    <svg viewBox="-34 -14 420 214" className={`${P}__carte`} aria-hidden="true" focusable="false">
      <rect x="0" y="0" width="360" height="180" rx="10" className={`${P}__ocean`} />
      {/* Des continents esquissés, pour se repérer d'un coup d'œil. */}
      <path d="M95 25 C120 15 150 30 140 55 C132 75 120 80 112 100 C105 85 85 70 80 50 Z M120 105 C135 100 150 115 145 140 C140 160 128 165 124 150 C120 135 112 120 120 105 Z M175 30 C200 20 230 25 260 30 C300 28 330 40 320 60 C300 70 270 65 250 75 C235 85 215 70 200 65 C185 60 172 50 175 30 Z M178 72 C200 68 215 80 212 100 C208 125 198 135 190 120 C182 105 172 90 178 72 Z M290 115 C310 110 325 118 320 130 C310 140 292 135 290 115 Z" className={`${P}__terres`} />
      {meridiens.map((lon) => <line key={`m${lon}`} x1={X(lon)} x2={X(lon)} y1="0" y2="180" className={`${P}__meridien`} />)}
      {paralleles.map((lat) => <line key={`p${lat}`} x1="0" x2="360" y1={Y(lat)} y2={Y(lat)} className={`${P}__parallele`} />)}
      <line x1="0" x2="360" y1={Y(0)} y2={Y(0)} className={`${P}__equateur${equateur ? ' est-allume' : ''}`} />
      <line x1={X(0)} x2={X(0)} y1="0" y2="180" className={`${P}__greenwich${greenwich ? ' est-allume' : ''}`} />
      <text x="362" y={Y(0) + 4} className={`${P}__legende`}>0°</text>
      <text x={X(0)} y="-4" textAnchor="middle" className={`${P}__legende`}>N</text>
      <text x={X(0)} y="194" textAnchor="middle" className={`${P}__legende`}>S</text>
      <text x="-6" y={Y(0) + 4} textAnchor="end" className={`${P}__legende`}>O</text>
      <text x="374" y={Y(0) - 8} className={`${P}__legende`}>E</text>
      {children}
    </svg>
  );
}

/** Un repère sur la carte. */
function Repere({
  lat, lon, texte, classe = '',
}) {
  return (
    <g className={`${P}__repere ${classe}`}>
      <circle cx={X(lon)} cy={Y(lat)} r="5" />
      {texte && (
        <text x={X(lon) + (lon > 100 ? -8 : 8)} y={Y(lat) + (lat > 60 ? 16 : -8)} textAnchor={lon > 100 ? 'end' : 'start'}>{texte}</text>
      )}
    </g>
  );
}

/** Lire : de l'origine, le long de l'équateur (longitude), puis vers le pôle (latitude). */
function Lecture({ m }) {
  const c = lireCoord(m.bonne);
  const k = useEtapes(3, 1200, 500);
  if (!c) return <Carte />;
  const [lat, lon] = c;
  return (
    <div className={`${P}__atelier`}>
      <Carte equateur={k === 1} greenwich={k === 2}>
        {k >= 1 && <line x1={X(0)} x2={X(lon)} y1={Y(0)} y2={Y(0)} className={`${P}__trajet ${P}__trajet--lon`} />}
        {k >= 2 && <line x1={X(lon)} x2={X(lon)} y1={Y(0)} y2={Y(lat)} className={`${P}__trajet ${P}__trajet--lat`} />}
        {k >= 1 && <text x={(X(0) + X(lon)) / 2} y={Y(0) + (lat > 0 ? 14 : -6)} textAnchor="middle" className={`${P}__mesure`}>{`${Math.abs(lon)}° ${lon > 0 ? 'E' : 'O'}`}</text>}
        {k >= 2 && <text x={X(lon) + (lon > 0 ? 6 : -6)} y={(Y(0) + Y(lat)) / 2} textAnchor={lon > 0 ? 'start' : 'end'} className={`${P}__mesure ${P}__mesure--lat`}>{`${Math.abs(lat)}° ${lat > 0 ? 'N' : 'S'}`}</text>}
        {k >= 3 && <Repere lat={lat} lon={lon} texte={m.bonne} classe={`${P}__repere--navire`} />}
      </Carte>
      <p className={`${P}__lecon`}>La latitude d’abord (nord ou sud de l’équateur), puis la longitude (est ou ouest de Greenwich).</p>
    </div>
  );
}

/** Le voyage : l'avion part de son point de départ et vole dans la direction donnée. */
function Voyage({ m, termine }) {
  const depart = lireCoord((String(m.question).match(/part de (.+?) et vole/) ?? [])[1]);
  const arrivee = termine ? lireCoord(m.bonne) : null;
  const k = useEtapes(termine ? 2 : 0, 1300, 400);
  if (!depart) return <Carte />;
  const ici = arrivee && k >= 1 ? arrivee : depart;
  return (
    <div className={`${P}__atelier`}>
      <Carte>
        <Repere lat={depart[0]} lon={depart[1]} texte="départ" classe={`${P}__repere--depart`} />
        {arrivee && k >= 1 && <line x1={X(depart[1])} x2={X(arrivee[1])} y1={Y(depart[0])} y2={Y(arrivee[0])} className={`${P}__trajet ${P}__trajet--vol`} />}
        <g className={`${P}__avion-place`} style={{ transform: `translate(${X(ici[1])}px, ${Y(ici[0])}px)` }}>
          <path d="M0 -9 L3 -2 L10 1 L3 2 L2 8 L0 6 L-2 8 L-3 2 L-10 1 L-3 -2 Z" className={`${P}__avion`} />
        </g>
        {arrivee && k >= 2 && <Repere lat={arrivee[0]} lon={arrivee[1]} texte={m.bonne} classe={`${P}__repere--arrivee`} />}
      </Carte>
      {termine && (
        <p className={`${P}__lecon`}>Vers le nord ou le sud, seule la latitude change ; vers l’est ou l’ouest, seule la longitude.</p>
      )}
    </div>
  );
}

/** Les notions : la ligne ou le point dont parle la question s'allume. */
function Notion({ m, termine }) {
  const b = String(m.bonne);
  if (!termine) return <Carte />;
  return (
    <div className={`${P}__atelier`}>
      <Carte equateur={/équateur/.test(b)} greenwich={/Greenwich/.test(b)}>
        {/^90° N$/.test(b) && <Repere lat={90} lon={0} texte="pôle Nord : 90° N" classe={`${P}__repere--arrivee`} />}
        {/parallèle/.test(b) && <line x1="0" x2="360" y1={Y(45)} y2={Y(45)} className={`${P}__ligne-notion`} />}
        {/méridien/.test(b) && !/Greenwich/.test(b) && <line x1={X(60)} x2={X(60)} y1="0" y2="180" className={`${P}__ligne-notion`} />}
        {/180°/.test(b) && (
          <>
            <line x1={X(0)} x2="360" y1={Y(-60)} y2={Y(-60)} className={`${P}__fleche`} />
            <line x1={X(0)} x2="0" y1={Y(-60)} y2={Y(-60)} className={`${P}__fleche`} />
            <text x="300" y={Y(-60) - 6} textAnchor="middle" className={`${P}__mesure`}>180° E</text>
            <text x="60" y={Y(-60) - 6} textAnchor="middle" className={`${P}__mesure`}>180° O</text>
          </>
        )}
        {/90° N ou S/.test(b) && (
          <>
            <line x1="330" x2="330" y1={Y(0)} y2="0" className={`${P}__fleche`} />
            <line x1="330" x2="330" y1={Y(0)} y2="180" className={`${P}__fleche`} />
            <text x="336" y="20" className={`${P}__mesure ${P}__mesure--lat`}>90° N</text>
            <text x="336" y="170" className={`${P}__mesure ${P}__mesure--lat`}>90° S</text>
          </>
        )}
      </Carte>
    </div>
  );
}

const SORTES = {
  'lire-globe': ({ m, termine }) => (termine ? <Lecture m={m} /> : <Carte />),
  'voyage-globe': Voyage,
  'notions-globe': Notion,
};

/** La sphère armillaire de la couverture : des cercles d'or autour d'un globe bleu, qui tourne. */
function Armillaire() {
  return (
    <svg viewBox="0 0 80 80" className={`${P}__armillaire`} aria-hidden="true" focusable="false">
      <circle cx="40" cy="40" r="22" className={`${P}__boule`} />
      <ellipse cx="40" cy="40" rx="22" ry="22" className={`${P}__meridien-tournant`} />
      <ellipse cx="40" cy="40" rx="34" ry="10" className={`${P}__anneau`} />
      <ellipse cx="40" cy="40" rx="10" ry="34" className={`${P}__anneau ${P}__anneau--penche`} />
      <path d="M40 74 V80 M30 80 H50" className={`${P}__anneau`} />
    </svg>
  );
}

export function QuestionGlobe({ m, termine }) {
  const Sorte = SORTES[m.consigne];
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <div className={`${P}__entete`}>
        <Armillaire />
        <Enonce m={m} classe={`${P}__plaque`} />
      </div>
      {Sorte && <Sorte key={termine ? 'apres' : 'avant'} m={m} termine={termine} />}
    </div>
  );
}

export const sceneGlobe = {
  question: (m, termine) => <QuestionGlobe m={m} termine={termine} />,
  objets: P,
};
