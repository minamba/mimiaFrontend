import { Enonce, ecrire, nombre, proprietesChoix, useEtapes } from './commun';

/**
 * LE PORT DE LA BATAILLE NAVALE — « La bataille navale » (5e), le 09/10/2026.
 * La couverture : une baie turquoise, des pontons de bois rouges, des
 * bateaux amarrés, une barre de navire. La scène est la CARTE MARINE du port :
 * le repère est quadrillé sur l'eau, le phare est à l'origine.
 *   - LIRE ou PLACER : APRÈS la réponse, le bateau part du phare, longe
 *     d'abord l'axe des abscisses, puis remonte ou descend : l'abscisse
 *     d'abord, l'ordonnée ensuite ;
 *   - LA ZONE : le point se pose, et son quart de carte s'allume ;
 *   - LE TIR : le canon est placé (la question le donne) ; APRÈS, le boulet
 *     suit le déplacement et l'eau gicle là où il tombe.
 *   - LES RÉPONSES : des bouées qui dansent sur l'eau ; pour la zone, on
 *     touche directement le bon quart de la carte.
 * Avant la réponse, aucun point cherché n'est dessiné.
 */

const P = 'sc-bataille-navale';
const N = 9;
const C = 16;
const O = 22 + N * C;
const X = (x) => O + x * C;
const Y = (y) => O - y * C;

/** « 3 à droite, 2 en bas » → [3, −2] */
function lireChemin(texte) {
  const r = String(texte).match(/(\d+) (à droite|à gauche), (\d+) (en haut|en bas)/);
  if (!r) return null;
  return [Number(r[1]) * (r[2] === 'à droite' ? 1 : -1), Number(r[3]) * (r[4] === 'en haut' ? 1 : -1)];
}

/** « A(1 ; −2) » → [1, −2] */
function lirePoint(texte, nom) {
  const r = String(texte).match(new RegExp(`${nom}\\((−?\\d+) ; (−?\\d+)\\)`));
  return r ? [nombre(r[1]), nombre(r[2])] : null;
}

/** La carte marine : le quadrillage, les axes, le phare à l'origine. */
function Carte({ children, zone = null }) {
  const traits = Array.from({ length: 2 * N + 1 }, (_, i) => i - N);
  const quarts = [['haut-droite', 1, 1], ['haut-gauche', -1, 1], ['bas-gauche', -1, -1], ['bas-droite', 1, -1]];
  return (
    <svg viewBox={`0 0 ${2 * O} ${2 * O}`} className={`${P}__carte`} aria-hidden="true" focusable="false">
      <rect x="0" y="0" width={2 * O} height={2 * O} rx="16" className={`${P}__mer`} />
      {quarts.map(([nom, sx, sy]) => (
        <rect
          key={nom}
          x={sx > 0 ? O : X(-N)}
          y={sy > 0 ? Y(N) : O}
          width={N * C}
          height={N * C}
          className={`${P}__quart${zone === nom ? ' est-allume' : ''}`}
        />
      ))}
      {traits.map((v) => (
        <g key={v}>
          <line x1={X(v)} x2={X(v)} y1={Y(N)} y2={Y(-N)} className={`${P}__ligne`} />
          <line x1={X(-N)} x2={X(N)} y1={Y(v)} y2={Y(v)} className={`${P}__ligne`} />
          {v !== 0 && v % 2 === 0 && (
            <>
              <text x={X(v)} y={O + 15} textAnchor="middle" className={`${P}__graduation`}>{ecrire(v)}</text>
              <text x={O - 6} y={Y(v) + 4} textAnchor="end" className={`${P}__graduation`}>{ecrire(v)}</text>
            </>
          )}
        </g>
      ))}
      <line x1={X(-N)} x2={X(N) + 8} y1={O} y2={O} className={`${P}__axe`} />
      <line x1={O} x2={O} y1={Y(-N)} y2={Y(N) - 8} className={`${P}__axe`} />
      <text x={X(N) + 4} y={O - 6} className={`${P}__nom-axe`}>x</text>
      <text x={O + 6} y={Y(N) - 2} className={`${P}__nom-axe`}>y</text>
      {/* Le phare, à l'origine. */}
      <g className={`${P}__phare`} transform={`translate(${O} ${O})`}>
        <path d="M-5 0 L-3 -18 H3 L5 0 Z" />
        <rect x="-4" y="-23" width="8" height="5" className={`${P}__lanterne`} />
        <path d="M0 -21 L-40 -34 L-40 -8 Z M0 -21 L40 -34 L40 -8 Z" className={`${P}__faisceau`} />
      </g>
      {children}
    </svg>
  );
}

