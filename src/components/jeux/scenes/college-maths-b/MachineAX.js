import { Enonce, useEtapes } from './commun';

/**
 * LA MACHINE À X — « La machine à x » (5e → 3e), le 09/10/2026.
 * La couverture : une serre de verre et de laiton, une grande trémie dorée,
 * des engrenages, des goulottes de verre. La scène en est la machine :
 *   - AVANT : les termes de l'expression attendent au-dessus de la trémie,
 *     en jetons de laiton (les x en bleu-vert, les nombres en or) — ce sont
 *     ceux de la question, rien de plus ; les engrenages tournent doucement ;
 *   - APRÈS : la machine travaille et un TICKET sort, ligne par ligne :
 *       réduire — les x tombent dans une goulotte, les nombres dans l'autre ;
 *       développer — des fils relient le facteur à chaque terme ;
 *       (a + b)² — le grand carré se découpe en a², ab, ab, b² ;
 *       remplacer x — la valeur prend la place de x, puis le calcul ;
 *       factoriser — le facteur commun s'allume dans chaque terme, et sort.
 * Rien n'est calculé à l'écran avant la réponse.
 */

const P = 'sc-machine-a-x';

/* ------------------------------------------------- LES TERMES */

/** « −3x² » → { c: −3, d: 2 } ; « x » → { c: 1, d: 1 } ; « 5 » → { c: 5, d: 0 }. */
function lireTerme(t) {
  const s = t.replace(/\s/g, '').replace(/−/g, '-');
  const r = s.match(/^([+-]?)(\d*)(x²|x)?$/);
  if (!r || (!r[2] && !r[3])) return null;
  const signe = r[1] === '-' ? -1 : 1;
  const coef = r[2] ? Number(r[2]) : 1;
  return { c: signe * coef, d: r[3] === 'x²' ? 2 : (r[3] ? 1 : 0) };
}

/** « 3x + 5 + 2x − 1 » → les termes, avec leur signe ; null si on ne sait pas lire. */
function termes(expr) {
  const s = String(expr).replace(/\s/g, '');
  const morceaux = s.match(/[+−]?[^+−]+/g);
  if (!morceaux) return null;
  const liste = morceaux.map(lireTerme);
  return liste.every(Boolean) ? liste : null;
}

/** { c, d } → « 3x² », « −x », « 5 ». */
function monome({ c, d }) {
  const v = ['', 'x', 'x²', 'x³'][d] ?? `x^${d}`;
  const abs = Math.abs(c);
  const corps = v && abs === 1 ? v : `${abs}${v}`;
  return c < 0 ? `−${corps}` : corps;
}

/** Une suite de termes écrite à la française : « 3x² − 5x + 2 ». */
function ecrireTermes(liste) {
  const utiles = liste.filter((t) => t.c !== 0);
  if (!utiles.length) return '0';
  return utiles.map((t, i) => {
    const m = monome(t);
    if (i === 0) return m;
    return t.c < 0 ? ` − ${m.slice(1)}` : ` + ${m}`;
  }).join('');
}

const fois = (a, b) => ({ c: a.c * b.c, d: a.d + b.d });
const entre = (t) => (t.c < 0 ? `(${monome(t)})` : monome(t));

/* ------------------------------------------------- LES DESSINS */

/** Un jeton de laiton : bleu-vert pour un terme en x, or pour un nombre. */
function Jeton({ t, classe = '', style }) {
  return <span className={`${P}__jeton ${P}__jeton--${t.d ? 'x' : 'nombre'} ${classe}`} style={style}>{monome(t)}</span>;
}

