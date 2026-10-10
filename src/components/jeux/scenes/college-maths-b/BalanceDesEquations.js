import { Enonce, ecrire, nombre, useEtapes } from './commun';

/**
 * LA BALANCE DU PALAIS — « La balance des équations » (4e, 3e), le 09/10/2026.
 * La couverture : un palais de marbre blanc et turquoise, une grande balance
 * d'or suspendue, des lingots et des sphères dorées sur ses plateaux. La
 * scène EST cette balance :
 *   - UNE ÉQUATION, ce sont deux plateaux en équilibre : les x sont des
 *     coffrets turquoise, les nombres des poids d'or. AVANT la réponse, on ne
 *     voit que l'équation posée sur la balance ;
 *   - APRÈS, on la résout en gardant l'équilibre : on enlève les mêmes x des
 *     deux côtés, puis le même poids, puis on partage — chaque geste est écrit
 *     au-dessus, et il ne reste qu'un coffret face à sa valeur ;
 *   - METTRE EN ÉQUATION : le problème est dessiné (le programme, Tom et sa
 *     sœur, le rectangle) ; APRÈS, l'équation se pose sur la balance ;
 *   - LE PRODUIT NUL : deux petites balances, une par facteur ; APRÈS, chacune
 *     donne sa solution.
 */

const P = 'sc-balance-des-equations';

/* --------------------------------------------------- LES ÉCRITURES */

/** « 3x − 2 », « −x + 4 », « 12 » → { a, b } ; null si ce n'est pas une expression du premier degré. */
function affine(texte) {
  const s = String(texte).replace(/\s/g, '');
  const morceaux = s.match(/[+−-]?[^+−-]+/g);
  if (!morceaux) return null;
  let a = 0;
  let b = 0;
  for (let i = 0; i < morceaux.length; i += 1) {
    const r = morceaux[i].match(/^([+−-]?)(\d*(?:,\d+)?)(x?)$/);
    if (!r || (!r[2] && !r[3])) return null;
    const signe = r[1] === '−' || r[1] === '-' ? -1 : 1;
    const v = r[2] ? nombre(r[2]) : 1;
    if (r[3]) a += signe * v;
    else b += signe * v;
  }
  return { a, b };
}

const terme = ({ a, b }) => {
  const x = a === 0 ? '' : `${a === 1 ? '' : (a === -1 ? '−' : ecrire(a))}x`;
  if (!x) return ecrire(b);
  if (b === 0) return x;
  return `${x} ${b < 0 ? '−' : '+'} ${ecrire(Math.abs(b))}`;
};

/**
 * LES GESTES DE LA RÉSOLUTION de ax + b = cx + d : chaque état de la balance
 * (ce qu'il y a à gauche, à droite) et la phrase du geste.
 */
function resolution(g, d) {
  const etats = [{ g, d, texte: `${terme(g)} = ${terme(d)}` }];
  let G = { ...g };
  let D = { ...d };
  if (D.a !== 0) {
    const c = D.a;
    G = { a: G.a - c, b: G.b };
    D = { a: 0, b: D.b };
    etats.push({ g: G, d: D, texte: `On enlève ${terme({ a: c, b: 0 })} des deux côtés : ${terme(G)} = ${terme(D)}` });
  }
  if (G.b !== 0) {
    const b = G.b;
    G = { a: G.a, b: 0 };
    D = { a: 0, b: D.b - b };
    etats.push({ g: G, d: D, texte: `${b > 0 ? `On enlève ${ecrire(b)}` : `On ajoute ${ecrire(-b)}`} des deux côtés : ${terme(G)} = ${ecrire(D.b)}` });
  }
  if (G.a !== 1 && G.a !== 0) {
    const a = G.a;
    G = { a: 1, b: 0 };
    D = { a: 0, b: D.b / a };
    etats.push({ g: G, d: D, texte: `On partage par ${ecrire(a)} : x = ${ecrire(D.b)}` });
  }
  return etats;
}

/* --------------------------------------------------- LA BALANCE */

