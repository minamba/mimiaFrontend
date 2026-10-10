import {
  ecrireFr, fenetreValide, nombreFr, nombresDans, proche, repere, TexteQuestion,
} from './outils';

/**
 * LA TERRASSE DES ÉTOILES — « Ajuster un nuage de points » (voie pro). La
 * couverture : une jeune fille sur une terrasse de marbre au-dessus des
 * nuages ; des points de lumière flottent, s'assemblent en sphères, et des
 * traînées bleues les relient. Un nuage de points, ce sont ces lumières ; la
 * droite d'ajustement, la traînée qui passe au plus près. La scène la reprend :
 *   - LA QUESTION : gravée sur une tablette de marbre bordée de bleu ; à côté,
 *     la constellation qui scintille et une traînée qui la traverse ;
 *   - LES RÉPONSES : des sphères de lumière (`objets`) ;
 *   - APRÈS LA RÉPONSE : le point moyen G qui se forme au centre des
 *     relevés, la droite qui passe par lui, la lecture d'une prévision (on
 *     monte de x jusqu'à la droite, on lit y), un seuil lu à l'envers, et la
 *     zone des relevés où l'on peut se fier à la droite — au-delà, le brouillard.
 */

const P = 'sc-ajuster-un-nuage';

/* ---------------------------------------------------------------- le décor */

const ETOILES = [[30, 112], [58, 96], [82, 100], [108, 78], [136, 70], [160, 58], [188, 52], [212, 34]];

function Constellation() {
  return (
    <svg className={`${P}__ciel`} viewBox="0 0 240 150" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="sc-nua-orbe" cx="0.4" cy="0.35" r="0.65">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#9fd4ff" />
          <stop offset="1" stopColor="#2f6fc0" />
        </radialGradient>
        <linearGradient id="sc-nua-ciel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d3f8c" />
          <stop offset="1" stopColor="#6fb4f0" />
        </linearGradient>
      </defs>
      <rect width="240" height="150" rx="16" fill="url(#sc-nua-ciel)" />
      <path d="M0 132 Q60 120 120 128 T240 124 V150 H0 Z" fill="#eaf2fb" />
      <path d="M0 136 H240" stroke="#c9d6e6" strokeWidth="2" />
      <line x1="16" y1="118" x2="226" y2="34" className={`${P}__trainee`} />
      {ETOILES.map(([x, y], i) => (
        <circle key={x} cx={x} cy={y} r="3.5" className={`${P}__etoile`} style={{ '--n': i }} />
      ))}
      <g className={`${P}__orbe`}>
        <rect x="190" y="104" width="22" height="30" rx="3" fill="#dfe8f2" stroke="#9fb3c8" />
        <circle cx="201" cy="94" r="12" fill="url(#sc-nua-orbe)" />
      </g>
    </svg>
  );
}

/* --------------------------------------------------------- la lecture */

const moyenne = (l) => l.reduce((s, v) => s + v, 0) / l.length;

/** « y = 2,4x + 31 », « y = −1,5x + 80 », « y = x − 3 » → { a, b }, ou null. */
export function lireDroite(texte) {
  const lu = String(texte).match(/y = (−?[\d,]*)x(?: ([+−]) ([\d,]+))?/);
  if (!lu) return null;
  let a = 1;
  if (lu[1] === '−') a = -1;
  else if (lu[1] !== '') a = nombreFr(lu[1]);
  const b = lu[2] ? (lu[2] === '−' ? -1 : 1) * nombreFr(lu[3]) : 0;
  return a === null || b === null ? null : { a, b };
}

