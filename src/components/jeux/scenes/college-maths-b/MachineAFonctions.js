import {
  Enonce, ecrire, nombre, proprietesChoix, useEtapes,
} from './commun';

/**
 * L'AQUEDUC DES FONCTIONS — « La machine à fonctions » (5e, 3e), le 09/10/2026.
 * La couverture : un aqueduc de pierre, des canaux d'eau orange, bleue et
 * verte, une grande vanne de laiton qu'on tourne. La scène en est l'aqueduc :
 *   - UN NOMBRE ENTRE dans le canal, en goutte, et passe des VANNES qui
 *     portent chacune une étape du programme (« × 3 », « + 5 »), puis tombe
 *     dans le bassin de sortie. AVANT la réponse, rien ne coule : on ne voit
 *     que l'entrée (ou la sortie) donnée et les vannes ; APRÈS, l'eau coule,
 *     et la goutte change de valeur à chaque vanne. Remonter à l'entrée, c'est
 *     faire couler l'eau À L'ENVERS : les vannes se retournent (« − 5 »,
 *     « ÷ 3 ») ;
 *   - LE TABLEAU d'entrées et de sorties : trois canaux, trois couleurs ;
 *     APRÈS, le bon programme se pose sur les vannes et les trois gouttes
 *     coulent ensemble ;
 *   - LA DROITE : ses deux points sur le plan ; APRÈS, la droite se trace et
 *     le petit escalier donne le coefficient ;
 *   - LES RÉPONSES : trois canaux d'eau qui finissent chacun sur une vanne.
 */

const P = 'sc-machine-a-fonctions';
const EAUX = ['orange', 'bleue', 'verte'];

/* ------------------------------------------------- LES PROGRAMMES */

/** « × 3 » → { op: '×', k: 3 } */
function lireEtape(t) {
  const r = String(t).trim().match(/^([×+−÷])\s*\(?([−\d,]+)\)?$/);
  if (!r) return null;
  const k = nombre(r[2]);
  return Number.isFinite(k) ? { op: r[1], k } : null;
}

const appliquer = ({ op, k }, x) => {
  if (op === '×') return x * k;
  if (op === '+') return x + k;
  if (op === '−') return x - k;
  return x / k;
};

const INVERSE = {
  '×': '÷', '÷': '×', '+': '−', '−': '+',
};
const inverse = ({ op, k }) => ({ op: INVERSE[op], k });
/** « × 3 », « + (−2) » ; une vanne encore inconnue garde son « ? ». */
function ecrireEtape({ op, k }) {
  if (op === '?') return '?';
  if (k === '?') return `${op} ?`;
  return `${op} ${k < 0 ? `(${ecrire(k)})` : ecrire(k)}`;
}

/** « 3x − 2 » → les étapes [× 3, − 2] ; « x + 5 » → [+ 5] ; « −x » → [× (−1)]. */
function etapesAffine(expr) {
  const r = String(expr).trim().match(/^(−?)(\d*)x(?: ([+−]) (\d+))?$/);
  if (!r) return null;
  const a = (r[1] ? -1 : 1) * (r[2] ? Number(r[2]) : 1);
  const etapes = a === 1 ? [] : [{ op: '×', k: a }];
  if (r[3]) etapes.push({ op: r[3], k: Number(r[4]) });
  return etapes.length ? etapes : [{ op: '×', k: 1 }];
}

/** Ce que la question donne : les étapes, l'entrée ou la sortie, et le sens de l'eau. */
function lire(m) {
  const q = String(m.question);
  const programme = q.match(/^Programme : (.+?), puis (.+?)\./);
  if (programme) {
    const etapes = [lireEtape(programme[1]), lireEtape(programme[2])];
    if (etapes.some((e) => !e)) return null;
    const entre = q.match(/On entre ([−\d,]+)\./);
    const sort = q.match(/Il sort ([−\d,]+)\. Quel/);
    if (entre) return { etapes, entree: nombre(entre[1]) };
    if (sort) return { etapes, sortie: nombre(sort[1]) };
    return null;
  }
  const f = q.match(/^f\(x\) = (.+?)\. (Image|Antécédent) de ([−\d,]+) \?$/);
  if (f) {
    const etapes = etapesAffine(f[1]);
    if (!etapes) return null;
    return f[2] === 'Image' ? { etapes, entree: nombre(f[3]), nom: 'f' } : { etapes, sortie: nombre(f[3]), nom: 'f' };
  }
  return null;
}

/* ------------------------------------------------- LE CANAL */

