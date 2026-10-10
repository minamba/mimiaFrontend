import { classeQuestion } from '../base';
import { Explication, ecrireNombre, lireNombre } from './outils';

/**
 * LES ARCHES DU JARDIN — « La bonne parenthèse », 6e et 5e (09/10/2026). La
 * couverture : un jardin d'arches de pierre couvertes de jasmin, des
 * lanternes, un lac au coucher du soleil. La scène :
 *   - LA QUESTION : le calcul gravé sur une plaque de pierre ; chaque
 *     parenthèse y devient une ARCHE fleurie (une arche dans l'arche pour les
 *     parenthèses imbriquées) — ce n'est que le calcul, redessiné ; des
 *     lanternes se balancent, des pétales de jasmin tombent ;
 *   - LES RÉPONSES : des lanternes allumées (`objets`) ;
 *   - APRÈS LA RÉPONSE : le calcul se réduit pas à pas — l'opération à faire
 *     s'allume, puis cède la place à son résultat, ligne après ligne, jusqu'au
 *     nombre final : on voit dans quel ordre on passe sous les arches.
 */
const P = 'sc-bonne-parenthese';

const OPS = ['+', '−', '×', '÷'];

/** « 9 × (7 + 3) − 7 = ? » → ['9', '×', '(', '7', '+', '3', ')', '−', '7']. */
export function jetons(question) {
  const expr = String(question).replace(/=\s*\?\s*$/, '');
  const t = expr.match(/\d+(?:,\d+)?|[+−×÷()]/g) ?? [];
  return t;
}

function calculer(a, op, b) {
  const x = lireNombre(a);
  const y = lireNombre(b);
  if (x === null || y === null) return null;
  if (op === '+') return x + y;
  if (op === '−') return x - y;
  if (op === '×') return x * y;
  return y === 0 ? null : x / y;
}

/** Retire les parenthèses autour d'un nombre seul : « (10) » → « 10 ». */
function nettoyer(t) {
  const r = [...t];
  for (let i = 0; i + 2 < r.length; i += 1) {
    if (r[i] === '(' && r[i + 2] === ')' && !OPS.includes(r[i + 1])) {
      r.splice(i, 3, r[i + 1]);
      i = -1;
    }
  }
  return r;
}

/**
 * LES PAS DU CALCUL : à chaque pas, la parenthèse la plus intérieure (la
 * première fermée), et dedans × et ÷ d'abord, de gauche à droite, puis + et −.
 */
export function reduire(t0) {
  let t = nettoyer(t0);
  const pas = [];
  for (let garde = 0; t.length > 1 && garde < 20; garde += 1) {
    const ferme = t.indexOf(')');
    const ouvre = ferme >= 0 ? t.lastIndexOf('(', ferme) : -1;
    const lo = ferme >= 0 ? ouvre + 1 : 0;
    const hi = ferme >= 0 ? ferme : t.length;
    if (ferme >= 0 && ouvre < 0) return null;
    const seg = t.slice(lo, hi);
    let i = seg.findIndex((x) => x === '×' || x === '÷');
    if (i < 0) i = seg.findIndex((x) => x === '+' || x === '−');
    if (i <= 0 || i >= seg.length - 1) return null;
    const v = calculer(seg[i - 1], seg[i], seg[i + 1]);
    if (v === null) return null;
    const ou = lo + i - 1;
    pas.push({ jetons: t, ou, valeur: v });
    t = nettoyer([...t.slice(0, ou), ecrireNombre(v, { grouper: false }), ...t.slice(ou + 3)]);
  }
  return t.length === 1 ? { pas, fin: t[0] } : null;
}

/** Des jetons, écrits comme dans la question : pas d'espace après « ( » ni avant « ) ». */
function Ecriture({ t, ou = -1 }) {
  const ecrire = (liste, depart) => liste.map((x, k) => {
    const i = depart + k;
    return `${i > 0 && x !== ')' && t[i - 1] !== '(' ? ' ' : ''}${x}`;
  }).join('');
  if (ou < 0) return ecrire(t, 0);
  // L'opération à faire, d'un seul tenant : elle s'allume comme une lanterne.
  const avant = ecrire(t.slice(0, ou), 0);
  const dedans = ecrire(t.slice(ou, ou + 3), ou);
  const apres = ecrire(t.slice(ou + 3), ou + 3);
  const espace = dedans.startsWith(' ') ? ' ' : '';
  return (
    <>
      {avant}
      {espace}
      <span className={`${P}__allume`}>{dedans.trimStart()}</span>
      {apres}
    </>
  );
}