/** La trémie dorée, ses engrenages, et les jetons qui attendent au-dessus. */
function Tremie({ liste, vite = false }) {
  return (
    <div className={`${P}__machine${vite ? ' est-en-marche' : ''}`} aria-hidden="true">
      <div className={`${P}__attente`}>
        {liste.map((t, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <Jeton key={i} t={t} style={{ '--k': i }} classe={`${P}__jeton--flotte`} />
        ))}
      </div>
      <svg viewBox="0 0 220 90" className={`${P}__tremie`} focusable="false">
        <path d="M20 6 H200 L130 64 V86 H90 V64 Z" className={`${P}__laiton`} />
        <path d="M30 12 H190" className={`${P}__reflet`} />
        <g className={`${P}__engrenage`} style={{ transformOrigin: '22px 66px' }}>
          <circle cx="22" cy="66" r="15" />
          <circle cx="22" cy="66" r="5" className={`${P}__moyeu`} />
        </g>
        <g className={`${P}__engrenage ${P}__engrenage--inverse`} style={{ transformOrigin: '196px 62px' }}>
          <circle cx="196" cy="62" r="19" />
          <circle cx="196" cy="62" r="6" className={`${P}__moyeu`} />
        </g>
      </svg>
    </div>
  );
}

/** Le ticket qui sort de la machine : une ligne de plus à chaque tour d'engrenage. */
function Ticket({ lignes, n }) {
  return (
    <ol className={`${P}__ticket`} aria-label="Le calcul">
      {lignes.map((l, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <li key={i} className={i < n ? 'est-imprime' : ''}>{l}</li>
      ))}
    </ol>
  );
}