/**
 * UN CANAL DE L'AQUEDUC : le bassin d'entrée, les vannes, le bassin de
 * sortie. `valeurs` : la valeur de la goutte avant chaque vanne et à la fin ;
 * `pas` : où en est la goutte (null : rien ne coule) ; `envers` : l'eau
 * remonte de la sortie vers l'entrée.
 */
function Canal({
  etapes, valeurs, pas = null, envers = false, eau = 'bleue', entree = '?', sortie = '?', ok = false, compact = false,
}) {
  const g = etapes.length;
  const X0 = 40;
  const X1 = 400;
  const xs = Array.from({ length: g + 1 }, (_, i) => X0 + ((X1 - X0) * i) / g);
  const vannes = etapes.map((_, i) => (xs[i] + xs[i + 1]) / 2);
  const H = compact ? 92 : 124;
  const y = compact ? 50 : 70;
  // Où est la goutte : à l'entrée, puis après chaque vanne.
  const position = pas === null ? null : (envers ? xs[g - pas] : xs[pas]);
  const valeur = pas === null ? null : valeurs[envers ? g - pas : pas];
  return (
    <svg viewBox={`0 0 440 ${H}`} className={`${P}__canal ${P}__canal--${eau}${pas !== null ? ' est-en-eau' : ''}${envers ? ' est-a-l-envers' : ''}`} aria-hidden="true" focusable="false">
      <rect x="14" y={y - 8} width="412" height="22" rx="6" className={`${P}__pierre`} />
      <rect x="18" y={y - 4} width="404" height="12" rx="4" className={`${P}__eau`} />
      {vannes.map((x, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <g key={i} className={`${P}__vanne`}>
          <rect x={x - 34} y={y - 44} width="68" height="34" rx="8" />
          <text x={x} y={y - 21} textAnchor="middle">{envers && pas !== null ? ecrireEtape(inverse(etapes[i])) : ecrireEtape(etapes[i])}</text>
          <line x1={x} x2={x} y1={y - 10} y2={y + 14} />
        </g>
      ))}
      <g className={`${P}__bassin`}>
        <rect x="2" y={y + 14} width="80" height="26" rx="8" />
        <text x="40" y={y + 33} textAnchor="middle">{entree}</text>
      </g>
      <g className={`${P}__bassin ${P}__bassin--sortie${ok ? ' est-ok' : ''}`}>
        <rect x="360" y={y + 14} width="80" height="26" rx="8" />
        <text x="400" y={y + 33} textAnchor="middle">{sortie}</text>
      </g>
      {position !== null && (
        <g className={`${P}__goutte`} style={{ transform: `translate(${position}px, ${y + 4}px)` }}>
          <path d="M0 -26 C10 -12 16 -4 16 4 A16 16 0 0 1 -16 4 C-16 -4 -10 -12 0 -26 Z" />
          <text y="10" textAnchor="middle">{ecrire(valeur)}</text>
        </g>
      )}
    </svg>
  );
}

/** L'eau coule : la goutte passe les vannes une à une. */
function Ecoulement({ lu, nom }) {
  const { etapes } = lu;
  const envers = lu.entree === undefined;
  // Les valeurs avant chaque vanne, de l'entrée à la sortie.
  let valeurs;
  if (envers) {
    valeurs = [lu.sortie];
    [...etapes].reverse().forEach((e) => valeurs.unshift(appliquer(inverse(e), valeurs[0])));
  } else {
    valeurs = [lu.entree];
    etapes.forEach((e) => valeurs.push(appliquer(e, valeurs[valeurs.length - 1])));
  }
  const g = etapes.length;
  const k = useEtapes(g, 1300, 600);
  const fini = k >= g;
  const lignes = envers
    ? [...etapes].reverse().map((e, i) => `${ecrire(valeurs[g - i])} ${ecrireEtape(inverse(e))} = ${ecrire(valeurs[g - i - 1])}`)
    : etapes.map((e, i) => `${ecrire(valeurs[i])} ${ecrireEtape(e)} = ${ecrire(valeurs[i + 1])}`);
  return (
    <div className={`${P}__atelier`}>
      <Canal
        etapes={etapes}
        valeurs={valeurs}
        pas={k}
        envers={envers}
        entree={envers && !fini ? '?' : ecrire(valeurs[0])}
        sortie={!envers && !fini ? '?' : ecrire(valeurs[g])}
        ok={fini}
      />
      <ol className={`${P}__releve`} aria-label="Le calcul">
        {envers && <li className="est-pose">{`On remonte le canal : chaque vanne se retourne${nom ? ` (antécédent par ${nom})` : ''}`}</li>}
        {lignes.map((l, i) => <li key={l} className={i < k ? 'est-pose' : ''}>{l}</li>)}
      </ol>
    </div>
  );
}

