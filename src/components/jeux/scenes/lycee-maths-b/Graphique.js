import {
  deriverPolynome, ecrireFr, ecrirePolynome, fenetreValide, lirePolynome, nombreFr, nombresDans,
  proche, repere, TexteQuestion, tracer, valeurSure,
} from './outils';

/**
 * LE BANC D'ESSAI DES RAILS — « Lire un graphique » (voie pro). La
 * couverture : une technicienne règle des rails bleus qui ondulent sur un
 * banc d'essai, dans un atelier clair au bord de la mer. Un rail qui monte et
 * descend, c'est une courbe qu'on lit. La scène la reprend :
 *   - LA QUESTION : sur le pupitre du banc d'essai ; à côté, le rail ondulé et
 *     son wagonnet qui le parcourt, monte, redescend ;
 *   - LES RÉPONSES : des gares le long du rail (`choix`) — un panneau par
 *     réponse, le wagonnet passe devant ;
 *   - APRÈS LA RÉPONSE : la lecture faite sur le dessin de la question — le
 *     point lu, avec ses pointillés jusqu'aux axes ; le morceau de courbe qui
 *     monte (ou descend) surligné ; le sommet marqué d'un fanion ; la pente
 *     de la tangente comptée en marches (Δy sur Δx) ; la dérivée terme à terme.
 */

const P = 'sc-lire-un-graphique';

/* ---------------------------------------------------------------- le décor */

const RAIL = 'M10 100 C50 100 60 40 100 40 S150 110 190 90 S230 50 250 50';

function Banc() {
  return (
    <svg className={`${P}__banc`} viewBox="0 0 260 150" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="sc-gra-ciel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bfe3ff" />
          <stop offset="1" stopColor="#eef7ff" />
        </linearGradient>
      </defs>
      <rect width="260" height="150" rx="16" fill="url(#sc-gra-ciel)" />
      <path d="M0 70 L40 56 L70 64 L110 50 L150 62 L200 52 L260 60 V78 H0 Z" fill="#7fb29a" opacity="0.6" />
      <rect y="74" width="260" height="10" fill="#7fc3e6" opacity="0.7" />
      <rect y="118" width="260" height="32" className={`${P}__etabli`} />
      {[30, 70, 110, 150, 190, 230].map((x) => <rect key={x} x={x - 4} y="80" width="8" height="40" rx="2" className={`${P}__pied`} />)}
      <path d={RAIL} className={`${P}__rail-ombre`} />
      <path d={RAIL} className={`${P}__rail`} />
      <g className={`${P}__wagonnet`} style={{ offsetPath: `path('${RAIL}')` }}>
        <rect x="-9" y="-12" width="18" height="10" rx="3" className={`${P}__caisse`} />
        <circle cx="-5" cy="-1" r="2.6" className={`${P}__roue`} />
        <circle cx="5" cy="-1" r="2.6" className={`${P}__roue`} />
      </g>
    </svg>
  );
}

/* --------------------------------------------------------- la lecture */

/**
 * Le dessin de la question, redessiné pour la lecture : la courbe (ou le
 * nuage), puis ce qu'on y lit — un point et ses pointillés, un morceau
 * surligné, un fanion.
 */
