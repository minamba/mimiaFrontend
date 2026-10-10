import {
  ecrireFr, nombreFr, nombresDans, proche, TexteQuestion,
} from './outils';

/**
 * L'ENTREPÔT DES BACS JAUNES — « Les probabilités » (voie pro). La
 * couverture : un immense entrepôt lumineux, des tapis roulants qui
 * s'entrecroisent, des bacs jaunes et gris ; un garçon attrape un bac au
 * vol. Une probabilité, c'est un tri : combien de bacs, parmi tous, vont
 * de ce côté. La scène la reprend :
 *   - LA QUESTION : sur le bon de contrôle, posé dans un bac jaune ; à côté,
 *     les tapis qui défilent et l'aiguillage qui bascule ;
 *   - LES RÉPONSES : des bacs jaunes (`objets`) ;
 *   - APRÈS LA RÉPONSE : le tri refait avec les nombres de la question — le
 *     tableau, ses cases favorables allumées et l'effectif par lequel on
 *     divise ; l'arbre et son chemin, multiplié ; les deux ensembles qui se
 *     chevauchent pour « ou » ; les pièces défectueuses parmi toutes.
 */

const P = 'sc-probabilites-pro';

/* ---------------------------------------------------------------- le décor */

function Entrepot() {
  return (
    <svg className={`${P}__entrepot`} viewBox="0 0 240 150" aria-hidden="true" focusable="false">
      <rect width="240" height="150" rx="16" className={`${P}__hall`} />
      {[20, 60, 100].map((y) => <rect key={y} x="150" y={y} width="80" height="6" className={`${P}__etagere`} />)}
      {[0, 1, 2].map((i) => <rect key={i} x={156 + i * 24} y="44" width="18" height="16" rx="2" className={`${P}__bac-deco ${i % 2 ? 'est-gris' : ''}`} />)}
      {/* Le tapis principal, et sa bifurcation. */}
      <path d="M0 112 H120" className={`${P}__tapis`} />
      <path d="M120 112 L220 82" className={`${P}__tapis`} />
      <path d="M120 112 L220 136" className={`${P}__tapis`} />
      <path d="M0 112 H120 M120 112 L220 82 M120 112 L220 136" className={`${P}__rouleaux`} />
      <g className={`${P}__aiguillage`}>
        <rect x="112" y="96" width="34" height="6" rx="3" />
        <circle cx="116" cy="99" r="5" />
      </g>
      <g className={`${P}__colis`}>
        <rect x="-11" y="-14" width="22" height="14" rx="2" className={`${P}__bac-deco`} />
      </g>
      <g className={`${P}__colis est-second`}>
        <rect x="-11" y="-14" width="22" height="14" rx="2" className={`${P}__bac-deco est-gris`} />
      </g>
    </svg>
  );
}

/* --------------------------------------------------------- les lectures */

const pgcd = (a, b) => (b === 0 ? a : pgcd(b, a % b));
const irred = (n, d) => (n > 0 && d > 0 ? `${n / pgcd(n, d)}/${d / pgcd(n, d)}` : null);
const minuscule = (s) => s.charAt(0).toLowerCase() + s.slice(1);

/** Le tableau d'effectifs 2 × 2 écrit en lignes « … | … | … ». */
export function lireTableau(question) {
  const lignes = String(question).split('\n').filter((l) => l.includes(' | '));
  if (lignes.length !== 3) return null;
  const colonnes = lignes[0].split(' | ').slice(1);
  const rangs = lignes.slice(1).map((l) => l.split(' | '));
  const n = rangs.map((r) => r.slice(1).map(nombreFr));
  if (colonnes.length !== 2 || n.some((r) => r.length !== 2 || r.some((v) => v === null))) return null;
  return { colonnes, lignes: rangs.map((r) => r[0]), n };
}