/** Le calcul de la question, ses parenthèses changées en arches — le texte reste le même. */
function AvecArches({ texte }) {
  const racine = [];
  const pile = [racine];
  String(texte).split(/([()])/).forEach((morceau) => {
    if (morceau === '(') {
      const groupe = { enfants: ['('] };
      pile[pile.length - 1].push(groupe);
      pile.push(groupe.enfants);
    } else if (morceau === ')' && pile.length > 1) {
      pile[pile.length - 1].push(')');
      pile.pop();
    } else if (morceau) {
      pile[pile.length - 1].push(morceau);
    }
  });
  const profondeur = (n) => (typeof n === 'string' ? 0 : 1 + Math.max(0, ...n.enfants.map(profondeur)));
  const rendre = (noeuds) => noeuds.map((n, i) => (typeof n === 'string'
    ? n
    // eslint-disable-next-line react/no-array-index-key
    : <span key={i} className={`${P}__arche`} style={{ '--haut': profondeur(n) }}>{rendre(n.enfants)}</span>));
  return rendre(racine);
}

/** Le décor : trois arches de pierre, du jasmin, des lanternes qui se balancent. */
function Arcades() {
  return (
    <svg className={`${P}__arcades`} viewBox="0 0 400 80" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMax meet">
      {[40, 200, 360].map((x, i) => (
        <g key={x}>
          <path d={`M${x - 46} 80 V36 a46 40 0 0 1 92 0 V80 h-12 V38 a34 30 0 0 0 -68 0 V80 Z`} className={`${P}__pierre`} />
          {[0, 1, 2, 3, 4, 5].map((k) => (
            <circle key={k} cx={x - 40 + k * 16} cy={10 + Math.abs(2.5 - k) * 5} r="4" className={`${P}__jasmin`} style={{ animationDelay: `${(i + k * 0.4).toFixed(1)}s` }} />
          ))}
          <g className={`${P}__lanterne`} style={{ animationDelay: `${(i * -0.8).toFixed(1)}s` }}>
            <line x1={x} y1="16" x2={x} y2="34" />
            <rect x={x - 7} y="34" width="14" height="18" rx="4" />
          </g>
        </g>
      ))}
    </svg>
  );
}

function contenu(m) {
  const t = jetons(m.question);
  const r = reduire(t);
  if (!r || !r.pas.length) return null;
  if (m.consigne === 'premier') {
    const premier = r.pas[0];
    return (
      <ol className={`${P}__etapes`}>
        <li className={`${P}__etape`} style={{ '--d': '0.3s' }}><Ecriture t={premier.jetons} ou={premier.ou} /></li>
        <li className={`${P}__etape ${P}__regle`} style={{ '--d': '1.1s' }}>
          {premier.jetons.includes('(') ? 'D’abord la parenthèse la plus intérieure ; dedans, × et ÷ avant + et −.' : '× et ÷ passent avant + et − ; à égalité, de gauche à droite.'}
        </li>
      </ol>
    );
  }
  return (
    <ol className={`${P}__etapes`}>
      {r.pas.map((s, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <li key={i} className={`${P}__etape`} style={{ '--d': `${(0.3 + i * 0.9).toFixed(2)}s` }}>
          <Ecriture t={s.jetons} ou={s.ou} />
        </li>
      ))}
    </ol>
  );
}

export function QuestionParenthese({ m, termine }) {
  const r = termine ? reduire(jetons(m.question)) : null;
  const retard = m.consigne === 'premier' ? 1.8 : 0.3 + (r?.pas.length ?? 0) * 0.9;
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <Arcades />
      <div className={`${P}__plaque`}>
        <p className={`${classeQuestion(m.question)} ${P}__question`}><AvecArches texte={m.question} /></p>
      </div>
      {termine && <Explication p={P} m={m} contenu={() => contenu(m)} retard={retard} />}
    </div>
  );
}