/** Le tableau d'entrées et de sorties : trois canaux ; après, le bon programme fait couler les trois. */
function Tableau({ m, termine }) {
  const paires = (String(m.question).match(/([−\d]+) → ([−\d]+)/g) ?? []).map((p) => p.split(' → ').map(nombre));
  if (!paires.length) return null;
  const bonne = String(m.bonne).split(', puis ').map(lireEtape);
  const connu = termine && bonne.every(Boolean);
  const etapes = connu ? bonne : [{ op: '?', k: NaN }, { op: '?', k: NaN }];
  return (
    <div className={`${P}__atelier ${P}__atelier--trois`}>
      {paires.map(([e, s], i) => (
        <TroisCanaux key={e} etapes={etapes} e={e} s={s} eau={EAUX[i % 3]} termine={connu} />
      ))}
    </div>
  );
}

function TroisCanaux({
  etapes, e, s, eau, termine,
}) {
  const g = etapes.length;
  const valeurs = [e];
  if (termine) etapes.forEach((x) => valeurs.push(appliquer(x, valeurs[valeurs.length - 1])));
  const k = useEtapes(termine ? g : 0, 1200, 500);
  return (
    <Canal
      etapes={etapes}
      valeurs={valeurs}
      pas={termine ? k : null}
      eau={eau}
      entree={ecrire(e)}
      sortie={ecrire(s)}
      ok={termine && k >= g}
      compact
    />
  );
}

/** La fonction linéaire : la vanne « × ? » trouve son coefficient, puis l'eau coule. */
function Lineaire({ m, termine }) {
  const r = String(m.question).match(/f\((\d+)\) = (\d+)\. f\((\d+)\) = \?/);
  if (!r) return null;
  const [x1, y1, x2] = [Number(r[1]), Number(r[2]), Number(r[3])];
  const c = y1 / x1;
  return termine ? <LineaireApres x1={x1} y1={y1} x2={x2} c={c} /> : (
    <div className={`${P}__atelier`}>
      <Canal etapes={[{ op: '×', k: '?' }]} valeurs={[x2]} entree={ecrire(x2)} />
    </div>
  );
}

function LineaireApres({
  x1, y1, x2, c,
}) {
  const k = useEtapes(2, 1300, 500);
  return (
    <div className={`${P}__atelier`}>
      <Canal etapes={[{ op: '×', k: k >= 1 ? c : '?' }]} valeurs={[x2, x2 * c]} pas={k >= 2 ? 1 : (k >= 1 ? 0 : null)} entree={ecrire(x2)} sortie={k >= 2 ? ecrire(x2 * c) : '?'} ok={k >= 2} />
      <ol className={`${P}__releve`} aria-label="Le calcul">
        <li className={k >= 1 ? 'est-pose' : ''}>{`Linéaire : f(x) = a × x, et a = ${y1} ÷ ${x1} = ${ecrire(c)}`}</li>
        <li className={k >= 2 ? 'est-pose' : ''}>{`f(${x2}) = ${ecrire(c)} × ${x2} = ${ecrire(c * x2)}`}</li>
      </ol>
    </div>
  );
}

