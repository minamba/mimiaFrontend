import { useId } from 'react';
import { valeur } from '../../lib/jeux/visuels.js';

/**
 * LE DESSIN ANIMÉ D'UNE QUESTION — voir `lib/jeux/visuels.js` pour les
 * données. Tout est en SVG : net à toutes les tailles, rien à charger. Les
 * traits se dessinent (`.visuel__trait`), les cotes apparaissent ensuite, la
 * boule tourne, les solides flottent, les courbes se tracent.
 */
const L = 320;
const H = 220;

/** Une cote : son texte dans une pastille, posée au milieu d'un segment. */
function Cote({ x, y, texte, inconnue }) {
  if (!texte) return null;
  const largeur = Math.max(30, 9 * String(texte).length + 14);
  return (
    // L'enveloppe porte la position ; l'intérieur, l'animation (un transform CSS
    // écraserait celui de l'attribut SVG).
    <g transform={`translate(${x} ${y})`}>
      <g className={`visuel__cote${inconnue || texte === '?' ? ' est-inconnue' : ''}`}>
        <rect x={-largeur / 2} y={-12} width={largeur} height={24} rx={12} />
        <text textAnchor="middle" dominantBaseline="central">{texte}</text>
      </g>
    </g>
  );
}

const Trait = ({ d, pointille, classe = '' }) => (
  <path className={`visuel__trait${pointille ? ' est-pointille' : ''} ${classe}`} d={d} pathLength={pointille ? undefined : 1} />
);

