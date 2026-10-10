import {
  fenetreValide, Intervalle, nombreFr, repere, TexteQuestion, tracer,
} from './outils';

/**
 * LE PALAIS DES PAVILLONS DE CUIVRE — « Le logarithme » (terminale). La
 * couverture : un palais doré, des galeries en arcades et d'immenses
 * pavillons de cuivre, comme des gramophones géants. La scène la reprend :
 *   - LA QUESTION : sur une plaque de laiton rivetée ; à côté, un pavillon de
 *     cuivre d'où partent des ondes, et une règle à calcul dont la réglette
 *     glisse (l'outil qui multipliait en additionnant des logarithmes) ;
 *   - LES RÉPONSES : des médaillons de laiton (`objets`) ;
 *   - APRÈS LA RÉPONSE : la règle à calcul rejoue le calcul — ln a + ln b met
 *     bout à bout deux longueurs et tombe sur a × b, ln a − ln b recule, n ln a
 *     pose n fois la même longueur —, la droite des réels pour un domaine ou
 *     une inéquation, u et u′ pour la dérivée de ln u, la règle pour le reste.
 */

const P = 'sc-logarithme';

/* ---------------------------------------------------------------- le décor */

/** Le pavillon de cuivre et ses ondes. */
function Pavillon() {
  return (
    <svg className={`${P}__pavillon`} viewBox="0 0 200 150" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="sc-log-cuivre" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff1b8" />
          <stop offset="0.45" stopColor="#e2a93b" />
          <stop offset="1" stopColor="#8a5a12" />
        </linearGradient>
        <radialGradient id="sc-log-gorge" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#3b2205" />
          <stop offset="0.7" stopColor="#7a4a10" />
          <stop offset="1" stopColor="#d79a2c" />
        </radialGradient>
      </defs>
      {/* Les arcades du palais, au fond. */}
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${12 + i * 46} 150 V60 a20 20 0 0 1 40 0 V150`} className={`${P}__arcade`} />
      ))}
      {/* Les ondes qui sortent du pavillon. */}
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d="M150 40 q22 35 0 70" className={`${P}__onde`} style={{ '--n': i }} />
      ))}
      <path d="M20 82 L96 70 Q120 30 148 22 L152 128 Q120 120 96 92 L20 90 Z" fill="url(#sc-log-cuivre)" stroke="#6b4310" strokeWidth="2" />
      <ellipse cx="150" cy="75" rx="14" ry="53" fill="url(#sc-log-gorge)" stroke="#6b4310" strokeWidth="2" />
      <circle cx="22" cy="86" r="8" fill="#e2a93b" stroke="#6b4310" strokeWidth="2" />
      <path d="M40 80 h50" stroke="#fff6d0" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

/** La règle à calcul : deux échelles logarithmiques, la réglette glisse doucement. */
function Regle() {
  const graduations = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const x = (v) => 8 + 184 * Math.log10(v);
  return (
    <svg className={`${P}__regle`} viewBox="0 0 200 44" aria-hidden="true" focusable="false">
      <rect x="2" y="2" width="196" height="40" rx="5" className={`${P}__corps`} />
      <g className={`${P}__reglette`}>
        <rect x="2" y="15" width="196" height="14" className={`${P}__coulisse`} />
        {graduations.map((v) => <line key={v} x1={x(v)} y1="15" x2={x(v)} y2={v === 1 || v === 10 ? 25 : 21} className={`${P}__trait`} />)}
      </g>
      {graduations.map((v) => (
        <g key={v}>
          <line x1={x(v)} y1="2" x2={x(v)} y2="10" className={`${P}__trait`} />
          <text x={x(v)} y="39" textAnchor="middle" className={`${P}__chiffre`}>{v}</text>
        </g>
      ))}
    </svg>
  );
}

/* --------------------------------------------------------- les explications */

/** « ln 6 + ln 4 = ? », « ln 12 − ln 3 = ? », « 3 ln 2 = ? » → les longueurs à poser bout à bout. */
export function lireProprietes(question) {
  const q = String(question).split('\n')[0];
  let lu = q.match(/^ln (\d+) \+ ln (\d+) = \?$/);
  if (lu) {
    const [a, b] = [Number(lu[1]), Number(lu[2])];
    return { pas: [a, b], signes: [1, 1], fin: a * b, formule: `ln ${a} + ln ${b} = ln(${a} × ${b}) = ln ${a * b}` };
  }
  lu = q.match(/^ln (\d+) − ln (\d+) = \?$/);
  if (lu) {
    const [a, b] = [Number(lu[1]), Number(lu[2])];
    if (a % b !== 0) return null;
    return { pas: [a, b], signes: [1, -1], fin: a / b, formule: `ln ${a} − ln ${b} = ln(${a} ÷ ${b}) = ln ${a / b}` };
  }
  lu = q.match(/^(\d+) ln (\d+) = \?$/);
  if (lu) {
    const [n, a] = [Number(lu[1]), Number(lu[2])];
    return { pas: Array(n).fill(a), signes: Array(n).fill(1), fin: a ** n, formule: `${n} ln ${a} = ln(${a}${'⁰¹²³⁴⁵⁶⁷⁸⁹'[n]}) = ln ${a ** n}` };
  }
  return null;
}

/** La règle à calcul rejoue le calcul : des longueurs ln a posées bout à bout sur l'échelle. */
function RegleQuiCalcule({ calcul }) {
  const { pas, signes, fin, formule } = calcul;
  const positions = [0];
  pas.forEach((v, i) => positions.push(positions[i] + signes[i] * Math.log(v)));
  const max = Math.max(...positions, Math.log(fin), Math.log(2));
  const X = (l) => 14 + (272 * l) / max;
  // Les graduations à écrire ; deux chiffres trop proches se chevaucheraient : on garde le premier, et toujours l'arrivée.
  const toutes = [...new Set([1, ...pas, fin, ...positions.map((l) => Math.round(Math.exp(l)))])].sort((a, b) => a - b);
  const valeurs = toutes.filter((v, i) => v === fin || i === 0
    || (X(Math.log(v)) - X(Math.log(toutes[i - 1])) >= 14 && Math.abs(X(Math.log(fin)) - X(Math.log(v))) >= 14));
  return (
    <div className={`${P}__calcul`}>
      <svg viewBox="0 0 300 92" aria-hidden="true" focusable="false">
        <rect x="4" y="44" width="292" height="30" rx="6" className={`${P}__corps`} />
        {valeurs.map((v) => (
          <g key={v}>
            <line x1={X(Math.log(v))} y1="44" x2={X(Math.log(v))} y2="54" className={`${P}__trait`} />
            <text x={X(Math.log(v))} y="68" textAnchor="middle" className={`${P}__chiffre ${v === fin ? 'est-fin' : ''}`}>{v}</text>
          </g>
        ))}
        {pas.map((v, i) => {
          const de = X(positions[i]);
          const a = X(positions[i + 1]);
          return (
            // eslint-disable-next-line react/no-array-index-key
            <g key={i} className={`${P}__longueur`} style={{ '--n': i }}>
              <line x1={de} y1={30 - i * 7} x2={a} y2={30 - i * 7} className={signes[i] > 0 ? 'est-avance' : 'est-recule'} />
              <text x={(de + a) / 2} y={25 - i * 7} textAnchor="middle" className={`${P}__etiquette`}>{`${signes[i] > 0 ? '' : '−'}ln ${v}`}</text>
            </g>
          );
        })}
        <circle cx={X(Math.log(fin))} cy="49" r="5" className={`${P}__arrivee`} style={{ '--n': pas.length }} />
      </svg>
      <p className={`${P}__regle-texte`}>{formule}</p>
    </div>
  );
}

/** La dérivée de ln u : u, u′, et le quotient u′ / u. */
function LnU({ m }) {
  const u = String(m.question).match(/^f\(x\) = ln\((.+?)\)(, pour x > 0)?\n/)?.[1];
  const haut = String(m.bonne).split(' / ')[0];
  if (!u || !haut) return null;
  return (
    <div className={`${P}__lnu`}>
      <span className={`${P}__piece`}>{`u(x) = ${u}`}</span>
      <span className={`${P}__piece`} style={{ '--n': 1 }}>{`u′(x) = ${haut}`}</span>
      <span className={`${P}__piece est-fin`} style={{ '--n': 2 }}>{`f′(x) = u′ / u = ${m.bonne}`}</span>
    </div>
  );
}

/**
 * L'équation lue sur la courbe : la droite y = k coupe la courbe de ln (ou
 * de exp) au-dessus de la solution — ou ne la coupe jamais, pour eˣ = −a.
 */
function LectureCourbe({ m }) {
  const v = m.visuel;
  const fenetre = fenetreValide(v);
  const f = v?.fonctions?.[0];
  const ligne = String(m.question).split('\n')[0];
  const lu = ligne.match(/^(ln x|eˣ) = (−?\d+)$/);
  if (!fenetre || !f || !lu) return null;
  const k = nombreFr(lu[2]);
  let x = null;
  if (lu[1] === 'ln x') x = Math.exp(k);
  else if (k > 0) x = Math.log(k);
  const R = repere(fenetre, 300, 160);
  const { X, Y } = R;
  const dedans = (vx, vy) => vx >= fenetre.xmin && vx <= fenetre.xmax && vy >= fenetre.ymin && vy <= fenetre.ymax;
  const zeroY = Math.min(Math.max(0, fenetre.ymin), fenetre.ymax);
  const zeroX = Math.min(Math.max(0, fenetre.xmin), fenetre.xmax);
  return (
    <svg className={`${P}__lecture`} viewBox="0 0 300 160" aria-hidden="true" focusable="false">
      <line x1="0" y1={Y(zeroY)} x2="300" y2={Y(zeroY)} className={`${P}__axe`} />
      <line x1={X(zeroX)} y1="0" x2={X(zeroX)} y2="160" className={`${P}__axe`} />
      <path d={tracer(f, fenetre, R)} className={`${P}__courbe`} />
      {k >= fenetre.ymin && k <= fenetre.ymax && <line x1="0" y1={Y(k)} x2="300" y2={Y(k)} className={`${P}__horizontale`} />}
      {x !== null && dedans(x, k) && (
        <g className={`${P}__solution`}>
          <path d={`M${X(x)} ${Y(k)} V${Y(zeroY)}`} className={`${P}__aplomb`} />
          <circle cx={X(x)} cy={Y(k)} r="6" />
        </g>
      )}
    </svg>
  );
}

const VALEURS = [
  [/^ln 1 =/, 'ln 1 = 0 : la courbe de ln coupe l’axe en x = 1.'],
  [/^ln e =/, 'ln e = 1 : e est le nombre dont le logarithme vaut 1.'],
  [/^ln\(e/, 'ln et exp se défont l’une l’autre : ln(eᵃ) = a.'],
  [/^e\^\(ln/, 'exp et ln se défont l’une l’autre : e^(ln a) = a, pour a > 0.'],
  [/^ln\(1\//, 'ln(1/a) = −ln a : l’inverse devient l’opposé.'],
];

function regleDe(m) {
  const q = String(m.question);
  switch (m.consigne) {
    case 'valeurs': return VALEURS.find(([motif]) => motif.test(q))?.[1] ?? 'ln et exp se défont l’une l’autre.';
    case 'domaine': return 'ln n’existe que pour un nombre strictement positif : on résout « ce qui est dans ln » > 0.';
    case 'equation':
      return m.bonne === 'aucune solution'
        ? 'ln A = ln B donne A = B, mais la valeur trouvée rend A et B négatifs : ln n’y existe pas, on la rejette.'
        : 'ln A = ln B ⇔ A = B, à condition que A et B soient strictement positifs.';
    case 'equation-simple':
      if (m.bonne === 'aucune solution') return 'eˣ est toujours strictement positif : il n’atteint jamais un nombre négatif.';
      return q.startsWith('ln') ? 'ln x = k ⇔ x = eᵏ : on défait ln avec l’exponentielle.' : 'eˣ = a ⇔ x = ln a, pour a > 0 : on défait exp avec ln.';
    case 'inequation':
      return q.startsWith('ln')
        ? 'ln est croissante : ln x < k ⇔ 0 < x < eᵏ, sans oublier x > 0.'
        : 'exp est croissante : on garde le sens de l’inégalité, et eˣ existe pour tout x.';
    default: return null;
  }
}

function Explication({ m }) {
  const regle = regleDe(m);
  let dessin = null;
  if (m.consigne === 'proprietes') {
    const calcul = lireProprietes(m.question);
    dessin = calcul ? <RegleQuiCalcule calcul={calcul} /> : null;
  } else if (m.consigne === 'equation-simple') {
    dessin = <LectureCourbe m={m} />;
  } else if (m.consigne === 'derivee') {
    dessin = <LnU m={m} />;
  } else if (m.consigne === 'domaine' || m.consigne === 'inequation') {
    dessin = <Intervalle P={P} texte={m.bonne} />;
  }
  return (
    <div className={`${P}__explication`}>
      {dessin}
      {regle && <p className={`${P}__regle-texte`}>{regle}</p>}
      {!dessin && !regle && <p className={`${P}__regle-texte`}>{`La réponse : ${m.bonne}.`}</p>}
    </div>
  );
}

export function QuestionLogarithme({ m, termine }) {
  return (
    <div className={P}>
      {termine ? <Explication m={m} /> : (
        <div className={`${P}__atelier`}>
          <Pavillon />
          <Regle />
        </div>
      )}
      <div className={`${P}__plaque`}>
        <span className={`${P}__rivet`} aria-hidden="true" />
        <span className={`${P}__rivet`} aria-hidden="true" />
        <span className={`${P}__rivet`} aria-hidden="true" />
        <span className={`${P}__rivet`} aria-hidden="true" />
        <TexteQuestion m={m} classe={`${P}__texte`} />
      </div>
    </div>
  );
}