/** Le petit bateau rouge et blanc des pontons. */
function Bateau({ x, y, classe = '' }) {
  return (
    <g className={`${P}__bateau-place`} style={{ transform: `translate(${X(x)}px, ${Y(y)}px)` }}>
      <g className={`${P}__bateau ${classe}`}>
        <path d="M-11 -2 H11 L7 6 H-7 Z" className={`${P}__coque`} />
        <path d="M0 -2 V-18 L9 -6 Z" className={`${P}__voile`} />
      </g>
    </g>
  );
}

/** Un point marqué sur la carte, avec son nom et ses coordonnées. */
function Repere({ x, y, nom, coords = true, classe = '' }) {
  return (
    <g className={`${P}__repere ${classe}`}>
      <line x1={X(x)} x2={X(x)} y1={O} y2={Y(y)} className={`${P}__projection`} />
      <line x1={O} x2={X(x)} y1={Y(y)} y2={Y(y)} className={`${P}__projection`} />
      <circle cx={X(x)} cy={Y(y)} r="5" />
      <text x={X(x) + (x < 0 ? -8 : 8)} y={Y(y) + (y < 0 ? 18 : -9)} textAnchor={x < 0 ? 'end' : 'start'}>
        {coords ? `${nom}(${ecrire(x)} ; ${ecrire(y)})` : nom}
      </text>
    </g>
  );
}

/** Le voyage en deux temps : d'abord le long de l'axe des abscisses, puis vers le haut ou le bas. */
function Voyage({
  depart, dx, dy, nom, tir = false, coordsDepart = false,
}) {
  const k = useEtapes(3, 1100, 500);
  const [x0, y0] = depart;
  const fin = [x0 + dx, y0 + dy];
  let ici = depart;
  if (k >= 1) ici = [x0 + dx, y0];
  if (k >= 2) ici = fin;
  return (
    <Carte>
      {tir || coordsDepart ? <Repere x={x0} y={y0} nom="A" classe={`${P}__repere--depart`} /> : null}
      {k >= 1 && <line x1={X(x0)} x2={X(x0 + dx)} y1={Y(y0)} y2={Y(y0)} className={`${P}__sillage ${P}__sillage--x`} />}
      {k >= 2 && <line x1={X(x0 + dx)} x2={X(x0 + dx)} y1={Y(y0)} y2={Y(y0 + dy)} className={`${P}__sillage ${P}__sillage--y`} />}
      {k >= 1 && <text x={(X(x0) + X(x0 + dx)) / 2} y={Y(y0) + (y0 >= 0 ? 16 : -8)} textAnchor="middle" className={`${P}__pas`}>{`${Math.abs(dx)} ${dx > 0 ? '→' : '←'}`}</text>}
      {k >= 2 && <text x={X(x0 + dx) + 8} y={(Y(y0) + Y(y0 + dy)) / 2 + 4} className={`${P}__pas`}>{`${Math.abs(dy)} ${dy > 0 ? '↑' : '↓'}`}</text>}
      {tir ? (
        <>
          <g className={`${P}__boulet-place`} style={{ transform: `translate(${X(ici[0])}px, ${Y(ici[1])}px)` }}>
            <circle r="6" className={`${P}__boulet`} />
          </g>
          {k >= 3 && (
            <g className={`${P}__gerbe-eau`} transform={`translate(${X(fin[0])} ${Y(fin[1])})`}>
              <path d="M0 0 L-8 -16 M0 0 L0 -20 M0 0 L8 -16 M0 0 L-14 -6 M0 0 L14 -6" />
            </g>
          )}
        </>
      ) : <Bateau x={ici[0]} y={ici[1]} />}
      {k >= 3 && <Repere x={fin[0]} y={fin[1]} nom={nom} classe={`${P}__repere--arrivee`} />}
    </Carte>
  );
}