// --------------------------------------------------------------- les solides
function Solide({ forme, cotes, angleDroit }) {
  const c = cotes ?? {};
  if (forme === 'boule') {
    return (
      <g className="visuel__solide">
        <defs>
          <radialGradient id="visuel-boule" cx="35%" cy="32%" r="70%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#8fc7ff" />
            <stop offset="100%" stopColor="#2a5fbf" />
          </radialGradient>
        </defs>
        <circle cx={160} cy={110} r={82} fill="url(#visuel-boule)" className="visuel__surface" />
        <ellipse cx={160} cy={110} rx={82} ry={18} className="visuel__trait est-pointille" fill="none" />
        <ellipse cx={160} cy={110} rx={82} ry={82} className="visuel__meridien" fill="none">
          <animate attributeName="rx" values="82;6;82" dur="6s" repeatCount="indefinite" />
        </ellipse>
        <circle cx={160} cy={110} r={3.5} className="visuel__point" />
        {c.diametre && !c.rayon ? (
          <>
            <Trait d="M78 110 L242 110" classe="est-cote" />
            <Cote x={160} y={92} texte={c.diametre} />
          </>
        ) : (
          <>
            <Trait d="M160 110 L242 110" classe="est-cote" />
            <Cote x={201} y={92} texte={c.rayon} />
          </>
        )}
      </g>
    );
  }
  if (forme === 'cube' || forme === 'pave') {
    const [w, h, p] = forme === 'cube' ? [120, 120, 60] : [170, 95, 70];
    const x0 = 70; const y0 = 185; const dx = p * 0.75; const dy = -p * 0.55;
    const avant = `M${x0} ${y0} h${w} v${-h} h${-w} Z`;
    const dessus = `M${x0} ${y0 - h} l${dx} ${dy} h${w} l${-dx} ${-dy}`;
    const cote = `M${x0 + w} ${y0} l${dx} ${dy} v${-h}`;
    return (
      <g className="visuel__solide visuel__flotte">
        <path d={`${avant}`} className="visuel__face" />
        <path d={`M${x0} ${y0 - h} l${dx} ${dy} h${w} l${-dx} ${-dy} Z`} className="visuel__face est-dessus" />
        <path d={`M${x0 + w} ${y0} l${dx} ${dy} v${-h} l${-dx} ${-dy} Z`} className="visuel__face est-cote" />
        <Trait d={`M${x0} ${y0} l${dx} ${dy} h${w} M${x0 + dx} ${y0 + dy} v${-h}`} pointille />
        <Trait d={avant} />
        <Trait d={dessus} />
        <Trait d={cote} />
        {c.diagonale && (
          <>
            <Trait d={`M${x0} ${y0} L${x0 + w + dx} ${y0 - h + dy}`} classe="est-cote" />
            <Cote x={x0 + (w + dx) / 2} y={y0 - (h - dy) / 2 - 4} texte={c.diagonale} />
          </>
        )}
        {forme === 'cube' ? (
          <Cote x={x0 + w / 2} y={y0 + 16} texte={c.cote} />
        ) : (
          <>
            <Cote x={x0 + w / 2} y={y0 + 16} texte={c.longueur} />
            <Cote x={x0 + w + dx / 2 + 16} y={y0 + dy / 2 + 6} texte={c.largeur} />
            <Cote x={x0 - 22} y={y0 - h / 2} texte={c.hauteur} />
          </>
        )}
      </g>
    );
  }
  if (forme === 'cylindre' || forme === 'cone') {
    const cx = 160; const rx = 70; const ry = 18; const bas = 182; const haut = 42;
    return (
      <g className="visuel__solide visuel__flotte">
        {forme === 'cylindre' ? (
          <>
            <path d={`M${cx - rx} ${haut} V${bas} A${rx} ${ry} 0 0 0 ${cx + rx} ${bas} V${haut}`} className="visuel__face" />
            <ellipse cx={cx} cy={haut} rx={rx} ry={ry} className="visuel__face est-dessus" />
            <Trait d={`M${cx - rx} ${bas} A${rx} ${ry} 0 0 1 ${cx + rx} ${bas}`} pointille />
            <Trait d={`M${cx - rx} ${haut} V${bas} A${rx} ${ry} 0 0 0 ${cx + rx} ${bas} V${haut}`} />
            <Trait d={`M${cx - rx} ${haut} A${rx} ${ry} 0 1 0 ${cx + rx} ${haut} A${rx} ${ry} 0 1 0 ${cx - rx} ${haut}`} />
            <Trait d={c.diametre && !c.rayon ? `M${cx - rx} ${haut} H${cx + rx}` : `M${cx} ${haut} H${cx + rx}`} classe="est-cote" />
            <Cote x={c.diametre && !c.rayon ? cx : cx + rx / 2} y={haut - 16} texte={c.rayon ?? c.diametre} />
            <Cote x={cx + rx + 30} y={(haut + bas) / 2} texte={c.hauteur} />
          </>
        ) : (
          <>
            <path d={`M${cx - rx} ${bas} L${cx} ${haut} L${cx + rx} ${bas} A${rx} ${ry} 0 0 1 ${cx - rx} ${bas}`} className="visuel__face" />
            <Trait d={`M${cx - rx} ${bas} A${rx} ${ry} 0 0 1 ${cx + rx} ${bas}`} pointille />
            <Trait d={`M${cx - rx} ${bas} L${cx} ${haut} L${cx + rx} ${bas} A${rx} ${ry} 0 0 1 ${cx - rx} ${bas}`} />
            <Trait d={`M${cx} ${haut} V${bas}`} pointille />
            <Trait d={c.diametre && !c.rayon ? `M${cx - rx} ${bas} H${cx + rx}` : `M${cx} ${bas} H${cx + rx}`} classe="est-cote" />
            <Cote x={c.diametre && !c.rayon ? cx : cx + rx / 2} y={bas + 24} texte={c.rayon ?? c.diametre} />
            <Cote x={cx - 26} y={(haut + bas) / 2 + 10} texte={c.hauteur} />
          </>
        )}
      </g>
    );
  }
  if (forme === 'pyramide') {
    return (
      <g className="visuel__solide visuel__flotte">
        <path d="M80 175 L210 175 L165 40 Z" className="visuel__face" />
        <path d="M210 175 L250 140 L165 40 Z" className="visuel__face est-cote" />
        <Trait d="M80 175 L120 140 L250 140 M120 140 L165 40" pointille />
        <Trait d="M80 175 L210 175 L250 140 M80 175 L165 40 L210 175 M165 40 L250 140" />
        <Trait d="M165 40 L165 157" pointille />
        <Cote x={145} y={194} texte={c.cote ?? c.longueur} />
        {c.largeur && <Cote x={250} y={164} texte={c.largeur} />}
        <Cote x={188} y={100} texte={c.hauteur} />
      </g>
    );
  }
  // prisme droit à base triangulaire — rectangle en bas à gauche si `angleDroit`
  if (angleDroit) {
    return (
      <g className="visuel__solide visuel__flotte">
        <path d="M60 180 L140 180 L60 100 Z" className="visuel__face" />
        <path d="M140 180 L260 140 L180 60 L60 100 Z" className="visuel__face est-cote" />
        <Trait d="M60 180 L180 140 L260 140 M180 140 L180 60" pointille />
        <Trait d="M60 180 L140 180 L60 100 Z M140 180 L260 140 L180 60 L60 100" />
        <AngleDroit x={60} y={180} />
        <Cote x={100} y={196} texte={c.base} />
        <Cote x={34} y={140} texte={c.hauteur} />
        <Cote x={212} y={176} texte={c.longueur} />
      </g>
    );
  }
  return (
    <g className="visuel__solide visuel__flotte">
      <path d="M60 180 L130 180 L95 110 Z" className="visuel__face" />
      <path d="M130 180 L250 140 L215 70 L95 110 Z" className="visuel__face est-cote" />
      <Trait d="M60 180 L180 140 L250 140 M180 140 L215 70" pointille />
      <Trait d="M60 180 L130 180 L95 110 Z M130 180 L250 140 L215 70 L95 110" />
      <Cote x={95} y={196} texte={c.base} />
      <Cote x={60} y={140} texte={c.hauteur} />
      <Cote x={200} y={176} texte={c.longueur} />
    </g>
  );
}

