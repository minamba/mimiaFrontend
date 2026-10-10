import { perimetre } from '../../../../lib/jeux/airesCM1';
import { rangee, useDeroule } from './communs';
import './primaire-maths-a.css';

/**
 * L'AIRE DU JARDIN (CM1) ET L'AIRE DU RECTANGLE (CM2) — 09/10/2026. La
 * couverture du CM1 est un jardin : une pelouse de « 6 m sur 3 m » tracée en
 * pointillés, un chien couché qui tire la langue, des fleurs, un arrosoir ;
 * celle du CM2, une terrasse de pierre où brille un rectangle lumineux et sa
 * formule « A = L × l ». La scène :
 *   - AU CM1, LE JARDIN : la figure sur son quadrillage (le dessin d'origine,
 *     gardé tel quel) ou la parcelle de terre nue, ses côtés gradués ; autour,
 *     une haie, des fleurs qui se balancent, un papillon, le chien qui remue
 *     la queue ;
 *   - AU CM2, LA TERRASSE : le rectangle (ou la pièce en L) en traits de
 *     lumière, ses cotes écrites ;
 *   - LES RÉPONSES : des pancartes de jardin (au CM2, des dalles lumineuses)
 *     (`objets: 'sc-aires-cm1'`) ;
 *   - APRÈS LA RÉPONSE : le gazon se pose carreau par carreau, rang par rang,
 *     et le compte monte ; au CM2, chaque rang de carrés se remplit, puis la
 *     multiplication s'écrit. La clôture (le périmètre) est tracée à part :
 *     c'est le piège, on la voit pour ce qu'elle est.
 */

const CASE = 34;

/** Ce que dit la question : la sorte, et les côtés. */
export function lireAire(m) {
  const q = String(m?.question ?? '');
  let r = q.match(/^Un rectangle de (\d+) carreaux sur (\d+) carreaux\.$/);
  if (r) return { sorte: 'carreaux', a: Number(r[1]), b: Number(r[2]), u: 'carreaux' };
  r = q.match(/^Un rectangle de (\d+) (cm|m) sur (\d+) (?:cm|m)\.$/);
  if (r) return { sorte: 'mesure', a: Number(r[1]), b: Number(r[3]), u: r[2] };
  r = q.match(/^Un carré de (\d+) (cm|m) de côté\.$/);
  if (r) return { sorte: 'mesure', a: Number(r[1]), b: Number(r[1]), u: r[2] };
  r = q.match(/^Une pièce en L : un rectangle de (\d+) m sur (\d+) m, collé à un rectangle de (\d+) m sur (\d+) m\.$/);
  if (r) {
    return {
      sorte: 'L', a: Number(r[1]), b: Number(r[2]), c: Number(r[3]), d: Number(r[4]), u: 'm',
    };
  }
  return null;
}

const auCM2 = (m) => ['rectangle', 'carre', 'compose'].includes(m?.consigne) && !/carreaux/.test(String(m?.question ?? ''));