/** La droite d'une fonction affine : ses deux points ; après, la droite et son escalier. */
function Graphique({ m, termine }) {
  const r = String(m.question).match(/\(0 ; ([−\d]+)\) et \((\d+) ; ([−\d]+)\)/);
  if (!r) return null;
  const b = nombre(r[1]);
  const d = Number(r[2]);
  const yd = nombre(r[3]);
  const a = (yd - b) / d;
  const ymin = Math.min(0, b, yd) - 2;
  const ymax = Math.max(0, b, yd) + 2;
  const xmin = -1;
  const xmax = d + 2;
  const L = 300;
  const H = 210;
  const X = (x) => 30 + ((x - xmin) / (xmax - xmin)) * (L - 50);
  const Y = (y) => 14 + ((ymax - y) / (ymax - ymin)) * (H - 40);
  const pente = (x) => a * x + b;
  return (
    <div className={`${P}__atelier`}>
      <svg viewBox={`0 0 ${L} ${H}`} className={`${P}__plan`} aria-hidden="true" focusable="false">
        {Array.from({ length: xmax - xmin + 1 }, (_, i) => xmin + i).map((x) => <line key={`x${x}`} x1={X(x)} x2={X(x)} y1={Y(ymax)} y2={Y(ymin)} className={x === 0 ? `${P}__axe` : `${P}__quadrillage`} />)}
        {Array.from({ length: ymax - ymin + 1 }, (_, i) => ymin + i).map((y) => <line key={`y${y}`} x1={X(xmin)} x2={X(xmax)} y1={Y(y)} y2={Y(y)} className={y === 0 ? `${P}__axe` : `${P}__quadrillage`} />)}
        {termine && (
          <>
            <line x1={X(xmin)} y1={Y(pente(xmin))} x2={X(xmax)} y2={Y(pente(xmax))} className={`${P}__droite`} />
            <path d={`M${X(0)} ${Y(b)} H${X(d)} V${Y(yd)}`} className={`${P}__escalier`} />
            <text x={(X(0) + X(d)) / 2} y={Y(b) + (yd >= b ? 16 : -6)} textAnchor="middle" className={`${P}__mesure`}>{`+${d}`}</text>
            <text x={X(d) + 6} y={(Y(b) + Y(yd)) / 2 + 5} className={`${P}__mesure`}>{`${yd - b >= 0 ? '+' : '−'}${Math.abs(yd - b)}`}</text>
          </>
        )}
        {[[0, b], [d, yd]].map(([x, y]) => (
          <g key={x} className={`${P}__point`}>
            <circle cx={X(x)} cy={Y(y)} r="6" />
            <text x={X(x) - 8} y={Y(y) - 10} textAnchor="end">{`(${x} ; ${ecrire(y)})`}</text>
          </g>
        ))}
      </svg>
      {termine && (
        <ol className={`${P}__releve`} aria-label="Le calcul">
          <li className="est-pose">{`b, là où la droite coupe l’axe : ${ecrire(b)}`}</li>
          <li className="est-pose">{`a = ${ecrire(yd - b)} ÷ ${d} = ${ecrire(a)}`}</li>
          <li className="est-pose">{`f(x) = ${m.bonne}`}</li>
        </ol>
      )}
    </div>
  );
}

/** Une question de programme ou d'expression : le canal, sec avant la réponse, en eau après. */
function Programme({ m, termine }) {
  const lu = lire(m);
  if (!lu || lu.etapes.some((e) => !Number.isFinite(e.k))) return null;
  if (termine) return <Ecoulement lu={lu} nom={lu.nom} />;
  return (
    <div className={`${P}__atelier`}>
      <Canal
        etapes={lu.etapes}
        valeurs={[]}
        entree={lu.entree !== undefined ? ecrire(lu.entree) : '?'}
        sortie={lu.sortie !== undefined ? ecrire(lu.sortie) : '?'}
      />
    </div>
  );
}

const SORTES = {
  'programme-sortie': Programme,
  'programme-entree': Programme,
  image: Programme,
  antecedent: Programme,
  'quelle-fonction': Tableau,
  lineaire: Lineaire,
  graphique: Graphique,
};

/** La grande vanne de laiton de la couverture, qui tourne doucement. */
function Volant() {
  return (
    <svg viewBox="0 0 60 60" className={`${P}__volant`} aria-hidden="true" focusable="false">
      <circle cx="30" cy="30" r="24" />
      <path d="M30 6 V54 M6 30 H54 M13 13 L47 47 M47 13 L13 47" />
      <circle cx="30" cy="30" r="6" className={`${P}__moyeu`} />
    </svg>
  );
}

export function QuestionMachineF({ m, termine }) {
  const Sorte = SORTES[m.consigne];
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <div className={`${P}__entete`}>
        <Volant />
        <Enonce m={m} classe={`${P}__tablette`} />
      </div>
      {Sorte && <Sorte key={termine ? 'apres' : 'avant'} m={m} termine={termine} />}
    </div>
  );
}

/** Les réponses : trois canaux d'eau (orange, bleue, verte), chacun fermé par sa vanne. */
export function Vannes({ choix, fautes, choisir }) {
  return (
    <ul className={`${P}__vannes`} aria-label="Choisis ta réponse">
      {choix.map(({ cle, libelle }, i) => (
        <li key={cle} className={`${P}__ruisseau ${P}__ruisseau--${EAUX[i % 3]}`} style={{ '--i': i }}>
          <span className={`${P}__flot`} aria-hidden="true" />
          <button {...proprietesChoix(cle, fautes, choisir)} className={`${P}__ecluse${fautes.includes(cle) ? ' est-faux' : ''}`}>
            {libelle}
          </button>
        </li>
      ))}
    </ul>
  );
}

export const sceneMachineF = {
  question: (m, termine) => <QuestionMachineF m={m} termine={termine} />,
  choix: (props) => <Vannes {...props} />,
};