/** Ce que demande la dernière ligne : les cases du numérateur et celles du dénominateur. */
function tri(tab, question) {
  const derniere = String(question).split('\n').pop();
  const noms = [...derniere.matchAll(/« ([^»]+) »/g)].map((x) => x[1]);
  const ligneDe = (t) => tab.lignes.findIndex((l) => minuscule(l) === t);
  const colDe = (t) => tab.colonnes.findIndex((c) => minuscule(c) === t);
  const tout = [[0, 0], [0, 1], [1, 0], [1, 1]];
  if (derniere.includes('sachant') && noms.length === 2) {
    const [ev, cond] = noms;
    const li = ligneDe(cond) >= 0 ? ligneDe(cond) : ligneDe(ev);
    const co = colDe(cond) >= 0 ? colDe(cond) : colDe(ev);
    if (li < 0 || co < 0) return null;
    const condLigne = ligneDe(cond) >= 0;
    return {
      num: [[li, co]],
      den: condLigne ? [[li, 0], [li, 1]] : [[0, co], [1, co]],
    };
  }
  if (noms.length !== 1) return null;
  const nom = noms[0];
  const et = nom.match(/^(.+) et (.+)$/);
  const ou = nom.match(/^(.+) ou (.+)$/);
  if (et && ligneDe(et[1]) >= 0 && colDe(et[2]) >= 0) return { num: [[ligneDe(et[1]), colDe(et[2])]], den: tout };
  if (ou && ligneDe(ou[1]) >= 0 && colDe(ou[2]) >= 0) {
    const [li, co] = [ligneDe(ou[1]), colDe(ou[2])];
    return { num: tout.filter(([a, b]) => a === li || b === co), den: tout };
  }
  if (colDe(nom) >= 0) return { num: [[0, colDe(nom)], [1, colDe(nom)]], den: tout };
  return null;
}

/* --------------------------------------------------------- les dessins */

