import { nombreFr, nombresDans, TexteQuestion } from './outils';

/**
 * LA SALLE DES JOYAUX — « Le dénombrement » (terminale). La couverture : un
 * palais aux tentures rouges, des cristaux taillés suspendus à des
 * présentoirs triangulaires dorés, des coupes pleines de pierres. La scène
 * la reprend :
 *   - LA QUESTION : sur un cartouche bordé d'or ; à côté, le présentoir
 *     triangulaire (une rangée de plus à chaque étage, comme le triangle de
 *     Pascal) où les cristaux tournent et scintillent ;
 *   - LES RÉPONSES : des pendentifs de cristal taillé (`objets`) ;
 *   - APRÈS LA RÉPONSE : les écrins du dénombrement — une case par choix à
 *     faire, le nombre de pierres possibles dans chacune, multipliées (et
 *     divisées par k! quand l'ordre ne compte pas) ; le triangle de Pascal et
 *     ses deux cases qui s'ajoutent ; l'arbre « l'ordre compte ? la répétition ? »
 *     pour choisir le modèle. Chaque calcul est refait et vérifié avant d'être
 *     montré : s'il ne retombe pas sur la réponse, il n'est pas dessiné.
 */

const P = 'sc-denombrement';

/* ---------------------------------------------------------------- le décor */

const PIERRES = ['#e0245e', '#2b6fd6', '#f2f6ff', '#e0245e', '#9b3fd6', '#2b6fd6', '#e0245e', '#f2f6ff', '#2b6fd6', '#e0245e'];

function Presentoir() {
  const cristaux = [];
  let i = 0;
  for (let r = 0; r < 4; r += 1) {
    for (let c = 0; c <= r; c += 1) {
      cristaux.push({ x: 100 + (c - r / 2) * 34, y: 30 + r * 30, couleur: PIERRES[i % PIERRES.length], n: i });
      i += 1;
    }
  }
  return (
    <svg className={`${P}__presentoir`} viewBox="0 0 200 160" aria-hidden="true" focusable="false">
      <path d="M0 0 Q20 60 6 160 H0 Z M200 0 Q180 60 194 160 H200 Z" className={`${P}__tenture`} />
      <path d="M100 8 L36 140 H164 Z" className={`${P}__cadre`} />
      <path d="M100 8 L36 140 H164 Z M68 74 H132 M52 107 H148 M84 41 H116" className={`${P}__barreaux`} />
      {cristaux.map(({ x, y, couleur, n }) => (
        <g key={n} transform={`translate(${x} ${y})`}>
          <line x1="0" y1="-10" x2="0" y2="-4" className={`${P}__fil`} />
          <g className={`${P}__cristal`} style={{ '--n': n }}>
            <path d="M0 -4 L7 2 L0 16 L-7 2 Z" fill={couleur} stroke="rgba(255,255,255,0.9)" strokeWidth="1" />
            <path d="M0 -4 L3 2 L0 16 L-7 2 Z" fill="rgba(255,255,255,0.35)" />
          </g>
          <circle cx="-3" cy="0" r="1.4" className={`${P}__eclat`} style={{ '--n': n }} />
        </g>
      ))}
      <ellipse cx="100" cy="150" rx="46" ry="6" className={`${P}__coupe`} />
    </svg>
  );
}

/* --------------------------------------------------------- les calculs */

export const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
export const arr = (n, k) => (k > n ? null : fact(n) / fact(n - k));
export const comb = (n, k) => (k < 0 || k > n ? 0 : Math.round(fact(n) / (fact(k) * fact(n - k))));

/** Toutes les paires (x, y) de nombres de la question (et quelques petits k). */
function paires(nombres, extra = []) {
  const liste = [...new Set([...nombres, ...extra])].filter((v) => Number.isInteger(v) && v > 0 && v <= 60);
  const res = [];
  liste.forEach((x) => liste.forEach((y) => res.push([x, y])));
  return res;
}

/**
 * LES ÉCRINS d'une manche : { cases: [nombres à multiplier], diviseur, texte },
 * seulement si leur calcul redonne la bonne réponse ; null sinon.
 */