// --------------------------------------------------------------- les figures
function AngleDroit({ x, y, sx = 1, sy = -1 }) {
  return <path className="visuel__trait" d={`M${x + 14 * sx} ${y} V${y + 14 * sy} H${x}`} pathLength={1} />;
}

function Figure({
  forme, cotes, angle, angles, noms, rapporteur, papillon: enPapillon, paralleles,
}) {
  const c = cotes ?? {};
  if (forme === 'triangle-rectangle' || forme === 'echelle' || forme === 'toboggan') {
    const A = [70, 35]; const B = [70, 185]; const C = [265, 185];
    const [na, nb, nc] = noms ?? [];
    return (
      <g className="visuel__figure">
        {forme === 'echelle' && (
          <>
            <path className="visuel__mur" d="M40 20 H70 V185 H40 Z" />
            <path className="visuel__sol" d="M40 185 H290 V198 H40 Z" />
          </>
        )}
        {forme === 'toboggan' && <path className="visuel__sol" d="M40 185 H290 V198 H40 Z" />}
        <path className="visuel__face" d={`M${A} L${B} L${C} Z`} />
        <Trait d={`M${A[0]} ${A[1]} L${B[0]} ${B[1]} L${C[0]} ${C[1]} Z`} />
        {forme === 'echelle' && Array.from({ length: 7 }, (_, i) => {
          const t = (i + 1) / 8;
          const x = A[0] + (C[0] - A[0]) * t; const y = A[1] + (C[1] - A[1]) * t;
          return <circle key={i} cx={x} cy={y} r={3} className="visuel__point" />;
        })}
        <AngleDroit x={B[0]} y={B[1]} />
        {angle && (
          angle.sommet === 'haut'
            ? <path className="visuel__arc" d={`M${A[0]} ${A[1] + 30} A30 30 0 0 0 ${A[0] + 17} ${A[1] + 25}`} />
            : <path className="visuel__arc" d={`M${C[0] - 40} ${C[1]} A40 40 0 0 1 ${C[0] - 36} ${C[1] - 17}`} />
        )}
        {angle && <Cote x={angle.sommet === 'haut' ? A[0] + 30 : C[0] - 66} y={angle.sommet === 'haut' ? A[1] + 52 : C[1] - 16} texte={angle.valeur} />}
        <Cote x={B[0] - 28} y={(A[1] + B[1]) / 2} texte={c.vertical} />
        <Cote x={(B[0] + C[0]) / 2} y={B[1] + 18} texte={c.horizontal} />
        <Cote x={(A[0] + C[0]) / 2 + 20} y={(A[1] + C[1]) / 2 - 16} texte={c.hypotenuse} />
        {na && <text className="visuel__nom" x={A[0] - 14} y={A[1]}>{na}</text>}
        {nb && <text className="visuel__nom" x={B[0] - 16} y={B[1] + 14}>{nb}</text>}
        {nc && <text className="visuel__nom" x={C[0] + 6} y={C[1] + 14}>{nc}</text>}
      </g>
    );
  }
  if (forme === 'triangle-quelconque') {
    const A = [120, 35]; const B = [40, 185]; const C = [285, 185];
    const [na, nb, nc] = noms ?? ['A', 'B', 'C'];
    const a = angle ?? {};
    return (
      <g className="visuel__figure">
        <path className="visuel__face" d={`M${A} L${B} L${C} Z`} />
        <Trait d={`M${A[0]} ${A[1]} L${B[0]} ${B[1]} L${C[0]} ${C[1]} Z`} />
        <text className="visuel__nom" x={A[0] - 5} y={A[1] - 8}>{na}</text>
        <text className="visuel__nom" x={B[0] - 16} y={B[1] + 14}>{nb}</text>
        <text className="visuel__nom" x={C[0] + 4} y={C[1] + 14}>{nc}</text>
        <Cote x={(A[0] + B[0]) / 2 - 26} y={(A[1] + B[1]) / 2} texte={c.AB} />
        <Cote x={(B[0] + C[0]) / 2} y={B[1] + 18} texte={c.BC} />
        <Cote x={(A[0] + C[0]) / 2 + 26} y={(A[1] + C[1]) / 2 - 10} texte={c.AC} />
        {a.A && <path className="visuel__arc" d={`M${A[0] - 12} ${A[1] + 22} A25 25 0 0 0 ${A[0] + 19} ${A[1] + 17}`} />}
        {a.A && <Cote x={A[0] + 4} y={A[1] + 46} texte={a.A} />}
        {a.B && <path className="visuel__arc" d={`M${B[0] + 34} ${B[1]} A34 34 0 0 0 ${B[0] + 18} ${B[1] - 30}`} />}
        {a.B && <Cote x={B[0] + 58} y={B[1] - 16} texte={a.B} />}
        {a.C && <path className="visuel__arc" d={`M${C[0] - 36} ${C[1]} A36 36 0 0 1 ${C[0] - 32} ${C[1] - 14}`} />}
        {a.C && <Cote x={C[0] - 62} y={C[1] - 14} texte={a.C} />}
      </g>
    );
  }
  if (forme === 'triangle') {
    return (
      <g className="visuel__figure">
        <path className="visuel__face" d="M50 180 L270 180 L120 40 Z" />
        <Trait d="M50 180 L270 180 L120 40 Z" />
        <Trait d="M120 40 V180" pointille />
        <AngleDroit x={120} y={180} />
        <Cote x={160} y={198} texte={c.base} />
        <Cote x={142} y={110} texte={c.hauteur} />
      </g>
    );
  }
  if (forme === 'rectangle' || forme === 'carre') {
    const [x, y, w, h] = forme === 'carre' ? [90, 35, 140, 140] : [45, 50, 230, 120];
    return (
      <g className="visuel__figure">
        <rect className="visuel__face visuel__remplit" x={x} y={y} width={w} height={h} />
        <Trait d={`M${x} ${y} h${w} v${h} h${-w} Z`} />
        <Cote x={x + w / 2} y={y + h + 18} texte={forme === 'carre' ? c.cote : c.longueur} />
        {forme === 'rectangle' && <Cote x={x + w + 26} y={y + h / 2} texte={c.largeur} />}
        {c.diagonale && (
          <>
            <Trait d={`M${x} ${y + h} L${x + w} ${y}`} classe="est-cote" />
            <Cote x={x + w / 2} y={y + h / 2 - 14} texte={c.diagonale} />
          </>
        )}
        {c.aire && <Cote x={x + w / 2} y={y + h / 2} texte={c.aire} />}
      </g>
    );
  }
  if (forme === 'parallelogramme' || forme === 'trapeze') {
    const d = forme === 'parallelogramme' ? 'M40 175 L230 175 L280 55 L90 55 Z' : 'M40 175 L280 175 L220 55 L100 55 Z';
    const sommet = forme === 'parallelogramme' ? 90 : 100;
    return (
      <g className="visuel__figure">
        <path className="visuel__face visuel__remplit" d={d} />
        <Trait d={d} />
        <Trait d={`M${sommet} 55 V175`} pointille />
        <AngleDroit x={sommet} y={175} />
        <Cote x={150} y={194} texte={forme === 'parallelogramme' ? c.base : c.grandeBase} />
        {forme === 'trapeze' && <Cote x={160} y={38} texte={c.petiteBase} />}
        <Cote x={sommet - 26} y={115} texte={c.hauteur} />
      </g>
    );
  }
  if (forme === 'disque') {
    return (
      <g className="visuel__figure">
        <circle className="visuel__face visuel__remplit" cx={160} cy={110} r={85} />
        <circle className="visuel__trait" cx={160} cy={110} r={85} fill="none" pathLength={1} />
        <circle cx={160} cy={110} r={3.5} className="visuel__point" />
        {c.diametre ? <Trait d="M75 110 H245" classe="est-cote" /> : <Trait d="M160 110 H245" classe="est-cote" />}
        <Cote x={c.diametre ? 160 : 202} y={92} texte={c.diametre ?? c.rayon} />
        {/* Le rayon ET le diamètre : le rayon descend du centre, le diamètre traverse. */}
        {c.diametre && c.rayon && (
          <>
            <Trait d="M160 110 V195" classe="est-cote" />
            <Cote x={186} y={158} texte={c.rayon} />
          </>
        )}
      </g>
    );
  }
  if (forme === 'angles-adjacents') {
    // Un angle partagé en deux : trois demi-droites issues du même sommet.
    const a = angle ?? {};
    const m1 = a.mesure1 ?? 40; const m2 = a.mesure2 ?? 50;
    const ox = 80; const oy = 180; const r = 150;
    const rayon = (deg, l) => [ox + l * Math.cos((deg * Math.PI) / 180), oy - l * Math.sin((deg * Math.PI) / 180)];
    const [x1, y1] = rayon(m1, r); const [x2, y2] = rayon(m1 + m2, r);
    const arc = (de, a2, l) => {
      const [sx, sy] = rayon(de, l); const [ex, ey] = rayon(a2, l);
      return `M${sx} ${sy} A${l} ${l} 0 0 0 ${ex} ${ey}`;
    };
    const [l1x, l1y] = rayon(m1 / 2, 70); const [l2x, l2y] = rayon(m1 + m2 / 2, 96);
    return (
      <g className="visuel__figure">
        <Trait d={`M${ox} ${oy} H${ox + r}`} />
        <Trait d={`M${ox} ${oy} L${x1} ${y1}`} />
        <Trait d={`M${ox} ${oy} L${x2} ${y2}`} />
        <path className="visuel__arc" d={arc(0, m1, 46)} />
        <path className="visuel__arc" d={arc(m1, m1 + m2, 66)} />
        <circle cx={ox} cy={oy} r={3.5} className="visuel__point" />
        <Cote x={l1x} y={l1y} texte={a.valeur1} />
        <Cote x={l2x} y={l2y} texte={a.valeur2} />
      </g>
    );
  }
  if (forme === 'secante') {
    // Deux droites coupées par une sécante ; des angles marqués à chaque croisement.
    const haut = [[20, 70], [300, 70]];
    const bas = paralleles === false ? [[20, 150], [300, 178]] : [[20, 160], [300, 160]];
    const sec = [[110, 15], [225, 210]];
    const croise = ([[ax, ay], [bx, by]]) => {
      const [[cx, cy], [dx, dy]] = sec;
      const den = (ax - bx) * (cy - dy) - (ay - by) * (cx - dx);
      const t = ((ax - cx) * (cy - dy) - (ay - cy) * (cx - dx)) / den;
      return [ax + t * (bx - ax), ay + t * (by - ay)];
    };
    const P = [croise(haut), croise(bas)];
    const dir = (p, q) => Math.atan2(q[1] - p[1], q[0] - p[0]);
    const est = (i) => dir((i ? bas : haut)[0], (i ? bas : haut)[1]);
    const descente = dir(sec[0], sec[1]);
    const ordre = (i) => {
      // Dans le sens des aiguilles d'une montre, depuis l'est : sud-est, sud-ouest, nord-ouest, nord-est.
      const e = est(i); const d = descente;
      return {
        se: [e, d], so: [d, e + Math.PI], no: [e + Math.PI, d + Math.PI], ne: [d + Math.PI, e + 2 * Math.PI],
      };
    };
    const marque = ({ point, coin, valeur: v }, k) => {
      const i = point === 2 ? 1 : 0;
      const [a1, a2] = ordre(i)[coin] ?? ordre(i).se;
      const [px, py] = P[i]; const l = 22;
      const fin = a2 < a1 ? a2 + 2 * Math.PI : a2;
      const milieu = (a1 + fin) / 2;
      return (
        // eslint-disable-next-line react/no-array-index-key
        <g key={k}>
          <path className="visuel__arc" d={`M${px + l * Math.cos(a1)} ${py + l * Math.sin(a1)} A${l} ${l} 0 ${fin - a1 > Math.PI ? 1 : 0} 1 ${px + l * Math.cos(fin)} ${py + l * Math.sin(fin)}`} />
          <Cote x={px + 44 * Math.cos(milieu)} y={py + 44 * Math.sin(milieu)} texte={v} />
        </g>
      );
    };
    return (
      <g className="visuel__figure">
        <Trait d={`M${haut[0][0]} ${haut[0][1]} L${haut[1][0]} ${haut[1][1]}`} />
        <Trait d={`M${bas[0][0]} ${bas[0][1]} L${bas[1][0]} ${bas[1][1]}`} />
        <Trait d={`M${sec[0][0]} ${sec[0][1]} L${sec[1][0]} ${sec[1][1]}`} classe="est-cote" />
        {(angles ?? []).map(marque)}
      </g>
    );
  }
  if (forme === 'deux-carres') {
    // Deux carrés côte à côte, chacun avec son aire (et son côté).
    return (
      <g className="visuel__figure">
        <rect className="visuel__face visuel__remplit" x={40} y={50} width={130} height={130} />
        <rect className="visuel__face visuel__remplit" x={195} y={95} width={85} height={85} />
        <Trait d="M40 50 h130 v130 h-130 Z" />
        <Trait d="M195 95 h85 v85 h-85 Z" />
        <Cote x={105} y={115} texte={c.aire1} />
        <Cote x={237} y={138} texte={c.aire2} />
        <Cote x={105} y={198} texte={c.cote1} />
        <Cote x={237} y={198} texte={c.cote2} />
      </g>
    );
  }
  if (forme === 'angle') {
    const m = Math.max(5, Math.min(355, angle?.mesure ?? 60));
    const r = 140; const ox = 90; const oy = 175;
    const fx = ox + r * Math.cos((m * Math.PI) / 180);
    const fy = oy - r * Math.sin((m * Math.PI) / 180);
    const ax = ox + 40 * Math.cos((m * Math.PI) / 180);
    const ay = oy - 40 * Math.sin((m * Math.PI) / 180);
    return (
      <g className="visuel__figure">
        {rapporteur && (
          <g className="visuel__rapporteur">
            <path d={`M${ox - 110} ${oy} A110 110 0 0 1 ${ox + 110} ${oy} Z`} />
            {Array.from({ length: 19 }, (_, i) => {
              const a = (i * 10 * Math.PI) / 180;
              return <path key={i} d={`M${ox + 100 * Math.cos(a)} ${oy - 100 * Math.sin(a)} L${ox + 110 * Math.cos(a)} ${oy - 110 * Math.sin(a)}`} />;
            })}
          </g>
        )}
        <Trait d={`M${ox} ${oy} H${ox + r}`} />
        <Trait d={`M${ox} ${oy} L${fx} ${fy}`} />
        <path className="visuel__arc" d={`M${ox + 40} ${oy} A40 40 0 ${m > 180 ? 1 : 0} 0 ${ax} ${ay}`} />
        <circle cx={ox} cy={oy} r={3.5} className="visuel__point" />
        <Cote x={ox + 70} y={oy - 26} texte={angle?.valeur} />
        {/* Les longueurs portées par les deux côtés (normes de deux vecteurs, par exemple). */}
        <Cote x={ox + r - 16} y={oy + 16} texte={c.u} />
        <Cote x={fx + (fx < ox ? -18 : 18)} y={fy - 10} texte={c.v} />
      </g>
    );
  }
  // thales : (MN) ∥ (BC). En triangle, M sur [AB] et N sur [AC] ; en papillon,
  // M et N au-delà de A. Les lettres suivent `noms` : [A, B, C, M, N].
  const [nA, nB, nC, nM, nN] = noms ?? ['A', 'B', 'C', 'M', 'N'];
  const papillon = Boolean(enPapillon);
  const A = papillon ? [150, 118] : [70, 30];
  const B = papillon ? [50, 190] : [40, 190];
  const C = papillon ? [215, 190] : [290, 190];
  const t = papillon ? -0.6 : 0.45;
  const M = [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t];
  const N = [A[0] + (C[0] - A[0]) * t, A[1] + (C[1] - A[1]) * t];
  const nom = (p, n, dx, dy) => <text className="visuel__nom" x={p[0] + dx} y={p[1] + dy}>{n}</text>;
  const segment = (p, q) => `M${p[0]} ${p[1]} L${q[0]} ${q[1]}`;
  return (
    <g className="visuel__figure">
      {!papillon && <path className="visuel__face" d={`M${A} L${B} L${C} Z`} />}
      {papillon ? (
        <>
          <Trait d={`${segment(B, M)} ${segment(C, N)} ${segment(B, C)}`} />
          <Trait d={segment(M, N)} classe="est-cote" />
        </>
      ) : (
        <>
          <Trait d={`M${A[0]} ${A[1]} L${B[0]} ${B[1]} L${C[0]} ${C[1]} Z`} />
          <Trait d={segment(M, N)} classe="est-cote" />
        </>
      )}
      {nom(A, nA, papillon ? 8 : -6, papillon ? 4 : -8)}
      {nom(B, nB, -14, 14)}
      {nom(C, nC, 4, 14)}
      {nom(M, nM, papillon ? 6 : -18, papillon ? -4 : 4)}
      {nom(N, nN, papillon ? -18 : 6, -4)}
      <Cote x={(A[0] + M[0]) / 2 + (papillon ? 26 : -28)} y={(A[1] + M[1]) / 2} texte={c.AM} />
      <Cote x={(papillon ? (A[0] + B[0]) / 2 : (M[0] + B[0]) / 2) - 30} y={papillon ? (A[1] + B[1]) / 2 - 8 : (M[1] + B[1]) / 2} texte={c.AB ? (papillon ? c.AB : `${nA}${nB} = ${c.AB}`) : null} />
      <Cote x={(A[0] + N[0]) / 2 + (papillon ? -28 : 26)} y={(A[1] + N[1]) / 2 - 8} texte={c.AN} />
      <Cote x={(papillon ? (A[0] + C[0]) / 2 : (N[0] + C[0]) / 2) + 24} y={(papillon ? (A[1] + C[1]) / 2 : (N[1] + C[1]) / 2) - 8} texte={c.AC ? (papillon ? c.AC : `${nA}${nC} = ${c.AC}`) : null} />
      <Cote x={(M[0] + N[0]) / 2} y={(M[1] + N[1]) / 2 + (papillon ? -16 : 16)} texte={c.MN} />
      <Cote x={(B[0] + C[0]) / 2} y={B[1] + 14} texte={c.BC} />
    </g>
  );
}

