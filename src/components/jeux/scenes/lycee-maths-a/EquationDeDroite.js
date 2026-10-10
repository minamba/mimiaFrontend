import {
  Repere, Reponses, Texte, ecrire, fenetreAutour, nombre, pointsNommes, sur,
} from './commun';

/**
 * LE FUNICULAIRE DE L'ÉQUATION DE DROITE (09/10/2026). La couverture : une
 * ville au bord de la mer, une gare en brique, un funiculaire qui grimpe la
 * colline tout droit. Une droite, c'est un rail : une pente, un point de départ.
 *   - LA QUESTION est sur le panneau de la gare ; à côté, la colline où la
 *     cabine monte et descend son rail ;
 *   - LES RÉPONSES sont des cabines suspendues à un câble, qui glissent
 *     doucement : on monte dans la bonne (`choix`) ;
 *   - APRÈS LA RÉPONSE, le repère se dessine : les points de l'énoncé, le rail
 *     de la bonne droite, la cabine qui le parcourt, et le triangle de la
 *     pente (« de 3 vers la droite, de 8 vers le haut »). Deux équations : deux
 *     rails, et la gare au croisement.
 */

const P = 'sc-equation-de-droite';

/** « y = −4x + 5 », « y = x − 5 », « y = 3 » → { a, b }, ou null. */
export function droiteReduite(texte) {
  const r = String(texte).replace(/\s/g, '').replace(/−/g, '-').match(/^y=(?:(-?\d*(?:\/\d+)?)x)?([+-]\d+(?:\/\d+)?)?$/);
  if (!r || (r[1] === undefined && r[2] === undefined)) return null;
  let a = 0;
  if (r[1] !== undefined) a = r[1] === '' ? 1 : r[1] === '-' ? -1 : nombre(r[1]); // eslint-disable-line no-nested-ternary
  const b = r[2] === undefined ? 0 : nombre(r[2]);
  return Number.isFinite(a) && Number.isFinite(b) ? { a, b } : null;
}

/** « 3x − 2y = −4 » → { a: 3, b: −2, c: −4 }, ou null. */
export function equationLineaire(texte) {
  const r = String(texte).replace(/\s/g, '').replace(/−/g, '-').match(/^(-?\d*)x([+-]\d*)y=(-?\d+)$/);
  if (!r) return null;
  const coef = (s) => {
    if (s === '' || s === '+') return 1;
    if (s === '-') return -1;
    return Number(s);
  };
  return { a: coef(r[1]), b: coef(r[2]), c: Number(r[3]) };
}

/** Ce que le repère montre après la réponse : points, rails, triangle de pente. */
export function planDe(m) {
  const q = String(m.question);
  const pts = pointsNommes(q);
  const rails = [];
  const points = Object.entries(pts).map(([nom, [x, y]]) => ({ nom, x, y }));
  let triangle = null;
  if (m.consigne === 'coefficient-directeur' || m.consigne === 'equation-reduite') {
    const { A, B } = pts;
    if (!A || !B || A[0] === B[0]) return null;
    const a = (B[1] - A[1]) / (B[0] - A[0]);
    rails.push({ a, b: A[1] - a * A[0] });
    triangle = { x1: A[0], y1: A[1], x2: B[0], y2: B[1] };
  } else if (m.consigne === 'paralleles') {
    const d = droiteReduite(q.split('\n')[0].replace(/^\(d\)\s*:\s*/, ''));
    const bonne = droiteReduite(m.bonne);
    if (!d || !bonne) return null;
    rails.push({ ...d, nom: '(d)', fantome: true }, { ...bonne, nom: m.bonne });
  } else if (m.consigne === 'ordonnee-origine') {
    const r = q.match(/coefficient directeur ([−-]?\d+(?:\/\d+)?)/);
    const b = nombre(m.bonne);
    if (!r || !Number.isFinite(b)) return null;
    rails.push({ a: nombre(r[1]), b });
    points.push({ nom: `(0 ; ${ecrire(b)})`, x: 0, y: b, origine: true });
  } else if (m.consigne === 'systeme') {
    const [l1, l2] = q.split('\n').map(equationLineaire);
    const s = String(m.bonne).match(/\(([−-]?\d+(?:,\d+)?) ; ([−-]?\d+(?:,\d+)?)\)/);
    if (!l1 || !l2 || !s || l1.b === 0 || l2.b === 0) return null;
    [l1, l2].forEach((l) => rails.push({ a: -l.a / l.b, b: l.c / l.b }));
    points.push({ nom: m.bonne, x: nombre(s[1]), y: nombre(s[2]), origine: true });
  } else {
    return null;
  }
  const fenetre = fenetreAutour(points.map((p) => [p.x, p.y]), 2);
  return {
    fenetre, rails, points, triangle,
  };
}