function Tableau({ m }) {
  const tab = lireTableau(m.question);
  const t = tab ? tri(tab, m.question) : null;
  if (!t) return null;
  const somme = (cases) => cases.reduce((s, [a, b]) => s + tab.n[a][b], 0);
  const num = somme(t.num);
  const den = somme(t.den);
  const juste = irred(num, den) === m.bonne;
  const dans = (cases, a, b) => cases.some(([x, y]) => x === a && y === b);
  return (
    <>
      <table className={`${P}__tableau`}>
        <thead>
          <tr>
            <th aria-hidden="true" />
            {tab.colonnes.map((c) => <th key={c}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {tab.lignes.map((l, a) => (
            <tr key={l}>
              <th>{l}</th>
              {tab.n[a].map((v, b) => (
                // eslint-disable-next-line react/no-array-index-key
                <td key={b} className={`${dans(t.num, a, b) ? 'est-favorable' : ''}${dans(t.den, a, b) ? ' est-total' : ''}`}>{v}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {juste && <p className={`${P}__calcul`}>{`${num} ÷ ${den} = ${m.bonne}`}</p>}
    </>
  );
}

/** « A (0,3) → D (0,1) ou D̄ (0,9) » : l'arbre pondéré, et son chemin. */
function Arbre({ m }) {
  const q = String(m.question);
  const branches = [...q.matchAll(/^([AB]) \(([\d,]+)\) → D \(([\d,]+)\) ou D̄ \(([\d,]+)\)$/gm)]
    .map((x) => ({ nom: x[1], p: nombreFr(x[2]), d: nombreFr(x[3]), dbar: nombreFr(x[4]) }));
  if (branches.length !== 2) return null;
  const chemin = q.match(/P\(([AB]) ∩ (D̄?)\)/);
  const totale = /P\(D\) \?/.test(q);
  const allume = (nom, issue) => (totale ? issue === 'D' : chemin && chemin[1] === nom && (chemin[2] ? 'D̄' : 'D') === issue);
  const termes = branches.flatMap((br) => [['D', br.d], ['D̄', br.dbar]].filter(([issue]) => allume(br.nom, issue)).map(([, v]) => [br.p, v]));
  const valeur = termes.reduce((s, [a, b]) => s + a * b, 0);
  const juste = proche(Math.round(valeur * 1e6) / 1e6, nombreFr(m.bonne) ?? NaN);
  return (
    <>
      <svg className={`${P}__arbre`} viewBox="0 0 300 130" aria-hidden="true" focusable="false">
        <circle cx="20" cy="65" r="6" className={`${P}__racine`} />
        {branches.map((br, i) => {
          const y = i === 0 ? 32 : 98;
          return (
            <g key={br.nom}>
              <line x1="20" y1="65" x2="120" y2={y} className={`${P}__branche${allume(br.nom, 'D') || allume(br.nom, 'D̄') ? ' est-allumee' : ''}`} />
              <text x="64" y={y === 32 ? 40 : 96} className={`${P}__poids`}>{ecrireFr(br.p, 4)}</text>
              <text x="126" y={y + 5} className={`${P}__noeud`}>{br.nom}</text>
              {[['D', br.d, y - 22], ['D̄', br.dbar, y + 22]].map(([issue, v, yy]) => (
                <g key={issue}>
                  <line x1="140" y1={y} x2="240" y2={yy} className={`${P}__branche${allume(br.nom, issue) ? ' est-allumee' : ''}`} />
                  <text x="180" y={(y + yy) / 2 - 4} className={`${P}__poids`}>{ecrireFr(v, 4)}</text>
                  <text x="246" y={yy + 5} className={`${P}__noeud`}>{issue}</text>
                </g>
              ))}
            </g>
          );
        })}
      </svg>
      {juste && termes.length > 0 && (
        <p className={`${P}__calcul`}>{`${termes.map(([a, b]) => `${ecrireFr(a, 4)} × ${ecrireFr(b, 4)}`).join(' + ')} = ${m.bonne}`}</p>
      )}
    </>
  );
}

/** Deux ensembles qui se chevauchent : « ou » les prend tous deux, une seule fois l'intersection. */
function Venn({ m }) {
  const q = String(m.question);
  const [a, b, c] = ['P\\(A\\)', 'P\\(B\\)', 'P\\(A ∩ B\\)'].map((k) => nombreFr(q.match(new RegExp(`${k} = ([\\d,]+)`))?.[1]));
  if ([a, b, c].some((v) => v === null)) return null;
  const ni = !q.includes('P(A ∪ B) ?');
  const union = a + b - c;
  return (
    <>
      <svg className={`${P}__venn${ni ? ' est-ni' : ''}`} viewBox="0 0 220 110" aria-hidden="true" focusable="false">
        <rect x="4" y="4" width="212" height="102" rx="12" className={`${P}__univers`} />
        <circle cx="86" cy="55" r="40" className={`${P}__ensemble`} />
        <circle cx="134" cy="55" r="40" className={`${P}__ensemble`} />
        <text x="58" y="60" className={`${P}__noeud`}>A</text>
        <text x="152" y="60" className={`${P}__noeud`}>B</text>
      </svg>
      <p className={`${P}__calcul`}>
        {ni
          ? `1 − P(A ∪ B) = 1 − (${ecrireFr(a)} + ${ecrireFr(b)} − ${ecrireFr(c)}) = ${ecrireFr(1 - union, 4)}`
          : `P(A ∪ B) = ${ecrireFr(a)} + ${ecrireFr(b)} − ${ecrireFr(c)} = ${ecrireFr(union, 4)}`}
      </p>
    </>
  );
}

/** Les pièces du lot : les favorables en couleur, parmi toutes. */
function Lot({ m }) {
  const [n, k] = nombresDans(m.question);
  if (!(n > 0 && k > 0 && n <= 60 && k < n)) return null;
  const contraire = /pas|ne vienne/.test(String(m.question).split('\n').pop());
  const fav = contraire ? n - k : k;
  return (
    <>
      <div className={`${P}__lot`} aria-hidden="true">
        {Array.from({ length: n }, (_, i) => <span key={i} className={i < k ? 'est-marque' : ''} style={{ '--n': i }} />)}
      </div>
      <p className={`${P}__calcul`}>{`${fav} ${contraire ? 'non marquées' : 'marquées'} sur ${n} : ${fav}/${n} = ${m.bonne}`}</p>
    </>
  );
}

const REGLES = {
  'proba-simple': 'Probabilité = cas favorables ÷ tous les cas.',
  frequence: 'Fréquence observée = effectif ÷ effectif total : elle estime la probabilité.',
  echantillon: 'Plus l’échantillon est grand, plus l’estimation est fiable.',
  'tableau-et': '« et » : une seule case, divisée par le total général.',
  'tableau-marge': 'Une colonne entière (sa marge), divisée par le total général.',
  'condition-tableau': '« sachant » : on ne garde que la ligne (ou la colonne) de la condition ; on divise par son total.',
  'arbre-chemin': 'Le long d’un chemin, on multiplie les probabilités.',
  'proba-totale': 'Probabilités totales : on additionne les chemins qui mènent à D.',
  'proba-ou': '« ou » : on additionne, et on retire l’intersection, comptée deux fois.',
  'au-moins-un': 'Au moins un = 1 − aucun : 1 − (1 − p)(1 − q) pour deux événements indépendants.',
};

function Explication({ m }) {
  let dessin = null;
  if (['tableau-et', 'tableau-marge', 'condition-tableau'].includes(m.consigne)) dessin = <Tableau m={m} />;
  else if (m.consigne === 'proba-ou') dessin = lireTableau(m.question) ? <Tableau m={m} /> : <Venn m={m} />;
  else if (m.consigne === 'arbre-chemin' || m.consigne === 'proba-totale') dessin = <Arbre m={m} />;
  else if (m.consigne === 'proba-simple') dessin = <Lot m={m} />;
  else if (m.consigne === 'frequence') {
    const [n, k] = nombresDans(m.question);
    if (n > 0 && k >= 0 && proche(k / n, nombreFr(m.bonne) ?? NaN)) {
      dessin = <p className={`${P}__calcul`}>{`${k} ÷ ${n} = ${m.bonne}`}</p>;
    }
  } else if (m.consigne === 'echantillon') {
    const [nA, nB] = nombresDans(m.question);
    if (nA > 0 && nB > 0) {
      const plus = Math.max(nA, nB);
      dessin = (
        <div className={`${P}__echantillons`}>
          {[['A', nA], ['B', nB]].map(([nom, n]) => (
            <span key={nom} className={`${P}__echantillon`}>
              <strong>{nom}</strong>
              <span className={`${P}__jauge`} style={{ '--part': `${Math.max(4, (Math.log10(n) / Math.log10(plus)) * 100)}%` }} />
              {`${n} pièces`}
            </span>
          ))}
        </div>
      );
    }
  }
  else if (m.consigne === 'au-moins-un') {
    const [p, q] = nombresDans(m.question).filter((v) => v > 0 && v < 1);
    if (p !== undefined && q !== undefined) {
      dessin = <p className={`${P}__calcul`}>{`1 − (1 − ${ecrireFr(p)}) × (1 − ${ecrireFr(q)}) = ${ecrireFr(1 - (1 - p) * (1 - q), 4)}`}</p>;
    }
  }
  return (
    <div className={`${P}__explication`}>
      {dessin}
      <p className={`${P}__regle`}>{REGLES[m.consigne] ?? `La réponse : ${m.bonne}.`}</p>
    </div>
  );
}

export function QuestionProbabilites({ m, termine }) {
  return (
    <div className={P}>
      {termine ? <Explication m={m} /> : <Entrepot />}
      <div className={`${P}__bon`}>
        <span className={`${P}__onglet`} aria-hidden="true">Contrôle</span>
        <TexteQuestion m={m} classe={`${P}__texte`} />
      </div>
    </div>
  );
}