/** Les deux goulottes de verre : les x d'un côté, les nombres de l'autre. */
function Goulottes({ liste, n }) {
  const xs = liste.filter((t) => t.d > 0);
  const ns = liste.filter((t) => t.d === 0);
  return (
    <div className={`${P}__goulottes`}>
      {[['les x', xs], ['les nombres', ns]].map(([nom, l], g) => (
        <div key={nom} className={`${P}__goulotte`}>
          <span className={`${P}__goulotte-nom`}>{nom}</span>
          <span className={`${P}__verre`}>
            {l.map((t, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <Jeton key={i} t={t} classe={n >= g + 1 ? `${P}__jeton--tombe` : `${P}__jeton--cache`} style={{ '--k': i }} />
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Les fils de la distributivité : chaque terme de gauche relié à chaque terme de droite. */
function Fils({ gauche, droite, n }) {
  const H = Math.max(gauche.length, droite.length) * 46 + 10;
  const yG = (i) => (H / (gauche.length + 1)) * (i + 1);
  const yD = (j) => (H / (droite.length + 1)) * (j + 1);
  const paires = gauche.flatMap((a, i) => droite.map((b, j) => ({ a, b, i, j })));
  return (
    <svg viewBox={`0 0 300 ${H}`} className={`${P}__fils`} aria-hidden="true" focusable="false">
      {paires.map(({ i, j }, k) => (
        <path
          key={`${i}-${j}`}
          d={`M70 ${yG(i)} C150 ${yG(i)} 150 ${yD(j)} 222 ${yD(j)}`}
          className={`${P}__fil${k < n ? ' est-tendu' : ''}`}
          style={{ '--k': k }}
        />
      ))}
      {gauche.map((t, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <g key={`g${i}`} transform={`translate(38 ${yG(i)})`} className={`${P}__borne ${P}__borne--${t.d ? 'x' : 'nombre'}`}>
          <rect x="-34" y="-15" width="68" height="30" rx="8" />
          <text textAnchor="middle" y="6">{monome(t)}</text>
        </g>
      ))}
      {droite.map((t, j) => (
        // eslint-disable-next-line react/no-array-index-key
        <g key={`d${j}`} transform={`translate(258 ${yD(j)})`} className={`${P}__borne ${P}__borne--${t.d ? 'x' : 'nombre'}`}>
          <rect x="-36" y="-15" width="72" height="30" rx="8" />
          <text textAnchor="middle" y="6">{monome(t)}</text>
        </g>
      ))}
    </svg>
  );
}

/** Le carré de (a + b)² découpé : a², ab, ab, b². */
function Carre({ a, b, n }) {
  const A = 96;
  const B = 50;
  return (
    <svg viewBox={`0 0 ${A + B + 40} ${A + B + 40}`} className={`${P}__carre`} aria-hidden="true" focusable="false">
      <g transform="translate(26 26)">
        <rect x="0" y="0" width={A} height={A} className={`${P}__aire ${P}__aire--a${n >= 1 ? ' est-allumee' : ''}`} />
        <rect x={A} y="0" width={B} height={A} className={`${P}__aire ${P}__aire--ab${n >= 2 ? ' est-allumee' : ''}`} />
        <rect x="0" y={A} width={A} height={B} className={`${P}__aire ${P}__aire--ab${n >= 2 ? ' est-allumee' : ''}`} />
        <rect x={A} y={A} width={B} height={B} className={`${P}__aire ${P}__aire--b${n >= 3 ? ' est-allumee' : ''}`} />
        <text x={A / 2} y={A / 2 + 6} textAnchor="middle">{`${monome(a)}²`}</text>
        <text x={A + B / 2} y={A / 2 + 6} textAnchor="middle" className={`${P}__petit`}>{`${monome(a)}×${monome(b)}`}</text>
        <text x={A / 2} y={A + B / 2 + 6} textAnchor="middle" className={`${P}__petit`}>{`${monome(a)}×${monome(b)}`}</text>
        <text x={A + B / 2} y={A + B / 2 + 6} textAnchor="middle">{`${monome(b)}²`}</text>
        <text x={A / 2} y="-8" textAnchor="middle" className={`${P}__cote`}>{monome(a)}</text>
        <text x={A + B / 2} y="-8" textAnchor="middle" className={`${P}__cote`}>{monome(b)}</text>
        <text x="-8" y={A / 2 + 5} textAnchor="end" className={`${P}__cote`}>{monome(a)}</text>
        <text x="-8" y={A + B / 2 + 5} textAnchor="end" className={`${P}__cote`}>{monome(b)}</text>
      </g>
    </svg>
  );
}

/* ------------------------------------------------- LES EXPLICATIONS */

/** Ce que la machine montre après la réponse : un dessin (facultatif) et les lignes du ticket. */
function explication(m) {
  const q = String(m.question);
  const bonne = String(m.bonne);
  const derniere = q.split('\n').pop();

  if (m.consigne === 'reduire') {
    const produit = derniere.match(/^(.+) × (.+)$/);
    if (produit) {
      const a = lireTerme(produit[1]);
      const b = lireTerme(produit[2]);
      if (!a || !b) return null;
      return { lignes: [`${a.c} × ${b.c} = ${a.c * b.c}`, 'x × x = x²', `${derniere} = ${bonne}`] };
    }
    const liste = termes(derniere);
    if (!liste) return null;
    const xs = liste.filter((t) => t.d > 0);
    const ns = liste.filter((t) => t.d === 0);
    const sx = { c: xs.reduce((s, t) => s + t.c, 0), d: 1 };
    const sn = { c: ns.reduce((s, t) => s + t.c, 0), d: 0 };
    return {
      goulottes: liste,
      lignes: [
        `Les x ensemble : ${ecrireTermes(xs)} = ${monome(sx)}`,
        `Les nombres ensemble : ${ecrireTermes(ns)} = ${monome(sn)}`,
        `${derniere} = ${bonne}`,
      ],
    };
  }

  if (m.consigne === 'substituer') {
    const v = Number((q.match(/x = (\d+)/) ?? [])[1]);
    const liste = termes(derniere);
    if (!Number.isFinite(v) || !liste) return null;
    const remplace = liste.map((t, i) => {
      const signe = i === 0 ? (t.c < 0 ? '−' : '') : (t.c < 0 ? ' − ' : ' + ');
      const c = Math.abs(t.c);
      if (t.d === 0) return `${signe}${c}`;
      const puissance = t.d === 2 ? `${v}²` : `${v}`;
      return `${signe}${c === 1 ? '' : `${c} × `}${puissance}`;
    }).join('');
    const carres = liste.some((t) => t.d === 2)
      ? [liste.map((t, i) => {
        const signe = i === 0 ? (t.c < 0 ? '−' : '') : (t.c < 0 ? ' − ' : ' + ');
        const c = Math.abs(t.c);
        if (t.d === 0) return `${signe}${c}`;
        const val = v ** t.d;
        return `${signe}${c === 1 ? '' : `${c} × `}${val}`;
      }).join('')]
      : [];
    const valeurs = liste.map((t, i) => {
      const val = t.c * v ** t.d;
      if (i === 0) return `${val}`.replace('-', '−');
      return val < 0 ? ` − ${-val}` : ` + ${val}`;
    }).join('');
    return {
      remplace: v,
      lignes: [`x devient ${v} : ${remplace}`, ...carres.map((c) => `= ${c}`), `= ${valeurs}`, `= ${bonne}`],
    };
  }

  if (m.consigne === 'tester-egalite') {
    const v = Number((q.match(/x = (\d+)/) ?? [])[1]);
    const [g, d] = derniere.split(' = ');
    const tg = termes(g);
    const td = termes(d);
    if (!Number.isFinite(v) || !tg || !td) return null;
    const val = (l) => l.reduce((s, t) => s + t.c * v ** t.d, 0);
    const [vg, vd] = [val(tg), val(td)];
    const ecrit = (x) => String(x).replace('-', '−');
    return {
      balance: [vg, vd],
      lignes: [
        `À gauche, pour x = ${v} : ${ecrit(vg)}`,
        `À droite, pour x = ${v} : ${ecrit(vd)}`,
        vg === vd ? `${ecrit(vg)} = ${ecrit(vd)} : l’égalité est vraie` : `${ecrit(vg)} ≠ ${ecrit(vd)} : l’égalité est fausse`,
      ],
    };
  }

  if (m.consigne === 'developper') {
    const r = derniere.match(/^(.+?)\((.+)\)$/);
    if (!r) return null;
    const f = lireTerme(r[1]);
    const dedans = termes(r[2]);
    if (!f || !dedans) return null;
    const produits = dedans.map((t) => fois(f, t));
    return {
      fils: [[f], dedans],
      lignes: [
        ...dedans.map((t, i) => `${entre(f)} × ${entre(t)} = ${monome(produits[i])}`),
        `${derniere} = ${bonne}`,
      ],
    };
  }

  const deux = derniere.match(/^\((.+?)\)\((.+?)\)$/);
  if ((m.consigne === 'double' || m.consigne === 'identite') && deux) {
    const g = termes(deux[1]);
    const d = termes(deux[2]);
    if (!g || !d) return null;
    const produits = g.flatMap((a) => d.map((b) => fois(a, b)));
    return {
      fils: [g, d],
      lignes: [
        `${g.flatMap((a) => d.map((b) => `${entre(a)} × ${entre(b)}`)).join(' + ')}`,
        `= ${ecrireTermes(produits)}`,
        `= ${bonne}`,
      ],
    };
  }

  if (m.consigne === 'identite') {
    const r = derniere.match(/^\((.+?) ([+−]) (\d+)\)²$/);
    if (!r) return null;
    const a = lireTerme(r[1]);
    const b = { c: Number(r[3]), d: 0 };
    if (!a) return null;
    const plus = r[2] === '+';
    return {
      carre: plus ? [a, b] : null,
      lignes: [
        plus ? '(a + b)² = a² + 2ab + b²' : '(a − b)² = a² − 2ab + b²',
        `a = ${monome(a)} et b = ${monome(b)}`,
        `${monome(a)}² ${plus ? '+' : '−'} 2 × ${monome(a)} × ${monome(b)} + ${monome(b)}²`,
        `= ${bonne}`,
      ],
    };
  }

  if (m.consigne === 'factoriser') {
    const r = bonne.match(/^(.+?)\((.+)\)$/);
    const liste = termes(derniere);
    if (!r || !liste) return null;
    const k = lireTerme(r[1]);
    const dedans = termes(r[2]);
    if (!k || !dedans || dedans.length !== liste.length) return null;
    return {
      commun: monome(k),
      lignes: [
        `${dedans.map((t, i) => `${i && t.c >= 0 ? '+ ' : ''}${i && t.c < 0 ? '− ' : ''}${monome(k)} × ${i ? monome({ ...t, c: Math.abs(t.c) }) : monome(t)}`).join(' ')}`,
        `${monome(k)} est dans chaque terme : on le sort`,
        `= ${bonne}`,
      ],
    };
  }

  if (m.consigne === 'factoriser-remarquable') {
    const diff = bonne.match(/^\((.+?) − (\d+)\)\((.+?) \+ (\d+)\)$/);
    if (diff) {
      return {
        lignes: [
          `${derniere} = (${diff[1]})² − ${diff[2]}²`,
          'a² − b² = (a − b)(a + b)',
          `= ${bonne}`,
        ],
      };
    }
    const carre = bonne.match(/^\(x ([+−]) (\d+)\)²$/);
    if (carre) {
      return {
        lignes: [
          `${derniere} = x² ${carre[1]} 2 × x × ${carre[2]} + ${carre[2]}²`,
          carre[1] === '+' ? 'a² + 2ab + b² = (a + b)²' : 'a² − 2ab + b² = (a − b)²',
          `= ${bonne}`,
        ],
      };
    }
    return null;
  }

  if (m.consigne === 'facteur-commun') {
    const r = derniere.match(/^(\(.+?\))(\(.+?\)) ([+−]) (\(.+?\))(\(.+?\))$/);
    if (!r) return null;
    const [, commun, u, op, , v] = r;
    const tu = termes(u.slice(1, -1));
    const tv = termes(v.slice(1, -1));
    if (!tu || !tv) return null;
    const ensemble = [...tu, ...tv.map((t) => ({ ...t, c: op === '−' ? -t.c : t.c }))];
    return {
      commun,
      lignes: [
        `${commun} est dans les deux produits`,
        `= ${commun}[${u} ${op} ${v}]`,
        `= ${commun}(${ecrireTermes(ensemble)})`,
        `= ${bonne}`,
      ],
    };
  }
  return null;
}

/** Les termes qui attendent au-dessus de la trémie : ceux de la question, seulement s'ils se lisent. */
function enAttente(m) {
  const derniere = String(m.question).split('\n').pop();
  if (/[()]/.test(derniere)) return null;
  const morceaux = derniere.split(/ = | × /).map(termes);
  return morceaux.every(Boolean) ? morceaux.flat() : null;
}

function Atelier({ m }) {
  const e = explication(m);
  // Deux lignes pareilles de suite (x² sans coefficient) : on n'en garde qu'une.
  const lignes = (e?.lignes ?? [`= ${m.bonne}`]).filter((l, i, a) => i === 0 || l !== a[i - 1]);
  const n = useEtapes(lignes.length, 1100, 450);
  return (
    <div className={`${P}__atelier`}>
      {e?.goulottes && <Goulottes liste={e.goulottes} n={n} />}
      {e?.fils && <Fils gauche={e.fils[0]} droite={e.fils[1]} n={n === 0 ? 0 : 99} />}
      {e?.carre && <Carre a={e.carre[0]} b={e.carre[1]} n={n} />}
      {e?.balance && (
        <div className={`${P}__fioles`}>
          {e.balance.map((v, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <span key={i} className={`${P}__fiole${n > i ? ' est-pleine' : ''}`} style={{ '--h': Math.min(1, Math.abs(v) / Math.max(...e.balance.map(Math.abs), 1)) }}>
              <span className={`${P}__liquide`} />
              <em>{n > i ? String(v).replace('-', '−') : ''}</em>
            </span>
          ))}
        </div>
      )}
      {e?.commun && <span className={`${P}__commun`}>{e.commun}</span>}
      <Ticket lignes={lignes} n={n} />
    </div>
  );
}

export function QuestionMachineX({ m, termine }) {
  const attente = enAttente(m);
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <Enonce m={m} classe={`${P}__enseigne`} />
      {!termine && <Tremie liste={attente ?? []} />}
      {termine && <Atelier m={m} />}
    </div>
  );
}

export const sceneMachineX = {
  question: (m, termine) => <QuestionMachineX m={m} termine={termine} />,
  objets: P,
};