/** La colline du funiculaire : le rail tout droit, la cabine qui monte et descend. */
function Colline() {
  return (
    <svg className={`${P}__colline`} viewBox="0 0 160 120" aria-hidden="true" focusable="false">
      <path d="M0 120 L0 70 Q40 40 80 34 Q120 26 160 10 L160 120 Z" className={`${P}__herbe`} />
      <rect x="118" y="6" width="34" height="22" rx="3" className={`${P}__gare`} />
      <path d="M114 8 L135 -4 L156 8 Z" className={`${P}__toit`} />
      <line x1="18" y1="112" x2="128" y2="30" className={`${P}__rail`} />
      <line x1="24" y1="116" x2="134" y2="34" className={`${P}__rail`} />
      <g className={`${P}__cabine-colline`}>
        <rect x="18" y="98" width="22" height="16" rx="3" transform="rotate(-36 29 106)" />
      </g>
      <circle cx="30" cy="70" r="5" className={`${P}__cypres`} />
      <circle cx="56" cy="56" r="4" className={`${P}__cypres`} />
    </svg>
  );
}

function RepereEnMarche({ plan }) {
  const {
    fenetre, rails, points, triangle,
  } = plan;
  const { xmin, xmax } = fenetre;
  return (
    <Repere fenetre={fenetre} prefixe={P} largeur={320} hauteur={220}>
      {(X, Y) => {
        const principal = rails.find((r) => !r.fantome) ?? rails[0];
        const depart = [X(xmin), Y(principal.a * xmin + principal.b)];
        const arrivee = [X(xmax), Y(principal.a * xmax + principal.b)];
        return (
          <>
            <defs>
              <clipPath id={`${P}-cadre`}>
                <rect x="18" y="14" width="284" height="192" />
              </clipPath>
            </defs>
            <g clipPath={`url(#${P}-cadre)`}>
              {rails.map((r, i) => (
                <line
                  // eslint-disable-next-line react/no-array-index-key
                  key={i}
                  className={`${P}__voie${r.fantome ? ' est-fantome' : ''}${i === 1 && !r.fantome ? ' est-seconde' : ''}`}
                  x1={X(xmin)}
                  y1={Y(r.a * xmin + r.b)}
                  x2={X(xmax)}
                  y2={Y(r.a * xmax + r.b)}
                  pathLength="1"
                  style={{ animationDelay: `${i * 0.6}s` }}
                />
              ))}
              {triangle && (
                <g className={`${P}__pente`}>
                  <path d={`M${X(triangle.x1)} ${Y(triangle.y1)} H${X(triangle.x2)} V${Y(triangle.y2)}`} />
                  <text x={(X(triangle.x1) + X(triangle.x2)) / 2} y={Y(triangle.y1) + (triangle.y2 > triangle.y1 ? 16 : -8)} textAnchor="middle">{`→ ${ecrire(triangle.x2 - triangle.x1)}`}</text>
                  <text x={X(triangle.x2) + 6} y={(Y(triangle.y1) + Y(triangle.y2)) / 2} textAnchor="start">{`${triangle.y2 >= triangle.y1 ? '↑' : '↓'} ${ecrire(Math.abs(triangle.y2 - triangle.y1))}`}</text>
                </g>
              )}
              <g
                className={`${P}__cabine-rail`}
                style={{ '--x0': `${depart[0]}px`, '--y0': `${depart[1]}px`, '--x1': `${arrivee[0]}px`, '--y1': `${arrivee[1]}px` }}
              >
                <rect x="-9" y="-7" width="18" height="12" rx="3" />
                <rect x="-6" y="-5" width="5" height="4" className={`${P}__vitre`} />
                <rect x="1" y="-5" width="5" height="4" className={`${P}__vitre`} />
              </g>
            </g>
            {points.map((p) => (
              <g key={p.nom} className={`${P}__point${p.origine ? ' est-gare' : ''}`}>
                <circle cx={X(p.x)} cy={Y(p.y)} r={p.origine ? 6 : 4.5} />
                <text x={X(p.x) + 8} y={Y(p.y) - 8}>{p.nom}</text>
              </g>
            ))}
          </>
        );
      }}
    </Repere>
  );
}

export function QuestionEquationDeDroite({ m, termine }) {
  const plan = termine ? sur(() => planDe(m)) : null;
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <div className={`${P}__gare-scene`}>
        {!plan && <Colline />}
        <div className={`${P}__panneau`}>
          <span className={`${P}__enseigne`} aria-hidden="true">Funiculaire</span>
          <Texte m={m} classe={`${P}__texte`} />
        </div>
        {plan && <div className={`${P}__carte`}><RepereEnMarche plan={plan} /></div>}
      </div>
    </div>
  );
}

/** Les cabines suspendues au câble : on monte dans la bonne. */
export function CabinesEquation({ choix, fautes, choisir }) {
  return (
    <div className={`${P}__telepherique`}>
      <span className={`${P}__cable`} aria-hidden="true" />
      <Reponses
        choix={choix}
        fautes={fautes}
        choisir={choisir}
        prefixe={P}
        etiquette="Monte dans la bonne cabine"
        decor={() => <span className={`${P}__suspente`} aria-hidden="true" />}
      />
    </div>
  );
}