/** Ce qu'un plateau porte : des coffrets x, et un poids d'or. */
function Charge({ a, b, x0 }) {
  const n = Math.abs(a);
  const coffrets = Math.min(n, 8);
  const objets = [];
  for (let i = 0; i < coffrets; i += 1) {
    objets.push(
      <g key={`x${i}`} className={`${P}__coffret${a < 0 ? ' est-negatif' : ''}`} transform={`translate(${x0 - (b !== 0 ? 58 : 44) + (i % 4) * 22} ${-22 - Math.floor(i / 4) * 22})`}>
        <rect x="0" y="0" width="20" height="20" rx="3" />
        <text x="10" y="15" textAnchor="middle">{a < 0 ? '−x' : 'x'}</text>
      </g>,
    );
  }
  const largeurPoids = Math.max(34, 12 + 10 * ecrire(b).length);
  return (
    <>
      {objets}
      {b !== 0 && (
        <g className={`${P}__poids${b < 0 ? ' est-negatif' : ''}`} transform={`translate(${x0 + (coffrets ? 40 : 0) - largeurPoids / 2} -26)`}>
          <path d={`M4 26 L${largeurPoids - 4} 26 L${largeurPoids - 9} 4 Q${largeurPoids / 2} -4 9 4 Z`} />
          <text x={largeurPoids / 2} y="20" textAnchor="middle">{ecrire(b)}</text>
        </g>
      )}
      {n > 8 && <text x={x0} y="-70" textAnchor="middle" className={`${P}__beaucoup`}>{`${n} x`}</text>}
    </>
  );
}

/** La grande balance d'or : `g` et `d` sur ses plateaux (ou un texte), toujours en équilibre. */
function Balance({
  g, d, texteG = null, texteD = null, penche = 0, petit = false,
}) {
  const angle = penche * 8;
  const yG = 96 + Math.sin((angle * Math.PI) / 180) * -110;
  const yD = 96 + Math.sin((angle * Math.PI) / 180) * 110;
  return (
    <svg viewBox="0 0 360 190" className={`${P}__balance${petit ? ` ${P}__balance--petite` : ''}`} aria-hidden="true" focusable="false">
      <path d="M180 30 V170 M140 178 H220" className={`${P}__pied`} />
      <circle cx="180" cy="30" r="8" className={`${P}__pivot`} />
      <g className={`${P}__fleau`} style={{ transform: `rotate(${angle}deg)` }}>
        <path d="M70 30 H290" className={`${P}__bras`} />
        <path d="M172 22 L180 10 L188 22 Z" className={`${P}__gemme`} />
      </g>
      {[[70, yG, g, texteG], [290, yD, d, texteD]].map(([x, y, charge, texte]) => (
        <g key={x} className={`${P}__plateau-cadre`} style={{ transform: `translate(${x}px, ${y}px)` }}>
          <path d="M0 -66 L-58 0 M0 -66 L58 0" className={`${P}__chaine`} />
          <path d="M-62 0 H62 Q56 14 0 16 Q-56 14 -62 0 Z" className={`${P}__plateau`} />
          {texte ? (
            <g className={`${P}__ecriteau`}>
              <rect x={-Math.max(40, 5 * texte.length + 10)} y="-38" width={2 * Math.max(40, 5 * texte.length + 10)} height="28" rx="8" />
              <text x="0" y="-18" textAnchor="middle">{texte}</text>
            </g>
          ) : charge && <Charge a={charge.a} b={charge.b} x0={0} />}
        </g>
      ))}
    </svg>
  );
}

/** La résolution, geste après geste, sur la balance. */
function Resolution({ g, d }) {
  const etats = resolution(g, d);
  const k = useEtapes(etats.length - 1, 1500, 700);
  const e = etats[k];
  return (
    <div className={`${P}__atelier`}>
      <Balance g={e.g} d={e.d} />
      <ol className={`${P}__gestes`} aria-label="Les étapes">
        {etats.map((x, i) => <li key={x.texte} className={i <= k ? 'est-fait' : ''}>{x.texte}</li>)}
      </ol>
    </div>
  );
}

/* --------------------------------------------------- LES SORTES */

function Equation({ m, termine }) {
  const [gauche, droite] = String(m.question).split(' = ');
  const g = affine(gauche);
  const d = affine(droite);
  if (!g || !d) return null;
  return termine ? <Resolution g={g} d={d} /> : <div className={`${P}__atelier`}><Balance g={g} d={d} /></div>;
}