/** Le dessin : le nuage, la droite, et ce qu'on lit (G, une lecture de x vers y ou de y vers x). */
function Ciel({
  visuel, nuage = visuel?.nuage, droite = visuel?.droite, G = null, lecture = null, zone = null,
}) {
  const fenetre = fenetreValide(visuel);
  if (!fenetre) return null;
  const R = repere(fenetre, 300, 160);
  const { X, Y } = R;
  return (
    <svg className={`${P}__lecture`} viewBox="0 0 300 160" aria-hidden="true" focusable="false">
      <rect width="300" height="160" rx="12" className={`${P}__fond`} />
      {zone && <rect x={X(zone[0])} y="0" width={X(zone[1]) - X(zone[0])} height="160" className={`${P}__zone`} />}
      {droite && (
        <line x1={X(fenetre.xmin)} y1={Y(droite.a * fenetre.xmin + droite.b)} x2={X(fenetre.xmax)} y2={Y(droite.a * fenetre.xmax + droite.b)} className={`${P}__droite`} pathLength="1" />
      )}
      {(nuage ?? []).map(([x, y], i) => (
        <g key={`${x}-${y}`}>
          {G && <line x1={X(x)} y1={Y(y)} x2={X(G[0])} y2={Y(G[1])} className={`${P}__fil`} style={{ '--n': i }} />}
          <circle cx={X(x)} cy={Y(y)} r="4.5" className={`${P}__releve`} style={{ '--n': i }} />
        </g>
      ))}
      {G && <circle cx={X(G[0])} cy={Y(G[1])} r="8" className={`${P}__g`} />}
      {lecture && (
        <g className={`${P}__lu`}>
          <path
            d={lecture.sens === 'x'
              ? `M${X(lecture.x)} 160 V${Y(lecture.y)} H0`
              : `M0 ${Y(lecture.y)} H${X(lecture.x)} V160`}
            className={`${P}__pointilles`}
            pathLength="1"
          />
          <circle cx={X(lecture.x)} cy={Y(lecture.y)} r="7" className={`${P}__g`} />
        </g>
      )}
    </svg>
  );
}

/** La zone des relevés : une droite qui brille sur [1 ; n], puis se perd dans le brouillard. */
function Zone({ n, x }) {
  const max = Math.max(n * 2.2, Number.isFinite(x) ? x + 2 : 0, n + 4);
  const X = (v) => 14 + (v / max) * 272;
  return (
    <svg className={`${P}__lecture`} viewBox="0 0 300 110" aria-hidden="true" focusable="false">
      <rect width="300" height="110" rx="12" className={`${P}__fond`} />
      <rect x={X(1)} y="0" width={X(n) - X(1)} height="110" className={`${P}__zone`} />
      <rect x={X(n)} y="0" width={300 - X(n)} height="110" className={`${P}__brouillard`} />
      <line x1={X(1)} y1="90" x2={X(n)} y2="40" className={`${P}__droite`} pathLength="1" />
      <line x1={X(n)} y1="40" x2="300" y2={40 - (50 * (300 - X(n))) / (X(n) - X(1))} className={`${P}__droite est-incertaine`} />
      {Array.from({ length: n }, (_, i) => (
        <circle key={i} cx={X(i + 1)} cy={90 - (50 * i) / Math.max(n - 1, 1) + ((i * 37) % 9) - 4} r="4" className={`${P}__releve`} style={{ '--n': i }} />
      ))}
      {Number.isFinite(x) && <line x1={X(x)} y1="4" x2={X(x)} y2="106" className={`${P}__repere-x`} />}
      <text x={(X(1) + X(n)) / 2} y="104" textAnchor="middle" className={`${P}__legende`}>relevés : on interpole</text>
      <text x={Math.min(X(n) + 10, 210)} y="16" className={`${P}__legende`}>au-delà : on extrapole</text>
    </svg>
  );
}

/* --------------------------------------------------------- les explications */