export function ecrinsDe(m) {
  const q = String(m.question);
  const bonne = nombreFr(m.bonne);
  if (bonne === null) return null;
  const nombres = nombresDans(q);
  const produit = (cases) => cases.reduce((a, b) => a * b, 1);
  const descente = (n, k) => Array.from({ length: k }, (_, i) => n - i);
  const ok = (cases, diviseur = 1) => Math.round(produit(cases) / diviseur) === bonne;
  switch (m.consigne) {
    case 'k-uplets': {
      const t = paires(nombres).find(([k, n]) => k >= 2 && k <= 6 && n ** k === bonne);
      if (!t) return null;
      const [k, n] = t;
      return { cases: Array(k).fill(n), texte: `${k} cases, ${n} possibilités dans chacune, répétitions permises : ${n}${'⁰¹²³⁴⁵⁶⁷⁸⁹'[k]}.` };
    }
    case 'arrangements': {
      const t = paires(nombres, [3]).find(([n, k]) => k >= 2 && k <= n && arr(n, k) === bonne);
      if (!t) return null;
      const [n, k] = t;
      return { cases: descente(n, k), texte: `L’ordre compte, sans répétition : ${n} choix pour la 1re case, un de moins à chaque case.` };
    }
    case 'permutations': {
      const n = Array.from({ length: 10 }, (_, i) => i + 1).find((v) => fact(v) === bonne);
      if (!n) return null;
      return { cases: descente(n, n), texte: `On range les ${n} : ${n} choix, puis ${n - 1}, … jusqu’à 1. C’est ${n}!.` };
    }
    case 'combinaisons': {
      const t = paires(nombres, [32]).find(([n, k]) => k >= 2 && k < n && comb(n, k) === bonne);
      if (!t) return null;
      const [n, k] = t;
      return { cases: descente(n, k), diviseur: fact(k), texte: `L’ordre ne compte pas : on divise par ${k}! = ${fact(k)}, les façons de ranger les ${k} élus. C’est « ${k} parmi ${n} ».` };
    }
    case 'chemins': {
      // Des mots de n lettres à a lettres A : les nombres de la question sont n et a, pas a et b.
      const t = /mots de/.test(q) ? null : paires(nombres).find(([a, b]) => comb(a + b, a) === bonne && a >= 2 && b >= 2);
      if (t) {
        const [a, b] = t;
        return { cases: descente(a + b, a), diviseur: fact(a), texte: `${a + b} pas en tout ; on choisit les ${a} places d’un même type : « ${a} parmi ${a + b} ».` };
      }
      const u = paires(nombres).find(([n, a]) => a >= 2 && a < n && comb(n, a) === bonne);
      if (!u) return null;
      const [n, a] = u;
      return { cases: descente(n, a), diviseur: fact(a), texte: `${n} places ; on choisit celles des ${a} lettres A : « ${a} parmi ${n} ».` };
    }
    case 'parties': {
      const n = Array.from({ length: 12 }, (_, i) => i + 1).find((v) => 2 ** v === bonne);
      if (!n) return null;
      return { cases: Array(n).fill(2), texte: `Pour chacun des ${n} éléments : on le prend ou pas. 2 choix, ${n} fois : 2${'⁰¹²³⁴⁵⁶⁷⁸⁹'[n] ?? 'ⁿ'} (ensemble vide compris).` };
    }
    case 'principes': {
      const trois = nombres.slice(0, 3);
      if (trois.length === 3 && ok(trois)) return { cases: trois, texte: 'Une entrée ET un plat ET un dessert : on multiplie.' };
      const deux = nombres.slice(0, 2);
      if (deux.length === 2 && deux[0] + deux[1] === bonne) return { somme: deux, texte: 'Un seul film, comédie OU drame : on additionne.' };
      return null;
    }
    default: return null;
  }
}

/* --------------------------------------------------------- les explications */

function Ecrins({ calcul, bonne }) {
  const { cases = [], diviseur = 1, somme, texte } = calcul;
  const elements = somme ?? cases;
  const signe = somme ? '+' : '×';
  // Au-delà de huit cases, on n'en montre que le début et la fin.
  const montrees = elements.length > 8 ? [...elements.slice(0, 3), '…', ...elements.slice(-2)] : elements;
  return (
    <div className={`${P}__ecrins`}>
      <div className={`${P}__rangee`}>
        {montrees.map((v, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={i} className={`${P}__ligne-ecrin`} style={{ '--n': i }}>
            {i > 0 && v !== '…' && montrees[i - 1] !== '…' && <span className={`${P}__signe`}>{signe}</span>}
            {v === '…' ? <span className={`${P}__signe`}>{`${signe} … ${signe}`}</span> : <span className={`${P}__ecrin`}>{v}</span>}
          </span>
        ))}
        {diviseur > 1 && <span className={`${P}__signe est-diviser`} style={{ '--n': montrees.length }}>{`÷ ${diviseur}`}</span>}
        <span className={`${P}__signe`} style={{ '--n': montrees.length + 1 }}>=</span>
        <span className={`${P}__tresor`} style={{ '--n': montrees.length + 1 }}>{bonne}</span>
      </div>
      <p className={`${P}__regle`}>{texte}</p>
    </div>
  );
}