/** Le problème à mettre en équation, dessiné. */
function Probleme4({ m, termine }) {
  const q = String(m.question);
  let dessin = null;
  const prog = q.match(/multiplie par (\d+), puis j’ajoute (\d+) : j’obtiens (\d+)/);
  const ages = q.match(/Sa sœur a (\d+) ans de plus que lui\. À eux deux, ils ont (\d+) ans/);
  const rect = q.match(/largeur x et pour longueur x \+ (\d+)\. Son périmètre vaut (\d+) cm/);
  if (prog) {
    dessin = (
      <div className={`${P}__chaine-calcul`} aria-hidden="true">
        <span className={`${P}__case-x`}>x</span>
        <em>{`× ${prog[1]}`}</em>
        <em>{`+ ${prog[2]}`}</em>
        <span className={`${P}__case-n`}>{prog[3]}</span>
      </div>
    );
  } else if (ages) {
    dessin = (
      <div className={`${P}__ages`} aria-hidden="true">
        <span className={`${P}__age`}><b>Tom</b><i style={{ '--l': 3 }}>x</i></span>
        <span className={`${P}__age`}><b>Sa sœur</b><i style={{ '--l': 3 }}>x</i><i className={`${P}__age-plus`}>{`+ ${ages[1]}`}</i></span>
        <span className={`${P}__age-total`}>{`ensemble : ${ages[2]} ans`}</span>
      </div>
    );
  } else if (rect) {
    dessin = (
      <svg viewBox="0 0 240 130" className={`${P}__rectangle`} aria-hidden="true" focusable="false">
        <rect x="30" y="20" width="180" height="80" />
        <text x="120" y="122" textAnchor="middle">{`x + ${rect[1]}`}</text>
        <text x="18" y="65" textAnchor="middle">x</text>
        <text x="120" y="66" textAnchor="middle" className={`${P}__perimetre`}>{`tour : ${rect[2]} cm`}</text>
      </svg>
    );
  }
  if (!termine) return dessin;
  const [gauche, droite] = String(m.bonne).split(' = ');
  return (
    <div className={`${P}__atelier`}>
      {dessin}
      <Balance texteG={gauche} texteD={droite} />
    </div>
  );
}

/** Le produit nul : une petite balance par facteur. */
function ProduitNul({ m, termine }) {
  const facteurs = (String(m.question).match(/\(([^()]+)\)/g) ?? []).map((f) => affine(f.slice(1, -1)));
  if (facteurs.length !== 2 || facteurs.some((f) => !f || f.a === 0)) return null;
  return (
    <div className={`${P}__atelier`}>
      <p className={`${P}__regle`}>Un produit est nul quand l’un de ses facteurs est nul.</p>
      <div className={`${P}__duo`}>
        {facteurs.map((f) => (
          <div key={terme(f)} className={`${P}__facteur`}>
            <Balance g={f} d={{ a: 0, b: 0 }} texteD="0" petit />
            {termine && (
              <span className={`${P}__solution`}>{`${terme(f)} = 0 → x = ${ecrire(-f.b / f.a)}`}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Le problème de 3e : l'équation qui le traduit, puis sa résolution. */
function Probleme3({ m, termine }) {
  const q = String(m.question);
  let g;
  let d;
  const nb = q.match(/^(\d+) fois un nombre, plus (\d+), égale (\d+) fois ce nombre, plus (\d+)\./);
  const rect = q.match(/dépasse sa largeur de (\d+) cm, son périmètre vaut (\d+) cm/);
  const cahiers = q.match(/^(\d+) cahiers identiques et un livre à (\d+) € coûtent (\d+) €/);
  let traduction;
  if (nb) {
    g = { a: Number(nb[1]), b: Number(nb[2]) };
    d = { a: Number(nb[3]), b: Number(nb[4]) };
    traduction = `${terme(g)} = ${terme(d)}`;
  } else if (rect) {
    g = { a: 4, b: 2 * Number(rect[1]) };
    d = { a: 0, b: Number(rect[2]) };
    traduction = `2x + 2(x + ${rect[1]}) = ${rect[2]}, soit ${terme(g)} = ${rect[2]}`;
  } else if (cahiers) {
    g = { a: Number(cahiers[1]), b: Number(cahiers[2]) };
    d = { a: 0, b: Number(cahiers[3]) };
    traduction = `${terme(g)} = ${cahiers[3]}`;
  } else return null;
  if (!termine) return <div className={`${P}__atelier`}><Balance texteG="?" texteD="?" /></div>;
  return (
    <div className={`${P}__atelier ${P}__atelier--colonne`}>
      <p className={`${P}__regle`}>{`On appelle x l’inconnue : ${traduction}`}</p>
      <Resolution g={g} d={d} />
    </div>
  );
}

const SORTES = {
  resoudre: Equation,
  'deux-membres': Equation,
  'mise-en-equation': Probleme4,
  'produit-nul': ProduitNul,
  probleme: Probleme3,
};

export function QuestionBalance({ m, termine }) {
  const Sorte = SORTES[m.consigne];
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <Enonce m={m} classe={`${P}__cartouche`} />
      {Sorte && <Sorte key={termine ? 'apres' : 'avant'} m={m} termine={termine} />}
    </div>
  );
}

export const sceneBalance = {
  question: (m, termine) => <QuestionBalance m={m} termine={termine} />,
  objets: P,
};