// ---------------------------------------------------------------- les courbes
function Courbe({
  fenetre, fonctions = [], points = [], tangente, aire, suite, nuage, droite, verticales = [], horizontales = [], nomsDeLaSuite,
}) {
  const {
    xmin, xmax, ymin, ymax,
  } = fenetre;
  // TOUT CE QUI SE TRACE RESTE DANS LE REPÈRE : courbes, tangentes et droites
  // sont coupées au cadre (09/10/2026 — elles débordaient dans les marges).
  const decoupe = `visuel-repere-${useId().replace(/:/g, '')}`;
  const m = 26;
  const X = (x) => m + ((x - xmin) / (xmax - xmin)) * (L - 2 * m);
  const Y = (y) => H - m - ((y - ymin) / (ymax - ymin)) * (H - 2 * m);
  const dedans = (y) => Number.isFinite(y) && y >= ymin - (ymax - ymin) && y <= ymax + (ymax - ymin);

  const chemin = (f) => {
    let d = '';
    let leve = true;
    for (let i = 0; i <= 160; i += 1) {
      const x = xmin + ((xmax - xmin) * i) / 160;
      const y = valeur(f, x);
      if (!dedans(y)) { leve = true; continue; }
      d += `${leve ? 'M' : 'L'}${X(x).toFixed(1)} ${Y(y).toFixed(1)} `;
      leve = false;
    }
    return d;
  };

  const pasX = xmax - xmin <= 12 ? 1 : Math.ceil((xmax - xmin) / 10);
  const pasY = ymax - ymin <= 12 ? 1 : Math.ceil((ymax - ymin) / 10);
  const graduations = [];
  for (let x = Math.ceil(xmin / pasX) * pasX; x <= xmax; x += pasX) graduations.push(['x', x]);
  for (let y = Math.ceil(ymin / pasY) * pasY; y <= ymax; y += pasY) graduations.push(['y', y]);
  const x0 = Math.min(Math.max(0, xmin), xmax);
  const y0 = Math.min(Math.max(0, ymin), ymax);

  let surface = null;
  if (aire && fonctions[aire.fonction ?? 0]) {
    const f = fonctions[aire.fonction ?? 0];
    let d = `M${X(aire.a)} ${Y(y0)}`;
    for (let i = 0; i <= 60; i += 1) {
      const x = aire.a + ((aire.b - aire.a) * i) / 60;
      const y = valeur(f, x);
      if (Number.isFinite(y)) d += ` L${X(x).toFixed(1)} ${Y(Math.max(ymin, Math.min(ymax, y))).toFixed(1)}`;
    }
    d += ` L${X(aire.b)} ${Y(y0)} Z`;
    surface = d;
  }

  return (
    <g className="visuel__courbes">
      {graduations.map(([axe, v]) => (axe === 'x'
        ? <line key={`x${v}`} className="visuel__grille" x1={X(v)} x2={X(v)} y1={m} y2={H - m} />
        : <line key={`y${v}`} className="visuel__grille" x1={m} x2={L - m} y1={Y(v)} y2={Y(v)} />))}
      <line className="visuel__axe" x1={m - 6} x2={L - m + 8} y1={Y(y0)} y2={Y(y0)} />
      <line className="visuel__axe" x1={X(x0)} x2={X(x0)} y1={H - m + 6} y2={m - 8} />
      {graduations.filter(([, v]) => v !== 0).map(([axe, v]) => (axe === 'x'
        ? <text key={`tx${v}`} className="visuel__graduation" x={X(v)} y={Y(y0) + 13} textAnchor="middle">{v}</text>
        : <text key={`ty${v}`} className="visuel__graduation" x={X(x0) - 5} y={Y(v) + 4} textAnchor="end">{v}</text>))}
      <defs>
        <clipPath id={decoupe}>
          <rect x={m} y={m - 4} width={L - 2 * m} height={H - 2 * m + 8} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${decoupe})`}>
        {surface && <path className="visuel__aire" d={surface} />}
        {verticales.map((v, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <line key={`v${i}`} className="visuel__repere-ligne" x1={X(v.x)} x2={X(v.x)} y1={m} y2={H - m} />
        ))}
        {horizontales.map((h, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <line key={`h${i}`} className="visuel__repere-ligne" x1={m} x2={L - m} y1={Y(h.y)} y2={Y(h.y)} />
        ))}
        {fonctions.map((f, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <path key={i} className={`visuel__trait visuel__courbe est-${i % 3}`} d={chemin(f)} pathLength={1} />
        ))}
        {tangente && (
          <path
            className="visuel__trait visuel__tangente"
            d={`M${X(xmin)} ${Y(tangente.y + tangente.pente * (xmin - tangente.x))} L${X(xmax)} ${Y(tangente.y + tangente.pente * (xmax - tangente.x))}`}
            pathLength={1}
          />
        )}
        {droite && (
          <path className="visuel__trait visuel__tangente" d={`M${X(xmin)} ${Y(droite.a * xmin + droite.b)} L${X(xmax)} ${Y(droite.a * xmax + droite.b)}`} pathLength={1} />
        )}
      </g>
      {/* L'étiquette d'une courbe : au dernier endroit de la fenêtre où elle est définie et visible. */}
      {fonctions.map((f, i) => {
        if (!f.etiquette) return null;
        for (let k = 0; k <= 40; k += 1) {
          const x = xmax - ((xmax - xmin) * (0.04 + k * 0.02));
          const y = valeur(f, x);
          if (Number.isFinite(y) && y >= ymin && y <= ymax) {
            // eslint-disable-next-line react/no-array-index-key
            return <text key={`e${i}`} className="visuel__nom" x={X(x)} y={Y(y) - 8} textAnchor="end">{f.etiquette}</text>;
          }
        }
        return null;
      })}
      {verticales.filter((v) => v.etiquette).map((v, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <text key={`ve${i}`} className="visuel__nom" x={X(v.x) + 4} y={m + 10}>{v.etiquette}</text>
      ))}
      {horizontales.filter((h) => h.etiquette).map((h, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <text key={`he${i}`} className="visuel__nom" x={L - m - 4} y={Y(h.y) - 5} textAnchor="end">{h.etiquette}</text>
      ))}
      {droite?.etiquette && <text className="visuel__nom" x={L - m - 4} y={Y(droite.a * xmax + droite.b) - 8} textAnchor="end">{droite.etiquette}</text>}
      {(suite ?? []).map((u, n) => (
        // eslint-disable-next-line react/no-array-index-key
        <g key={n}>
          <circle className="visuel__terme" cx={X(n)} cy={Y(u)} r={4.5} style={{ animationDelay: `${0.3 + n * 0.12}s` }} />
          {nomsDeLaSuite && <text className="visuel__nom visuel__marque" x={X(n) + 6} y={Y(u) - 8} style={{ animationDelay: `${0.3 + n * 0.12}s` }}>{`u${String(n).split('').map((ch) => '₀₁₂₃₄₅₆₇₈₉'[Number(ch)]).join('')}`}</text>}
        </g>
      ))}
      {(nuage ?? []).map(([x, y], i) => (
        // eslint-disable-next-line react/no-array-index-key
        <circle key={i} className="visuel__terme" cx={X(x)} cy={Y(y)} r={4} style={{ animationDelay: `${0.2 + i * 0.05}s` }} />
      ))}
      {points.map((p, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <g key={i} className="visuel__marque" style={{ animationDelay: `${1 + i * 0.15}s` }}>
          <circle cx={X(p.x)} cy={Y(p.y)} r={5} className="visuel__point" />
          {/* Près du bord droit, l'étiquette passe à gauche du point : elle n'est jamais coupée. */}
          {p.etiquette && (X(p.x) > L - m - 60
            ? <text className="visuel__nom" x={X(p.x) - 7} y={Y(p.y) - 7} textAnchor="end">{p.etiquette}</text>
            : <text className="visuel__nom" x={X(p.x) + 7} y={Y(p.y) - 7}>{p.etiquette}</text>)}
        </g>
      ))}
    </g>
  );
}

/** Le dessin d'une question, ou rien si elle n'en a pas. */
export default function Visuel({ visuel }) {
  if (!visuel) return null;
  return (
    <figure className={`visuel visuel--${visuel.type}`} aria-hidden="true">
      <svg viewBox={`0 0 ${L} ${H}`} className="visuel__svg">
        {visuel.type === 'solide' && <Solide {...visuel} />}
        {visuel.type === 'figure' && <Figure {...visuel} />}
        {visuel.type === 'courbe' && <Courbe {...visuel} />}
      </svg>
    </figure>
  );
}