function Explication({ m }) {
  const q = String(m.question);
  const v = m.visuel;
  let dessin = null;
  let texte = `La réponse : ${m.bonne}.`;
  switch (m.consigne) {
    case 'point-moyen': {
      const lignes = q.split('\n');
      const xs = nombresDans(lignes[1] ?? '');
      const ys = nombresDans((lignes[2] ?? '').replace(/^y :/, ''));
      if (xs.length && xs.length === ys.length) {
        const G = [moyenne(xs), moyenne(ys)];
        const [gx, gy] = nombresDans(m.bonne);
        if (proche(gx, G[0]) && proche(gy, G[1])) {
          dessin = <Ciel visuel={v} G={G} />;
          texte = `x̄ = (${xs.join(' + ')}) ÷ ${xs.length} = ${ecrireFr(G[0])} ; ȳ = (${ys.map((y) => ecrireFr(y)).join(' + ')}) ÷ ${ys.length} = ${ecrireFr(G[1])}. Le point moyen est ${m.bonne}.`;
        }
      }
      break;
    }
    case 'coefficient': {
      const [xg, yg, xp, yp] = nombresDans(q.split('point moyen')[1] ?? '');
      if ([xg, yg, xp, yp].every(Number.isFinite)) {
        dessin = <Ciel visuel={v} nuage={[]} G={[xg, yg]} lecture={{ x: xp, y: yp, sens: 'x' }} />;
        texte = `a = Δy ÷ Δx = (${ecrireFr(yp)} − ${ecrireFr(yg)}) ÷ (${ecrireFr(xp)} − ${ecrireFr(xg)}) = ${m.bonne}.`;
      }
      break;
    }
    case 'ordonnee': {
      const a = nombreFr(q.match(/y = (−?[\d,]+)x \+ b/)?.[1]);
      const [xg, yg] = nombresDans(q.split('point moyen')[1] ?? '');
      if (a !== null && Number.isFinite(xg) && Number.isFinite(yg)) {
        texte = `La droite passe par G : ${ecrireFr(yg)} = ${ecrireFr(a)} × ${ecrireFr(xg)} + b, donc b = ${ecrireFr(yg)} − (${ecrireFr(a * xg)}) = ${m.bonne}.`;
      }
      break;
    }
    case 'prevision': {
      const d = lireDroite(q);
      const debut = nombreFr(q.match(/x = 1 en (\d{4})/)?.[1]);
      const annee = nombreFr(q.match(/Prévision pour (\d{4})/)?.[1]);
      if (d && debut && annee) {
        const rang = annee - debut + 1;
        const y = d.a * rang + d.b;
        dessin = <Ciel visuel={v} lecture={{ x: rang, y, sens: 'x' }} />;
        texte = `${annee} est le rang x = ${annee} − ${debut} + 1 = ${rang} ; y = ${ecrireFr(d.a)} × ${rang} + ${ecrireFr(d.b)} = ${m.bonne}.`;
      }
      break;
    }
    case 'seuil': {
      const d = lireDroite(q);
      const y = nombreFr(q.match(/prévoit-on y = ([\d,]+)/)?.[1]);
      const x = nombreFr(m.bonne);
      if (d && y !== null && x !== null) {
        dessin = <Ciel visuel={v} lecture={{ x, y, sens: 'y' }} />;
        texte = `On résout ${ecrireFr(d.a)}x + ${ecrireFr(d.b)} = ${ecrireFr(y)} : x = (${ecrireFr(y)} − ${ecrireFr(d.b)}) ÷ ${ecrireFr(d.a)} = ${m.bonne}.`;
      }
      break;
    }
    case 'interpolation':
    case 'plus-fiable': {
      const n = nombreFr(q.match(/de 1 à (\d+)/)?.[1]);
      const x = m.consigne === 'interpolation' ? nombreFr(q.match(/pour x = ([\d,]+)/)?.[1]) : nombreFr(String(m.bonne).replace('x = ', ''));
      if (n) dessin = <Zone n={n} x={x} />;
      texte = 'Entre les relevés, on interpole : la droite est fiable. Au-delà, on extrapole : plus on s’éloigne, plus c’est fragile.';
      break;
    }
    case 'prevision-lointaine':
      dessin = <Zone n={6} x={NaN} />;
      texte = 'Loin des relevés, rien ne dit que la tendance continue : une prévision lointaine est très fragile, jamais exacte.';
      break;
    default:
      break;
  }
  return (
    <div className={`${P}__explication`}>
      {dessin}
      <p className={`${P}__regle`}>{texte}</p>
    </div>
  );
}

export function QuestionNuage({ m, termine }) {
  return (
    <div className={P}>
      {termine ? <Explication m={m} /> : <Constellation />}
      <div className={`${P}__tablette`}>
        <TexteQuestion m={m} classe={`${P}__texte`} />
      </div>
    </div>
  );
}