function Lecture({
  visuel, point = null, morceau = null, fanion = null, fanions = [], marche = null,
}) {
  const fenetre = fenetreValide(visuel);
  if (!fenetre) return null;
  const R = repere(fenetre, 300, 170);
  const { X, Y } = R;
  const f = visuel.fonctions?.[0];
  const morceaux = f?.forme === 'morceaux' ? f.points : null;
  const zeroX = Math.min(Math.max(0, fenetre.xmin), fenetre.xmax);
  const zeroY = Math.min(Math.max(0, fenetre.ymin), fenetre.ymax);
  let surligne = null;
  if (morceau && morceaux) {
    const pts = morceaux.filter(([x]) => x >= morceau[0] - 1e-9 && x <= morceau[1] + 1e-9);
    if (pts.length >= 2) surligne = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${X(x)} ${Y(y)}`).join(' ');
  }
  return (
    <svg className={`${P}__lecture`} viewBox="0 0 300 170" aria-hidden="true" focusable="false">
      <line x1="0" y1={Y(zeroY)} x2="300" y2={Y(zeroY)} className={`${P}__axe`} />
      <line x1={X(zeroX)} y1="0" x2={X(zeroX)} y2="170" className={`${P}__axe`} />
      {f && <path d={tracer(f, fenetre, R)} className={`${P}__courbe`} />}
      {(visuel.nuage ?? []).map(([x, y]) => <circle key={`${x}-${y}`} cx={X(x)} cy={Y(y)} r="4" className={`${P}__releve`} />)}
      {surligne && <path d={surligne} className={`${P}__surligne`} pathLength="1" />}
      {point && (
        <g className={`${P}__lu`}>
          <path d={`M${X(point[0])} ${Y(zeroY)} V${Y(point[1])} H${X(zeroX)}`} className={`${P}__pointilles`} pathLength="1" />
          <circle cx={X(point[0])} cy={Y(point[1])} r="7" className={`${P}__cible`} />
        </g>
      )}
      {[...(fanion ? [fanion] : []), ...fanions].map(([fx, fy]) => (
        <g key={`${fx}-${fy}`} className={`${P}__fanion`} transform={`translate(${X(fx)} ${Y(fy)})`}>
          <line x1="0" y1="0" x2="0" y2="-26" />
          <path d="M0 -26 L16 -20 L0 -14 Z" />
          <circle cx="0" cy="0" r="5" />
        </g>
      ))}
      {marche && (
        <g className={`${P}__pente`}>
          <line
            x1={X(marche.a[0] - 3)}
            y1={Y(marche.a[1] - 3 * marche.pente)}
            x2={X(marche.a[0] + 3)}
            y2={Y(marche.a[1] + 3 * marche.pente)}
            className={`${P}__tangente`}
          />
          <path d={`M${X(marche.a[0])} ${Y(marche.a[1])} H${X(marche.b[0])} V${Y(marche.b[1])}`} className={`${P}__pointilles`} pathLength="1" />
          <text x={(X(marche.a[0]) + X(marche.b[0])) / 2} y={Y(marche.a[1]) + (marche.b[1] >= marche.a[1] ? 14 : -6)} textAnchor="middle" className={`${P}__delta`}>{marche.dx}</text>
          <text x={X(marche.b[0]) + 6} y={(Y(marche.a[1]) + Y(marche.b[1])) / 2} className={`${P}__delta`}>{marche.dy}</text>
          <circle cx={X(marche.a[0])} cy={Y(marche.a[1])} r="5" className={`${P}__cible`} />
        </g>
      )}
    </svg>
  );
}

/** Le point (x ; y) de la courbe ou du nuage dont l'une des coordonnées vaut v. */
function pointOu(visuel, axe, v) {
  const pts = visuel?.nuage ?? visuel?.points?.map((p) => [p.x, p.y]) ?? visuel?.fonctions?.[0]?.points ?? [];
  return pts.find((p) => proche(p[axe], v)) ?? null;
}

/** « [2 ; 7] » → [2, 7]. */
const lireIntervalle = (t) => {
  const lu = String(t).match(/^\[(−?[\d,]+) ; (−?[\d,]+)\]$/);
  return lu ? [nombreFr(lu[1]), nombreFr(lu[2])] : null;
};

/* --------------------------------------------------------- les explications */

function TermeATerme({ m }) {
  const expr = String(m.question).match(/^f\(x\) = (.+)$/m)?.[1];
  const coefs = lirePolynome(expr);
  if (!coefs) return null;
  const termes = coefs.map((c, d) => [c, d]).filter(([c]) => c !== 0).reverse();
  return (
    <div className={`${P}__termes`}>
      {termes.map(([c, d], i) => {
        const seul = Array(d + 1).fill(0);
        seul[d] = c;
        return (
          <span key={d} className={`${P}__terme`} style={{ '--n': i }}>
            <span>{ecrirePolynome(seul)}</span>
            <span className={`${P}__fleche`} aria-hidden="true">→</span>
            <strong>{ecrirePolynome(deriverPolynome(seul))}</strong>
          </span>
        );
      })}
    </div>
  );
}

function Explication({ m }) {
  const q = String(m.question);
  const v = m.visuel;
  const b = nombreFr(m.bonne);
  let dessin = null;
  let texte = `La réponse : ${m.bonne}.`;
  switch (m.consigne) {
    case 'image': {
      const x = nombreFr(q.match(/Image de (−?[\d,]+) par f/)?.[1]);
      const pt = x !== null ? pointOu(v, 0, x) : null;
      if (pt && proche(pt[1], b)) dessin = <Lecture visuel={v} point={pt} />;
      texte = `L’image se lit sur la ligne f(x), sous x = ${ecrireFr(x)} : ${m.bonne}. On monte de l’axe des x jusqu’au point, puis on lit sa hauteur.`;
      break;
    }
    case 'antecedent': {
      const y = nombreFr(q.match(/Antécédent de (−?[\d,]+) par f/)?.[1]);
      const pt = y !== null ? pointOu(v, 1, y) : null;
      if (pt && proche(pt[0], b)) dessin = <Lecture visuel={v} point={pt} />;
      texte = `Un antécédent se lit sur la ligne x, au-dessus de f(x) = ${ecrireFr(y)} : ${m.bonne}.`;
      break;
    }
    case 'croissance': {
      const iv = lireIntervalle(m.bonne);
      if (iv) dessin = <Lecture visuel={v} morceau={iv} />;
      texte = `L’intervalle se lit sur l’axe des x, là où la courbe ${q.includes('décroissante') ? 'descend' : 'monte'} : ${m.bonne}.`;
      break;
    }
    case 'extremum':
    case 'exploiter-variations': {
      const pt = b !== null ? pointOu(v, 1, b) : null;
      if (pt) dessin = <Lecture visuel={v} fanion={pt} />;
      texte = `L’extremum est une valeur de f (une hauteur), ici ${m.bonne}, atteinte en x = ${pt ? ecrireFr(pt[0]) : '…'}.`;
      break;
    }
    case 'atteint': {
      const pt = b !== null ? pointOu(v, 0, b) : null;
      if (pt) dessin = <Lecture visuel={v} fanion={pt} />;
      texte = `On demande où : la valeur de x, ${m.bonne} — pas la hauteur ${pt ? ecrireFr(pt[1]) : ''}.`;
      break;
    }
    case 'tangente': {
      const [xa, ya, xb, yb] = nombresDans(q.split('passe par')[1] ?? '');
      if ([xa, ya, xb, yb].every(Number.isFinite)) {
        texte = `Pente = Δy ÷ Δx = (${ecrireFr(yb)} − ${ecrireFr(ya)}) ÷ (${ecrireFr(xb)} − ${ecrireFr(xa)}) = ${ecrireFr(yb - ya)} ÷ ${ecrireFr(xb - xa)} = ${m.bonne}. Le nombre dérivé est cette pente.`;
        dessin = (
          <Lecture
            visuel={v}
            marche={{
              a: [xa, ya], b: [xb, yb], pente: (yb - ya) / (xb - xa), dx: `Δx = ${ecrireFr(xb - xa)}`, dy: `Δy = ${ecrireFr(yb - ya)}`,
            }}
          />
        );
      }
      break;
    }
    case 'nombre-derive': {
      const coefs = lirePolynome(q.match(/^f\(x\) = (.+)$/m)?.[1]);
      const x0 = nombreFr(q.match(/f′\((−?\d+)\)/)?.[1]);
      if (coefs && x0 !== null) {
        const d = deriverPolynome(coefs);
        const y0 = coefs.reduce((s, c, i) => s + c * x0 ** i, 0);
        const pente = d.reduce((s, c, i) => s + c * x0 ** i, 0);
        texte = `f′(x) = ${ecrirePolynome(d)}, donc f′(${ecrireFr(x0)}) = ${m.bonne} : la pente de la tangente en A — on avance de 1, on monte de f′(a) —, pas la hauteur de A.`;
        dessin = (
          <Lecture
            visuel={v}
            marche={{
              a: [x0, y0], b: [x0 + 1, y0 + pente], pente, dx: '1', dy: `${ecrireFr(pente)}`,
            }}
          />
        );
      }
      break;
    }
    case 'derivee':
    case 'derivee-degre-trois':
      dessin = <TermeATerme m={m} />;
      texte = `L’exposant descend devant, puis baisse de un ; la constante disparaît : f′(x) = ${m.bonne}.`;
      break;
    case 'sens-variation': {
      const coefs = lirePolynome(q.match(/^f′\(x\) = (.+?) sur/m)?.[1]);
      if (coefs && coefs.length === 2 && coefs[1] !== 0) {
        const r = -coefs[0] / coefs[1];
        const iv = q.match(/sur \[(−?\d+) ; (−?\d+)\]/)?.slice(1, 3).map(nombreFr);
        const dedans = iv && r > iv[0] && r < iv[1];
        texte = `f′ s’annule en x = ${ecrireFr(r)}${dedans ? ', dans l’intervalle' : ', hors de l’intervalle'}. f′ < 0 : f décroît ; f′ > 0 : f croît. Ici : ${m.bonne}.`;
        dessin = <Lecture visuel={v} fanions={dedans ? [[r, 0]] : []} />;
      }
      break;
    }
    case 'variations-trinome': {
      const racines = (v?.points ?? []).map((p) => [p.x, p.y]);
      texte = `Un trinôme a le signe de son coefficient à l’extérieur de ses racines, le signe contraire entre elles : ${m.bonne}.`;
      dessin = <Lecture visuel={v} fanions={racines} />;
      break;
    }
    case 'sommet':
    case 'sommet-valeur': {
      const coefs = lirePolynome(q.match(/B\(x\) = (.+?) est le bénéfice/)?.[1]);
      if (coefs && coefs.length === 3 && coefs[2] !== 0) {
        const x0 = -coefs[1] / (2 * coefs[2]);
        const y0 = coefs[2] * x0 * x0 + coefs[1] * x0 + coefs[0];
        texte = `B′(x) = ${ecrirePolynome(deriverPolynome(coefs))} s’annule en x = ${ecrireFr(x0)} : le bénéfice maximal y vaut B(${ecrireFr(x0)}) = ${ecrireFr(y0)} €.`;
        if (v?.fonctions?.[0] && Number.isFinite(valeurSure(v.fonctions[0], x0))) dessin = <Lecture visuel={v} fanion={[x0, y0]} />;
      }
      break;
    }
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

export function QuestionGraphique({ m, termine }) {
  return (
    <div className={P}>
      {termine ? <Explication m={m} /> : <Banc />}
      <div className={`${P}__pupitre`}>
        <TexteQuestion m={m} classe={`${P}__texte`} />
      </div>
    </div>
  );
}

/** Les réponses : des gares le long du rail ; le wagonnet passe devant elles. */
export function GaresGraphique({ choix, fautes, choisir }) {
  return (
    <div className={`${P}__ligne`} role="group" aria-label="Choisis ta réponse">
      <span className={`${P}__voie`} aria-hidden="true">
        <span className={`${P}__navette`} />
      </span>
      <div className={`${P}__gares`}>
        {choix.map(({ cle, libelle }, i) => {
          const fausse = fautes.includes(cle);
          return (
            <button
              key={cle}
              type="button"
              className={`${P}__gare${fausse ? ' est-fausse' : ''}`}
              style={{ '--i': i }}
              onClick={() => choisir(cle)}
              disabled={fausse}
            >
              <span className={`${P}__panneau`}>{libelle}</span>
              <span className={`${P}__poteau`} aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