function ScenePoint({ m, termine }) {
  const q = String(m.question);
  if (m.consigne === 'lire-point') {
    const ch = lireChemin(q);
    if (!ch) return null;
    return termine ? <Voyage depart={[0, 0]} dx={ch[0]} dy={ch[1]} nom="" /> : <Carte><Bateau x={0} y={0} /></Carte>;
  }
  if (m.consigne === 'placer-point') {
    const b = lirePoint(q, 'B');
    if (!b) return null;
    return termine ? <Voyage depart={[0, 0]} dx={b[0]} dy={b[1]} nom="B" /> : <Carte><Bateau x={0} y={0} /></Carte>;
  }
  if (m.consigne === 'deplacer') {
    const a = lirePoint(q, 'A');
    const ch = lireChemin(q.split(':')[1] ?? '');
    if (!a || !ch) return null;
    return termine
      ? <Voyage depart={a} dx={ch[0]} dy={ch[1]} nom="" tir />
      : <Carte><Repere x={a[0]} y={a[1]} nom="A" classe={`${P}__repere--depart`} /></Carte>;
  }
  if (m.consigne === 'quadrant') {
    const pt = lirePoint(q, 'M');
    if (!pt) return null;
    return termine ? <Quart pt={pt} /> : <Carte />;
  }
  return null;
}

function Quart({ pt }) {
  const k = useEtapes(2, 1000, 400);
  const [x, y] = pt;
  const zone = `${y > 0 ? 'haut' : 'bas'}-${x > 0 ? 'droite' : 'gauche'}`;
  return (
    <Carte zone={k >= 2 ? zone : null}>
      {k >= 1 && <line x1={O} x2={X(x)} y1={O} y2={O} className={`${P}__sillage ${P}__sillage--x`} />}
      {k >= 1 && <line x1={X(x)} x2={X(x)} y1={O} y2={Y(y)} className={`${P}__sillage ${P}__sillage--y`} />}
      {k >= 1 && <Repere x={x} y={y} nom="M" />}
    </Carte>
  );
}

/** La barre du navire de la couverture, qui tourne doucement. */
function Barre() {
  return (
    <svg viewBox="0 0 60 60" className={`${P}__barre`} aria-hidden="true" focusable="false">
      <g>
        {Array.from({ length: 8 }, (_, i) => (
          <line key={i} x1="30" y1="30" x2={30 + 28 * Math.cos((i * Math.PI) / 4)} y2={30 + 28 * Math.sin((i * Math.PI) / 4)} />
        ))}
        <circle cx="30" cy="30" r="18" />
        <circle cx="30" cy="30" r="5" className={`${P}__moyeu`} />
      </g>
    </svg>
  );
}

export function QuestionNavale({ m, termine }) {
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <div className={`${P}__entete`}>
        <Barre />
        <Enonce m={m} classe={`${P}__ordre`} />
      </div>
      <ScenePoint key={termine ? 'apres' : 'avant'} m={m} termine={termine} />
    </div>
  );
}

const PLACES = {
  'haut-gauche': 1, 'haut-droite': 2, 'bas-gauche': 3, 'bas-droite': 4,
};

/** Les réponses : des bouées sur l'eau ; pour la zone, les quatre quarts de la carte. */
export function Bouees({ m, choix, fautes, choisir }) {
  if (m.consigne === 'quadrant' && choix.every((c) => PLACES[c.cle])) {
    return (
      <div className={`${P}__mini`} aria-label="Choisis ta réponse" role="group">
        {[...choix].sort((a, b) => PLACES[a.cle] - PLACES[b.cle]).map(({ cle, libelle }) => (
          <button key={cle} {...proprietesChoix(cle, fautes, choisir)} className={`${P}__zone ${P}__zone--${cle}${fautes.includes(cle) ? ' est-faux' : ''}`}>
            {libelle}
          </button>
        ))}
        <span className={`${P}__mini-axe ${P}__mini-axe--x`} aria-hidden="true" />
        <span className={`${P}__mini-axe ${P}__mini-axe--y`} aria-hidden="true" />
      </div>
    );
  }
  return (
    <ul className={`${P}__bouees`} aria-label="Choisis ta réponse">
      {choix.map(({ cle, libelle }, i) => (
        <li key={cle} style={{ '--i': i }}>
          <button {...proprietesChoix(cle, fautes, choisir)} className={`${P}__bouee${fautes.includes(cle) ? ' est-faux' : ''}`}>
            {libelle}
          </button>
        </li>
      ))}
    </ul>
  );
}

export const sceneNavale = {
  question: (m, termine) => <QuestionNavale m={m} termine={termine} />,
  choix: (props) => <Bouees {...props} />,
};