/** La figure en carreaux, sur un quadrillage un peu plus grand qu'elle (le dessin d'origine de l'écran). */
export function Quadrillage({ figure, numeros = 0, cloture = false }) {
  const l = figure.l + 2;
  const h = figure.h + 2;
  // Les carreaux se numérotent rang par rang, de gauche à droite.
  const ordre = [...figure.cases].sort(([x1, y1], [x2, y2]) => (y1 - y2) || (x1 - x2));
  const rang = new Map(ordre.map(([x, y], i) => [`${x}.${y}`, i + 1]));
  const ici = new Set(figure.cases.map(([x, y]) => `${x}.${y}`));
  const bords = [];
  if (cloture) {
    figure.cases.forEach(([x, y]) => {
      const X = (x + 1) * CASE;
      const Y = (y + 1) * CASE;
      if (!ici.has(`${x}.${y - 1}`)) bords.push([X, Y, X + CASE, Y]);
      if (!ici.has(`${x}.${y + 1}`)) bords.push([X, Y + CASE, X + CASE, Y + CASE]);
      if (!ici.has(`${x - 1}.${y}`)) bords.push([X, Y, X, Y + CASE]);
      if (!ici.has(`${x + 1}.${y}`)) bords.push([X + CASE, Y, X + CASE, Y + CASE]);
    });
  }
  return (
    <svg className="aires__quadrillage sc-aires-cm1__quadrillage" viewBox={`0 0 ${l * CASE} ${h * CASE}`} role="img" aria-label="Une figure sur un quadrillage">
      {Array.from({ length: l + 1 }, (_, x) => (
        <line key={`x${x}`} x1={x * CASE} y1={0} x2={x * CASE} y2={h * CASE} className="aires__trait" />
      ))}
      {Array.from({ length: h + 1 }, (_, y) => (
        <line key={`y${y}`} x1={0} y1={y * CASE} x2={l * CASE} y2={y * CASE} className="aires__trait" />
      ))}
      {figure.cases.map(([x, y]) => {
        const k = rang.get(`${x}.${y}`);
        const pose = numeros >= k;
        return (
          <g key={`${x}.${y}`} className={pose ? 'sc-aires-cm1__gazon' : undefined}>
            <rect x={(x + 1) * CASE} y={(y + 1) * CASE} width={CASE} height={CASE} className="aires__case" />
            {pose && <text x={(x + 1.5) * CASE} y={(y + 1.5) * CASE} className="sc-aires-cm1__numero">{k}</text>}
          </g>
        );
      })}
      {bords.map(([x1, y1, x2, y2]) => <line key={`${x1}.${y1}.${x2}.${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} className="sc-aires-cm1__cloture" />)}
    </svg>
  );
}

/** Le chien du jardin : couché, il remue la queue et tire la langue. */
function Chien() {
  return (
    <svg className="sc-aires-cm1__chien" viewBox="0 0 110 70" aria-hidden="true" focusable="false">
      <path className="sc-aires-cm1__queue" d="M86 44 q16 -6 18 -22" fill="none" stroke="#d9a05b" strokeWidth="7" strokeLinecap="round" />
      <ellipse cx="62" cy="50" rx="32" ry="15" fill="#f2d3a8" stroke="#a5703a" strokeWidth="2" />
      <ellipse cx="70" cy="46" rx="14" ry="9" fill="#d9a05b" />
      <ellipse cx="44" cy="62" rx="10" ry="5" fill="#f2d3a8" stroke="#a5703a" strokeWidth="2" />
      <ellipse cx="80" cy="62" rx="10" ry="5" fill="#f2d3a8" stroke="#a5703a" strokeWidth="2" />
      <g className="sc-aires-cm1__tete">
        <circle cx="28" cy="34" r="20" fill="#f2d3a8" stroke="#a5703a" strokeWidth="2" />
        <path d="M12 22 q-10 10 -2 26 q8 -6 10 -18 Z" fill="#c4823f" />
        <path d="M42 18 q10 6 6 22 q-8 -4 -10 -16 Z" fill="#c4823f" />
        <g className="sc-aires-cm1__yeux">
          <circle cx="22" cy="32" r="3" fill="#1b1d3a" />
          <circle cx="34" cy="32" r="3" fill="#1b1d3a" />
        </g>
        <ellipse cx="28" cy="40" rx="4" ry="3" fill="#3b2a1a" />
        <path className="sc-aires-cm1__langue" d="M26 45 q2 10 6 0 Z" fill="#ff7b9c" />
      </g>
    </svg>
  );
}

/** Une fleur qui se balance. */
function Fleur({ couleur, n }) {
  return (
    <svg className="sc-aires-cm1__fleur" viewBox="0 0 30 50" style={{ '--n': n }} aria-hidden="true" focusable="false">
      <path d="M15 50 V22" stroke="#3f8f3a" strokeWidth="3" />
      <path d="M15 38 q-10 -2 -10 -10 q8 2 10 10" fill="#5cb85c" />
      {rangee(5).map((i) => <circle key={i} cx={15 + 7 * Math.cos((i * 2 * Math.PI) / 5)} cy={14 + 7 * Math.sin((i * 2 * Math.PI) / 5)} r="6" fill={couleur} />)}
      <circle cx="15" cy="14" r="4.5" fill="#ffd43b" />
    </svg>
  );
}

/** Le papillon qui volette au-dessus du jardin. */
function Papillon() {
  return (
    <svg className="sc-aires-cm1__papillon" viewBox="0 0 40 30" aria-hidden="true" focusable="false">
      <g className="sc-aires-cm1__ailes">
        <path d="M20 15 q-18 -20 -18 0 q0 14 18 0 Z" fill="#ff8fab" stroke="#c9184a" strokeWidth="1.2" />
        <path d="M20 15 q18 -20 18 0 q0 14 -18 0 Z" fill="#ffb3c6" stroke="#c9184a" strokeWidth="1.2" />
      </g>
      <ellipse cx="20" cy="15" rx="2" ry="8" fill="#3b2a1a" />
    </svg>
  );
}

/** Le jardin autour du dessin : la haie, les fleurs, le chien, le papillon. */
function Jardin({ children, panneau }) {
  return (
    <div className="sc-aires-cm1 sc-aires-cm1--jardin">
      <Papillon />
      {panneau}
      <div className="sc-aires-cm1__pelouse">{children}</div>
      <div className="sc-aires-cm1__bordure" aria-hidden="true">
        <Fleur couleur="#ff6b9a" n={0} />
        <Fleur couleur="#ffffff" n={1} />
        <Fleur couleur="#b197fc" n={2} />
        <Chien />
        <Fleur couleur="#ffa94d" n={3} />
        <Fleur couleur="#ff6b9a" n={4} />
      </div>
    </div>
  );
}

/** La terrasse du CM2 : des dalles, des lueurs, la formule qui flotte. */
function Terrasse({ children, panneau }) {
  return (
    <div className="sc-aires-cm1 sc-aires-cm1--terrasse">
      {rangee(6).map((i) => <span key={i} className="sc-aires-cm1__lueur" style={{ '--n': i }} aria-hidden="true" />)}
      {panneau}
      <div className="sc-aires-cm1__dalle">{children}</div>
    </div>
  );
}

/** La pancarte (ou le panneau lumineux) où la question est écrite. */
const Pancarte = ({ texte }) => <p className="sc-aires-cm1__pancarte">{texte}</p>;

/** Un rectangle a × b dessiné en cases de `u` : vide, ou rempli rang par rang. */
function Parcelle({
  a, b, rangs = 0, unite, lumiere = false, decalage = [0, 0], teinte = 0,
}) {
  const [ox, oy] = decalage;
  return (
    <g className={`sc-aires-cm1__parcelle sc-aires-cm1__parcelle--${teinte}`}>
      <rect x={ox} y={oy} width={a * unite} height={b * unite} className={lumiere ? 'sc-aires-cm1__neon' : 'sc-aires-cm1__terre'} />
      {rangee(Math.min(rangs, b)).map((y) => rangee(a).map((x) => (
        <rect
          key={`${x}.${y}`}
          x={ox + x * unite + 1.5}
          y={oy + y * unite + 1.5}
          width={unite - 3}
          height={unite - 3}
          rx="3"
          className={lumiere ? 'sc-aires-cm1__carre-lumineux' : 'sc-aires-cm1__motte'}
          style={{ '--n': x }}
        />
      )))}
    </g>
  );
}

/** Les cotes d'un côté : un trait pointillé et sa longueur (`ancre` : où s'accroche le texte). */
function Cote({
  x1, y1, x2, y2, texte, dx = 0, dy = 0, ancre = 'middle',
}) {
  return (
    <g className="sc-aires-cm1__cote">
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      <text x={(x1 + x2) / 2 + dx} y={(y1 + y2) / 2 + dy} textAnchor={ancre}>{texte}</text>
    </g>
  );
}

/** Les graduations d'un côté : un trait par carreau (sans rien remplir). */
function Graduations({ a, b, unite }) {
  return (
    <g className="sc-aires-cm1__graduations">
      {rangee(a + 1).map((x) => <line key={`h${x}`} x1={x * unite} y1={-6} x2={x * unite} y2={6} />)}
      {rangee(b + 1).map((y) => <line key={`v${y}`} x1={-6} y1={y * unite} x2={6} y2={y * unite} />)}
    </g>
  );
}

/** La place que prend une cote écrite (taille de police 26 dans le dessin). */
const place = (texte) => Math.ceil(String(texte).length * 16) + 20;

/** Le dessin d'un rectangle (ou d'une pièce en L), avec ses cotes. */
function Plan({ lu, rangs = [0, 0], lumiere }) {
  const unite = 30;
  if (lu.sorte === 'L') {
    const largeur = lu.a * unite;
    const hauteur = (lu.b + lu.d) * unite;
    const droite = place(`${lu.b} m`);
    return (
      <svg className="sc-aires-cm1__plan" viewBox={`-16 -48 ${largeur + droite + 26} ${hauteur + 100}`} aria-hidden="true" focusable="false">
        <Parcelle a={lu.a} b={lu.b} unite={unite} rangs={rangs[0]} lumiere={lumiere} teinte={0} />
        <Parcelle a={lu.c} b={lu.d} unite={unite} rangs={rangs[1]} lumiere={lumiere} decalage={[0, lu.b * unite]} teinte={1} />
        <Cote x1={0} y1={-14} x2={largeur} y2={-14} texte={`${lu.a} m`} dy={-10} />
        <Cote x1={largeur + 12} y1={0} x2={largeur + 12} y2={lu.b * unite} texte={`${lu.b} m`} dx={10} dy={9} ancre="start" />
        <Cote x1={0} y1={hauteur + 14} x2={lu.c * unite} y2={hauteur + 14} texte={`${lu.c} m`} dy={32} />
        <Cote x1={lu.c * unite + 12} y1={lu.b * unite} x2={lu.c * unite + 12} y2={hauteur} texte={`${lu.d} m`} dx={10} dy={9} ancre="start" />
      </svg>
    );
  }
  const largeur = lu.a * unite;
  const hauteur = lu.b * unite;
  const nom = (x) => (lu.sorte === 'carreaux' ? String(x) : `${x} ${lu.u}`);
  const gauche = place(nom(lu.b)) + 14;
  return (
    <svg className="sc-aires-cm1__plan" viewBox={`${-gauche} -52 ${largeur + gauche + 16} ${hauteur + 68}`} aria-hidden="true" focusable="false">
      <Parcelle a={lu.a} b={lu.b} unite={unite} rangs={rangs[0]} lumiere={lumiere} />
      {lu.sorte === 'carreaux' && rangs[0] === 0 && <Graduations a={lu.a} b={lu.b} unite={unite} />}
      <Cote x1={0} y1={-16} x2={largeur} y2={-16} texte={nom(lu.a)} dy={-10} />
      <Cote x1={-16} y1={0} x2={-16} y2={hauteur} texte={nom(lu.b)} dx={-10} dy={9} ancre="end" />
    </svg>
  );
}

/** LA QUESTION : le jardin (CM1) ou la terrasse lumineuse (CM2). */
export function QuestionAires({ m, termine }) {
  if (termine) return <ApresAires m={m} />;
  if (m.figure) {
    return (
      <Jardin>
        <Quadrillage figure={m.figure} />
      </Jardin>
    );
  }
  const lu = lireAire(m);
  if (auCM2(m)) {
    return (
      <Terrasse panneau={<Pancarte texte={m.question} />}>
        {lu && <Plan lu={lu} lumiere />}
      </Terrasse>
    );
  }
  return (
    <Jardin panneau={<Pancarte texte={m.question} />}>
      {lu && <Plan lu={lu} />}
    </Jardin>
  );
}

/** Après la réponse, au quadrillage : le gazon se pose carreau par carreau, la clôture à part. */
function ApresQuadrillage({ m }) {
  const { figure } = m;
  const aire = figure.cases.length;
  const lignes = new Set(figure.cases.map(([, y]) => y)).size;
  const pas = useDeroule(lignes + 1, 800, 400);
  // Le nombre de carreaux posés après `pas` rangs.
  const ordre = [...figure.cases].sort(([x1, y1], [x2, y2]) => (y1 - y2) || (x1 - x2));
  const ys = [...new Set(ordre.map(([, y]) => y))];
  const poses = pas >= lignes ? aire : ordre.filter(([, y]) => ys.indexOf(y) < pas).length;
  return (
    <Jardin>
      <Quadrillage figure={figure} numeros={poses} cloture={pas > lignes} />
      <p className="sc-aires-cm1__compte">
        {pas > lignes
          ? `L’aire : ${aire} carreaux de gazon. La clôture marron, c’est le tour : ${perimetre(figure.cases)}.`
          : `${poses} carreau${poses > 1 ? 'x' : ''} de gazon…`}
      </p>
    </Jardin>
  );
}

/** Après la réponse, au rectangle : un rang, autant de fois qu'il y a de rangs. */
function ApresRectangle({ m, lu }) {
  const cm2 = lu.sorte !== 'carreaux';
  const total = lu.sorte === 'L' ? lu.b + lu.d + 1 : lu.b + 1;
  const pas = useDeroule(total, lu.sorte === 'L' ? 550 : 700, 400);
  const fini = pas >= total;
  let compte;
  let rangs;
  if (lu.sorte === 'L') {
    const r1 = Math.min(pas, lu.b);
    const r2 = Math.max(0, Math.min(pas - lu.b, lu.d));
    rangs = [r1, r2];
    const a1 = lu.a * lu.b;
    const a2 = lu.c * lu.d;
    compte = fini
      ? `${lu.a} × ${lu.b} = ${a1} m², puis ${lu.c} × ${lu.d} = ${a2} m² : en tout ${a1 + a2} m².`
      : r2 > 0 ? `${a1} m², et ${lu.c} × ${r2} = ${lu.c * r2} m²…` : `${lu.a} × ${r1} = ${lu.a * r1} m²…`;
  } else {
    const r = Math.min(pas, lu.b);
    rangs = [r, 0];
    const unite = cm2 ? `${lu.u}²` : 'carreaux';
    compte = fini ? `${lu.a} × ${lu.b} = ${lu.a * lu.b} ${unite}` : `${r} rang${r > 1 ? 's' : ''} de ${lu.a} : ${lu.a * r} ${unite}…`;
  }
  const dessin = <Plan lu={lu} rangs={rangs} lumiere={cm2} />;
  const legende = <p className={`sc-aires-cm1__compte${fini ? ' est-fini' : ''}`}>{compte}</p>;
  return cm2 ? (
    <Terrasse panneau={<Pancarte texte={m.question} />}>
      {dessin}
      {legende}
    </Terrasse>
  ) : (
    <Jardin panneau={<Pancarte texte={m.question} />}>
      {dessin}
      {legende}
    </Jardin>
  );
}

/** APRÈS LA RÉPONSE : le gazon qui se pose, ou les rangs de carrés qui se remplissent. */
export function ApresAires({ m }) {
  if (m.figure) return <ApresQuadrillage m={m} />;
  const lu = lireAire(m);
  if (lu) return <ApresRectangle m={m} lu={lu} />;
  return auCM2(m)
    ? <Terrasse panneau={<Pancarte texte={m.question} />} />
    : <Jardin panneau={<Pancarte texte={m.question} />} />;
}