/** Le triangle de Pascal : la ligne donnée, et ses deux cases qui s'ajoutent pour la ligne suivante. */
function Pascal({ m }) {
  const q = String(m.question);
  const lignes = q.split('\n');
  const n = nombreFr(lignes[0]?.match(/n = (\d+)/)?.[1]);
  const valeurs = nombresDans(lignes[1] ?? '');
  const k = nombreFr(q.match(/C\(\d+, (\d+)\)/)?.[1]);
  const bonne = nombreFr(m.bonne);
  if (n === null || k === null || valeurs.length !== n + 1 || k < 1 || k > n || valeurs[k - 1] + valeurs[k] !== bonne) return null;
  return (
    <div className={`${P}__ecrins`}>
      <div className={`${P}__rangee`}>
        {valeurs.map((v, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={i} className={`${P}__ecrin${i === k - 1 || i === k ? ' est-parent' : ' est-terne'}`}>{v}</span>
        ))}
      </div>
      <div className={`${P}__rangee`}>
        <span className={`${P}__ecrin est-parent`}>{valeurs[k - 1]}</span>
        <span className={`${P}__signe`}>+</span>
        <span className={`${P}__ecrin est-parent`}>{valeurs[k]}</span>
        <span className={`${P}__signe`}>=</span>
        <span className={`${P}__tresor`}>{m.bonne}</span>
      </div>
      <p className={`${P}__regle`}>{`Chaque case est la somme des deux cases au-dessus : C(${n + 1}, ${k}) = C(${n}, ${k - 1}) + C(${n}, ${k}).`}</p>
    </div>
  );
}

/** L'arbre du modèle : l'ordre compte-t-il ? la répétition est-elle permise ? */
function Arbre({ bonne }) {
  const chemin = {
    kuplet: ['oui', 'oui'],
    arrangement: ['oui', 'non'],
    combinaison: ['non', null],
  }[bonne];
  if (!chemin) return null;
  const allume = (cond) => (cond ? ' est-allume' : '');
  return (
    <div className={`${P}__arbre`}>
      <span className={`${P}__noeud est-allume`}>L’ordre compte ?</span>
      <div className={`${P}__branches`}>
        <div className={`${P}__branche${allume(chemin[0] === 'oui')}`}>
          <span className={`${P}__mot`}>oui</span>
          <span className={`${P}__noeud${allume(chemin[0] === 'oui')}`}>Répétition permise ?</span>
          <div className={`${P}__branches`}>
            <span className={`${P}__feuille${allume(bonne === 'kuplet')}`}>oui : k-uplet, nᵏ</span>
            <span className={`${P}__feuille${allume(bonne === 'arrangement')}`}>non : arrangement</span>
          </div>
        </div>
        <div className={`${P}__branche${allume(chemin[0] === 'non')}`}>
          <span className={`${P}__mot`}>non</span>
          <span className={`${P}__feuille${allume(bonne === 'combinaison')}`}>combinaison</span>
        </div>
      </div>
    </div>
  );
}

function Explication({ m }) {
  let contenu = null;
  if (m.consigne === 'quel-modele') contenu = <Arbre bonne={m.bonne} />;
  else if (m.consigne === 'pascal') contenu = <Pascal m={m} />;
  else if (m.consigne === 'symetrie') {
    contenu = (
      <div className={`${P}__ecrins`}>
        <span className={`${P}__tresor`}>C(n, n − k) = C(n, k)</span>
        <p className={`${P}__regle`}>Choisir les k pierres qu’on garde, c’est choisir les n − k qu’on laisse : autant de façons.</p>
      </div>
    );
  } else {
    const calcul = ecrinsDe(m);
    if (calcul) contenu = <Ecrins calcul={calcul} bonne={m.bonne} />;
  }
  return (
    <div className={`${P}__explication`}>
      {contenu ?? <p className={`${P}__regle`}>{`La réponse : ${m.bonne}.`}</p>}
    </div>
  );
}

export function QuestionDenombrement({ m, termine }) {
  return (
    <div className={P}>
      {termine ? <Explication m={m} /> : <Presentoir />}
      <div className={`${P}__cartouche`}>
        <TexteQuestion m={m} classe={`${P}__texte`} />
      </div>
    </div>
  );
}
